// Ekranların paylaştığı bağlam: son görünüm, komut gönderme ve sunucu saati.
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import type { RecipientView } from '../shared/view.ts';
import type { ServerClock } from './net/clock.ts';
import type { AckResult } from './net/connection.ts';

export type SendCommand = (name: string, args?: Record<string, unknown>) => Promise<AckResult>;

export interface GameContextValue {
  view: RecipientView;
  send: SendCommand;
  clock: ServerClock;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('GameContext missing');
  return value;
}

/** Koltuk numarasından nick (görünümde olmayan koltuk için boş). */
export function nickOf(view: RecipientView, seatId: string | null | undefined): string {
  return view.game?.seats.find((s) => s.seatId === seatId)?.nick ?? '';
}
