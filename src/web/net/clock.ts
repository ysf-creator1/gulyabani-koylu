// Sunucu saati farkı (NFR14.1, BR9.6): pong gelince gidiş-dönüş ölçülür ve fark
// serverTime + rtt/2 − yerel saat olarak hesaplanır; son 5 ölçümün en kısa gidiş-dönüşlüsü
// kullanılır. Hiç pong yokken view'daki serverTime kaba fark olarak kullanılır.
const SAMPLES = 5;

interface Sample {
  rtt: number;
  offset: number;
}

export class ServerClock {
  private samples: Sample[] = [];
  private roughOffset: number | null = null;
  private readonly localNow: () => number;

  constructor(localNow: () => number = () => Date.now()) {
    this.localNow = localNow;
  }

  onPong(clientTime: number, serverTime: number): void {
    const now = this.localNow();
    const rtt = Math.max(0, now - clientTime);
    this.samples = [...this.samples, { rtt, offset: serverTime + rtt / 2 - now }].slice(-SAMPLES);
  }

  onServerTime(serverTime: number): void {
    if (this.samples.length === 0) this.roughOffset = serverTime - this.localNow();
  }

  offset(): number {
    if (this.samples.length > 0) {
      const best = this.samples.reduce((a, b) => (b.rtt < a.rtt ? b : a));
      return best.offset;
    }
    return this.roughOffset ?? 0;
  }

  /** Sunucu saatine göre şimdi. */
  now(): number {
    return this.localNow() + this.offset();
  }

  /** Bitiş zamanına kalan milisaniye (en az 0). */
  remaining(deadline: number): number {
    return Math.max(0, deadline - this.now());
  }
}

/** Kalan süreyi d:ss biçiminde verir. */
export function formatRemaining(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
