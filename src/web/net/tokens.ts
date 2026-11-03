// Oturum belirteçleri tarayıcının yerel deposunda oda koduna göre tutulur (C1, BR10.5).
// Oda kurarken ya da başka odanın linkinde her zaman belirteçsiz yeni oturum açılır.
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const KEY = 'gulyabani.tokens';

export class TokenStore {
  private readonly storage: KeyValueStore | null;

  constructor(storage: KeyValueStore | null) {
    this.storage = storage;
  }

  private read(): Record<string, string> {
    try {
      return JSON.parse(this.storage?.getItem(KEY) ?? '{}') as Record<string, string>;
    } catch {
      return {};
    }
  }

  private write(tokens: Record<string, string>): void {
    try {
      this.storage?.setItem(KEY, JSON.stringify(tokens));
    } catch {
      // Gizli pencerede depo kapalı olabilir; oturum yalnızca bu sekmede sürer.
    }
  }

  get(roomCode: string): string | undefined {
    return this.read()[roomCode];
  }

  set(roomCode: string, token: string): void {
    this.write({ ...this.read(), [roomCode]: token });
  }

  remove(roomCode: string): void {
    const tokens = this.read();
    delete tokens[roomCode];
    this.write(tokens);
  }
}

/** Erişilemeyen tarayıcı depolarına karşı güvenli erişim. */
export function safeStorage(get: () => KeyValueStore): KeyValueStore | null {
  try {
    return get();
  } catch {
    return null;
  }
}
