// Kural testlerinin ortak yardımcıları: sırası belli rastgelelik, rolleri sabit oyun kurma,
// komut üretme ve adım ilerletme. Saat sabittir; testler ağ ve depo kullanmaz (NFR12.3).
import { expect } from 'vitest';
import { dealRoles, decide, defaultSettings } from '../../../src/rules/index.ts';
import type {
  Decision,
  GameSettings,
  GameState,
  RandomSource,
  RuleActor,
  RuleCommand,
  RuleCommandName,
} from '../../../src/rules/types.ts';

export const NOW = 1_000_000;

/** Verilen değerleri sırayla döndüren rastgelelik kaynağı (her değer maxExclusive ile sınırlanır). */
export function seqRandom(values: number[]): RandomSource {
  let index = 0;
  return {
    nextInt(maxExclusive: number) {
      const value = values[index % values.length] ?? 0;
      index += 1;
      return value % maxExclusive;
    },
  };
}

export const zeroRandom = seqRandom([0]);

export const moderator: RuleActor = { kind: 'moderator' };
export const system: RuleActor = { kind: 'system' };
export const seat = (seatId: string): RuleActor => ({ kind: 'seat', seatId });

export function cmd(
  name: RuleCommandName,
  actor: RuleActor,
  args: Record<string, unknown> = {},
): RuleCommand {
  return { name, actor, args };
}

/**
 * Rolleri dizgeyle belirlenmiş oyun kurar: 'g' gulyabani, 'v' köylü. Koltuklar s1, s2, … sırasıyla.
 * Dağıtım dealRoles ile yapılır, ardından roller test için sabitlenir.
 */
export function newGame(roles: string, settings: Partial<GameSettings> = {}): GameState {
  const participants = [...roles].map((_, index) => ({
    participantId: `p${index + 1}`,
    nick: `Bot${index + 1}`,
  }));
  const { state } = dealRoles(
    { gameId: 'g1', participants, settings: { ...defaultSettings(), ...settings }, now: NOW },
    zeroRandom,
  );
  const seats = state.seats.map((s, index) => ({
    ...s,
    roleId: roles[index] === 'g' ? ('ghul' as const) : ('villager' as const),
  }));
  return { ...state, seats, ghulCount: [...roles].filter((r) => r === 'g').length };
}

export function run(state: GameState, command: RuleCommand, now = NOW, paused = false): Decision {
  return decide(state, command, { now, random: zeroRandom, paused });
}

export function ok(decision: Decision): GameState {
  if (!decision.ok) throw new Error(`beklenmeyen ret: ${decision.reasonCode}`);
  return decision.state;
}

export function rejected(decision: Decision, reasonCode: string): void {
  expect(decision).toEqual({ ok: false, reasonCode });
}

export function next(state: GameState, now = NOW): GameState {
  return ok(run(state, cmd('game.nextStep', moderator, { stepVersion: state.stepVersion }), now));
}

/** İlk gecede kart görme → tanışma → kurban adımına ilerler. */
export function toGhulKill(state: GameState): GameState {
  return next(next(state));
}

/** Yaşayan bütün gulyabaniler aynı hedefi işaretler ve onaylar. */
export function ghulsKill(state: GameState, targetSeatId: string): GameState {
  let current = state;
  const ghuls = current.seats.filter((s) => s.alive && s.roleId === 'ghul');
  for (const ghul of ghuls) {
    current = ok(run(current, cmd('game.ghulMark', seat(ghul.seatId), { targetSeatId })));
  }
  return ok(run(current, cmd('game.ghulConfirm', seat(ghuls[0]!.seatId))));
}

/** Kurban adımından sabaha geçer ve sonucu açıklar (gündüze ya da oyun sonuna). */
export function morningReveal(state: GameState, now = NOW): GameState {
  const morning = next(state, now);
  return ok(
    run(morning, cmd('game.revealResult', moderator, { stepVersion: morning.stepVersion }), now),
  );
}

export function moveToVote(state: GameState): GameState {
  return ok(run(state, cmd('game.moveToVote', moderator, { stepVersion: state.stepVersion })));
}

export function voteAll(state: GameState, votes: Record<string, string | null>): GameState {
  let current = state;
  for (const [voter, target] of Object.entries(votes)) {
    current = ok(run(current, cmd('game.vote', seat(voter), { targetSeatId: target })));
  }
  return current;
}

export function deadline(state: GameState, now?: number): Decision {
  const endsAt = state.deadline?.endsAt ?? 0;
  return run(
    state,
    cmd('system.deadlineReached', system, { stepVersion: state.stepVersion, endsAt }),
    now ?? endsAt,
  );
}

export function alive(state: GameState, seatId: string): boolean {
  return state.seats.find((s) => s.seatId === seatId)?.alive ?? false;
}
