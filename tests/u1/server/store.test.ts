// Kalıcı depo (C9, TD-03, TD-04): önce kayıt sonra kabul, toplu işlem, açılış yüklemesi,
// sürüm denetimi, tekrar numarası, fiziksel silme (NFR7.14) ve IP yokluğu (NFR7.11).
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  insertMessage,
  deleteRoomMessages,
  trimChannel,
} from '../../../src/server/store/repos/chatRepo.ts';
import { insertMatch, updateMatch } from '../../../src/server/store/repos/matchRepo.ts';
import {
  insertParticipant,
  insertRoom,
  updateRoom,
} from '../../../src/server/store/repos/roomRepo.ts';
import { insertSession } from '../../../src/server/store/repos/sessionRepo.ts';
import {
  InlineBackend,
  StoreClient,
  WorkerBackend,
} from '../../../src/server/store/storeClient.ts';
import { StoreEngine } from '../../../src/server/store/storeEngine.ts';
import type { Session } from '../../../src/server/model.ts';
import { newGame } from '../rules/helpers.ts';
import { chatMessage, makeAgg, matchRecord, participant } from './fixtures.ts';
import { makeTempDir, removeTempDir } from './tempDir.ts';

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const IPV6 = /\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/i;

let dir: string;
let backend: InlineBackend;
let store: StoreClient;

beforeEach(async () => {
  dir = makeTempDir('store');
  backend = new InlineBackend(join(dir, 'game.db'));
  store = new StoreClient(backend);
  await store.start();
});

afterEach(async () => {
  await store.close();
  removeTempDir(dir);
});

const session: Session = {
  sessionId: 'sess-pm',
  tokenHash: 'a'.repeat(64),
  createdAt: 1,
  roomCode: '123456',
  participantId: 'pm',
  connected: true,
  lastSeenAt: 1,
  deviceType: 'phone',
  revoked: false,
};

function fileBytes(): string {
  return readdirSync(dir)
    .filter((name) => name.startsWith('game.db'))
    .map((name) => readFileSync(join(dir, name)).toString('latin1'))
    .join('');
}

describe('önce kayıt sonra kabul (NFR5.1)', () => {
  it('kesinleşen istek depoda görünür; kesinleşmeyenin izi kalmaz', async () => {
    const agg = makeAgg('');
    const ok = await store.submit([insertRoom(agg.room), insertParticipant(agg.participants[0]!)])
      .result;
    expect(ok.status).toBe('committed');
    backend.failNextCommit = true;
    const failed = await store.submit([insertRoom({ ...agg.room, roomCode: '654321' })]).result;
    expect(failed.status).toBe('failed');
    const snapshot = await store.load();
    expect(snapshot.rooms.map((r) => r.roomCode)).toEqual(['123456']);
    expect(snapshot.participants).toHaveLength(1);
  });

  it('toplu işlemde bir isteğin hatası ötekileri bozmaz; ona bağlı istek geri alınır', async () => {
    const agg = makeAgg('');
    await store.submit([insertRoom(agg.room)]).result;
    const a = store.submit([insertRoom({ ...agg.room, roomCode: '111111' })]);
    const b = store.submit([updateRoom({ ...agg.room, version: 5 }, 4)]);
    const c = store.submit([insertRoom({ ...agg.room, roomCode: '222222' })]);
    const d = store.submit([insertRoom({ ...agg.room, roomCode: '333333' })], b.id);
    const results = await Promise.all([a.result, b.result, c.result, d.result]);
    expect(results.map((r) => r.status)).toEqual([
      'committed',
      'failed',
      'committed',
      'aborted_dependency',
    ]);
    expect(results[1]!.errorCode).toBe('STORE_CONFLICT');
    const codes = (await store.load()).rooms.map((r) => r.roomCode).sort();
    expect(codes).toEqual(['111111', '123456', '222222']);
  });
});

describe('sürüm ve tekrar numarası (C9, BR10.2)', () => {
  it('oyun kaydı yalnızca beklenen sürüm üzerine yazılır', async () => {
    const match = matchRecord(newGame('gvvv'), { processedCommandIds: ['c1'] });
    await store.submit([insertMatch(match, 1)]).result;
    const v2 = { ...match, persistedVersion: 2, processedCommandIds: ['c1', 'c2'] };
    expect((await store.submit([updateMatch(v2, 1, 2)]).result).status).toBe('committed');
    expect(
      (await store.submit([updateMatch({ ...v2, persistedVersion: 2 }, 1, 3)]).result).status,
    ).toBe('failed');
    const loaded = (await store.load()).matches[0]!;
    expect(loaded.persistedVersion).toBe(2);
    expect(loaded.processedCommandIds).toEqual(['c1', 'c2']);
    expect(loaded.state.seats).toHaveLength(4);
  });

  it('aynı commandId ile ikinci sohbet mesajı yazılamaz; numara açılışta bulunur', async () => {
    const message = chatMessage('day', 'selam');
    expect((await store.submit([insertMessage(message)]).result).status).toBe('committed');
    const again = await store.submit([insertMessage({ ...message, messageId: 'other' })]).result;
    expect(again.status).toBe('failed');
    const snapshot = await store.load();
    expect(snapshot.chatCommandIds).toEqual([{ roomCode: '123456', commandId: 'cmd-selam' }]);
  });
});

describe('açılış yüklemesi (C9 restore-rule)', () => {
  it('kapatıp yeniden açınca oda, katılımcı, oyun, sohbet ve oturum geri gelir', async () => {
    const agg = makeAgg('gvvv');
    await store.submit([
      insertRoom(agg.room),
      ...agg.participants.map(insertParticipant),
      insertMatch(agg.match!, 1),
      insertMessage(chatMessage('day', 'ilk')),
      insertSession(session),
    ]).result;
    await store.close();
    store = new StoreClient(new InlineBackend(join(dir, 'game.db')));
    await store.start();
    const snapshot = await store.load();
    expect(snapshot.rooms).toHaveLength(1);
    expect(snapshot.participants).toHaveLength(5);
    expect(snapshot.matches[0]!.state.phase).toBe('first_night');
    expect(snapshot.chat.map((m) => m.text)).toEqual(['ilk']);
    expect(snapshot.sessions[0]).toMatchObject({ sessionId: 'sess-pm', tokenHash: 'a'.repeat(64) });
  });

  it('kanal başına depoda en fazla 2.000 mesaj kalır, bellek yüklemesi son 100ü alır', async () => {
    const ops = Array.from({ length: 2005 }, (_, i) =>
      insertMessage({ ...chatMessage('day', `m${i}`), sentAt: i }),
    );
    await store.submit([...ops, trimChannel('123456', 'day')]).result;
    const snapshot = await store.load();
    expect(snapshot.chatCommandIds).toHaveLength(2000);
    expect(snapshot.chat).toHaveLength(100);
    expect(snapshot.chat.at(-1)!.text).toBe('m2004');
  });
});

describe('kişisel veri (NFR7.14, NFR7.11)', () => {
  it('silinen sohbet metni silme ve kısaltmadan sonra depo dosyalarında kalmaz', async () => {
    const marker = 'GIZLIMESAJ-7f3a91';
    await store.submit([insertMessage(chatMessage('day', marker))]).result;
    await store.maintenance();
    expect(fileBytes()).toContain(marker);
    await store.submit([deleteRoomMessages('123456')]).result;
    await store.maintenance();
    expect(fileBytes()).not.toContain(marker);
  });

  it('tipik oyun verisinden sonra depoda IP deseni yoktur', async () => {
    const agg = makeAgg('ggvvvvvv');
    await store.submit([
      insertRoom(agg.room),
      ...agg.participants.map(insertParticipant),
      insertMatch(agg.match!, 1),
      insertSession(session),
      insertMessage(chatMessage('day', 'oyun güzel')),
    ]).result;
    await store.maintenance();
    const bytes = fileBytes();
    expect(IPV4.test(bytes)).toBe(false);
    expect(IPV6.test(bytes)).toBe(false);
  });
});

describe('bozuk depo (NFR5.9)', () => {
  it('bütünlük denetimi geçmeyen dosya kenara alınır ve boş depoyla açılır', () => {
    const path = join(dir, 'broken.db');
    writeFileSync(path, 'bu bir veritabanı değil'.repeat(200));
    const { engine, quarantined } = StoreEngine.open(path);
    expect(quarantined).toBe(true);
    expect(readdirSync(dir).some((name) => name.startsWith('broken.db.corrupt-'))).toBe(true);
    expect(engine.loadAll).toBeTypeOf('function');
    engine.close();
    expect(existsSync(path)).toBe(true);
  });
});

describe('yazım iş parçacığı', () => {
  it('gerçek iş parçacığında yazar, okur ve yoklamaya yanıt verir', async () => {
    const failures: string[] = [];
    const workerStore = new StoreClient(
      new WorkerBackend({
        dbPath: join(dir, 'worker.db'),
        onFatal: (code) => failures.push(`fatal:${code}`),
        onRestart: (code) => failures.push(`restart:${code}`),
      }),
    );
    await workerStore.start();
    const agg = makeAgg('');
    const result = await workerStore.submit([
      insertRoom(agg.room),
      insertParticipant(participant('p9', 'Dokuz')),
    ]).result;
    expect(result.status).toBe('committed');
    expect(await workerStore.ping()).toBe(true);
    expect((await workerStore.load()).participants.map((p) => p.nick)).toEqual(['Dokuz']);
    await workerStore.close();
    expect(failures).toEqual([]);
  });
});
