// @vitest-environment happy-dom
// Uygulama kabuğu: yönlendirme, bağlantı şeridi ve "Tekrar oyundasın" (BR9.2, US9.1), kibar
// duyuru alanı (faz değişimi; gece sırası duyurulmaz, BR4.7), kapanış mesajları (M-16).
import { act, cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it } from 'vitest';
import { App, phaseAnnouncement, roomCodeFromPath } from '../../../src/web/app.tsx';
import { TokenStore } from '../../../src/web/net/tokens.ts';
import { FakeConnection, MemoryStore } from './fakes.ts';
import { gameView, lobbyView } from './views.ts';

afterEach(() => cleanup());

function setup(path = '/', tokens = new TokenStore(new MemoryStore())) {
  const connection = new FakeConnection();
  const themes: string[] = [];
  const reloads: number[] = [];
  render(
    <App
      connection={connection}
      tokens={tokens}
      initialPath={path}
      navigate={() => {}}
      reload={() => reloads.push(1)}
      setTheme={(theme) => themes.push(theme)}
    />,
  );
  return { connection, tokens, themes, reloads };
}

describe('yönlendirme', () => {
  it('oda linki yalnızca 6 rakamlı kodu tanır', () => {
    expect(roomCodeFromPath('/oda/123456')).toBe('123456');
    expect(roomCodeFromPath('/oda/12345x')).toBeNull();
    expect(roomCodeFromPath('/')).toBeNull();
  });

  it('ana sayfada KVKK bilgilendirmesi görünür; Oda Kur yeni oturum açıp nick ister', async () => {
    const { connection } = setup();
    expect(screen.getByTestId('privacy-notice').textContent).toContain('24 saat');
    fireEvent.click(screen.getByTestId('home-create-button'));
    expect(connection.freshStarts).toBe(1);
    fireEvent.input(screen.getByTestId('entry-nick-input'), { target: { value: '  Ayşe ' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('entry-submit-button'));
    });
    expect(connection.sent).toEqual([{ name: 'room.create', args: { nick: 'Ayşe' } }]);
  });

  it('saklı belirteci olan oda linki aynı oturumla döner; olmayan yeni oturumla giriş ekranını açar', () => {
    const tokens = new TokenStore(new MemoryStore());
    tokens.set('123456', 'k'.repeat(43));
    const known = setup('/oda/123456', tokens);
    expect(known.connection.starts).toEqual(['k'.repeat(43)]);
    cleanup();
    const fresh = setup('/oda/654321');
    expect(fresh.connection.freshStarts).toBe(1);
    expect(screen.getByTestId('entry-screen')).toBeTruthy();
  });

  it('gelen görünüm lobiyi açar ve yeni belirteci oda koduna göre saklar', () => {
    const { connection, tokens } = setup();
    act(() => {
      connection.emit('onWelcome', 'z'.repeat(43));
      connection.view(lobbyView());
    });
    expect(screen.getByTestId('lobby-screen')).toBeTruthy();
    expect(tokens.get('123456')).toBe('z'.repeat(43));
  });

  it('nick hatası alanın altında Türkçe gösterilir, yazılan metin korunur', async () => {
    const { connection } = setup('/oda/123456');
    connection.nextAck = { status: 'rejected', reasonCode: 'nick_taken' };
    fireEvent.input(screen.getByTestId('entry-nick-input'), { target: { value: 'Ali' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('entry-submit-button'));
    });
    expect(screen.getByRole('alert').textContent).toBe('Bu takma ad odada kullanılıyor.');
    expect((screen.getByTestId('entry-nick-input') as HTMLInputElement).value).toBe('Ali');
  });
});

describe('bağlantı şeridi', () => {
  it('kopunca "Yeniden bağlanılıyor", 60 sn sonra uyarı, dönünce "Tekrar oyundasın"', () => {
    const { connection } = setup();
    act(() => connection.emit('onState', 'open', false));
    expect(screen.queryByTestId('conn-banner')).toBeNull();
    act(() => connection.emit('onState', 'waiting', false));
    expect(screen.getByTestId('conn-banner').textContent).toBe('Yeniden bağlanılıyor…');
    act(() => connection.emit('onState', 'waiting', true));
    expect(screen.getByTestId('conn-banner').textContent).toBe(
      'Bağlanamadık. İnternetini kontrol edip sayfayı yenile.',
    );
    act(() => connection.emit('onState', 'open', false));
    expect(screen.getByTestId('conn-back').textContent).toBe('Tekrar oyundasın');
  });

  it('kapanış nedenine göre tam ekran mesaj gösterilir; yenileme istenirse sayfa yenilenir', () => {
    const { connection, reloads } = setup();
    act(() => connection.emit('onClosed', 'kicked'));
    expect(screen.getByTestId('message-screen').textContent).toContain(
      'Moderatör seni odadan çıkardı.',
    );
    act(() => connection.emit('onReload'));
    expect(reloads).toHaveLength(1);
  });
});

describe('duyuru ve tema', () => {
  it('faz değişimi kibar duyuru alanında söylenir; gece adım değişimi söylenmez', () => {
    const { connection, themes } = setup();
    act(() => connection.view(gameView({ phase: 'first_night' })));
    expect(screen.getByTestId('live-region').textContent).toBe('Gece çöktü');
    expect(themes.at(-1)).toBe('night');
    act(() =>
      connection.view(
        gameView({ phase: 'first_night', myAction: { kind: 'see_card', targets: [] } }),
      ),
    );
    expect(screen.getByTestId('live-region').textContent).toBe('Gece çöktü');
    act(() => connection.view(gameView({ phase: 'day', dayNumber: 1 })));
    expect(screen.getByTestId('live-region').textContent).toBe('Gündüz');
    expect(themes.at(-1)).toBe('day');
  });

  it('duyuru metni faza göre seçilir', () => {
    expect(phaseAnnouncement('day', 'night')).toBe('Gece çöktü');
    expect(phaseAnnouncement('night', 'morning')).toBe('Gün ağardı');
    expect(phaseAnnouncement('voting', 'voting')).toBeNull();
  });
});
