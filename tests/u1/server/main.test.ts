// Program girişi ve ayarlar: --check-config, ortam doğrulaması, gerçek süreçte açılış ve
// SIGTERM ile 5 saniye içinde kapanış (NFR5.3, security-design Web Yanıtları).
import { afterEach, describe, expect, it } from 'vitest';
import { checkConfig } from '../../../src/server/main.ts';
import type { ConfigError } from '../../../src/server/ops/config.ts';
import { loadConfig } from '../../../src/server/ops/config.ts';
import { freePort, spawnServer, waitForHealth } from './process.ts';
import { makeTempDir, removeTempDir } from './tempDir.ts';

const baseEnv = {
  PUBLIC_ORIGIN: 'https://gulyabani.example',
  PORT_PUBLIC: '8080',
  PORT_INTERNAL: '8081',
  DATA_DIR: '/var/lib/gulyabani',
  APP_VERSION: 'v0.1.0',
  NODE_ENV: 'production',
};

function problems(env: Record<string, string | undefined>): string[] {
  try {
    loadConfig(env);
    return [];
  } catch (error) {
    return (error as ConfigError).problems;
  }
}

describe('ayarlar (config.ts)', () => {
  it('geçerli ortamdan ayar üretir; connect-src ana makineden kurulur', () => {
    const config = loadConfig(baseEnv);
    expect(config.publicOrigin).toBe('https://gulyabani.example');
    expect(config.connectSrc).toBe('wss://gulyabani.example');
    expect(config.host).toBe('127.0.0.1');
    expect(config.timeScale).toBe(1);
    expect(loadConfig({ ...baseEnv, PUBLIC_ORIGIN: 'https://localhost:8443/' }).connectSrc).toBe(
      'wss://localhost:8443',
    );
  });

  it('https olmayan ya da yol içeren PUBLIC_ORIGIN reddedilir', () => {
    expect(problems({ ...baseEnv, PUBLIC_ORIGIN: 'http://gulyabani.example' })).toContain(
      'PUBLIC_ORIGIN must use https',
    );
    expect(problems({ ...baseEnv, PUBLIC_ORIGIN: 'https://x.example/oyun' })).toContain(
      'PUBLIC_ORIGIN must not contain path, query or fragment',
    );
    expect(problems({ ...baseEnv, PUBLIC_ORIGIN: undefined })).toContain(
      'PUBLIC_ORIGIN is required',
    );
    expect(problems({ ...baseEnv, PUBLIC_ORIGIN: 'bozuk' })).toContain(
      'PUBLIC_ORIGIN must be a URL',
    );
  });

  it('kapı, veri klasörü ve sürüm denetlenir; üretimde zaman ölçeği yasaktır', () => {
    expect(problems({ ...baseEnv, PORT_INTERNAL: '8080' })).toContain(
      'PORT_PUBLIC and PORT_INTERNAL must differ',
    );
    expect(problems({ ...baseEnv, PORT_PUBLIC: '0' })).toContain(
      'PORT_PUBLIC must be a port number',
    );
    expect(problems({ ...baseEnv, DATA_DIR: undefined })).toContain('DATA_DIR is required');
    expect(problems({ ...baseEnv, APP_VERSION: 'none' })).toContain(
      'APP_VERSION must look like vX.Y.Z',
    );
    expect(problems({ ...baseEnv, DEV_TIME_SCALE: '0.1' })).toContain(
      'DEV_TIME_SCALE is not allowed in production',
    );
    expect(loadConfig({ ...baseEnv, NODE_ENV: 'test', DEV_TIME_SCALE: '0.1' }).timeScale).toBe(0.1);
  });
});

describe('--check-config', () => {
  it('geçerli ortamda 0, hatalı ortamda 1 döner ve nedeni yazar', () => {
    const lines: string[] = [];
    expect(checkConfig(baseEnv, (l) => lines.push(l))).toBe(0);
    expect(lines).toEqual(['config ok']);
    const bad: string[] = [];
    expect(checkConfig({ ...baseEnv, PUBLIC_ORIGIN: 'http://x' }, (l) => bad.push(l))).toBe(1);
    expect(bad[0]).toMatch(/^config error: /);
  });

  it('gerçek süreçte dinleyici açmadan çıkar', async () => {
    const proc = spawnServer(baseEnv, ['--check-config']);
    expect(await proc.exited).toBe(0);
    expect(proc.output()).toContain('config ok');
    const bad = spawnServer({ ...baseEnv, APP_VERSION: '' }, ['--check-config']);
    expect(await bad.exited).toBe(1);
  });
});

describe('gerçek süreç', () => {
  let dir = '';
  afterEach(() => {
    if (dir) removeTempDir(dir);
  });

  it('açılır, iki sağlık ucu sürümü verir, SIGTERM ile 5 saniyede 0 koduyla kapanır', async () => {
    dir = makeTempDir('proc');
    const [publicPort, internalPort] = [await freePort(), await freePort()];
    const proc = spawnServer({
      ...baseEnv,
      NODE_ENV: 'test',
      PUBLIC_ORIGIN: `https://localhost:${publicPort}`,
      PORT_PUBLIC: String(publicPort),
      PORT_INTERNAL: String(internalPort),
      DATA_DIR: dir,
    });
    const internal = await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`);
    expect(internal).toMatchObject({ status: 'ok', version: 'v0.1.0', activeMatches: 0 });
    const pub = await waitForHealth(`http://127.0.0.1:${publicPort}/healthz`);
    expect(pub).toEqual({ status: 'ok', version: 'v0.1.0' });
    const started = Date.now();
    proc.child.kill('SIGTERM');
    expect(await proc.exited).toBe(0);
    expect(Date.now() - started).toBeLessThan(5000);
    const lines = proc
      .output()
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l));
    expect(lines.map((l) => l.event)).toEqual(
      expect.arrayContaining(['startup.ready', 'shutdown.done']),
    );
  });
});
