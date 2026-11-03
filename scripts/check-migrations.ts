// Depo biçimi yalnızca eklemeyle değişir (NFR5.10): göç dosyalarında tablo/sütun silme,
// yeniden adlandırma ya da tür değiştirme yoktur. Önceki sürüm aynı depoyu okuyabilsin diye
// (geri almanın önkoşulu). Kullanım: node scripts/check-migrations.ts [klasör]
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const FORBIDDEN: { pattern: RegExp; label: string }[] = [
  { pattern: /\bDROP\s+(TABLE|COLUMN|INDEX|VIEW|TRIGGER)\b/i, label: 'DROP' },
  { pattern: /\bRENAME\b/i, label: 'RENAME' },
  { pattern: /\bALTER\s+TABLE\s+\S+\s+(DROP|ALTER)\b/i, label: 'ALTER TABLE … DROP/ALTER' },
  { pattern: /\bDELETE\s+FROM\s+schema_migrations\b/i, label: 'schema_migrations silme' },
];

export function stripSqlComments(sql: string): string {
  return sql.replace(/\/\*[\s\S]*?\*\//g, '').replace(/--.*$/gm, '');
}

export function findViolations(sql: string): string[] {
  const code = stripSqlComments(sql);
  return FORBIDDEN.filter(({ pattern }) => pattern.test(code)).map(({ label }) => label);
}

export function checkDirectory(dir: string): { file: string; violations: string[] }[] {
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .map((name) => ({
      file: name,
      violations: findViolations(readFileSync(join(dir, name), 'utf8')),
    }))
    .filter((entry) => entry.violations.length > 0);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const dir = resolve(
    process.argv[2] ?? join(import.meta.dirname, '../src/server/store/migrations'),
  );
  const problems = checkDirectory(dir);
  for (const problem of problems) {
    console.error(
      `Yalnızca ekleme kuralı bozuldu: ${problem.file}: ${problem.violations.join(', ')}`,
    );
  }
  if (problems.length > 0) process.exit(1);
  console.log('Göç dosyaları yalnızca ekleme kuralına uyuyor.');
}
