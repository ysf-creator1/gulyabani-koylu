// /static/* izin listesi: açılışta derleme klasöründeki dosyalar okunur; yol birleştirmesi
// yapılmaz, listede olmayan her yol 404 alır (security-design Web Yanıtları). Önceden
// sıkıştırılmış .br/.gz kopyaları varsa tarayıcının kabul ettiği verilir (NFR1.6).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

export interface StaticFile {
  contentType: string;
  body: Buffer;
  br?: Buffer;
  gzip?: Buffer;
  /** Dosya adında içerik özeti var mı (uzun süreli önbellek). */
  hashed: boolean;
}

export interface StaticIndex {
  index: StaticFile | null;
  files: Map<string, StaticFile>;
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function load(full: string): StaticFile {
  const file: StaticFile = {
    contentType: TYPES[extname(full)] ?? 'application/octet-stream',
    body: readFileSync(full),
    hashed: /[.-][A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(full),
  };
  if (existsSync(`${full}.br`)) file.br = readFileSync(`${full}.br`);
  if (existsSync(`${full}.gz`)) file.gzip = readFileSync(`${full}.gz`);
  return file;
}

export function loadStaticIndex(webDir: string): StaticIndex {
  const files = new Map<string, StaticFile>();
  if (!existsSync(webDir)) return { index: null, files };
  let index: StaticFile | null = null;
  for (const full of walk(webDir)) {
    if (full.endsWith('.br') || full.endsWith('.gz')) continue;
    const rel = relative(webDir, full).split(sep).join('/');
    if (rel === 'index.html') index = load(full);
    else files.set(`/static/${rel}`, load(full));
  }
  return { index, files };
}

/**
 * Ana sayfaya sunucunun sürümünü yazar (meta app-version); tarayıcı hello'da bunu gönderir.
 * Sıkıştırılmış kopyalar yeni içerikle yeniden üretilir.
 */
export function withAppVersion(index: StaticFile | null, version: string): StaticFile | null {
  if (!index) return null;
  const safe = version.replace(/[^\w.+-]/g, '');
  const body = Buffer.from(index.body.toString('utf8').replace('__APP_VERSION__', safe));
  return {
    ...index,
    body,
    gzip: gzipSync(body),
    br: brotliCompressSync(body),
  };
}

/** Tarayıcının kabul ettiği sıkıştırma (önce Brotli). */
export function pickEncoding(
  file: StaticFile,
  acceptEncoding: string | undefined,
): { body: Buffer; encoding?: string } {
  const accept = acceptEncoding ?? '';
  if (file.br && /\bbr\b/.test(accept)) return { body: file.br, encoding: 'br' };
  if (file.gzip && /\bgzip\b/.test(accept)) return { body: file.gzip, encoding: 'gzip' };
  return { body: file.body };
}
