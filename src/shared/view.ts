// C5 — Alıcıya özel görünüm (RecipientView). Görmeye hakkı olmadığı alan görünümde hiç yer
// almaz (anahtar olarak da yoktur); bu yüzden "gizli" alanların hepsi isteğe bağlıdır.
// U1 eklemeleri (yalnızca ekleme): moderator.stepVersion, game.myAction.deadline isteğe bağlı,
// game.pauseReason, game.remainingMs (duraklatılmışken kalan süre), room.expiresAt.
import type {
  ActionKind,
  ChatChannel,
  PauseReason,
  Phase,
  RoleId,
  RoomStatus,
  Side,
  StepCursor,
  StepStatus,
  VoteRound,
} from './domain.ts';
import type { ReasonCode } from './reasonCodes.ts';

export interface ViewMe {
  participantId: string;
  nick: string;
  kind: 'player' | 'moderator';
  seatId?: string;
  roleId?: RoleId;
  alive?: boolean;
}

export interface ViewRoom {
  roomCode: string;
  link: string;
  status: RoomStatus;
  moderatorNick: string;
  participants: { participantId: string; nick: string }[];
  openRoleIds: RoleId[];
  expiresAt: number;
  startBlock?: { reasonCode?: ReasonCode; warnings: string[] };
}

export interface ViewSeat {
  seatId: string;
  nick: string;
  alive: boolean;
  revealedRoleId?: RoleId;
  roleId?: RoleId;
}

export interface ViewAction {
  kind: ActionKind;
  targets: string[];
  deadline?: number;
}

export interface NightLogEntry {
  nightNumber: number;
  textKey: string;
  seatId?: string;
}

export interface ViewGame {
  phase: Phase;
  nightNumber: number;
  dayNumber: number;
  deadline?: number;
  remainingMs?: number;
  paused: boolean;
  pauseReason?: PauseReason;
  seats: ViewSeat[];
  myAction?: ViewAction;
  ghulMarks?: { bySeatId: string; targetSeatId: string }[];
  ghulDecided?: boolean;
  votes?: { voterSeatId: string; targetSeatId: string | null }[];
  voteRound?: VoteRound;
  tiedSeatIds?: string[];
  accusedSeatId?: string;
  morningResult?: { deadSeatIds: string[] };
  winners?: { sides: Side[]; extraSeatIds: string[] };
  nightLog?: NightLogEntry[];
}

export interface ViewModerator {
  stepCursor?: StepCursor;
  stepVersion: number;
  announcementTextKey: string;
  announcementParams?: Record<string, string>;
  expectedAction: string;
  stepStatus?: StepStatus;
  allSeats: {
    seatId: string;
    nick: string;
    roleId: RoleId;
    alive: boolean;
    connected: boolean;
    cardSeen: boolean;
  }[];
  notices: { textKey: string; params?: Record<string, string> }[];
  pendingDeathSeatIds?: string[];
}

export interface ViewChatMessage {
  messageId: string;
  authorNick: string;
  text: string;
  sentAt: number;
}

export interface ViewChatChannel {
  channel: ChatChannel;
  canWrite: boolean;
  messages: ViewChatMessage[];
}

export interface RecipientView {
  me: ViewMe;
  room: ViewRoom;
  game?: ViewGame;
  moderator?: ViewModerator;
  chat: { channels: ViewChatChannel[] };
}
