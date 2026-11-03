// MatchFlow ve süre zamanlayıcısı (sahte saatle): Faz Bitirme Tablosu, BR6.3, BR8.2, BR8.3,
// BR10.6, BR10.8, NFR5.2.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Actor, CommandContext } from '../../../src/server/commands.ts';
import {
  DeadlineScheduler,
  deadlineCommandId,
  handleDeadline,
  handleGameCommand,
  handleModeratorConnection,
  nextDeadline,
} from '../../../src/server/match/matchFlow.ts';
import type { RoomAggregate } from '../../../src/server/model.ts';
import { NOW, ghulsKill, newGame, toGhulKill, zeroRandom } from '../rules/helpers.ts';
import { MODERATOR_ID, makeAgg, matchRecord } from './fixtures.ts';

const ctx = (now = NOW): CommandContext => ({ now, random: zeroRandom, newId: () => 'new-id' });
const moderator: Actor = { sessionId: 'sess-pm', participantId: MODERATOR_ID, connectionId: 'c0' };
const player = (n: number): Actor => ({
  sessionId: `sess-p${n}`,
  participantId: `p${n}`,
  connectionId: `c${n}`,
});

function killAgg(): RoomAggregate {
  return makeAgg('gvvv', toGhulKill(newGame('gvvv')));
}

function cmd(name: string, args: Record<string, unknown> = {}, commandId = `cmd-${name}`) {
  return { name, args, commandId };
}

describe('oyun komutları', () => {
  it('kabul edilen komut sürümü artırır ve numarasını oyun kaydına yazar', () => {
    const agg = makeAgg('gvvv');
    const outcome = handleGameCommand(
      agg,
      moderator,
      cmd('game.nextStep', { stepVersion: 1 }, 'c-next'),
      ctx(),
    );
    expect(outcome.status).toBe('accepted');
    expect(outcome.next!.match!.persistedVersion).toBe(2);
    expect(outcome.next!.match!.processedCommandIds).toEqual(['c-next']);
    expect(outcome.stepChanged).toBe(true);
    expect(outcome.ops[0]!.sql).toContain('UPDATE match_matches');
  });

  it('oyuncu ilerletme gönderemez; moderatör oyuncu komutu gönderemez', () => {
    const agg = makeAgg('gvvv');
    expect(
      handleGameCommand(agg, player(2), cmd('game.nextStep', { stepVersion: 1 }), ctx()).reasonCode,
    ).toBe('not_moderator');
    expect(handleGameCommand(agg, moderator, cmd('game.cardSeen'), ctx()).reasonCode).toBe(
      'not_your_turn',
    );
    expect(handleGameCommand(agg, player(2), cmd('game.pause'), ctx()).reasonCode).toBe(
      'not_moderator',
    );
  });

  it('biten ya da lobiye dönülmüş oyunun geç komutu phase_closed alır', () => {
    const agg = makeAgg('gvvv');
    const ended = { ...agg, match: { ...agg.match!, status: 'ended' as const } };
    expect(handleGameCommand(ended, player(2), cmd('game.cardSeen'), ctx()).reasonCode).toBe(
      'phase_closed',
    );
    expect(
      handleGameCommand(makeAgg('vv'), player(1), cmd('game.vote', { targetSeatId: 's1' }), ctx())
        .reasonCode,
    ).toBe('phase_closed');
  });
});

describe('uzatma ve duraklatma (BR6.3, BR10.8)', () => {
  it('uzatma bitiş zamanını herkes için öteler', () => {
    const agg = killAgg();
    const endsAt = agg.match!.state.deadline!.endsAt;
    const outcome = handleGameCommand(
      agg,
      moderator,
      cmd('game.timerExtend', { seconds: 30 }),
      ctx(),
    );
    expect(outcome.next!.match!.state.deadline).toEqual({
      endsAt: endsAt + 30_000,
      totalSeconds: 120,
    });
  });

  it('süresi olmayan adımda uzatma phase_closed alır', () => {
    expect(
      handleGameCommand(makeAgg('gvvv'), moderator, cmd('game.timerExtend', { seconds: 30 }), ctx())
        .reasonCode,
    ).toBe('phase_closed');
  });

  it('duraklatma kalan süreyi saklar; devam bitişi şimdi + kalan süre yapar', () => {
    const agg = killAgg();
    const paused = handleGameCommand(agg, moderator, cmd('game.pause'), ctx(NOW + 10_000)).next!;
    expect(paused.match!.paused).toBe(true);
    expect(paused.match!.remainingOnPause).toBe(80_000);
    const extended = handleGameCommand(
      paused,
      moderator,
      cmd('game.timerExtend', { seconds: 20 }, 'c-ext'),
      ctx(NOW + 20_000),
    ).next!;
    expect(extended.match!.remainingOnPause).toBe(100_000);
    const resumed = handleGameCommand(
      extended,
      moderator,
      cmd('game.resume'),
      ctx(NOW + 500_000),
    ).next!;
    expect(resumed.match!.paused).toBe(false);
    expect(resumed.match!.state.deadline!.endsAt).toBe(NOW + 600_000);
  });

  it('duraklatılmışken işaret game_paused alır, kart görme kabul edilir; ikinci duraklatma reddedilir', () => {
    const paused = handleGameCommand(killAgg(), moderator, cmd('game.pause'), ctx()).next!;
    expect(
      handleGameCommand(paused, player(1), cmd('game.ghulMark', { targetSeatId: 's2' }), ctx())
        .reasonCode,
    ).toBe('game_paused');
    expect(
      handleGameCommand(paused, moderator, cmd('game.pause', {}, 'c2'), ctx()).reasonCode,
    ).toBe('phase_closed');
    const cardPaused = handleGameCommand(
      makeAgg('gvvv'),
      moderator,
      cmd('game.pause'),
      ctx(),
    ).next!;
    expect(handleGameCommand(cardPaused, player(2), cmd('game.cardSeen'), ctx()).status).toBe(
      'accepted',
    );
  });
});

describe('moderatörün kopması (BR8.2, BR8.3)', () => {
  it('kopunca oyun duraklar; kalan süre son sesten hesaplanır, dönüşte sürer', () => {
    const agg = killAgg();
    const endsAt = agg.match!.state.deadline!.endsAt;
    const lastSeenAt = NOW + 5_000;
    const lost = handleModeratorConnection(
      agg,
      { kind: 'lost', lastSeenAt, commandId: 'conn:lost' },
      ctx(NOW + 50_000),
    ).next!;
    expect(lost.match!).toMatchObject({
      paused: true,
      pauseReason: 'moderator_lost',
      moderatorConnected: false,
    });
    expect(lost.match!.remainingOnPause).toBe(endsAt - lastSeenAt);
    expect(handleGameCommand(lost, moderator, cmd('game.resume'), ctx()).reasonCode).toBe(
      'game_paused',
    );
    const back = handleModeratorConnection(
      lost,
      { kind: 'restored', lastSeenAt: 0, commandId: 'conn:back' },
      ctx(NOW + 200_000),
    ).next!;
    expect(back.match!.paused).toBe(false);
    expect(back.match!.state.deadline!.endsAt).toBe(NOW + 200_000 + (endsAt - lastSeenAt));
  });

  it('elle duraklatılmış oyun moderatör dönünce duraklatılmış kalır', () => {
    const paused = handleGameCommand(killAgg(), moderator, cmd('game.pause'), ctx()).next!;
    const lost = handleModeratorConnection(
      paused,
      { kind: 'lost', lastSeenAt: NOW, commandId: 'l' },
      ctx(),
    ).next!;
    expect(lost.match!.pauseReason).toBe('moderator');
    const back = handleModeratorConnection(
      lost,
      { kind: 'restored', lastSeenAt: NOW, commandId: 'r' },
      ctx(),
    ).next!;
    expect(back.match!).toMatchObject({
      paused: true,
      pauseReason: 'moderator',
      moderatorConnected: true,
    });
  });

  it('kopma adım değiştikten sonra fark edilirse süre adım değişiminden hesaplanır', () => {
    const agg = killAgg();
    const later = {
      ...agg,
      match: { ...agg.match!, state: { ...agg.match!.state, lastStepChangeAt: NOW + 30_000 } },
    };
    const lost = handleModeratorConnection(
      later,
      { kind: 'lost', lastSeenAt: NOW, commandId: 'l' },
      ctx(NOW + 60_000),
    ).next!;
    expect(lost.match!.remainingOnPause).toBe(agg.match!.state.deadline!.endsAt - (NOW + 30_000));
  });
});

describe('süre komutu (BR10.6) ve zamanlayıcı (NFR5.2)', () => {
  beforeEach(() => vi.useFakeTimers({ now: NOW }));
  afterEach(() => vi.useRealTimers());

  it('güncel süre komutu kararı verir; eski komut sessizce düşer', () => {
    const agg = killAgg();
    const args = nextDeadline(agg)!;
    expect(args).toEqual({
      matchId: 'm1',
      stepVersion: agg.match!.state.stepVersion,
      endsAt: NOW + 90_000,
    });
    const decided = handleDeadline(agg, args, ctx(args.endsAt));
    expect(decided.next!.match!.state.stepStatus).toBe('timed_out');
    expect(decided.next!.match!.processedCommandIds).toContain(deadlineCommandId(args));
    expect(handleDeadline(decided.next!, args, ctx(args.endsAt)).status).toBe('dropped');
    expect(handleDeadline(agg, { ...args, stepVersion: 1 }, ctx()).status).toBe('dropped');
  });

  it('zamanlayıcı bitiş zamanında bir kez ateşler; geçmiş süre hemen işler; duraklatmada kurulmaz', () => {
    const fired: string[] = [];
    const scheduler = new DeadlineScheduler((room, args) => fired.push(`${room}:${args.endsAt}`));
    const agg = killAgg();
    scheduler.sync('123456', agg);
    scheduler.sync('123456', agg);
    expect(scheduler.size()).toBe(1);
    vi.advanceTimersByTime(89_999);
    expect(fired).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(fired).toEqual([`123456:${NOW + 90_000}`]);

    vi.setSystemTime(NOW + 500_000);
    scheduler.sync('654321', agg);
    vi.advanceTimersByTime(0);
    expect(fired).toHaveLength(2);

    const paused = { ...agg, match: { ...agg.match!, paused: true } };
    scheduler.sync('111111', paused);
    expect(scheduler.size()).toBe(0);
    scheduler.cancelAll();
  });

  it('karar kilitlenince ve gündüz hatırlatmasından sonra zamanlayıcı yoktur', () => {
    const locked = makeAgg('gvvv', ghulsKill(toGhulKill(newGame('gvvv')), 's2'));
    expect(nextDeadline(locked)).toBeNull();
    const state = {
      ...newGame('gvvv'),
      phase: 'day' as const,
      dayTimerExpired: true,
      deadline: { endsAt: NOW, totalSeconds: 240 },
    };
    expect(nextDeadline({ ...makeAgg('gvvv'), match: matchRecord(state) })).toBeNull();
  });
});
