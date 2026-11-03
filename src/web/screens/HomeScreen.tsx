// M-01 Ana sayfa: tanıtım, "Oda Kur", kodla "Katıl", "Nasıl oynanır?" ve KVKK bilgilendirmesi
// (BR1.5, project.md Mandated). Oda kodu alanı yalnızca rakam kabul eder.
import { useState } from 'preact/hooks';
import { Logo, PrivacyNotice } from '../components/ui.tsx';
import { t } from '../i18n.ts';

export function HomeScreen({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: (code: string) => void;
}) {
  const [code, setCode] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const valid = /^[0-9]{6}$/.test(code);
  return (
    <main class="screen" data-testid="home-screen">
      <Logo />
      <h1>{t('home.heading')}</h1>
      <p>{t('app.tagline')}</p>
      <button
        type="button"
        class="button button--block"
        data-testid="home-create-button"
        onClick={onCreate}
      >
        {t('home.create')}
      </button>
      <form
        class="panel"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onJoin(code);
        }}
      >
        <h2>{t('home.joinTitle')}</h2>
        <div class="field">
          <label for="home-code">{t('home.codeLabel')}</label>
          <input
            id="home-code"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            autoComplete="off"
            value={code}
            aria-describedby="home-code-hint"
            data-testid="home-code-input"
            onInput={(e) =>
              setCode((e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 6))
            }
          />
          <span id="home-code-hint" class="hint">
            {t('home.codeInvalid')}
          </span>
        </div>
        <button
          type="submit"
          class="button button--block"
          disabled={!valid}
          data-testid="home-join-button"
        >
          {t('home.join')}
        </button>
      </form>
      <button
        type="button"
        class="button button--secondary button--block"
        aria-expanded={showHelp}
        data-testid="home-howto-button"
        onClick={() => setShowHelp(!showHelp)}
      >
        {t('home.howToPlay')}
      </button>
      {showHelp && (
        <p class="panel" data-testid="home-howto-text">
          {t('home.howToPlayText')}
        </p>
      )}
      <PrivacyNotice />
    </main>
  );
}
