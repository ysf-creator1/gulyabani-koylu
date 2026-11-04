// Oyuncu ekranları (M-05…M-10, M-13): kart görme, Uyku, gulyabani paneli, sabah, gündüz,
// oylama, son söz, onay oylaması ve oyun sonu. Gece sırası gelmeyen herkes birebir aynı Uyku
// ekranını görür; gece sırası ekran okuyucuya duyurulmaz (BR4.7).
import { useState } from 'preact/hooks';
import type { NightLogEntry, ViewGame } from '../../shared/view.ts';
import { ChatPanel } from '../components/ChatPanel.tsx';
import { ChoiceList, PhaseBar, SeatList } from '../components/game.tsx';
import { RoleCard } from '../components/RoleCard.tsx';
import { ConfirmDialog, FieldError, StatusBanner } from '../components/ui.tsx';
import { nickOf, useGame } from '../context.ts';
import { t } from '../i18n.ts';

function useCommand() {
  const { send } = useGame();
  const [error, setError] = useState<string | null>(null);
  const run = async (name: string, args: Record<string, unknown> = {}) => {
    const ack = await send(name, args);
    setError(ack.status === 'rejected' ? (ack.reasonCode ?? 'internal_error') : null);
  };
  return { error, run };
}

function CardStep() {
  const { view } = useGame();
  const { error, run } = useCommand();
  const [seen, setSeen] = useState(false);
  return (
    <section data-testid="card-screen">
      <h2>{t('card.title')}</h2>
      {view.me.roleId && <RoleCard roleId={view.me.roleId} />}
      {seen ? (
        <StatusBanner tone="success" testId="card-seen-done">
          {t('card.seenDone')}
        </StatusBanner>
      ) : (
        <button
          type="button"
          class="button button--block"
          data-testid="card-seen-button"
          onClick={() => {
            setSeen(true);
            void run('game.cardSeen');
          }}
        >
          {t('card.seen')}
        </button>
      )}
      <FieldError reasonCode={error} id="card-error" />
    </section>
  );
}

/** Uyku ekranı: içeriği herkes için aynıdır, oyuncuya özel hiçbir şey göstermez. */
export function SleepScreen() {
  return (
    <section class="sleep" data-testid="sleep-screen">
      <h2>{t('sleep.title')}</h2>
      <p>{t('sleep.text')}</p>
    </section>
  );
}

function GhulMeet({ game }: { game: ViewGame }) {
  const mates = game.seats.filter((s) => s.roleId === 'ghul');
  return (
    <section data-testid="ghul-meet-screen">
      <h2>{t('ghul.meetTitle')}</h2>
      <p>{t('ghul.meetText')}</p>
      <SeatList seats={mates} />
      <ChatPanel channel="ghul" />
    </section>
  );
}

function GhulKill({ game }: { game: ViewGame }) {
  const { view } = useGame();
  const { error, run } = useCommand();
  const me = view.me.seatId as string;
  const marks = new Map((game.ghulMarks ?? []).map((m) => [m.bySeatId, m.targetSeatId]));
  const ghulIds = [
    me,
    ...game.seats.filter((s) => s.roleId === 'ghul' && s.alive).map((s) => s.seatId),
  ];
  const myMark = marks.get(me) ?? null;
  const unanimous = myMark !== null && ghulIds.every((id) => marks.get(id) === myMark);
  const targets = game.myAction?.targets ?? [];
  return (
    <section data-testid="ghul-kill-screen">
      <PhaseBar game={game} />
      <h2>{t('ghul.killTitle')}</h2>
      {game.ghulDecided ? (
        <StatusBanner tone="success" testId="ghul-decided">
          {t('ghul.decided')}
        </StatusBanner>
      ) : (
        <>
          <h3>{t('ghul.targets')}</h3>
          <ChoiceList
            testId="ghul-targets"
            ariaKey="ghul.select"
            selected={myMark}
            choices={targets.map((seatId) => ({ seatId, label: nickOf(view, seatId) }))}
            onPick={(seatId) => void run('game.ghulMark', { targetSeatId: seatId })}
          />
          <h3>{t('ghul.marks')}</h3>
          <ul class="list" data-testid="ghul-marks">
            {marks.size === 0 && <li class="muted">{t('ghul.noMarks')}</li>}
            {[...marks].map(([by, target]) => (
              <li key={by}>
                {t('ghul.markLine', { by: nickOf(view, by), target: nickOf(view, target) })}
              </li>
            ))}
          </ul>
          <button
            type="button"
            class="button button--block"
            disabled={!unanimous}
            aria-describedby="ghul-confirm-hint"
            data-testid="ghul-confirm-button"
            onClick={() => void run('game.ghulConfirm')}
          >
            {t('ghul.confirm')}
          </button>
          <p id="ghul-confirm-hint" class="hint">
            {t('ghul.confirmHint')}
          </p>
        </>
      )}
      <FieldError reasonCode={error} id="ghul-error" />
      <ChatPanel channel="ghul" />
    </section>
  );
}

function NightScreen({ game }: { game: ViewGame }) {
  const kind = game.myAction?.kind;
  if (kind === 'see_card') return <CardStep />;
  if (kind === 'ghul_meet') return <GhulMeet game={game} />;
  if (kind === 'ghul_mark' || (game.ghulMarks && game.ghulDecided !== undefined))
    return <GhulKill game={game} />;
  return <SleepScreen />;
}

function VotePanel({ game }: { game: ViewGame }) {
  const { view } = useGame();
  const { error, run } = useCommand();
  const [picked, setPicked] = useState<string | null>(null);
  const me = view.me.seatId;
  const myVote = game.votes?.find((v) => v.voterSeatId === me)?.targetSeatId ?? picked;
  const counts = new Map<string, number>();
  for (const vote of game.votes ?? [])
    if (vote.targetSeatId) counts.set(vote.targetSeatId, (counts.get(vote.targetSeatId) ?? 0) + 1);
  const targets = game.myAction?.kind === 'vote' ? game.myAction.targets : [];
  return (
    <section data-testid="vote-panel">
      <h2>{game.phase === 'confirm_vote' ? t('confirm.title') : t('vote.title')}</h2>
      <p>
        {game.phase === 'confirm_vote'
          ? t('confirm.text')
          : game.voteRound === 'revote'
            ? t('vote.revotePrompt')
            : t('vote.prompt')}
      </p>
      {targets.length > 0 ? (
        <ChoiceList
          testId="vote-targets"
          ariaKey="vote.select"
          selected={myVote}
          choices={targets.map((seatId) => ({
            seatId,
            label: nickOf(view, seatId),
            extra: counts.has(seatId)
              ? t('vote.count', { count: counts.get(seatId) ?? 0 })
              : undefined,
          }))}
          onPick={(seatId) => {
            setPicked(seatId);
            void run('game.vote', { targetSeatId: seatId });
          }}
        />
      ) : (
        <p class="muted">{t('vote.cannot')}</p>
      )}
      <p class="small">
        {myVote ? t('vote.myVote', { nick: nickOf(view, myVote) }) : t('vote.noVote')}
      </p>
      {game.phase === 'voting' && <p class="small muted">{t('vote.waitClose')}</p>}
      <FieldError reasonCode={error} id="vote-error" />
    </section>
  );
}

/** Kim kime oy verdi: oylar canlı görünürken herkese açıktır (FR9.1, sahip geri bildirimi). */
function VoteDetail({ game }: { game: ViewGame }) {
  const { view } = useGame();
  const votes = game.votes ?? [];
  return (
    <section class="panel" data-testid="vote-detail">
      <h2>{t('vote.tallyTitle')}</h2>
      <ul class="list">
        {votes.length === 0 && <li class="muted">{t('vote.none')}</li>}
        {votes.map((v) => (
          <li key={v.voterSeatId}>
            {v.targetSeatId
              ? t('vote.line', {
                  voter: nickOf(view, v.voterSeatId),
                  target: nickOf(view, v.targetSeatId),
                })
              : t('vote.lineAbstain', { voter: nickOf(view, v.voterSeatId) })}
          </li>
        ))}
      </ul>
    </section>
  );
}

function logText(entry: NightLogEntry, nick: string): string {
  return t(entry.textKey, { n: entry.nightNumber, nick });
}

export function NightLog({ entries }: { entries: NightLogEntry[] }) {
  const { view } = useGame();
  return (
    <ul class="list" data-testid="night-log">
      {entries.length === 0 && <li class="muted">{t('log.empty')}</li>}
      {entries.map((entry, index) => (
        <li key={`${entry.textKey}-${index}`}>{logText(entry, nickOf(view, entry.seatId))}</li>
      ))}
    </ul>
  );
}

/** Oyun sonunda moderatörü beklemeden odadan çıkma; onay ister (sahip geri bildirimi). */
function LeaveRoom() {
  const { send } = useGame();
  const [asking, setAsking] = useState(false);
  return (
    <div class="leave-row">
      {asking ? (
        <ConfirmDialog
          question={t('end.leaveConfirm')}
          yes={t('end.leaveYes')}
          no={t('end.leaveNo')}
          onYes={() => {
            setAsking(false);
            void send('room.leave', {});
          }}
          onNo={() => setAsking(false)}
        />
      ) : (
        <button
          type="button"
          class="button button--secondary"
          data-testid="leave-room"
          onClick={() => setAsking(true)}
        >
          {t('end.leave')}
        </button>
      )}
    </div>
  );
}

function EndScreen({ game }: { game: ViewGame }) {
  const villagersWon = game.winners?.sides.includes('villagers');
  return (
    <section data-testid="end-screen">
      <h2 data-testid="end-winner">{villagersWon ? t('end.villagers') : t('end.ghuls')}</h2>
      <h3>{t('end.roles')}</h3>
      <SeatList seats={game.seats} />
      <h3>{t('end.nightLog')}</h3>
      <NightLog entries={game.nightLog ?? []} />
      <p class="muted">{t('end.waitNewGame')}</p>
      <LeaveRoom />
    </section>
  );
}

function DayContent({ game }: { game: ViewGame }) {
  const { view } = useGame();
  const dead = game.morningResult?.deadSeatIds ?? [];
  return (
    <>
      {game.phase === 'day' && (
        <section class="panel" data-testid="day-screen">
          <h2>{t('day.title')}</h2>
          <p data-testid="morning-result">
            {dead.length > 0
              ? t('morning.died', { nick: nickOf(view, dead[0]) })
              : t('morning.nobody')}
          </p>
          <p class="small muted">{t('day.hint')}</p>
        </section>
      )}
      {game.phase === 'last_words' && (
        <section class="panel" data-testid="last-words-screen">
          <h2>{t('lastWords.title')}</h2>
          <p>{t('lastWords.accused', { nick: nickOf(view, game.accusedSeatId) })}</p>
          <p class="small">{t('lastWords.text')}</p>
        </section>
      )}
      {(game.phase === 'voting' || game.phase === 'confirm_vote') && <VotePanel game={game} />}
      {game.votes && <VoteDetail game={game} />}
      <ChatPanel channel="day" />
      <section class="panel">
        <h2>{t('lobby.participants')}</h2>
        <SeatList seats={game.seats} meSeatId={view.me.seatId} accusedSeatId={game.accusedSeatId} />
      </section>
    </>
  );
}

export function PlayerGame() {
  const { view } = useGame();
  const game = view.game as ViewGame;
  const night = game.phase === 'first_night' || game.phase === 'night';
  return (
    <main class="screen" data-testid="player-game">
      {game.paused && (
        <StatusBanner testId="paused-banner">
          {game.pauseReason === 'moderator_lost' ? t('conn.moderatorLost') : t('conn.paused')}
        </StatusBanner>
      )}
      {!night && <PhaseBar game={game} />}
      {night && <NightScreen game={game} />}
      {game.phase === 'morning' && (
        <section class="panel" data-testid="morning-screen">
          <h2>{t('morning.title')}</h2>
          <p>{t('morning.waiting')}</p>
        </section>
      )}
      {['day', 'voting', 'last_words', 'confirm_vote'].includes(game.phase) && (
        <DayContent game={game} />
      )}
      {game.phase === 'ended' && <EndScreen game={game} />}
      {view.me.alive === false && game.phase !== 'ended' && (
        <p class="small muted">{t('vote.cannot')}</p>
      )}
    </main>
  );
}
