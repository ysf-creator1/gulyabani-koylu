// Web paketi denetimi (NFR1.6, NFR7.9): derlenmiş betik + stil dosyalarının gzip toplamı en fazla
// 150 KB; derlenmiş HTML'de satır içi `style` özniteliği ve `<style>` bloğu yok (CSP'de
// 'unsafe-inline' yok). Kullanım: node scripts/check-bundle.ts [dist/web]
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

export const BUDGET_BYTES = 150 * 1024;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

export interface BundleReport {
  gzipBytes: number;
  inlineStyleFiles: string[];
  problems: string[];
}

export function checkBundle(webDir: string): BundleReport {
  const files = walk(webDir);
  const gzipBytes = files
    .filter((f) => /\.(js|css)$/.test(f))
    .reduce((sum, f) => sum + gzipSync(readFileSync(f), { level: 9 }).length, 0);
  const inlineStyleFiles = files
    .filter((f) => f.endsWith('.html'))
    .filter((f) => /<style[\s>]|\sstyle\s*=/i.test(readFileSync(f, 'utf8')));
  const problems: string[] = [];
  if (gzipBytes > BUDGET_BYTES)
    problems.push(`gzip toplamı ${gzipBytes} bayt, sınır ${BUDGET_BYTES}`);
  for (const file of inlineStyleFiles) problems.push(`satır içi stil: ${file}`);
  if (!files.some((f) => f.endsWith('index.html'))) problems.push('index.html bulunamadı');
  return { gzipBytes, inlineStyleFiles, problems };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const dir = resolve(process.argv[2] ?? join(import.meta.dirname, '../dist/web'));
  const report = checkBundle(dir);
  console.log(
    `Web paketi (gzip): ${(report.gzipBytes / 1024).toFixed(1)} KB / ${BUDGET_BYTES / 1024} KB`,
  );
  for (const problem of report.problems) console.error(problem);
  if (report.problems.length > 0) process.exit(1);
  console.log('Satır içi stil yok; paket boyutu sınırın altında.');
}
