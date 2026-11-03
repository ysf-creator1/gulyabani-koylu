// RoomManager: oda kurma, katılma, lobi, başlatma ve yeni oyun (BR1.1–BR1.6, BR2.1–BR2.5,
// BR7.3, BR10.5, BR12.4). İşleyiciler aday durum ve yazım ifadeleri döndürür (commands.ts).
import { MAX_PLAYERS, type RoomStatus } from '../../shared/domain.ts';
import { nickKey } from '../../shared/protocol.ts';
import { dealRoles, validatePlayerCount } from '../../rules/index.ts';
import type { GameSettings } from '../../rules/types.ts';
import { rejectWith, type Actor, type CommandContext, type Outcome } from '../commands.ts';
import {
  activeParticipants,
  activePlayers,
  isModerator,
  rememberCommand,
  ROOM_LIFETIME_MS,
  roomStatus,
  type MatchRecord,
  type Participant,
  type RoomAggregate,
  type RoomRecord,
} from '../model.ts';
import { insertMatch } from '../store/repos/matchRepo.ts';
import {
  insertParticipant,
  insertRoom,
  updateParticipantStatus,
  updateRoom,
} from '../store/repos/roomRepo.ts';
import { bindSession, revokeSession } from '../store/repos/sessionRepo.ts';

export const EMPTY_LOBBY_MS = 15 * 60 * 1000;

export interface SessionRef {
  sessionId: string;
  roomCode: string | null;
  participantId: string | null;
}

/** Süresi dolan oda, fiziksel silmeden önce de "bulunamadı" sayılır (BR1.4, C8). */
export function isExpired(agg: RoomAggregate, now: number): boolean {
  return now >= agg.room.expiresAt;
}

/** Oda düzeyi komut: sürüm +1 ve numara odanın kaydında saklanır (BR10.2). */
function bumpRoom(
  room: RoomRecord,
  commandId: string,
  patch: Partial<RoomRecord> = {},
): RoomRecord {
  return {
    ...room,
    ...patch,
    version: room.version + 1,
    processedCommandIds: rememberCommand(room.processedCommandIds, commandId),
  };
}

export function createRoom(
  ctx: CommandContext,
  input: {
    roomCode: string;
    nick: string;
    session: SessionRef;
    commandId: string;
    settings: GameSettings;
  },
): Outcome {
  const participantId = ctx.newId();
  const room: RoomRecord = {
    roomCode: input.roomCode,
    createdAt: ctx.now,
    expiresAt: ctx.now + ROOM_LIFETIME_MS,
    moderatorParticipantId: participantId,
    currentMatchId: null,
    settings: { ...input.settings },
    version: 1,
    processedCommandIds: [input.commandId],
  };
  const moderator: Participant = {
    participantId,
    roomCode: input.roomCode,
    nick: input.nick,
    normalizedNick: nickKey(input.nick),
    status: 'active',
    sessionId: input.session.sessionId,
    joinedAt: ctx.now,
  };
  const next: RoomAggregate = {
    room,
    participants: [moderator],
    match: null,
    pastMatches: [],
    chat: { day: [], ghul: [] },
    chatCommandIds: new Set(),
  };
  return {
    status: 'accepted',
    next,
    ops: [
      insertRoom(room),
      insertParticipant(moderator),
      bindSession(input.session.sessionId, room.roomCode, participantId),
    ],
    effects: [
      {
        kind: 'bindSession',
        sessionId: input.session.sessionId,
        roomCode: room.roomCode,
        participantId,
      },
    ],
  };
}

/** Katılma denetim sırası (A2): oda var mı → dolu mu → oyun sürüyor mu → nick (BR1.3, BR1.4, BR1.6). */
export function joinRoom(
  agg: RoomAggregate | undefined,
  ctx: CommandContext,
  input: { nick: string; session: SessionRef; commandId: string },
): Outcome {
  if (!agg || isExpired(agg, ctx.now)) return rejectWith('room_not_found');
  const { session } = input;
  if (session.roomCode !== null) {
    const existing = agg.participants.find(
      (p) => p.sessionId === session.sessionId && p.status === 'active',
    );
    // Aynı oturum aynı odaya yeniden katılırsa var olan katılımcı döner (BR10.5)
    if (session.roomCode === agg.room.roomCode && existing)
      return { status: 'accepted', next: agg, ops: [] };
    return rejectWith('session_invalid');
  }
  if (activePlayers(agg).length >= MAX_PLAYERS) return rejectWith('room_full');
  if (roomStatus(agg) !== 'lobby') return rejectWith('phase_closed');
  const normalizedNick = nickKey(input.nick);
  if (activeParticipants(agg).some((p) => p.normalizedNick === normalizedNick))
    return rejectWith('nick_taken');
  const participant: Participant = {
    participantId: ctx.newId(),
    roomCode: agg.room.roomCode,
    nick: input.nick,
    normalizedNick,
    status: 'active',
    sessionId: session.sessionId,
    joinedAt: ctx.now,
  };
  const room = bumpRoom(agg.room, input.commandId);
  return {
    status: 'accepted',
    next: { ...agg, room, participants: [...agg.participants, participant] },
    ops: [
      insertParticipant(participant),
      updateRoom(room, agg.room.version),
      bindSession(session.sessionId, room.roomCode, participant.participantId),
    ],
    effects: [
      {
        kind: 'bindSession',
        sessionId: session.sessionId,
        roomCode: room.roomCode,
        participantId: participant.participantId,
      },
    ],
  };
}

function requireModeratorInStatus(
  agg: RoomAggregate,
  actor: Actor,
  status: RoomStatus,
): Outcome | null {
  if (!actor.participantId || !isModerator(agg, actor.participantId))
    return rejectWith('not_moderator');
  if (roomStatus(agg) !== status) return rejectWith('phase_closed');
  return null;
}

/** Lobide çıkarma (BR2.3): oturum geçersiz olur, kişi "Moderatör seni odadan çıkardı." görür. */
export function kickParticipant(
  agg: RoomAggregate,
  actor: Actor,
  targetId: string,
  commandId: string,
): Outcome {
  const denied = requireModeratorInStatus(agg, actor, 'lobby');
  if (denied) return denied;
  const target = agg.participants.find(
    (p) => p.participantId === targetId && p.status === 'active',
  );
  if (!target || isModerator(agg, targetId)) return rejectWith('invalid_target');
  const kicked: Participant = { ...target, status: 'kicked' };
  const room = bumpRoom(agg.room, commandId);
  return {
    status: 'accepted',
    next: {
      ...agg,
      room,
      participants: agg.participants.map((p) => (p.participantId === targetId ? kicked : p)),
    },
    ops: [
      updateParticipantStatus(kicked),
      updateRoom(room, agg.room.version),
      revokeSession(target.sessionId),
    ],
    effects: [{ kind: 'revokeSession', sessionId: target.sessionId, reasonCode: 'kicked' }],
  };
}

/**
 * Oyunu başlatma (BR2.1, BR2.2, BR3.1, BR3.2): önce oyun kaydı, sonra oda kaydı yazılır; ikisi
 * aynı yazım isteğindedir (kesinleşme noktası oda kaydıdır, BR10.2).
 */
export function startGame(
  agg: RoomAggregate,
  actor: Actor,
  ctx: CommandContext,
  commandId: string,
): Outcome {
  const denied = requireModeratorInStatus(agg, actor, 'lobby');
  if (denied) return denied;
  const players = activePlayers(agg);
  const blocked = validatePlayerCount(players.length);
  if (blocked) return rejectWith(blocked);
  const matchId = ctx.newId();
  const { state } = dealRoles(
    {
      gameId: matchId,
      participants: players.map((p) => ({ participantId: p.participantId, nick: p.nick })),
      settings: agg.room.settings,
      now: ctx.now,
    },
    ctx.random,
  );
  const match: MatchRecord = {
    matchId,
    roomCode: agg.room.roomCode,
    status: 'running',
    paused: false,
    pauseReason: null,
    moderatorConnected: true,
    remainingOnPause: null,
    persistedVersion: 1,
    processedCommandIds: [],
    startedAt: ctx.now,
    endedAt: null,
    state,
  };
  const room = bumpRoom(agg.room, commandId, { currentMatchId: matchId });
  const previous = agg.match ? [...agg.pastMatches, agg.match] : agg.pastMatches;
  return {
    status: 'accepted',
    next: { ...agg, room, match, pastMatches: previous, chat: { day: [], ghul: [] } },
    ops: [insertMatch(match, ctx.now), updateRoom(room, agg.room.version)],
    stepChanged: true,
  };
}

/** "Yeni oyun" (BR7.3): aynı oda, oyuncular ve ayarlarla lobiye dönülür; ömür sıfırlanmaz. */
export function newGame(agg: RoomAggregate, actor: Actor, commandId: string): Outcome {
  if (!actor.participantId || !isModerator(agg, actor.participantId))
    return rejectWith('not_moderator');
  if (!agg.match || agg.match.status !== 'ended' || !agg.room.currentMatchId)
    return rejectWith('phase_closed');
  const room = bumpRoom(agg.room, commandId, { currentMatchId: null });
  return {
    status: 'accepted',
    next: { ...agg, room, match: null, pastMatches: [...agg.pastMatches, agg.match] },
    ops: [updateRoom(room, agg.room.version)],
    stepChanged: true,
  };
}

/** Lobide 15 dakika bağlı kimse yoksa oda süresi dolmuş sayılır (BR12.4, NFR7.7 e). */
export function expireIdleLobby(agg: RoomAggregate, now: number): Outcome {
  if (roomStatus(agg) !== 'lobby' || isExpired(agg, now)) return { status: 'dropped', ops: [] };
  const room: RoomRecord = { ...agg.room, expiresAt: now, version: agg.room.version + 1 };
  return { status: 'accepted', next: { ...agg, room }, ops: [updateRoom(room, agg.room.version)] };
}
