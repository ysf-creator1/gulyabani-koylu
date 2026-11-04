// Komut Yönlendirme Tablosu (functional-spec): her C1 komutu hangi yapı taşına gider.
import type { ParsedCommand } from '../../shared/protocol.ts';
import type { GameSettings } from '../../rules/types.ts';
import { sendMessage } from '../chat/chatService.ts';
import { rejectWith, type Actor, type CommandContext, type Outcome } from '../commands.ts';
import { handleGameCommand } from '../match/matchFlow.ts';
import type { RoomAggregate } from '../model.ts';
import {
  createRoom,
  isExpired,
  joinRoom,
  kickParticipant,
  leaveRoom,
  newGame,
  startGame,
  type SessionRef,
} from '../room/roomManager.ts';

export interface RouteInput {
  command: ParsedCommand;
  actor: Actor;
  commandId: string;
  session: SessionRef;
  settings: GameSettings;
  /** Yalnızca room.create: kurulacak odanın kodu. */
  roomCode?: string;
}

export function routeCommand(
  input: RouteInput,
): (agg: RoomAggregate | undefined, ctx: CommandContext) => Outcome {
  const { command, actor, commandId } = input;
  return (agg, ctx) => {
    if (command.name === 'room.create') {
      if (agg) return rejectWith('server_busy');
      return createRoom(ctx, {
        roomCode: input.roomCode as string,
        nick: command.args.nick,
        session: input.session,
        commandId,
        settings: input.settings,
      });
    }
    if (command.name === 'room.join')
      return joinRoom(agg, ctx, { nick: command.args.nick, session: input.session, commandId });
    if (!agg || isExpired(agg, ctx.now)) return rejectWith('room_not_found');
    switch (command.name) {
      case 'lobby.kick':
        return kickParticipant(agg, actor, command.args.participantId, commandId);
      case 'room.leave':
        return leaveRoom(agg, actor, commandId);
      case 'lobby.startGame':
        return startGame(agg, actor, ctx, commandId);
      case 'game.newGame':
        return newGame(agg, actor, commandId);
      case 'chat.send':
        return sendMessage(
          agg,
          actor,
          { channel: command.args.channel, text: command.args.text, commandId },
          ctx,
        );
      default:
        return handleGameCommand(
          agg,
          actor,
          { name: command.name, args: command.args as Record<string, unknown>, commandId },
          ctx,
        );
    }
  };
}
