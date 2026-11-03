// RoleCard: kart kapalı gelir, dokununca açılır, tekrar dokununca kapanır (BR3.3, US2.2).
// Kart açıkken taraf etiketi simge ve yazıyla gösterilir; metin kart yüzeyindedir.
import { useState } from 'preact/hooks';
import type { RoleId } from '../../shared/domain.ts';
import { t } from '../i18n.ts';
import { SideLabel } from './ui.tsx';

export function RoleCard({ roleId }: { roleId: RoleId }) {
  const [open, setOpen] = useState(false);
  const side = roleId === 'ghul' ? 'ghuls' : 'villagers';
  return (
    <button
      type="button"
      class={`role-card${open ? ` role-card--${side}` : ''}`}
      aria-pressed={open}
      data-testid="role-card"
      onClick={() => setOpen(!open)}
    >
      {open ? (
        <>
          <span class="role-card__name">{t(`role.${roleId}.name`)}</span>
          <SideLabel side={side} />
          <span class="role-card__text">{t(`role.${roleId}.ability`)}</span>
          <span class="role-card__text small">
            <em>{t(`role.${roleId}.flavor`)}</em>
          </span>
          <span class="role-card__text small">{t('card.hide')}</span>
        </>
      ) : (
        <>
          <span class="role-card__name">{t('card.back')}</span>
          <span>{t('card.reveal')}</span>
        </>
      )}
    </button>
  );
}
