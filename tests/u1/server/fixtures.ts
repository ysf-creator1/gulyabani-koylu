// Sunucu testleri için oda ve oyun kayıtları üretir (entities.md biçiminde, tür denetimli).
import { defaultSettings } from '../../../src/rules/index.ts';
import type { GameState } from '../../../src/rules/types.ts';
import type {
  ChatMessage,
  MatchRecord,
  Participant,
  RoomAggregate,
} from '../../../src/server/model.ts';
import { ROOM_LIFETIME_MS } from '../../../src/server/model.ts';
import { NOW, newGame } from '../rules/helpers.ts';

export const ROOM_CODE = '123456';
export const MODERATOR_ID = 'pm';

export function participant(id: string, nick: string, joinedAt = NOW): Participant {
  return {
    participantId: id,
    roomCode: ROOM_CODE,
    nick,
    normalizedNick: nick.toLocaleLowerCase('tr-TR'),
    status: 'active',
    sessionId: `sess-${id}`,
    joinedAt,
  };
}

export function matchRecord(state: GameState, overrides: Partial<MatchRecord> = {}): MatchRecord {
  return {
    matchId: 'm1',
    roomCode: ROOM_CODE,
    status: state.phase === 'ended' ? 'ended' : 'running',
    paused: false,
    pauseReason: null,
    moderatorConnected: true,
    remainingOnPause: null,
    persistedVersion: 1,
    processedCommandIds: [],
    startedAt: NOW,
    endedAt: null,
    state,
    ...overrides,
  };
}

/** roles: 'g'/'v' dizgesi; boş dizge lobideki odayı verir. Katılımcılar p1…pN (Bot1…BotN) ve moderatör pm. */
export function makeAgg(roles: string, state?: GameState): RoomAggregate {
  const count = roles.length > 0 ? roles.length : 0;
  const players = Array.from({ length: count }, (_, i) => participant(`p${i + 1}`, `Bot${i + 1}`));
  const game = roles.length >= 3 ? (state ?? newGame(roles)) : null;
  return {
    room: {
      roomCode: ROOM_CODE,
      createdAt: NOW,
      expiresAt: NOW + ROOM_LIFETIME_MS,
      moderatorParticipantId: MODERATOR_ID,
      currentMatchId: game ? 'm1' : null,
      settings: defaultSettings(),
      version: 1,
      processedCommandIds: [],
    },
    participants: [participant(MODERATOR_ID, 'Moderator'), ...players],
    match: game ? matchRecord(game) : null,
    pastMatches: [],
    chat: { day: [], ghul: [] },
    chatCommandIds: new Set(),
  };
}

export function chatMessage(channel: 'day' | 'ghul', text: string, author = 'p1'): ChatMessage {
  return {
    messageId: `msg-${text}`,
    roomCode: ROOM_CODE,
    channel,
    authorParticipantId: author,
    authorNick: 'Bot1',
    text,
    sentAt: NOW,
    commandId: `cmd-${text}`,
  };
}

export const everyoneConnected = (agg: RoomAggregate) =>
  new Set(agg.participants.map((p) => p.participantId));
