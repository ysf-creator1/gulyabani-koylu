// Tarayıcının canlı bağlantısı (C1, reliability-design "İstemcinin Yeniden Bağlanması"):
// yeniden deneme 1, 2, 4 sn, sonra her 4 sn, 0–500 ms sapmayla; "ağ geldi" ve "sayfa görünür"
// olaylarında hemen. Onayı 5 sn'de gelmeyen komut aynı numarayla yeniden gönderilir; onay
// bekleyen komutlar sayfa yenilenmesine karşı oturum deposunda tutulur. 60 sn bağlanılamazsa
// uyarı gösterilir, deneme sürer (BR9.2).
import type { ReasonCode } from '../../shared/reasonCodes.ts';
import type { RecipientView } from '../../shared/view.ts';
import { ServerClock } from './clock.ts';
import type { KeyValueStore } from './tokens.ts';

export interface SocketLike {
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
}

export type ConnectionState = 'idle' | 'connecting' | 'open' | 'waiting' | 'stopped';

export interface AckResult {
  status: 'accepted' | 'rejected' | 'duplicate';
  reasonCode?: ReasonCode;
}

export interface ConnectionListener {
  onState?(state: ConnectionState, failing: boolean): void;
  onWelcome?(token: string | undefined): void;
  onView?(view: RecipientView): void;
  onClosed?(reasonCode: ReasonCode | 'superseded'): void;
  onReload?(): void;
}

export interface ConnectionDeps {
  url: string;
  appVersion: string;
  createSocket: (url: string) => SocketLike;
  pendingStore?: KeyValueStore | null;
  now?: () => number;
  random?: () => number;
  newId?: () => string;
}

export const RETRY_DELAYS = [1000, 2000, 4000];
export const RETRY_STEADY = 4000;
export const MAX_JITTER = 500;
export const ACK_TIMEOUT = 5000;
export const PING_EVERY = 20_000;
export const PROBE_TIMEOUT = 2000;
export const FAILING_AFTER = 60_000;
const PENDING_KEY = 'gulyabani.pending';
const STOP_REASONS = new Set<string>(['session_invalid', 'kicked', 'room_not_found']);

interface Pending {
  commandId: string;
  name: string;
  args: Record<string, unknown>;
  sentAt: number;
  resolve?: (ack: AckResult) => void;
}

export class Connection {
  readonly clock: ServerClock;
  state: ConnectionState = 'idle';
  failing = false;
  private socket: SocketLike | null = null;
  private token: string | undefined;
  private attempt = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private tickTimer: ReturnType<typeof setInterval> | null = null;
  private probeTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPingAt = 0;
  private downSince: number | null = null;
  private viewVersion = 0;
  private readonly pending = new Map<string, Pending>();
  private readonly listeners = new Set<ConnectionListener>();
  private readonly deps: Required<Omit<ConnectionDeps, 'pendingStore'>> & {
    pendingStore: KeyValueStore | null;
  };

  constructor(deps: ConnectionDeps) {
    this.deps = {
      now: () => Date.now(),
      random: Math.random,
      newId: () => crypto.randomUUID(),
      pendingStore: null,
      ...deps,
    } as typeof this.deps;
    this.clock = new ServerClock(this.deps.now);
    this.restorePending();
  }

  subscribe(listener: ConnectionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit<K extends keyof ConnectionListener>(
    key: K,
    ...args: Parameters<NonNullable<ConnectionListener[K]>>
  ): void {
    for (const listener of this.listeners)
      (listener[key] as ((...a: unknown[]) => void) | undefined)?.(...args);
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    if (state === 'open') {
      this.downSince = null;
      this.failing = false;
    } else if (state !== 'stopped' && this.downSince === null) {
      this.downSince = this.deps.now();
    }
    this.emit('onState', state, this.failing);
  }

  /** Belirteçle (ya da belirteçsiz yeni oturumla) bağlanır. */
  start(token?: string): void {
    this.token = token;
    this.attempt = 0;
    this.connectNow();
  }

  /** Oda Kur ya da başka odanın linki: belirteçsiz yeni oturum (BR10.5). */
  restartFresh(): void {
    this.closeSocket();
    this.pending.clear();
    this.savePending();
    this.start(undefined);
  }

  private connectNow(): void {
    this.clearRetry();
    this.closeSocket();
    this.setState('connecting');
    const socket = this.deps.createSocket(this.deps.url);
    this.socket = socket;
    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          type: 'hello',
          protocolVersion: 1,
          appVersion: this.deps.appVersion,
          deviceType: 'phone',
          ...(this.token ? { sessionToken: this.token } : {}),
        }),
      );
    };
    socket.onmessage = (event) => this.onMessage(String(event.data));
    socket.onclose = () => this.onSocketClosed(socket);
    socket.onerror = () => socket.close();
    this.ensureTicker();
  }

  private onMessage(text: string): void {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(text) as Record<string, unknown>;
    } catch {
      return;
    }
    switch (message.type) {
      case 'welcome':
        return this.onWelcome(message);
      case 'ack':
        return this.onAck(message);
      case 'view':
        return this.onView(message);
      case 'pong':
        this.clearProbe();
        this.clock.onPong(Number(message.clientTime), Number(message.serverTime));
        return;
      case 'reload':
        this.stop();
        this.emit('onReload');
        return;
      case 'superseded':
        this.stop();
        this.emit('onClosed', 'superseded');
        return;
      case 'closed':
        return this.onServerClosed(String(message.reasonCode) as ReasonCode);
      default:
        return;
    }
  }

  private onWelcome(message: Record<string, unknown>): void {
    this.attempt = 0;
    const token = typeof message.sessionToken === 'string' ? message.sessionToken : undefined;
    if (token) this.token = token;
    this.clock.onServerTime(Number(message.serverTime));
    this.setState('open');
    this.emit('onWelcome', token);
    this.ping();
    for (const item of this.pending.values()) this.transmit(item);
  }

  private onAck(message: Record<string, unknown>): void {
    const item = this.pending.get(String(message.commandId));
    if (!item) return;
    this.pending.delete(item.commandId);
    this.savePending();
    const ack: AckResult = { status: message.status as AckResult['status'] };
    if (typeof message.reasonCode === 'string') ack.reasonCode = message.reasonCode as ReasonCode;
    item.resolve?.(ack);
  }

  private onView(message: Record<string, unknown>): void {
    const version = Number(message.viewVersion);
    // Eski sürüm gelirse yok sayılır (C1); sayaç her yeni bağlantıda sıfırdan başlar.
    if (version <= this.viewVersion) return;
    this.viewVersion = version;
    this.clock.onServerTime(Number(message.serverTime));
    this.emit('onView', message.view as RecipientView);
  }

  private onServerClosed(reasonCode: ReasonCode): void {
    if (STOP_REASONS.has(reasonCode)) {
      this.stop();
      this.pending.clear();
      this.savePending();
      this.emit('onClosed', reasonCode);
    }
    // Diğer nedenlerde (sınır, yoğunluk, iç hata) bağlantı kapanınca bekleyip yeniden denenir.
  }

  private onSocketClosed(socket: SocketLike): void {
    if (socket !== this.socket) return;
    this.socket = null;
    this.viewVersion = 0;
    if (this.state === 'stopped') return;
    this.setState('waiting');
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    const base = RETRY_DELAYS[this.attempt] ?? RETRY_STEADY;
    this.attempt += 1;
    const delay = base + Math.floor(this.deps.random() * MAX_JITTER);
    this.retryTimer = setTimeout(() => this.connectNow(), delay);
  }

  private clearRetry(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
  }

  /** "Ağ geldi" ve "sayfa görünür" olaylarında bekleme iptal edilir, hemen denenir. */
  wake(): void {
    if (this.state === 'waiting' || this.state === 'connecting') {
      this.attempt = 0;
      this.connectNow();
    } else if (this.state === 'open') {
      this.ping();
      this.clearProbe();
      this.probeTimer = setTimeout(() => this.socket?.close(), PROBE_TIMEOUT);
    }
  }

  private clearProbe(): void {
    if (this.probeTimer) clearTimeout(this.probeTimer);
    this.probeTimer = null;
  }

  private ensureTicker(): void {
    if (this.tickTimer) return;
    this.tickTimer = setInterval(() => this.tick(), 1000);
  }

  private tick(): void {
    const now = this.deps.now();
    if (this.state === 'open') {
      if (now - this.lastPingAt >= PING_EVERY) this.ping();
      for (const item of this.pending.values())
        if (now - item.sentAt >= ACK_TIMEOUT) this.transmit(item);
    } else if (this.downSince !== null && !this.failing && now - this.downSince >= FAILING_AFTER) {
      this.failing = true;
      this.emit('onState', this.state, true);
    }
  }

  private ping(): void {
    this.lastPingAt = this.deps.now();
    this.socket?.send(JSON.stringify({ type: 'ping', clientTime: this.lastPingAt }));
  }

  private transmit(item: Pending): void {
    item.sentAt = this.deps.now();
    if (this.state !== 'open' || !this.socket) return;
    this.socket.send(
      JSON.stringify({
        type: 'command',
        commandId: item.commandId,
        name: item.name,
        args: item.args,
      }),
    );
  }

  /** Komut gönderir; onay gelince çözülür. Bağlantı yoksa bağlantı gelince gönderilir. */
  send(name: string, args: Record<string, unknown> = {}): Promise<AckResult> {
    return new Promise((resolve) => {
      const item: Pending = {
        commandId: this.deps.newId(),
        name,
        args,
        sentAt: this.deps.now(),
        resolve,
      };
      this.pending.set(item.commandId, item);
      this.savePending();
      this.transmit(item);
    });
  }

  pendingCount(): number {
    return this.pending.size;
  }

  private savePending(): void {
    try {
      const list = [...this.pending.values()].map(({ commandId, name, args }) => ({
        commandId,
        name,
        args,
      }));
      this.deps.pendingStore?.setItem(PENDING_KEY, JSON.stringify(list));
    } catch {
      // oturum deposu yoksa yalnızca bellekte tutulur
    }
  }

  private restorePending(): void {
    try {
      const list = JSON.parse(this.deps.pendingStore?.getItem(PENDING_KEY) ?? '[]') as Pending[];
      for (const item of list) this.pending.set(item.commandId, { ...item, sentAt: 0 });
    } catch {
      this.pending.clear();
    }
  }

  private closeSocket(): void {
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
  }

  stop(): void {
    this.clearRetry();
    this.clearProbe();
    this.closeSocket();
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.tickTimer = null;
    this.setState('stopped');
  }
}
