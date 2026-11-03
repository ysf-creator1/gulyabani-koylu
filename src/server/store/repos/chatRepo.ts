// ChatService'in depo bölümü (chat_): kanal başına en fazla 2.000 mesaj (NFR3.2).
import { CHAT_MEMORY_PER_CHANNEL, CHAT_STORE_PER_CHANNEL, type ChatMessage } from '../../model.ts';
import type { WriteOp } from '../types.ts';

export function insertMessage(m: ChatMessage): WriteOp {
  return {
    sql: `INSERT INTO chat_messages (message_id, command_id, room_code, channel, author_participant_id, author_nick,
            text, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    params: [
      m.messageId,
      m.commandId,
      m.roomCode,
      m.channel,
      m.authorParticipantId,
      m.authorNick,
      m.text,
      m.sentAt,
    ],
    expectChanges: 1,
  };
}

/** Aynı yazım isteğinde kanalın en eski fazlalığını siler. */
export function trimChannel(roomCode: string, channel: string): WriteOp {
  return {
    sql: `DELETE FROM chat_messages WHERE room_code = ? AND channel = ? AND message_id NOT IN (
            SELECT message_id FROM chat_messages WHERE room_code = ? AND channel = ?
            ORDER BY sent_at DESC, rowid DESC LIMIT ${CHAT_STORE_PER_CHANNEL})`,
    params: [roomCode, channel, roomCode, channel],
  };
}

/** C8: odası silinen mesajlar. */
export function deleteRoomMessages(roomCode: string): WriteOp {
  return { sql: 'DELETE FROM chat_messages WHERE room_code = ?', params: [roomCode] };
}

interface ChatRow {
  message_id: string;
  command_id: string;
  room_code: string;
  channel: 'day' | 'ghul';
  author_participant_id: string;
  author_nick: string;
  text: string;
  sent_at: number;
}

export function messageFromRow(row: ChatRow): ChatMessage {
  return {
    messageId: row.message_id,
    commandId: row.command_id,
    roomCode: row.room_code,
    channel: row.channel,
    authorParticipantId: row.author_participant_id,
    authorNick: row.author_nick,
    text: row.text,
    sentAt: row.sent_at,
  };
}

/** Oda ve kanal başına en yeni 100 mesaj (bellekte tutulan kadar). */
export const SELECT_RECENT_MESSAGES = `
  SELECT * FROM (
    SELECT *, rowid AS rid,
      ROW_NUMBER() OVER (PARTITION BY room_code, channel ORDER BY sent_at DESC, rowid DESC) AS rn
    FROM chat_messages
  ) WHERE rn <= ${CHAT_MEMORY_PER_CHANNEL} ORDER BY sent_at, rid`;

export const SELECT_COMMAND_IDS = 'SELECT room_code, command_id FROM chat_messages';
