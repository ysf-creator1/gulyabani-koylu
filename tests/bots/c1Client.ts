// C1 istemcisi: entegrasyon testleri, bot oyuncular ve duman testi aynı istemciyi kullanır.
// Gelen her mesaj ortak şemayla (src/shared) denetlenir; protokol kırılırsa test başarısız olur.
import { randomUUID } from 'node:crypto';
import WebSocket from 'ws';
import {
  PROTOCOL_VERSION,
  ServerMessageSchema,
  type AckMessage,
  type ServerMessage,
  type WelcomeMessage,
} from '../../src/shared/protocol.ts';
import type { RecipientView } from '../../src/shared/view.ts';

export interface ConnectOptions {
  url: string;
  origin: string;
  ca?: string | Buffer;
}

type Waiter = {
  predicate: (m: ServerMessage) => boolean;
  resolve: (m: ServerMessage) => void;
  reject: (e: Error) => void;
  timer: NodeJS.Timeout;
};

export class C1Client {
  readonly ws: WebSocket;
  readonly messages: ServerMessage[] = [];
  /** Alınan ham metinler (gizli bilgi taraması için). */
  readonly raw: string[] = [];
  latestView: RecipientView | null = null;
  latestServerTime = 0;
  closedReason: string | null = null;
  readonly closed: Promise<number>;
  private waiters: Waiter[] = [];

  private constructor(ws: WebSocket) {
    this.ws = ws;
    this.closed = new Promise((resolve) => ws.on('close', (code) => resolve(code)));
    ws.on('message', (data) => this.onMessage(data.toString()));
  }

  static connect(options: ConnectOptions): Promise<C1Client> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(options.url, {
        origin: options.origin,
        ca: options.ca,
        perMessageDeflate: false,
      });
      const client = new C1Client(ws);
      ws.once('open', () => resolve(client));
      ws.once('error', reject);
      ws.once('unexpected-response', (_req, res) =>
        reject(new Error(`upgrade refused: ${res.statusCode}`)),
      );
    });
  }

  private onMessage(text: string): void {
    this.raw.push(text);
    const message = ServerMessageSchema.parse(JSON.parse(text)) as ServerMessage;
    this.messages.push(message);
    if (message.type === 'view') {
      this.latestView = message.view as RecipientView;
      this.latestServerTime = message.serverTime;
    }
    if (message.type === 'closed') this.closedReason = message.reasonCode;
    for (const waiter of [...this.waiters]) {
      if (waiter.predicate(message)) {
        clearTimeout(waiter.timer);
        this.waiters = this.waiters.filter((w) => w !== waiter);
        waiter.resolve(message);
      }
    }
  }

  send(message: unknown): void {
    this.ws.send(typeof message === 'string' ? message : JSON.stringify(message));
  }

  waitFor<T extends ServerMessage = ServerMessage>(
    predicate: (m: ServerMessage) => boolean,
    timeoutMs = 5000,
  ): Promise<T> {
    const existing = this.messages.find(predicate);
    if (existing) return Promise.resolve(existing as T);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.waiters = this.waiters.filter((w) => w.timer !== timer);
        reject(new Error('timed out waiting for message'));
      }, timeoutMs);
      this.waiters.push({
        predicate,
        resolve: resolve as (m: ServerMessage) => void,
        reject,
        timer,
      });
    });
  }

  /** Bu andan sonra gelen ve koşula uyan ilk görünüm (ya da şimdiki görünüm uyuyorsa o). */
  waitForView(
    predicate: (v: RecipientView) => boolean,
    timeoutMs = 10_000,
  ): Promise<RecipientView> {
    if (this.latestView && predicate(this.latestView)) return Promise.resolve(this.latestView);
    const start = this.messages.length;
    return this.waitFor<{ type: 'view'; view: RecipientView } & ServerMessage>(
      (m) =>
        m.type === 'view' &&
        this.messages.indexOf(m) >= start &&
        predicate(m.view as RecipientView),
      timeoutMs,
    ).then((m) => m.view as RecipientView);
  }

  async hello(options: {
    appVersion: string;
    sessionToken?: string;
    roomCode?: string;
  }): Promise<WelcomeMessage> {
    const start = this.messages.length;
    this.send({
      type: 'hello',
      protocolVersion: PROTOCOL_VERSION,
      deviceType: 'desktop',
      ...options,
    });
    return this.waitFor<WelcomeMessage>(
      (m) => m.type === 'welcome' && this.messages.indexOf(m) >= start,
    );
  }

  async command(
    name: string,
    args: Record<string, unknown> = {},
    commandId: string = randomUUID(),
  ): Promise<AckMessage> {
    const start = this.messages.length;
    this.send({ type: 'command', commandId, name, args });
    return this.waitFor<AckMessage>(
      (m) => m.type === 'ack' && m.commandId === commandId && this.messages.indexOf(m) >= start,
    );
  }

  close(): Promise<number> {
    this.ws.close();
    return this.closed;
  }

  terminate(): void {
    this.ws.terminate();
  }
}
