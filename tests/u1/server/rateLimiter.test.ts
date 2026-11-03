// Hız sınırları (BR10.3, NFR7.7 a–c, f): bellek içi sayaçlar, IP yok.
import { describe, expect, it } from 'vitest';
import {
  FixedWindow,
  LIMITS,
  RateLimiter,
  SlidingWindow,
  TokenBucket,
} from '../../../src/server/gateway/rateLimiter.ts';

describe('kayan pencere', () => {
  it('pencere içinde sınırı aşan deneme reddedilir, pencere kayınca açılır', () => {
    const window = new SlidingWindow(2, 1000);
    expect(window.hit('a', 0)).toBe(true);
    expect(window.hit('a', 100)).toBe(true);
    expect(window.hit('a', 200)).toBe(false);
    expect(window.hit('b', 200)).toBe(true);
    expect(window.hit('a', 1001)).toBe(true);
    window.forget('a');
    expect(window.size()).toBe(1);
  });
});

describe('sabit pencere ve kova', () => {
  it('sabit pencere dakika başında sıfırlanır', () => {
    const window = new FixedWindow(2, 60_000);
    expect(window.take(1)).toBe(true);
    expect(window.take(2)).toBe(true);
    expect(window.take(3)).toBe(false);
    expect(window.exhausted(59_999)).toBe(true);
    expect(window.take(60_000)).toBe(true);
  });

  it('kova saniyede 20 çerçeveye izin verir, boşalınca dolar', () => {
    const bucket = new TokenBucket(20, 20, 0);
    for (let i = 0; i < 20; i += 1) expect(bucket.take(0)).toBe(true);
    expect(bucket.take(0)).toBe(false);
    expect(bucket.take(100)).toBe(true);
    expect(bucket.take(100)).toBe(true);
    expect(bucket.take(100)).toBe(false);
  });
});

describe('RateLimiter', () => {
  it('oyuncu 10 saniyede en fazla 5 mesaj gönderir; sayaç katılımcıya bağlıdır', () => {
    const limiter = new RateLimiter();
    for (let i = 0; i < 5; i += 1) expect(limiter.chatAllowed('p1', i)).toBe(true);
    expect(limiter.chatAllowed('p1', 6)).toBe(false);
    expect(limiter.chatAllowed('p2', 6)).toBe(true);
    expect(limiter.chatAllowed('p1', 10_001)).toBe(true);
  });

  it('bağlantı dakikada en fazla 10 oda kodu dener', () => {
    const limiter = new RateLimiter();
    for (let i = 0; i < 10; i += 1) expect(limiter.joinAllowed('conn-a', i)).toBe(true);
    expect(limiter.joinAllowed('conn-a', 11)).toBe(false);
    expect(limiter.joinAllowed('conn-b', 11)).toBe(true);
  });

  it('dakikada 60 başarısız katılmadan sonra o dakika kimse katılamaz; oda kurma dakikada 20', () => {
    const limiter = new RateLimiter();
    for (let i = 0; i < LIMITS.failedJoinsPerMinute; i += 1) limiter.recordFailedJoin(1000);
    expect(limiter.joinAllowed('fresh', 1000)).toBe(false);
    expect(limiter.nearLimits(1000)).toContain('failed_joins');
    expect(limiter.joinAllowed('fresh', 60_000)).toBe(true);
    for (let i = 0; i < LIMITS.roomCreatesPerMinute; i += 1)
      expect(limiter.createAllowed(5)).toBe(true);
    expect(limiter.createAllowed(5)).toBe(false);
  });
});
