// İşletim sisteminin kriptografik kaynağından rastgelelik (NFR15.1). Kural modülüne
// RandomSource olarak verilir; oda kodu, belirteç ve kimlikler de buradan üretilir.
import { createHash, randomBytes, randomInt, randomUUID } from 'node:crypto';
import type { RandomSource } from '../rules/types.ts';

export const cryptoRandom: RandomSource = {
  nextInt: (maxExclusive) => randomInt(0, maxExclusive),
};

export function newId(): string {
  return randomUUID();
}

/** 256 bit oturum belirteci; base64url (43 karakter), yalnızca welcome ile bir kez gider. */
export function newSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

/** Depoda ve bellekte yalnızca belirtecin SHA-256 özeti tutulur (NFR7.4). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Bağlantıya program içinde verilen rastgele kimlik (IP değil). */
export function newConnectionId(): string {
  return randomBytes(8).toString('hex');
}
