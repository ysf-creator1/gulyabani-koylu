// Bot moderatör sürücüsü: moderatör görünümüne bakıp Faz Bitirme Tablosu'na göre ilerletir
// (kart görme bitince, gulyabani kararı kilitlenince, sabahta, gündüzde, herkes oy verince).
// Her adımda bir kez davranır; ilerletme komutları görünümdeki stepVersion'ı taşır (BR10.7).
import type { RecipientView } from '../../src/shared/view.ts';
import { C1Client, type ConnectOptions } from './c1Client.ts';

export interface DriverOptions extends ConnectOptions {
  appVersion: string;
  /** Her yeni adım görüldüğünde çağrılır (test denetimleri için). */
  onStep?: (view: RecipientView) => void | Promise<void>;
}

export class ModeratorDriver {
  client!: C1Client;
  token = '';
  steps = 0;
  readonly rejected = new Map<string, number>();
  private readonly options: DriverOptions;
  private readonly acted = new Set<string>();
  private busy = false;
  private chatSeen = 0;
  private ended: (view: RecipientView) => void = () => {};
  readonly finished: Promise<RecipientView>;

  constructor(options: DriverOptions) {
    this.options = options;
    this.finished = new Promise((resolve) => (this.ended = resolve));
  }

  async createRoom(nick: string): Promise<string> {
    this.client = await C1Client.connect(this.options);
    const welcome = await this.client.hello({ appVersion: this.options.appVersion });
    this.token = welcome.sessionToken ?? '';
    const ack = await this.client.command('room.create', { nick });
    if (ack.status !== 'accepted') throw new Error(`create failed: ${ack.reasonCode}`);
    const view = await this.client.waitForView((v) => v.room.roomCode.length === 6);
    return view.room.roomCode;
  }

  async start(players: number): Promise<void> {
    await this.client.waitForView((v) => v.room.participants.length === players + 1, 20_000);
    const ack = await this.client.command('lobby.startGame');
    if (ack.status !== 'accepted') throw new Error(`start failed: ${ack.reasonCode}`);
    this.client.ws.on('message', () => void this.drive());
    void this.drive();
  }

  private async send(name: string, args: Record<string, unknown> = {}): Promise<void> {
    const ack = await this.client.command(name, args);
    if (ack.status === 'rejected')
      this.rejected.set(
        ack.reasonCode ?? 'unknown',
        (this.rejected.get(ack.reasonCode ?? 'unknown') ?? 0) + 1,
      );
  }

  /** Görünüme göre yapılacak ilerletme; henüz koşul yoksa null. */
  private decide(view: RecipientView): { name: string; args: Record<string, unknown> } | null {
    const game = view.game;
    const mod = view.moderator;
    if (!game || !mod || game.paused) return null;
    const step = { stepVersion: mod.stepVersion };
    const alive = mod.allSeats.filter((s) => s.alive);
    switch (game.phase) {
      case 'first_night':
      case 'night':
        if (mod.stepCursor === 'card_reveal')
          return mod.allSeats.every((s) => s.cardSeen)
            ? { name: 'game.nextStep', args: step }
            : null;
        if (mod.stepCursor === 'ghul_meet') return { name: 'game.nextStep', args: step };
        return mod.stepStatus === 'done' || mod.stepStatus === 'timed_out'
          ? { name: 'game.nextStep', args: step }
          : null;
      case 'morning':
        return { name: 'game.revealResult', args: step };
      case 'day': {
        // Gündüz en az bir sohbet mesajı gelince (ya da süre dolunca) oylamaya geçilir.
        const messages = view.chat.channels.find((c) => c.channel === 'day')?.messages.length ?? 0;
        const reminded = mod.notices.some((n) => n.textKey === 'notice.day.move_to_vote_reminder');
        if (messages <= this.chatSeen && !reminded) return null;
        this.chatSeen = messages;
        return { name: 'game.moveToVote', args: step };
      }
      case 'voting':
        return (game.votes?.length ?? 0) >= alive.length
          ? { name: 'game.nextStep', args: step }
          : null;
      default:
        return null;
    }
  }

  private async drive(): Promise<void> {
    const view = this.client.latestView;
    if (!view || this.busy) return;
    if (view.game?.phase === 'ended') return this.ended(view);
    const key = `${view.moderator?.stepVersion}`;
    const next = this.decide(view);
    if (!next || this.acted.has(key)) return;
    this.acted.add(key);
    this.busy = true;
    try {
      this.steps += 1;
      await this.options.onStep?.(view);
      await this.send(next.name, next.args);
    } finally {
      this.busy = false;
    }
    void this.drive();
  }
}
