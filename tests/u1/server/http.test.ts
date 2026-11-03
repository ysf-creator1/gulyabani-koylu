// Web uçları (C2, NFR7.1, NFR7.9, NFR7.12, NFR13.1): güvenlik başlıkları, CSP, statik izin
// listesi, iki /healthz ve vekil başlıklarının okunmaması.
import { mkdirSync, writeFileSync } from 'node:fs';
import { request } from 'node:http';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { contentSecurityPolicy } from '../../../src/server/gateway/publicHttp.ts';
import { startTestServer, type TestServer } from './harness.ts';
import { makeTempDir, removeTempDir } from './tempDir.ts';

let server: TestServer;
let webDir: string;

function get(
  url: string,
  headers: Record<string, string> = {},
): Promise<{
  status: number;
  headers: Record<string, string | string[] | undefined>;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({
          status: res.statusCode ?? 0,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('latin1'),
        }),
      );
    });
    req.on('error', reject);
    req.end();
  });
}

beforeAll(async () => {
  webDir = makeTempDir('web');
  mkdirSync(join(webDir, 'assets'));
  writeFileSync(join(webDir, 'index.html'), '<!doctype html><title>t</title>');
  writeFileSync(join(webDir, 'assets', 'index-Ab12Cd34.js'), 'console.log(1)');
  writeFileSync(join(webDir, 'assets', 'index-Ab12Cd34.js.gz'), gzipSync('console.log(1)'));
  server = await startTestServer({ config: { webDir } });
});

afterAll(async () => {
  await server.stop();
  removeTempDir(webDir);
});

describe('sayfa ve oda linki', () => {
  it('ana sayfa güvenlik başlıkları ve satır içi izin vermeyen CSP ile gelir', async () => {
    const res = await get(`${server.httpUrl}/`);
    expect(res.status).toBe(200);
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
    expect(res.headers['cache-control']).toBe('no-cache');
    const csp = String(res.headers['content-security-policy']);
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("connect-src 'self' wss://game.test");
    expect(csp).not.toContain('unsafe-inline');
    expect(res.headers['server']).toBeUndefined();
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('/oda/{kod} yalnızca 6 rakamlı kodu kabul eder', async () => {
    expect((await get(`${server.httpUrl}/oda/123456`)).status).toBe(200);
    expect((await get(`${server.httpUrl}/oda/12ab56`)).status).toBe(404);
    expect((await get(`${server.httpUrl}/baska`)).status).toBe(404);
  });

  it('CSP connect-src ana makine ve kapıdan kurulur', () => {
    expect(contentSecurityPolicy('wss://localhost:8443')).toContain(
      "connect-src 'self' wss://localhost:8443",
    );
  });
});

describe('statik dosyalar', () => {
  it('içerik özetli dosya uzun önbellek ve sıkıştırılmış kopyayla verilir', async () => {
    const res = await get(`${server.httpUrl}/static/assets/index-Ab12Cd34.js`, {
      'Accept-Encoding': 'gzip',
    });
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.headers['content-encoding']).toBe('gzip');
  });

  it('listede olmayan yol ve yol geçişi denemesi 404 alır', async () => {
    expect((await get(`${server.httpUrl}/static/../index.html`)).status).toBe(404);
    expect((await get(`${server.httpUrl}/static/assets/%2e%2e%2fsecret`)).status).toBe(404);
    expect((await get(`${server.httpUrl}/static/nope.js`)).status).toBe(404);
  });
});

describe('sağlık kontrolü (BR12.2)', () => {
  it('genel uç yalnızca durum ve sürüm verir; X-Forwarded-For sonucu değiştirmez', async () => {
    const plain = await get(`${server.httpUrl}/healthz`);
    const spoofed = await get(`${server.httpUrl}/healthz`, { 'X-Forwarded-For': '127.0.0.1' });
    expect(plain.status).toBe(200);
    expect(JSON.parse(plain.body)).toEqual({ status: 'ok', version: 'v0.1.0' });
    expect(JSON.parse(spoofed.body)).toEqual({ status: 'ok', version: 'v0.1.0' });
    expect(plain.headers['cache-control']).toBe('no-store');
  });

  it('iç uç sayıları ve ölçümleri verir; başka yol 404', async () => {
    const res = await get(`${server.internalUrl}/healthz`);
    const body = JSON.parse(res.body);
    for (const key of [
      'activeRooms',
      'activeMatches',
      'connections',
      'errorCount',
      'commandsTotal',
      'commandsUnder150Ms',
      'commandInternalErrors',
    ]) {
      expect(body).toHaveProperty(key);
    }
    expect((await get(`${server.internalUrl}/`)).status).toBe(404);
  });

  it('kapanış başlayınca sağlık 503 döner', async () => {
    const other = await startTestServer();
    const stopping = other.app.stop();
    const res = await get(`${other.httpUrl}/healthz`).catch(() => ({ status: 503 }));
    expect(res.status).toBe(503);
    await stopping;
    removeTempDir(other.dir);
  });
});
