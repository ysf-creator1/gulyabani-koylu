// Sunucu entegrasyonu: gerçek süreç (geçici veri klasörü) ve gerçek ws istemcileri.
// Oda kurma → katılma → başlatma; yeniden bağlanınca tam görünüm ve onaylanmamış komutun bir kez
// işlenmesi (BR9.4, BR10.2); süreç öldürülüp yeniden açılınca durum depodan gelir (C9, NFR5.2);
// room.create yeniden gönderilince ikinci oda yok (BR10.5).
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { C1Client } from '../../bots/c1Client.ts';
import { freePort, spawnServer, waitForHealth, type ServerProcess } from './process.ts';
import { makeTempDir, removeTempDir } from './tempDir.ts';

const VERSION = 'v0.1.0';
let dir: string;
let publicPort: number;
let internalPort: number;
let proc: ServerProcess;

function env() {
  return {
    PUBLIC_ORIGIN: `https://localhost:${publicPort}`,
    PORT_PUBLIC: String(publicPort),
    PORT_INTERNAL: String(internalPort),
    DATA_DIR: dir,
    APP_VERSION: VERSION,
    NODE_ENV: 'test',
  };
}

async function start(): Promise<void> {
  proc = spawnServer(env());
  await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`);
}

async function connect(token?: string): Promise<{ client: C1Client; token: string }> {
  const client = await C1Client.connect({
    url: `ws://127.0.0.1:${publicPort}/ws`,
    origin: `https://localhost:${publicPort}`,
  });
  const welcome = await client.hello({
    appVersion: VERSION,
    ...(token ? { sessionToken: token } : {}),
  });
  return { client, token: welcome.sessionToken ?? token ?? '' };
}

beforeAll(async () => {
  dir = makeTempDir('integration');
  publicPort = await freePort();
  internalPort = await freePort();
  await start();
});

afterAll(async () => {
  proc.child.kill('SIGTERM');
  await proc.exited;
  removeTempDir(dir);
});

describe('gerçek süreçte oyun akışı', () => {
  const tokens: string[] = [];
  let roomCode = '';
  let createId = '';
  let seenId = '';

  it('oda kurulur, üç oyuncu katılır, oyun başlar; herkes kendi kartını görür', async () => {
    const mod = await connect();
    tokens.push(mod.token);
    createId = randomUUID();
    expect((await mod.client.command('room.create', { nick: 'Moderator' }, createId)).status).toBe(
      'accepted',
    );
    roomCode = (await mod.client.waitForView(() => true)).room.roomCode;
    const players: C1Client[] = [];
    for (const nick of ['Bot1', 'Bot2', 'Bot3']) {
      const p = await connect();
      tokens.push(p.token);
      expect((await p.client.command('room.join', { roomCode, nick })).status).toBe('accepted');
      players.push(p.client);
    }
    await mod.client.waitForView((v) => v.room.participants.length === 4);
    expect((await mod.client.command('lobby.startGame')).status).toBe('accepted');
    for (const p of players) {
      const view = await p.waitForView((v) => v.game?.phase === 'first_night');
      expect(view.me.roleId === 'ghul' || view.me.roleId === 'villager').toBe(true);
      expect(view.game!.myAction?.kind).toBe('see_card');
    }
    const health = await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`);
    expect(health.activeMatches).toBe(1);
    await Promise.all([mod.client.close(), ...players.map((p) => p.close())]);
  });

  it('kopan oyuncu aynı belirteçle tam görünüme döner; onaylanmamış komut bir kez işlenir', async () => {
    const player = await connect(tokens[1]);
    const view = await player.client.waitForView((v) => v.game !== undefined);
    expect(view.me.nick).toBe('Bot1');
    seenId = randomUUID();
    player.client.send({ type: 'command', commandId: seenId, name: 'game.cardSeen', args: {} });
    player.client.terminate();
    const again = await connect(tokens[1]);
    await again.client.waitForView((v) => v.game !== undefined);
    const ack = await again.client.command('game.cardSeen', {}, seenId);
    expect(['accepted', 'duplicate']).toContain(ack.status);
    const repeat = await again.client.command('game.cardSeen', {}, seenId);
    expect(repeat.status).toBe('duplicate');
    const mod = await connect(tokens[0]);
    const modView = await mod.client.waitForView((v) => v.moderator !== undefined);
    expect(modView.moderator!.allSeats.filter((s) => s.cardSeen)).toHaveLength(1);
    await Promise.all([again.client.close(), mod.client.close()]);
  });

  it('süreç öldürülüp yeniden açılınca oda ve oyun depodan gelir', async () => {
    const before = await connect(tokens[2]);
    const roleBefore = (await before.client.waitForView((v) => v.game !== undefined)).me.roleId;
    await before.client.close();
    proc.child.kill('SIGKILL');
    await proc.exited;
    await start();
    const after = await connect(tokens[2]);
    const view = await after.client.waitForView((v) => v.game !== undefined);
    expect(view.room.roomCode).toBe(roomCode);
    expect(view.me.roleId).toBe(roleBefore);
    expect(view.game!.phase).toBe('first_night');
    await after.client.close();
  });

  it('room.create yeniden gönderilince ikinci oda kurulmaz', async () => {
    const mod = await connect(tokens[0]);
    await mod.client.waitForView(() => true);
    expect((await mod.client.command('room.create', { nick: 'Moderator' }, createId)).status).toBe(
      'duplicate',
    );
    const health = await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`);
    expect(health.activeRooms).toBe(1);
    await mod.client.close();
  });
});
