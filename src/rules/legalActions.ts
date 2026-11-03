// Bir koltuğun o anki yasal eylemleri (C3 legalActions) ve duraklatmada izinli komutlar (BR10.8).
import { findSeat, livingSeats } from './common.ts';
import type { GameState, LegalAction } from './types.ts';

const ALLOWED_WHILE_PAUSED = new Set([
  'game.resume',
  'game.timerExtend',
  'game.cardSeen',
  'chat.send',
]);

export function isAllowedWhilePaused(commandName: string): boolean {
  return ALLOWED_WHILE_PAUSED.has(commandName);
}

function nightActions(state: GameState, seatId: string): LegalAction[] {
  const seat = findSeat(state, seatId);
  if (!seat) return [];
  if (state.stepCursor === 'card_reveal') return [{ kind: 'see_card', targets: [] }];
  if (!seat.alive || seat.roleId !== 'ghul') return [];
  if (state.stepCursor === 'ghul_meet') return [{ kind: 'ghul_meet', targets: [] }];
  if (state.stepCursor === 'ghul_kill' && state.stepStatus === 'waiting') {
    const targets = livingSeats(state)
      .filter((s) => s.roleId !== 'ghul')
      .map((s) => s.seatId);
    const action: LegalAction = { kind: 'ghul_mark', targets };
    if (state.deadline) action.deadline = state.deadline.endsAt;
    return [action];
  }
  return [];
}

function voteActions(state: GameState, seatId: string): LegalAction[] {
  const seat = findSeat(state, seatId);
  if (!seat || !seat.alive) return [];
  const targets = livingSeats(state)
    .filter((s) => s.seatId !== seatId)
    .filter((s) => !state.tiedSeatIds || state.tiedSeatIds.includes(s.seatId))
    .map((s) => s.seatId);
  const action: LegalAction = { kind: 'vote', targets };
  if (state.phase === 'confirm_vote' && state.deadline) action.deadline = state.deadline.endsAt;
  return [action];
}

/**
 * Koltuğun yasal eylemleri. Gece sırası gelmeyenlerin listesi boştur; bu yüzden onların
 * görünümleri birbirinin aynısıdır (BR4.7). game.nightSelect U1'de hiçbir koltuğa verilmez (BR4.9).
 */
export function legalActions(state: GameState, seatId: string): LegalAction[] {
  if (state.phase === 'first_night' || state.phase === 'night') return nightActions(state, seatId);
  if (state.phase === 'voting' || state.phase === 'confirm_vote') return voteActions(state, seatId);
  return [];
}
