// Rol dağıtımı ve oyun başlangıcı (BR2.1, BR3.1, BR3.2, BR4.1).
import { MAX_PLAYERS, MIN_PLAYERS, RECOMMENDED_PLAYERS } from '../shared/domain.ts';
import type { RoleId } from '../shared/domain.ts';
import type { ReasonCode } from '../shared/reasonCodes.ts';
import type { DealInput, DealResult, GameSettings, GameState, RandomSource } from './types.ts';

const BASE_SETTINGS: GameSettings = {
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
};

/**
 * İskeletin sabit ayarları (entities RoomSettings). `timeScale` yalnızca geliştirme ve
 * testlerde süreleri kısaltmak içindir; üretimde her zaman 1'dir (config.ts denetler).
 */
export function defaultSettings(timeScale = 1): GameSettings {
  return {
    ...BASE_SETTINGS,
    daySeconds: BASE_SETTINGS.daySeconds * timeScale,
    lastWordsSeconds: BASE_SETTINGS.lastWordsSeconds * timeScale,
    confirmVoteSeconds: BASE_SETTINGS.confirmVoteSeconds * timeScale,
    ghulDecisionSeconds: BASE_SETTINGS.ghulDecisionSeconds * timeScale,
  };
}

/** Oyuncu sayısına göre önerilen gulyabani sayısı (BR3.1). */
export function ghulCountFor(playerCount: number): number {
  if (playerCount < MIN_PLAYERS || playerCount > MAX_PLAYERS) {
    throw new RangeError(`player count out of range: ${playerCount}`);
  }
  if (playerCount <= 7) return 1;
  if (playerCount <= 11) return 2;
  if (playerCount <= 17) return 3;
  if (playerCount <= 23) return 4;
  return 5;
}

/** Başlatmayı engelleyen neden (BR2.1); en fazla 26 oyuncuyu katılma denetimi sağlar. */
export function validatePlayerCount(playerCount: number): ReasonCode | null {
  return playerCount < MIN_PLAYERS ? 'too_few_players' : null;
}

/** 3–5 oyuncuda "6 oyuncu önerilir" uyarısı (BR2.1). */
export function startWarnings(playerCount: number): string[] {
  return playerCount >= MIN_PLAYERS && playerCount < RECOMMENDED_PLAYERS ? ['few_players'] : [];
}

/** Fisher–Yates karıştırma; rastgelelik yalnızca verilen kaynaktan gelir (BR3.2, NFR15). */
function shuffle<T>(items: readonly T[], random: RandomSource): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = random.nextInt(i + 1);
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/** Rolleri dağıtır ve ilk gecenin kart görme adımındaki başlangıç durumunu kurar. */
export function dealRoles(input: DealInput, random: RandomSource): DealResult {
  const playerCount = input.participants.length;
  const ghulCount = ghulCountFor(playerCount);
  const deck: RoleId[] = Array.from({ length: playerCount }, (_, i) =>
    i < ghulCount ? 'ghul' : 'villager',
  );
  const roles = shuffle(deck, random);
  const state: GameState = {
    gameId: input.gameId,
    phase: 'first_night',
    nightNumber: 1,
    dayNumber: 0,
    stepCursor: 'card_reveal',
    stepStatus: null,
    stepVersion: 1,
    lastStepChangeAt: input.now,
    dayTimerExpired: false,
    settings: { ...input.settings },
    ghulCount,
    seats: input.participants.map((p, index) => ({
      seatId: `s${index + 1}`,
      participantId: p.participantId,
      nick: p.nick,
      roleId: roles[index] as RoleId,
      alive: true,
      cardSeen: false,
      revealed: false,
    })),
    ghulMarks: {},
    nightActions: [],
    votes: [],
    voteRound: null,
    revoteCount: 0,
    tiedSeatIds: null,
    accusedSeatId: null,
    pendingDeaths: [],
    morningResult: null,
    deaths: [],
    winners: null,
    nightLog: [],
    deadline: null,
  };
  return {
    state,
    events: [{ type: 'match.started', payload: { playerCount, ghulCount } }],
  };
}
