// Oda sırası (BR10.2, NFR5.1, scalability-design yük atma): sırayla işleme, önce kayıt sonra
// onay, tekrar denetimi, başarısız yazımda internal_error ve sonraki komutların yeniden hesabı.
import { describe, expect, it } from 'vitest';
import type { Outcome } from '../../../src/server/commands.ts';
import {
  MAX_QUEUE_PER_ROOM,
  RoomQueues,
  type QueueItem,
} from '../../../src/server/gateway/roomQueue.ts';
import type { RoomAggregate } from '../../../src/server/model.ts';
import { silentLogger } from '../../../src/server/ops/logger.ts';
import { Metrics } from '../../../src/server/ops/metrics.ts';
import type { SubmittedWrite } from '../../../src/server/store/storeClient.ts';
import type { WriteResult } from '../../../src/server/store/types.ts';
import { zeroRandom } from '../rules/helpers.ts';
import { makeAgg } from './fixtures.ts';

function setup(failWrite: (n: number) => boolean = () => false) {
  const rooms = new Map<string, RoomAggregate>([['123456', makeAgg('')]]);
  const committed: number[] = [];
  let writes = 0;
  const metrics = new Metrics();
  const queues = new RoomQueues({
    get: (code) => rooms.get(code),
    set: (code, agg) => (agg ? rooms.set(code, agg) : rooms.delete(code)),
    submit: (): SubmittedWrite => {
      writes += 1;
      const n = writes;
      const result: Promise<WriteResult> = new Promise((resolve) =>
        setTimeout(() => resolve({ id: n, status: failWrite(n) ? 'failed' : 'committed' }), 1),
      );
      return { id: n, result };
    },
    pendingWrites: () => 0,
    onCommitted: (_code, outcome) => committed.push(outcome.next?.room.version ?? -1),
    onDuplicate: () => {},
    metrics,
    logger: silentLogger,
    clock: () => 1000,
    random: zeroRandom,
    newId: () => 'id',
  });
  return { rooms, queues, committed, metrics };
}

/** Oda sürümünü bir artıran ve numarasını kaydeden komut. */
function bump(commandId: string, acks: string[]): QueueItem {
  return {
    commandId,
    label: 'test.bump',
    receivedAt: 0,
    run: (agg): Outcome => ({
      status: 'accepted',
      next: {
        ...agg!,
        room: {
          ...agg!.room,
          version: agg!.room.version + 1,
          processedCommandIds: [...agg!.room.processedCommandIds, commandId],
        },
      },
      ops: [{ sql: 'SELECT 1', params: [] }],
    }),
    respond: (status, reason) => acks.push(`${commandId}:${status}${reason ? `:${reason}` : ''}`),
  };
}

describe('oda sırası', () => {
  it('komutlar sırayla aday durum üzerinde işlenir; onay yazımdan sonra gelir', async () => {
    const { queues, rooms, committed } = setup();
    const acks: string[] = [];
    queues.enqueue('123456', bump('a', acks));
    queues.enqueue('123456', bump('b', acks));
    queues.enqueue('123456', bump('c', acks));
    expect(acks).toEqual([]);
    await queues.idle();
    expect(acks).toEqual(['a:accepted', 'b:accepted', 'c:accepted']);
    expect(committed).toEqual([2, 3, 4]);
    expect(rooms.get('123456')!.room.version).toBe(4);
  });

  it('bilinen numara yeniden işlenmez, duplicate döner', async () => {
    const { queues } = setup();
    const acks: string[] = [];
    queues.enqueue('123456', bump('a', acks));
    await queues.idle();
    queues.enqueue('123456', bump('a', acks));
    await queues.idle();
    expect(acks).toEqual(['a:accepted', 'a:duplicate']);
  });

  it('yazımı başarısız komut internal_error alır, durum değişmez; sonrakiler yeniden hesaplanır', async () => {
    const { queues, rooms, metrics } = setup((n) => n === 1);
    const acks: string[] = [];
    queues.enqueue('123456', bump('a', acks));
    queues.enqueue('123456', bump('b', acks));
    await queues.idle();
    expect(acks).toEqual(['a:rejected:internal_error', 'b:accepted']);
    expect(rooms.get('123456')!.room.version).toBe(2);
    expect(rooms.get('123456')!.room.processedCommandIds).toEqual(['b']);
    expect(metrics.commandInternalErrors).toBe(1);
  });

  it('işleyici hata fırlatırsa komut internal_error alır, sıra sürer', async () => {
    const { queues } = setup();
    const acks: string[] = [];
    queues.enqueue('123456', {
      commandId: 'boom',
      label: 'test.boom',
      receivedAt: 0,
      run: () => {
        throw new TypeError('kural hatası');
      },
      respond: (status, reason) => acks.push(`boom:${status}:${reason}`),
    });
    queues.enqueue('123456', bump('ok', acks));
    await queues.idle();
    expect(acks).toEqual(['boom:rejected:internal_error', 'ok:accepted']);
  });

  it('sıra üst sınırında yeni komut kabul edilmez (server_busy)', () => {
    const { queues } = setup();
    const acks: string[] = [];
    for (let i = 0; i < MAX_QUEUE_PER_ROOM; i += 1)
      expect(queues.enqueue('123456', bump(`c${i}`, acks))).toBe(true);
    expect(queues.enqueue('123456', bump('extra', acks))).toBe(false);
  });
});
