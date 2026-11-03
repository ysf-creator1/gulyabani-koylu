// Sohbet kanallarının yazma ve okuma izinleri (BR4.8, BR6.4). Saf fonksiyonlardır; hem
// ChatService (yazma denetimi) hem VisibilityFilter (canWrite ve kanalın görünürlüğü) kullanır.
import type { ChatChannel } from '../../shared/domain.ts';
import { isModerator, seatOf, type RoomAggregate } from '../model.ts';

function runningState(agg: RoomAggregate) {
  return agg.match && agg.match.status === 'running' ? agg.match.state : null;
}

/** Gulyabani kanalını okuyabilenler: yaşayan gulyabaniler ve moderatör (salt okunur). */
export function canReadChannel(
  agg: RoomAggregate,
  participantId: string,
  channel: ChatChannel,
): boolean {
  if (channel === 'day') return true;
  if (isModerator(agg, participantId)) return agg.match !== null;
  const seat = seatOf(agg, participantId);
  return seat !== undefined && seat.alive && seat.roleId === 'ghul';
}

export function canWriteChannel(
  agg: RoomAggregate,
  participantId: string,
  channel: ChatChannel,
): boolean {
  const state = runningState(agg);
  if (!state) return false;
  const moderator = isModerator(agg, participantId);
  const seat = seatOf(agg, participantId);
  if (channel === 'ghul') {
    const ghulStep = state.stepCursor === 'ghul_meet' || state.stepCursor === 'ghul_kill';
    const isNight = state.phase === 'first_night' || state.phase === 'night';
    return isNight && ghulStep && seat !== undefined && seat.alive && seat.roleId === 'ghul';
  }
  if (state.phase === 'day' || state.phase === 'voting') {
    return moderator || (seat !== undefined && seat.alive);
  }
  if (state.phase === 'last_words') {
    return moderator || (seat !== undefined && seat.alive && seat.seatId === state.accusedSeatId);
  }
  return false;
}
