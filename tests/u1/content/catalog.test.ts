// İçerik kataloğu (C4) ve Türkçe metin paketi denetimi (NFR11.1, BR13.1).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  CatalogError,
  loadCatalog,
  requiredTextKeys,
  validateCatalog,
} from '../../../src/content/catalog.ts';
import { CLIENT_COMMAND_NAMES } from '../../../src/shared/protocol.ts';

const root = resolve(import.meta.dirname, '../../..');
const contentDir = join(root, 'content');
const rolesJson = JSON.parse(readFileSync(join(contentDir, 'roles.json'), 'utf8'));
const textJson = JSON.parse(readFileSync(join(contentDir, 'tr.json'), 'utf8')) as Record<
  string,
  string
>;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

// Yorumları atar (Türkçe yorumlar serbesttir; team.md Code Style).
function stripComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

describe('içerik kataloğu', () => {
  it('depodaki katalog geçerlidir ve iki rol içerir', () => {
    const catalog = loadCatalog(contentDir);
    expect(catalog.roles.map((role) => role.roleId).sort()).toEqual(['ghul', 'villager']);
    expect(catalog.text['privacy.short']).toMatch(/24 saat/);
  });

  it('her neden kodunun ve zorunlu ekran anahtarının Türkçe metni vardır', () => {
    const missing = requiredTextKeys().filter((key) => !(key in textJson));
    expect(missing).toEqual([]);
  });

  it('eksik tr.json anahtarı katalog denetimini kırar', () => {
    const broken = { ...textJson };
    delete broken['error.room_full'];
    expect(() => validateCatalog(rolesJson, broken)).toThrow(CatalogError);
    try {
      validateCatalog(rolesJson, broken);
    } catch (error) {
      expect((error as CatalogError).problems).toContain('missing text key: error.room_full');
    }
  });

  it('bozuk rol tanımı ve okunamayan klasör reddedilir', () => {
    expect(() => validateCatalog({ version: 1, roles: [] }, textJson)).toThrow(CatalogError);
    expect(() => loadCatalog(join(root, 'does-not-exist'))).toThrow(CatalogError);
  });

  it('kodda kullanılan her metin anahtarı tr.json içinde vardır', () => {
    const namespaces = new Set(Object.keys(textJson).map((key) => key.split('.')[0]));
    // Komut adları (lobby.startGame gibi) ve C6 olay adları metin anahtarı değildir.
    const commandNames = new Set<string>([
      ...CLIENT_COMMAND_NAMES,
      'phase.changed',
      'step.changed',
      'night.actionTaken',
      'vote.cast',
      'card.seen',
      'death.occurred',
      'match.started',
      'match.ended',
    ]);
    const missing: string[] = [];
    for (const file of sourceFiles(join(root, 'src'))) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const match of code.matchAll(/['"]([a-zA-Z0-9_]+(?:\.[A-Za-z0-9_]+)+)['"]/g)) {
        const key = match[1] as string;
        const namespace = key.split('.')[0] as string;
        if (!namespaces.has(namespace) || commandNames.has(key)) continue;
        if (!(key in textJson) && !/\.(json|ts|tsx|js|css|html|db)$/.test(key)) {
          missing.push(`${file.replace(root, '')}: ${key}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('uygulama kodunda oyuncuya görünen Türkçe metin gömülü değildir', () => {
    const offenders: string[] = [];
    for (const file of sourceFiles(join(root, 'src'))) {
      const code = stripComments(readFileSync(file, 'utf8'));
      for (const match of code.matchAll(/(['"`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
        if (/[çğıöşüÇĞİÖŞÜ]/.test(match[2] as string))
          offenders.push(`${file.replace(root, '')}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
