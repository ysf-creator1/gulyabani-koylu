// Testlerin geçici veri klasörleri: proje içindeki test-results/tmp altında açılır, test
// sonunda silinir (testler birbirinin verisini paylaşmaz; unit-test-instructions.md).
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '../../../test-results/tmp');

export function makeTempDir(prefix: string): string {
  mkdirSync(ROOT, { recursive: true });
  return mkdtempSync(join(ROOT, `${prefix}-`));
}

export function removeTempDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}
