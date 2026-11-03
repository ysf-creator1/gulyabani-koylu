// Kazanma kontrolü (BR7.1). Zincirin sonunda bir kez çağrılır (BR5.2).
import type { Side } from '../shared/domain.ts';
import type { GameState } from './types.ts';

export function checkWinner(state: GameState): Side | null {
  const ghuls = state.seats.filter((s) => s.alive && s.roleId === 'ghul').length;
  const others = state.seats.filter((s) => s.alive && s.roleId !== 'ghul').length;
  if (ghuls === 0) return 'villagers';
  if (others === 0) return 'ghuls';
  if (state.settings.earlyEnd && ghuls >= others) return 'ghuls';
  return null;
}
