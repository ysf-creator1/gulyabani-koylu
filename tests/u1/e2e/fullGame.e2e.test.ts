// Bot oyunculu uçtan uca test (A14, NFR12.2, NFR8.2, NFR8.3, NFR13.8): test başında kendinden
// imzalı sertifika, gerçek sunucu süreci ve TLS vekiliyle gerçek şifreli bağlantı (wss).
// Bot moderatör + 3 ve 8 bot oyuncu tam bir oyunu kazananla bitirir. Denetimler: kazanan doğru,
// köylü botlarına giden mesajlarda yasak alan 0, gece görünümleri aynı, sayaçlar sunucu saatine
// uyar, ortasında bir botun bağlantısı koparılıp geri gelir, günlükte nick/metin/IP yok.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Server } from 'node:tls';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { RecipientView } from '../../../src/shared/view.ts';
import { BotPlayer } from '../../bots/botPlayer.ts';
import { C1Client } from '../../bots/c1Client.ts';
import { ModeratorDriver } from '../../bots/moderatorDriver.ts';
import { makeSelfSignedCert, startTlsProxy, type TestCert } from '../../bots/tls.ts';
import {
  ROOT,
  freePort,
  spawnServer,
  waitForHealth,
  type ServerProcess,
} from '../server/process.ts';
import { makeTempDir, removeTempDir } from '../server/tempDir.ts';

const VERSION = 'v0.1.0';
const CHAT_MARKER = 'e2e-meydan-mesaji';
const BAD_JSON_MARKER = 'BOZUKJSON-7731';
const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;

let dir: string;
let cert: TestCert;
let proxy: Server;
let proc: ServerProcess;
let origin: string;
let internalPort: number;
const report: Record<string, unknown>[] = [];

beforeAll(async () => {
  dir = makeTempDir('e2e');
  cert = makeSelfSignedCert(dir);
  const [proxyPort, publicPort] = [await freePort(), await freePort()];
  internalPort = await freePort();
  origin = `https://localhost:${proxyPort}`;
  proc = spawnServer({
    PUBLIC_ORIGIN: origin,
    PORT_PUBLIC: String(publicPort),
    PORT_INTERNAL: String(internalPort),
    DATA_DIR: join(dir, 'data'),
    APP_VERSION: VERSION,
    NODE_ENV: 'test',
    DEV_TIME_SCALE: '0.05',
  });
  await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`);
  proxy = await startTlsProxy(cert, proxyPort, publicPort);
});

afterAll(async () => {
  const health = await waitForHealth(`http://127.0.0.1:${internalPort}/healthz`).catch(() => ({}));
  mkdirSync(join(ROOT, 'reports'), { recursive: true });
  writeFileSync(
    join(ROOT, 'reports', 'e2e-summary.json'),
    JSON.stringify(
      {
        scenarios: report,
        commandsProcessed: (health as Record<string, unknown>).commandsProcessed,
        commandLatencyP50Ms: (health as Record<string, unknown>).commandLatencyP50Ms,
        commandLatencyP95Ms: (health as Record<string, unknown>).commandLatencyP95Ms,
        errorCount: (health as Record<string, unknown>).errorCount,
      },
      null,
      2,
    ),
  );
  proxy?.close();
  proc?.child.kill('SIGTERM');
  await proc?.exited;
  removeTempDir(dir);
});

const connectOptions = () => ({
  url: `${origin.replace('https', 'wss')}/ws`,
  origin,
  ca: cert.cert,
});

/** Köylüye gitmemesi gereken alanları sayar (BR11.1, BR11.2, NFR8.2). */
function forbiddenFields(view: RecipientView): number {
  let count = 0;
  if (view.moderator) count += 1;
  if (view.chat.channels.some((c) => c.channel === 'ghul')) count += 1;
  const game = view.game;
  if (game) {
    if (game.ghulMarks) count += 1;
    for (const seat of game.seats) {
      if (seat.roleId !== undefined) count += 1;
      if (seat.revealedRoleId !== undefined && seat.alive && game.phase !== 'ended') count += 1;
    }
  }
  return count;
}

function winnerIsCorrect(view: RecipientView): boolean {
  const game = view.game!;
  const aliveGhuls = game.seats.filter((s) => s.alive && s.revealedRoleId === 'ghul').length;
  const aliveOthers = game.seats.filter((s) => s.alive && s.revealedRoleId !== 'ghul').length;
  if (game.winners?.sides[0] === 'villagers') return aliveGhuls === 0;
  return aliveGhuls > 0 && aliveGhuls >= aliveOthers;
}

async function playGame(players: number, reconnectIndex: number | null) {
  const started = Date.now();
  let nightMismatches = 0;
  let reconnected = false;
  const bots: BotPlayer[] = Array.from(
    { length: players },
    (_, i) =>
      new BotPlayer({
        ...connectOptions(),
        appVersion: VERSION,
        nick: i === 0 ? '<b>Zx</b>' : `Zbot${players}-${i}`,
        chatText: `${CHAT_MARKER} ${i}`,
      }),
  );
  const villagers = () => bots.filter((b) => b.view?.me.roleId === 'villager');
  const driver = new ModeratorDriver({
    ...connectOptions(),
    appVersion: VERSION,
    onStep: async (view) => {
      const game = view.game!;
      const night = game.phase === 'first_night' || game.phase === 'night';
      if (night && view.moderator?.stepCursor !== 'card_reveal') {
        await new Promise((r) => setTimeout(r, 150));
        const blocks = new Set(villagers().map((b) => JSON.stringify(b.view?.game)));
        if (blocks.size > 1) nightMismatches += 1;
      }
      if (reconnectIndex !== null && !reconnected && game.phase === 'day') {
        reconnected = true;
        const back = await bots[reconnectIndex]!.reconnect();
        expect(back.me.nick).toBe(bots[reconnectIndex]!.nick);
        expect(back.game?.phase).toBeDefined();
      }
    },
  });
  const roomCode = await driver.createRoom(`Zmod${players}`);
  for (const bot of bots) {
    await bot.connect();
    await bot.join(roomCode);
  }
  await driver.start(players);
  const final = await driver.finished;
  await new Promise((r) => setTimeout(r, 200));

  const villagerViews = villagers().flatMap((b) =>
    b.client.messages
      .filter((m) => m.type === 'view')
      .map((m) => (m as { view: RecipientView }).view),
  );
  const forbidden = villagerViews.reduce((sum, v) => sum + forbiddenFields(v), 0);
  const deadlines = new Map<string, Set<number>>();
  let clockSkew = 0;
  for (const bot of bots) {
    for (const message of bot.client.messages) {
      if (message.type !== 'view') continue;
      const game = (message.view as unknown as RecipientView).game;
      clockSkew = Math.max(clockSkew, Math.abs(message.serverTime - Date.now()) > 60_000 ? 1 : 0);
      if (!game?.deadline) continue;
      const key = `${game.phase}:${game.nightNumber}:${game.dayNumber}:${game.voteRound}:${game.accusedSeatId}`;
      deadlines.set(key, (deadlines.get(key) ?? new Set()).add(game.deadline));
    }
  }
  const deadlineConflicts = [...deadlines.values()].filter((set) => set.size > 1).length;
  const rejected: Record<string, number> = {};
  for (const source of [...bots.map((b) => b.rejected), driver.rejected]) {
    for (const [code, count] of source) rejected[code] = (rejected[code] ?? 0) + count;
  }
  const summary = {
    players,
    winner: final.game!.winners!.sides[0],
    durationMs: Date.now() - started,
    nights: final.game!.nightNumber,
    days: final.game!.dayNumber,
    moderatorSteps: driver.steps,
    forbiddenFieldsToVillagers: forbidden,
    nightViewMismatches: nightMismatches,
    deadlineConflicts,
    reconnected,
    rejected,
    bots: bots.map((b) => b.nick),
  };
  report.push(summary);
  await Promise.all([...bots.map((b) => b.close()), driver.client.close()]);
  return { final, summary };
}

describe('bot oyunculu tam oyun', () => {
  it('3 bot oyuncuyla oyun kazananla biter; köylülere yasak alan gitmez', async () => {
    const { final, summary } = await playGame(3, null);
    expect(final.game!.phase).toBe('ended');
    expect(winnerIsCorrect(final)).toBe(true);
    expect(summary.forbiddenFieldsToVillagers).toBe(0);
    expect(summary.nightViewMismatches).toBe(0);
    expect(summary.deadlineConflicts).toBe(0);
  });

  it('8 bot oyuncuyla oyun biter; ortasında kopan bot geri gelir; gece görünümleri aynı', async () => {
    const { final, summary } = await playGame(8, 3);
    expect(final.game!.phase).toBe('ended');
    expect(winnerIsCorrect(final)).toBe(true);
    expect(summary.reconnected).toBe(true);
    expect(summary.forbiddenFieldsToVillagers).toBe(0);
    expect(summary.nightViewMismatches).toBe(0);
    expect(summary.deadlineConflicts).toBe(0);
  });

  it('bozuk girdiler bağlantıyı kapatır; günlükte nick, sohbet metni, bozuk girdi ve IP yoktur', async () => {
    const raw = await C1Client.connect(connectOptions());
    await raw.hello({ appVersion: VERSION });
    raw.send(`{"type":"command","name":"${BAD_JSON_MARKER}`);
    await raw.closed;
    expect(raw.closedReason).toBe('unsupported_protocol');
    const log = proc.output();
    expect(log.length).toBeGreaterThan(0);
    for (const forbidden of ['Zbot3-1', 'Zbot8-2', '<b>Zx', CHAT_MARKER, BAD_JSON_MARKER])
      expect(log).not.toContain(forbidden);
    expect(IPV4.test(log)).toBe(false);
  });
});
