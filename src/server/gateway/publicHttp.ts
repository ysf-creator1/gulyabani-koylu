// Genel dinleyici (C2): /, /oda/{kod}, /static/*, /ws geçişi ve genel /healthz.
// Güvenlik başlıklarını oyun programı ekler (security-design Web Yanıtları). İsteğin kaynak
// adresi ve vekil başlıkları hiçbir yerde okunmaz (NFR7.11).
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { Duplex } from 'node:stream';
import { ROOM_CODE_PATTERN } from '../../shared/domain.ts';
import { pickEncoding, type StaticFile, type StaticIndex } from './staticFiles.ts';

export interface PublicHttpDeps {
  publicOrigin: string;
  connectSrc: string;
  staticIndex: StaticIndex;
  /** Genel /healthz gövdesi; null ise 503 (açılış sürüyor ya da depo yanıt vermiyor). */
  health: () => Promise<Record<string, unknown> | null>;
  /** Geçiş denetimleri geçtiyse WebSocket'e devreder. */
  upgrade: (req: IncomingMessage, socket: Duplex, head: Buffer) => void;
  canUpgrade: () => { ok: true } | { ok: false; status: 503 };
}

export function contentSecurityPolicy(connectSrc: string): string {
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    `connect-src 'self' ${connectSrc}`,
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join('; ');
}

const COMMON_HEADERS: Record<string, string> = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function send(
  res: ServerResponse,
  status: number,
  headers: Record<string, string>,
  body?: Buffer | string,
): void {
  res.writeHead(status, { ...COMMON_HEADERS, ...headers });
  res.end(body);
}

function sendFile(
  req: IncomingMessage,
  res: ServerResponse,
  file: StaticFile,
  headers: Record<string, string>,
): void {
  const { body, encoding } = pickEncoding(file, req.headers['accept-encoding']);
  const out: Record<string, string> = {
    'Content-Type': file.contentType,
    Vary: 'Accept-Encoding',
    ...headers,
  };
  if (encoding) out['Content-Encoding'] = encoding;
  out['Content-Length'] = String(body.length);
  send(res, 200, out, req.method === 'HEAD' ? undefined : body);
}

export function normalizeOrigin(value: string): string {
  return value.trim().toLowerCase().replace(/\/+$/, '');
}

/** Geçiş isteğine düz HTTP yanıtı yazıp soketi kapatır. */
function refuseUpgrade(socket: Duplex, status: number, text: string): void {
  socket.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
}

export function createPublicServer(deps: PublicHttpDeps): Server {
  const csp = contentSecurityPolicy(deps.connectSrc);
  const expectedOrigin = normalizeOrigin(deps.publicOrigin);
  const server = createServer(async (req, res) => {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD')
        return send(res, 405, { Allow: 'GET, HEAD' });
      const path = (req.url ?? '/').split('?')[0] as string;
      if (path === '/healthz') {
        const body = await deps.health();
        if (!body) return send(res, 503, { 'Cache-Control': 'no-store' });
        return send(
          res,
          200,
          { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          JSON.stringify(body),
        );
      }
      const roomMatch = /^\/oda\/([^/]+)$/.exec(path);
      if (path === '/' || (roomMatch && ROOM_CODE_PATTERN.test(roomMatch[1] as string))) {
        const index = deps.staticIndex.index;
        if (!index) return send(res, 404, { 'Cache-Control': 'no-cache' });
        return sendFile(req, res, index, {
          'Content-Security-Policy': csp,
          'Cache-Control': 'no-cache',
        });
      }
      const file = deps.staticIndex.files.get(path);
      if (file) {
        const cache = file.hashed ? 'public, max-age=31536000, immutable' : 'no-cache';
        return sendFile(req, res, file, { 'Cache-Control': cache });
      }
      send(res, 404, { 'Content-Type': 'text/plain; charset=utf-8' });
    } catch {
      if (!res.headersSent) send(res, 500, {});
      else res.end();
    }
  });
  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const path = (req.url ?? '').split('?')[0];
    if (path !== '/ws') return refuseUpgrade(socket, 404, 'Not Found');
    const origin = req.headers.origin;
    if (!origin || normalizeOrigin(origin) !== expectedOrigin)
      return refuseUpgrade(socket, 403, 'Forbidden');
    const allowed = deps.canUpgrade();
    if (!allowed.ok) return refuseUpgrade(socket, 503, 'Service Unavailable');
    deps.upgrade(req, socket, head);
  });
  return server;
}
