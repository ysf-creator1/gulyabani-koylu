// Oyun programının parçalarını birbirine bağlar (logical-components): iki dinleyici, bağlantı
// kapısı, oda sıraları, görünüm gönderimi, süre zamanlayıcısı, yazım iş parçacığı, temizlik.
// Açılış ve kapanış sırası reliability-design "Açılış" ve "Planlı Kapanış" bölümlerindedir.
import { mkdirSync } from 'node:fs';
import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { WebSocketServer } from 'ws';
import { MAX_FRAME_BYTES } from '../shared/protocol.ts';
import { defaultSettings } from '../rules/index.ts';
import type { Outcome } from './commands.ts';
import { ConnectionDirectory } from './gateway/connection.ts';
import { createInternalServer } from './gateway/internalHttp.ts';
import { createPublicServer } from './gateway/publicHttp.ts';
import { LIMITS, RateLimiter } from './gateway/rateLimiter.ts';
import { RoomQueues } from './gateway/roomQueue.ts';
import { SessionRegistry } from './gateway/sessions.ts';
import { loadStaticIndex, withAppVersion } from './gateway/staticFiles.ts';
import { ViewDispatcher } from './gateway/viewDispatcher.ts';
import { WsGateway } from './gateway/wsGateway.ts';
import { DeadlineScheduler, deadlineCommandId, handleDeadline } from './match/matchFlow.ts';
import { roomStatus, type MatchRecord, type RoomAggregate } from './model.ts';
import type { Config } from './ops/config.ts';
import { ExpirySweep, SWEEP_INTERVAL_MS } from './ops/expirySweep.ts';
import { createLogger, type Logger } from './ops/logger.ts';
import { Metrics } from './ops/metrics.ts';
import { cryptoRandom, newId } from './random.ts';
import { EMPTY_LOBBY_MS, expireIdleLobby } from './room/roomManager.ts';
import { deleteMatch } from './store/repos/matchRepo.ts';
import {
  InlineBackend,
  StoreClient,
  WorkerBackend,
  type StoreBackend,
} from './store/storeClient.ts';
import type { StoreSnapshot } from './store/types.ts';

const LIVENESS_INTERVAL_MS = 5000;
const IDLE_LOBBY_INTERVAL_MS = 60_000;
const SHUTDOWN_DRAIN_MS = 5000;
const HEALTH_CACHE_MS = 1000;

export interface AppOptions {
  config: Config;
  logger?: Logger;
  backend?: 'worker' | 'inline';
  /** Yazım iş parçacığı ikinci kez çökerse (program çıkmalıdır). */
  onFatal?: (errorCode: string) => void;
}

function listen(server: Server, host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve((server.address() as AddressInfo).port));
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve());
    server.closeAllConnections();
  });
}

/** Açılış yüklemesinden oda kayıtlarını kurar; yarım kalmış başlatmanın oyunu öksüzdür (BR10.2). */
export function restoreRooms(snapshot: StoreSnapshot): {
  rooms: Map<string, RoomAggregate>;
  orphanMatchIds: string[];
} {
  const rooms = new Map<string, RoomAggregate>();
  for (const room of snapshot.rooms) {
    rooms.set(room.roomCode, {
      room,
      participants: [],
      match: null,
      pastMatches: [],
      chat: { day: [], ghul: [] },
      chatCommandIds: new Set(),
    });
  }
  for (const p of snapshot.participants) rooms.get(p.roomCode)?.participants.push(p);
  const orphanMatchIds: string[] = [];
  for (const match of snapshot.matches as MatchRecord[]) {
    const agg = rooms.get(match.roomCode);
    if (agg && agg.room.currentMatchId === match.matchId) agg.match = match;
    else if (agg && match.status === 'ended') agg.pastMatches.push(match);
    else orphanMatchIds.push(match.matchId);
  }
  for (const message of snapshot.chat)
    rooms.get(message.roomCode)?.chat[message.channel].push(message);
  for (const { roomCode, commandId } of snapshot.chatCommandIds) {
    (rooms.get(roomCode)?.chatCommandIds as Set<string> | undefined)?.add(commandId);
  }
  return { rooms, orphanMatchIds };
}

export class App {
  readonly config: Config;
  readonly logger: Logger;
  readonly metrics = new Metrics();
  readonly rooms = new Map<string, RoomAggregate>();
  readonly sessions = new SessionRegistry();
  readonly connections = new ConnectionDirectory();
  readonly store: StoreClient;
  readonly queues: RoomQueues;
  readonly dispatcher: ViewDispatcher;
  readonly gateway: WsGateway;
  readonly scheduler: DeadlineScheduler;
  readonly sweep: ExpirySweep;
  private readonly limiter = new RateLimiter();
  private readonly wss = new WebSocketServer({
    noServer: true,
    maxPayload: MAX_FRAME_BYTES,
    perMessageDeflate: false,
  });
  private readonly publicServer: Server;
  private readonly internalServer: Server;
  private readonly lobbyPresence = new Map<string, number>();
  private readonly timers: NodeJS.Timeout[] = [];
  private ready = false;
  private shuttingDown = false;
  private startedAt = Date.now();
  private healthCache = { at: 0, ok: false };
  publicPort = 0;
  internalPort = 0;

  constructor(options: AppOptions) {
    this.config = options.config;
    this.logger = options.logger ?? createLogger({ version: options.config.appVersion });
    mkdirSync(this.config.dataDir, { recursive: true });
    const dbPath = join(this.config.dataDir, 'game.db');
    const backend: StoreBackend =
      options.backend === 'inline'
        ? new InlineBackend(dbPath)
        : new WorkerBackend({
            dbPath,
            onRestart: (code) => {
              this.metrics.recordError();
              this.logger.error('store.worker_restart', { err: { name: 'WorkerLost', code } });
            },
            onFatal: (code) => {
              this.logger.error('fatal', { err: { name: 'WorkerLost', code } });
              (options.onFatal ?? (() => process.exit(1)))(code);
            },
          });
    this.store = new StoreClient(backend, (ms) => this.metrics.commit.record(ms));
    const clock = () => Date.now();
    this.dispatcher = new ViewDispatcher({
      getRoom: (code) => this.rooms.get(code),
      sessions: this.sessions,
      connections: this.connections,
      publicOrigin: this.config.publicOrigin,
      metrics: this.metrics,
      clock,
    });
    this.queues = new RoomQueues({
      get: (code) => this.rooms.get(code),
      set: (code, agg) => (agg ? this.rooms.set(code, agg) : this.rooms.delete(code)),
      submit: (ops, dependsOn) => this.store.submit(ops, dependsOn),
      pendingWrites: () => this.store.pendingCount(),
      onCommitted: (code, outcome, _prev, next) => this.onCommitted(code, outcome, next),
      onDuplicate: () => {},
      metrics: this.metrics,
      logger: this.logger,
      clock,
      random: cryptoRandom,
      newId,
    });
    this.gateway = new WsGateway({
      appVersion: this.config.appVersion,
      settings: () => defaultSettings(this.config.timeScale),
      sessions: this.sessions,
      connections: this.connections,
      queues: this.queues,
      dispatcher: this.dispatcher,
      limiter: this.limiter,
      getRoom: (code) => this.rooms.get(code),
      hasRoomCode: (code) => this.rooms.has(code),
      activeRoomCount: () => this.activeRooms(),
      submit: (ops) => this.store.submit(ops),
      logger: this.logger,
      metrics: this.metrics,
      clock,
    });
    this.scheduler = new DeadlineScheduler((code, args) => {
      this.queues.enqueue(code, {
        commandId: deadlineCommandId(args),
        label: 'system.deadlineReached',
        receivedAt: Date.now(),
        run: (agg, ctx) => (agg ? handleDeadline(agg, args, ctx) : { status: 'dropped', ops: [] }),
      });
    });
    this.sweep = new ExpirySweep({
      roomCodes: () => [...this.rooms.keys()],
      getRoom: (code) => this.rooms.get(code),
      queues: this.queues,
      sessions: this.sessions,
      submit: (ops) => this.store.submit(ops),
      maintenance: () => this.store.maintenance(),
      metrics: this.metrics,
      logger: this.logger,
    });
    const health = (internal: boolean) => () => this.health(internal);
    const staticIndex = loadStaticIndex(this.config.webDir);
    staticIndex.index = withAppVersion(staticIndex.index, this.config.appVersion);
    this.publicServer = createPublicServer({
      publicOrigin: this.config.publicOrigin,
      connectSrc: this.config.connectSrc,
      staticIndex,
      health: health(false),
      canUpgrade: () => this.canUpgrade(),
      upgrade: (req, socket, head) =>
        this.wss.handleUpgrade(req, socket, head, (ws) => {
          this.gateway.accept(ws);
        }),
    });
    this.internalServer = createInternalServer(health(true));
  }

  private onCommitted(code: string, outcome: Outcome, next: RoomAggregate | undefined): void {
    if (outcome.effects) this.gateway.applyEffects(outcome.effects);
    this.scheduler.sync(code, next ?? null);
    if (next) this.dispatcher.markDirty(code, outcome.stepChanged ?? false);
    else this.dispatcher.forgetRoom(code);
  }

  activeRooms(): number {
    const now = Date.now();
    let count = 0;
    for (const agg of this.rooms.values()) if (agg.room.expiresAt > now) count += 1;
    return count;
  }

  activeMatches(): number {
    let count = 0;
    for (const agg of this.rooms.values()) if (roomStatus(agg) === 'in_game') count += 1;
    return count;
  }

  private canUpgrade(): { ok: true } | { ok: false; status: 503 } {
    const busy =
      this.connections.count() >= LIMITS.maxConnections ||
      this.connections.preHelloCount() >= LIMITS.maxPreHelloConnections;
    return this.ready && !this.shuttingDown && !busy ? { ok: true } : { ok: false, status: 503 };
  }

  /** Genel uçta yalnızca durum ve sürüm; iç uçta sayılar ve ölçümler (BR12.2, NFR13.1). */
  private async health(internal: boolean): Promise<Record<string, unknown> | null> {
    if (!this.ready || this.shuttingDown) return null;
    const now = Date.now();
    if (now - this.healthCache.at > HEALTH_CACHE_MS) {
      this.healthCache = { at: now, ok: await this.store.ping(1000) };
    }
    if (!this.healthCache.ok) return null;
    const base = { status: 'ok', version: this.config.appVersion };
    if (!internal) return base;
    return {
      ...base,
      ...this.metrics.snapshot({
        activeRooms: this.activeRooms(),
        activeMatches: this.activeMatches(),
        connections: this.connections.count(),
        writeQueueDepth: this.store.pendingCount(),
      }),
    };
  }

  async start(): Promise<void> {
    this.startedAt = Date.now();
    this.logger.info('startup.begin');
    this.publicPort = await listen(this.publicServer, this.config.host, this.config.portPublic);
    this.internalPort = await listen(
      this.internalServer,
      this.config.host,
      this.config.portInternal,
    );
    const { quarantined } = await this.store.start();
    if (quarantined)
      this.logger.error('store.corrupt', { err: { name: 'StoreCorrupt', code: 'SQLITE_CORRUPT' } });
    const snapshot = await this.store.load();
    const { rooms, orphanMatchIds } = restoreRooms(snapshot);
    for (const [code, agg] of rooms) this.rooms.set(code, agg);
    this.sessions.load(snapshot.sessions);
    if (orphanMatchIds.length > 0) await this.store.submit(orphanMatchIds.map(deleteMatch)).result;
    await this.sweep.run(Date.now());
    for (const [code, agg] of this.rooms) this.scheduler.sync(code, agg);
    this.ready = true;
    this.timers.push(
      setInterval(() => this.gateway.sweepSilent(Date.now()), LIVENESS_INTERVAL_MS),
      setInterval(() => this.checkIdleLobbies(Date.now()), IDLE_LOBBY_INTERVAL_MS),
      setInterval(() => void this.sweep.run(Date.now()), SWEEP_INTERVAL_MS),
    );
    for (const timer of this.timers) timer.unref();
    this.logger.info('startup.ready', {
      durationMs: Date.now() - this.startedAt,
      count: this.rooms.size,
    });
  }

  /** Lobide 15 dakika bağlı kimse yoksa odanın süresi dolar (BR12.4). */
  checkIdleLobbies(now: number): void {
    for (const [code, agg] of this.rooms) {
      if (roomStatus(agg) !== 'lobby' || agg.room.expiresAt <= now) {
        this.lobbyPresence.delete(code);
        continue;
      }
      if (this.dispatcher.connectedIn(code).size > 0) {
        this.lobbyPresence.set(code, now);
        continue;
      }
      const lastSeen = this.lobbyPresence.get(code) ?? this.startedAt;
      if (now - lastSeen < EMPTY_LOBBY_MS) continue;
      this.lobbyPresence.delete(code);
      this.queues.enqueue(code, {
        commandId: null,
        label: 'system.idleLobby',
        receivedAt: now,
        run: (current) =>
          current ? expireIdleLobby(current, now) : { status: 'dropped', ops: [] },
      });
    }
  }

  async stop(): Promise<void> {
    if (this.shuttingDown) return;
    this.shuttingDown = true;
    const started = Date.now();
    this.logger.info('shutdown.begin');
    for (const timer of this.timers) clearInterval(timer);
    this.scheduler.cancelAll();
    await Promise.race([
      this.queues.idle(),
      new Promise((resolve) => setTimeout(resolve, SHUTDOWN_DRAIN_MS)),
    ]);
    this.gateway.closeAll();
    this.dispatcher.stop();
    await this.store.close();
    this.wss.close();
    await Promise.all([closeServer(this.publicServer), closeServer(this.internalServer)]);
    this.metrics.close();
    this.logger.info('shutdown.done', { durationMs: Date.now() - started });
  }
}
