// Sabah ve ölüm zinciri (BR5.1–BR5.3, BR10.7) — testler koddan önce yazıldı.
import { describe, expect, it } from 'vitest';
import {
  NOW,
  cmd,
  ghulsKill,
  moderator,
  morningReveal,
  newGame,
  next,
  ok,
  rejected,
  run,
  seat,
  toGhulKill,
  deadline,
} from './helpers.ts';

function morningWith(roles: string, target: string | null) {
  const kill = toGhulKill(newGame(roles));
  const decided = target ? ghulsKill(kill, target) : ok(deadline(kill));
  return next(decided);
}

describe('sabah anonsu ve kart açma (BR5.1)', () => {
  it('ölen oyuncunun kartı açılır, ölüm kaydı yazılır ve gündüze geçilir', () => {
    const morning = morningWith('gvvvvv', 's3');
    const day = ok(
      run(morning, cmd('game.revealResult', moderator, { stepVersion: morning.stepVersion })),
    );
    const victim = day.seats.find((s) => s.seatId === 's3')!;
    expect(victim).toMatchObject({ alive: false, revealed: true, deathCause: 'night_kill' });
    expect(day.deaths).toEqual([
      {
        seatId: 's3',
        cause: 'night_kill',
        phase: 'night',
        chainOrder: 1,
        revealedRoleId: 'villager',
      },
    ]);
    expect(day.morningResult).toEqual({ deadSeatIds: ['s3'] });
    expect(day.nightLog).toContainEqual({ nightNumber: 1, textKey: 'log.ghulKill', seatId: 's3' });
  });

  it('kimse ölmediyse kart açılmaz ve günlüğe "kimse" yazılır', () => {
    const morning = morningWith('gvvvvv', null);
    const day = ok(
      run(morning, cmd('game.revealResult', moderator, { stepVersion: morning.stepVersion })),
    );
    expect(day.seats.every((s) => s.alive && !s.revealed)).toBe(true);
    expect(day.morningResult).toEqual({ deadSeatIds: [] });
    expect(day.nightLog).toContainEqual({ nightNumber: 1, textKey: 'log.noKill' });
  });
});

describe('gündüze geçiş (BR5.3)', () => {
  it('kazanan yoksa gündüz başlar: gün sayısı artar, geri sayım kurulur', () => {
    const day = morningReveal(ghulsKill(toGhulKill(newGame('gvvvvv')), 's2'), NOW + 1000);
    expect(day.phase).toBe('day');
    expect(day.dayNumber).toBe(1);
    expect(day.revoteCount).toBe(0);
    expect(day.dayTimerExpired).toBe(false);
    expect(day.deadline).toEqual({ endsAt: NOW + 1000 + 240_000, totalSeconds: 240 });
    expect(day.pendingDeaths).toEqual([]);
  });

  it('ölüm kazananı belirlerse oyun biter (zincir sonunda tek kontrol)', () => {
    const morning = morningWith('gvv', 's2');
    const decision = run(
      morning,
      cmd('game.revealResult', moderator, { stepVersion: morning.stepVersion }),
    );
    const ended = ok(decision);
    expect(ended.phase).toBe('ended');
    expect(ended.winners).toBe('ghuls');
    expect(ended.deadline).toBeNull();
    if (decision.ok) {
      const types = decision.events.map((e) => e.type);
      expect(types.indexOf('death.occurred')).toBeLessThan(types.indexOf('match.ended'));
      expect(types.filter((t) => t === 'match.ended')).toHaveLength(1);
    }
  });
});

describe('sabahta moderatör komutları (BR10.7, BR2.2)', () => {
  it('sabahta Sonraki Adım phase_closed alır; yalnızca Sonucu Açıkla geçerlidir', () => {
    const morning = morningWith('gvvv', 's2');
    rejected(
      run(morning, cmd('game.nextStep', moderator, { stepVersion: morning.stepVersion })),
      'phase_closed',
    );
  });

  it('eski stepVersion ile gelen Sonucu Açıkla phase_closed alır (çift dokunuş)', () => {
    const morning = morningWith('gvvv', 's2');
    rejected(
      run(morning, cmd('game.revealResult', moderator, { stepVersion: morning.stepVersion - 1 })),
      'phase_closed',
    );
  });

  it('oyuncu Sonucu Açıkla gönderemez; sabah dışında da kabul edilmez', () => {
    const morning = morningWith('gvvv', 's2');
    rejected(
      run(morning, cmd('game.revealResult', seat('s2'), { stepVersion: morning.stepVersion })),
      'not_moderator',
    );
    const start = newGame('gvvv');
    rejected(
      run(start, cmd('game.revealResult', moderator, { stepVersion: start.stepVersion })),
      'phase_closed',
    );
  });
});
