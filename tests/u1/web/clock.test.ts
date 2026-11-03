// Sunucu saati farkı (NFR14.1, BR9.6): telefon saati 5 dakika kaymış olsa da kalan süre
// sunucuyla 1 saniye içinde hesaplanır.
import { describe, expect, it } from 'vitest';
import { formatRemaining, ServerClock } from '../../../src/web/net/clock.ts';

describe('ServerClock', () => {
  it('saati 5 dakika geri olan telefon kalan süreyi 1 saniye içinde hesaplar', () => {
    const serverNow = 10_000_000;
    let local = serverNow - 5 * 60_000;
    const clock = new ServerClock(() => local);
    const sentAt = local;
    local += 120; // 120 ms gidiş-dönüş
    clock.onPong(sentAt, serverNow + 60);
    const deadline = serverNow + 120 + 30_000;
    expect(Math.abs(clock.remaining(deadline) - 30_000)).toBeLessThan(1000);
  });

  it('son 5 ölçümün en kısa gidiş-dönüşlüsünü kullanır', () => {
    let local = 0;
    const clock = new ServerClock(() => local);
    local = 900;
    clock.onPong(0, 10_000); // rtt 900 → fark 9550
    local = 1000;
    clock.onPong(990, 10_100); // rtt 10 → fark 9105
    expect(clock.offset()).toBe(9105);
  });

  it('pong yokken görünümdeki sunucu saati kaba fark olarak kullanılır; pong gelince bırakılır', () => {
    const local = 1000;
    const clock = new ServerClock(() => local);
    expect(clock.offset()).toBe(0);
    clock.onServerTime(6000);
    expect(clock.offset()).toBe(5000);
    clock.onPong(1000, 2000);
    clock.onServerTime(99_999);
    expect(clock.offset()).toBe(1000);
  });

  it('kalan süre negatife düşmez', () => {
    const clock = new ServerClock(() => 5000);
    expect(clock.remaining(1000)).toBe(0);
  });
});

describe('formatRemaining', () => {
  it('d:ss biçiminde yazar ve yukarı yuvarlar', () => {
    expect(formatRemaining(240_000)).toBe('4:00');
    expect(formatRemaining(61_001)).toBe('1:02');
    expect(formatRemaining(9_000)).toBe('0:09');
    expect(formatRemaining(0)).toBe('0:00');
  });
});
