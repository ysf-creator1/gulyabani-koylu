// JSON günlük (observability-design Günlük Kaydı): satır başına bir nesne, standart çıktıya.
// Yalnızca beyaz listedeki alanlar yazılır ve her alanın biçimi denetlenir; nick, sohbet metni,
// rol, belirteç ve IP için alan yoktur. Hata nesnesinin mesaj metni hiçbir zaman yazılmaz
// (security-design Kişisel Veri, NFR7.11, NFR8.4).
export type LogLevel = 'info' | 'warn' | 'error';

export interface LogFields {
  roomCode?: string;
  matchId?: string;
  command?: string;
  commandId?: string;
  reasonCode?: string;
  durationMs?: number;
  count?: number;
  limit?: string;
  connId?: string;
  err?: unknown;
}

export interface Logger {
  info(event: string, fields?: LogFields): void;
  warn(event: string, fields?: LogFields): void;
  error(event: string, fields?: LogFields): void;
}

const PATTERNS = {
  event: /^[a-z][a-z_.]{0,63}$/,
  roomCode: /^[0-9]{6}$/,
  id: /^[A-Za-z0-9:_-]{1,128}$/,
  command: /^[a-z]+\.[A-Za-z]+$/,
  token: /^[a-z_]{1,64}$/,
  connId: /^[0-9a-f]{1,32}$/,
};

function pick(pattern: RegExp, value: unknown): string | undefined {
  return typeof value === 'string' && pattern.test(value) ? value : undefined;
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.round(value * 1000) / 1000
    : undefined;
}

/** Hata türünün adı, varsa sabit kodu ve yığın izinin dosya:satır çerçeveleri; mesaj yok. */
export function describeError(error: unknown): { name: string; code?: string; frames: string[] } {
  const e = (error ?? {}) as { name?: unknown; code?: unknown; stack?: unknown };
  const name = pick(/^[A-Za-z][A-Za-z0-9_]{0,63}$/, e.name) ?? 'Error';
  const code = pick(/^[A-Z][A-Z0-9_]{0,63}$/, e.code);
  const frames: string[] = [];
  if (typeof e.stack === 'string') {
    for (const match of e.stack.matchAll(/([A-Za-z0-9_.-]+\.(?:ts|js|mjs|cjs)):(\d+):\d+/g)) {
      frames.push(`${match[1]}:${match[2]}`);
      if (frames.length >= 8) break;
    }
  }
  return code ? { name, code, frames } : { name, frames };
}

export function formatLine(
  level: LogLevel,
  event: string,
  fields: LogFields,
  version: string,
  now: Date,
): string {
  const record: Record<string, unknown> = {
    t: now.toISOString(),
    level,
    event: pick(PATTERNS.event, event) ?? 'invalid_event',
    version: pick(/^[\w.+-]{1,64}$/, version) ?? 'unknown',
  };
  const safe: Record<string, unknown> = {
    roomCode: pick(PATTERNS.roomCode, fields.roomCode),
    matchId: pick(PATTERNS.id, fields.matchId),
    command: pick(PATTERNS.command, fields.command),
    commandId: pick(PATTERNS.id, fields.commandId),
    reasonCode: pick(PATTERNS.token, fields.reasonCode),
    durationMs: finite(fields.durationMs),
    count: finite(fields.count),
    limit: pick(PATTERNS.token, fields.limit),
    connId: pick(PATTERNS.connId, fields.connId),
  };
  for (const [key, value] of Object.entries(safe)) if (value !== undefined) record[key] = value;
  if (level === 'error' && fields.err !== undefined) record.err = describeError(fields.err);
  return JSON.stringify(record);
}

export function createLogger(options: {
  version: string;
  write?: (line: string) => void;
  clock?: () => Date;
}): Logger {
  const write = options.write ?? ((line: string) => process.stdout.write(`${line}\n`));
  const clock = options.clock ?? (() => new Date());
  const log =
    (level: LogLevel) =>
    (event: string, fields: LogFields = {}) =>
      write(formatLine(level, event, fields, options.version, clock()));
  return { info: log('info'), warn: log('warn'), error: log('error') };
}

/** Testler ve --check-config için sessiz günlük. */
export const silentLogger: Logger = { info: () => {}, warn: () => {}, error: () => {} };
