// VisibilityFilter (C5, ADR-002): bir kişiye giden her oda ve oyun bilgisi buradan geçer.
// Alanlar izin listesiyle eklenir; hakkı olmayan alan görünümde anahtar olarak da yer almaz
// (BR11.1–BR11.5, NFR8.1). FilteredView yalnızca bu modülde üretilen işaretli bir türdür.
import type { ChatChannel } from '../../shared/domain.ts';
import type {
  RecipientView,
  ViewChatChannel,
  ViewGame,
  ViewModerator,
  ViewRoom,
  ViewSeat,
} from '../../shared/view.ts';
import { legalActions, startWarnings, validatePlayerCount } from '../../rules/index.ts';
import type { GameState, Seat } from '../../rules/types.ts';
import { canReadChannel, canWriteChannel } from '../chat/chatPolicy.ts';
import {
  activeParticipants,
  activePlayers,
  findParticipant,
  isModerator,
  roomStatus,
  seatOf,
  type MatchRecord,
  type RoomAggregate,
} from '../model.ts';

declare const filteredBrand: unique symbol;
/** Yalnızca render() üretir; ViewDispatcher yalnızca bu türü gönderir (security-design Gizli Bilgi). */
export type FilteredView = RecipientView & { readonly [filteredBrand]: true };

export interface RenderInput {
  agg: RoomAggregate;
  recipientParticipantId: string;
  /** Bağlı katılımcılar ("kopuk" bilgisi yalnızca moderatör bloğuna gider). */
  connected: ReadonlySet<string>;
  publicOrigin: string;
  now: number;
}

const CHANNELS: ChatChannel[] = ['day', 'ghul'];

function renderRoom(input: RenderInput, moderator: boolean): ViewRoom {
  const { agg } = input;
  const moderatorParticipant = findParticipant(agg, agg.room.moderatorParticipantId);
  const room: ViewRoom = {
    roomCode: agg.room.roomCode,
    link: `${input.publicOrigin}/oda/${agg.room.roomCode}`,
    status: roomStatus(agg),
    moderatorNick: moderatorParticipant?.nick ?? '',
    participants: activeParticipants(agg).map((p) => ({
      participantId: p.participantId,
      nick: p.nick,
    })),
    openRoleIds: ['ghul', 'villager'],
    expiresAt: agg.room.expiresAt,
  };
  if (moderator && room.status === 'lobby') {
    const count = activePlayers(agg).length;
    const reasonCode = validatePlayerCount(count);
    room.startBlock = reasonCode
      ? { reasonCode, warnings: [] }
      : { warnings: startWarnings(count) };
  }
  return room;
}

function renderSeat(seat: Seat, state: GameState, viewer: Seat | undefined): ViewSeat {
  const out: ViewSeat = { seatId: seat.seatId, nick: seat.nick, alive: seat.alive };
  if (seat.revealed || state.phase === 'ended') out.revealedRoleId = seat.roleId;
  const viewerIsLivingGhul = viewer !== undefined && viewer.alive && viewer.roleId === 'ghul';
  if (viewerIsLivingGhul && seat.roleId === 'ghul' && seat.seatId !== viewer.seatId)
    out.roleId = 'ghul';
  return out;
}

function isVotingPhase(state: GameState): boolean {
  return state.phase === 'voting' || state.phase === 'last_words' || state.phase === 'confirm_vote';
}

function addTiming(game: ViewGame, match: MatchRecord): void {
  const { state } = match;
  if (!state.deadline) return;
  if (match.paused) {
    if (match.remainingOnPause !== null) game.remainingMs = match.remainingOnPause;
  } else {
    game.deadline = state.deadline.endsAt;
  }
}

function renderGame(match: MatchRecord, viewer: Seat | undefined, moderator: boolean): ViewGame {
  const { state } = match;
  const game: ViewGame = {
    phase: state.phase,
    nightNumber: state.nightNumber,
    dayNumber: state.dayNumber,
    paused: match.paused,
    seats: state.seats.map((seat) => renderSeat(seat, state, viewer)),
  };
  if (match.paused && match.pauseReason) game.pauseReason = match.pauseReason;
  addTiming(game, match);
  if (viewer) {
    const action = legalActions(state, viewer.seatId)[0];
    if (action) game.myAction = action;
  }
  const viewerIsLivingGhul = viewer !== undefined && viewer.alive && viewer.roleId === 'ghul';
  const isNight = state.phase === 'first_night' || state.phase === 'night';
  if (isNight && state.stepCursor === 'ghul_kill' && (viewerIsLivingGhul || moderator)) {
    game.ghulMarks = Object.entries(state.ghulMarks).map(([bySeatId, targetSeatId]) => ({
      bySeatId,
      targetSeatId,
    }));
    game.ghulDecided = state.stepStatus === 'done' || state.stepStatus === 'timed_out';
  }
  if (isVotingPhase(state)) {
    if (state.settings.liveVotes || moderator) game.votes = state.votes.map((v) => ({ ...v }));
    if (state.voteRound) game.voteRound = state.voteRound;
    if (state.tiedSeatIds) game.tiedSeatIds = [...state.tiedSeatIds];
    if (state.accusedSeatId) game.accusedSeatId = state.accusedSeatId;
  }
  if (state.morningResult && state.phase === 'day')
    game.morningResult = { deadSeatIds: [...state.morningResult.deadSeatIds] };
  if (state.phase === 'ended' && state.winners)
    game.winners = { sides: [state.winners], extraSeatIds: [] };
  if (moderator || state.phase === 'ended') game.nightLog = state.nightLog.map((e) => ({ ...e }));
  return game;
}

function announcement(state: GameState): { key: string; params?: Record<string, string> } {
  const nickOf = (seatId: string | null | undefined) =>
    state.seats.find((s) => s.seatId === seatId)?.nick ?? '';
  switch (state.phase) {
    case 'first_night':
    case 'night':
      if (state.stepCursor === 'card_reveal') return { key: 'announce.card_reveal' };
      if (state.stepCursor === 'ghul_meet') return { key: 'announce.ghul_meet_first' };
      return { key: 'announce.ghul_kill' };
    case 'morning':
      return state.pendingDeaths.length > 0
        ? { key: 'announce.morning_death', params: { nick: nickOf(state.pendingDeaths[0]) } }
        : { key: 'announce.morning_none' };
    case 'day':
      return { key: 'announce.day' };
    case 'voting':
      return { key: state.voteRound === 'revote' ? 'announce.revote' : 'announce.voting' };
    case 'last_words':
      return { key: 'announce.last_words', params: { nick: nickOf(state.accusedSeatId) } };
    case 'confirm_vote':
      return { key: 'announce.confirm_vote' };
    default:
      return {
        key: state.winners === 'villagers' ? 'announce.ended_villagers' : 'announce.ended_ghuls',
      };
  }
}

function renderModerator(match: MatchRecord, connected: ReadonlySet<string>): ViewModerator {
  const { state } = match;
  const note = announcement(state);
  const isNight = state.phase === 'first_night' || state.phase === 'night';
  const moderatorView: ViewModerator = {
    stepVersion: state.stepVersion,
    announcementTextKey: note.key,
    expectedAction: `expected.${isNight && state.stepCursor ? state.stepCursor : state.phase}`,
    allSeats: state.seats.map((s) => ({
      seatId: s.seatId,
      nick: s.nick,
      roleId: s.roleId,
      alive: s.alive,
      connected: connected.has(s.participantId),
      cardSeen: s.cardSeen,
    })),
    notices: [],
  };
  if (note.params) moderatorView.announcementParams = note.params;
  if (isNight && state.stepCursor) moderatorView.stepCursor = state.stepCursor;
  if (state.stepStatus) {
    const ghulsAway = state.seats.some(
      (s) => s.alive && s.roleId === 'ghul' && !connected.has(s.participantId),
    );
    moderatorView.stepStatus =
      state.stepStatus === 'waiting' && ghulsAway ? 'player_disconnected' : state.stepStatus;
  }
  if (state.phase === 'morning') moderatorView.pendingDeathSeatIds = [...state.pendingDeaths];
  if (state.phase === 'day' && state.dayTimerExpired)
    moderatorView.notices.push({ textKey: 'notice.day.move_to_vote_reminder' });
  if (match.paused && match.pauseReason === 'moderator')
    moderatorView.notices.push({ textKey: 'notice.paused' });
  return moderatorView;
}

function renderChat(agg: RoomAggregate, participantId: string): { channels: ViewChatChannel[] } {
  const channels: ViewChatChannel[] = [];
  for (const channel of CHANNELS) {
    if (!canReadChannel(agg, participantId, channel)) continue;
    channels.push({
      channel,
      canWrite: canWriteChannel(agg, participantId, channel),
      messages: agg.chat[channel].map((m) => ({
        messageId: m.messageId,
        authorNick: m.authorNick,
        text: m.text,
        sentAt: m.sentAt,
      })),
    });
  }
  return { channels };
}

/**
 * Alıcıya özel görünümü üretir. Katılımcı odada değilse ya da çıkarıldıysa null döner
 * (oyun sürerken giriş reddedilen kişiye görünüm gitmez, NFR8.5).
 */
export function render(input: RenderInput): FilteredView | null {
  const { agg, recipientParticipantId } = input;
  const participant = findParticipant(agg, recipientParticipantId);
  if (!participant || participant.status !== 'active') return null;
  const moderator = isModerator(agg, recipientParticipantId);
  const seat = seatOf(agg, recipientParticipantId);
  const view: RecipientView = {
    me: {
      participantId: participant.participantId,
      nick: participant.nick,
      kind: moderator ? 'moderator' : 'player',
    },
    room: renderRoom(input, moderator),
    chat: renderChat(agg, recipientParticipantId),
  };
  if (seat) {
    view.me.seatId = seat.seatId;
    view.me.roleId = seat.roleId;
    view.me.alive = seat.alive;
  }
  if (agg.match && agg.room.currentMatchId) {
    view.game = renderGame(agg.match, seat, moderator);
    if (moderator) view.moderator = renderModerator(agg.match, input.connected);
  }
  return view as FilteredView;
}
