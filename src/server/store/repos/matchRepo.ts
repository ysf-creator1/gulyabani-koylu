// MatchFlow'un depo bölümü (match_): oyun başına tek satırda tam durum (TD-03).
import type { MatchRecord } from '../../model.ts';
import type { WriteOp } from '../types.ts';

function recordJson(match: MatchRecord): string {
  const { processedCommandIds: _ignored, ...rest } = match;
  return JSON.stringify(rest);
}

export function insertMatch(match: MatchRecord, now: number): WriteOp {
  return {
    sql: `INSERT INTO match_matches (match_id, room_code, status, version, record_json, processed_json, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    params: [
      match.matchId,
      match.roomCode,
      match.status,
      match.persistedVersion,
      recordJson(match),
      JSON.stringify(match.processedCommandIds),
      now,
    ],
    expectChanges: 1,
  };
}

/** Yeni sürüm = beklenen sürüm + 1 değilse yazma reddedilir (C9 write-rule). */
export function updateMatch(match: MatchRecord, expectedVersion: number, now: number): WriteOp {
  return {
    sql: `UPDATE match_matches SET status = ?, version = ?, record_json = ?, processed_json = ?, updated_at = ?
          WHERE match_id = ? AND version = ?`,
    params: [
      match.status,
      match.persistedVersion,
      recordJson(match),
      JSON.stringify(match.processedCommandIds),
      now,
      match.matchId,
      expectedVersion,
    ],
    expectChanges: 1,
  };
}

/** Yarım kalmış başlatmanın öksüz oyun kaydı (BR10.2). */
export function deleteMatch(matchId: string): WriteOp {
  return { sql: 'DELETE FROM match_matches WHERE match_id = ?', params: [matchId] };
}

/** C8: odası silinen bütün oyunlar (biten oyunlar dahil). */
export function deleteRoomMatches(roomCode: string): WriteOp {
  return { sql: 'DELETE FROM match_matches WHERE room_code = ?', params: [roomCode] };
}

interface MatchRow {
  record_json: string;
  processed_json: string;
}

export function matchFromRow(row: MatchRow): MatchRecord {
  return { ...JSON.parse(row.record_json), processedCommandIds: JSON.parse(row.processed_json) };
}

export const SELECT_MATCHES =
  'SELECT record_json, processed_json FROM match_matches ORDER BY rowid';
