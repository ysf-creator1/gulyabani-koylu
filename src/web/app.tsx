// Uygulama kabuğu: yönlendirme (/ ve /oda/{kod}), bağlantı şeridi (BR9.2), "Tekrar oyundasın",
// kibar duyuru alanı (faz değişimi; gece sırası duyurulmaz, BR4.7), tema (gece/gündüz) ve
// bağlantının kapanış nedenine göre tam ekran mesaj (M-16).
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { ROOM_CODE_PATTERN, type Phase } from '../shared/domain.ts';
import type { RecipientView } from '../shared/view.ts';
import { MessageScreen, StatusBanner } from './components/ui.tsx';
import { GameContext, type GameContextValue } from './context.ts';
import { t } from './i18n.ts';
import type { ServerClock } from './net/clock.ts';
import type { AckResult, ConnectionListener, ConnectionState } from './net/connection.ts';
import type { TokenStore } from './net/tokens.ts';
import { EntryScreen } from './screens/EntryScreen.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LobbyScreen } from './screens/LobbyScreen.tsx';
import { ModeratorScreen } from './screens/moderator/ModeratorScreen.tsx';
import { PlayerGame } from './screens/PlayerGame.tsx';

export interface ConnectionPort {
  readonly clock: ServerClock;
  start(token?: string): void;
  restartFresh(): void;
  send(name: string, args?: Record<string, unknown>): Promise<AckResult>;
  subscribe(listener: ConnectionListener): () => void;
  wake(): void;
}

export interface AppProps {
  connection: ConnectionPort;
  tokens: TokenStore;
  initialPath: string;
  navigate: (path: string) => void;
  reload: () => void;
  setTheme?: (theme: 'day' | 'night') => void;
}

const BACK_NOTICE_MS = 3000;

export function roomCodeFromPath(path: string): string | null {
  const match = /^\/oda\/([^/]+)\/?$/.exec(path);
  return match && ROOM_CODE_PATTERN.test(match[1] as string) ? (match[1] as string) : null;
}

/** Faz değişiminde ekran okuyucuya söylenecek metin; gece adımları duyurulmaz. */
export function phaseAnnouncement(
  previous: Phase | undefined,
  next: Phase | undefined,
): string | null {
  if (!next || previous === next) return null;
  if (next === 'first_night' || next === 'night') return t('transition.night');
  if (next === 'morning') return t('transition.day');
  return t(`phase.${next}`);
}

type Entry = { mode: 'create' | 'join'; roomCode?: string; busy: boolean; error: string | null };

export function App(props: AppProps) {
  const { connection, tokens } = props;
  const [path, setPath] = useState(props.initialPath);
  const [view, setView] = useState<RecipientView | null>(null);
  const [connState, setConnState] = useState<{ state: ConnectionState; failing: boolean }>({
    state: 'idle',
    failing: false,
  });
  const [closedReason, setClosedReason] = useState<string | null>(null);
  const [entry, setEntry] = useState<Entry | null>(null);
  const [backNotice, setBackNotice] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const pendingToken = useRef<string | undefined>(undefined);
  const wasOpen = useRef(false);
  const lastPhase = useRef<Phase | undefined>(undefined);

  const go = (next: string) => {
    props.navigate(next);
    setPath(next);
  };

  useEffect(() => {
    return connection.subscribe({
      onState: (state, failing) => {
        setConnState({ state, failing });
        if (state === 'open') {
          if (wasOpen.current) setBackNotice(true);
          wasOpen.current = true;
        }
      },
      onWelcome: (token) => {
        if (token) pendingToken.current = token;
      },
      onView: (next) => {
        if (pendingToken.current) {
          tokens.set(next.room.roomCode, pendingToken.current);
          pendingToken.current = undefined;
        }
        const said = phaseAnnouncement(lastPhase.current, next.game?.phase);
        if (said) setAnnouncement(said);
        lastPhase.current = next.game?.phase;
        setView(next);
        setEntry(null);
        const roomPath = `/oda/${next.room.roomCode}`;
        if (window.location.pathname !== roomPath) props.navigate(roomPath);
        setPath(roomPath);
      },
      onClosed: (reason) => {
        if (reason !== 'superseded') setClosedReason(reason);
        if (view) tokens.remove(view.room.roomCode);
      },
      onReload: () => props.reload(),
    });
  }, [connection, tokens]);

  // Açılış: oda linkinde saklı belirteç varsa aynı oturumla döner (BR9.1); yoksa yeni oturum.
  useEffect(() => {
    const code = roomCodeFromPath(props.initialPath);
    if (!code) return;
    const token = tokens.get(code);
    if (token) connection.start(token);
    else {
      connection.restartFresh();
      setEntry({ mode: 'join', roomCode: code, busy: false, error: null });
    }
  }, []);

  useEffect(() => {
    if (!backNotice) return undefined;
    const timer = setTimeout(() => setBackNotice(false), BACK_NOTICE_MS);
    return () => clearTimeout(timer);
  }, [backNotice]);

  useEffect(() => {
    const night = view?.game && (view.game.phase === 'first_night' || view.game.phase === 'night');
    props.setTheme?.(night ? 'night' : 'day');
  }, [view?.game?.phase]);

  useEffect(() => {
    const wake = () => connection.wake();
    const visible = () => {
      if (document.visibilityState === 'visible') connection.wake();
    };
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('online', wake);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [connection]);

  const context = useMemo<GameContextValue | null>(
    () =>
      view
        ? { view, send: (name, args) => connection.send(name, args), clock: connection.clock }
        : null,
    [view, connection],
  );

  const submitEntry = async (nick: string) => {
    if (!entry) return;
    setEntry({ ...entry, busy: true, error: null });
    const ack =
      entry.mode === 'create'
        ? await connection.send('room.create', { nick })
        : await connection.send('room.join', { roomCode: entry.roomCode, nick });
    if (ack.status === 'rejected') {
      const reason = ack.reasonCode ?? 'internal_error';
      if (reason === 'room_not_found' || reason === 'room_full') setClosedReason(reason);
      setEntry((current) => (current ? { ...current, busy: false, error: reason } : current));
    }
  };

  const goHome = () => {
    setClosedReason(null);
    setView(null);
    setEntry(null);
    go('/');
  };

  let body;
  if (closedReason) body = <MessageScreen textKey={`error.${closedReason}`} onHome={goHome} />;
  else if (view && context) {
    const inLobby = view.room.status === 'lobby' || !view.game;
    body = (
      <GameContext.Provider value={context}>
        {inLobby ? (
          <LobbyScreen />
        ) : view.me.kind === 'moderator' ? (
          <ModeratorScreen />
        ) : (
          <PlayerGame />
        )}
      </GameContext.Provider>
    );
  } else if (entry) {
    body = (
      <EntryScreen
        mode={entry.mode}
        roomCode={entry.roomCode}
        busy={entry.busy}
        errorCode={entry.error}
        onSubmit={submitEntry}
        onBack={goHome}
      />
    );
  } else if (roomCodeFromPath(path)) {
    body = <p class="screen">{t('app.loading')}</p>;
  } else {
    body = (
      <HomeScreen
        onCreate={() => {
          connection.restartFresh();
          setEntry({ mode: 'create', busy: false, error: null });
        }}
        onJoin={(code) => {
          connection.restartFresh();
          setEntry({ mode: 'join', roomCode: code, busy: false, error: null });
          go(`/oda/${code}`);
        }}
      />
    );
  }

  const showReconnecting =
    wasOpen.current && (connState.state === 'waiting' || connState.state === 'connecting');
  return (
    <>
      <div
        class="visually-hidden"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={t('a11y.liveRegion')}
        data-testid="live-region"
      >
        {announcement}
      </div>
      {showReconnecting && (
        <StatusBanner testId="conn-banner">
          {connState.failing ? t('conn.failed') : t('conn.reconnecting')}
        </StatusBanner>
      )}
      {backNotice && connState.state === 'open' && (
        <StatusBanner tone="success" testId="conn-back">
          {t('conn.back')}
        </StatusBanner>
      )}
      {body}
    </>
  );
}
