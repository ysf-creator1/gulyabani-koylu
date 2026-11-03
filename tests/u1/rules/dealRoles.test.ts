// Rol dağıtımı (BR2.1, BR2.2, BR3.1, BR3.2, BR4.1) — testler koddan önce yazıldı.
import { randomInt } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  dealRoles,
  defaultSettings,
  ghulCountFor,
  startWarnings,
  validatePlayerCount,
} from '../../../src/rules/index.ts';
import type { RandomSource } from '../../../src/rules/types.ts';
import { NOW, seqRandom, zeroRandom } from './helpers.ts';

const cryptoRandom: RandomSource = { nextInt: (max) => randomInt(0, max) };

function participants(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    participantId: `p${index + 1}`,
    nick: `Bot${index + 1}`,
  }));
}

describe('gulyabani sayısı (BR3.1)', () => {
  it.each([
    [3, 1],
    [7, 1],
    [8, 2],
    [11, 2],
    [12, 3],
    [17, 3],
    [18, 4],
    [23, 4],
    [24, 5],
    [26, 5],
  ])('%i oyuncuda %i gulyabani', (players, ghuls) => {
    expect(ghulCountFor(players)).toBe(ghuls);
  });

  it('aralık dışı oyuncu sayısında hata verir', () => {
    expect(() => ghulCountFor(2)).toThrow(RangeError);
    expect(() => ghulCountFor(27)).toThrow(RangeError);
  });
});

describe('oyuncu sayısı (BR2.1)', () => {
  it('3ten az oyuncuyla başlatma too_few_players ile engellenir', () => {
    expect(validatePlayerCount(0)).toBe('too_few_players');
    expect(validatePlayerCount(2)).toBe('too_few_players');
    expect(validatePlayerCount(3)).toBeNull();
    expect(validatePlayerCount(26)).toBeNull();
  });

  it('3–5 oyuncuda öneri uyarısı çıkar, 6 ve üstünde çıkmaz', () => {
    expect(startWarnings(3)).toEqual(['few_players']);
    expect(startWarnings(5)).toEqual(['few_players']);
    expect(startWarnings(6)).toEqual([]);
    expect(startWarnings(2)).toEqual([]);
  });
});

describe('dağıtım (BR3.2, BR4.1)', () => {
  it('her oyuncuya bir koltuk ve rol verir; ilk gecenin kart görme adımıyla başlar', () => {
    const { state, events } = dealRoles(
      { gameId: 'g1', participants: participants(8), settings: defaultSettings(), now: NOW },
      zeroRandom,
    );
    expect(state.seats).toHaveLength(8);
    expect(state.seats.map((s) => s.seatId)).toEqual([
      's1',
      's2',
      's3',
      's4',
      's5',
      's6',
      's7',
      's8',
    ]);
    expect(state.seats.filter((s) => s.roleId === 'ghul')).toHaveLength(2);
    expect(state.ghulCount).toBe(2);
    expect(state.phase).toBe('first_night');
    expect(state.stepCursor).toBe('card_reveal');
    expect(state.nightNumber).toBe(1);
    expect(state.dayNumber).toBe(0);
    expect(state.stepVersion).toBe(1);
    expect(state.seats.every((s) => s.alive && !s.cardSeen && !s.revealed)).toBe(true);
    expect(events.map((e) => e.type)).toContain('match.started');
  });

  it('ayarları oyuna kopyalar (sonradan değişmez)', () => {
    const settings = { ...defaultSettings(), noKillFirstNight: true };
    const { state } = dealRoles(
      { gameId: 'g1', participants: participants(4), settings, now: NOW },
      zeroRandom,
    );
    settings.noKillFirstNight = false;
    expect(state.settings.noKillFirstNight).toBe(true);
  });

  it('karıştırma yalnızca verilen rastgelelik kaynağını kullanır (Fisher–Yates)', () => {
    const a = dealRoles(
      { gameId: 'g1', participants: participants(10), settings: defaultSettings(), now: NOW },
      seqRandom([3, 1, 4, 1, 5, 9, 2, 6, 5]),
    );
    const b = dealRoles(
      { gameId: 'g1', participants: participants(10), settings: defaultSettings(), now: NOW },
      seqRandom([3, 1, 4, 1, 5, 9, 2, 6, 5]),
    );
    expect(a.state.seats.map((s) => s.roleId)).toEqual(b.state.seats.map((s) => s.roleId));
  });

  it('aralık dışı katılımcı sayısında dağıtım yapılmaz', () => {
    expect(() =>
      dealRoles(
        { gameId: 'g1', participants: participants(2), settings: defaultSettings(), now: NOW },
        zeroRandom,
      ),
    ).toThrow(RangeError);
  });

  it('kriptografik kaynakla gulyabani her sıraya eşit olasılıkla düşer (ki-kare, 1000 dağıtım)', () => {
    const players = 6;
    const counts = new Array<number>(players).fill(0);
    const deals = 1000;
    for (let i = 0; i < deals; i += 1) {
      const { state } = dealRoles(
        {
          gameId: `g${i}`,
          participants: participants(players),
          settings: defaultSettings(),
          now: NOW,
        },
        cryptoRandom,
      );
      state.seats.forEach((s, index) => {
        if (s.roleId === 'ghul') counts[index]! += 1;
      });
    }
    const expected = deals / players;
    const chiSquare = counts.reduce(
      (sum, observed) => sum + (observed - expected) ** 2 / expected,
      0,
    );
    // 5 serbestlik derecesinde %0,1 anlamlılık eşiği 20,52
    expect(chiSquare).toBeLessThan(20.52);
  });
});

describe('varsayılan ayarlar', () => {
  it('iskelet varsayılanları entities RoomSettings ile aynıdır', () => {
    expect(defaultSettings()).toEqual({
      daySeconds: 240,
      lastWordsSeconds: 30,
      confirmVoteSeconds: 20,
      ghulDecisionSeconds: 90,
      noKillFirstNight: false,
      ghulTieRule: 'random',
      voteTieRule: 'revote',
      liveVotes: true,
      abstainAllowed: false,
      earlyEnd: true,
    });
  });

  it('zaman ölçeği yalnızca süreleri küçültür', () => {
    const scaled = defaultSettings(0.1);
    expect(scaled.daySeconds).toBeCloseTo(24);
    expect(scaled.ghulDecisionSeconds).toBeCloseTo(9);
    expect(scaled.liveVotes).toBe(true);
  });
});
