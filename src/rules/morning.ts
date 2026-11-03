// Sabah, ölüm zinciri ve oyun sonu (BR5.1–BR5.3, BR6.9, BR7.1, BR7.2).
import { accept, changeStep, deadlineIn, findSeat, phaseEvent } from './common.ts';
import type { Decision, DomainEvent, GameState } from './types.ts';
import { checkWinner } from './win.ts';

type Cause = 'night_kill' | 'execution';

/**
 * Ölüm zinciri (BR5.2): kuyruktaki her ölüm işlenir; iskelette ölümün yeni ölüm doğuran etkisi
 * yoktur (U3 ekler). Kazanma kontrolü zincirin sonunda bir kez yapılır.
 */
export function applyDeaths(
  state: GameState,
  seatIds: string[],
  cause: Cause,
): { state: GameState; events: DomainEvent[] } {
  const queue = [...seatIds];
  let current = state;
  const events: DomainEvent[] = [];
  let chainOrder = 0;
  while (queue.length > 0) {
    const seatId = queue.shift() as string;
    const seat = findSeat(current, seatId);
    if (!seat || !seat.alive) continue;
    chainOrder += 1;
    current = {
      ...current,
      seats: current.seats.map((s) =>
        s.seatId === seatId ? { ...s, alive: false, revealed: true, deathCause: cause } : s,
      ),
      deaths: [
        ...current.deaths,
        {
          seatId,
          cause,
          phase: cause === 'night_kill' ? 'night' : 'day',
          chainOrder,
          revealedRoleId: seat.roleId,
        },
      ],
    };
    events.push({
      type: 'death.occurred',
      payload: { seatId, cause, chainOrder, revealedRoleId: seat.roleId },
    });
    // Ölümün etkileri (Celalli Damat, sevdalı, Dertli) U3'te bu noktada kuyruğa ekler.
  }
  return { state: current, events };
}

/** Kazanan belliyse oyunu bitirir; değilse null döner. */
export function endIfWinner(state: GameState, events: DomainEvent[], now: number): Decision | null {
  const winners = checkWinner(state);
  if (!winners) return null;
  const ended = changeStep(
    state,
    {
      phase: 'ended',
      winners,
      stepCursor: null,
      stepStatus: null,
      deadline: null,
      voteRound: null,
    },
    now,
  );
  return accept(ended, [
    ...events,
    phaseEvent('ended'),
    { type: 'match.ended', payload: { winners } },
  ]);
}

/** Gündüz başlangıcı (BR5.3, BR6.1). */
export function enterDay(state: GameState, now: number, deadSeatIds: string[]): GameState {
  return changeStep(
    state,
    {
      phase: 'day',
      dayNumber: state.dayNumber + 1,
      stepCursor: null,
      stepStatus: null,
      revoteCount: 0,
      dayTimerExpired: false,
      deadline: deadlineIn(now, state.settings.daySeconds),
      morningResult: { deadSeatIds },
      pendingDeaths: [],
      votes: [],
      voteRound: null,
      tiedSeatIds: null,
      accusedSeatId: null,
    },
    now,
  );
}

/** "Sonucu Açıkla" (BR5.1): ölenin kartı açılır, zincir işler, kazanan yoksa gündüz. */
export function revealResult(state: GameState, now: number): Decision {
  const deadSeatIds = [...state.pendingDeaths];
  const chain = applyDeaths(state, deadSeatIds, 'night_kill');
  const ended = endIfWinner({ ...chain.state, pendingDeaths: [] }, chain.events, now);
  if (ended) return ended;
  const day = enterDay(chain.state, now, deadSeatIds);
  return accept(day, [...chain.events, phaseEvent('day')]);
}
