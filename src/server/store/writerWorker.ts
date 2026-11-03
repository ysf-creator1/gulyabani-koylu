// Yazım iş parçacığı (StoreWriter): oyun deposunu yalnızca bu iş parçacığı açar; ana iş
// parçacığı disk beklerken mesaj okumaya ve görünüm göndermeye devam eder (performance-design).
// Bütün iş StoreEngine'dedir; bu dosya yalnızca mesajları taşır.
import { parentPort, workerData } from 'node:worker_threads';
import { readMigrations, StoreEngine } from './storeEngine.ts';
import type { WorkerRequest, WorkerResponse } from './workerProtocol.ts';

interface WorkerInit {
  dbPath: string;
  migrationsDir: string;
}

const port = parentPort;
if (!port) throw new Error('writerWorker must run as a worker thread');

const init = workerData as WorkerInit;

function post(message: WorkerResponse): void {
  port!.postMessage(message);
}

function failure(error: unknown): string {
  const e = error as { code?: unknown; name?: unknown };
  return typeof e?.code === 'string' ? e.code : typeof e?.name === 'string' ? e.name : 'Error';
}

let engine: StoreEngine;
try {
  const opened = StoreEngine.open(init.dbPath);
  engine = opened.engine;
  engine.migrate(readMigrations(init.migrationsDir));
  post({ kind: 'ready', quarantined: opened.quarantined });
} catch (error) {
  post({ kind: 'fatal', errorCode: failure(error) });
  process.exit(1);
}

port.on('message', (message: WorkerRequest) => {
  try {
    switch (message.kind) {
      case 'batch':
        post({
          kind: 'batchResult',
          batchId: message.batchId,
          outcome: engine.runBatch(message.requests),
        });
        break;
      case 'load':
        post({ kind: 'loaded', reqId: message.reqId, snapshot: engine.loadAll() });
        break;
      case 'ping':
        post({ kind: 'pong', reqId: message.reqId });
        break;
      case 'checkpoint':
        engine.checkpoint();
        post({ kind: 'done', reqId: message.reqId, count: engine.purgeCorruptFiles(Date.now()) });
        break;
      case 'close':
        engine.close();
        post({ kind: 'done', reqId: message.reqId, count: 0 });
        break;
    }
  } catch (error) {
    const reqId = 'reqId' in message ? message.reqId : -1;
    const batchId = message.kind === 'batch' ? message.batchId : undefined;
    post({ kind: 'error', reqId, batchId, errorCode: failure(error) });
  }
});
