// Ana iş parçacığı ile yazım iş parçacığı arasındaki mesajlar.
import type { BatchOutcome, StoreSnapshot, WriteRequest } from './types.ts';

export type WorkerRequest =
  | { kind: 'batch'; batchId: number; requests: WriteRequest[] }
  | { kind: 'load'; reqId: number }
  | { kind: 'ping'; reqId: number }
  | { kind: 'checkpoint'; reqId: number }
  | { kind: 'close'; reqId: number };

export type WorkerResponse =
  | { kind: 'ready'; quarantined: boolean }
  | { kind: 'fatal'; errorCode: string }
  | { kind: 'batchResult'; batchId: number; outcome: BatchOutcome }
  | { kind: 'loaded'; reqId: number; snapshot: StoreSnapshot }
  | { kind: 'pong'; reqId: number }
  | { kind: 'done'; reqId: number; count: number }
  | { kind: 'error'; reqId: number; batchId?: number; errorCode: string };
