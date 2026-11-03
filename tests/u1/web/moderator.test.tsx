// @vitest-environment happy-dom
// Moderatör ekranı (BR8.1, BR6.10, BR10.7): anons, beklenen işlem, durum, ilerletme düğmeleri
// (stepVersion taşır), oyuncular ve "kopuk", oy ayrıntısı, gece günlüğü, sekmeler.
import { act, cleanup, fireEvent, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import {
  ModeratorScreen,
  advanceFor,
} from '../../../src/web/screens/moderator/ModeratorScreen.tsx';
import { renderWith } from './render.tsx';
import { NOW, gameView, moderatorBlock } from './views.ts';

afterEach(() => cleanup());

const me = {
  participantId: 'pm',
  nick: 'Moderator',
  kind: 'moderator' as const,
  seatId: undefined,
  roleId: undefined,
  alive: undefined,
};

function modView(
  game: Parameters<typeof gameView>[0],
  mod = moderatorBlock(),
  chat = {
    channels: [
      { channel: 'day' as const, canWrite: false, messages: [] },
      {
        channel: 'ghul' as const,
        canWrite: false,
        messages: [{ messageId: 'g1', authorNick: 'Bot1', text: 'Bot3 olsun', sentAt: NOW }],
      },
    ],
  },
) {
  return gameView(game, me, { moderator: mod, chat });
}

describe('akış paneli', () => {
  it('kart adımında anons, beklenen işlem ve kaç kişinin gördüğü görünür; Sonraki Adım stepVersion taşır', async () => {
    const { sent } = renderWith(
      modView({ phase: 'first_night' }, moderatorBlock({ stepCursor: 'card_reveal' })),
      <ModeratorScreen />,
    );
    expect(screen.getByTestId('mod-announcement').textContent).toBe(
      'Herkes kartına gizlice baksın ve kimseye göstermesin.',
    );
    expect(screen.getByTestId('mod-flow').textContent).toContain('2/4 oyuncu kartını gördü');
    await act(async () => {
      fireEvent.click(screen.getByTestId('mod-advance-button'));
    });
    expect(sent).toEqual([{ name: 'game.nextStep', args: { stepVersion: 3 } }]);
  });

  it('gulyabani kararı beklenirken Sonraki Adım pasiftir; durum yazılır', () => {
    const mod = moderatorBlock({
      stepCursor: 'ghul_kill',
      stepStatus: 'waiting',
      announcementTextKey: 'announce.ghul_kill',
      expectedAction: 'expected.ghul_kill',
    });
    renderWith(
      modView({ phase: 'night', nightNumber: 2, deadline: NOW + 90_000 }, mod),
      <ModeratorScreen />,
    );
    expect((screen.getByTestId('mod-advance-button') as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByTestId('mod-step-status').textContent).toContain('bekleniyor');
    expect(screen.getByTestId('mod-extend-button')).toBeTruthy();
  });

  it('sabahta sonucu ve anonsu görür, Sonucu Açıkla gönderir', async () => {
    const mod = moderatorBlock({
      announcementTextKey: 'announce.morning_death',
      announcementParams: { nick: 'Bot3' },
      expectedAction: 'expected.morning',
      pendingDeathSeatIds: ['s3'],
    });
    const { sent } = renderWith(modView({ phase: 'morning' }, mod), <ModeratorScreen />);
    expect(screen.getByTestId('mod-announcement').textContent).toBe(
      'Dün gece köyde kara bir olay oldu: Bot3 kaçırıldı.',
    );
    expect(screen.getByTestId('mod-pending').textContent).toContain('Bot3');
    await act(async () => {
      fireEvent.click(screen.getByTestId('mod-advance-button'));
    });
    expect(sent).toEqual([{ name: 'game.revealResult', args: { stepVersion: 3 } }]);
  });

  it('gündüzde hatırlatma, Oylamaya geç, uzatma ve duraklatma çalışır', async () => {
    const mod = moderatorBlock({
      announcementTextKey: 'announce.day',
      expectedAction: 'expected.day',
      notices: [{ textKey: 'notice.day.move_to_vote_reminder' }],
    });
    const { sent } = renderWith(
      modView({ phase: 'day', dayNumber: 1, deadline: NOW }, mod),
      <ModeratorScreen />,
    );
    expect(screen.getByTestId('mod-notice').textContent).toBe(
      'Gündüz süresi doldu. Oylamaya geçebilirsin.',
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('mod-advance-button'));
      fireEvent.click(screen.getByTestId('mod-extend-button'));
      fireEvent.click(screen.getByTestId('mod-pause-button'));
    });
    expect(sent.map((s) => s.name)).toEqual(['game.moveToVote', 'game.timerExtend', 'game.pause']);
    expect(sent[1]!.args).toEqual({ seconds: 30 });
  });

  it('oylamada oy ayrıntısı ve oy vermeyenler görünür; Oylamayı kapat gönderilir', async () => {
    const mod = moderatorBlock({
      announcementTextKey: 'announce.voting',
      expectedAction: 'expected.voting',
    });
    const { sent } = renderWith(
      modView(
        { phase: 'voting', dayNumber: 1, votes: [{ voterSeatId: 's1', targetSeatId: 's2' }] },
        mod,
      ),
      <ModeratorScreen />,
    );
    expect(screen.getByTestId('mod-votes').textContent).toContain('Bot1 → Bot2');
    expect(screen.getByTestId('mod-votes').textContent).toContain('Oy vermeyenler: Bot2, Bot3');
    expect(screen.getByTestId('mod-advance-button').textContent).toBe('Oylamayı kapat');
    await act(async () => {
      fireEvent.click(screen.getByTestId('mod-advance-button'));
    });
    expect(sent).toEqual([{ name: 'game.nextStep', args: { stepVersion: 3 } }]);
  });

  it('duraklatılmışken Devam et gönderilir; ret nedeni gösterilir', async () => {
    const { sent } = renderWith(
      modView({ phase: 'day', dayNumber: 1, paused: true, remainingMs: 10_000 }),
      <ModeratorScreen />,
      { status: 'rejected', reasonCode: 'game_paused' },
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('mod-resume-button'));
    });
    expect(sent).toEqual([{ name: 'game.resume', args: {} }]);
    expect(screen.getByRole('alert').textContent).toBe('Oyun duraklatılmış.');
  });
});

describe('oyuncular, günlük ve sohbet', () => {
  it('rolleri simge ve yazıyla, ölüleri ve kopukları gösterir', () => {
    renderWith(modView({ phase: 'first_night' }), <ModeratorScreen />);
    expect(screen.getByTestId('mod-seat-s1').textContent).toContain('Gulyabaniler');
    expect(screen.getByTestId('mod-seat-s2').textContent).toContain('kopuk');
    expect(screen.getByTestId('mod-seat-s4').textContent).toContain('öldü');
  });

  it('sekmeler panel değiştirir; gulyabani sohbeti salt okunur görünür; günlük boşsa söyler', () => {
    renderWith(modView({ phase: 'first_night', nightLog: [] }), <ModeratorScreen />);
    expect(document.getElementById('mod-panel-flow')!.className).toContain('is-active');
    fireEvent.click(screen.getByTestId('mod-tab-chat'));
    expect(document.getElementById('mod-panel-chat')!.className).toContain('is-active');
    expect(screen.getByTestId('mod-tab-chat').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('chat-ghul').textContent).toContain('Bot3 olsun');
    expect(screen.queryByTestId('chat-ghul-input')).toBeNull();
    expect(screen.getByTestId('night-log').textContent).toBe('Henüz olay yok.');
  });

  it('ilerletme düğmesi Faz Bitirme Tablosu ile uyumludur', () => {
    const mod = moderatorBlock();
    expect(
      advanceFor(
        { phase: 'last_words', nightNumber: 1, dayNumber: 1, paused: false, seats: [] },
        mod,
      ),
    ).toBeNull();
    expect(
      advanceFor({ phase: 'ended', nightNumber: 1, dayNumber: 1, paused: false, seats: [] }, mod)
        ?.command,
    ).toBe('game.newGame');
    expect(
      advanceFor(
        { phase: 'night', nightNumber: 2, dayNumber: 1, paused: false, seats: [] },
        { ...mod, stepCursor: 'ghul_kill', stepStatus: 'timed_out' },
      )?.enabled,
    ).toBe(true);
  });
});
