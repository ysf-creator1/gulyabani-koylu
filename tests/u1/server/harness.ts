// Aynı süreçte gerçek dinleyicilerle çalışan test sunucusu (kapılar işletim sisteminden).
import { join, resolve } from 'node:path';
import { App } from '../../../src/server/app.ts';
import type { Config } from '../../../src/server/ops/config.ts';
import { silentLogger, type Logger } from '../../../src/server/ops/logger.ts';
import { C1Client } from '../../bots/c1Client.ts';
import { makeTempDir, removeTempDir } from './tempDir.ts';

export const TEST_ORIGIN = 'https://game.test';
export const TEST_VERSION = 'v0.1.0';

export interface TestServer {
  app: App;
  dir: string;
  httpUrl: string;
  internalUrl: string;
  connect(origin?: string): Promise<C1Client>;
  /** Bağlanır, hello gönderir; belirteç verilirse oturumu sürdürür. */
  client(token?: string): Promise<{ client: C1Client; token: string }>;
  stop(): Promise<void>;
}

export function testConfig(dir: string, overrides: Partial<Config> = {}): Config {
  return {
    publicOrigin: TEST_ORIGIN,
    connectSrc: 'wss://game.test',
    host: '127.0.0.1',
    portPublic: 0,
    portInternal: 0,
    dataDir: dir,
    appVersion: TEST_VERSION,
    nodeEnv: 'test',
    timeScale: 1,
    webDir: join(dir, 'web-missing'),
    contentDir: resolve(import.meta.dirname, '../../../content'),
    ...overrides,
  };
}

export async function startTestServer(
  options: { config?: Partial<Config>; logger?: Logger; dir?: string; keepDir?: boolean } = {},
): Promise<TestServer> {
  const dir = options.dir ?? makeTempDir('app');
  const app = new App({
    config: testConfig(dir, options.config),
    logger: options.logger ?? silentLogger,
    backend: 'inline',
  });
  await app.start();
  const httpUrl = `http://127.0.0.1:${app.publicPort}`;
  const connect = (origin = TEST_ORIGIN) =>
    C1Client.connect({ url: `ws://127.0.0.1:${app.publicPort}/ws`, origin });
  return {
    app,
    dir,
    httpUrl,
    internalUrl: `http://127.0.0.1:${app.internalPort}`,
    connect,
    async client(token?: string) {
      const client = await connect();
      const welcome = await client.hello({
        appVersion: TEST_VERSION,
        ...(token ? { sessionToken: token } : {}),
      });
      return { client, token: welcome.sessionToken ?? token ?? '' };
    },
    async stop() {
      await app.stop();
      if (!options.keepDir) removeTempDir(dir);
    },
  };
}
