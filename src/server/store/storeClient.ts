// StoreWriter'ın ana iş parçacığı tarafı: yazım isteklerini aynı olay döngüsü turunda toplar
// (grup kaydı, en fazla 512 istek), aynı anda tek toplu işlem gönderir ve sonuçları isteklere
// dağıtır (performance-design "Grup kaydı", reliability-design "Yazım iş parçacığı").
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Worker } from 'node:worker_threads';
import { readMigrations, StoreEngine } from './storeEngine.ts';
import type { BatchOutcome, StoreSnapshot, WriteOp, WriteRequest, WriteResult } from './types.ts';
import type { WorkerRequest, WorkerResponse } from './workerProtocol.ts';

export const MAX_BATCH = 512;
const WORKER_TIMEOUT_MS = 5000;
const SECOND_FAILURE_WINDOW_MS = 60_000;

export interface StoreBackend {
  start(): Promise<{ quarantined: boolean }>;
  runBatch(requests: WriteRequest[]): Promise<BatchOutcome>;
  load(): Promise<StoreSnapshot>;
  ping(timeoutMs: number): Promise<boolean>;
  /** WAL kısaltma ve eski bozuk dosyaların silinmesi; silinen dosya sayısını döner. */
  maintenance(): Promise<number>;
  close(): Promise<void>;
}

/** Göç klasörü: kaynak ağaçta src/server/store/migrations, derlemede dist/server/store/migrations. */
export function defaultMigrationsDir(): string {
  return fileURLToPath(new URL('./migrations/', import.meta.url));
}

/** Testler için aynı iş parçacığında çalışan arka uç (aynı StoreEngine). */
export class InlineBackend implements StoreBackend {
  private engine: StoreEngine | null = null;
  private readonly dbPath: string;
  private readonly migrationsDir: string;
  failNextCommit = false;

  constructor(dbPath: string, migrationsDir = defaultMigrationsDir()) {
    this.dbPath = dbPath;
    this.migrationsDir = migrationsDir;
  }

  async start() {
    const opened = StoreEngine.open(this.dbPath);
    opened.engine.migrate(readMigrations(this.migrationsDir));
    this.engine = opened.engine;
    return { quarantined: opened.quarantined };
  }

  private get live(): StoreEngine {
    if (!this.engine) throw new Error('store not started');
    return this.engine;
  }

  async runBatch(requests: WriteRequest[]) {
    await new Promise((resolve) => setImmediate(resolve));
    if (this.failNextCommit) {
      this.failNextCommit = false;
      return {
        results: requests.map((r) => ({
          id: r.id,
          status: 'failed' as const,
          errorCode: 'TEST_FAILURE',
        })),
        commitMs: 0,
      };
    }
    return this.live.runBatch(requests);
  }

  async load() {
    return this.live.loadAll();
  }

  async ping() {
    return this.engine !== null;
  }

  async maintenance() {
    this.live.checkpoint();
    return this.live.purgeCorruptFiles(Date.now());
  }

  async close() {
    this.engine?.close();
    this.engine = null;
  }
}

interface Pending {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
}

/** Yazım iş parçacığında çalışan arka uç; çökme ya da 5 sn yanıtsızlıkta bir kez yeniden başlar. */
export class WorkerBackend implements StoreBackend {
  private worker: Worker | null = null;
  private readonly pending = new Map<string, Pending>();
  private nextId = 1;
  private lastFailureAt = 0;
  private closing = false;
  private readonly dbPath: string;
  private readonly migrationsDir: string;
  private readonly onFatal: (errorCode: string) => void;
  private readonly onRestart: (errorCode: string) => void;

  constructor(options: {
    dbPath: string;
    migrationsDir?: string;
    onFatal: (errorCode: string) => void;
    onRestart: (errorCode: string) => void;
  }) {
    this.dbPath = options.dbPath;
    this.migrationsDir = options.migrationsDir ?? defaultMigrationsDir();
    this.onFatal = options.onFatal;
    this.onRestart = options.onRestart;
  }

  private workerFile(): URL {
    const ts = new URL('./writerWorker.ts', import.meta.url);
    return import.meta.url.endsWith('.ts') && existsSync(fileURLToPath(ts))
      ? ts
      : new URL('./writerWorker.js', import.meta.url);
  }

  start(): Promise<{ quarantined: boolean }> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerFile(), {
        workerData: { dbPath: this.dbPath, migrationsDir: this.migrationsDir },
        resourceLimits: { maxOldGenerationSizeMb: 32 },
      });
      this.worker = worker;
      worker.once('message', (message: WorkerResponse) => {
        if (message.kind === 'ready') {
          worker.on('message', (m: WorkerResponse) => this.onMessage(m));
          resolve({ quarantined: message.quarantined });
        } else if (message.kind === 'fatal') {
          reject(Object.assign(new Error('store open failed'), { code: message.errorCode }));
        }
      });
      worker.on('error', (error) =>
        this.handleFailure((error as { name?: string }).name ?? 'WorkerError'),
      );
      worker.on('exit', (code) => {
        if (!this.closing && this.worker === worker) this.handleFailure(`WORKER_EXIT_${code}`);
      });
    });
  }

  private handleFailure(errorCode: string): void {
    for (const [key, pending] of this.pending) {
      clearTimeout(pending.timer);
      pending.reject(Object.assign(new Error('store worker lost'), { code: errorCode }));
      this.pending.delete(key);
    }
    const old = this.worker;
    this.worker = null;
    void old?.terminate();
    const now = Date.now();
    if (now - this.lastFailureAt < SECOND_FAILURE_WINDOW_MS) {
      this.onFatal(errorCode);
      return;
    }
    this.lastFailureAt = now;
    this.onRestart(errorCode);
    this.start().catch(() => this.onFatal('WORKER_RESTART_FAILED'));
  }

  private onMessage(message: WorkerResponse): void {
    const key =
      message.kind === 'batchResult'
        ? `b${message.batchId}`
        : message.kind === 'error' && message.batchId !== undefined
          ? `b${message.batchId}`
          : 'reqId' in message
            ? `r${message.reqId}`
            : '';
    const pending = this.pending.get(key);
    if (!pending) return;
    clearTimeout(pending.timer);
    this.pending.delete(key);
    if (message.kind === 'error')
      pending.reject(Object.assign(new Error('store error'), { code: message.errorCode }));
    else if (message.kind === 'batchResult') pending.resolve(message.outcome);
    else if (message.kind === 'loaded') pending.resolve(message.snapshot);
    else if (message.kind === 'done') pending.resolve(message.count);
    else pending.resolve(true);
  }

  private call<T>(key: string, message: WorkerRequest, timeoutMs = WORKER_TIMEOUT_MS): Promise<T> {
    const worker = this.worker;
    if (!worker)
      return Promise.reject(
        Object.assign(new Error('store worker unavailable'), { code: 'WORKER_DOWN' }),
      );
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(key);
        reject(Object.assign(new Error('store timeout'), { code: 'WORKER_TIMEOUT' }));
        if (message.kind === 'batch') this.handleFailure('WORKER_TIMEOUT');
      }, timeoutMs);
      this.pending.set(key, { resolve: resolve as (v: unknown) => void, reject, timer });
      worker.postMessage(message);
    });
  }

  runBatch(requests: WriteRequest[]): Promise<BatchOutcome> {
    const batchId = this.nextId++;
    return this.call(`b${batchId}`, { kind: 'batch', batchId, requests });
  }

  load(): Promise<StoreSnapshot> {
    const reqId = this.nextId++;
    return this.call(`r${reqId}`, { kind: 'load', reqId }, 60_000);
  }

  async ping(timeoutMs: number): Promise<boolean> {
    const reqId = this.nextId++;
    try {
      return await this.call<boolean>(`r${reqId}`, { kind: 'ping', reqId }, timeoutMs);
    } catch {
      return false;
    }
  }

  maintenance(): Promise<number> {
    const reqId = this.nextId++;
    return this.call(`r${reqId}`, { kind: 'checkpoint', reqId }, 60_000);
  }

  async close(): Promise<void> {
    if (!this.worker) return;
    const reqId = this.nextId++;
    try {
      await this.call(`r${reqId}`, { kind: 'close', reqId });
    } finally {
      this.closing = true;
      await this.worker?.terminate();
      this.worker = null;
    }
  }
}

interface QueuedWrite {
  request: WriteRequest;
  resolve: (result: WriteResult) => void;
}

export interface SubmittedWrite {
  id: number;
  result: Promise<WriteResult>;
}

/** Ana iş parçacığının depo istemcisi: grup kaydı ve aynı anda tek toplu işlem. */
export class StoreClient {
  private readonly backend: StoreBackend;
  private readonly queue: QueuedWrite[] = [];
  private inFlight = false;
  private flushScheduled = false;
  private nextId = 1;
  private readonly onCommit: (commitMs: number, size: number) => void;

  constructor(
    backend: StoreBackend,
    onCommit: (commitMs: number, size: number) => void = () => {},
  ) {
    this.backend = backend;
    this.onCommit = onCommit;
  }

  start() {
    return this.backend.start();
  }

  /** Bir komutun bütün yazımlarını tek istek olarak sıraya koyar (ya hepsi ya hiçbiri). */
  submit(ops: WriteOp[], dependsOn?: number): SubmittedWrite {
    const id = this.nextId++;
    const request: WriteRequest = dependsOn === undefined ? { id, ops } : { id, ops, dependsOn };
    const result = new Promise<WriteResult>((resolve) => this.queue.push({ request, resolve }));
    this.scheduleFlush();
    return { id, result };
  }

  pendingCount(): number {
    return this.queue.length;
  }

  private scheduleFlush(): void {
    if (this.flushScheduled || this.inFlight) return;
    this.flushScheduled = true;
    setImmediate(() => {
      this.flushScheduled = false;
      void this.flush();
    });
  }

  private async flush(): Promise<void> {
    if (this.inFlight || this.queue.length === 0) return;
    this.inFlight = true;
    const batch = this.queue.splice(0, MAX_BATCH);
    try {
      const outcome = await this.backend.runBatch(batch.map((b) => b.request));
      this.onCommit(outcome.commitMs, batch.length);
      const byId = new Map(outcome.results.map((r) => [r.id, r]));
      for (const item of batch)
        item.resolve(
          byId.get(item.request.id) ?? {
            id: item.request.id,
            status: 'failed',
            errorCode: 'MISSING_RESULT',
          },
        );
    } catch (error) {
      const code = (error as { code?: string }).code ?? 'STORE_ERROR';
      for (const item of batch)
        item.resolve({ id: item.request.id, status: 'failed', errorCode: code });
    } finally {
      this.inFlight = false;
      if (this.queue.length > 0) this.scheduleFlush();
    }
  }

  load() {
    return this.backend.load();
  }

  ping(timeoutMs = 1000) {
    return this.backend.ping(timeoutMs);
  }

  maintenance() {
    return this.backend.maintenance();
  }

  async close(): Promise<void> {
    while (this.queue.length > 0 || this.inFlight)
      await new Promise((resolve) => setTimeout(resolve, 5));
    await this.backend.close();
  }
}
