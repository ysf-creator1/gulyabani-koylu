// Kötüye kullanım sınırları (BR10.3, NFR7.7, security-design tablo a–g). Bütün sayaçlar
// yalnızca bellektedir ve IP kullanmaz; anahtarlar katılımcı, bağlantı ya da sunucudur.

/** Kayan pencere: anahtar başına son `limit` denemenin zamanı. */
export class SlidingWindow {
  private readonly hits = new Map<string, number[]>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /** Deneme sınır içindeyse kaydeder ve true döner. */
  hit(key: string, now: number): boolean {
    const recent = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    recent.push(now);
    this.hits.set(key, recent);
    return true;
  }

  forget(key: string): void {
    this.hits.delete(key);
  }

  size(): number {
    return this.hits.size;
  }
}

/** Sabit dakika penceresi (sunucu çapındaki sınırlar). */
export class FixedWindow {
  private windowStart = 0;
  private count = 0;
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  private roll(now: number): void {
    const start = now - (now % this.windowMs);
    if (start !== this.windowStart) {
      this.windowStart = start;
      this.count = 0;
    }
  }

  /** Sınır içindeyse sayar ve true döner. */
  take(now: number): boolean {
    this.roll(now);
    if (this.count >= this.limit) return false;
    this.count += 1;
    return true;
  }

  /** Yalnızca sayar (ör. başarısız katılma denemesi). */
  record(now: number): void {
    this.roll(now);
    this.count += 1;
  }

  exhausted(now: number): boolean {
    this.roll(now);
    return this.count >= this.limit;
  }

  current(now: number): number {
    this.roll(now);
    return this.count;
  }
}

/** Kova: saniyede `rate` jeton, en fazla `burst` birikir (mesaj seli sınırı f). */
export class TokenBucket {
  private tokens: number;
  private updatedAt: number;
  private readonly rate: number;
  private readonly burst: number;

  constructor(rate: number, burst: number, now: number) {
    this.rate = rate;
    this.burst = burst;
    this.tokens = burst;
    this.updatedAt = now;
  }

  take(now: number): boolean {
    this.tokens = Math.min(this.burst, this.tokens + ((now - this.updatedAt) / 1000) * this.rate);
    this.updatedAt = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

export const LIMITS = {
  chatPerParticipant: { limit: 5, windowMs: 10_000 },
  joinPerConnection: { limit: 10, windowMs: 60_000 },
  failedJoinsPerMinute: 60,
  roomCreatesPerMinute: 20,
  framesPerSecond: 20,
  maxConnections: 2000,
  maxPreHelloConnections: 200,
  maxSessions: 3000,
  maxActiveRooms: 300,
} as const;

export class RateLimiter {
  private readonly chat = new SlidingWindow(
    LIMITS.chatPerParticipant.limit,
    LIMITS.chatPerParticipant.windowMs,
  );
  private readonly joins = new SlidingWindow(
    LIMITS.joinPerConnection.limit,
    LIMITS.joinPerConnection.windowMs,
  );
  private readonly failedJoins = new FixedWindow(LIMITS.failedJoinsPerMinute, 60_000);
  private readonly creates = new FixedWindow(LIMITS.roomCreatesPerMinute, 60_000);

  /** (a) 10 saniyede 5 mesaj; sayaç katılımcıya bağlıdır, yeniden bağlanınca sıfırlanmaz. */
  chatAllowed(participantId: string, now: number): boolean {
    return this.chat.hit(participantId, now);
  }

  /** (a) bağlantı başına dakikada 10 oda kodu denemesi ve (b) genel başarısız katılma sınırı. */
  joinAllowed(connectionId: string, now: number): boolean {
    if (this.failedJoins.exhausted(now)) return false;
    return this.joins.hit(connectionId, now);
  }

  recordFailedJoin(now: number): void {
    this.failedJoins.record(now);
  }

  /** (c) sunucu çapında dakikada 20 oda kurma. */
  createAllowed(now: number): boolean {
    return this.creates.take(now);
  }

  forgetConnection(connectionId: string): void {
    this.joins.forget(connectionId);
  }

  forgetParticipant(participantId: string): void {
    this.chat.forget(participantId);
  }

  /** Sınırın %80'ine yakın mı (warn günlüğü için, NFR13.3). */
  nearLimits(now: number): string[] {
    const near: string[] = [];
    if (this.failedJoins.current(now) >= LIMITS.failedJoinsPerMinute * 0.8)
      near.push('failed_joins');
    if (this.creates.current(now) >= LIMITS.roomCreatesPerMinute * 0.8) near.push('room_creates');
    return near;
  }
}
