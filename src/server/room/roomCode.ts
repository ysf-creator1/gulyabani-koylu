// 6 haneli kriptografik oda kodu (BR1.1, NFR15.1): etkin bir odayla çakışırsa yeniden üretilir;
// en fazla 10 denemeden sonra null döner (çağıran server_busy verir).
import type { RandomSource } from '../../rules/types.ts';

const MAX_ATTEMPTS = 10;

export function generateRoomCode(
  isTaken: (code: string) => boolean,
  random: RandomSource,
): string | null {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const code = String(random.nextInt(1_000_000)).padStart(6, '0');
    if (!isTaken(code)) return code;
  }
  return null;
}
