// Yasal eylemler ve komut doğrulama (AC13.5.1, BR10.1, BR10.6–BR10.8, BR4.7) — testler koddan önce yazıldı.
import { describe, expect, it } from 'vitest';
import { isAllowedWhilePaused, legalActions } from '../../../src/rules/index.ts';
import {
  NOW,
  cmd,
  deadline,
  ghulsKill,
  moderator,
  morningReveal,
  moveToVote,
  newGame,
  next,
  ok,
  rejected,
  run,
  seat,
  system,
  toGhulKill,
  voteAll,
} from './helpers.ts';

describe('legalActions', () => {
  it('kart adımında her oyuncu kartını görür', () => {
    const start = newGame('gvvv');
    expect(legalActions(start, 's1')).toEqual([{ kind: 'see_card', targets: [] }]);
    expect(legalActions(start, 's3')).toEqual([{ kind: 'see_card', targets: [] }]);
    expect(legalActions(start, 'moderator')).toEqual([]);
  });

  it('tanışma ve kurban adımında yalnızca yaşayan gulyabanilerin eylemi vardır', () => {
    const meet = next(newGame('ggvvvvvv'));
    expect(legalActions(meet, 's1')).toEqual([{ kind: 'ghul_meet', targets: [] }]);
    expect(legalActions(meet, 's3')).toEqual([]);
    const kill = next(meet);
    expect(legalActions(kill, 's2')).toEqual([
      { kind: 'ghul_mark', targets: ['s3', 's4', 's5', 's6', 's7', 's8'], deadline: NOW + 90_000 },
    ]);
    expect(legalActions(kill, 's4')).toEqual([]);
    expect(legalActions(ghulsKill(kill, 's3'), 's1')).toEqual([]);
  });

  it('oylamada yaşayanlar kendileri dışındaki yaşayanlara oy verir; yeniden oylamada yalnızca eşitlere', () => {
    const day = morningReveal(ghulsKill(toGhulKill(newGame('gvvvvv')), 's6'));
    const voting = moveToVote(day);
    expect(legalActions(voting, 's2')).toEqual([
      { kind: 'vote', targets: ['s1', 's3', 's4', 's5'] },
    ]);
    expect(legalActions(voting, 's6')).toEqual([]);
    expect(legalActions(day, 's2')).toEqual([]);
    const revote = next(voteAll(voting, { s1: 's2', s3: 's4' }));
    expect(legalActions(revote, 's2')).toEqual([{ kind: 'vote', targets: ['s4'] }]);
  });

  it('gulyabaninin oy listesinde öbür gulyabaniler yoktur (sahip geri bildirimi 2026-11-04)', () => {
    const day = morningReveal(ghulsKill(toGhulKill(newGame('ggvvvvv')), 's7'));
    const voting = moveToVote(day);
    expect(legalActions(voting, 's1')).toEqual([
      { kind: 'vote', targets: ['s3', 's4', 's5', 's6'] },
    ]);
    expect(legalActions(voting, 's3')).toEqual([
      { kind: 'vote', targets: ['s1', 's2', 's4', 's5', 's6'] },
    ]);
  });
});

describe('geçersiz komut durumu değiştirmez (AC13.5.1, BR10.1)', () => {
  it('reddedilen komut aynı durumu bırakır ve neden kodu döner', () => {
    const kill = toGhulKill(newGame('gvvv'));
    const snapshot = structuredClone(kill);
    rejected(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's3' })), 'not_your_turn');
    rejected(run(kill, cmd('game.ghulConfirm', seat('s1'))), 'invalid_target');
    expect(kill).toEqual(snapshot);
  });

  it('oyuncu moderatör komutu gönderemez', () => {
    const start = newGame('gvvv');
    rejected(
      run(start, cmd('game.nextStep', seat('s1'), { stepVersion: start.stepVersion })),
      'not_moderator',
    );
  });
});

describe('adım sürümü (BR10.7)', () => {
  it('çift dokunuşta ikinci Sonraki Adım eski sürümü taşıdığı için phase_closed alır; adım atlanmaz', () => {
    const start = newGame('gvvv');
    const first = run(start, cmd('game.nextStep', moderator, { stepVersion: start.stepVersion }));
    const meet = ok(first);
    rejected(
      run(meet, cmd('game.nextStep', moderator, { stepVersion: start.stepVersion })),
      'phase_closed',
    );
    expect(meet.stepCursor).toBe('ghul_meet');
  });

  it('bitmiş oyunda Sonraki Adım phase_closed alır', () => {
    const ended = {
      ...newGame('gvvv'),
      phase: 'ended' as const,
      stepCursor: null,
      winners: 'ghuls' as const,
    };
    rejected(
      run(ended, cmd('game.nextStep', moderator, { stepVersion: ended.stepVersion })),
      'phase_closed',
    );
  });
});

describe('duraklatma (BR10.8)', () => {
  it('duraklatılmışken oy, işaret ve ilerletme game_paused alır; kart görme kabul edilir', () => {
    const kill = toGhulKill(newGame('gvvv'));
    rejected(
      run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's2' }), NOW, true),
      'game_paused',
    );
    rejected(
      run(kill, cmd('game.nextStep', moderator, { stepVersion: kill.stepVersion }), NOW, true),
      'game_paused',
    );
    const start = newGame('gvvv');
    expect(run(start, cmd('game.cardSeen', seat('s2')), NOW, true).ok).toBe(true);
  });

  it('izinli komut listesi yalnızca devam, uzatma, kart görme ve sohbettir', () => {
    expect(isAllowedWhilePaused('game.resume')).toBe(true);
    expect(isAllowedWhilePaused('game.timerExtend')).toBe(true);
    expect(isAllowedWhilePaused('game.cardSeen')).toBe(true);
    expect(isAllowedWhilePaused('chat.send')).toBe(true);
    expect(isAllowedWhilePaused('game.vote')).toBe(false);
    expect(isAllowedWhilePaused('game.pause')).toBe(false);
  });
});

describe('süre komutu (BR10.6)', () => {
  it('yalnızca sistemden kabul edilir', () => {
    const kill = toGhulKill(newGame('gvvv'));
    const args = { stepVersion: kill.stepVersion, endsAt: kill.deadline!.endsAt };
    rejected(run(kill, cmd('system.deadlineReached', moderator, args)), 'not_your_turn');
    rejected(run(kill, cmd('system.deadlineReached', seat('s1'), args)), 'not_your_turn');
  });

  it('eski adım sürümü ya da değişmiş bitiş zamanı durumu değiştirmez', () => {
    const kill = toGhulKill(newGame('gvvv'));
    const endsAt = kill.deadline!.endsAt;
    expect(
      run(
        kill,
        cmd('system.deadlineReached', system, { stepVersion: kill.stepVersion - 1, endsAt }),
        endsAt,
      ).ok,
    ).toBe(false);
    const extended = { ...kill, deadline: { endsAt: endsAt + 30_000, totalSeconds: 120 } };
    expect(
      run(
        extended,
        cmd('system.deadlineReached', system, { stepVersion: kill.stepVersion, endsAt }),
        endsAt,
      ).ok,
    ).toBe(false);
  });

  it('duraklatılmışken ve süresi olmayan adımda süre komutu işlemez', () => {
    const kill = toGhulKill(newGame('gvvv'));
    const args = { stepVersion: kill.stepVersion, endsAt: kill.deadline!.endsAt };
    rejected(run(kill, cmd('system.deadlineReached', system, args), NOW, true), 'game_paused');
    const start = newGame('gvvv');
    expect(
      run(
        start,
        cmd('system.deadlineReached', system, { stepVersion: start.stepVersion, endsAt: 0 }),
      ).ok,
    ).toBe(false);
    expect(deadline(kill).ok).toBe(true);
  });
});
