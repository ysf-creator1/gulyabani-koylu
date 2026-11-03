// C3 — Kural arayüzünün türleri (GameRules). Yalnızca türler; davranış yoktur.
// Kural modülü saftır: saat (`now`) ve rastgelelik (`random`) dışarıdan verilir (NFR12, NFR15).
import type {
  ActionKind,
  Phase,
  RoleId,
  Side,
  StepCursor,
  StepStatus,
  VoteRound,
} from '../shared/domain.ts';
import type { ReasonCode } from '../shared/reasonCodes.ts';
import type { NightLogEntry } from '../shared/view.ts';

/** Odanın oyun ayarları (entities RoomSettings); oyun başında kopyalanır, oyun boyunca değişmez. */
export interface GameSettings {
  daySeconds: number;
  lastWordsSeconds: number;
  confirmVoteSeconds: number;
  ghulDecisionSeconds: number;
  noKillFirstNight: boolean;
  ghulTieRule: 'random' | 'none';
  voteTieRule: 'revote' | 'youngest';
  liveVotes: boolean;
  abstainAllowed: boolean;
  earlyEnd: boolean;
}

export interface Seat {
  seatId: string;
  participantId: string;
  nick: string;
  roleId: RoleId;
  alive: boolean;
  deathCause?: 'night_kill' | 'execution';
  cardSeen: boolean;
  revealed: boolean;
}

/** Bir adımın sunucu saatine göre bitiş zamanı (FR14.8). */
export interface Deadline {
  endsAt: number;
  totalSeconds: number;
}

export interface Vote {
  voterSeatId: string;
  targetSeatId: string | null;
}

export interface NightAction {
  nightNumber: number;
  step: 'ghul_mark' | 'ghul_decision';
  actorSeatId?: string;
  targetSeatId: string | null;
  timedOut: boolean;
}

export interface DeathRecord {
  seatId: string;
  cause: 'night_kill' | 'execution';
  phase: 'night' | 'day';
  chainOrder: number;
  revealedRoleId: RoleId;
}

export interface GameState {
  gameId: string;
  phase: Phase;
  nightNumber: number;
  dayNumber: number;
  stepCursor: StepCursor | null;
  stepStatus: StepStatus | null;
  /** Faz ya da adım her değiştiğinde +1 (BR10.7). */
  stepVersion: number;
  lastStepChangeAt: number;
  dayTimerExpired: boolean;
  settings: GameSettings;
  ghulCount: number;
  seats: Seat[];
  /** Gulyabani adımında koltuk → hedef işaretleri (BR4.5). */
  ghulMarks: Record<string, string>;
  nightActions: NightAction[];
  votes: Vote[];
  voteRound: VoteRound | null;
  revoteCount: number;
  tiedSeatIds: string[] | null;
  accusedSeatId: string | null;
  pendingDeaths: string[];
  morningResult: { deadSeatIds: string[] } | null;
  deaths: DeathRecord[];
  winners: Side | null;
  nightLog: NightLogEntry[];
  deadline: Deadline | null;
}

/** Komutun aktörü: koltuk, moderatör ya da sistem (C3'e ekleme: `system`). */
export type RuleActor =
  { kind: 'seat'; seatId: string } | { kind: 'moderator' } | { kind: 'system' };

export type RuleCommandName =
  | 'game.cardSeen'
  | 'game.nightSelect'
  | 'game.ghulMark'
  | 'game.ghulConfirm'
  | 'game.nextStep'
  | 'game.revealResult'
  | 'game.moveToVote'
  | 'game.vote'
  | 'system.deadlineReached';

export interface RuleCommand {
  name: RuleCommandName;
  actor: RuleActor;
  args: Record<string, unknown>;
}

/** Kriptografik kaynaktan beslenen rastgelelik; testlerde sırası belli kaynak verilir. */
export interface RandomSource {
  nextInt(maxExclusive: number): number;
}

export interface RulesContext {
  now: number;
  random: RandomSource;
  /** Oyun duraklatılmışsa yalnızca izinli komutlar geçer (BR10.8). */
  paused?: boolean;
}

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
}

export type Decision =
  { ok: true; state: GameState; events: DomainEvent[] } | { ok: false; reasonCode: ReasonCode };

export interface LegalAction {
  kind: ActionKind;
  targets: string[];
  deadline?: number;
}

export interface DealInput {
  gameId: string;
  participants: { participantId: string; nick: string }[];
  settings: GameSettings;
  now: number;
}

export interface DealResult {
  state: GameState;
  events: DomainEvent[];
}
