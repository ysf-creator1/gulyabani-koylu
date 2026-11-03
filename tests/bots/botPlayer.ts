// BotPlayer: gerçek C1 bağlantısıyla oynayan bot. Belirli bir politika izler: kartını görür,
// gulyabaniyse en küçük numaralı hedefi işaretleyip onaylar, oylamada kendisi dışındaki en küçük
// numaralı yaşayana oy verir (böylece oylama hep tek sanıkla kapanır ve oyun biter).
import type { RecipientView } from '../../src/shared/view.ts';
import { C1Client, type ConnectOptions } from './c1Client.ts';

export interface BotOptions extends ConnectOptions {
  nick: string;
  appVersion: string;
  chatText?: string;
}

export class BotPlayer {
  client!: C1Client;
  token = '';
  readonly nick: string;
  readonly rejected = new Map<string, number>();
  private readonly options: BotOptions;
  private readonly done = new Set<string>();
  private acting = false;

  constructor(options: BotOptions) {
    this.options = options;
    this.nick = options.nick;
  }

  async connect(): Promise<void> {
    this.client = await C1Client.connect(this.options);
    const welcome = await this.client.hello({
      appVersion: this.options.appVersion,
      ...(this.token ? { sessionToken: this.token } : {}),
    });
    if (welcome.sessionToken) this.token = welcome.sessionToken;
    this.client.ws.on('message', () => void this.react());
  }

  /** Bağlantıyı koparıp aynı belirteçle geri gelir (A10). */
  async reconnect(): Promise<RecipientView> {
    this.client.terminate();
    await this.client.closed;
    await this.connect();
    return this.client.waitForView((v) => v.game !== undefined);
  }

  async join(roomCode: string): Promise<void> {
    const ack = await this.command('room.join', { roomCode, nick: this.nick });
    if (ack !== 'accepted') throw new Error(`join failed: ${ack}`);
  }

  get view(): RecipientView | null {
    return this.client.latestView;
  }

  async command(name: string, args: Record<string, unknown> = {}): Promise<string> {
    const ack = await this.client.command(name, args);
    if (ack.status === 'rejected')
      this.rejected.set(
        ack.reasonCode ?? 'unknown',
        (this.rejected.get(ack.reasonCode ?? 'unknown') ?? 0) + 1,
      );
    return ack.status === 'rejected' ? (ack.reasonCode ?? 'rejected') : ack.status;
  }

  /** Görünüm her değiştiğinde politikaya göre bir kez davranır. */
  private async react(): Promise<void> {
    const view = this.view;
    const game = view?.game;
    if (!view || !game || this.acting || game.paused) return;
    const action = game.myAction;
    const key = `${game.phase}:${game.nightNumber}:${game.dayNumber}:${action?.kind ?? ''}:${game.voteRound ?? ''}:${game.accusedSeatId ?? ''}`;
    this.acting = true;
    try {
      if (action?.kind === 'see_card' && !this.done.has(key)) {
        this.done.add(key);
        await this.command('game.cardSeen');
      } else if (action?.kind === 'ghul_mark' && !game.ghulDecided) {
        const target = [...action.targets].sort()[0] as string;
        const mine = game.ghulMarks?.find((m) => m.bySeatId === view.me.seatId)?.targetSeatId;
        if (mine !== target) await this.command('game.ghulMark', { targetSeatId: target });
        else if (
          game.ghulMarks?.every((m) => m.targetSeatId === target) &&
          !this.done.has(`${key}:confirm`)
        ) {
          const mates = game.seats.filter((s) => s.roleId === 'ghul' && s.alive).length + 1;
          if ((game.ghulMarks?.length ?? 0) >= mates) {
            this.done.add(`${key}:confirm`);
            await this.command('game.ghulConfirm');
          }
        }
      } else if (action?.kind === 'vote' && !this.done.has(key)) {
        this.done.add(key);
        const target = [...action.targets].sort(
          (a, b) => Number(a.slice(1)) - Number(b.slice(1)),
        )[0];
        if (target) await this.command('game.vote', { targetSeatId: target });
      } else if (
        game.phase === 'day' &&
        this.options.chatText &&
        view.me.alive &&
        !this.done.has(key)
      ) {
        this.done.add(key);
        await this.command('chat.send', { channel: 'day', text: this.options.chatText });
      }
    } finally {
      this.acting = false;
    }
    if (this.view !== view) void this.react();
  }

  close(): Promise<number> {
    return this.client.close();
  }
}
