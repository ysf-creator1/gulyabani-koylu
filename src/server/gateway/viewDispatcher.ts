// ViewDispatcher: oda başına gönderim turu (NFR1.4, NFR2.3). Bir alıcıya 50 ms'de en fazla bir
// görünüm gider; önceki görünümle aynıysa atlanır, ama o turda faz ya da adım değiştiyse odadaki
// herkese aynı turda gider (BR4.7, NFR8.3). Yavaş alıcının tamponu 1 MB'ı aşarsa atlanır,
// 4 MB'ı aşarsa bağlantı kapanır.
import type { ViewMessage } from '../../shared/protocol.ts';
import type { RoomAggregate } from '../model.ts';
import type { Metrics } from '../ops/metrics.ts';
import { render, type FilteredView } from '../visibility/filter.ts';
import { sendRaw, type Connection, type ConnectionDirectory } from './connection.ts';
import type { SessionRegistry } from './sessions.ts';

export const COALESCE_MS = 50;
const SKIP_BUFFER = 1024 * 1024;
const CLOSE_BUFFER = 4 * 1024 * 1024;

interface RoomRound {
  lastRoundAt: number;
  timer: NodeJS.Timeout | null;
  stepChanged: boolean;
}

export interface ViewDispatcherDeps {
  getRoom(roomCode: string): RoomAggregate | undefined;
  sessions: SessionRegistry;
  connections: ConnectionDirectory;
  publicOrigin: string;
  metrics: Metrics;
  clock: () => number;
}

export class ViewDispatcher {
  private readonly rounds = new Map<string, RoomRound>();
  private readonly deps: ViewDispatcherDeps;

  constructor(deps: ViewDispatcherDeps) {
    this.deps = deps;
  }

  /** Bağlı katılımcılar ("kopuk" bilgisi için). */
  connectedIn(roomCode: string): Set<string> {
    const connected = new Set<string>();
    for (const session of this.deps.sessions.inRoom(roomCode)) {
      if (session.connected && session.participantId) connected.add(session.participantId);
    }
    return connected;
  }

  markDirty(roomCode: string, stepChanged: boolean): void {
    let round = this.rounds.get(roomCode);
    if (!round) {
      round = { lastRoundAt: 0, timer: null, stepChanged: false };
      this.rounds.set(roomCode, round);
    }
    round.stepChanged ||= stepChanged;
    if (round.timer) return;
    const wait = Math.max(0, round.lastRoundAt + COALESCE_MS - this.deps.clock());
    round.timer = setTimeout(() => this.flush(roomCode), wait);
  }

  private flush(roomCode: string): void {
    const round = this.rounds.get(roomCode);
    if (!round) return;
    round.timer = null;
    round.lastRoundAt = this.deps.clock();
    const force = round.stepChanged;
    round.stepChanged = false;
    const agg = this.deps.getRoom(roomCode);
    if (!agg) {
      this.rounds.delete(roomCode);
      return;
    }
    const connected = this.connectedIn(roomCode);
    for (const session of this.deps.sessions.inRoom(roomCode)) {
      const conn = this.deps.connections.forSession(session.sessionId);
      if (!conn || !session.participantId) continue;
      this.sendTo(conn, agg, session.participantId, connected, force);
    }
  }

  private sendTo(
    conn: Connection,
    agg: RoomAggregate,
    participantId: string,
    connected: Set<string>,
    force: boolean,
  ): void {
    const view = render({
      agg,
      recipientParticipantId: participantId,
      connected,
      publicOrigin: this.deps.publicOrigin,
      now: this.deps.clock(),
    });
    if (!view) return;
    this.sendView(conn, view, force);
  }

  /** Görünümü gönderen tek fonksiyon; yalnızca süzgecin ürettiği türü kabul eder. */
  sendView(conn: Connection, view: FilteredView, force: boolean): void {
    const json = JSON.stringify(view);
    if (!force && json === conn.lastViewJson) return;
    const buffered = conn.socket.bufferedAmount;
    if (buffered > CLOSE_BUFFER) {
      conn.socket.terminate();
      return;
    }
    if (buffered > SKIP_BUFFER) {
      this.deps.metrics.viewsSkipped += 1;
      return;
    }
    conn.viewVersion += 1;
    const message: Omit<ViewMessage, 'view'> = {
      type: 'view',
      viewVersion: conn.viewVersion,
      serverTime: this.deps.clock(),
    };
    const text = `${JSON.stringify(message).slice(0, -1)},"view":${json}}`;
    if (sendRaw(conn, text)) conn.lastViewJson = json;
  }

  /** Yeniden bağlanan ya da tekrar komut gönderen kişiye güncel tam görünüm (BR9.4, BR10.2). */
  sendFullView(conn: Connection, roomCode: string, participantId: string): void {
    const agg = this.deps.getRoom(roomCode);
    if (!agg) return;
    conn.lastViewJson = null;
    this.sendTo(conn, agg, participantId, this.connectedIn(roomCode), true);
  }

  forgetRoom(roomCode: string): void {
    const round = this.rounds.get(roomCode);
    if (round?.timer) clearTimeout(round.timer);
    this.rounds.delete(roomCode);
  }

  stop(): void {
    for (const round of this.rounds.values()) if (round.timer) clearTimeout(round.timer);
    this.rounds.clear();
  }
}
