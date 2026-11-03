// Gece kuralları (BR3.3, BR4.1–BR4.9): kart görme, tanışma, ortak kurban kararı, sabaha geçiş.
import {
  accept,
  changeStep,
  deadlineIn,
  findSeat,
  isLivingGhul,
  leadersOf,
  livingGhuls,
  phaseEvent,
  reject,
} from './common.ts';
import type { Decision, GameState, RulesContext } from './types.ts';

/** Geceye giriş — gündüzden geceye giden bütün yollar bunu çağırır (NFR5.7). */
export function enterNight(state: GameState, now: number): GameState {
  return changeStep(
    state,
    {
      phase: 'night',
      nightNumber: state.nightNumber + 1,
      stepCursor: 'ghul_kill',
      stepStatus: 'waiting',
      deadline: deadlineIn(now, state.settings.ghulDecisionSeconds),
      ghulMarks: {},
      votes: [],
      voteRound: null,
      tiedSeatIds: null,
      accusedSeatId: null,
      pendingDeaths: [],
      morningResult: null,
      dayTimerExpired: false,
    },
    now,
  );
}

function isNight(state: GameState): boolean {
  return state.phase === 'first_night' || state.phase === 'night';
}

function enterGhulKill(state: GameState, now: number): GameState {
  return changeStep(
    state,
    {
      stepCursor: 'ghul_kill',
      stepStatus: 'waiting',
      deadline: deadlineIn(now, state.settings.ghulDecisionSeconds),
      ghulMarks: {},
    },
    now,
  );
}

/** Gecenin sonu: sabah fazı; gece olay günlüğüne kayıt düşülür. */
function enterMorning(state: GameState, now: number): GameState {
  const victim = state.pendingDeaths[0];
  const logEntry = victim
    ? { nightNumber: state.nightNumber, textKey: 'log.ghulKill', seatId: victim }
    : { nightNumber: state.nightNumber, textKey: 'log.noKill' };
  return changeStep(
    state,
    {
      phase: 'morning',
      stepCursor: null,
      stepStatus: null,
      deadline: null,
      ghulMarks: {},
      morningResult: null,
      nightLog: [...state.nightLog, logEntry],
    },
    now,
  );
}

/** Gece fazında "Sonraki Adım" (Faz Bitirme Tablosu). */
export function nightNextStep(state: GameState, now: number): Decision {
  if (state.stepCursor === 'card_reveal') {
    return accept(changeStep(state, { stepCursor: 'ghul_meet', stepStatus: null }, now), [
      phaseEvent(state.phase, 'ghul_meet'),
    ]);
  }
  if (state.stepCursor === 'ghul_meet') {
    if (state.settings.noKillFirstNight) {
      return accept(enterMorning({ ...state, pendingDeaths: [] }, now), [phaseEvent('morning')]);
    }
    return accept(enterGhulKill(state, now), [phaseEvent(state.phase, 'ghul_kill')]);
  }
  if (state.stepStatus === 'done' || state.stepStatus === 'timed_out') {
    return accept(enterMorning(state, now), [phaseEvent('morning')]);
  }
  return reject('step_waiting');
}

export function cardSeen(state: GameState, seatId: string): Decision {
  if (state.phase !== 'first_night' || state.stepCursor !== 'card_reveal')
    return reject('phase_closed');
  const seat = findSeat(state, seatId);
  if (!seat) return reject('not_your_turn');
  const seats = state.seats.map((s) => (s.seatId === seatId ? { ...s, cardSeen: true } : s));
  return accept({ ...state, seats }, [{ type: 'card.seen', payload: { seatId } }]);
}

function ghulStepOpen(state: GameState): boolean {
  return isNight(state) && state.stepCursor === 'ghul_kill' && state.stepStatus === 'waiting';
}

export function ghulMark(state: GameState, seatId: string, targetSeatId: unknown): Decision {
  if (!isLivingGhul(state, seatId)) return reject('not_your_turn');
  if (!ghulStepOpen(state)) return reject('phase_closed');
  const target = typeof targetSeatId === 'string' ? findSeat(state, targetSeatId) : undefined;
  if (!target || !target.alive || target.roleId === 'ghul') return reject('invalid_target');
  const next: GameState = {
    ...state,
    ghulMarks: { ...state.ghulMarks, [seatId]: target.seatId },
    nightActions: [
      ...state.nightActions,
      {
        nightNumber: state.nightNumber,
        step: 'ghul_mark',
        actorSeatId: seatId,
        targetSeatId: target.seatId,
        timedOut: false,
      },
    ],
  };
  return accept(next, [{ type: 'night.actionTaken', payload: { step: 'ghul_mark' } }]);
}

function lockDecision(state: GameState, target: string | null, timedOut: boolean): GameState {
  return {
    ...state,
    pendingDeaths: target ? [target] : [],
    stepStatus: timedOut ? 'timed_out' : 'done',
    deadline: null,
    nightActions: [
      ...state.nightActions,
      { nightNumber: state.nightNumber, step: 'ghul_decision', targetSeatId: target, timedOut },
    ],
  };
}

/** Oybirliğiyle onay (BR4.5). */
export function ghulConfirm(state: GameState, seatId: string): Decision {
  if (!isLivingGhul(state, seatId)) return reject('not_your_turn');
  if (!ghulStepOpen(state)) return reject('phase_closed');
  const targets = livingGhuls(state).map((g) => state.ghulMarks[g.seatId]);
  const first = targets[0];
  if (!first || targets.some((t) => t !== first)) return reject('invalid_target');
  return accept(lockDecision(state, first, false), [
    { type: 'night.actionTaken', payload: { step: 'ghul_decision', timedOut: false } },
  ]);
}

/** Süre dolunca karar (BR4.6): çoğunluk; eşitlikte ayara göre rastgele ya da kimse. */
export function ghulTimeout(state: GameState, ctx: RulesContext): Decision {
  if (state.stepStatus !== 'waiting') return reject('phase_closed');
  const counts = new Map<string, number>();
  for (const ghul of livingGhuls(state)) {
    const target = state.ghulMarks[ghul.seatId];
    if (target) counts.set(target, (counts.get(target) ?? 0) + 1);
  }
  const leaders = leadersOf(state, counts);
  let target: string | null = null;
  if (leaders.length === 1) target = leaders[0] as string;
  else if (leaders.length > 1 && state.settings.ghulTieRule === 'random') {
    target = leaders[ctx.random.nextInt(leaders.length)] as string;
  }
  return accept(lockDecision(state, target, true), [
    { type: 'night.actionTaken', payload: { step: 'ghul_decision', timedOut: true } },
  ]);
}
