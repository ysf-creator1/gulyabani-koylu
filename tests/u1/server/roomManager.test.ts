// RoomManager (BR1.1–BR1.6, BR2.1–BR2.3, BR7.3, BR10.5, BR12.4).
import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../../../src/rules/index.ts';
import type { Actor, CommandContext } from '../../../src/server/commands.ts';
import type { RoomAggregate } from '../../../src/server/model.ts';
import { generateRoomCode } from '../../../src/server/room/roomCode.ts';
import {
  createRoom,
  expireIdleLobby,
  isExpired,
  joinRoom,
  kickParticipant,
  leaveRoom,
  newGame,
  startGame,
} from '../../../src/server/room/roomManager.ts';
import { NOW, seqRandom, zeroRandom } from '../rules/helpers.ts';

let counter = 0;
const ctx = (now = NOW): CommandContext => ({
  now,
  random: zeroRandom,
  newId: () => `id${++counter}`,
});
const freshSession = (id: string) => ({ sessionId: id, roomCode: null, participantId: null });

function created(): RoomAggregate {
  const outcome = createRoom(ctx(), {
    roomCode: '042042',
    nick: 'Moderatör',
    session: freshSession('s-mod'),
    commandId: 'c-create',
    settings: defaultSettings(),
  });
  return outcome.next!;
}

function withPlayers(count: number): RoomAggregate {
  let agg = created();
  for (let i = 1; i <= count; i += 1) {
    agg = joinRoom(agg, ctx(), {
      nick: `Oyuncu${i}`,
      session: freshSession(`s${i}`),
      commandId: `c-join${i}`,
    }).next!;
  }
  return agg;
}

const moderatorActor = (agg: RoomAggregate): Actor => ({
  sessionId: 's-mod',
  participantId: agg.room.moderatorParticipantId,
  connectionId: 'conn',
});

describe('oda kurma (BR1.1, BR1.2)', () => {
  it('kurucu moderatör olur, oda 24 saat yaşar, oturum odaya bağlanır', () => {
    const outcome = createRoom(ctx(), {
      roomCode: '042042',
      nick: 'Ayşe',
      session: freshSession('s-mod'),
      commandId: 'c1',
      settings: defaultSettings(),
    });
    const agg = outcome.next!;
    expect(agg.room.moderatorParticipantId).toBe(agg.participants[0]!.participantId);
    expect(agg.room.expiresAt - agg.room.createdAt).toBe(24 * 60 * 60 * 1000);
    expect(agg.room.processedCommandIds).toEqual(['c1']);
    expect(outcome.effects).toEqual([
      {
        kind: 'bindSession',
        sessionId: 's-mod',
        roomCode: '042042',
        participantId: agg.participants[0]!.participantId,
      },
    ]);
    expect(outcome.ops.map((op) => op.sql.split(' ')[0])).toEqual(['INSERT', 'INSERT', 'UPDATE']);
  });

  it('oda kodu 6 hanelidir, çakışırsa yeniden üretilir, 10 denemede bulunamazsa null', () => {
    expect(generateRoomCode(() => false, seqRandom([42]))).toBe('000042');
    expect(generateRoomCode((code) => code === '000001', seqRandom([1, 2]))).toBe('000002');
    expect(generateRoomCode(() => true, zeroRandom)).toBeNull();
  });
});

describe('odaya katılma (BR1.3, BR1.4, BR1.6, BR10.5)', () => {
  it('yeni katılımcı eklenir, oda sürümü artar', () => {
    const agg = created();
    const outcome = joinRoom(agg, ctx(), {
      nick: 'Can',
      session: freshSession('s1'),
      commandId: 'c-j',
    });
    expect(outcome.status).toBe('accepted');
    expect(outcome.next!.participants.map((p) => p.nick)).toEqual(['Moderatör', 'Can']);
    expect(outcome.next!.room.version).toBe(agg.room.version + 1);
  });

  it('nick Türkçe büyük/küçük harf farkı gözetmeden benzersizdir', () => {
    const agg = joinRoom(created(), ctx(), {
      nick: 'İlker',
      session: freshSession('s1'),
      commandId: 'c-j1',
    }).next!;
    expect(
      joinRoom(agg, ctx(), { nick: 'ilker', session: freshSession('s2'), commandId: 'c-j2' })
        .reasonCode,
    ).toBe('nick_taken');
    expect(
      joinRoom(agg, ctx(), { nick: 'moderatör', session: freshSession('s3'), commandId: 'c-j3' })
        .reasonCode,
    ).toBe('nick_taken');
  });

  it('olmayan ya da süresi dolmuş oda room_not_found, 26 oyunculu oda room_full alır', () => {
    expect(
      joinRoom(undefined, ctx(), { nick: 'Can', session: freshSession('s1'), commandId: 'x' })
        .reasonCode,
    ).toBe('room_not_found');
    const agg = created();
    const late = ctx(agg.room.expiresAt);
    expect(isExpired(agg, late.now)).toBe(true);
    expect(
      joinRoom(agg, late, { nick: 'Can', session: freshSession('s1'), commandId: 'x' }).reasonCode,
    ).toBe('room_not_found');
    const full = withPlayers(26);
    expect(
      joinRoom(full, ctx(), { nick: 'Fazla', session: freshSession('s99'), commandId: 'x' })
        .reasonCode,
    ).toBe('room_full');
  });

  it('oyun sürerken giriş phase_closed ile reddedilir', () => {
    const lobby = withPlayers(3);
    const started = startGame(lobby, moderatorActor(lobby), ctx(), 'c-start').next!;
    expect(
      joinRoom(started, ctx(), { nick: 'Geç', session: freshSession('s9'), commandId: 'x' })
        .reasonCode,
    ).toBe('phase_closed');
  });

  it('aynı oturumla yeniden gelen katılma ikinci katılımcı oluşturmaz; başka oda session_invalid', () => {
    const agg = withPlayers(1);
    const bound = {
      sessionId: 's1',
      roomCode: '042042',
      participantId: agg.participants[1]!.participantId,
    };
    const again = joinRoom(agg, ctx(), { nick: 'Oyuncu1', session: bound, commandId: 'c-new' });
    expect(again.status).toBe('accepted');
    expect(again.ops).toEqual([]);
    expect(again.next!.participants).toHaveLength(2);
    const elsewhere = joinRoom(agg, ctx(), {
      nick: 'X',
      session: { ...bound, roomCode: '999999' },
      commandId: 'c',
    });
    expect(elsewhere.reasonCode).toBe('session_invalid');
  });
});

describe('lobi (BR2.1–BR2.3)', () => {
  it('moderatör lobideki oyuncuyu çıkarır, oturumu geçersiz olur', () => {
    const agg = withPlayers(2);
    const target = agg.participants[1]!;
    const outcome = kickParticipant(agg, moderatorActor(agg), target.participantId, 'c-kick');
    expect(
      outcome.next!.participants.find((p) => p.participantId === target.participantId)?.status,
    ).toBe('kicked');
    expect(outcome.effects).toEqual([
      { kind: 'revokeSession', sessionId: 's1', reasonCode: 'kicked' },
    ]);
  });

  it('oyuncu çıkaramaz, moderatör kendini çıkaramaz', () => {
    const agg = withPlayers(2);
    const player: Actor = {
      sessionId: 's1',
      participantId: agg.participants[1]!.participantId,
      connectionId: 'c',
    };
    expect(kickParticipant(agg, player, agg.participants[2]!.participantId, 'c').reasonCode).toBe(
      'not_moderator',
    );
    expect(
      kickParticipant(agg, moderatorActor(agg), agg.room.moderatorParticipantId, 'c').reasonCode,
    ).toBe('invalid_target');
  });

  it('3ten az oyuncuyla başlatma too_few_players; moderatör oyuncu sayılmaz', () => {
    const agg = withPlayers(2);
    expect(startGame(agg, moderatorActor(agg), ctx(), 'c').reasonCode).toBe('too_few_players');
  });

  it('başlatma oyun ve oda kaydını aynı istekte yazar; moderatörün koltuğu yoktur', () => {
    const agg = withPlayers(3);
    const outcome = startGame(agg, moderatorActor(agg), ctx(), 'c-start');
    const next = outcome.next!;
    expect(next.room.currentMatchId).toBe(next.match!.matchId);
    expect(next.match!.state.seats).toHaveLength(3);
    expect(
      next.match!.state.seats.some((s) => s.participantId === agg.room.moderatorParticipantId),
    ).toBe(false);
    expect(outcome.ops[0]!.sql).toContain('match_matches');
    expect(outcome.ops[1]!.sql).toContain('room_rooms');
    expect(outcome.stepChanged).toBe(true);
    const player: Actor = {
      sessionId: 's1',
      participantId: agg.participants[1]!.participantId,
      connectionId: 'c',
    };
    expect(startGame(agg, player, ctx(), 'c').reasonCode).toBe('not_moderator');
  });
});

describe('yeni oyun ve boş lobi (BR7.3, BR12.4)', () => {
  it('yalnızca bitmiş oyundan sonra lobiye dönülür; oda ömrü değişmez', () => {
    const lobby = withPlayers(3);
    const started = startGame(lobby, moderatorActor(lobby), ctx(), 'c-start').next!;
    expect(newGame(started, moderatorActor(started), 'c-new').reasonCode).toBe('phase_closed');
    const ended: RoomAggregate = { ...started, match: { ...started.match!, status: 'ended' } };
    const back = newGame(ended, moderatorActor(ended), 'c-new').next!;
    expect(back.room.currentMatchId).toBeNull();
    expect(back.match).toBeNull();
    expect(back.pastMatches).toHaveLength(1);
    expect(back.room.expiresAt).toBe(lobby.room.expiresAt);
  });

  it('boş lobinin süresi şimdiye çekilir; oyun sürerken dokunulmaz', () => {
    const lobby = withPlayers(1);
    const expired = expireIdleLobby(lobby, NOW + 1000).next!;
    expect(isExpired(expired, NOW + 1000)).toBe(true);
    const three = withPlayers(3);
    const started = startGame(three, moderatorActor(three), ctx(), 'c').next!;
    expect(expireIdleLobby(started, NOW).status).toBe('dropped');
  });
});

describe('odadan çıkma (sahip geri bildirimi 2026-11-04)', () => {
  const playerActor = (agg: RoomAggregate, index: number): Actor => ({
    sessionId: `s${index}`,
    participantId: agg.participants[index]!.participantId,
    connectionId: 'c',
  });

  it('oyun bitince oyuncu çıkar; oturumu kapanır, yeni oyunun lobisinde görünmez', () => {
    const lobby = withPlayers(3);
    const started = startGame(lobby, moderatorActor(lobby), ctx(), 'c-start').next!;
    const ended: RoomAggregate = { ...started, match: { ...started.match!, status: 'ended' } };
    const outcome = leaveRoom(ended, playerActor(ended, 1), 'c-leave');
    expect(outcome.status).toBe('accepted');
    expect(outcome.next!.participants[1]!.status).toBe('left');
    expect(outcome.effects).toEqual([
      { kind: 'revokeSession', sessionId: 's1', reasonCode: 'left' },
    ]);
    const back = newGame(outcome.next!, moderatorActor(outcome.next!), 'c-new').next!;
    expect(back.participants.filter((p) => p.status === 'active')).toHaveLength(3);
  });

  it('oyun sürerken çıkılamaz; moderatör çıkamaz; oturumu olmayan session_invalid alır', () => {
    const lobby = withPlayers(3);
    const started = startGame(lobby, moderatorActor(lobby), ctx(), 'c-start').next!;
    expect(leaveRoom(started, playerActor(started, 1), 'c').reasonCode).toBe('phase_closed');
    expect(leaveRoom(lobby, moderatorActor(lobby), 'c').reasonCode).toBe('not_your_turn');
    const stranger: Actor = { sessionId: 'x', participantId: 'yok', connectionId: 'c' };
    expect(leaveRoom(lobby, stranger, 'c').reasonCode).toBe('session_invalid');
  });

  it('lobiden çıkan oyuncu aynı takma adla yeni oturumla geri girebilir', () => {
    const lobby = withPlayers(2);
    const left = leaveRoom(lobby, playerActor(lobby, 1), 'c-leave').next!;
    const again = joinRoom(left, ctx(), {
      nick: 'Oyuncu1',
      session: freshSession('s1-yeni'),
      commandId: 'c-rejoin',
    });
    expect(again.status).toBe('accepted');
    expect(again.next!.participants.filter((p) => p.nick === 'Oyuncu1')).toHaveLength(2);
  });
});
