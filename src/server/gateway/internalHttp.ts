// İç sağlık dinleyicisi (NFR7.12, NFR13.1): yalnızca 127.0.0.1 üzerinde, Caddy bu kapıyı hiç
// iletmez. "İçeriden mi" kararı isteğin geldiği dinleyiciyle verilir; kaynak adrese bakılmaz.
import { createServer, type Server } from 'node:http';

export function createInternalServer(
  health: () => Promise<Record<string, unknown> | null>,
): Server {
  return createServer(async (req, res) => {
    const path = (req.url ?? '/').split('?')[0];
    if ((req.method !== 'GET' && req.method !== 'HEAD') || path !== '/healthz') {
      res.writeHead(404, { 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    const body = await health().catch(() => null);
    if (!body) {
      res.writeHead(503, { 'Cache-Control': 'no-store' });
      res.end();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(body));
  });
}
