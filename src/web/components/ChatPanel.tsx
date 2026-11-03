// ChatPanel: mesaj listesi ve yazma alanı. Metin her zaman metin düğümü olarak eklenir (Preact
// kaçışlar; HTML ekleme yasak, NFR7.9). Yeni mesajlar kibar duyuruyla okunur (role="log").
import { useState } from 'preact/hooks';
import type { ChatChannel } from '../../shared/domain.ts';
import { CHAT_MAX } from '../../shared/domain.ts';
import { useGame } from '../context.ts';
import { t } from '../i18n.ts';
import { FieldError } from './ui.tsx';

export function ChatPanel({ channel, titleKey }: { channel: ChatChannel; titleKey?: string }) {
  const { view, send } = useGame();
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const data = view.chat.channels.find((c) => c.channel === channel);
  if (!data) return null;
  const headingId = `chat-${channel}-title`;
  const submit = async (event: Event) => {
    event.preventDefault();
    if (!text.trim()) return;
    const ack = await send('chat.send', { channel, text });
    if (ack.status === 'rejected') setError(ack.reasonCode ?? 'internal_error');
    else {
      setError(null);
      setText('');
    }
  };
  return (
    <section class="panel chat" aria-labelledby={headingId} data-testid={`chat-${channel}`}>
      <h2 id={headingId}>{t(titleKey ?? `chat.${channel}`)}</h2>
      <div role="log" aria-live="polite" aria-labelledby={headingId}>
        <ul class="chat__log" data-testid={`chat-${channel}-log`}>
          {data.messages.length === 0 && <li class="muted">{t('chat.empty')}</li>}
          {data.messages.map((m) => (
            <li key={m.messageId}>
              <span class="chat__author">{m.authorNick}</span>
              <span>{m.text}</span>
            </li>
          ))}
        </ul>
      </div>
      {data.canWrite ? (
        <form class="chat__form" onSubmit={submit}>
          <label class="visually-hidden" for={`chat-${channel}-input`}>
            {t('chat.inputLabel')}
          </label>
          <input
            id={`chat-${channel}-input`}
            maxLength={CHAT_MAX}
            value={text}
            placeholder={t('chat.placeholder')}
            aria-describedby={error ? `chat-${channel}-error` : undefined}
            data-testid={`chat-${channel}-input`}
            onInput={(e) => setText((e.target as HTMLInputElement).value)}
          />
          <button type="submit" class="button" data-testid={`chat-${channel}-send`}>
            {t('chat.send')}
          </button>
        </form>
      ) : (
        <p class="small muted">{t('chat.readOnly')}</p>
      )}
      <FieldError reasonCode={error} id={`chat-${channel}-error`} />
    </section>
  );
}
