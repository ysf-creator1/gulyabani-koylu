// ConnectionGateway (C1): hello ve oturum, mesaj doğrulama hattı, hız sınırları, komutların
// odanın sırasına konması, bağlantı izleyicisi (45 sn sessizlik) ve saat eşitlemesi.
// Komutun aktörü yalnızca bağlantının oturumundan çıkarılır (security-design Oturum).
import type { WebSocket } from 'ws';
import {
  ClientMessageSchema,
  MAX_MESSAGE_BYTES,
  parseCommand,
  PROTOCOL_VERSION,
  type CommandEnvelope,
  type Hello,
} from '../../shared/protocol.ts';
import type { ReasonCode } from '../../shared/reasonCodes.ts';
import type { GameSettings } from '../../rules/types.ts';
import { DROPPED, type Actor, type Effect } from '../commands.ts';
import { handleModeratorConnection } from '../match/matchFlow.ts';
import { isModerator, type RoomAggregate, type Session } from '../model.ts';
import type { Logger } from '../ops/logger.ts';
import type { Metrics } from '../ops/metrics.ts';
import { cryptoRandom, hashToken, newConnectionId, newId, newSessionToken } from '../random.ts';
import { generateRoomCode } from '../room/roomCode.ts';
import { isExpired } from '../room/roomManager.ts';
import { insertSession } from '../store/repos/sessionRepo.ts';
import type { SubmittedWrite } from '../store/storeClient.ts';
import type { WriteOp } from '../store/types.ts';
import { routeCommand } from './commandRouter.ts';
import {
  closeWith,
  CLOSE_RESTART,
  newConnection,
  sendControl,
  type Connection,
  type ConnectionDirectory,
} from './connection.ts';
import { LIMITS, type RateLimiter } from './rateLimiter.ts';
import type { RoomQueues } from './roomQueue.ts';
import type { SessionRegistry } from './sessions.ts';
import type { ViewDispatcher } from './viewDispatcher.ts';

export const HELLO_TIMEOUT_MS = 10_000;
export const SILENCE_LIMIT_MS = 45_000;

export interface GatewayDeps {
  appVersion: string;
  settings: () => GameSettings;
  sessions: SessionRegistry;
  connections: ConnectionDirectory;
  queues: RoomQueues;
  dispatcher: ViewDispatcher;
  limiter: RateLimiter;
  getRoom: (roomCode: string) => RoomAggregate | undefined;
  hasRoomCode: (roomCode: string) => boolean;
  activeRoomCount: () => number;
  submit: (ops: WriteOp[]) => SubmittedWrite;
  logger: Logger;
  metrics: Metrics;
  clock: () => number;
}

export class WsGateway {
  private readonly deps: GatewayDeps;
  private readonly helloTimers = new Map<string, NodeJS.Timeout>();

  constructor(deps: GatewayDeps) {
    this.deps = deps;
  }

  accept(socket: WebSocket): Connection {
    const conn = newConnection(newConnectionId(), socket, this.deps.clock());
    this.deps.connections.add(conn);
    const timer = setTimeout(() => {
      if (!conn.helloDone) closeWith(conn, 'unsupported_protocol');
    }, HELLO_TIMEOUT_MS);
    timer.unref?.();
    this.helloTimers.set(conn.id, timer);
    socket.on('message', (data, isBinary) => this.onMessage(conn, data as Buffer, isBinary));
    socket.on('close', () => this.onClose(conn));
    socket.on('error', () => socket.terminate());
    return conn;
  }

  private onMessage(conn: Connection, data: Buffer, isBinary: boolean): void {
    const now = this.deps.clock();
    conn.lastHeardAt = now;
    if (!conn.bucket.take(now)) {
      this.deps.logger.warn('limit.flood', { connId: conn.id, limit: 'frames' });
      closeWith(conn, 'rate_limited');
      return;
    }
    if (isBinary || data.byteLength > MAX_MESSAGE_BYTES)
      return closeWith(conn, 'unsupported_protocol');
    let raw: unknown;
    try {
      raw = JSON.parse(data.toString('utf8'));
    } catch {
      return closeWith(conn, 'unsupported_protocol');
    }
    const parsed = ClientMessageSchema.safeParse(raw);
    if (!parsed.success) {
      // Numarasız bozuk komut zarfına ack gönderilemez; yalnızca sayılır (security-design).
      if ((raw as { type?: unknown })?.type === 'command' && conn.helloDone) return;
      return closeWith(conn, 'unsupported_protocol');
    }
    const message = parsed.data;
    if (!conn.helloDone && message.type !== 'hello') return closeWith(conn, 'unsupported_protocol');
    if (message.type === 'hello') return void this.onHello(conn, message);
    if (message.type === 'ping') {
      sendControl(conn, { type: 'pong', clientTime: message.clientTime, serverTime: now });
      return;
    }
    this.onCommand(conn, message, now);
  }

  private finishHello(conn: Connection): void {
    conn.helloDone = true;
    const timer = this.helloTimers.get(conn.id);
    if (timer) clearTimeout(timer);
    this.helloTimers.delete(conn.id);
  }

  private async onHello(conn: Connection, hello: Hello): Promise<void> {
    if (conn.helloDone || hello.protocolVersion !== PROTOCOL_VERSION)
      return closeWith(conn, 'unsupported_protocol');
    this.finishHello(conn);
    if (hello.appVersion !== this.deps.appVersion) {
      sendControl(conn, { type: 'reload', reason: 'version' });
      return;
    }
    if (hello.sessionToken) return this.resumeSession(conn, hello.sessionToken);
    await this.openSession(conn, hello);
  }

  private resumeSession(conn: Connection, token: string): void {
    const session = this.deps.sessions.findByHash(hashToken(token));
    const room = session?.roomCode ? this.deps.getRoom(session.roomCode) : undefined;
    const roomGone = session?.roomCode !== null && (!room || isExpired(room, this.deps.clock()));
    if (!session || session.revoked || roomGone) return closeWith(conn, 'session_invalid');
    const previous = this.deps.connections.attach(conn, session.sessionId);
    if (previous) {
      sendControl(previous, { type: 'superseded' });
      previous.closed = true;
      previous.socket.close();
    }
    const wasConnected = session.connected;
    this.deps.sessions.update(session.sessionId, {
      connected: true,
      lastSeenAt: this.deps.clock(),
    });
    sendControl(conn, {
      type: 'welcome',
      serverTime: this.deps.clock(),
      protocolVersion: PROTOCOL_VERSION,
    });
    if (session.roomCode && session.participantId) {
      this.deps.dispatcher.sendFullView(conn, session.roomCode, session.participantId);
      if (!wasConnected) this.connectionChanged(session, conn, 'restored');
    }
  }

  private async openSession(conn: Connection, hello: Hello): Promise<void> {
    if (this.deps.sessions.count() >= LIMITS.maxSessions) return closeWith(conn, 'server_busy');
    const token = newSessionToken();
    const now = this.deps.clock();
    const session: Session = {
      sessionId: newId(),
      tokenHash: hashToken(token),
      createdAt: now,
      roomCode: null,
      participantId: null,
      connected: true,
      lastSeenAt: now,
      deviceType: hello.deviceType ?? 'phone',
      revoked: false,
    };
    const result = await this.deps.submit([insertSession(session)]).result;
    if (result.status !== 'committed') {
      this.deps.metrics.recordError();
      return closeWith(conn, 'internal_error');
    }
    this.deps.sessions.add(session);
    this.deps.connections.attach(conn, session.sessionId);
    sendControl(conn, {
      type: 'welcome',
      serverTime: this.deps.clock(),
      protocolVersion: PROTOCOL_VERSION,
      sessionToken: token,
    });
  }

  private reject(conn: Connection, commandId: string, reasonCode: ReasonCode): void {
    sendControl(conn, { type: 'ack', commandId, status: 'rejected', reasonCode });
    if (reasonCode !== 'phase_closed')
      this.deps.logger.warn('command.rejected', { commandId, reasonCode, connId: conn.id });
  }

  private onCommand(conn: Connection, envelope: CommandEnvelope, receivedAt: number): void {
    const { commandId } = envelope;
    const session = conn.sessionId ? this.deps.sessions.get(conn.sessionId) : undefined;
    if (!session || session.revoked || !this.deps.connections.isActive(conn))
      return this.reject(conn, commandId, 'session_invalid');
    const parsed = parseCommand(envelope.name, envelope.args);
    if (!parsed.ok) return this.reject(conn, commandId, parsed.reasonCode);
    const { command } = parsed;
    const actor: Actor = {
      sessionId: session.sessionId,
      participantId: session.participantId,
      connectionId: conn.id,
    };
    const sessionRef = {
      sessionId: session.sessionId,
      roomCode: session.roomCode,
      participantId: session.participantId,
    };
    let roomCode: string;
    let createCode: string | undefined;
    if (command.name === 'room.create') {
      if (session.roomCode) {
        const own = this.deps.getRoom(session.roomCode);
        const duplicate = own?.room.processedCommandIds.includes(commandId);
        if (duplicate && session.participantId) {
          sendControl(conn, { type: 'ack', commandId, status: 'duplicate' });
          this.deps.dispatcher.sendFullView(conn, session.roomCode, session.participantId);
          return;
        }
        return this.reject(conn, commandId, 'session_invalid');
      }
      if (!this.deps.limiter.createAllowed(receivedAt))
        return this.reject(conn, commandId, 'rate_limited');
      if (this.deps.activeRoomCount() >= LIMITS.maxActiveRooms)
        return this.reject(conn, commandId, 'server_busy');
      const code = generateRoomCode((c) => this.deps.hasRoomCode(c), cryptoRandom);
      if (!code) return this.reject(conn, commandId, 'server_busy');
      roomCode = createCode = code;
    } else if (command.name === 'room.join') {
      if (!this.deps.limiter.joinAllowed(conn.id, receivedAt))
        return this.reject(conn, commandId, 'rate_limited');
      roomCode = command.args.roomCode;
      if (!this.deps.hasRoomCode(roomCode)) {
        this.deps.limiter.recordFailedJoin(receivedAt);
        return this.reject(conn, commandId, 'room_not_found');
      }
    } else {
      if (!session.roomCode || !session.participantId)
        return this.reject(conn, commandId, 'session_invalid');
      if (
        command.name === 'chat.send' &&
        !this.deps.limiter.chatAllowed(session.participantId, receivedAt)
      ) {
        return this.reject(conn, commandId, 'rate_limited');
      }
      roomCode = session.roomCode;
    }
    const run = routeCommand({
      command,
      actor,
      commandId,
      session: sessionRef,
      settings: this.deps.settings(),
      roomCode: createCode,
    });
    const accepted = this.deps.queues.enqueue(roomCode, {
      commandId,
      label: command.name,
      receivedAt,
      run,
      respond: (status, reasonCode) => {
        if (status === 'rejected' && reasonCode) {
          if (command.name === 'room.join' && reasonCode === 'room_not_found')
            this.deps.limiter.recordFailedJoin(receivedAt);
          return this.reject(conn, commandId, reasonCode);
        }
        sendControl(conn, { type: 'ack', commandId, status });
        if (status === 'accepted' && command.name === 'room.join') this.sendOwnView(conn);
      },
    });
    if (!accepted) this.reject(conn, commandId, 'server_busy');
  }

  /** Aynı oturumla yeniden katılmada (yazım olmadan) görünüm hemen gönderilir. */
  private sendOwnView(conn: Connection): void {
    const session = conn.sessionId ? this.deps.sessions.get(conn.sessionId) : undefined;
    if (session?.roomCode && session.participantId) {
      this.deps.dispatcher.sendFullView(conn, session.roomCode, session.participantId);
    }
  }

  /** Kopma ve dönüş odanın sırasından geçer (NFR5.5); moderatörse oyun duraklar/sürer. */
  private connectionChanged(session: Session, conn: Connection, kind: 'lost' | 'restored'): void {
    const roomCode = session.roomCode;
    const participantId = session.participantId;
    if (!roomCode || !participantId) return;
    const commandId = `conn:${session.sessionId}:${conn.id}:${kind}`;
    const lastSeenAt = conn.lastHeardAt;
    this.deps.queues.enqueue(roomCode, {
      commandId,
      label: kind === 'lost' ? 'system.connectionLost' : 'system.connectionRestored',
      receivedAt: this.deps.clock(),
      run: (agg, ctx) =>
        agg && isModerator(agg, participantId)
          ? handleModeratorConnection(agg, { kind, lastSeenAt, commandId }, ctx)
          : DROPPED,
      done: () => this.deps.dispatcher.markDirty(roomCode, false),
    });
  }

  private onClose(conn: Connection): void {
    conn.closed = true;
    const timer = this.helloTimers.get(conn.id);
    if (timer) clearTimeout(timer);
    this.helloTimers.delete(conn.id);
    const active = this.deps.connections.isActive(conn);
    this.deps.connections.remove(conn);
    this.deps.limiter.forgetConnection(conn.id);
    if (!active || !conn.sessionId) return;
    const session = this.deps.sessions.get(conn.sessionId);
    if (!session) return;
    this.deps.sessions.update(session.sessionId, {
      connected: false,
      lastSeenAt: conn.lastHeardAt,
    });
    this.connectionChanged(session, conn, 'lost');
  }

  /** Bağlantı izleyicisi: 45 sn ses gelmeyen bağlantı kopuk sayılır ve kapatılır (BR9.3). */
  sweepSilent(now: number): void {
    for (const conn of this.deps.connections.list()) {
      if (conn.helloDone && now - conn.lastHeardAt >= SILENCE_LIMIT_MS) conn.socket.terminate();
    }
  }

  /** Yazım kesinleşince yan etkiler (oturum bağlama, çıkarma, oda silme). */
  applyEffects(effects: Effect[]): void {
    for (const effect of effects) {
      if (effect.kind === 'bindSession') {
        this.deps.sessions.update(effect.sessionId, {
          roomCode: effect.roomCode,
          participantId: effect.participantId,
        });
      } else if (effect.kind === 'revokeSession') {
        this.deps.sessions.update(effect.sessionId, { revoked: true });
        const conn = this.deps.connections.forSession(effect.sessionId);
        if (conn) closeWith(conn, effect.reasonCode);
      } else {
        for (const sessionId of effect.sessionIds) {
          const conn = this.deps.connections.forSession(sessionId);
          if (conn) closeWith(conn, 'room_not_found');
          this.deps.sessions.remove(sessionId);
        }
      }
    }
  }

  /** Planlı kapanış: bütün bağlantılar 1012 ile kapanır (NFR5.3). */
  closeAll(): void {
    for (const conn of this.deps.connections.list()) {
      conn.closed = true;
      conn.socket.close(CLOSE_RESTART);
    }
  }
}
