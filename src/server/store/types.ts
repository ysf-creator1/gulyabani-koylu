// StoreWriter'ın iş parçacıkları arasında taşınan istek ve sonuç biçimleri.
import type { ChatMessage, MatchRecord, Participant, RoomRecord, Session } from '../model.ts';

export type SqlValue = string | number | null;

export interface WriteOp {
  sql: string;
  params: SqlValue[];
  /** Verilirse etkilenen satır sayısı tutmalıdır (sürüm denetimi, C9 write-rule). */
  expectChanges?: number;
}

export interface WriteRequest {
  id: number;
  ops: WriteOp[];
  /** Aynı odanın önceki isteği başarısızsa bu istek de geri alınır (oda içi boru hattı). */
  dependsOn?: number;
}

export type WriteStatus = 'committed' | 'failed' | 'aborted_dependency';

export interface WriteResult {
  id: number;
  status: WriteStatus;
  /** Yalnızca hata türünün adı ya da sabit kodu; mesaj metni taşınmaz (security-design). */
  errorCode?: string;
}

export type StoredSession = Omit<Session, 'connected'>;

export interface StoreSnapshot {
  rooms: RoomRecord[];
  participants: Participant[];
  matches: MatchRecord[];
  /** Oda ve kanal başına en yeni 100 mesaj, eskiden yeniye. */
  chat: ChatMessage[];
  chatCommandIds: { roomCode: string; commandId: string }[];
  sessions: StoredSession[];
}

export interface BatchOutcome {
  results: WriteResult[];
  commitMs: number;
}
