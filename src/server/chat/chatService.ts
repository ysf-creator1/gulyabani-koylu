// ChatService: gündüz ve gulyabani kanalları (BR4.8, BR6.4). Metin protocol.ts'te düz metne
// indirgenmiş olarak gelir (1–300 karakter); bellekte kanal başına son 100, depoda en fazla
// 2.000 mesaj tutulur (NFR1.5, NFR3.2). Mesajın kimliği komut numarasıyla bağlıdır (BR10.2).
import type { ChatChannel } from '../../shared/domain.ts';
import { rejectWith, type Actor, type CommandContext, type Outcome } from '../commands.ts';
import {
  CHAT_MEMORY_PER_CHANNEL,
  findParticipant,
  type ChatMessage,
  type RoomAggregate,
} from '../model.ts';
import { deleteRoomMessages, insertMessage, trimChannel } from '../store/repos/chatRepo.ts';
import type { WriteOp } from '../store/types.ts';
import { canWriteChannel } from './chatPolicy.ts';

export function sendMessage(
  agg: RoomAggregate,
  actor: Actor,
  input: { channel: ChatChannel; text: string; commandId: string },
  ctx: CommandContext,
): Outcome {
  const author = actor.participantId ? findParticipant(agg, actor.participantId) : undefined;
  if (!author || author.status !== 'active') return rejectWith('session_invalid');
  if (!canWriteChannel(agg, author.participantId, input.channel))
    return rejectWith('chat_not_allowed');
  const message: ChatMessage = {
    messageId: ctx.newId(),
    roomCode: agg.room.roomCode,
    channel: input.channel,
    authorParticipantId: author.participantId,
    authorNick: author.nick,
    text: input.text,
    sentAt: ctx.now,
    commandId: input.commandId,
  };
  const channelMessages = [...agg.chat[input.channel], message].slice(-CHAT_MEMORY_PER_CHANNEL);
  const chatCommandIds = new Set(agg.chatCommandIds);
  chatCommandIds.add(input.commandId);
  return {
    status: 'accepted',
    next: { ...agg, chat: { ...agg.chat, [input.channel]: channelMessages }, chatCommandIds },
    ops: [insertMessage(message), trimChannel(agg.room.roomCode, input.channel)],
  };
}

/** C8: odası silinen mesajların silme ifadesi (ExpirySweep sırasıyla çağırır). */
export function purgeRoomMessages(roomCode: string): WriteOp[] {
  return [deleteRoomMessages(roomCode)];
}
