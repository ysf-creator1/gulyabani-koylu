// 24 saatte silme (project.md Mandated, C-15, BR12.1, BR12.3, C8): süresi dolan odanın oyunu,
// sohbeti, oturumları ve kendisi silinir; açık bağlantılar room_not_found ile kapanır; silinen
// metin depo dosyasında kalmaz (NFR7.14). Bağlanmayan oturum 10 dakikada silinir (NFR7.7 d).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { purgeRoomOutcome } from '../../../src/server/ops/expirySweep.ts';
import { startTestServer, type TestServer } from './harness.ts';
import { makeAgg } from './fixtures.ts';

let server: TestServer;

beforeEach(async () => {
  server = await startTestServer();
});

afterEach(async () => {
  await server.stop();
});

function dbBytes(): string {
  return readdirSync(server.dir)
    .filter((n) => n.startsWith('game.db'))
    .map((n) => readFileSync(join(server.dir, n)).toString('latin1'))
    .join('');
}

describe('ExpirySweep', () => {
  it('24 saati dolan odanın bütün verisini siler ve bağlantıları kapatır', async () => {
    const { client: mod } = await server.client();
    await mod.command('room.create', { nick: 'SilinecekMod' });
    const view = await mod.waitForView(() => true);
    const code = view.room.roomCode;
    const { client: player } = await server.client();
    await player.command('room.join', { roomCode: code, nick: 'SilinecekOyuncu' });
    await mod.waitForView((v) => v.room.participants.length === 2);

    const dayLater = view.room.expiresAt;
    const result = await server.app.sweep.run(dayLater);
    expect(result.failed).toBe(0);
    await Promise.all([mod.closed, player.closed]);
    expect(mod.closedReason).toBe('room_not_found');
    expect(player.closedReason).toBe('room_not_found');
    expect(server.app.rooms.has(code)).toBe(false);
    const snapshot = await server.app.store.load();
    expect(snapshot.rooms).toEqual([]);
    expect(snapshot.participants).toEqual([]);
    expect(snapshot.sessions.filter((s) => s.roomCode === code)).toEqual([]);
    expect(dbBytes()).not.toContain('SilinecekOyuncu');
  });

  it('süresi dolmamış odaya dokunmaz; süresi dolan oda silinmeden önce de bulunamaz', async () => {
    const { client } = await server.client();
    await client.command('room.create', { nick: 'Kalici' });
    const view = await client.waitForView(() => true);
    await server.app.sweep.run(Date.now());
    expect(server.app.rooms.has(view.room.roomCode)).toBe(true);
    const agg = server.app.rooms.get(view.room.roomCode)!;
    server.app.rooms.set(view.room.roomCode, {
      ...agg,
      room: { ...agg.room, expiresAt: Date.now() - 1 },
    });
    const { client: late } = await server.client();
    expect(
      (await late.command('room.join', { roomCode: view.room.roomCode, nick: 'Gec' })).reasonCode,
    ).toBe('room_not_found');
    await Promise.all([client.close(), late.close()]);
  });

  it('10 dakikadır odaya bağlanmamış ve bağlı olmayan oturum silinir', async () => {
    const { client } = await server.client();
    await client.close();
    const later = () => Date.now() + 11 * 60 * 1000;
    for (let i = 0; i < 50 && server.app.sessions.idleUnbound(later()).length === 0; i += 1) {
      await new Promise((r) => setTimeout(r, 20));
    }
    const sessionId = server.app.sessions.idleUnbound(later()).map((s) => s.sessionId)[0];
    expect(sessionId).toBeDefined();
    await server.app.sweep.run(Date.now() + 11 * 60 * 1000);
    expect(server.app.sessions.get(sessionId!)).toBeUndefined();
    expect(
      (await server.app.store.load()).sessions.find((s) => s.sessionId === sessionId),
    ).toBeUndefined();
  });

  it('silme ifadeleri C8 sırasındadır: oyun → sohbet → oturum → oda', () => {
    const outcome = purgeRoomOutcome(makeAgg('gvvv'), ['s1']);
    const tables = outcome.ops.map((op) => /FROM (\w+)/.exec(op.sql)?.[1]);
    expect(tables).toEqual([
      'match_matches',
      'chat_messages',
      'session_sessions',
      'room_participants',
      'room_rooms',
    ]);
    expect(outcome.next).toBeNull();
  });
});
