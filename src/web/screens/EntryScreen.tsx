// M-02 Odaya giriş (ve oda kurarken nick): hata alanın altında Türkçe yazılır, yazılan metin
// korunur (BR1.3, AC1.2.2); KVKK bilgilendirmesi burada da görünür (BR1.5).
import { useState } from 'preact/hooks';
import { NICK_MAX } from '../../shared/domain.ts';
import { normalizeNickInput } from '../../shared/protocol.ts';
import { FieldError, PrivacyNotice } from '../components/ui.tsx';
import { t } from '../i18n.ts';

export interface EntryProps {
  mode: 'create' | 'join';
  roomCode?: string;
  busy: boolean;
  errorCode: string | null;
  onSubmit: (nick: string) => void;
  onBack: () => void;
}

export function EntryScreen(props: EntryProps) {
  const [nick, setNick] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const error = localError ?? props.errorCode;
  const errorKey = error === 'phase_closed' ? null : error;
  return (
    <main class="screen" data-testid="entry-screen">
      <div class="button-row">
        <button
          type="button"
          class="button button--secondary"
          data-testid="entry-back-button"
          onClick={props.onBack}
        >
          {t('entry.back')}
        </button>
        {props.roomCode && (
          <span class="small">{t('entry.roomLabel', { code: props.roomCode })}</span>
        )}
      </div>
      <h1>{props.mode === 'create' ? t('entry.createTitle') : t('entry.joinTitle')}</h1>
      <form
        class="panel"
        onSubmit={(event) => {
          event.preventDefault();
          const normalized = normalizeNickInput(nick);
          if (!normalized) return setLocalError('nick_invalid');
          setLocalError(null);
          props.onSubmit(normalized);
        }}
      >
        <div class="field">
          <label for="entry-nick">{t('entry.nickLabel')}</label>
          <input
            id="entry-nick"
            value={nick}
            maxLength={NICK_MAX + 8}
            autoComplete="nickname"
            aria-describedby="entry-nick-hint entry-nick-error"
            aria-invalid={error ? true : undefined}
            data-testid="entry-nick-input"
            onInput={(e) => setNick((e.target as HTMLInputElement).value)}
          />
          <span id="entry-nick-hint" class="hint">
            {t('entry.nickHint')}
          </span>
          <FieldError reasonCode={errorKey} id="entry-nick-error" />
          {error === 'phase_closed' && (
            <p class="field-error" role="alert">
              {t('entry.inGame')}
            </p>
          )}
        </div>
        <button
          type="submit"
          class="button button--block"
          disabled={props.busy}
          data-testid="entry-submit-button"
        >
          {props.mode === 'create' ? t('entry.submitCreate') : t('entry.submitJoin')}
        </button>
      </form>
      <PrivacyNotice />
    </main>
  );
}
