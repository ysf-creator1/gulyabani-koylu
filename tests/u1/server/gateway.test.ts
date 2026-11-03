// ConnectionGateway: hello ve oturum, doğrulama hattı, tekrar denetimi, yeniden bağlanma,
// çıkarma (C1, BR9.1, BR9.4, BR9.5, BR10.2, BR10.5, BR10.6, NFR7.3–NFR7.5).
import { randomUUID } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { C1Client } from '../../bots/c1Client.ts';
import { startTestServer, TEST_VERSION, type TestServer } from './harness.ts';

let server: TestServer;

beforeEach(async () => {
  server = await startTestServer();
});

afterEach(async () => {
  await server.stop();
});

async function createRoom(
  nick = 'Moderator',
): Promise<{ client: C1Client; token: string; code: string }> {
  const { client, token } = await server.client();
  const ack = await client.command('room.create', { nick });
  expect(ack.status).toBe('accepted');
  const view = await client.waitForView((v) => v.room.roomCode.length === 6);
  return { client, token, code: view.room.roomCode };
}

describe('hello ve oturum (BR9.1, BR9.5)', () => {
  it('belirteçsiz hello yeni oturum açar; belirteç yalnızca bir kez gelir', async () => {
    const { client, token } = await server.client();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    const again = await server.client(token);
    expect(again.client.messages.find((m) => m.type === 'welcome')).not.toHaveProperty(
      'sessionToken',
    );
    await client.close();
    await again.client.close();
  });

  it('protokol sürümü uymayan ya da hello öncesi gelen mesaj bağlantıyı kapatır', async () => {
    const a = await server.connect();
    a.send({ type: 'hello', protocolVersion: 99, appVersion: TEST_VERSION });
    await a.closed;
    expect(a.closedReason).toBe('unsupported_protocol');
    const b = await server.connect();
    b.send({ type: 'ping', clientTime: 1 });
    await b.closed;
    expect(b.closedReason).toBe('unsupported_protocol');
    const c = await server.connect();
    c.send('{bozuk json');
    await c.closed;
    expect(c.closedReason).toBe('unsupported_protocol');
  });

  it('geçersiz belirteç session_invalid ile kapanır; farklı sürüm reload alır', async () => {
    const a = await server.connect();
    a.send({
      type: 'hello',
      protocolVersion: 1,
      appVersion: TEST_VERSION,
      sessionToken: 'x'.repeat(43),
    });
    await a.closed;
    expect(a.closedReason).toBe('session_invalid');
    const b = await server.connect();
    b.send({ type: 'hello', protocolVersion: 1, appVersion: 'v9.9.9' });
    await b.waitFor((m) => m.type === 'reload');
    await b.close();
  });

  it('ping sunucu saatiyle pong alır (NFR14)', async () => {
    const { client } = await server.client();
    client.send({ type: 'ping', clientTime: 123 });
    const pong = await client.waitFor((m) => m.type === 'pong');
    expect(pong).toMatchObject({ clientTime: 123 });
    expect((pong as { serverTime: number }).serverTime).toBeGreaterThan(0);
    await client.close();
  });
});

describe('oda kurma ve katılma', () => {
  it('kurucu moderatör görünümü alır; oyuncu katılınca iki taraf da listeyi görür', async () => {
    const mod = await createRoom();
    expect(mod.client.latestView!.me.kind).toBe('moderator');
    const { client: player } = await server.client();
    expect((await player.command('room.join', { roomCode: mod.code, nick: 'Ayşe' })).status).toBe(
      'accepted',
    );
    const view = await player.waitForView((v) => v.me.nick === 'Ayşe');
    expect(view.room.participants.map((p) => p.nick)).toEqual(['Moderator', 'Ayşe']);
    await mod.client.waitForView((v) => v.room.participants.length === 2);
    const { client: twin } = await server.client();
    expect((await twin.command('room.join', { roomCode: mod.code, nick: 'ayşe' })).reasonCode).toBe(
      'nick_taken',
    );
    expect((await twin.command('room.join', { roomCode: '000000', nick: 'Kim' })).reasonCode).toBe(
      'room_not_found',
    );
    await Promise.all([mod.client.close(), player.close(), twin.close()]);
  });

  it('aynı commandId ile gelen komut duplicate alır ve ikinci oda kurulmaz (BR10.2, BR10.5)', async () => {
    const { client } = await server.client();
    const id = randomUUID();
    expect((await client.command('room.create', { nick: 'Mod' }, id)).status).toBe('accepted');
    await client.waitForView(() => true);
    const second = await client.command('room.create', { nick: 'Mod' }, id);
    expect(second.status).toBe('duplicate');
    expect(server.app.rooms.size).toBe(1);
    expect((await client.command('room.create', { nick: 'Mod' })).reasonCode).toBe(
      'session_invalid',
    );
    await client.close();
  });

  it('istemci listesinde olmayan komut not_your_turn; numarası bozuk zarf yanıtsız kalır', async () => {
    const { client } = await server.client();
    expect((await client.command('system.deadlineReached', { stepVersion: 1 })).reasonCode).toBe(
      'not_your_turn',
    );
    client.send({ type: 'command', commandId: 'kotu', name: 'game.vote' });
    expect((await client.command('game.vote', { targetSeatId: 's1' })).reasonCode).toBe(
      'session_invalid',
    );
    await client.close();
  });
});

describe('yeniden bağlanma (BR9.4, A10)', () => {
  it('aynı belirteçle dönen kişi tam görünümü alır; önceki bağlantı kapatılır', async () => {
    const mod = await createRoom();
    const second = await server.client(mod.token);
    const view = await second.client.waitForView((v) => v.room.roomCode === mod.code);
    expect(view.me.kind).toBe('moderator');
    await mod.client.waitFor((m) => m.type === 'superseded');
    await mod.client.closed;
    await second.client.close();
  });
});

describe('lobide çıkarma (BR2.3)', () => {
  it('çıkarılan oyuncu closed{kicked} alır ve belirteci artık geçmez', async () => {
    const mod = await createRoom();
    const { client: player, token } = await server.client();
    await player.command('room.join', { roomCode: mod.code, nick: 'Fazla' });
    const view = await mod.client.waitForView((v) => v.room.participants.length === 2);
    const target = view.room.participants[1]!.participantId;
    expect((await mod.client.command('lobby.kick', { participantId: target })).status).toBe(
      'accepted',
    );
    await player.closed;
    expect(player.closedReason).toBe('kicked');
    const back = await server.connect();
    back.send({ type: 'hello', protocolVersion: 1, appVersion: TEST_VERSION, sessionToken: token });
    await back.closed;
    expect(back.closedReason).toBe('session_invalid');
    await mod.client.close();
  });
});

describe('geçiş denetimi (NFR7.3)', () => {
  it('yabancı ya da eksik Origin 403 alır', async () => {
    await expect(server.connect('https://evil.test')).rejects.toThrow('403');
  });
});
