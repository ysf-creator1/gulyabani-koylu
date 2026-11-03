// Web paketi denetimi (NFR1.6, NFR7.9).
import { randomBytes } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { BUDGET_BYTES, checkBundle } from '../../../scripts/check-bundle.ts';
import { makeTempDir, removeTempDir } from '../server/tempDir.ts';

let dir = '';
afterEach(() => removeTempDir(dir));

function site(html: string, jsBytes: Buffer | string = 'console.log(1)') {
  dir = makeTempDir('bundle');
  mkdirSync(join(dir, 'assets'));
  writeFileSync(join(dir, 'index.html'), html);
  writeFileSync(join(dir, 'assets', 'index-abc12345.js'), jsBytes);
  writeFileSync(join(dir, 'assets', 'style-abc12345.css'), 'body{margin:0}');
}

describe('check-bundle', () => {
  it('küçük ve satır içi stilsiz paket geçer', () => {
    site('<!doctype html><link rel="stylesheet" href="/static/assets/style-abc12345.css">');
    const report = checkBundle(dir);
    expect(report.problems).toEqual([]);
    expect(report.gzipBytes).toBeGreaterThan(0);
  });

  it('style özniteliği ve <style> bloğu yakalanır', () => {
    site('<!doctype html><div style="color:red"></div><style>p{}</style>');
    expect(checkBundle(dir).inlineStyleFiles).toHaveLength(1);
  });

  it('150 KB gzip sınırını aşan paket başarısız olur', () => {
    site('<!doctype html>', randomBytes(BUDGET_BYTES + 10_000));
    expect(checkBundle(dir).problems[0]).toMatch(/gzip toplamı/);
  });
});
