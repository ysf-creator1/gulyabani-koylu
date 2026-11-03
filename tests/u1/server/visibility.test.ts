// Görünüm süzgeci: her alıcı türü yalnızca hakkı olanı görür (BR11.1–BR11.5, BR4.7, NFR8.1–NFR8.3).
import { describe, expect, it } from 'vitest';
import { render, type RenderInput } from '../../../src/server/visibility/filter.ts';
import type { RoomAggregate } from '../../../src/server/model.ts';
import {
  cmd,
  ghulsKill,
  moveToVote,
  newGame,
  next,
  ok,
  run,
  seat,
  toGhulKill,
  voteAll,
  morningReveal,
  deadline,
} from '../rules/helpers.ts';
import { MODERATOR_ID, chatMessage, everyoneConnected, makeAgg, participant } from './fixtures.ts';

function view(agg: RoomAggregate, recipient: string, connected?: ReadonlySet<string>) {
  const input: RenderInput = {
    agg,
    recipientParticipantId: recipient,
    connected: connected ?? everyoneConnected(agg),
    publicOrigin: 'https://example.test',
    now: 0,
  };
  return render(input);
}

/** s1,s2 gulyabani; s3…s8 köylü; kurban adımında s1 s3'ü işaretlemiş, gulyabani sohbetinde mesaj var. */
function nightAgg(): RoomAggregate {
  const kill = ok(
    run(toGhulKill(newGame('ggvvvvvv')), cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' })),
  );
  const agg = makeAgg('ggvvvvvv', kill);
  return {
    ...agg,
    chat: { day: [chatMessage('day', 'merhaba')], ghul: [chatMessage('ghul', 'gizli plan')] },
  };
}

describe('köylünün görünümü (BR11.1)', () => {
  it('yalnızca kendi rolünü görür; gulyabani kimliği, işaretleri ve sohbeti hiç gitmez', () => {
    const v = view(nightAgg(), 'p4')!;
    expect(v.me.roleId).toBe('villager');
    expect(v.game!.seats.every((s) => !('roleId' in s) && !('revealedRoleId' in s))).toBe(true);
    expect('ghulMarks' in v.game!).toBe(false);
    expect('moderator' in v).toBe(false);
    expect(v.chat.channels.map((c) => c.channel)).toEqual(['day']);
    // Açık roller listesi (BR2.4) dışında görünümün hiçbir yerinde gulyabani bilgisi yoktur.
    const withoutOpenRoles = { ...v, room: { ...v.room, openRoleIds: [] } };
    expect(JSON.stringify(withoutOpenRoles)).not.toContain('ghul');
    expect(JSON.stringify(v)).not.toContain('gizli plan');
  });

  it('ölü oyuncu açılmamış rolleri görmez; açılmış kart herkese gider (BR11.4)', () => {
    const day = morningReveal(ghulsKill(toGhulKill(newGame('ggvvvvvv')), 's3'));
    const agg = makeAgg('ggvvvvvv', day);
    const dead = view(agg, 'p3')!;
    expect(dead.me.alive).toBe(false);
    const revealed = dead.game!.seats.find((s) => s.seatId === 's3');
    expect(revealed?.revealedRoleId).toBe('villager');
    expect(
      dead
        .game!.seats.filter((s) => s.seatId !== 's3')
        .every((s) => !('revealedRoleId' in s) && !('roleId' in s)),
    ).toBe(true);
    expect(view(agg, 'p5')!.game!.seats.find((s) => s.seatId === 's3')?.revealedRoleId).toBe(
      'villager',
    );
  });
});

describe('gulyabaninin görünümü (BR11.2)', () => {
  it('öteki gulyabaniyi, işaretleri ve gulyabani sohbetini görür', () => {
    const v = view(nightAgg(), 'p2')!;
    expect(v.game!.seats.find((s) => s.seatId === 's1')?.roleId).toBe('ghul');
    expect(v.game!.seats.filter((s) => 'roleId' in s).map((s) => s.seatId)).toEqual(['s1']);
    expect(v.game!.ghulMarks).toEqual([{ bySeatId: 's1', targetSeatId: 's3' }]);
    expect(v.game!.myAction?.kind).toBe('ghul_mark');
    const ghulChannel = v.chat.channels.find((c) => c.channel === 'ghul');
    expect(ghulChannel?.canWrite).toBe(true);
    expect(ghulChannel?.messages[0]?.text).toBe('gizli plan');
  });
});

describe('moderatörün görünümü (BR11.5, BR8.1)', () => {
  it('bütün rolleri, işaretleri, gulyabani sohbetini ve kopuk bilgisini görür', () => {
    const agg = nightAgg();
    const connected = new Set(['pm', 'p1', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']);
    const v = view(agg, MODERATOR_ID, connected)!;
    expect(v.me.kind).toBe('moderator');
    expect(v.moderator!.allSeats.filter((s) => s.roleId === 'ghul').map((s) => s.seatId)).toEqual([
      's1',
      's2',
    ]);
    expect(v.moderator!.allSeats.find((s) => s.seatId === 's2')?.connected).toBe(false);
    expect(v.moderator!.stepStatus).toBe('player_disconnected');
    expect(v.moderator!.stepVersion).toBe(agg.match!.state.stepVersion);
    expect(v.moderator!.announcementTextKey).toBe('announce.ghul_kill');
    expect(v.game!.ghulMarks).toHaveLength(1);
    const ghulChannel = v.chat.channels.find((c) => c.channel === 'ghul');
    expect(ghulChannel?.canWrite).toBe(false);
    expect(ghulChannel?.messages).toHaveLength(1);
  });

  it('kopuk bilgisi yalnızca moderatör bloğundadır', () => {
    const agg = nightAgg();
    const v = view(agg, 'p4', new Set(['p4']))!;
    expect(JSON.stringify(v)).not.toContain('connected');
  });
});

describe('oyların gösterimi (BR11.3, BR6.10)', () => {
  function votingAgg(liveVotes: boolean) {
    const day = morningReveal(ok(deadline(toGhulKill(newGame('gvvvvv', { liveVotes })))));
    const voting = voteAll(moveToVote(day), { s2: 's3' });
    return makeAgg('gvvvvv', voting);
  }

  it('canlı oy açıkken oylar herkese gider', () => {
    expect(view(votingAgg(true), 'p4')!.game!.votes).toEqual([
      { voterSeatId: 's2', targetSeatId: 's3' },
    ]);
  });

  it('canlı oy kapalıyken oylar yalnızca moderatöre gider', () => {
    const agg = votingAgg(false);
    expect('votes' in view(agg, 'p4')!.game!).toBe(false);
    expect(view(agg, MODERATOR_ID)!.game!.votes).toHaveLength(1);
  });
});

describe('gece eşitliği (BR4.7, NFR8.3)', () => {
  it('sırası gelmeyenlerin game blokları bayt bayt aynıdır', () => {
    for (const state of [next(newGame('ggvvvvvv')), toGhulKill(newGame('ggvvvvvv'))]) {
      const agg = makeAgg('ggvvvvvv', state);
      const blocks = ['p3', 'p4', 'p5', 'p6', 'p7', 'p8'].map((id) =>
        JSON.stringify(view(agg, id)!.game),
      );
      expect(new Set(blocks).size).toBe(1);
    }
  });
});

describe('lobi ve oyun sonu', () => {
  it('lobide oyun bloğu yoktur; başlatma engeli yalnızca moderatöre gider', () => {
    const agg = makeAgg('vv');
    const moderatorView = view(agg, MODERATOR_ID)!;
    expect(moderatorView.room.startBlock).toEqual({ reasonCode: 'too_few_players', warnings: [] });
    expect('game' in moderatorView).toBe(false);
    const playerView = view(agg, 'p1')!;
    expect('startBlock' in playerView.room).toBe(false);
    expect(playerView.room.link).toBe('https://example.test/oda/123456');
  });

  it('oyun bitince herkes bütün rolleri ve olay günlüğünü görür', () => {
    const ended = morningReveal(ghulsKill(toGhulKill(newGame('gvv')), 's2'));
    expect(ended.phase).toBe('ended');
    const v = view(makeAgg('gvv', ended), 'p3')!;
    expect(v.game!.seats.map((s) => s.revealedRoleId)).toEqual(['ghul', 'villager', 'villager']);
    expect(v.game!.winners).toEqual({ sides: ['ghuls'], extraSeatIds: [] });
    expect(v.game!.nightLog?.length).toBeGreaterThan(0);
  });

  it('çıkarılan ya da odada olmayan kişiye görünüm üretilmez', () => {
    const agg = makeAgg('vvv');
    const kicked = {
      ...agg,
      participants: agg.participants.map((p) =>
        p.participantId === 'p1' ? { ...p, status: 'kicked' as const } : p,
      ),
    };
    expect(view(kicked, 'p1')).toBeNull();
    expect(view(agg, 'nobody')).toBeNull();
    expect(participant('x', 'X').status).toBe('active');
  });
});
