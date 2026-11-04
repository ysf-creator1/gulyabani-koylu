// Gündüz ve oylama (BR6.1–BR6.11, NFR5.7) — testler koddan önce yazıldı.
import { describe, expect, it } from 'vitest';
import type { GameState } from '../../../src/rules/types.ts';
import {
  NOW,
  alive,
  cmd,
  deadline,
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

/** İlk gecede kimse kaçırılmadan gündüze gelir (bütün koltuklar yaşıyor). */
function toDay(roles = 'gvvvvv'): GameState {
  return morningReveal(ok(deadline(toGhulKill(newGame(roles)))));
}

function closeVoting(state: GameState): GameState {
  return next(state);
}

describe('gündüz (BR6.1, BR6.2)', () => {
  it('süre dolunca yalnızca hatırlatma çıkar; faz değişmez', () => {
    const day = toDay();
    const reminded = ok(deadline(day));
    expect(reminded.phase).toBe('day');
    expect(reminded.dayTimerExpired).toBe(true);
    expect(reminded.stepVersion).toBe(day.stepVersion);
    expect(deadline(reminded).ok).toBe(false);
  });

  it('oylamaya yalnızca moderatör ve yalnızca gündüzde geçirir; süre dolmadan da olur', () => {
    const day = toDay();
    rejected(
      run(day, cmd('game.moveToVote', seat('s2'), { stepVersion: day.stepVersion })),
      'not_moderator',
    );
    rejected(
      run(day, cmd('game.nextStep', moderator, { stepVersion: day.stepVersion })),
      'phase_closed',
    );
    const voting = moveToVote(day);
    expect(voting.phase).toBe('voting');
    expect(voting.voteRound).toBe('initial');
    expect(voting.deadline).toBeNull();
    rejected(
      run(voting, cmd('game.moveToVote', moderator, { stepVersion: voting.stepVersion })),
      'phase_closed',
    );
  });
});

describe('oy verme (BR6.5)', () => {
  it('yeni oy eskisinin yerine geçer', () => {
    const voting = voteAll(moveToVote(toDay()), { s2: 's3' });
    const changed = voteAll(voting, { s2: 's4' });
    expect(changed.votes).toEqual([{ voterSeatId: 's2', targetSeatId: 's4' }]);
  });

  it('kendine, ölüye ya da var olmayana oy verilemez; çekimser kapalıyken boş oy reddedilir', () => {
    const voting = moveToVote(toDay());
    rejected(run(voting, cmd('game.vote', seat('s2'), { targetSeatId: 's2' })), 'invalid_target');
    rejected(run(voting, cmd('game.vote', seat('s2'), { targetSeatId: 's77' })), 'invalid_target');
    rejected(run(voting, cmd('game.vote', seat('s2'), { targetSeatId: null })), 'invalid_target');
  });

  it('gulyabani öbür gulyabaniye oy veremez; köylü gulyabaniye verebilir (sahip geri bildirimi)', () => {
    const voting = moveToVote(toDay('ggvvvvv'));
    rejected(run(voting, cmd('game.vote', seat('s1'), { targetSeatId: 's2' })), 'invalid_target');
    rejected(run(voting, cmd('game.vote', seat('s2'), { targetSeatId: 's1' })), 'invalid_target');
    expect(voteAll(voting, { s3: 's1', s1: 's3' }).votes).toEqual([
      { voterSeatId: 's3', targetSeatId: 's1' },
      { voterSeatId: 's1', targetSeatId: 's3' },
    ]);
  });

  it('ölü oyuncu ve moderatör oy veremez; oylama dışında oy phase_closed alır', () => {
    const day = morningReveal(
      ok(
        run(
          ok(
            run(
              toGhulKill(newGame('gvvvvv')),
              cmd('game.ghulMark', seat('s1'), { targetSeatId: 's3' }),
            ),
          ),
          cmd('game.ghulConfirm', seat('s1')),
        ),
      ),
    );
    const voting = moveToVote(day);
    rejected(run(voting, cmd('game.vote', seat('s3'), { targetSeatId: 's2' })), 'not_your_turn');
    rejected(run(voting, cmd('game.vote', seat('s2'), { targetSeatId: 's3' })), 'invalid_target');
    rejected(run(voting, cmd('game.vote', moderator, { targetSeatId: 's2' })), 'not_your_turn');
    rejected(run(day, cmd('game.vote', seat('s2'), { targetSeatId: 's4' })), 'phase_closed');
  });
});

describe('oylamanın kapanması (BR6.6, BR6.7, BR6.11)', () => {
  it('hiç oy yoksa infaz olmadan gece başlar', () => {
    const night = closeVoting(moveToVote(toDay()));
    expect(night.phase).toBe('night');
    expect(night.nightNumber).toBe(2);
    expect(night.nightLog).toContainEqual({ nightNumber: 1, textKey: 'log.noExecution' });
  });

  it('tek en çok oy alan sanık olur ve son söz başlar', () => {
    const voting = voteAll(moveToVote(toDay()), { s1: 's2', s3: 's2', s4: 's5' });
    const lastWords = closeVoting(voting);
    expect(lastWords.phase).toBe('last_words');
    expect(lastWords.accusedSeatId).toBe('s2');
    expect(lastWords.deadline).toEqual({ endsAt: NOW + 30_000, totalSeconds: 30 });
  });

  it('eşitlikte yalnızca eşitler arasında yeniden oylama yapılır; sayaç bir kez artar', () => {
    const voting = voteAll(moveToVote(toDay()), { s1: 's2', s3: 's2', s4: 's5', s6: 's5' });
    const revote = closeVoting(voting);
    expect(revote.phase).toBe('voting');
    expect(revote.voteRound).toBe('revote');
    expect(revote.tiedSeatIds).toEqual(['s2', 's5']);
    expect(revote.revoteCount).toBe(1);
    expect(revote.votes).toEqual([]);
    rejected(run(revote, cmd('game.vote', seat('s1'), { targetSeatId: 's3' })), 'invalid_target');
  });

  it('yeniden oylama yine eşitse o gün infaz yapılmaz', () => {
    const revote = closeVoting(voteAll(moveToVote(toDay()), { s1: 's2', s4: 's5' }));
    const night = closeVoting(voteAll(revote, { s1: 's2', s4: 's5' }));
    expect(night.phase).toBe('night');
    expect(night.seats.every((s) => s.alive)).toBe(true);
    expect(night.revoteCount).toBe(1);
  });
});

describe('son söz ve onay oylaması (BR6.8, BR6.9)', () => {
  function toLastWords(): GameState {
    return closeVoting(
      voteAll(moveToVote(toDay('gvvvvvv')), { s1: 's2', s3: 's2', s4: 's2', s5: 's6' }),
    );
  }

  it('moderatör son sözü erken bitirebilir: onay oylaması hemen açılır, eski süre işlemez (sahip geri bildirimi)', () => {
    const lastWords = toLastWords();
    rejected(
      run(lastWords, cmd('game.nextStep', seat('s3'), { stepVersion: lastWords.stepVersion })),
      'not_moderator',
    );
    const early = ok(
      run(
        lastWords,
        cmd('game.nextStep', moderator, { stepVersion: lastWords.stepVersion }),
        NOW + 5_000,
      ),
    );
    expect(early.phase).toBe('confirm_vote');
    expect(early.votes).toEqual(lastWords.votes);
    expect(early.deadline).toEqual({ endsAt: NOW + 5_000 + 20_000, totalSeconds: 20 });
    // Son sözün eski süresi dolduğunda hiçbir şey değişmez (BR10.6)
    rejected(
      run(
        early,
        cmd('system.deadlineReached', system, {
          stepVersion: lastWords.stepVersion,
          endsAt: lastWords.deadline?.endsAt,
        }),
        NOW + 30_000,
      ),
      'phase_closed',
    );
  });

  it('son söz süresi dolunca oylar korunarak onay oylaması açılır; onay oylamasında Sonraki Adım step_waiting alır', () => {
    const lastWords = toLastWords();
    const confirm = ok(deadline(lastWords, NOW + 30_000));
    rejected(
      run(confirm, cmd('game.nextStep', moderator, { stepVersion: confirm.stepVersion })),
      'step_waiting',
    );
    expect(confirm.phase).toBe('confirm_vote');
    expect(confirm.voteRound).toBe('confirm');
    expect(confirm.votes).toEqual(lastWords.votes);
    expect(confirm.deadline).toEqual({ endsAt: NOW + 30_000 + 20_000, totalSeconds: 20 });
  });

  it('sanık hâlâ tek başına öndeyse infaz edilir, kartı açılır ve gece başlar', () => {
    const confirm = ok(deadline(toLastWords(), NOW + 30_000));
    const after = ok(deadline(confirm));
    expect(alive(after, 's2')).toBe(false);
    expect(after.seats.find((s) => s.seatId === 's2')).toMatchObject({
      revealed: true,
      deathCause: 'execution',
    });
    expect(after.deaths.at(-1)).toMatchObject({ seatId: 's2', cause: 'execution', phase: 'day' });
    expect(after.phase).toBe('night');
    expect(after.nightLog).toContainEqual({
      nightNumber: 1,
      textKey: 'log.execution',
      seatId: 's2',
    });
  });

  it('başka biri tek başına öne geçerse yeni sanıkla son söze dönülür (yeniden oylama sayılır)', () => {
    let confirm = ok(deadline(toLastWords(), NOW + 30_000));
    confirm = voteAll(confirm, { s3: 's6', s4: 's6', s7: 's6' });
    const again = ok(deadline(confirm));
    expect(again.phase).toBe('last_words');
    expect(again.accusedSeatId).toBe('s6');
    expect(again.revoteCount).toBe(1);
  });

  it('onay oylamasında eşitlik çıkarsa eşitler arasında yeniden oylama açılır; sayaç yalnızca bir artar', () => {
    let confirm = ok(deadline(toLastWords(), NOW + 30_000));
    // s2: s1 + s4 = 2 oy, s6: s5 + s3 = 2 oy → eşitlik
    confirm = voteAll(confirm, { s3: 's6' });
    const revote = ok(deadline(confirm));
    expect(revote.phase).toBe('voting');
    expect(revote.voteRound).toBe('revote');
    expect(revote.tiedSeatIds).toEqual(['s2', 's6']);
    expect(revote.revoteCount).toBe(1);
  });

  it('hak dolduysa başka birinin öne geçmesi infazı iptal eder', () => {
    let confirm = ok(deadline(toLastWords(), NOW + 30_000));
    confirm = { ...voteAll(confirm, { s3: 's6', s4: 's6', s7: 's6' }), revoteCount: 2 };
    const night = ok(deadline(confirm));
    expect(night.phase).toBe('night');
    expect(night.seats.every((s) => s.alive)).toBe(true);
  });

  it('infaz kazananı belirlerse oyun biter', () => {
    const lastWords = closeVoting(voteAll(moveToVote(toDay('gvvv')), { s2: 's1', s3: 's1' }));
    const confirm = ok(deadline(lastWords, NOW + 30_000));
    const ended = ok(deadline(confirm));
    expect(ended.phase).toBe('ended');
    expect(ended.winners).toBe('villagers');
  });
});

describe('geceye dört yol aynı başlangıcı verir (NFR5.7)', () => {
  it('oy yok, yeniden oylama eşitliği, infaz yok ve infaz sonrası gece başlangıçları aynıdır', () => {
    const pick = (s: GameState) => ({
      phase: s.phase,
      stepCursor: s.stepCursor,
      stepStatus: s.stepStatus,
      deadline: s.deadline,
      ghulMarks: s.ghulMarks,
      votes: s.votes,
      voteRound: s.voteRound,
      accusedSeatId: s.accusedSeatId,
      tiedSeatIds: s.tiedSeatIds,
      pendingDeaths: s.pendingDeaths,
      nightNumber: s.nightNumber,
    });
    const day = toDay('gvvvvvv');
    const noVotes = closeVoting(moveToVote(day));
    const tieAgain = closeVoting(
      voteAll(closeVoting(voteAll(moveToVote(day), { s2: 's3', s4: 's5' })), {
        s2: 's3',
        s4: 's5',
      }),
    );
    const lastWords = closeVoting(voteAll(moveToVote(day), { s2: 's3', s4: 's3' }));
    const confirmTimeNow = NOW + 30_000;
    const confirm = ok(deadline(lastWords, confirmTimeNow));
    const executed = ok(
      run(
        confirm,
        cmd(
          'system.deadlineReached',
          { kind: 'system' },
          { stepVersion: confirm.stepVersion, endsAt: confirm.deadline!.endsAt },
        ),
        NOW,
      ),
    );
    const cancelled = ok(
      run(
        { ...voteAll(confirm, { s5: 's6', s6: 's7', s7: 's6', s4: 's6' }), revoteCount: 2 },
        cmd(
          'system.deadlineReached',
          { kind: 'system' },
          { stepVersion: confirm.stepVersion, endsAt: confirm.deadline!.endsAt },
        ),
        NOW,
      ),
    );
    const reference = pick(noVotes);
    expect(pick(tieAgain)).toEqual(reference);
    expect(pick(executed)).toEqual(reference);
    expect(pick(cancelled)).toEqual(reference);
  });
});
