// Bot oyunculu uçtan uca test (A14, NFR12.2). Tek iş parçacığında, uzun zaman aşımıyla çalışır;
// her test kendi sunucu sürecini, veri klasörünü ve sertifikasını kurar.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.e2e.test.ts'],
    environment: 'node',
    pool: 'forks',
    fileParallelism: false,
    maxWorkers: 1,
    testTimeout: 300_000,
    hookTimeout: 60_000,
  },
});
