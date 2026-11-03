// Erişilebilirlik taraması (NFR9.1, NFR10.1): Chromium, 320 px genişlik, açık ve koyu tema.
// Önkoşul: `npm run build:web` ve ilk kez `npx playwright install chromium`.
import { defineConfig, devices } from '@playwright/test';

const narrowPhone = { width: 320, height: 640 };

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.a11y.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  reporter: [['list'], ['json', { outputFile: 'reports/a11y-report.json' }]],
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium-light',
      use: { ...devices['Desktop Chrome'], viewport: narrowPhone, colorScheme: 'light' },
    },
    {
      name: 'chromium-dark',
      use: { ...devices['Desktop Chrome'], viewport: narrowPhone, colorScheme: 'dark' },
    },
  ],
});
