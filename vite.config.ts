// Web paketinin derleme ayarı (performance-design "Tarayıcı Tarafı", NFR1.6).
// Çıktı dist/web/ altına gider; dosya adları içerik özeti taşır ve her dosyanın
// Brotli ve gzip kopyası derleme sonunda önceden üretilir.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';
import preact from '@preact/preset-vite';
import { defineConfig, type Plugin } from 'vite';

const OUT_DIR = resolve(import.meta.dirname, 'dist/web');
const COMPRESSIBLE = /\.(js|css|html|svg|json|txt)$/;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

// Derleme bitince sıkıştırılmış kopyaları yazar (sunucu tarayıcının kabul ettiğini verir).
function precompress(): Plugin {
  return {
    name: 'gulyabani-precompress',
    apply: 'build',
    closeBundle() {
      for (const file of listFiles(OUT_DIR)) {
        if (!COMPRESSIBLE.test(file)) continue;
        const data = readFileSync(file);
        writeFileSync(`${file}.gz`, gzipSync(data, { level: 9 }));
        writeFileSync(
          `${file}.br`,
          brotliCompressSync(data, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 } }),
        );
      }
    },
  };
}

export default defineConfig({
  root: resolve(import.meta.dirname, 'src/web'),
  base: '/static/',
  publicDir: false,
  plugins: [preact(), precompress()],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    target: 'es2020',
    // Satır içi betik üretilmesin (CSP'de 'unsafe-inline' yok, NFR7.9)
    modulePreload: { polyfill: false },
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    sourcemap: false,
  },
});
