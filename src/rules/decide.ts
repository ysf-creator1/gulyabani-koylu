// C3 decide: bir komutu doğrular ve yeni durumu hesaplar. Geçersiz komut durumu değiştirmez ve
// neden kodu döner (AC13.5.1, BR10.1). Saat ve rastgelelik ctx'ten gelir.
import { reject } from './common.ts';
import { isAllowedWhilePaused } from './legalActions.ts';
import { revealResult } from './morning.ts';
import { cardSeen, ghulConfirm, ghulMark, ghulTimeout, nightNextStep } from './night.ts';
import type { Decision, GameState, RuleCommand, RulesContext } from './types.ts';
import {
  castVote,
  closeVoting,
  confirmTimeout,
  dayTimeout,
  lastWordsTimeout,
  moveToVote,
} from './voting.ts';

const MODERATOR_COMMANDS = new Set(['game.nextStep', 'game.revealResult', 'game.moveToVote']);

/** Moderatörün ilerletme komutları (BR2.2, BR10.7, Faz Bitirme Tablosu). */
function moderatorStep(state: GameState, command: RuleCommand, now: number): Decision {
  if (command.args.stepVersion !== state.stepVersion) return reject('phase_closed');
  switch (command.name) {
    case 'game.revealResult':
      return state.phase === 'morning' ? revealResult(state, now) : reject('phase_closed');
    case 'game.moveToVote':
      return state.phase === 'day' ? moveToVote(state, now) : reject('phase_closed');
    default:
      return nextStep(state, now);
  }
}

function nextStep(state: GameState, now: number): Decision {
  switch (state.phase) {
    case 'first_night':
    case 'night':
      return nightNextStep(state, now);
    case 'voting':
      return closeVoting(state, now);
    case 'last_words':
      // Moderatör son sözü erken bitirebilir; savunma yoksa boşa beklenmez (sahip geri bildirimi)
      return lastWordsTimeout(state, now);
    case 'confirm_vote':
      return reject('step_waiting');
    default:
      return reject('phase_closed');
  }
}

/** Süre dolması (BR10.6): eski adım sürümü ya da değişmiş bitiş zamanı hiçbir şey değiştirmez. */
function deadlineReached(state: GameState, command: RuleCommand, ctx: RulesContext): Decision {
  const { stepVersion, endsAt } = command.args;
  if (stepVersion !== state.stepVersion || !state.deadline || state.deadline.endsAt !== endsAt) {
    return reject('phase_closed');
  }
  switch (state.phase) {
    case 'first_night':
    case 'night':
      return state.stepCursor === 'ghul_kill' ? ghulTimeout(state, ctx) : reject('phase_closed');
    case 'day':
      return dayTimeout(state);
    case 'last_words':
      return lastWordsTimeout(state, ctx.now);
    case 'confirm_vote':
      return confirmTimeout(state, ctx.now);
    default:
      return reject('phase_closed');
  }
}

function seatCommand(state: GameState, command: RuleCommand, seatId: string): Decision {
  switch (command.name) {
    case 'game.cardSeen':
      return cardSeen(state, seatId);
    case 'game.ghulMark':
      return ghulMark(state, seatId, command.args.targetSeatId);
    case 'game.ghulConfirm':
      return ghulConfirm(state, seatId);
    case 'game.vote':
      return castVote(state, seatId, command.args.targetSeatId);
    default:
      // game.nightSelect U1'de hiçbir adımda beklenmez (BR4.9)
      return reject('not_your_turn');
  }
}

export function decide(state: GameState, command: RuleCommand, ctx: RulesContext): Decision {
  const { actor } = command;
  if (command.name === 'system.deadlineReached') {
    if (actor.kind !== 'system') return reject('not_your_turn');
    if (ctx.paused) return reject('game_paused');
    return deadlineReached(state, command, ctx);
  }
  if (MODERATOR_COMMANDS.has(command.name)) {
    if (actor.kind !== 'moderator') return reject('not_moderator');
    if (ctx.paused) return reject('game_paused');
    return moderatorStep(state, command, ctx.now);
  }
  if (ctx.paused && !isAllowedWhilePaused(command.name)) return reject('game_paused');
  if (actor.kind !== 'seat') return reject('not_your_turn');
  return seatCommand(state, command, actor.seatId);
}
