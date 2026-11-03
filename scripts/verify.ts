// Construction doğrulama komutu (npm run verify, NFR12.2): Vitest testleri kapsam eşikleriyle
// (tüm kod %80, src/rules %90; gevşetilmez), ardından bot oyunculu uçtan uca test ve kısa rapor
// (observability-design Bot Testi Raporu). Ön koşul yalnızca `npm ci` (NFR12.3).
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const VITEST = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');

function run(label: string, args: string[]): boolean {
  console.log(`\n=== ${label} ===`);
  const result = spawnSync(process.execPath, [VITEST, ...args], { cwd: ROOT, stdio: 'inherit' });
  return result.status === 0;
}

interface CoverageEntry {
  lines: { total: number; covered: number; pct: number };
}

function coverageSummary(): { total: number; rules: number } | null {
  const file = join(ROOT, 'coverage', 'coverage-summary.json');
  if (!existsSync(file)) return null;
  const data = JSON.parse(readFileSync(file, 'utf8')) as Record<string, CoverageEntry>;
  let total = 0;
  let covered = 0;
  for (const [path, entry] of Object.entries(data)) {
    if (!path.includes('/src/rules/')) continue;
    total += entry.lines.total;
    covered += entry.lines.covered;
  }
  return {
    total: data.total?.lines.pct ?? 0,
    rules: total === 0 ? 0 : Math.round((covered / total) * 10_000) / 100,
  };
}

const unitOk = run('Birim ve entegrasyon testleri + kapsam', ['run', 'tests/', '--coverage']);
const e2eOk = run('Bot oyunculu uçtan uca test', [
  'run',
  '--config',
  'vitest.e2e.config.ts',
  'tests/',
]);

console.log('\n=== Kısa rapor ===');
const coverage = coverageSummary();
if (coverage)
  console.log(
    `Satır kapsamı: tüm kod %${coverage.total}, src/rules %${coverage.rules} (sınırlar %80 / %90)`,
  );
const e2eFile = join(ROOT, 'reports', 'e2e-summary.json');
if (existsSync(e2eFile)) {
  const e2e = JSON.parse(readFileSync(e2eFile, 'utf8')) as {
    scenarios: {
      players: number;
      winner: string;
      durationMs: number;
      nights: number;
      days: number;
      forbiddenFieldsToVillagers: number;
    }[];
    commandsProcessed?: number;
    commandLatencyP50Ms?: number;
    commandLatencyP95Ms?: number;
  };
  for (const s of e2e.scenarios) {
    console.log(
      `${s.players} bot: kazanan ${s.winner}, ${s.nights} gece / ${s.days} gün, ${s.durationMs} ms, köylülere yasak alan ${s.forbiddenFieldsToVillagers}`,
    );
  }
  console.log(
    `İşlenen komut: ${e2e.commandsProcessed ?? '?'}, işleme süresi %50 ${e2e.commandLatencyP50Ms ?? '?'} ms, %95 ${e2e.commandLatencyP95Ms ?? '?'} ms`,
  );
}
console.log(`Sonuç: ${unitOk && e2eOk ? 'BAŞARILI' : 'BAŞARISIZ'}`);
process.exitCode = unitOk && e2eOk ? 0 : 1;
