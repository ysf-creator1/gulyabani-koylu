// StoreWriter'ın çekirdeği: tek SQLite bağlantısı, toplu işlem + geri alma noktaları, açılış
// yüklemesi, bütünlük denetimi ve bozuk dosyayı kenara alma (TD-04, NFR5.1, NFR5.9, NFR7.14).
// Yazım iş parçacığı (writerWorker.ts) bu sınıfı çalıştırır; testler doğrudan da kullanabilir.
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import Database from 'better-sqlite3';
import { messageFromRow, SELECT_COMMAND_IDS, SELECT_RECENT_MESSAGES } from './repos/chatRepo.ts';
import { matchFromRow, SELECT_MATCHES } from './repos/matchRepo.ts';
import {
  participantFromRow,
  roomFromRow,
  SELECT_PARTICIPANTS,
  SELECT_ROOMS,
} from './repos/roomRepo.ts';
import { SELECT_SESSIONS, sessionFromRow } from './repos/sessionRepo.ts';
import type { BatchOutcome, StoreSnapshot, WriteRequest, WriteResult } from './types.ts';

const BUSY_RETRIES = 3;
const BUSY_WAIT_MS = 10;
const CORRUPT_KEEP_MS = 24 * 60 * 60 * 1000;

export interface OpenResult {
  engine: StoreEngine;
  /** Açılışta bütünlük denetimi geçmedi ve dosya kenara alındı (NFR5.9). */
  quarantined: boolean;
}

function errorCode(error: unknown): string {
  const e = error as { code?: unknown; name?: unknown };
  if (typeof e?.code === 'string') return e.code;
  return typeof e?.name === 'string' ? e.name : 'Error';
}

function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function openDatabase(path: string): Database.Database {
  const db = new Database(path);
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = FULL');
  db.pragma('secure_delete = ON');
  db.pragma('foreign_keys = ON');
  db.pragma('cache_size = -16000'); // 16 MB sayfa önbelleği
  db.pragma('busy_timeout = 0');
  return db;
}

function quickCheckOk(db: Database.Database): boolean {
  const rows = db.pragma('quick_check') as { quick_check: string }[];
  return rows.length === 1 && rows[0]?.quick_check === 'ok';
}

/** Bozuk depo dosyasını ve yan dosyalarını `<ad>.corrupt-<ISO zaman>` adıyla kenara alır. */
function quarantine(path: string, now: Date): void {
  const stamp = now.toISOString().replace(/[:.]/g, '-');
  for (const suffix of ['', '-wal', '-shm']) {
    if (existsSync(path + suffix)) renameSync(path + suffix, `${path}.corrupt-${stamp}${suffix}`);
  }
}

export class StoreEngine {
  private readonly db: Database.Database;
  private readonly statements = new Map<string, Database.Statement>();
  readonly path: string;

  private constructor(db: Database.Database, path: string) {
    this.db = db;
    this.path = path;
  }

  /** Depoyu açar; bütünlük denetimi geçmezse dosyayı kenara alıp boş depoyla açar. */
  static open(path: string, now = new Date()): OpenResult {
    let db: Database.Database;
    let quarantined = false;
    try {
      db = openDatabase(path);
      if (!quickCheckOk(db))
        throw Object.assign(new Error('quick_check'), { code: 'SQLITE_CORRUPT' });
    } catch (error) {
      const code = errorCode(error);
      if (code !== 'SQLITE_CORRUPT' && code !== 'SQLITE_NOTADB') throw error;
      quarantined = true;
      quarantine(path, now);
      db = openDatabase(path);
    }
    return { engine: new StoreEngine(db, path), quarantined };
  }

  /** Göçleri ad sırasıyla uygular; uygulanmış olanları atlar (yalnızca ekleme, NFR5.10). */
  migrate(migrations: { name: string; sql: string }[]): void {
    this.db.exec(
      'CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at INTEGER NOT NULL)',
    );
    const applied = new Set(
      (this.db.prepare('SELECT name FROM schema_migrations').all() as { name: string }[]).map(
        (r) => r.name,
      ),
    );
    for (const migration of [...migrations].sort((a, b) => a.name.localeCompare(b.name))) {
      if (applied.has(migration.name)) continue;
      this.db.transaction(() => {
        this.db.exec(migration.sql);
        this.db
          .prepare('INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)')
          .run(migration.name, Date.now());
      })();
    }
  }

  private statement(sql: string): Database.Statement {
    let stmt = this.statements.get(sql);
    if (!stmt) {
      stmt = this.db.prepare(sql);
      this.statements.set(sql, stmt);
    }
    return stmt;
  }

  private runRequest(request: WriteRequest): void {
    for (const op of request.ops) {
      const info = this.statement(op.sql).run(...op.params);
      if (op.expectChanges !== undefined && info.changes !== op.expectChanges) {
        throw Object.assign(new Error('version conflict'), { code: 'STORE_CONFLICT' });
      }
    }
  }

  /**
   * Toplu işlem: tek SQLite işlemi, her istek kendi geri alma noktasında; tek kesinleştirme.
   * Kesinleştirme başarısızsa toplu işlemdeki bütün istekler başarısız sayılır.
   */
  runBatch(requests: WriteRequest[]): BatchOutcome {
    const started = performance.now();
    const results: WriteResult[] = [];
    const failed = new Set<number>();
    this.beginWithRetry();
    for (const request of requests) {
      if (request.dependsOn !== undefined && failed.has(request.dependsOn)) {
        failed.add(request.id);
        results.push({ id: request.id, status: 'aborted_dependency' });
        continue;
      }
      this.db.exec('SAVEPOINT req');
      try {
        this.runRequest(request);
        this.db.exec('RELEASE req');
        results.push({ id: request.id, status: 'committed' });
      } catch (error) {
        this.db.exec('ROLLBACK TO req');
        this.db.exec('RELEASE req');
        failed.add(request.id);
        results.push({ id: request.id, status: 'failed', errorCode: errorCode(error) });
      }
    }
    try {
      this.db.exec('COMMIT');
    } catch (error) {
      if (this.db.inTransaction) this.db.exec('ROLLBACK');
      const code = errorCode(error);
      return {
        results: requests.map((r) => ({ id: r.id, status: 'failed', errorCode: code })),
        commitMs: performance.now() - started,
      };
    }
    return { results, commitMs: performance.now() - started };
  }

  private beginWithRetry(): void {
    for (let attempt = 0; ; attempt += 1) {
      try {
        this.db.exec('BEGIN IMMEDIATE');
        return;
      } catch (error) {
        if (errorCode(error) !== 'SQLITE_BUSY' || attempt >= BUSY_RETRIES) throw error;
        sleepSync(BUSY_WAIT_MS);
      }
    }
  }

  /** Açılış yüklemesi (C9 restore-rule). */
  loadAll(): StoreSnapshot {
    const all = (sql: string) => this.db.prepare(sql).all() as never[];
    return {
      rooms: all(SELECT_ROOMS).map(roomFromRow),
      participants: all(SELECT_PARTICIPANTS).map(participantFromRow),
      matches: all(SELECT_MATCHES).map(matchFromRow),
      chat: all(SELECT_RECENT_MESSAGES).map(messageFromRow),
      chatCommandIds: (all(SELECT_COMMAND_IDS) as { room_code: string; command_id: string }[]).map(
        (r) => ({
          roomCode: r.room_code,
          commandId: r.command_id,
        }),
      ),
      sessions: all(SELECT_SESSIONS).map(sessionFromRow),
    };
  }

  /** WAL'ı diske aktarıp sıfıra kısaltır; silinen veri günlük dosyasında kalmaz (NFR7.14). */
  checkpoint(): void {
    this.db.pragma('wal_checkpoint(TRUNCATE)');
  }

  /** 24 saatten eski kenara alınmış bozuk dosyaları siler (NFR5.9). */
  purgeCorruptFiles(nowMs: number): number {
    const dir = dirname(this.path);
    const prefix = `${basename(this.path)}.corrupt-`;
    let deleted = 0;
    for (const name of readdirSync(dir)) {
      if (!name.startsWith(prefix)) continue;
      const full = join(dir, name);
      if (nowMs - statSync(full).mtimeMs >= CORRUPT_KEEP_MS) {
        rmSync(full, { force: true });
        deleted += 1;
      }
    }
    return deleted;
  }

  close(): void {
    if (this.db.open) {
      this.checkpoint();
      this.db.close();
    }
  }
}

/** Göç klasöründeki .sql dosyalarını okur. */
export function readMigrations(dir: string): { name: string; sql: string }[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => ({ name, sql: readFileSync(join(dir, name), 'utf8') }));
}
