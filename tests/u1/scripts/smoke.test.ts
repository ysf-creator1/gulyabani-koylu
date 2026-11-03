// Duman testi betiği yerel sunucuya karşı (team.md Deployment) ve kabuk betiklerinin sözdizimi.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { smoke } from '../../../scripts/smoke.ts';
import { startTestServer, TEST_ORIGIN, type TestServer } from '../server/harness.ts';

const ROOT = resolve(import.meta.dirname, '../../..');
let server: TestServer;

beforeAll(async () => {
  server = await startTestServer();
});

afterAll(async () => {
  await server.stop();
});

describe('scripts/smoke.ts', () => {
  it('bir bot oda kurar, ikinci bot katılır; ikisi de kabul alır', async () => {
    const result = await smoke({
      origin: TEST_ORIGIN,
      wsUrl: `ws://127.0.0.1:${server.app.publicPort}/ws`,
      healthUrl: `${server.httpUrl}/healthz`,
    });
    expect(result).toEqual({ ok: true, step: 'done' });
    expect(server.app.rooms.size).toBe(1);
  });

  it('yanlış Origin ya da ulaşılamayan sunucu başarısız sayılır', async () => {
    const wrongOrigin = await smoke({
      origin: 'https://baska.test',
      wsUrl: `ws://127.0.0.1:${server.app.publicPort}/ws`,
      healthUrl: `${server.httpUrl}/healthz`,
    });
    expect(wrongOrigin.ok).toBe(false);
    const down = await smoke({ origin: 'https://x.test', healthUrl: 'http://127.0.0.1:1/healthz' });
    expect(down).toEqual({ ok: false, step: 'connection' });
  });
});

describe('kabuk betikleri', () => {
  const scripts = [
    'scripts/merge-bolt.sh',
    'scripts/deploy.sh',
    'scripts/rollback.sh',
    'scripts/lib/release-common.sh',
    'infra/provision.sh',
    'infra/run-provision.sh',
  ];
  it.each(scripts)('%s bash -n sözdizimi denetiminden geçer', (script) => {
    const path = resolve(ROOT, script);
    expect(existsSync(path)).toBe(true);
    expect(() => execFileSync('bash', ['-n', path])).not.toThrow();
  });
});
