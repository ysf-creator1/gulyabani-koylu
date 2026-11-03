// Bir WebSocket bağlantısının sunucu tarafı kaydı. Bağlantı kimliği rastgeledir; IP okunmaz
// (NFR7.11). Görünüm dışındaki mesajlar sendControl ile gider; görünüm yalnızca
// ViewDispatcher.sendView ile gider (security-design Gizli Bilgi).
import type { WebSocket } from 'ws';
import type { ServerMessage, ViewMessage } from '../../shared/protocol.ts';
import type { ReasonCode } from '../../shared/reasonCodes.ts';
import { TokenBucket, LIMITS } from './rateLimiter.ts';

export const CLOSE_NORMAL = 1000;
export const CLOSE_RESTART = 1012;

export interface Connection {
  id: string;
  socket: WebSocket;
  sessionId: string | null;
  openedAt: number;
  lastHeardAt: number;
  helloDone: boolean;
  bucket: TokenBucket;
  viewVersion: number;
  lastViewJson: string | null;
  closed: boolean;
}

export function newConnection(id: string, socket: WebSocket, now: number): Connection {
  return {
    id,
    socket,
    sessionId: null,
    openedAt: now,
    lastHeardAt: now,
    helloDone: false,
    bucket: new TokenBucket(LIMITS.framesPerSecond, LIMITS.framesPerSecond, now),
    viewVersion: 0,
    lastViewJson: null,
    closed: false,
  };
}

export function sendRaw(conn: Connection, text: string): boolean {
  if (conn.closed || conn.socket.readyState !== conn.socket.OPEN) return false;
  conn.socket.send(text);
  return true;
}

export function sendControl(
  conn: Connection,
  message: Exclude<ServerMessage, ViewMessage>,
): boolean {
  return sendRaw(conn, JSON.stringify(message));
}

/** Bilerek kapatılan her bağlantıya önce tek bir closed{reasonCode} gider (security-design). */
export function closeWith(conn: Connection, reasonCode: ReasonCode): void {
  if (conn.closed) return;
  sendControl(conn, { type: 'closed', reasonCode });
  conn.closed = true;
  conn.socket.close(CLOSE_NORMAL);
}

export class ConnectionDirectory {
  private readonly all = new Map<string, Connection>();
  private readonly bySession = new Map<string, Connection>();

  add(conn: Connection): void {
    this.all.set(conn.id, conn);
  }

  remove(conn: Connection): void {
    this.all.delete(conn.id);
    if (conn.sessionId && this.bySession.get(conn.sessionId) === conn)
      this.bySession.delete(conn.sessionId);
  }

  /** Oturumun geçerli bağlantısı olarak işaretler; öncekini döndürür (BR9.4). */
  attach(conn: Connection, sessionId: string): Connection | undefined {
    const previous = this.bySession.get(sessionId);
    conn.sessionId = sessionId;
    this.bySession.set(sessionId, conn);
    return previous && previous !== conn ? previous : undefined;
  }

  forSession(sessionId: string): Connection | undefined {
    return this.bySession.get(sessionId);
  }

  isActive(conn: Connection): boolean {
    return conn.sessionId !== null && this.bySession.get(conn.sessionId) === conn;
  }

  list(): Connection[] {
    return [...this.all.values()];
  }

  count(): number {
    return this.all.size;
  }

  preHelloCount(): number {
    let count = 0;
    for (const conn of this.all.values()) if (!conn.helloDone) count += 1;
    return count;
  }
}
