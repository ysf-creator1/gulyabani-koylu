// Gece kuralları (BR4.1–BR4.9, BR3.3, BR10.7) — testler koddan önce yazıldı.
import { describe, expect, it } from 'vitest';
import { enterNight } from '../../../src/rules/index.ts';
import {
  NOW,
  cmd,
  deadline,
  ghulsKill,
  moderator,
  newGame,
  next,
  ok,
  rejected,
  run,
  seat,
  seqRandom,
  system,
  toGhulKill,
} from './helpers.ts';
import { decide } from '../../../src/rules/index.ts';

describe('ilk gece adımları (BR4.1, BR4.3, BR3.3)', () => {
  it('kart görme → tanışma → kurban seçimi sırasıyla ilerler, her adımda stepVersion artar', () => {
    const start = newGame('gvvv');
    const meet = next(start);
    expect(meet.stepCursor).toBe('ghul_meet');
    expect(meet.stepVersion).toBe(start.stepVersion + 1);
    const kill = next(meet);
    expect(kill.stepCursor).toBe('ghul_kill');
    expect(kill.stepStatus).toBe('waiting');
    expect(kill.deadline).toEqual({ endsAt: NOW + 90_000, totalSeconds: 90 });
  });

  it('"ilk gece kimse kaçırılmaz" açıksa tanışmadan sonra sabaha geçilir', () => {
    const meet = next(newGame('gvvv', { noKillFirstNight: true }));
    const morning = next(meet);
    expect(morning.phase).toBe('morning');
    expect(morning.pendingDeaths).toEqual([]);
  });

  it('kart görme işareti yalnızca kart adımında ve yalnızca oyuncudan kabul edilir', () => {
    const start = newGame('gvvv');
    const seen = ok(run(start, cmd('game.cardSeen', seat('s2'))));
    expect(seen.seats.find((s) => s.seatId === 's2')?.cardSeen).toBe(true);
    rejected(run(start, cmd('game.cardSeen', moderator)), 'not_your_turn');
    rejected(run(next(start), cmd('game.cardSeen', seat('s2'))), 'phase_closed');
  });

  it('moderatör herkes kartını görmeden de ilerleyebilir', () => {
    const start = newGame('gvvvv');
    expect(start.seats.every((s) => !s.cardSeen)).toBe(true);
    expect(next(start).stepCursor).toBe('ghul_meet');
  });
});

describe('gulyabani kararı (BR4.4, BR4.5)', () => {
  it('hedef yaşayan, gulyabani olmayan bir oyuncu olmalıdır', () => {
    const kill = toGhulKill(newGame('ggvvvvvv'));
    rejected(run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's2' })), 'invalid_target');
    rejected(
      run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's99' })),
      'invalid_target',
    );
    const marked = ok(run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' })));
    expect(marked.ghulMarks).toEqual({ s1: 's3' });
  });

  it('köylü ve moderatör işaret koyamaz', () => {
    const kill = toGhulKill(newGame('gvvv'));
    rejected(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's3' })), 'not_your_turn');
    rejected(run(kill, cmd('game.ghulMark', moderator, { targetSeatId: 's3' })), 'not_your_turn');
  });

  it('onay yalnızca bütün yaşayan gulyabaniler aynı hedefteyken kabul edilir', () => {
    let kill = toGhulKill(newGame('ggvvvvvv'));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' })));
    rejected(run(kill, cmd('game.ghulConfirm', seat('s1'))), 'invalid_target');
    kill = ok(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's4' })));
    rejected(run(kill, cmd('game.ghulConfirm', seat('s2'))), 'invalid_target');
    kill = ok(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's3' })));
    const locked = ok(run(kill, cmd('game.ghulConfirm', seat('s2'))));
    expect(locked.stepStatus).toBe('done');
    expect(locked.pendingDeaths).toEqual(['s3']);
    expect(locked.deadline).toBeNull();
  });

  it('karar kilitlendikten sonra işaret değiştirilemez', () => {
    const locked = ghulsKill(toGhulKill(newGame('gvvv')), 's2');
    rejected(run(locked, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' })), 'phase_closed');
  });
});

describe('süre dolunca karar (BR4.6, BR10.6)', () => {
  it('çoğunluğun hedefi seçilir', () => {
    let kill = toGhulKill(newGame('gggvvvvvvvvv'));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's5' })));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's5' })));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s3'), { targetSeatId: 's6' })));
    const timed = ok(deadline(kill));
    expect(timed.stepStatus).toBe('timed_out');
    expect(timed.pendingDeaths).toEqual(['s5']);
    expect(timed.nightActions.at(-1)).toMatchObject({
      step: 'ghul_decision',
      timedOut: true,
      targetSeatId: 's5',
    });
  });

  it('eşitlikte ayar random ise eşitlerden rastgele biri, none ise kimse seçilmez', () => {
    let kill = toGhulKill(newGame('ggvvvvvv'));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' })));
    kill = ok(run(kill, cmd('game.ghulMark', seat('s2'), { targetSeatId: 's4' })));
    const endsAt = kill.deadline!.endsAt;
    const randomPick = decide(
      kill,
      cmd('system.deadlineReached', system, { stepVersion: kill.stepVersion, endsAt }),
      { now: endsAt, random: seqRandom([1]) },
    );
    expect(ok(randomPick).pendingDeaths).toEqual(['s4']);

    const noneRule = { ...kill, settings: { ...kill.settings, ghulTieRule: 'none' as const } };
    expect(ok(deadline(noneRule)).pendingDeaths).toEqual([]);
  });

  it('hiç işaret yoksa kimse kaçırılmaz', () => {
    const timed = ok(deadline(toGhulKill(newGame('gvvv'))));
    expect(timed.pendingDeaths).toEqual([]);
    expect(timed.stepStatus).toBe('timed_out');
  });

  it('karar zaten kilitliyse süre komutu durum değiştirmez', () => {
    let kill = toGhulKill(newGame('gvvv'));
    const endsAt = kill.deadline!.endsAt;
    kill = ghulsKill(kill, 's2');
    const stale = run(
      kill,
      cmd('system.deadlineReached', system, { stepVersion: kill.stepVersion, endsAt }),
      endsAt,
    );
    expect(stale.ok).toBe(false);
  });
});

describe('sabaha geçiş (BR10.7)', () => {
  it('karar kilitlenmeden Sonraki Adım step_waiting alır', () => {
    const kill = toGhulKill(newGame('gvvv'));
    rejected(
      run(kill, cmd('game.nextStep', moderator, { stepVersion: kill.stepVersion })),
      'step_waiting',
    );
  });

  it('karar kilitlenince ya da süre dolunca sabaha geçilir', () => {
    const locked = ghulsKill(toGhulKill(newGame('gvvv')), 's3');
    const morning = next(locked);
    expect(morning.phase).toBe('morning');
    expect(morning.stepCursor).toBeNull();
    expect(morning.pendingDeaths).toEqual(['s3']);
    const timed = ok(deadline(toGhulKill(newGame('gvvv'))));
    expect(next(timed).phase).toBe('morning');
  });
});

describe('gece ≥ 2 ve nightSelect (BR4.2, BR4.9)', () => {
  it('standart gecede tek adım vardır: kurban seçimi', () => {
    const state = newGame('gvvvvv');
    const night = enterNight(
      { ...state, phase: 'day', dayNumber: 1, stepCursor: null },
      NOW + 5000,
    );
    expect(night.phase).toBe('night');
    expect(night.nightNumber).toBe(2);
    expect(night.stepCursor).toBe('ghul_kill');
    expect(night.stepStatus).toBe('waiting');
    expect(night.deadline?.endsAt).toBe(NOW + 5000 + 90_000);
    expect(night.ghulMarks).toEqual({});
  });

  it('game.nightSelect U1de hiçbir adımda kabul edilmez', () => {
    const kill = toGhulKill(newGame('gvvv'));
    rejected(
      run(kill, cmd('game.nightSelect', seat('s1'), { targetSeatIds: ['s2'] })),
      'not_your_turn',
    );
    rejected(
      run(newGame('gvvv'), cmd('game.nightSelect', seat('s2'), { targetSeatIds: [] })),
      'not_your_turn',
    );
  });
});
