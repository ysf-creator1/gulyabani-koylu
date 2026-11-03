// Gerçek sunucu sürecini (node src/server/main.ts) başlatan test yardımcıları.
import { spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '../../..');

export function freePort(): Promise<number> {
  return new Promise((done, fail) => {
    const server = createServer();
    server.once('error', fail);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : 0;
      server.close(() => done(port));
    });
  });
}

export interface ServerProcess {
  child: ChildProcess;
  output: () => string;
  exited: Promise<number | null>;
}

export function spawnServer(env: Record<string, string>, args: string[] = []): ServerProcess {
  const child = spawn(process.execPath, ['src/server/main.ts', ...args], {
    cwd: ROOT,
    env: { PATH: process.env.PATH ?? '', ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout?.on('data', (chunk) => (output += chunk.toString()));
  child.stderr?.on('data', (chunk) => (output += chunk.toString()));
  const exited = new Promise<number | null>((done) => child.on('exit', (code) => done(code)));
  return { child, output: () => output, exited };
}

export async function waitForHealth(
  url: string,
  timeoutMs = 20_000,
): Promise<Record<string, unknown>> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return (await res.json()) as Record<string, unknown>;
    } catch {
      // süreç henüz dinlemiyor
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`health not ready: ${url}`);
}
