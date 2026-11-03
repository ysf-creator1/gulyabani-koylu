// Oyun programının girişi. `--check-config` ortam değişkenlerini ve içerik kataloğunu (C4)
// doğrular, dinleyici açmadan 0 ya da 1 koduyla çıkar (yayın betiği bağ değiştirmeden önce
// çalıştırır). Planlı kapanış: SIGTERM ile ≤ 5 sn (NFR5.3).
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { CatalogError, loadCatalog } from '../content/catalog.ts';
import { App } from './app.ts';
import { ConfigError, loadConfig } from './ops/config.ts';
import { createLogger } from './ops/logger.ts';

const HARD_STOP_MS = 9000;

export function checkConfig(env: NodeJS.ProcessEnv, out: (line: string) => void): number {
  try {
    const config = loadConfig(env);
    loadCatalog(config.contentDir);
    out('config ok');
    return 0;
  } catch (error) {
    if (error instanceof ConfigError || error instanceof CatalogError) {
      for (const problem of error.problems) out(`config error: ${problem}`);
      return 1;
    }
    throw error;
  }
}

export async function serve(env: NodeJS.ProcessEnv): Promise<App> {
  const config = loadConfig(env);
  loadCatalog(config.contentDir);
  const logger = createLogger({ version: config.appVersion });
  const app = new App({ config, logger });
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    setTimeout(() => process.exit(1), HARD_STOP_MS).unref();
    app.stop().then(
      () => process.exit(0),
      (error) => {
        logger.error('fatal', { err: error });
        process.exit(1);
      },
    );
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
  process.on('uncaughtException', (error) => {
    logger.error('fatal', { err: error });
    process.exit(1);
  });
  process.on('unhandledRejection', (error) => {
    logger.error('fatal', { err: error });
    process.exit(1);
  });
  try {
    await app.start();
  } catch (error) {
    logger.error('startup.failed', { err: error });
    process.exit(1);
  }
  return app;
}

function isEntryPoint(): boolean {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  if (process.argv.includes('--check-config')) {
    process.exitCode = checkConfig(process.env, (line) => console.log(line));
  } else {
    void serve(process.env);
  }
}
