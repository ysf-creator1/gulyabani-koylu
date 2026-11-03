// ChatService ve sohbet izinleri (BR4.8, BR6.4, NFR1.5).
import { describe, expect, it } from 'vitest';
import { canReadChannel, canWriteChannel } from '../../../src/server/chat/chatPolicy.ts';
import { purgeRoomMessages, sendMessage } from '../../../src/server/chat/chatService.ts';
import type { Actor, CommandContext } from '../../../src/server/commands.ts';
import type { RoomAggregate } from '../../../src/server/model.ts';
import {
  NOW,
  deadline,
  morningReveal,
  moveToVote,
  newGame,
  next,
  ok,
  toGhulKill,
  voteAll,
  zeroRandom,
} from '../rules/helpers.ts';
import { MODERATOR_ID, chatMessage, makeAgg } from './fixtures.ts';

let id = 0;
const ctx: CommandContext = { now: NOW, random: zeroRandom, newId: () => `m${++id}` };
const actor = (participantId: string): Actor => ({
  sessionId: `sess-${participantId}`,
  participantId,
  connectionId: 'c',
});

function dayAgg(): RoomAggregate {
  return makeAgg('gvvvv', morningReveal(ok(deadline(toGhulKill(newGame('gvvvv'))))));
}

describe('gündüz kanalı (BR6.4)', () => {
  it('gündüz yaşayan oyuncu ve moderatör yazar; mesaj bellekte kanala eklenir', () => {
    const agg = dayAgg();
    const outcome = sendMessage(
      agg,
      actor('p2'),
      { channel: 'day', text: 'Bence Bot1', commandId: 'c1' },
      ctx,
    );
    expect(outcome.status).toBe('accepted');
    expect(outcome.next!.chat.day.map((m) => m.text)).toEqual(['Bence Bot1']);
    expect(outcome.next!.chatCommandIds.has('c1')).toBe(true);
    expect(outcome.ops).toHaveLength(2);
    expect(
      sendMessage(
        agg,
        actor(MODERATOR_ID),
        { channel: 'day', text: 'Sessiz', commandId: 'c2' },
        ctx,
      ).status,
    ).toBe('accepted');
  });

  it('gece, lobide ve onay oylamasında gündüz kanalı kapalıdır', () => {
    const night = makeAgg('gvvvv', toGhulKill(newGame('gvvvv')));
    expect(
      sendMessage(night, actor('p2'), { channel: 'day', text: 'x', commandId: 'c' }, ctx)
        .reasonCode,
    ).toBe('chat_not_allowed');
    expect(canWriteChannel(makeAgg('vv'), 'p1', 'day')).toBe(false);
    const voting = voteAll(moveToVote(dayAgg().match!.state), { s2: 's3' });
    const lastWords = next(voting);
    const confirm = ok(deadline(lastWords, NOW + 30_000));
    expect(canWriteChannel(makeAgg('gvvvv', confirm), 'p2', 'day')).toBe(false);
  });

  it('son sözde yalnızca sanık ve moderatör yazar', () => {
    const voting = voteAll(moveToVote(dayAgg().match!.state), { s2: 's3', s4: 's3' });
    const agg = makeAgg('gvvvv', next(voting));
    expect(canWriteChannel(agg, 'p3', 'day')).toBe(true);
    expect(canWriteChannel(agg, MODERATOR_ID, 'day')).toBe(true);
    expect(canWriteChannel(agg, 'p2', 'day')).toBe(false);
  });

  it('ölü oyuncu okur ama yazamaz', () => {
    const state = dayAgg().match!.state;
    const withDead = {
      ...state,
      seats: state.seats.map((s) => (s.seatId === 's2' ? { ...s, alive: false } : s)),
    };
    const agg = makeAgg('gvvvv', withDead);
    expect(canReadChannel(agg, 'p2', 'day')).toBe(true);
    expect(
      sendMessage(agg, actor('p2'), { channel: 'day', text: 'x', commandId: 'c' }, ctx).reasonCode,
    ).toBe('chat_not_allowed');
  });
});

describe('gulyabani kanalı (BR4.8)', () => {
  it('yalnızca gulyabani adımında yaşayan gulyabaniler yazar; moderatör salt okur', () => {
    const night = makeAgg('ggvvvvvv', toGhulKill(newGame('ggvvvvvv')));
    expect(
      sendMessage(night, actor('p1'), { channel: 'ghul', text: 'Bot3?', commandId: 'g1' }, ctx)
        .status,
    ).toBe('accepted');
    expect(
      sendMessage(night, actor('p3'), { channel: 'ghul', text: 'x', commandId: 'g2' }, ctx)
        .reasonCode,
    ).toBe('chat_not_allowed');
    expect(canReadChannel(night, 'p3', 'ghul')).toBe(false);
    expect(canReadChannel(night, MODERATOR_ID, 'ghul')).toBe(true);
    expect(canWriteChannel(night, MODERATOR_ID, 'ghul')).toBe(false);
    expect(canWriteChannel(dayAgg(), 'p1', 'ghul')).toBe(false);
  });
});

describe('sınırlar', () => {
  it('bellekte kanal başına son 100 mesaj tutulur', () => {
    const agg = dayAgg();
    const full = {
      ...agg,
      chat: {
        ...agg.chat,
        day: Array.from({ length: 100 }, (_, i) => chatMessage('day', `eski${i}`)),
      },
    };
    const outcome = sendMessage(
      full,
      actor('p2'),
      { channel: 'day', text: 'yeni', commandId: 'c-new' },
      ctx,
    );
    expect(outcome.next!.chat.day).toHaveLength(100);
    expect(outcome.next!.chat.day.at(-1)!.text).toBe('yeni');
    expect(outcome.next!.chat.day[0]!.text).toBe('eski1');
  });

  it('odada olmayan kişi yazamaz; oda silinince mesaj silme ifadesi üretilir', () => {
    expect(
      sendMessage(dayAgg(), actor('nobody'), { channel: 'day', text: 'x', commandId: 'c' }, ctx)
        .reasonCode,
    ).toBe('session_invalid');
    expect(purgeRoomMessages('123456')[0]!.sql).toContain('DELETE FROM chat_messages');
  });
});
