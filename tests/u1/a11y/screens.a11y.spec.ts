// Erişilebilirlik taraması (NFR9.1, NFR10.1, BR13.3): iskelet ekranları 320 px genişlikte,
// gerçek sunucu ve gerçek bir oyun üzerinde, gündüz ve gece temalarında axe-core ile taranır.
// Ciddi ya da kritik bulgu sayısı 0 olmalıdır. Önkoşul: npm run build:web.
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { BotPlayer } from '../../bots/botPlayer.ts';
import {
  ROOT,
  freePort,
  spawnServer,
  waitForHealth,
  type ServerProcess,
} from '../server/process.ts';
import { makeTempDir, removeTempDir } from '../server/tempDir.ts';

const VERSION = 'v0.1.0';
const findings: {
  screen: string;
  id: string;
  impact: string | null | undefined;
  targets: string[];
}[] = [];
const scanned: string[] = [];

async function scan(page: Page, screen: string): Promise<void> {
  // Tema geçişi (200 ms) bitmeden taranırsa ara renkler ölçülür; kısa bekleme.
  await page.waitForTimeout(400);
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  scanned.push(screen);
  for (const v of result.violations) {
    if (v.impact === 'serious' || v.impact === 'critical') {
      findings.push({
        screen,
        id: v.id,
        impact: v.impact,
        targets: v.nodes.map(
          (n) => `${n.target.join(' ')} ${n.failureSummary?.split('\n')[1] ?? ''}`,
        ),
      });
    }
  }
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width, `${screen}: 320 px'te yatay kaydırma olmamalı`).toBeLessThanOrEqual(320);
}

async function visible(page: Page, testId: string, timeout = 1500): Promise<boolean> {
  return page
    .getByTestId(testId)
    .waitFor({ state: 'visible', timeout })
    .then(
      () => true,
      () => false,
    );
}

async function advance(moderator: Page, timeout = 30_000): Promise<void> {
  const button = moderator.getByTestId('mod-advance-button');
  await expect(button).toBeEnabled({ timeout });
  await button.click();
}

test('iskelet ekranlarında ciddi ya da kritik erişilebilirlik bulgusu yoktur', async ({
  browser,
  page,
}, info) => {
  test.skip(!existsSync(join(ROOT, 'dist/web/index.html')), 'önce npm run build:web');
  const dir = makeTempDir('a11y');
  const [port, internal] = [await freePort(), await freePort()];
  const origin = `http://localhost:${port}`;
  const proc: ServerProcess = spawnServer({
    PUBLIC_ORIGIN: origin,
    PORT_PUBLIC: String(port),
    PORT_INTERNAL: String(internal),
    DATA_DIR: join(dir, 'data'),
    APP_VERSION: VERSION,
    NODE_ENV: 'development',
    DEV_TIME_SCALE: '0.2',
  });
  const bots: BotPlayer[] = [];
  try {
    await waitForHealth(`http://127.0.0.1:${internal}/healthz`);
    await page.goto(`${origin}/`);
    await page.getByTestId('home-screen').waitFor();
    await scan(page, 'home');
    await page.getByTestId('home-create-button').click();
    await scan(page, 'entry-create');
    await page.getByTestId('entry-nick-input').fill('Moderator');
    await page.getByTestId('entry-submit-button').click();
    await page.getByTestId('lobby-screen').waitFor();
    await scan(page, 'lobby-moderator');
    const roomCode = (await page.getByTestId('lobby-room-code').textContent())?.trim() ?? '';

    const playerContext = await browser.newContext({
      viewport: { width: 320, height: 640 },
      colorScheme: info.project.use.colorScheme,
    });
    const player = await playerContext.newPage();
    await player.goto(`${origin}/oda/${roomCode}`);
    await player.getByTestId('entry-screen').waitFor();
    await scan(player, 'entry-join');
    await player.getByTestId('entry-nick-input').fill('Oyuncu');
    await player.getByTestId('entry-submit-button').click();
    await player.getByTestId('lobby-screen').waitFor();
    await scan(player, 'lobby-player');

    for (let i = 1; i <= 3; i += 1) {
      const bot = new BotPlayer({
        url: `ws://localhost:${port}/ws`,
        origin,
        appVersion: VERSION,
        nick: `Bot${i}`,
        chatText: 'merhaba',
      });
      await bot.connect();
      await bot.join(roomCode);
      bots.push(bot);
    }
    await expect(page.getByTestId('lobby-start-button')).toBeEnabled();
    await page.getByTestId('lobby-start-button').click();
    await page.getByTestId('moderator-screen').waitFor();
    await scan(page, 'moderator-card-night');
    await player.getByTestId('card-screen').waitFor();
    await scan(player, 'card-closed');
    await player.getByTestId('role-card').click();
    await scan(player, 'card-open');
    await player.getByTestId('card-seen-button').click();

    await advance(page);
    if (await visible(player, 'ghul-meet-screen')) await scan(player, 'ghul-meet');
    else await scan(player, 'sleep');
    await advance(page);
    if (await visible(player, 'ghul-kill-screen')) {
      await scan(player, 'ghul-kill');
      await player.locator('[data-testid^="ghul-targets-"]').first().click();
      await expect(player.getByTestId('ghul-confirm-button')).toBeEnabled({ timeout: 10_000 });
      await player.getByTestId('ghul-confirm-button').click();
    }
    await scan(page, 'moderator-ghul-kill');
    await advance(page);
    await player.getByTestId('morning-screen').waitFor();
    await scan(player, 'morning');
    await scan(page, 'moderator-morning');
    await advance(page);
    if (await visible(player, 'day-screen', 5000)) {
      await scan(player, 'day');
      await scan(page, 'moderator-day');
      await page.getByTestId('mod-tab-players').click();
      await scan(page, 'moderator-players-tab');
      await page.getByTestId('mod-tab-flow').click();
      await advance(page);
      if (await visible(player, 'vote-panel', 5000)) {
        await scan(player, 'voting');
        const target = player.locator('[data-testid^="vote-targets-"]').first();
        if (await target.isVisible()) await target.click();
      }
      await page.waitForTimeout(1500);
      await scan(page, 'moderator-voting');
      await advance(page);
      if (await visible(player, 'last-words-screen', 5000)) await scan(player, 'last-words');
    }
    if (await visible(player, 'end-screen', 15_000)) await scan(player, 'end');
    await playerContext.close();
  } finally {
    await Promise.all(bots.map((b) => b.close().catch(() => 0)));
    proc.child.kill('SIGTERM');
    await proc.exited;
    removeTempDir(dir);
  }
  console.log(`taranan ekranlar (${info.project.name}): ${scanned.join(', ')}`);
  expect(findings, JSON.stringify(findings, null, 2)).toEqual([]);
});
