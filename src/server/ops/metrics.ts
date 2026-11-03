// Bellek içi ölçümler (observability-design Bellek İçi Ölçümler, NFR13.4). Program yeniden
// başlayınca sıfırlanır. Yüzdelikler son 5 dakikanın dakikalık kovalarından yaklaşık hesaplanır.
import { monitorEventLoopDelay } from 'node:perf_hooks';

type IntervalHistogram = ReturnType<typeof monitorEventLoopDelay>;

const BOUNDS = [1, 2, 5, 10, 20, 50, 100, 150, 200, 300, 400, 500, 1000, Number.POSITIVE_INFINITY];
const WINDOW_MINUTES = 5;

/** Son 5 dakikanın sabit sınırlı sayım çizelgesi. */
export class RollingHistogram {
  private readonly minutes = new Map<number, number[]>();
  private readonly clock: () => number;

  constructor(clock: () => number = Date.now) {
    this.clock = clock;
  }

  record(valueMs: number): void {
    const minute = Math.floor(this.clock() / 60_000);
    let counts = this.minutes.get(minute);
    if (!counts) {
      counts = new Array<number>(BOUNDS.length).fill(0);
      this.minutes.set(minute, counts);
      for (const key of this.minutes.keys())
        if (key <= minute - WINDOW_MINUTES) this.minutes.delete(key);
    }
    const index = BOUNDS.findIndex((bound) => valueMs <= bound);
    counts[index]! += 1;
  }

  /** p (0–100) yüzdeliğinin kova üst sınırı; veri yoksa 0. */
  percentile(p: number): number {
    const minute = Math.floor(this.clock() / 60_000);
    const merged = new Array<number>(BOUNDS.length).fill(0);
    for (const [key, counts] of this.minutes) {
      if (key <= minute - WINDOW_MINUTES) continue;
      counts.forEach((count, i) => (merged[i]! += count));
    }
    const total = merged.reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    const rank = (p / 100) * total;
    let seen = 0;
    for (let i = 0; i < merged.length; i += 1) {
      seen += merged[i]!;
      if (seen >= rank) return Number.isFinite(BOUNDS[i]!) ? BOUNDS[i]! : 1000;
    }
    return 1000;
  }
}

export interface Gauges {
  activeRooms: number;
  activeMatches: number;
  connections: number;
  writeQueueDepth: number;
}

export class Metrics {
  errorCount = 0;
  commandsProcessed = 0;
  commandsTotal = 0;
  commandsUnder150Ms = 0;
  commandInternalErrors = 0;
  viewsSkipped = 0;
  sweepDeleted = 0;
  sweepFailed = 0;
  readonly latency: RollingHistogram;
  readonly commit: RollingHistogram;
  private readonly loopDelay: IntervalHistogram;
  private readonly startedAt: number;
  private readonly clock: () => number;

  constructor(clock: () => number = Date.now) {
    this.clock = clock;
    this.latency = new RollingHistogram(clock);
    this.commit = new RollingHistogram(clock);
    this.loopDelay = monitorEventLoopDelay({ resolution: 20 });
    this.loopDelay.enable();
    this.startedAt = clock();
  }

  /** Bir komutun işlenmesi bitti (kabul ya da ret); süre komutun okunmasından ölçülür. */
  commandDone(durationMs: number, internalError: boolean): void {
    this.commandsProcessed += 1;
    this.commandsTotal += 1;
    if (durationMs < 150) this.commandsUnder150Ms += 1;
    if (internalError) {
      this.commandInternalErrors += 1;
      this.errorCount += 1;
    }
    this.latency.record(durationMs);
  }

  recordError(): void {
    this.errorCount += 1;
  }

  snapshot(gauges: Gauges): Record<string, number> {
    const memory = process.memoryUsage();
    return {
      ...gauges,
      errorCount: this.errorCount,
      commandsProcessed: this.commandsProcessed,
      commandsTotal: this.commandsTotal,
      commandsUnder150Ms: this.commandsUnder150Ms,
      commandInternalErrors: this.commandInternalErrors,
      commandLatencyP50Ms: this.latency.percentile(50),
      commandLatencyP95Ms: this.latency.percentile(95),
      commitP95Ms: this.commit.percentile(95),
      eventLoopDelayP95Ms: Math.round(this.loopDelay.percentile(95) / 1e6),
      sweepDeleted: this.sweepDeleted,
      sweepFailed: this.sweepFailed,
      viewsSkipped: this.viewsSkipped,
      memoryRssMb: Math.round(memory.rss / 1048576),
      heapUsedMb: Math.round(memory.heapUsed / 1048576),
      uptimeSec: Math.round((this.clock() - this.startedAt) / 1000),
    };
  }

  close(): void {
    this.loopDelay.disable();
  }
}
