// RoomQueue: her odanın tek sırası (BR10.2). Oda sıradaki bütün komutları aday durum üzerinde
// sırayla hesaplar, yazımlarını aynı toplu işleme verir (oda içi boru hattı) ve onayları ancak
// yazım kesinleşince gönderir. Tekrar denetimi sırada yapılır; sıra üst sınırı aşılırsa yük
// atılır (scalability-design Aşırı Yükte Davranış).
import type { AckStatus } from '../../shared/protocol.ts';
import type { ReasonCode } from '../../shared/reasonCodes.ts';
import type { RandomSource } from '../../rules/types.ts';
import { DUPLICATE, rejectWith, type CommandContext, type Outcome } from '../commands.ts';
import { isKnownCommand, type RoomAggregate } from '../model.ts';
import type { Logger } from '../ops/logger.ts';
import type { Metrics } from '../ops/metrics.ts';
import type { SubmittedWrite } from '../store/storeClient.ts';
import type { WriteOp } from '../store/types.ts';

export const MAX_QUEUE_PER_ROOM = 100;
export const MAX_PENDING_WRITES = 2000;
const MAX_RECOMPUTE = 2;

export interface QueueItem {
  /** Tekrar denetimi numarası; sistem komutlarında tekrar anahtarı. */
  commandId: string | null;
  label: string;
  receivedAt: number;
  run: (agg: RoomAggregate | undefined, ctx: CommandContext) => Outcome;
  /** İstemci komutunun onayı. */
  respond?: (status: AckStatus, reasonCode?: ReasonCode) => void;
  /** Sonuç kesinleşince (ya da ret/düşme) çağrılır. */
  done?: (outcome: Outcome, committed: boolean) => void;
  attempts?: number;
}

export interface RoomQueueDeps {
  get(roomCode: string): RoomAggregate | undefined;
  set(roomCode: string, agg: RoomAggregate | null): void;
  submit(ops: WriteOp[], dependsOn?: number): SubmittedWrite;
  pendingWrites(): number;
  onCommitted(
    roomCode: string,
    outcome: Outcome,
    previous: RoomAggregate | undefined,
    next: RoomAggregate | undefined,
  ): void;
  onDuplicate(roomCode: string, item: QueueItem): void;
  metrics: Metrics;
  logger: Logger;
  clock: () => number;
  random: RandomSource;
  newId: () => string;
}

interface Planned {
  item: QueueItem;
  outcome: Outcome;
  write?: SubmittedWrite;
}

interface RoomLine {
  items: QueueItem[];
  busy: boolean;
}

export class RoomQueues {
  private readonly lines = new Map<string, RoomLine>();
  private readonly deps: RoomQueueDeps;
  private idleWaiters: (() => void)[] = [];

  constructor(deps: RoomQueueDeps) {
    this.deps = deps;
  }

  /** Komutu odanın sırasına koyar; sıra ya da yazım bekleyenler doluysa false (server_busy). */
  enqueue(roomCode: string, item: QueueItem): boolean {
    let line = this.lines.get(roomCode);
    if (!line) {
      line = { items: [], busy: false };
      this.lines.set(roomCode, line);
    }
    if (
      line.items.length >= MAX_QUEUE_PER_ROOM ||
      this.deps.pendingWrites() >= MAX_PENDING_WRITES
    ) {
      this.deps.logger.warn('overload', { roomCode, count: line.items.length });
      return false;
    }
    line.items.push(item);
    this.schedule(roomCode, line);
    return true;
  }

  private schedule(roomCode: string, line: RoomLine): void {
    if (line.busy) return;
    line.busy = true;
    queueMicrotask(() => {
      this.process(roomCode, line).catch((error) => {
        this.deps.metrics.recordError();
        this.deps.logger.error('fatal', { roomCode, err: error });
      });
    });
  }

  private plan(roomCode: string, items: QueueItem[]): Planned[] {
    const ctx: CommandContext = {
      now: this.deps.clock(),
      random: this.deps.random,
      newId: this.deps.newId,
    };
    let candidate = this.deps.get(roomCode);
    let lastWrite: number | undefined;
    const planned: Planned[] = [];
    for (const item of items) {
      let outcome: Outcome;
      if (item.commandId && candidate && isKnownCommand(candidate, item.commandId)) {
        outcome = DUPLICATE;
      } else {
        try {
          outcome = item.run(candidate, ctx);
        } catch (error) {
          this.deps.logger.error('command.internal_error', {
            roomCode,
            command: item.label,
            commandId: item.commandId ?? undefined,
            err: error,
          });
          outcome = rejectWith('internal_error');
        }
      }
      const entry: Planned = { item, outcome };
      if (outcome.status === 'accepted') {
        if (outcome.ops.length > 0) {
          entry.write = this.deps.submit(outcome.ops, lastWrite);
          lastWrite = entry.write.id;
        }
        candidate = outcome.next === null ? undefined : (outcome.next ?? candidate);
      }
      planned.push(entry);
    }
    return planned;
  }

  private async process(roomCode: string, line: RoomLine): Promise<void> {
    const items = line.items.splice(0);
    const planned = this.plan(roomCode, items);
    let committed = this.deps.get(roomCode);
    for (let i = 0; i < planned.length; i += 1) {
      const entry = planned[i] as Planned;
      if (entry.write) {
        const result = await entry.write.result;
        if (result.status !== 'committed') {
          this.fail(roomCode, entry, result.errorCode);
          this.requeue(line, planned.slice(i + 1));
          break;
        }
      }
      if (entry.outcome.status === 'accepted') {
        const previous = committed;
        committed = entry.outcome.next === null ? undefined : (entry.outcome.next ?? committed);
        this.deps.set(roomCode, committed ?? null);
        this.deps.onCommitted(roomCode, entry.outcome, previous, committed);
      }
      this.finish(roomCode, entry.item, entry.outcome, entry.outcome.status === 'accepted');
    }
    line.busy = false;
    if (line.items.length > 0) this.schedule(roomCode, line);
    else if (!this.deps.get(roomCode)) this.lines.delete(roomCode);
    this.notifyIdle();
  }

  /** Yazımı başarısız olan komut internal_error alır; durum değişmez (BR10.2). */
  private fail(roomCode: string, entry: Planned, errorCode: string | undefined): void {
    this.deps.metrics.recordError();
    this.deps.logger.error('store.batch_failed', {
      roomCode,
      command: entry.item.label,
      commandId: entry.item.commandId ?? undefined,
      err: { name: 'StoreWriteFailed', code: errorCode },
    });
    this.finish(roomCode, entry.item, rejectWith('internal_error'), false);
  }

  /** Bağımlılığı başarısız olan sonraki komutlar kesinleşmiş durumun üzerine yeniden hesaplanır. */
  private requeue(line: RoomLine, rest: Planned[]): void {
    const again: QueueItem[] = [];
    for (const entry of rest) {
      const attempts = (entry.item.attempts ?? 0) + 1;
      if (attempts > MAX_RECOMPUTE)
        this.finish('', entry.item, rejectWith('internal_error'), false);
      else again.push({ ...entry.item, attempts });
    }
    line.items.unshift(...again);
  }

  private finish(roomCode: string, item: QueueItem, outcome: Outcome, committed: boolean): void {
    const internal = outcome.reasonCode === 'internal_error';
    if (item.respond) {
      this.deps.metrics.commandDone(this.deps.clock() - item.receivedAt, internal);
      if (outcome.status === 'dropped') item.respond('rejected', 'phase_closed');
      else
        item.respond(
          outcome.status === 'accepted' ? 'accepted' : outcome.status,
          outcome.reasonCode,
        );
      if (outcome.status === 'duplicate') this.deps.onDuplicate(roomCode, item);
    }
    item.done?.(outcome, committed);
  }

  pending(): number {
    let total = 0;
    for (const line of this.lines.values()) total += line.items.length + (line.busy ? 1 : 0);
    return total;
  }

  private notifyIdle(): void {
    if (this.pending() > 0) return;
    const waiters = this.idleWaiters;
    this.idleWaiters = [];
    for (const resolve of waiters) resolve();
  }

  /** Sıradaki ve yoldaki bütün komutlar bitince çözülür (kapanış ve testler). */
  idle(): Promise<void> {
    if (this.pending() === 0) return Promise.resolve();
    return new Promise((resolve) => this.idleWaiters.push(resolve));
  }
}
