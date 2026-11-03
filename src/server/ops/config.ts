// Ortam değişkenlerinden program ayarları (security-design Sırlar: hiçbiri sır değildir).
// PUBLIC_ORIGIN bir URL olarak ayrıştırılır; https değilse ya da yol/sorgu/parça içeriyorsa
// program açılmaz. DEV_TIME_SCALE yalnızca geliştirme ve testte süreleri kısaltır.
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export interface Config {
  publicOrigin: string;
  /** CSP connect-src değeri: wss://<ana makine[:kapı]> (security-design Web Yanıtları). */
  connectSrc: string;
  host: string;
  portPublic: number;
  portInternal: number;
  dataDir: string;
  appVersion: string;
  nodeEnv: string;
  timeScale: number;
  webDir: string;
  contentDir: string;
}

export class ConfigError extends Error {
  readonly problems: string[];
  constructor(problems: string[]) {
    super(`invalid configuration: ${problems.join('; ')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

/** src/server/ops ve dist/server/ops ikisi de proje kökünden üç seviye aşağıdadır. */
export function appRoot(): string {
  return resolve(fileURLToPath(new URL('.', import.meta.url)), '../../..');
}

/** Üretimde kapı 1–65535; geliştirme ve testte 0 (işletim sistemi seçer) de olabilir. */
function parsePort(
  name: string,
  raw: string | undefined,
  nodeEnv: string,
  problems: string[],
): number {
  const port = Number(raw);
  const min = nodeEnv === 'production' ? 1 : 0;
  if (!raw || !Number.isInteger(port) || port < min || port > 65535)
    problems.push(`${name} must be a port number`);
  return port;
}

function parseOrigin(raw: string | undefined, nodeEnv: string, problems: string[]) {
  if (!raw) {
    problems.push('PUBLIC_ORIGIN is required');
    return { origin: '', connectSrc: '' };
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    problems.push('PUBLIC_ORIGIN must be a URL');
    return { origin: '', connectSrc: '' };
  }
  const localDev =
    nodeEnv === 'development' &&
    url.protocol === 'http:' &&
    ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !localDev) problems.push('PUBLIC_ORIGIN must use https');
  if ((url.pathname !== '/' && url.pathname !== '') || url.search || url.hash || url.username) {
    problems.push('PUBLIC_ORIGIN must not contain path, query or fragment');
  }
  return {
    origin: url.origin,
    connectSrc: `${url.protocol === 'https:' ? 'wss' : 'ws'}://${url.host}`,
  };
}

export function loadConfig(env: NodeJS.ProcessEnv): Config {
  const problems: string[] = [];
  const nodeEnv = env.NODE_ENV ?? 'production';
  const { origin, connectSrc } = parseOrigin(env.PUBLIC_ORIGIN, nodeEnv, problems);
  const portPublic = parsePort('PORT_PUBLIC', env.PORT_PUBLIC, nodeEnv, problems);
  const portInternal = parsePort('PORT_INTERNAL', env.PORT_INTERNAL, nodeEnv, problems);
  if (portPublic === portInternal && portPublic !== 0)
    problems.push('PORT_PUBLIC and PORT_INTERNAL must differ');
  if (!env.DATA_DIR) problems.push('DATA_DIR is required');
  const appVersion = env.APP_VERSION ?? '';
  if (!/^v\d+\.\d+\.\d+([.+-][\w.]+)?$|^dev$/.test(appVersion))
    problems.push('APP_VERSION must look like vX.Y.Z');
  let timeScale = 1;
  if (env.DEV_TIME_SCALE !== undefined) {
    timeScale = Number(env.DEV_TIME_SCALE);
    if (nodeEnv === 'production') problems.push('DEV_TIME_SCALE is not allowed in production');
    if (!(timeScale > 0 && timeScale <= 1)) problems.push('DEV_TIME_SCALE must be in (0, 1]');
  }
  if (problems.length > 0) throw new ConfigError(problems);
  const root = appRoot();
  return {
    publicOrigin: origin,
    connectSrc,
    host: '127.0.0.1',
    portPublic,
    portInternal,
    dataDir: resolve(env.DATA_DIR as string),
    appVersion,
    nodeEnv,
    timeScale,
    webDir: resolve(env.WEB_DIR ?? resolve(root, 'dist/web')),
    contentDir: resolve(root, 'content'),
  };
}
