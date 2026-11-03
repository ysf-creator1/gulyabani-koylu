// Genel parçalar: logo, taraf etiketi (renk + simge + yazı), durum şeridi, KVKK bilgilendirmesi,
// tam ekran mesaj ve onay sorusu. Bütün metinler t() ile tr.json'dan gelir.
import type { ComponentChildren } from 'preact';
import type { Side } from '../../shared/domain.ts';
import { t } from '../i18n.ts';

export function Logo() {
  return (
    <svg class="logo" viewBox="0 0 360 64" role="img" aria-labelledby="logo-title">
      <title id="logo-title">{t('app.logoAlt')}</title>
      <path
        d="M8 52 Q60 8 112 52 T216 52 T352 52"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
      />
      <circle cx="300" cy="18" r="10" fill="none" stroke="currentColor" stroke-width="3" />
      <text
        x="180"
        y="44"
        text-anchor="middle"
        font-size="26"
        font-weight="700"
        fill="currentColor"
      >
        {t('app.title')}
      </text>
    </svg>
  );
}

const ICONS: Record<Side, string> = {
  // Üç pençe izi (Gulyabaniler) ve gaz lambası (Köylüler): biçimleri renk körlüğünde de ayrılır.
  ghuls: 'M4 3l3 14-2 1L2 4zm6-1l2 15h-2L8 2zm6 1l-1 15-2-1 2-14z',
  villagers: 'M9 1h2v3h3l-1 2h-6l-1-2h3zM6 7h8l1 8-2 4H7l-2-4z',
};

export function SideLabel({ side }: { side: Side }) {
  return (
    <span class={`side side--${side}`}>
      <svg viewBox="0 0 20 20" role="img" aria-label={t(`side.iconLabel.${side}`)}>
        <path d={ICONS[side]} />
      </svg>
      <span>{t(`side.${side}`)}</span>
    </span>
  );
}

export function StatusBanner({
  children,
  tone = 'warning',
  testId,
}: {
  children: ComponentChildren;
  tone?: 'warning' | 'success';
  testId: string;
}) {
  return (
    <div
      class={`status-banner${tone === 'success' ? ' status-banner--success' : ''}`}
      role="status"
      data-testid={testId}
    >
      {children}
    </div>
  );
}

export function PrivacyNotice() {
  return (
    <section class="privacy panel" aria-labelledby="privacy-title" data-testid="privacy-notice">
      <h2 id="privacy-title" class="small">
        {t('privacy.title')}
      </h2>
      <p>{t('privacy.short')}</p>
      <details>
        <summary data-testid="privacy-more">{t('privacy.more')}</summary>
        <p>{t('privacy.long')}</p>
      </details>
    </section>
  );
}

export function MessageScreen({ textKey, onHome }: { textKey: string; onHome: () => void }) {
  return (
    <main class="screen" data-testid="message-screen">
      <h1>{t('error.title')}</h1>
      <p class="panel" role="alert">
        {t(textKey)}
      </p>
      <button
        type="button"
        class="button button--block"
        data-testid="message-home-button"
        onClick={onHome}
      >
        {t('msg.home')}
      </button>
    </main>
  );
}

export function ConfirmDialog(props: {
  question: string;
  yes: string;
  no: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div
      class="dialog"
      role="alertdialog"
      aria-modal="false"
      aria-labelledby="confirm-question"
      data-testid="confirm-dialog"
    >
      <p id="confirm-question">{props.question}</p>
      <div class="button-row">
        <button
          type="button"
          class="button button--danger"
          data-testid="confirm-yes"
          onClick={props.onYes}
        >
          {props.yes}
        </button>
        <button
          type="button"
          class="button button--secondary"
          data-testid="confirm-no"
          onClick={props.onNo}
        >
          {props.no}
        </button>
      </div>
    </div>
  );
}

export function FieldError({ reasonCode, id }: { reasonCode: string | null; id: string }) {
  if (!reasonCode) return null;
  return (
    <p class="field-error" id={id} role="alert">
      {t(`error.${reasonCode}`)}
    </p>
  );
}
