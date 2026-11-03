// MatchFlow: oyun komutlarını kural motoruna iletir, süreleri (uzatma, duraklatma) ve
// moderatörün kopmasını yönetir, oyun kaydını sürüm numarasıyla yazar (Faz Bitirme Tablosu,
// BR6.3, BR8.2, BR8.3, BR10.6–BR10.8, FR14.8).
import { decide } from '../../rules/index.ts';
import type { RuleActor, RuleCommandName } from '../../rules/types.ts';
import { DROPPED, rejectWith, type Actor, type CommandContext, type Outcome } from '../commands.ts';
import {
  isModerator,
  rememberCommand,
  seatOf,
  type MatchRecord,
  type RoomAggregate,
} from '../model.ts';
import { updateMatch } from '../store/repos/matchRepo.ts';

export const RULE_COMMANDS: ReadonlySet<string> = new Set<RuleCommandName>([
  'game.cardSeen',
  'game.nightSelect',
  'game.ghulMark',
  'game.ghulConfirm',
  'game.nextStep',
  'game.revealResult',
  'game.moveToVote',
  'game.vote',
]);

/** Yeni oyun kaydını sürüm +1 ve komut numarasıyla birlikte yazar (C9 write-rule). */
function commitMatch(
  agg: RoomAggregate,
  match: MatchRecord,
  commandId: string | null,
  now: number,
): Outcome {
  const old = agg.match as MatchRecord;
  const ended = match.state.phase === 'ended';
  const next: MatchRecord = {
    ...match,
    status: ended ? 'ended' : 'running',
    endedAt: ended ? (match.endedAt ?? now) : null,
    persistedVersion: old.persistedVersion + 1,
    processedCommandIds: commandId
      ? rememberCommand(old.processedCommandIds, commandId)
      : old.processedCommandIds,
  };
  return {
    status: 'accepted',
    next: { ...agg, match: next },
    ops: [updateMatch(next, old.persistedVersion, now)],
    stepChanged: next.state.stepVersion !== old.state.stepVersion || next.paused !== old.paused,
  };
}

function runningMatch(agg: RoomAggregate): MatchRecord | null {
  if (!agg.match || !agg.room.currentMatchId || agg.match.status !== 'running') return null;
  return agg.match;
}

function ruleActor(agg: RoomAggregate, actor: Actor): RuleActor | null {
  if (!actor.participantId) return null;
  if (isModerator(agg, actor.participantId)) return { kind: 'moderator' };
  const seat = seatOf(agg, actor.participantId);
  return seat ? { kind: 'seat', seatId: seat.seatId } : null;
}

function applyRule(
  agg: RoomAggregate,
  match: MatchRecord,
  actor: Actor,
  command: { name: string; args: Record<string, unknown>; commandId: string },
  ctx: CommandContext,
): Outcome {
  const resolved = ruleActor(agg, actor);
  const moderatorCommand = ['game.nextStep', 'game.revealResult', 'game.moveToVote'].includes(
    command.name,
  );
  if (!resolved) return rejectWith(moderatorCommand ? 'not_moderator' : 'not_your_turn');
  const decision = decide(
    match.state,
    { name: command.name as RuleCommandName, actor: resolved, args: command.args },
    { now: ctx.now, random: ctx.random, paused: match.paused },
  );
  if (!decision.ok) return rejectWith(decision.reasonCode);
  return commitMatch(agg, { ...match, state: decision.state }, command.commandId, ctx.now);
}

/** Süre uzatma (BR6.3): bütün oyuncuların geri sayımı aynı anda değişir. */
function extendTimer(
  agg: RoomAggregate,
  match: MatchRecord,
  seconds: number,
  commandId: string,
  now: number,
): Outcome {
  const { deadline } = match.state;
  if (!deadline) return rejectWith('phase_closed');
  const ms = seconds * 1000;
  const state = {
    ...match.state,
    dayTimerExpired: false,
    deadline: match.paused
      ? { ...deadline, totalSeconds: deadline.totalSeconds + seconds }
      : {
          endsAt: Math.max(deadline.endsAt, now) + ms,
          totalSeconds: deadline.totalSeconds + seconds,
        },
  };
  const remainingOnPause =
    match.paused && match.remainingOnPause !== null
      ? match.remainingOnPause + ms
      : match.remainingOnPause;
  return commitMatch(agg, { ...match, state, remainingOnPause }, commandId, now);
}

function pauseMatch(
  agg: RoomAggregate,
  match: MatchRecord,
  commandId: string,
  now: number,
): Outcome {
  if (match.paused) return rejectWith('phase_closed');
  const remaining = match.state.deadline ? Math.max(0, match.state.deadline.endsAt - now) : null;
  return commitMatch(
    agg,
    { ...match, paused: true, pauseReason: 'moderator', remainingOnPause: remaining },
    commandId,
    now,
  );
}

function resumeDeadline(match: MatchRecord, now: number) {
  const { deadline } = match.state;
  if (!deadline || match.remainingOnPause === null) return deadline;
  return { ...deadline, endsAt: now + match.remainingOnPause };
}

/** Devam (BR8.3): yalnızca elle duraklatılmış oyun; moderatör kopukken gelemez. */
function resumeMatch(
  agg: RoomAggregate,
  match: MatchRecord,
  commandId: string,
  now: number,
): Outcome {
  if (!match.paused) return rejectWith('phase_closed');
  if (match.pauseReason === 'moderator_lost') return rejectWith('game_paused');
  const state = { ...match.state, deadline: resumeDeadline(match, now) };
  return commitMatch(
    agg,
    { ...match, state, paused: false, pauseReason: null, remainingOnPause: null },
    commandId,
    now,
  );
}

/** game.* komutları (Komut Yönlendirme Tablosu). Biten oyunun geç komutları phase_closed alır (BR7.3). */
export function handleGameCommand(
  agg: RoomAggregate,
  actor: Actor,
  command: { name: string; args: Record<string, unknown>; commandId: string },
  ctx: CommandContext,
): Outcome {
  const match = runningMatch(agg);
  if (!match) return rejectWith('phase_closed');
  if (RULE_COMMANDS.has(command.name)) return applyRule(agg, match, actor, command, ctx);
  if (!actor.participantId || !isModerator(agg, actor.participantId))
    return rejectWith('not_moderator');
  switch (command.name) {
    case 'game.timerExtend':
      return extendTimer(agg, match, Number(command.args.seconds), command.commandId, ctx.now);
    case 'game.pause':
      return pauseMatch(agg, match, command.commandId, ctx.now);
    case 'game.resume':
      return resumeMatch(agg, match, command.commandId, ctx.now);
    default:
      return rejectWith('not_your_turn');
  }
}

export interface DeadlineArgs {
  matchId: string;
  stepVersion: number;
  endsAt: number;
}

export function deadlineCommandId(args: DeadlineArgs): string {
  return `deadline:${args.matchId}:${args.stepVersion}:${args.endsAt}`;
}

/**
 * system.deadlineReached (BR10.6): kural motoruna actor = system ile girer. Eski adım sürümü ya
 * da değişmiş bitiş zamanı durum değiştirmez; komut sessizce düşer.
 */
export function handleDeadline(
  agg: RoomAggregate,
  args: DeadlineArgs,
  ctx: CommandContext,
): Outcome {
  const match = runningMatch(agg);
  if (!match || match.matchId !== args.matchId || match.paused) return DROPPED;
  const decision = decide(
    match.state,
    {
      name: 'system.deadlineReached',
      actor: { kind: 'system' },
      args: { stepVersion: args.stepVersion, endsAt: args.endsAt },
    },
    { now: ctx.now, random: ctx.random, paused: false },
  );
  if (!decision.ok) return DROPPED;
  return commitMatch(agg, { ...match, state: decision.state }, deadlineCommandId(args), ctx.now);
}

/**
 * Moderatörün bağlantı olayları (BR8.2, BR8.3). Kopunca oyun ve sayaçlar duraklar; kalan süre
 * moderatörden son ses alınan andan (ya da sonraki adım değişiminden) hesaplanır.
 */
export function handleModeratorConnection(
  agg: RoomAggregate,
  input: { kind: 'lost' | 'restored'; lastSeenAt: number; commandId: string },
  ctx: CommandContext,
): Outcome {
  const match = runningMatch(agg);
  if (!match) return DROPPED;
  if (input.kind === 'lost') {
    if (!match.moderatorConnected) return DROPPED;
    if (match.paused)
      return commitMatch(agg, { ...match, moderatorConnected: false }, input.commandId, ctx.now);
    const pausedAt = Math.max(input.lastSeenAt, match.state.lastStepChangeAt);
    const remaining = match.state.deadline
      ? Math.max(0, match.state.deadline.endsAt - pausedAt)
      : null;
    return commitMatch(
      agg,
      {
        ...match,
        moderatorConnected: false,
        paused: true,
        pauseReason: 'moderator_lost',
        remainingOnPause: remaining,
      },
      input.commandId,
      ctx.now,
    );
  }
  if (match.moderatorConnected) return DROPPED;
  if (match.pauseReason !== 'moderator_lost') {
    return commitMatch(agg, { ...match, moderatorConnected: true }, input.commandId, ctx.now);
  }
  const state = { ...match.state, deadline: resumeDeadline(match, ctx.now) };
  return commitMatch(
    agg,
    {
      ...match,
      state,
      moderatorConnected: true,
      paused: false,
      pauseReason: null,
      remainingOnPause: null,
    },
    input.commandId,
    ctx.now,
  );
}

/** Odanın bir sonraki süre komutu; duraklatılmışken ve süre bitmiş hatırlatmada yoktur. */
export function nextDeadline(agg: RoomAggregate): DeadlineArgs | null {
  const match = runningMatch(agg);
  if (!match || match.paused || !match.state.deadline) return null;
  if (match.state.phase === 'day' && match.state.dayTimerExpired) return null;
  return {
    matchId: match.matchId,
    stepVersion: match.state.stepVersion,
    endsAt: match.state.deadline.endsAt,
  };
}

/** Oyun başına tek zamanlayıcı: en yakın bitiş zamanına kurulur; açılışta geçmiş süre hemen işler. */
export class DeadlineScheduler {
  private readonly timers = new Map<string, { key: string; timer: NodeJS.Timeout }>();
  private readonly fire: (roomCode: string, args: DeadlineArgs) => void;
  private readonly clock: () => number;

  constructor(
    fire: (roomCode: string, args: DeadlineArgs) => void,
    clock: () => number = Date.now,
  ) {
    this.fire = fire;
    this.clock = clock;
  }

  sync(roomCode: string, agg: RoomAggregate | null): void {
    const args = agg ? nextDeadline(agg) : null;
    const current = this.timers.get(roomCode);
    const key = args ? deadlineCommandId(args) : '';
    if (current && current.key === key) return;
    if (current) clearTimeout(current.timer);
    this.timers.delete(roomCode);
    if (!args) return;
    const delay = Math.min(Math.max(0, args.endsAt - this.clock()), 24 * 60 * 60 * 1000);
    const timer = setTimeout(() => {
      this.timers.delete(roomCode);
      this.fire(roomCode, args);
    }, delay);
    timer.unref?.();
    this.timers.set(roomCode, { key, timer });
  }

  cancelAll(): void {
    for (const { timer } of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  size(): number {
    return this.timers.size;
  }
}
