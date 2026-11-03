// ExpirySweep (BR12.1, BR12.3, C8): açılışta ve 10 dakikada bir süresi dolan odaları siler.
// Her oda kendi sırasında, tek yazım isteğinde, sahiplerin silme ifadeleriyle C8 sırasıyla
// silinir: oyun → sohbet → oturum → oda. Açık bağlantılar room_not_found ile kapanır.
// Bir silme başarısız olursa ötekiler sürer; sonraki taramada yeniden denenir.
import { purgeRoomMessages } from '../chat/chatService.ts';
import { DROPPED, type Outcome } from '../commands.ts';
import type { RoomQueues } from '../gateway/roomQueue.ts';
import type { SessionRegistry } from '../gateway/sessions.ts';
import type { RoomAggregate } from '../model.ts';
import { isExpired } from '../room/roomManager.ts';
import { deleteRoomMatches } from '../store/repos/matchRepo.ts';
import { deleteRoom } from '../store/repos/roomRepo.ts';
import { deleteRoomSessions, deleteSession } from '../store/repos/sessionRepo.ts';
import type { SubmittedWrite } from '../store/storeClient.ts';
import type { WriteOp } from '../store/types.ts';
import type { Logger } from './logger.ts';
import type { Metrics } from './metrics.ts';

export const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

/** C8 sırasıyla bir odanın bütün verisini silen sonuç. */
export function purgeRoomOutcome(agg: RoomAggregate, sessionIds: string[]): Outcome {
  const code = agg.room.roomCode;
  return {
    status: 'accepted',
    next: null,
    ops: [
      deleteRoomMatches(code),
      ...purgeRoomMessages(code),
      deleteRoomSessions(code),
      ...deleteRoom(code),
    ],
    effects: [{ kind: 'roomDeleted', roomCode: code, sessionIds }],
  };
}

export interface SweepDeps {
  roomCodes: () => string[];
  getRoom: (roomCode: string) => RoomAggregate | undefined;
  queues: RoomQueues;
  sessions: SessionRegistry;
  submit: (ops: WriteOp[]) => SubmittedWrite;
  maintenance: () => Promise<number>;
  metrics: Metrics;
  logger: Logger;
}

export class ExpirySweep {
  private readonly deps: SweepDeps;
  private running: Promise<{ deleted: number; failed: number }> | null = null;

  constructor(deps: SweepDeps) {
    this.deps = deps;
  }

  run(now: number): Promise<{ deleted: number; failed: number }> {
    this.running ??= this.sweep(now).finally(() => {
      this.running = null;
    });
    return this.running;
  }

  private purgeRoom(roomCode: string, now: number): Promise<boolean> {
    return new Promise((resolve) => {
      const queued = this.deps.queues.enqueue(roomCode, {
        commandId: null,
        label: 'system.purge',
        receivedAt: now,
        run: (agg) =>
          agg && isExpired(agg, now)
            ? purgeRoomOutcome(
                agg,
                this.deps.sessions.inRoom(roomCode).map((s) => s.sessionId),
              )
            : DROPPED,
        done: (outcome, committed) => resolve(outcome.status === 'dropped' || committed),
      });
      if (!queued) resolve(false);
    });
  }

  private async purgeIdleSessions(now: number): Promise<{ deleted: number; failed: number }> {
    const idle = this.deps.sessions.idleUnbound(now);
    const results = await Promise.all(
      idle.map((s) => this.deps.submit([deleteSession(s.sessionId)]).result),
    );
    let failed = 0;
    results.forEach((result, i) => {
      if (result.status === 'committed')
        this.deps.sessions.remove((idle[i] as { sessionId: string }).sessionId);
      else failed += 1;
    });
    return { deleted: idle.length - failed, failed };
  }

  private async sweep(now: number): Promise<{ deleted: number; failed: number }> {
    const expired = this.deps.roomCodes().filter((code) => {
      const agg = this.deps.getRoom(code);
      return agg !== undefined && isExpired(agg, now);
    });
    const outcomes = await Promise.all(expired.map((code) => this.purgeRoom(code, now)));
    const sessions = await this.purgeIdleSessions(now);
    let deleted = outcomes.filter(Boolean).length + sessions.deleted;
    let failed = outcomes.filter((ok) => !ok).length + sessions.failed;
    try {
      deleted += await this.deps.maintenance();
    } catch (error) {
      failed += 1;
      this.deps.logger.error('store.batch_failed', { err: error });
    }
    if (failed > 0) for (let i = 0; i < failed; i += 1) this.deps.metrics.recordError();
    this.deps.metrics.sweepDeleted = deleted;
    this.deps.metrics.sweepFailed = failed;
    this.deps.logger.info('sweep.done', { count: deleted, durationMs: 0 });
    return { deleted, failed };
  }
}
