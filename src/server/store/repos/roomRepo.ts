// RoomManager'ın depo bölümü (room_): oda ve katılımcı ifadeleri. Yalnızca bu modül room_
// tablolarına yazan ifadeleri üretir (C9 bölüm kuralı).
import type { Participant, RoomRecord } from '../../model.ts';
import type { WriteOp } from '../types.ts';

export function insertRoom(room: RoomRecord): WriteOp {
  return {
    sql: `INSERT INTO room_rooms (room_code, created_at, expires_at, moderator_participant_id, current_match_id,
            settings_json, version, processed_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      room.roomCode,
      room.createdAt,
      room.expiresAt,
      room.moderatorParticipantId,
      room.currentMatchId,
      JSON.stringify(room.settings),
      room.version,
      JSON.stringify(room.processedCommandIds),
    ],
    expectChanges: 1,
  };
}

/** Yalnızca beklenen sürüm üzerine yazar (BR10.2, C9 write-rule). */
export function updateRoom(room: RoomRecord, expectedVersion: number): WriteOp {
  return {
    sql: `UPDATE room_rooms SET expires_at = ?, current_match_id = ?, settings_json = ?, version = ?,
            processed_json = ? WHERE room_code = ? AND version = ?`,
    params: [
      room.expiresAt,
      room.currentMatchId,
      JSON.stringify(room.settings),
      room.version,
      JSON.stringify(room.processedCommandIds),
      room.roomCode,
      expectedVersion,
    ],
    expectChanges: 1,
  };
}

export function insertParticipant(p: Participant): WriteOp {
  return {
    sql: `INSERT INTO room_participants (participant_id, room_code, nick, normalized_nick, status, session_id, joined_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    params: [
      p.participantId,
      p.roomCode,
      p.nick,
      p.normalizedNick,
      p.status,
      p.sessionId,
      p.joinedAt,
    ],
    expectChanges: 1,
  };
}

export function updateParticipantStatus(p: Participant): WriteOp {
  return {
    sql: 'UPDATE room_participants SET status = ? WHERE participant_id = ?',
    params: [p.status, p.participantId],
    expectChanges: 1,
  };
}

/** C8: odanın kendisi en son silinir. */
export function deleteRoom(roomCode: string): WriteOp[] {
  return [
    { sql: 'DELETE FROM room_participants WHERE room_code = ?', params: [roomCode] },
    { sql: 'DELETE FROM room_rooms WHERE room_code = ?', params: [roomCode] },
  ];
}

interface RoomRow {
  room_code: string;
  created_at: number;
  expires_at: number;
  moderator_participant_id: string;
  current_match_id: string | null;
  settings_json: string;
  version: number;
  processed_json: string;
}

export function roomFromRow(row: RoomRow): RoomRecord {
  return {
    roomCode: row.room_code,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    moderatorParticipantId: row.moderator_participant_id,
    currentMatchId: row.current_match_id,
    settings: JSON.parse(row.settings_json),
    version: row.version,
    processedCommandIds: JSON.parse(row.processed_json),
  };
}

interface ParticipantRow {
  participant_id: string;
  room_code: string;
  nick: string;
  normalized_nick: string;
  status: 'active' | 'kicked';
  session_id: string;
  joined_at: number;
}

export function participantFromRow(row: ParticipantRow): Participant {
  return {
    participantId: row.participant_id,
    roomCode: row.room_code,
    nick: row.nick,
    normalizedNick: row.normalized_nick,
    status: row.status,
    sessionId: row.session_id,
    joinedAt: row.joined_at,
  };
}

export const SELECT_ROOMS = 'SELECT * FROM room_rooms';
export const SELECT_PARTICIPANTS = 'SELECT * FROM room_participants ORDER BY joined_at, rowid';
