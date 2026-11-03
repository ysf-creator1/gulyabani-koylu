// M-03/M-04 Lobi: kod ve link, katılımcılar, açık roller (BR2.4); moderatörde "Oyunu Başlat"
// (3–26 oyuncu, 3–5 oyuncuda öneri uyarısı, BR2.1) ve onay sorusuyla çıkarma (BR2.3).
import { useState } from 'preact/hooks';
import { ConfirmDialog, SideLabel, StatusBanner } from '../components/ui.tsx';
import { useGame } from '../context.ts';
import { t } from '../i18n.ts';

export function LobbyScreen() {
  const { view, send } = useGame();
  const [kickTarget, setKickTarget] = useState<{ id: string; nick: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const moderator = view.me.kind === 'moderator';
  // Nick'ler oda içinde benzersizdir; moderatör oyuncu listesine ve sayısına girmez (BR1.2).
  const players = view.room.participants.filter((p) => p.nick !== view.room.moderatorNick);
  const playerCount = players.length;
  const block = view.room.startBlock;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(view.room.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <main class="screen" data-testid="lobby-screen">
      <h1>{t('lobby.title')}</h1>
      <section class="panel" aria-labelledby="lobby-code-title">
        <h2 id="lobby-code-title">{t('lobby.codeLabel')}</h2>
        <p class="code-box" data-testid="lobby-room-code">
          {view.room.roomCode}
        </p>
        <h3>{t('lobby.linkLabel')}</h3>
        <p class="link-box" data-testid="lobby-room-link">
          {view.room.link}
        </p>
        <button
          type="button"
          class="button button--secondary"
          data-testid="lobby-copy-button"
          onClick={copyLink}
        >
          {t('lobby.copyLink')}
        </button>
        {copied && (
          <span role="status" class="small">
            {' '}
            {t('lobby.linkCopied')}
          </span>
        )}
        <p class="small muted">{t('lobby.expires')}</p>
      </section>
      <section class="panel" aria-labelledby="lobby-players-title">
        <h2 id="lobby-players-title">
          {t('lobby.participants')} · {t('lobby.playerCount', { count: playerCount })}
        </h2>
        <p class="small">{t('lobby.moderatorLabel', { nick: view.room.moderatorNick })}</p>
        <ul class="list" data-testid="lobby-player-list">
          {players.map((p) => (
            <li key={p.participantId}>
              <span>{p.nick}</span>
              {p.participantId === view.me.participantId && (
                <span class="badge">{t('seat.you')}</span>
              )}
              {moderator && (
                <button
                  type="button"
                  class="button button--danger"
                  aria-label={t('lobby.kickLabel', { nick: p.nick })}
                  data-testid={`lobby-kick-${p.participantId}`}
                  onClick={() => setKickTarget({ id: p.participantId, nick: p.nick })}
                >
                  {t('lobby.kick')}
                </button>
              )}
            </li>
          ))}
        </ul>
        {kickTarget && (
          <ConfirmDialog
            question={t('lobby.kickConfirm', { nick: kickTarget.nick })}
            yes={t('lobby.kickYes')}
            no={t('lobby.kickNo')}
            onYes={() => {
              void send('lobby.kick', { participantId: kickTarget.id });
              setKickTarget(null);
            }}
            onNo={() => setKickTarget(null)}
          />
        )}
      </section>
      <section class="panel" aria-labelledby="lobby-roles-title">
        <h2 id="lobby-roles-title">{t('lobby.openRoles')}</h2>
        <ul class="list">
          <li>
            <SideLabel side="ghuls" /> {t('role.ghul.name')}
          </li>
          <li>
            <SideLabel side="villagers" /> {t('role.villager.name')}
          </li>
        </ul>
      </section>
      {moderator ? (
        <section>
          {block?.warnings.includes('few_players') && (
            <StatusBanner testId="lobby-few-warning">{t('lobby.warn.few_players')}</StatusBanner>
          )}
          <button
            type="button"
            class="button button--block"
            disabled={Boolean(block?.reasonCode)}
            aria-describedby={block?.reasonCode ? 'lobby-start-reason' : undefined}
            data-testid="lobby-start-button"
            onClick={() => void send('lobby.startGame')}
          >
            {t('lobby.start')}
          </button>
          {block?.reasonCode && (
            <p id="lobby-start-reason" class="hint">
              {t('lobby.minPlayers')}
            </p>
          )}
        </section>
      ) : (
        <p class="panel">{t('lobby.waitingForModerator')}</p>
      )}
    </main>
  );
}
