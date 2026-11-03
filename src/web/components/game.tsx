// Oyun parçaları: geri sayım (sunucu saatine göre, BR9.6), faz çubuğu, oyuncu listesi ve tek
// seçimli hedef listesi. Taraf hiçbir yerde yalnızca renkle anlatılmaz (NFR9).
import { useEffect, useState } from 'preact/hooks';
import type { ViewGame, ViewSeat } from '../../shared/view.ts';
import { useGame } from '../context.ts';
import { t } from '../i18n.ts';
import { formatRemaining } from '../net/clock.ts';
import { SideLabel } from './ui.tsx';

export function Countdown({ game }: { game: ViewGame }) {
  const { clock } = useGame();
  const [, setTick] = useState(0);
  useEffect(() => {
    if (game.deadline === undefined || game.paused) return undefined;
    const timer = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(timer);
  }, [game.deadline, game.paused]);
  if (game.paused) {
    return (
      <span class="countdown" data-testid="countdown">
        {t('timer.paused')}
        {game.remainingMs !== undefined ? ` ${formatRemaining(game.remainingMs)}` : ''}
      </span>
    );
  }
  if (game.deadline === undefined) return null;
  const remaining = clock.remaining(game.deadline);
  return (
    <span
      class={`countdown${remaining <= 10_000 ? ' countdown--warning' : ''}`}
      role="timer"
      aria-label={t('timer.label')}
      data-testid="countdown"
    >
      {remaining > 0 ? formatRemaining(remaining) : t('timer.expired')}
    </span>
  );
}

export function PhaseBar({ game }: { game: ViewGame }) {
  const night = game.phase === 'first_night' || game.phase === 'night';
  return (
    <header class="phase-bar" data-testid="phase-bar">
      <h1 class="phase-bar__title">{t(`phase.${game.phase}`)}</h1>
      <span class="small">
        {night
          ? t('night.number', { n: game.nightNumber })
          : t('day.number', { n: game.dayNumber })}
      </span>
      <Countdown game={game} />
    </header>
  );
}

export function SeatList({
  seats,
  meSeatId,
  accusedSeatId,
}: {
  seats: ViewSeat[];
  meSeatId?: string;
  accusedSeatId?: string;
}) {
  return (
    <ul class="list" data-testid="seat-list">
      {seats.map((seat) => {
        const role = seat.revealedRoleId ?? seat.roleId;
        return (
          <li key={seat.seatId} data-testid={`seat-${seat.seatId}`}>
            <span class={seat.alive ? '' : 'badge--dead'}>{seat.nick}</span>
            {seat.seatId === meSeatId && <span class="badge">{t('seat.you')}</span>}
            <span class="badge">{seat.alive ? t('seat.alive') : t('seat.dead')}</span>
            {seat.seatId === accusedSeatId && (
              <span class="badge badge--warning">{t('seat.accused')}</span>
            )}
            {role && <SideLabel side={role === 'ghul' ? 'ghuls' : 'villagers'} />}
          </li>
        );
      })}
    </ul>
  );
}

export interface Choice {
  seatId: string;
  label: string;
  extra?: string;
}

/** Tek seçimli hedef listesi; seçili öğe aria-pressed ve ✓ işaretiyle gösterilir (renk tek başına değil). */
export function ChoiceList(props: {
  choices: Choice[];
  selected: string | null;
  onPick: (seatId: string) => void;
  ariaKey: string;
  testId: string;
}) {
  return (
    <ul class="choice-list" data-testid={props.testId}>
      {props.choices.map((choice) => (
        <li key={choice.seatId}>
          <button
            type="button"
            class="choice"
            aria-pressed={props.selected === choice.seatId}
            aria-label={t(props.ariaKey, { nick: choice.label })}
            data-testid={`${props.testId}-${choice.seatId}`}
            onClick={() => props.onPick(choice.seatId)}
          >
            <span>{choice.label}</span>
            {choice.extra && <span class="small">{choice.extra}</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
