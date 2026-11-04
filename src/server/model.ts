// Sunucunun bellek içi kayıtları (entities.md). Kayıtlar değişmez değerlerdir: her kabul edilen
// komut yeni bir RoomAggregate üretir; bellekteki gerçek durum ancak depoya yazım kesinleşince
// yenisiyle değiştirilir (önce kayıt sonra kabul, NFR5.1). Hiçbir kayıtta IP alanı yoktur (C9).
import type { ChatChannel, DeviceType, PauseReason, RoomStatus } from '../shared/domain.ts';
import type { GameSettings, GameState } from '../rules/types.ts';

export const ROOM_LIFETIME_MS = 24 * 60 * 60 * 1000;
export const PROCESSED_COMMANDS_KEPT = 500;
export const CHAT_MEMORY_PER_CHANNEL = 100;
export const CHAT_STORE_PER_CHANNEL = 2000;

export interface Participant {
  participantId: string;
  roomCode: string;
  nick: string;
  normalizedNick: string;
  /** left: oyuncu lobide ya da oyun bitince kendi isteğiyle çıktı (sahip geri bildirimi). */
  status: 'active' | 'kicked' | 'left';
  sessionId: string;
  joinedAt: number;
}

export interface RoomRecord {
  roomCode: string;
  createdAt: number;
  expiresAt: number;
  moderatorParticipantId: string;
  currentMatchId: string | null;
  settings: GameSettings;
  version: number;
  processedCommandIds: string[];
}

export interface MatchRecord {
  matchId: string;
  roomCode: string;
  status: 'running' | 'ended';
  paused: boolean;
  pauseReason: PauseReason | null;
  moderatorConnected: boolean;
  /** Duraklatılınca kalan süre (ms); süresiz adımda null. */
  remainingOnPause: number | null;
  persistedVersion: number;
  processedCommandIds: string[];
  startedAt: number;
  endedAt: number | null;
  state: GameState;
}

export interface ChatMessage {
  messageId: string;
  roomCode: string;
  channel: ChatChannel;
  authorParticipantId: string;
  authorNick: string;
  text: string;
  sentAt: number;
  commandId: string;
}

export interface Session {
  sessionId: string;
  tokenHash: string;
  createdAt: number;
  roomCode: string | null;
  participantId: string | null;
  connected: boolean;
  lastSeenAt: number;
  deviceType: DeviceType;
  revoked: boolean;
}

export interface RoomAggregate {
  room: RoomRecord;
  participants: Participant[];
  /** Odanın etkin ya da "Yeni oyun"a kadar gösterilen son oyunu. */
  match: MatchRecord | null;
  /** "Yeni oyun"dan sonra salt okunur kalan oyunlar (komut numaraları aranır, BR10.2). */
  pastMatches: MatchRecord[];
  chat: Record<ChatChannel, ChatMessage[]>;
  chatCommandIds: ReadonlySet<string>;
}

export function roomStatus(agg: RoomAggregate): RoomStatus {
  if (!agg.room.currentMatchId || !agg.match) return 'lobby';
  return agg.match.status === 'running' ? 'in_game' : 'ended';
}

export function activeParticipants(agg: RoomAggregate): Participant[] {
  return agg.participants.filter((p) => p.status === 'active');
}

export function activePlayers(agg: RoomAggregate): Participant[] {
  return activeParticipants(agg).filter((p) => p.participantId !== agg.room.moderatorParticipantId);
}

export function findParticipant(
  agg: RoomAggregate,
  participantId: string,
): Participant | undefined {
  return agg.participants.find((p) => p.participantId === participantId);
}

export function seatOf(agg: RoomAggregate, participantId: string) {
  return agg.match?.state.seats.find((s) => s.participantId === participantId);
}

export function isModerator(agg: RoomAggregate, participantId: string): boolean {
  return agg.room.moderatorParticipantId === participantId;
}

/** Komut numarası listesine ekler; yalnızca son 500 tutulur (TD-03). */
export function rememberCommand(list: string[], commandId: string): string[] {
  const next = [...list, commandId];
  return next.length > PROCESSED_COMMANDS_KEPT
    ? next.slice(next.length - PROCESSED_COMMANDS_KEPT)
    : next;
}

/** Numara odanın üç yerinden birinde var mı (BR10.2): oda, oyunlar (biten dahil), sohbet. */
export function isKnownCommand(agg: RoomAggregate, commandId: string): boolean {
  if (agg.room.processedCommandIds.includes(commandId)) return true;
  if (agg.match?.processedCommandIds.includes(commandId)) return true;
  if (agg.pastMatches.some((m) => m.processedCommandIds.includes(commandId))) return true;
  return agg.chatCommandIds.has(commandId);
}
