// Göç dosyası denetimi (NFR5.10).
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkDirectory, findViolations } from '../../../scripts/check-migrations.ts';

describe('göç denetimi', () => {
  it('depodaki göçler yalnızca ekleme yapar', () => {
    expect(
      checkDirectory(resolve(import.meta.dirname, '../../../src/server/store/migrations')),
    ).toEqual([]);
  });

  it('tablo silme, yeniden adlandırma ve sütun değiştirme yakalanır', () => {
    expect(findViolations('DROP TABLE room_rooms;')).toEqual(['DROP']);
    expect(findViolations('ALTER TABLE room_rooms RENAME COLUMN nick TO name;')).toContain(
      'RENAME',
    );
    expect(findViolations('ALTER TABLE room_rooms DROP COLUMN nick;')).toContain(
      'ALTER TABLE … DROP/ALTER',
    );
  });

  it('yorumdaki yasak sözcükler ve ekleme göçleri sorun sayılmaz', () => {
    expect(
      findViolations('-- DROP TABLE yasak\nALTER TABLE room_rooms ADD COLUMN extra TEXT;'),
    ).toEqual([]);
    expect(findViolations('/* RENAME */ CREATE TABLE IF NOT EXISTS x (a TEXT);')).toEqual([]);
  });
});
