// Ortak şemaların sınırları (NFR7.5, BR1.3, BR6.4, BR10.6).
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  ClientMessageSchema,
  CLIENT_COMMAND_NAMES,
  nickKey,
  normalizeNickInput,
  parseCommand,
  sanitizeChatText,
  ServerMessageSchema,
} from '../../../src/shared/protocol.ts';
import { REASON_CODES, ReasonCodeSchema } from '../../../src/shared/reasonCodes.ts';

describe('istemci mesajları', () => {
  it('geçerli hello kabul edilir, tanınmayan alanlar atılır', () => {
    const parsed = ClientMessageSchema.parse({
      type: 'hello',
      protocolVersion: 1,
      appVersion: 'v0.1.0',
      roomCode: '012345',
      extra: 'atılır',
    });
    expect(parsed).toEqual({
      type: 'hello',
      protocolVersion: 1,
      appVersion: 'v0.1.0',
      roomCode: '012345',
    });
  });

  it('bozuk oda kodu ve bozuk belirteç reddedilir', () => {
    const base = { type: 'hello', protocolVersion: 1, appVersion: 'v0.1.0' };
    expect(ClientMessageSchema.safeParse({ ...base, roomCode: '12345' }).success).toBe(false);
    expect(ClientMessageSchema.safeParse({ ...base, sessionToken: 'kısa' }).success).toBe(false);
  });

  it('commandId UUID değilse komut zarfı reddedilir', () => {
    expect(
      ClientMessageSchema.safeParse({ type: 'command', commandId: 'abc', name: 'game.vote' })
        .success,
    ).toBe(false);
    expect(
      ClientMessageSchema.safeParse({ type: 'command', commandId: randomUUID(), name: 'game.vote' })
        .success,
    ).toBe(true);
  });

  it('bilinmeyen mesaj türü reddedilir', () => {
    expect(ClientMessageSchema.safeParse({ type: 'state', game: {} }).success).toBe(false);
  });
});

describe('komut argümanları', () => {
  it('istemci listesinde olmayan komut (system.* dahil) not_your_turn alır', () => {
    expect(parseCommand('system.deadlineReached', { stepVersion: 3 })).toEqual({
      ok: false,
      reasonCode: 'not_your_turn',
    });
    expect(parseCommand('game.hack', {})).toEqual({ ok: false, reasonCode: 'not_your_turn' });
    expect(CLIENT_COMMAND_NAMES).not.toContain('system.deadlineReached');
  });

  it('nick boşluklardan arındırılır ve 2–16 karakter sınırına uyar', () => {
    const ok = parseCommand('room.create', { nick: '  Ayşe  ' });
    expect(ok).toEqual({ ok: true, command: { name: 'room.create', args: { nick: 'Ayşe' } } });
    expect(parseCommand('room.create', { nick: 'A' })).toEqual({
      ok: false,
      reasonCode: 'nick_invalid',
    });
    expect(parseCommand('room.create', { nick: 'x'.repeat(17) })).toEqual({
      ok: false,
      reasonCode: 'nick_invalid',
    });
    expect(parseCommand('room.join', { roomCode: '123456', nick: 'a\u0007b' })).toEqual({
      ok: false,
      reasonCode: 'nick_invalid',
    });
  });

  it('oda kodu bozuksa room_not_found döner', () => {
    expect(parseCommand('room.join', { roomCode: 'abc', nick: 'Ali' })).toEqual({
      ok: false,
      reasonCode: 'room_not_found',
    });
  });

  it('sohbet metni düz metne indirgenir; boş ve 300 üstü reddedilir', () => {
    expect(parseCommand('chat.send', { channel: 'day', text: ' merhaba\u0000 ' })).toEqual({
      ok: true,
      command: { name: 'chat.send', args: { channel: 'day', text: 'merhaba' } },
    });
    expect(parseCommand('chat.send', { channel: 'day', text: '   ' })).toEqual({
      ok: false,
      reasonCode: 'message_empty',
    });
    expect(parseCommand('chat.send', { channel: 'day', text: 'ç'.repeat(301) })).toEqual({
      ok: false,
      reasonCode: 'message_too_long',
    });
    expect(sanitizeChatText('a\nb')).toEqual({ ok: true, text: 'a\nb' });
  });

  it('ilerletme komutları stepVersion ister; çekimser oy null olarak geçer', () => {
    expect(parseCommand('game.nextStep', {})).toEqual({ ok: false, reasonCode: 'invalid_target' });
    expect(parseCommand('game.nextStep', { stepVersion: 4 }).ok).toBe(true);
    expect(parseCommand('game.vote', { targetSeatId: null }).ok).toBe(true);
    expect(parseCommand('game.timerExtend', { seconds: 9999 }).ok).toBe(false);
  });
});

describe('nick yardımcıları', () => {
  it('Türkçe küçük harf anahtarı İ/ı farkını gözetir', () => {
    expect(nickKey('İLKER')).toBe('ilker');
    expect(nickKey('IŞIK')).toBe('ışık');
    expect(normalizeNickInput('Áli')).toBe('Áli');
  });
});

describe('sunucu mesajları ve neden kodları', () => {
  it('U1 eklemeleri neden kodu listesindedir', () => {
    for (const code of ['step_waiting', 'game_paused', 'server_busy', 'rate_limited']) {
      expect(REASON_CODES).toContain(code);
    }
    expect(ReasonCodeSchema.safeParse('made_up').success).toBe(false);
  });

  it('ack ve closed şemaya uyar; bilinmeyen neden kodu reddedilir', () => {
    expect(
      ServerMessageSchema.safeParse({
        type: 'ack',
        commandId: 'x',
        status: 'rejected',
        reasonCode: 'phase_closed',
      }).success,
    ).toBe(true);
    expect(ServerMessageSchema.safeParse({ type: 'closed', reasonCode: 'nope' }).success).toBe(
      false,
    );
  });
});
