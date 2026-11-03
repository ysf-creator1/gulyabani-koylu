// ConnectionGateway'in depo bölümü (session_): yalnızca belirteç özeti; IP yok (NFR7.4, C-14).
import type { Session } from '../../model.ts';
import type { StoredSession, WriteOp } from '../types.ts';

export function insertSession(s: Session): WriteOp {
  return {
    sql: `INSERT INTO session_sessions (session_id, token_hash, created_at, room_code, participant_id, revoked,
            device_type, last_seen_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      s.sessionId,
      s.tokenHash,
      s.createdAt,
      s.roomCode,
      s.participantId,
      s.revoked ? 1 : 0,
      s.deviceType,
      s.lastSeenAt,
    ],
    expectChanges: 1,
  };
}

/** Oturum bir kez bir odaya ve katılımcıya bağlanır (BR10.5). */
export function bindSession(sessionId: string, roomCode: string, participantId: string): WriteOp {
  return {
    sql: 'UPDATE session_sessions SET room_code = ?, participant_id = ? WHERE session_id = ?',
    params: [roomCode, participantId, sessionId],
    expectChanges: 1,
  };
}

export function revokeSession(sessionId: string): WriteOp {
  return {
    sql: 'UPDATE session_sessions SET revoked = 1 WHERE session_id = ?',
    params: [sessionId],
  };
}

export function touchSession(sessionId: string, lastSeenAt: number): WriteOp {
  return {
    sql: 'UPDATE session_sessions SET last_seen_at = ? WHERE session_id = ?',
    params: [lastSeenAt, sessionId],
  };
}

export function deleteSession(sessionId: string): WriteOp {
  return { sql: 'DELETE FROM session_sessions WHERE session_id = ?', params: [sessionId] };
}

/** C8: odası silinen oturumlar. */
export function deleteRoomSessions(roomCode: string): WriteOp {
  return { sql: 'DELETE FROM session_sessions WHERE room_code = ?', params: [roomCode] };
}

interface SessionRow {
  session_id: string;
  token_hash: string;
  created_at: number;
  room_code: string | null;
  participant_id: string | null;
  revoked: number;
  device_type: 'phone' | 'tablet' | 'desktop';
  last_seen_at: number;
}

export function sessionFromRow(row: SessionRow): StoredSession {
  return {
    sessionId: row.session_id,
    tokenHash: row.token_hash,
    createdAt: row.created_at,
    roomCode: row.room_code,
    participantId: row.participant_id,
    revoked: row.revoked === 1,
    deviceType: row.device_type,
    lastSeenAt: row.last_seen_at,
  };
}

export const SELECT_SESSIONS = 'SELECT * FROM session_sessions';
