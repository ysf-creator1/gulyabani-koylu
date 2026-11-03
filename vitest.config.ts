// Birim ve entegrasyon testleri (unit-test-instructions.md). Uçtan uca test ayrı ayardadır.
// Kapsam eşikleri team.md Testing Posture'dan gelir ve gevşetilmez: tüm kod %80, src/rules %90.
import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [preact()],
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/**/*.e2e.test.ts', 'tests/**/*.a11y.spec.ts', 'node_modules/**'],
    environment: 'node',
    testTimeout: 20_000,
    hookTimeout: 30_000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      reporter: ['text-summary', 'json-summary', 'text'],
      reportsDirectory: 'coverage',
      thresholds: {
        lines: 80,
        'src/rules/**': { lines: 90 },
      },
    },
  },
});
