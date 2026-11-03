// Tarayıcı girişi: gerçek WebSocket bağlantısı, belirteç deposu ve tema bağlanır.
import { render } from 'preact';
import { App } from './app.tsx';
import { Connection, type SocketLike } from './net/connection.ts';
import { safeStorage, TokenStore } from './net/tokens.ts';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/screens.css';

// Sürümü sayfayı veren sunucu yazar; böylece tarayıcı ile sunucu hep aynı sürümdedir (C2, [Q1]).
const APP_VERSION =
  document.querySelector('meta[name="app-version"]')?.getAttribute('content') ?? 'dev';
const scheme = window.location.protocol === 'https:' ? 'wss' : 'ws';

const connection = new Connection({
  url: `${scheme}://${window.location.host}/ws`,
  appVersion: APP_VERSION,
  createSocket: (url) => new WebSocket(url) as unknown as SocketLike,
  pendingStore: safeStorage(() => window.sessionStorage),
});

const root = document.getElementById('app');
if (root) {
  render(
    <App
      connection={connection}
      tokens={new TokenStore(safeStorage(() => window.localStorage))}
      initialPath={window.location.pathname}
      navigate={(path) => window.history.pushState(null, '', path)}
      reload={() => window.location.reload()}
      setTheme={(theme) => {
        document.documentElement.dataset.theme = theme;
      }}
    />,
    root,
  );
}
