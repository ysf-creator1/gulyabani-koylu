// Kazanma kontrolü (BR7.1) — testler koddan önce yazıldı.
import { describe, expect, it } from 'vitest';
import { checkWinner } from '../../../src/rules/index.ts';
import type { GameState } from '../../../src/rules/types.ts';
import { newGame } from './helpers.ts';

function withDead(state: GameState, deadSeatIds: string[]): GameState {
  return {
    ...state,
    seats: state.seats.map((s) => (deadSeatIds.includes(s.seatId) ? { ...s, alive: false } : s)),
  };
}

describe('kazanma sırası (BR7.1)', () => {
  it('bütün gulyabaniler öldüyse köylüler kazanır', () => {
    expect(checkWinner(withDead(newGame('ggvvvvvv'), ['s1', 's2']))).toBe('villagers');
  });

  it('kimse yaşamıyorsa da köylüler kazanır (gulyabani sayısı 0)', () => {
    expect(checkWinner(withDead(newGame('gvv'), ['s1', 's2', 's3']))).toBe('villagers');
  });

  it('gulyabaniler dışındaki herkes öldüyse gulyabaniler kazanır', () => {
    const state = withDead(newGame('ggvvv', { earlyEnd: false }), ['s3', 's4', 's5']);
    expect(checkWinner(state)).toBe('ghuls');
  });

  it('erken bitiş açıkken yaşayan gulyabani sayısı ötekilere eşitse gulyabaniler kazanır', () => {
    expect(checkWinner(withDead(newGame('ggvvvv'), ['s3', 's4']))).toBe('ghuls');
  });

  it('erken bitiş kapalıysa eşitlikte oyun sürer', () => {
    const state = withDead(newGame('ggvvvv', { earlyEnd: false }), ['s3', 's4']);
    expect(checkWinner(state)).toBeNull();
  });

  it('gulyabaniler azınlıktaysa kazanan yoktur', () => {
    expect(checkWinner(newGame('gvvvvv'))).toBeNull();
    expect(checkWinner(withDead(newGame('ggvvvvv'), ['s3']))).toBeNull();
  });
});
