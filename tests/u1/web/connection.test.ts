// İstemci bağlantısı (BR9.2, BR10.2, reliability-design): yeniden deneme aralıkları, ağ geldi /
// sayfa görünür, aynı numarayla yeniden gönderme, 60 sn uyarısı, kapanış nedenleri.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ACK_TIMEOUT, Connection, FAILING_AFTER } from '../../../src/web/net/connection.ts';
import { FakeSocket, MemoryStore } from './fakes.ts';

let sockets: FakeSocket[];
let random: number;

function make(store: MemoryStore | null = null) {
  sockets = [];
  let id = 0;
  return new Connection({
    url: 'wss://game.test/ws',
    appVersion: 'v0.1.0',
    createSocket: () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      return socket;
    },
    pendingStore: store,
    now: () => Date.now(),
    random: () => random,
    newId: () => `cmd-${++id}`,
  });
}

function openWith(socket: FakeSocket, token?: string) {
  socket.open();
  socket.receive({
    type: 'welcome',
    serverTime: Date.now(),
    protocolVersion: 1,
    ...(token ? { sessionToken: token } : {}),
  });
}

beforeEach(() => {
  vi.useFakeTimers({ now: 1_000_000 });
  random = 0;
});
afterEach(() => vi.useRealTimers());

describe('bağlanma ve hello', () => {
  it('belirteçle hello gönderir, welcome sonrası açılır ve ping atar', () => {
    const conn = make();
    const states: string[] = [];
    conn.subscribe({ onState: (s) => states.push(s) });
    conn.start('t'.repeat(43));
    sockets[0]!.open();
    expect(sockets[0]!.ofType('hello')[0]).toMatchObject({
      protocolVersion: 1,
      appVersion: 'v0.1.0',
      sessionToken: 't'.repeat(43),
    });
    sockets[0]!.receive({ type: 'welcome', serverTime: Date.now(), protocolVersion: 1 });
    expect(conn.state).toBe('open');
    expect(states).toEqual(['connecting', 'open']);
    expect(sockets[0]!.ofType('ping')).toHaveLength(1);
  });

  it('yeni oturumda belirteç gönderilmez; gelen belirteç dinleyiciye verilir', () => {
    const conn = make();
    const tokens: (string | undefined)[] = [];
    conn.subscribe({ onWelcome: (t) => tokens.push(t) });
    conn.restartFresh();
    openWith(sockets[0]!, 'n'.repeat(43));
    expect(sockets[0]!.ofType('hello')[0]).not.toHaveProperty('sessionToken');
    expect(tokens).toEqual(['n'.repeat(43)]);
  });
});

describe('komutlar (BR10.2)', () => {
  it('bağlantı açılmadan gönderilen komut welcome sonrası gider; onay gelince çözülür', async () => {
    const conn = make();
    conn.start();
    const result = conn.send('game.vote', { targetSeatId: 's2' });
    expect(sockets[0]!.ofType('command')).toHaveLength(0);
    openWith(sockets[0]!);
    expect(sockets[0]!.ofType('command')[0]).toMatchObject({
      commandId: 'cmd-1',
      name: 'game.vote',
    });
    sockets[0]!.receive({
      type: 'ack',
      commandId: 'cmd-1',
      status: 'rejected',
      reasonCode: 'phase_closed',
    });
    await expect(result).resolves.toEqual({ status: 'rejected', reasonCode: 'phase_closed' });
    expect(conn.pendingCount()).toBe(0);
  });

  it('5 sn onay gelmezse aynı numarayla yeniden gönderilir; yeniden bağlanınca da', () => {
    const conn = make();
    conn.start();
    openWith(sockets[0]!);
    void conn.send('game.cardSeen');
    vi.advanceTimersByTime(ACK_TIMEOUT + 1000);
    const commands = sockets[0]!.ofType('command');
    expect(commands.length).toBeGreaterThanOrEqual(2);
    expect(new Set(commands.map((c) => c.commandId))).toEqual(new Set(['cmd-1']));
    sockets[0]!.close();
    vi.advanceTimersByTime(1000);
    openWith(sockets[1]!);
    expect(sockets[1]!.ofType('command')[0]).toMatchObject({ commandId: 'cmd-1' });
  });

  it('onay bekleyen komutlar oturum deposundan geri yüklenir', () => {
    const store = new MemoryStore();
    store.setItem(
      'gulyabani.pending',
      JSON.stringify([
        { commandId: 'old-1', name: 'chat.send', args: { channel: 'day', text: 'x' } },
      ]),
    );
    const conn = make(store);
    conn.start();
    openWith(sockets[0]!);
    expect(sockets[0]!.ofType('command')[0]).toMatchObject({ commandId: 'old-1' });
    sockets[0]!.receive({ type: 'ack', commandId: 'old-1', status: 'duplicate' });
    expect(JSON.parse(store.getItem('gulyabani.pending')!)).toEqual([]);
  });
});

describe('yeniden bağlanma (BR9.2, NFR4.2)', () => {
  it('1, 2, 4 sn sonra her 4 sn yeniden dener; sapma 0–500 ms', () => {
    const conn = make();
    conn.start();
    openWith(sockets[0]!);
    sockets[0]!.close();
    expect(conn.state).toBe('waiting');
    const delays = [1000, 2000, 4000, 4000];
    for (const [index, delay] of delays.entries()) {
      vi.advanceTimersByTime(delay - 1);
      expect(sockets).toHaveLength(index + 1);
      vi.advanceTimersByTime(1);
      expect(sockets).toHaveLength(index + 2);
      if (index === delays.length - 1) random = 0.999;
      sockets[index + 1]!.close();
    }
    vi.advanceTimersByTime(4000);
    expect(sockets).toHaveLength(5);
    vi.advanceTimersByTime(499);
    expect(sockets).toHaveLength(6);
  });

  it('ağ gelince ya da sayfa görünür olunca hemen dener', () => {
    const conn = make();
    conn.start();
    openWith(sockets[0]!);
    sockets[0]!.close();
    conn.wake();
    expect(sockets).toHaveLength(2);
  });

  it('60 sn bağlanılamazsa uyarı verir ve denemeyi sürdürür', () => {
    const conn = make();
    const failing: boolean[] = [];
    conn.subscribe({ onState: (_s, f) => failing.push(f) });
    conn.start();
    openWith(sockets[0]!);
    sockets[0]!.close();
    vi.advanceTimersByTime(FAILING_AFTER + 1000);
    expect(conn.failing).toBe(true);
    expect(failing.at(-1)).toBe(true);
    expect(conn.state).not.toBe('stopped');
  });

  it('sayfa yeniden görünür olduğunda 2 sn içinde pong gelmezse bağlantı yenilenir', () => {
    const conn = make();
    conn.start();
    openWith(sockets[0]!);
    conn.wake();
    vi.advanceTimersByTime(2000);
    expect(sockets[0]!.closed).toBe(true);
    expect(conn.state).toBe('waiting');
  });
});

describe('sunucunun kapatması', () => {
  it('kicked, session_invalid ve room_not_found yeniden denenmez', () => {
    const conn = make();
    const reasons: string[] = [];
    conn.subscribe({ onClosed: (r) => reasons.push(r) });
    conn.start();
    openWith(sockets[0]!);
    sockets[0]!.receive({ type: 'closed', reasonCode: 'kicked' });
    vi.advanceTimersByTime(10_000);
    expect(reasons).toEqual(['kicked']);
    expect(conn.state).toBe('stopped');
    expect(sockets).toHaveLength(1);
  });

  it('sürüm farkında yenileme istenir; eski görünüm sürümü yok sayılır', () => {
    const conn = make();
    let reloads = 0;
    const views: unknown[] = [];
    conn.subscribe({ onReload: () => (reloads += 1), onView: (v) => views.push(v) });
    conn.start();
    openWith(sockets[0]!);
    sockets[0]!.receive({ type: 'view', viewVersion: 2, serverTime: Date.now(), view: { a: 1 } });
    sockets[0]!.receive({ type: 'view', viewVersion: 1, serverTime: Date.now(), view: { a: 0 } });
    sockets[0]!.receive({ type: 'reload', reason: 'version' });
    expect(views).toEqual([{ a: 1 }]);
    expect(reloads).toBe(1);
  });
});
