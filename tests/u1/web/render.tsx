// Ekranı sahte bağlamla çizer; gönderilen komutlar kaydedilir.
import { render } from '@testing-library/preact';
import type { ComponentChildren } from 'preact';
import type { RecipientView } from '../../../src/shared/view.ts';
import { GameContext } from '../../../src/web/context.ts';
import type { AckResult } from '../../../src/web/net/connection.ts';
import { ServerClock } from '../../../src/web/net/clock.ts';
import { NOW } from './views.ts';

export function renderWith(
  view: RecipientView,
  ui: ComponentChildren,
  ack: AckResult = { status: 'accepted' },
) {
  const sent: { name: string; args: Record<string, unknown> }[] = [];
  const clock = new ServerClock(() => NOW);
  const result = render(
    <GameContext.Provider
      value={{
        view,
        clock,
        send: (name, args = {}) => {
          sent.push({ name, args });
          return Promise.resolve(ack);
        },
      }}
    >
      {ui}
    </GameContext.Provider>,
  );
  return { ...result, sent };
}
