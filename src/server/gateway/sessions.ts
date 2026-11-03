// Oturum kaydı (ConnectionGateway'in bellek tarafı): belirteç yalnızca özetiyle aranır
// (NFR7.4); bağlantı durumu çalışma zamanındadır ve depoya yazılmaz.
import type { Session } from '../model.ts';
import type { StoredSession } from '../store/types.ts';

export const UNBOUND_SESSION_MS = 10 * 60 * 1000;

export class SessionRegistry {
  private readonly byId = new Map<string, Session>();
  private readonly byHash = new Map<string, string>();

  load(sessions: StoredSession[]): void {
    for (const stored of sessions) this.add({ ...stored, connected: false });
  }

  add(session: Session): void {
    this.byId.set(session.sessionId, session);
    this.byHash.set(session.tokenHash, session.sessionId);
  }

  get(sessionId: string): Session | undefined {
    return this.byId.get(sessionId);
  }

  findByHash(tokenHash: string): Session | undefined {
    const id = this.byHash.get(tokenHash);
    return id ? this.byId.get(id) : undefined;
  }

  update(sessionId: string, patch: Partial<Session>): void {
    const current = this.byId.get(sessionId);
    if (current) this.byId.set(sessionId, { ...current, ...patch });
  }

  remove(sessionId: string): void {
    const current = this.byId.get(sessionId);
    if (!current) return;
    this.byId.delete(sessionId);
    this.byHash.delete(current.tokenHash);
  }

  inRoom(roomCode: string): Session[] {
    return [...this.byId.values()].filter((s) => s.roomCode === roomCode);
  }

  /** Odaya bağlanmamış, bağlı olmayan ve 10 dakikadan eski oturumlar (NFR7.7 d). */
  idleUnbound(now: number): Session[] {
    return [...this.byId.values()].filter(
      (s) => s.roomCode === null && !s.connected && now - s.createdAt >= UNBOUND_SESSION_MS,
    );
  }

  count(): number {
    return this.byId.size;
  }
}
