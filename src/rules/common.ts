// Kural modülünün ortak küçük yardımcıları. Saf fonksiyonlardır; durum hiçbir zaman yerinde
// değiştirilmez, her değişiklik yeni nesne döndürür.
import type { Phase } from '../shared/domain.ts';
import type { ReasonCode } from '../shared/reasonCodes.ts';
import type { Deadline, Decision, DomainEvent, GameState, Seat } from './types.ts';

export function reject(reasonCode: ReasonCode): Decision {
  return { ok: false, reasonCode };
}

export function accept(state: GameState, events: DomainEvent[] = []): Decision {
  return { ok: true, state, events };
}

export function findSeat(state: GameState, seatId: string): Seat | undefined {
  return state.seats.find((s) => s.seatId === seatId);
}

export function livingSeats(state: GameState): Seat[] {
  return state.seats.filter((s) => s.alive);
}

export function livingGhuls(state: GameState): Seat[] {
  return state.seats.filter((s) => s.alive && s.roleId === 'ghul');
}

export function isLivingGhul(state: GameState, seatId: string): boolean {
  const seat = findSeat(state, seatId);
  return seat !== undefined && seat.alive && seat.roleId === 'ghul';
}

export function deadlineIn(now: number, seconds: number): Deadline {
  return { endsAt: now + Math.round(seconds * 1000), totalSeconds: seconds };
}

/** Faz ya da adım değişimi: stepVersion bir artar (BR10.7) ve değişim anı yazılır (BR8.2). */
export function changeStep(state: GameState, patch: Partial<GameState>, now: number): GameState {
  return { ...state, ...patch, stepVersion: state.stepVersion + 1, lastStepChangeAt: now };
}

export function phaseEvent(phase: Phase, stepCursor: string | null = null): DomainEvent {
  return { type: 'phase.changed', payload: { phase, stepCursor } };
}

/** Koltuk sırasını koruyarak en çok sayıyı alanları döndürür. */
export function leadersOf(state: GameState, counts: Map<string, number>): string[] {
  let max = 0;
  for (const count of counts.values()) max = Math.max(max, count);
  if (max === 0) return [];
  return state.seats.filter((s) => counts.get(s.seatId) === max).map((s) => s.seatId);
}
