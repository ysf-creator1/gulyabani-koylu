// @vitest-environment happy-dom
// Oyuncu ekranları: her ekran doğru görünümle çizilir, düğmeler doğru komutu gönderir, gece
// sırası gelmeyenlerin ekranı birebir aynıdır (BR4.7), metinler tr.json'dan gelir.
import { act, cleanup, fireEvent, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { HomeScreen } from '../../../src/web/screens/HomeScreen.tsx';
import { LobbyScreen } from '../../../src/web/screens/LobbyScreen.tsx';
import { PlayerGame } from '../../../src/web/screens/PlayerGame.tsx';
import { renderWith } from './render.tsx';
import { NOW, gameView, lobbyView } from './views.ts';
import { render } from '@testing-library/preact';

afterEach(() => cleanup());

describe('ana sayfa (BR1.5)', () => {
  it('6 haneden kısa kodda Katıl pasiftir; geçerli kodla katılır', () => {
    const joined: string[] = [];
    render(<HomeScreen onCreate={() => {}} onJoin={(code) => joined.push(code)} />);
    const join = screen.getByTestId('home-join-button') as HTMLButtonElement;
    expect(join.disabled).toBe(true);
    fireEvent.input(screen.getByTestId('home-code-input'), { target: { value: '12a34' } });
    expect((screen.getByTestId('home-code-input') as HTMLInputElement).value).toBe('1234');
    fireEvent.input(screen.getByTestId('home-code-input'), { target: { value: '123456' } });
    fireEvent.click(screen.getByTestId('home-join-button'));
    expect(joined).toEqual(['123456']);
    fireEvent.click(screen.getByTestId('home-howto-button'));
    expect(screen.getByTestId('home-howto-text')).toBeTruthy();
  });
});

describe('lobi (BR2.1, BR2.3, BR2.4)', () => {
  it('oyuncu kodu, linki, açık rolleri görür; başlatma düğmesi yoktur', () => {
    renderWith(lobbyView(), <LobbyScreen />);
    expect(screen.getByTestId('lobby-room-code').textContent).toBe('123456');
    expect(screen.getByTestId('lobby-player-list').textContent).toContain('Bot2');
    expect(screen.getByTestId('lobby-player-list').textContent).not.toContain('Moderator');
    expect(screen.queryByTestId('lobby-start-button')).toBeNull();
    expect(screen.getAllByRole('img').map((i) => i.getAttribute('aria-label'))).toContain(
      'Gulyabaniler simgesi: üç pençe izi',
    );
  });

  it('moderatör 3 oyuncudan azken başlatamaz; yeterliyse uyarıyla başlatır', () => {
    const blocked = lobbyView({
      me: { participantId: 'pm', nick: 'Moderator', kind: 'moderator' },
      room: { ...lobbyView().room, startBlock: { reasonCode: 'too_few_players', warnings: [] } },
    });
    renderWith(blocked, <LobbyScreen />);
    expect((screen.getByTestId('lobby-start-button') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('En az 3 oyuncu gerekli.')).toBeTruthy();
    cleanup();
    const ready = lobbyView({
      me: { participantId: 'pm', nick: 'Moderator', kind: 'moderator' },
      room: { ...lobbyView().room, startBlock: { warnings: ['few_players'] } },
    });
    const { sent } = renderWith(ready, <LobbyScreen />);
    expect(screen.getByTestId('lobby-few-warning').textContent).toContain('6 ve üstü');
    fireEvent.click(screen.getByTestId('lobby-start-button'));
    expect(sent).toEqual([{ name: 'lobby.startGame', args: {} }]);
  });

  it('moderatör onay sorusundan sonra oyuncuyu çıkarır', () => {
    const view = lobbyView({ me: { participantId: 'pm', nick: 'Moderator', kind: 'moderator' } });
    const { sent } = renderWith(view, <LobbyScreen />);
    fireEvent.click(screen.getByTestId('lobby-kick-p2'));
    expect(screen.getByTestId('confirm-dialog').textContent).toContain(
      'Bot2 odadan çıkarılsın mı?',
    );
    fireEvent.click(screen.getByTestId('confirm-no'));
    expect(sent).toEqual([]);
    fireEvent.click(screen.getByTestId('lobby-kick-p2'));
    fireEvent.click(screen.getByTestId('confirm-yes'));
    expect(sent).toEqual([{ name: 'lobby.kick', args: { participantId: 'p2' } }]);
  });
});

describe('kart görme (BR3.3)', () => {
  it('kart kapalı gelir, dokununca açılır, tekrar dokununca kapanır; Gördüm komut gönderir', async () => {
    const view = gameView({ myAction: { kind: 'see_card', targets: [] } }, { roleId: 'ghul' });
    const { sent } = renderWith(view, <PlayerGame />);
    const card = screen.getByTestId('role-card');
    expect(card.getAttribute('aria-pressed')).toBe('false');
    expect(card.textContent).not.toContain('Gulyabani');
    fireEvent.click(card);
    expect(card.textContent).toContain('Gulyabani');
    fireEvent.click(card);
    expect(card.textContent).not.toContain('Gulyabani');
    await act(async () => {
      fireEvent.click(screen.getByTestId('card-seen-button'));
    });
    expect(sent).toEqual([{ name: 'game.cardSeen', args: {} }]);
    expect(screen.getByTestId('card-seen-done')).toBeTruthy();
  });
});

describe('gece (BR4.4, BR4.5, BR4.7)', () => {
  it('sırası gelmeyen herkes aynı Uyku ekranını görür', () => {
    const a = renderWith(
      gameView(
        { phase: 'night', nightNumber: 2, deadline: NOW + 90_000 },
        { seatId: 's2', nick: 'Bot2' },
      ),
      <PlayerGame />,
    );
    const first = a.container.innerHTML;
    cleanup();
    const b = renderWith(
      gameView(
        { phase: 'night', nightNumber: 2, deadline: NOW + 90_000 },
        { seatId: 's3', nick: 'Bot3', alive: false },
      ),
      <PlayerGame />,
    );
    const second = b.container.innerHTML.replace(/<p class="small muted">.*?<\/p>/, '');
    expect(screen.getByTestId('sleep-screen')).toBeTruthy();
    expect(second).toBe(first);
  });

  it('gulyabani hedef seçer; hepsi aynı hedefteyken Kararı Onayla etkinleşir', async () => {
    const base = {
      phase: 'night' as const,
      nightNumber: 2,
      deadline: NOW + 60_000,
      seats: [
        { seatId: 's1', nick: 'Bot1', alive: true },
        { seatId: 's2', nick: 'Bot2', alive: true, roleId: 'ghul' as const },
        { seatId: 's3', nick: 'Bot3', alive: true },
        { seatId: 's4', nick: 'Bot4', alive: true },
      ],
      myAction: { kind: 'ghul_mark' as const, targets: ['s3', 's4'], deadline: NOW + 60_000 },
      ghulDecided: false,
    };
    const split = gameView(
      {
        ...base,
        ghulMarks: [
          { bySeatId: 's1', targetSeatId: 's3' },
          { bySeatId: 's2', targetSeatId: 's4' },
        ],
      },
      { roleId: 'ghul' },
    );
    const { sent } = renderWith(split, <PlayerGame />);
    expect((screen.getByTestId('ghul-confirm-button') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId('ghul-marks').textContent).toContain('Bot2 → Bot4');
    await act(async () => {
      fireEvent.click(screen.getByTestId('ghul-targets-s4'));
    });
    expect(sent).toEqual([{ name: 'game.ghulMark', args: { targetSeatId: 's4' } }]);
    cleanup();
    const same = gameView(
      {
        ...base,
        ghulMarks: [
          { bySeatId: 's1', targetSeatId: 's3' },
          { bySeatId: 's2', targetSeatId: 's3' },
        ],
      },
      { roleId: 'ghul' },
    );
    const confirm = renderWith(same, <PlayerGame />);
    expect(screen.getByTestId('ghul-targets-s3').getAttribute('aria-pressed')).toBe('true');
    await act(async () => {
      fireEvent.click(screen.getByTestId('ghul-confirm-button'));
    });
    expect(confirm.sent).toEqual([{ name: 'game.ghulConfirm', args: {} }]);
  });

  it('tanışma adımında gulyabani yoldaşlarını görür', () => {
    const view = gameView(
      {
        myAction: { kind: 'ghul_meet', targets: [] },
        seats: [
          { seatId: 's1', nick: 'Bot1', alive: true },
          { seatId: 's3', nick: 'Bot3', alive: true, roleId: 'ghul' },
        ],
      },
      { roleId: 'ghul' },
      { chat: { channels: [{ channel: 'ghul', canWrite: true, messages: [] }] } },
    );
    renderWith(view, <PlayerGame />);
    expect(screen.getByTestId('ghul-meet-screen').textContent).toContain('Bot3');
    expect(screen.getByTestId('chat-ghul-input')).toBeTruthy();
  });
});

describe('gündüz, oylama ve son söz (BR6.1–BR6.8)', () => {
  it('gündüz geri sayım, sabah sonucu ve sohbet görünür; mesaj gönderilir', async () => {
    const view = gameView(
      {
        phase: 'day',
        dayNumber: 1,
        deadline: NOW + 240_000,
        morningResult: { deadSeatIds: ['s4'] },
      },
      {},
      {
        chat: {
          channels: [
            {
              channel: 'day',
              canWrite: true,
              messages: [
                {
                  messageId: 'm1',
                  authorNick: 'Bot2',
                  text: '<script>alert(1)</script>',
                  sentAt: NOW,
                },
              ],
            },
          ],
        },
      },
    );
    const { sent } = renderWith(view, <PlayerGame />);
    expect(screen.getByTestId('countdown').textContent).toBe('4:00');
    expect(screen.getByTestId('morning-result').textContent).toBe('Bot4 bu gece kaçırıldı.');
    expect(screen.getByTestId('chat-day-log').textContent).toContain('<script>alert(1)</script>');
    expect(screen.getByTestId('chat-day-log').querySelector('script')).toBeNull();
    fireEvent.input(screen.getByTestId('chat-day-input'), { target: { value: 'Bence Bot3' } });
    await act(async () => {
      fireEvent.submit(screen.getByTestId('chat-day-input').closest('form')!);
    });
    expect(sent).toEqual([{ name: 'chat.send', args: { channel: 'day', text: 'Bence Bot3' } }]);
  });

  it('oylamada hedefe dokunmak oy gönderir; oy sayıları görünür', async () => {
    const view = gameView({
      phase: 'voting',
      dayNumber: 1,
      voteRound: 'initial',
      votes: [{ voterSeatId: 's2', targetSeatId: 's3' }],
      myAction: { kind: 'vote', targets: ['s2', 's3', 's4'] },
    });
    const { sent } = renderWith(view, <PlayerGame />);
    expect(screen.getByTestId('vote-targets-s3').textContent).toContain('1 oy');
    await act(async () => {
      fireEvent.click(screen.getByTestId('vote-targets-s3'));
    });
    expect(sent).toEqual([{ name: 'game.vote', args: { targetSeatId: 's3' } }]);
  });

  it('kim kime oy verdi herkese görünür; son sözde de kalır; oy yoksa söylenir (sahip geri bildirimi)', () => {
    const voting = gameView({
      phase: 'voting',
      dayNumber: 1,
      voteRound: 'initial',
      votes: [{ voterSeatId: 's2', targetSeatId: 's3' }],
      myAction: { kind: 'vote', targets: ['s2', 's3'] },
    });
    renderWith(voting, <PlayerGame />);
    expect(screen.getByTestId('vote-detail').textContent).toContain('Bot2 → Bot3');
    cleanup();
    renderWith(
      gameView({
        phase: 'last_words',
        dayNumber: 1,
        accusedSeatId: 's3',
        deadline: NOW + 30_000,
        votes: [{ voterSeatId: 's2', targetSeatId: 's3' }],
      }),
      <PlayerGame />,
    );
    expect(screen.getByTestId('vote-detail').textContent).toContain('Bot2 → Bot3');
    cleanup();
    renderWith(gameView({ phase: 'voting', dayNumber: 1, votes: [] }), <PlayerGame />);
    expect(screen.getByTestId('vote-detail').textContent).toContain('Henüz kimse oy vermedi.');
    cleanup();
    renderWith(gameView({ phase: 'day', dayNumber: 1 }), <PlayerGame />);
    expect(screen.queryByTestId('vote-detail')).toBeNull();
  });

  it('reddedilen oy nedeni Türkçe gösterilir', async () => {
    const view = gameView({
      phase: 'confirm_vote',
      dayNumber: 1,
      deadline: NOW + 20_000,
      accusedSeatId: 's3',
      myAction: { kind: 'vote', targets: ['s3'] },
    });
    renderWith(view, <PlayerGame />, { status: 'rejected', reasonCode: 'game_paused' });
    await act(async () => {
      fireEvent.click(screen.getByTestId('vote-targets-s3'));
    });
    expect(screen.getByRole('alert').textContent).toBe('Oyun duraklatılmış.');
    expect(screen.getByText('Onay oylaması', { selector: 'h2' })).toBeTruthy();
  });

  it('son sözde sanık gösterilir; ölü oyuncu oy veremez', () => {
    const view = gameView(
      { phase: 'last_words', dayNumber: 1, accusedSeatId: 's2', deadline: NOW + 30_000 },
      { alive: false },
    );
    renderWith(view, <PlayerGame />);
    expect(screen.getByTestId('last-words-screen').textContent).toContain('Sanık: Bot2');
    expect(screen.getAllByText('Bu oylamada oy veremezsin.').length).toBeGreaterThan(0);
  });
});

describe('duraklatma ve oyun sonu', () => {
  it('moderatör kopunca "Moderatör bekleniyor" şeridi ve donmuş süre görünür', () => {
    renderWith(
      gameView({
        phase: 'day',
        dayNumber: 1,
        paused: true,
        pauseReason: 'moderator_lost',
        remainingMs: 61_000,
      }),
      <PlayerGame />,
    );
    expect(screen.getByTestId('paused-banner').textContent).toBe(
      'Moderatör bekleniyor. Oyun duraklatıldı.',
    );
    expect(screen.getByTestId('countdown').textContent).toBe('Duraklatıldı 1:01');
  });

  it('oyun sonunda kazanan, bütün roller ve olay günlüğü görünür', () => {
    const view = gameView({
      phase: 'ended',
      dayNumber: 1,
      winners: { sides: ['villagers'], extraSeatIds: [] },
      seats: [
        { seatId: 's1', nick: 'Bot1', alive: false, revealedRoleId: 'ghul' },
        { seatId: 's2', nick: 'Bot2', alive: true, revealedRoleId: 'villager' },
      ],
      nightLog: [{ nightNumber: 1, textKey: 'log.ghulKill', seatId: 's2' }],
    });
    renderWith(view, <PlayerGame />);
    expect(screen.getByTestId('end-winner').textContent).toBe('Köylüler kazandı!');
    expect(screen.getByTestId('seat-list').textContent).toContain('Gulyabaniler');
    expect(screen.getByTestId('night-log').textContent).toBe('1. gece: Bot2 kaçırıldı.');
  });

  it('oyun sonunda Odadan çık onay ister; Vazgeç hiçbir şey göndermez, Evet room.leave gönderir', async () => {
    const view = gameView({
      phase: 'ended',
      dayNumber: 1,
      winners: { sides: ['ghuls'], extraSeatIds: [] },
    });
    const { sent } = renderWith(view, <PlayerGame />);
    fireEvent.click(screen.getByTestId('leave-room'));
    expect(screen.getByTestId('confirm-dialog').textContent).toContain(
      'Odadan çıkmak istiyor musun?',
    );
    fireEvent.click(screen.getByText('Vazgeç'));
    expect(sent).toEqual([]);
    expect(screen.queryByTestId('confirm-dialog')).toBeNull();
    fireEvent.click(screen.getByTestId('leave-room'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-yes'));
    });
    expect(sent).toEqual([{ name: 'room.leave', args: {} }]);
  });
});
