-- C9 depo düzeni: her yapı taşı yalnızca kendi önekli tablolarına yazar.
-- Yalnızca ekleme kuralı (NFR5.10): sonraki göçler tablo ya da sütun ekler; silme,
-- yeniden adlandırma ve tür değiştirme yapılmaz (scripts/check-migrations.ts denetler).
-- Hiçbir tabloda IP alanı yoktur (C-14).

-- RoomManager
CREATE TABLE IF NOT EXISTS room_rooms (
  room_code TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  moderator_participant_id TEXT NOT NULL,
  current_match_id TEXT,
  settings_json TEXT NOT NULL,
  version INTEGER NOT NULL,
  processed_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS room_participants (
  participant_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  nick TEXT NOT NULL,
  normalized_nick TEXT NOT NULL,
  status TEXT NOT NULL,
  session_id TEXT NOT NULL,
  joined_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS room_participants_by_room ON room_participants (room_code);

-- MatchFlow: oyun başına tek satırda tam durum + sürüm + son 500 komut numarası (TD-03)
CREATE TABLE IF NOT EXISTS match_matches (
  match_id TEXT PRIMARY KEY,
  room_code TEXT NOT NULL,
  status TEXT NOT NULL,
  version INTEGER NOT NULL,
  record_json TEXT NOT NULL,
  processed_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS match_matches_by_room ON match_matches (room_code);

-- ChatService: mesajın commandId'si benzersizdir (BR10.2)
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id TEXT PRIMARY KEY,
  command_id TEXT NOT NULL UNIQUE,
  room_code TEXT NOT NULL,
  channel TEXT NOT NULL,
  author_participant_id TEXT NOT NULL,
  author_nick TEXT NOT NULL,
  text TEXT NOT NULL,
  sent_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS chat_messages_by_room ON chat_messages (room_code, channel, sent_at);

-- ConnectionGateway: belirtecin yalnızca özeti tutulur (NFR7.4)
CREATE TABLE IF NOT EXISTS session_sessions (
  session_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  room_code TEXT,
  participant_id TEXT,
  revoked INTEGER NOT NULL DEFAULT 0,
  device_type TEXT NOT NULL,
  last_seen_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS session_sessions_by_room ON session_sessions (room_code);
