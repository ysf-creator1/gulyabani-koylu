// M-11 Moderatör ekranı (BR8.1, BR6.10, BR4.3): faz/adım, okunacak anons, beklenen işlem ve
// durumu, kalan süre, ilerletme düğmeleri (stepVersion taşır, BR10.7), oyuncular (rol, yaşam,
// "kopuk"), oy ayrıntısı, gece olay günlüğü ve gulyabani sohbeti. Telefonda dört sekme,
// geniş ekranda sütunlar.
import { useState } from 'preact/hooks';
import type { ViewGame, ViewModerator } from '../../../shared/view.ts';
import { ChatPanel } from '../../components/ChatPanel.tsx';
import { PhaseBar } from '../../components/game.tsx';
import { FieldError, SideLabel, StatusBanner } from '../../components/ui.tsx';
import { nickOf, useGame } from '../../context.ts';
import { t } from '../../i18n.ts';
import { NightLog } from '../PlayerGame.tsx';

type Tab = 'flow' | 'players' | 'log' | 'chat';
const TABS: { id: Tab; key: string }[] = [
  { id: 'flow', key: 'mod.tabFlow' },
  { id: 'players', key: 'mod.tabPlayers' },
  { id: 'log', key: 'mod.tabLog' },
  { id: 'chat', key: 'mod.tabChat' },
];

interface Advance {
  command: 'game.nextStep' | 'game.revealResult' | 'game.moveToVote' | 'game.newGame';
  labelKey: string;
  enabled: boolean;
}

/** Faz Bitirme Tablosu'na göre bu adımda moderatörün ilerletme düğmesi. */
export function advanceFor(game: ViewGame, mod: ViewModerator): Advance | null {
  switch (game.phase) {
    case 'first_night':
    case 'night': {
      const waiting =
        mod.stepCursor === 'ghul_kill' &&
        (mod.stepStatus === 'waiting' || mod.stepStatus === 'player_disconnected');
      return { command: 'game.nextStep', labelKey: 'mod.nextStep', enabled: !waiting };
    }
    case 'morning':
      return { command: 'game.revealResult', labelKey: 'mod.revealResult', enabled: true };
    case 'day':
      return { command: 'game.moveToVote', labelKey: 'mod.moveToVote', enabled: true };
    case 'voting':
      return { command: 'game.nextStep', labelKey: 'mod.closeVoting', enabled: true };
    case 'last_words':
      return { command: 'game.nextStep', labelKey: 'mod.endLastWords', enabled: true };
    case 'ended':
      return { command: 'game.newGame', labelKey: 'mod.newGame', enabled: true };
    default:
      return null;
  }
}

function FlowPanel({ game, mod }: { game: ViewGame; mod: ViewModerator }) {
  const { view, send } = useGame();
  const [error, setError] = useState<string | null>(null);
  const run = async (name: string, args: Record<string, unknown> = {}) => {
    const ack = await send(name, args);
    setError(ack.status === 'rejected' ? (ack.reasonCode ?? 'internal_error') : null);
  };
  const advance = advanceFor(game, mod);
  const seen = mod.allSeats.filter((s) => s.cardSeen).length;
  const hasTimer = game.deadline !== undefined || game.remainingMs !== undefined;
  const voters = new Set((game.votes ?? []).map((v) => v.voterSeatId));
  const notVoted = mod.allSeats.filter((s) => s.alive && !voters.has(s.seatId)).map((s) => s.nick);
  return (
    <section class="panel" aria-labelledby="mod-flow-title" data-testid="mod-flow">
      <h2 id="mod-flow-title">
        {mod.stepCursor ? t(`step.${mod.stepCursor}`) : t(`phase.${game.phase}`)}
      </h2>
      <h3>{t('mod.announcement')}</h3>
      <p class="announcement" data-testid="mod-announcement">
        {t(mod.announcementTextKey, mod.announcementParams ?? {})}
      </p>
      <h3>{t('mod.expected')}</h3>
      <p data-testid="mod-expected">{t(mod.expectedAction)}</p>
      {mod.stepStatus && (
        <p data-testid="mod-step-status">
          {t('mod.status')}: <span class="badge">{t(`stepStatus.${mod.stepStatus}`)}</span>
        </p>
      )}
      {mod.stepCursor === 'card_reveal' && (
        <p class="small">{t('mod.seenCount', { seen, total: mod.allSeats.length })}</p>
      )}
      {mod.pendingDeathSeatIds && (
        <p class="small" data-testid="mod-pending">
          {mod.pendingDeathSeatIds.length > 0
            ? t('mod.pending', {
                names: mod.pendingDeathSeatIds.map((id) => nickOf(view, id)).join(', '),
              })
            : t('mod.pendingNone')}
        </p>
      )}
      {mod.notices.map((notice) => (
        <StatusBanner key={notice.textKey} testId="mod-notice">
          {t(notice.textKey, notice.params ?? {})}
        </StatusBanner>
      ))}
      <div class="button-row">
        {advance && (
          <button
            type="button"
            class="button"
            disabled={!advance.enabled}
            data-testid="mod-advance-button"
            onClick={() =>
              void run(
                advance.command,
                advance.command === 'game.newGame' ? {} : { stepVersion: mod.stepVersion },
              )
            }
          >
            {t(advance.labelKey)}
          </button>
        )}
        {hasTimer && (
          <button
            type="button"
            class="button button--secondary"
            data-testid="mod-extend-button"
            onClick={() => void run('game.timerExtend', { seconds: 30 })}
          >
            {t('mod.extend')}
          </button>
        )}
        {game.phase !== 'ended' &&
          (game.paused ? (
            <button
              type="button"
              class="button button--secondary"
              data-testid="mod-resume-button"
              onClick={() => void run('game.resume')}
            >
              {t('mod.resume')}
            </button>
          ) : (
            <button
              type="button"
              class="button button--secondary"
              data-testid="mod-pause-button"
              onClick={() => void run('game.pause')}
            >
              {t('mod.pause')}
            </button>
          ))}
      </div>
      <FieldError reasonCode={error} id="mod-error" />
      {game.votes && (
        <section data-testid="mod-votes">
          <h3>{t('mod.votesTitle')}</h3>
          <ul class="list">
            {game.votes.length === 0 && <li class="muted">{t('mod.noVotes')}</li>}
            {game.votes.map((v) => (
              <li key={v.voterSeatId}>
                {t('mod.voteLine', {
                  voter: nickOf(view, v.voterSeatId),
                  target: nickOf(view, v.targetSeatId),
                })}
              </li>
            ))}
          </ul>
          {notVoted.length > 0 && (
            <p class="small">{t('mod.notVoted', { names: notVoted.join(', ') })}</p>
          )}
        </section>
      )}
    </section>
  );
}

function PlayersPanel({ mod }: { mod: ViewModerator }) {
  return (
    <section class="panel" aria-labelledby="mod-players-title" data-testid="mod-players">
      <h2 id="mod-players-title">{t('mod.tabPlayers')}</h2>
      <ul class="list">
        {mod.allSeats.map((s) => (
          <li key={s.seatId} data-testid={`mod-seat-${s.seatId}`}>
            <span class={s.alive ? '' : 'badge--dead'}>{s.nick}</span>
            <SideLabel side={s.roleId === 'ghul' ? 'ghuls' : 'villagers'} />
            <span class="badge">{s.alive ? t('seat.alive') : t('seat.dead')}</span>
            {!s.connected && <span class="badge badge--warning">{t('seat.disconnected')}</span>}
            {s.cardSeen && <span class="badge badge--success">{t('seat.seen')}</span>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ModeratorScreen() {
  const { view } = useGame();
  const [tab, setTab] = useState<Tab>('flow');
  const game = view.game as ViewGame;
  const mod = view.moderator as ViewModerator;
  const panel = (id: Tab) => `mod-panel${tab === id ? ' is-active' : ''}`;
  return (
    <main class="screen screen--wide" data-testid="moderator-screen">
      <PhaseBar game={game} />
      <div class="mod-tabs" role="tablist" aria-label={t('mod.tabs')}>
        {TABS.map(({ id, key }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`mod-tab-${id}`}
            class="button button--secondary"
            aria-selected={tab === id}
            aria-controls={`mod-panel-${id}`}
            data-testid={`mod-tab-${id}`}
            onClick={() => setTab(id)}
          >
            {t(key)}
          </button>
        ))}
      </div>
      <div class="mod-columns">
        <div
          id="mod-panel-flow"
          role="tabpanel"
          aria-labelledby="mod-tab-flow"
          class={panel('flow')}
        >
          <FlowPanel game={game} mod={mod} />
        </div>
        <div
          id="mod-panel-players"
          role="tabpanel"
          aria-labelledby="mod-tab-players"
          class={panel('players')}
        >
          <PlayersPanel mod={mod} />
        </div>
        <div id="mod-panel-log" role="tabpanel" aria-labelledby="mod-tab-log" class={panel('log')}>
          <section class="panel" aria-labelledby="mod-log-title">
            <h2 id="mod-log-title">{t('mod.tabLog')}</h2>
            <NightLog entries={game.nightLog ?? []} />
          </section>
        </div>
        <div
          id="mod-panel-chat"
          role="tabpanel"
          aria-labelledby="mod-tab-chat"
          class={panel('chat')}
        >
          <ChatPanel channel="day" />
          <ChatPanel channel="ghul" titleKey="mod.ghulChat" />
        </div>
      </div>
    </main>
  );
}
