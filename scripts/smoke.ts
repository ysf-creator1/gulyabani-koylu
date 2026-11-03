// Duman testi (team.md Deployment "yayın sonrası kısa sağlık kontrolü"): bir bot oda kurar,
// ikinci bot katılır, ikisi de `ack accepted` alır. Sürüm sunucunun genel /healthz ucundan okunur.
// Kullanım:
//   node scripts/smoke.ts --origin https://gulyabanikoyu.duckdns.org
//   node scripts/smoke.ts --origin https://localhost:8080 --ws ws://127.0.0.1:8080/ws --health http://127.0.0.1:8080/healthz
// Deneme odası boş kalınca 15 dakikada süresi dolar ve silinir (BR12.4).
import { resolve } from 'node:path';
import { C1Client } from '../tests/bots/c1Client.ts';

export interface SmokeOptions {
  origin: string;
  wsUrl?: string;
  healthUrl?: string;
  timeoutMs?: number;
}

export async function smoke(options: SmokeOptions): Promise<{ ok: boolean; step: string }> {
  const wsUrl = options.wsUrl ?? `${options.origin.replace(/^http/, 'ws')}/ws`;
  const healthUrl = options.healthUrl ?? `${options.origin}/healthz`;
  const clients: C1Client[] = [];
  const timer = setTimeout(
    () => clients.forEach((c) => c.terminate()),
    options.timeoutMs ?? 20_000,
  );
  try {
    const health = (await (await fetch(healthUrl)).json()) as { status?: string; version?: string };
    if (health.status !== 'ok' || !health.version) return { ok: false, step: 'healthz' };
    const host = await C1Client.connect({ url: wsUrl, origin: options.origin });
    clients.push(host);
    await host.hello({ appVersion: health.version });
    const created = await host.command('room.create', { nick: 'SmokeHost' });
    if (created.status !== 'accepted') return { ok: false, step: 'room.create' };
    const view = await host.waitForView((v) => v.room.roomCode.length === 6);
    const guest = await C1Client.connect({ url: wsUrl, origin: options.origin });
    clients.push(guest);
    await guest.hello({ appVersion: health.version });
    const joined = await guest.command('room.join', {
      roomCode: view.room.roomCode,
      nick: 'SmokeGuest',
    });
    if (joined.status !== 'accepted') return { ok: false, step: 'room.join' };
    return { ok: true, step: 'done' };
  } catch {
    return { ok: false, step: 'connection' };
  } finally {
    clearTimeout(timer);
    await Promise.all(clients.map((c) => c.close().catch(() => 0)));
  }
}

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const origin = arg('origin');
  if (!origin) {
    console.error(
      'Kullanım: node scripts/smoke.ts --origin https://<alt adres> [--ws <wss adresi>] [--health <adres>]',
    );
    process.exit(2);
  }
  const result = await smoke({ origin, wsUrl: arg('ws'), healthUrl: arg('health') });
  console.log(
    result.ok
      ? 'Duman testi geçti: oda kuruldu, ikinci bot katıldı.'
      : `Duman testi başarısız: ${result.step}`,
  );
  process.exit(result.ok ? 0 : 1);
}
