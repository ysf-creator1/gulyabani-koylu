// Günlükte IP, nick, sohbet metni ve hata mesajı bulunmaz (project.md Forbidden, C-14, NFR7.11,
// NFR8.4, observability-design alan beyaz listesi).
import { describe, expect, it } from 'vitest';
import { createLogger, describeError, formatLine } from '../../../src/server/ops/logger.ts';

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
const IPV6 = /\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/i;
const at = new Date('2026-11-02T10:00:00.000Z');

describe('günlük satırı', () => {
  it('satır başına bir JSON nesnesi; zorunlu alanlar ve beyaz listedeki alanlar yazılır', () => {
    const line = JSON.parse(
      formatLine(
        'warn',
        'command.rejected',
        {
          roomCode: '123456',
          command: 'game.vote',
          reasonCode: 'invalid_target',
          commandId: 'c-1',
          durationMs: 3.21,
        },
        'v0.1.0',
        at,
      ),
    );
    expect(line).toEqual({
      t: '2026-11-02T10:00:00.000Z',
      level: 'warn',
      event: 'command.rejected',
      version: 'v0.1.0',
      roomCode: '123456',
      command: 'game.vote',
      commandId: 'c-1',
      reasonCode: 'invalid_target',
      durationMs: 3.21,
    });
  });

  it('beyaz listede olmayan alan ve biçimi uymayan değer yazılmaz (IP, nick, metin)', () => {
    const fields = {
      roomCode: '192.168.1.20',
      commandId: 'Ayşe <script>',
      reasonCode: 'merhaba arkadaşlar',
      connId: '2001:db8::1',
      nick: 'Ayşe',
      text: 'gizli mesaj',
      ip: '10.0.0.1',
    } as Record<string, unknown>;
    const line = formatLine('warn', 'command.rejected', fields, 'v0.1.0', at);
    expect(IPV4.test(line)).toBe(false);
    expect(IPV6.test(line)).toBe(false);
    expect(line).not.toContain('Ayşe');
    expect(line).not.toContain('gizli');
    expect(Object.keys(JSON.parse(line)).sort()).toEqual(['event', 'level', 't', 'version']);
  });

  it('hata alanı yalnızca tür adı, kod ve dosya:satır taşır; mesaj metni yazılmaz', () => {
    const error = Object.assign(
      new SyntaxError('Unexpected token in JSON at position 3: {"nick":"Ayşe 10.1.2.3"'),
      { code: 'BAD_JSON' },
    );
    const line = formatLine('error', 'command.internal_error', { err: error }, 'v0.1.0', at);
    const parsed = JSON.parse(line);
    expect(parsed.err.name).toBe('SyntaxError');
    expect(parsed.err.code).toBe('BAD_JSON');
    expect(parsed.err.frames.every((f: string) => /^[\w.-]+\.(ts|js|mjs|cjs):\d+$/.test(f))).toBe(
      true,
    );
    expect(line).not.toContain('Unexpected');
    expect(line).not.toContain('Ayşe');
    expect(IPV4.test(line)).toBe(false);
  });

  it('err yalnızca error düzeyinde yazılır; tanınmayan olay adı işaretlenir', () => {
    expect(
      JSON.parse(formatLine('info', 'sweep.done', { err: new Error('x') }, 'v0.1.0', at)),
    ).not.toHaveProperty('err');
    expect(JSON.parse(formatLine('info', 'Nick: Ayşe', {}, 'v0.1.0', at)).event).toBe(
      'invalid_event',
    );
    expect(describeError(null)).toEqual({ name: 'Error', frames: [] });
  });

  it('createLogger verilen yazıcıya düzeyle yazar', () => {
    const lines: string[] = [];
    const logger = createLogger({
      version: 'v0.1.0',
      write: (l) => lines.push(l),
      clock: () => at,
    });
    logger.info('startup.begin');
    logger.warn('limit.near', { limit: 'room_creates' });
    logger.error('fatal', { err: new TypeError('boom') });
    expect(lines.map((l) => JSON.parse(l).level)).toEqual(['info', 'warn', 'error']);
  });
});
