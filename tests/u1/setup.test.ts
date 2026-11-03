// Test koşucusunun çalıştığını ve ortamın plan varsayımlarına uyduğunu gösteren duman testi.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

describe('test ortamı', () => {
  it('package.json engines.node .nvmrc ile aynıdır', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    const nvmrc = readFileSync(resolve(root, '.nvmrc'), 'utf8').trim();
    expect(pkg.engines.node).toBe(nvmrc);
  });

  it('paket ES modülü olarak tanımlıdır ve sürüm 0.x semver biçimindedir', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    expect(pkg.type).toBe('module');
    expect(pkg.version).toMatch(/^0\.\d+\.\d+$/);
  });

  it('çalışan Node.js ana sürümü en az 24tür', () => {
    const major = Number(process.versions.node.split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(24);
  });
});
