// Komut işleyicilerinin (RoomManager, MatchFlow, ChatService) ortak sözleşmesi.
// İşleyiciler saftır: aday RoomAggregate ve yazım ifadeleri döndürür; bellekteki gerçek durum
// ancak yazım kesinleşince değişir (A12, NFR5.1).
import type { ReasonCode } from '../shared/reasonCodes.ts';
import type { RandomSource } from '../rules/types.ts';
import type { RoomAggregate } from './model.ts';
import type { WriteOp } from './store/types.ts';

/** Komutu gönderenin kimliği yalnızca bağlantının oturumundan gelir (security-design Oturum). */
export interface Actor {
  sessionId: string;
  participantId: string | null;
  connectionId: string;
}

export interface CommandContext {
  now: number;
  random: RandomSource;
  newId: () => string;
}

/** Yazım kesinleşince uygulanan yan etkiler (oturum bağlama, çıkarılanın bağlantısını kapatma). */
export type Effect =
  | { kind: 'bindSession'; sessionId: string; roomCode: string; participantId: string }
  | { kind: 'revokeSession'; sessionId: string; reasonCode: ReasonCode }
  | { kind: 'roomDeleted'; roomCode: string; sessionIds: string[] };

export interface Outcome {
  status: 'accepted' | 'rejected' | 'duplicate' | 'dropped';
  reasonCode?: ReasonCode;
  /** Kabul edilen komutun aday durumu; oda silindiyse null. */
  next?: RoomAggregate | null;
  ops: WriteOp[];
  /** Faz ya da adım değişti mi (gece eşit gönderim kuralı, NFR8.3). */
  stepChanged?: boolean;
  effects?: Effect[];
}

export function rejectWith(reasonCode: ReasonCode): Outcome {
  return { status: 'rejected', reasonCode, ops: [] };
}

export const DUPLICATE: Outcome = { status: 'duplicate', ops: [] };
export const DROPPED: Outcome = { status: 'dropped', ops: [] };
