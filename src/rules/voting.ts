// Gündüz ve oylama (BR6.2, BR6.5–BR6.9, BR6.11).
import {
  accept,
  changeStep,
  deadlineIn,
  findSeat,
  leadersOf,
  phaseEvent,
  reject,
} from './common.ts';
import { applyDeaths, endIfWinner } from './morning.ts';
import { enterNight } from './night.ts';
import type { Decision, DomainEvent, GameState } from './types.ts';

export function moveToVote(state: GameState, now: number): Decision {
  const voting = changeStep(
    state,
    {
      phase: 'voting',
      voteRound: 'initial',
      votes: [],
      tiedSeatIds: null,
      accusedSeatId: null,
      deadline: null,
    },
    now,
  );
  return accept(voting, [phaseEvent('voting')]);
}

/** Gündüz süresi dolunca yalnızca hatırlatma (BR6.2). */
export function dayTimeout(state: GameState): Decision {
  if (state.dayTimerExpired) return reject('phase_closed');
  return accept({ ...state, dayTimerExpired: true });
}

export function castVote(state: GameState, voterSeatId: string, targetSeatId: unknown): Decision {
  if (state.phase !== 'voting' && state.phase !== 'confirm_vote') return reject('phase_closed');
  const voter = findSeat(state, voterSeatId);
  if (!voter || !voter.alive) return reject('not_your_turn');
  if (targetSeatId === null) {
    if (!state.settings.abstainAllowed) return reject('invalid_target');
  } else {
    const target = typeof targetSeatId === 'string' ? findSeat(state, targetSeatId) : undefined;
    if (!target || !target.alive || target.seatId === voterSeatId) return reject('invalid_target');
    if (state.tiedSeatIds && !state.tiedSeatIds.includes(target.seatId))
      return reject('invalid_target');
  }
  const votes = [
    ...state.votes.filter((v) => v.voterSeatId !== voterSeatId),
    { voterSeatId, targetSeatId: (targetSeatId as string | null) ?? null },
  ];
  return accept({ ...state, votes }, [{ type: 'vote.cast', payload: { voterSeatId } }]);
}

function tally(state: GameState): string[] {
  const counts = new Map<string, number>();
  for (const vote of state.votes) {
    if (vote.targetSeatId) counts.set(vote.targetSeatId, (counts.get(vote.targetSeatId) ?? 0) + 1);
  }
  return leadersOf(state, counts);
}

/** Gün infazsız biter → gece (BR6.6, BR6.7). */
function noExecution(state: GameState, now: number): Decision {
  const logged = {
    ...state,
    nightLog: [...state.nightLog, { nightNumber: state.dayNumber, textKey: 'log.noExecution' }],
  };
  return accept(enterNight(logged, now), [phaseEvent('night', 'ghul_kill')]);
}

function startLastWords(
  state: GameState,
  accusedSeatId: string,
  now: number,
  patch: Partial<GameState> = {},
): Decision {
  const lastWords = changeStep(
    state,
    {
      ...patch,
      phase: 'last_words',
      accusedSeatId,
      deadline: deadlineIn(now, state.settings.lastWordsSeconds),
    },
    now,
  );
  return accept(lastWords, [phaseEvent('last_words')]);
}

/**
 * Eşitlik kuralı (BR6.7): revoteCount yalnızca yeni turu açan bu kuralda ve bir kez artar.
 * Kapanan tur bir eşitlik yeniden oylamasıysa ya da hak dolduysa infaz yoktur.
 */
function resolveTie(state: GameState, tied: string[], now: number): Decision {
  const canRevote =
    state.settings.voteTieRule === 'revote' &&
    state.revoteCount < 2 &&
    state.voteRound !== 'revote';
  if (!canRevote) return noExecution(state, now);
  const revote = changeStep(
    state,
    {
      phase: 'voting',
      voteRound: 'revote',
      revoteCount: state.revoteCount + 1,
      tiedSeatIds: tied,
      votes: [],
      accusedSeatId: null,
      deadline: null,
    },
    now,
  );
  return accept(revote, [phaseEvent('voting')]);
}

/** "Oylamayı kapat" (BR6.11 → BR6.6 / BR6.7). */
export function closeVoting(state: GameState, now: number): Decision {
  const leaders = tally(state);
  if (leaders.length === 0) return noExecution(state, now);
  if (leaders.length === 1) return startLastWords(state, leaders[0] as string, now);
  return resolveTie(state, leaders, now);
}

/** Son söz süresi doldu → onay oylaması (BR6.8); oylar korunur. */
export function lastWordsTimeout(state: GameState, now: number): Decision {
  const confirm = changeStep(
    state,
    {
      phase: 'confirm_vote',
      voteRound: 'confirm',
      deadline: deadlineIn(now, state.settings.confirmVoteSeconds),
    },
    now,
  );
  return accept(confirm, [phaseEvent('confirm_vote')]);
}

/** İnfaz (BR6.9): kart açılır, zincir işler; kazanan yoksa gece. */
function execute(state: GameState, seatId: string, now: number): Decision {
  const chain = applyDeaths(state, [seatId], 'execution');
  const logged: GameState = {
    ...chain.state,
    nightLog: [
      ...chain.state.nightLog,
      { nightNumber: state.dayNumber, textKey: 'log.execution', seatId },
    ],
  };
  const ended = endIfWinner(logged, chain.events, now);
  if (ended) return ended;
  const events: DomainEvent[] = [...chain.events, phaseEvent('night', 'ghul_kill')];
  return accept(enterNight(logged, now), events);
}

/** Onay oylamasının sonu (BR6.8). */
export function confirmTimeout(state: GameState, now: number): Decision {
  const leaders = tally(state);
  const accused = state.accusedSeatId;
  if (leaders.length === 1 && leaders[0] === accused) return execute(state, accused, now);
  if (leaders.length === 1 && state.revoteCount < 2) {
    return startLastWords(state, leaders[0] as string, now, {
      revoteCount: state.revoteCount + 1,
      voteRound: 'confirm',
    });
  }
  if (leaders.length > 1) return resolveTie(state, leaders, now);
  return noExecution(state, now);
}
