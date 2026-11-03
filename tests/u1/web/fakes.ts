// Ekran testlerinin sahte taşıyıcıları: sunucuya bağlanmaz, gönderilen komutları kaydeder.
import type { RecipientView } from '../../../src/shared/view.ts';
import type { ConnectionPort } from '../../../src/web/app.tsx';
import { ServerClock } from '../../../src/web/net/clock.ts';
import type { AckResult, ConnectionListener, SocketLike } from '../../../src/web/net/connection.ts';
import type { KeyValueStore } from '../../../src/web/net/tokens.ts';

export class FakeSocket implements SocketLike {
  sent: Record<string, unknown>[] = [];
  closed = false;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;

  send(data: string): void {
    this.sent.push(JSON.parse(data));
  }
  close(): void {
    this.closed = true;
    this.onclose?.();
  }
  open(): void {
    this.onopen?.();
  }
  receive(message: Record<string, unknown>): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }
  ofType(type: string) {
    return this.sent.filter((m) => m.type === type);
  }
}

export class MemoryStore implements KeyValueStore {
  readonly data = new Map<string, string>();
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
}

/** Uygulama kabuğu için sahte bağlantı: olayları elle tetikler, komutları kaydeder. */
export class FakeConnection implements ConnectionPort {
  readonly clock = new ServerClock(() => 1_000_000);
  readonly listeners = new Set<ConnectionListener>();
  readonly sent: { name: string; args: Record<string, unknown> }[] = [];
  starts: (string | undefined)[] = [];
  freshStarts = 0;
  wakes = 0;
  nextAck: AckResult = { status: 'accepted' };

  start(token?: string) {
    this.starts.push(token);
  }
  restartFresh() {
    this.freshStarts += 1;
  }
  wake() {
    this.wakes += 1;
  }
  send(name: string, args: Record<string, unknown> = {}) {
    this.sent.push({ name, args });
    return Promise.resolve(this.nextAck);
  }
  subscribe(listener: ConnectionListener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  emit<K extends keyof ConnectionListener>(
    key: K,
    ...args: Parameters<NonNullable<ConnectionListener[K]>>
  ) {
    for (const l of this.listeners) (l[key] as ((...a: unknown[]) => void) | undefined)?.(...args);
  }
  view(view: RecipientView) {
    this.emit('onView', view);
  }
}
