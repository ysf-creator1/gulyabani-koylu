# Teknoloji Kararları — U2 Oda ve Lobi

U2 yeni bir dil, çatı, veritabanı ya da hizmet eklemez. U1'in kararları (`../../u1-walking-skeleton/nfr-requirements/tech-stack-decisions.md`) aynen geçerlidir:
- TypeScript (strict) ve Node.js 24;
- `ws` ve `node:http`;
- better-sqlite3;
- zod şemaları;
- Preact ve Vite;
- Vitest, Playwright ve axe.

Bu belge U2'nin bu araçları nasıl kullandığını ve gerekçesini yazar.

## Sources

- U1 teknoloji kararları: `construction/u1-walking-skeleton/nfr-requirements/tech-stack-decisions.md`.
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR3 maliyet, NFR7, NFR12, NFR15, FR2.8).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/entities.md` (entities; KickRecord, FeatureAvailability) ve `rules.md` (rules; BR14.3, BR17.8, BR19.1, BR19.2).
- Proje kuralları: `memory/project.md` (ücretli hizmet yasağı, IP yasağı).

## Kararlar

| Konu | Karar | Gerekçe | Reddedilen seçenek |
|---|---|---|---|
| Yeni bağımlılık | Yok | Sıfır maliyet (NFR3) ve küçük paket (NFR10.20); gereken her şey var | Ayar formları için bir form kütüphanesi: paket boyutunu büyütür, 10 alanlık form için gereksiz |
| Tarayıcı anahtarı üretimi | İstemcide `crypto.getRandomValues` ile 16 bayt, base64url; tarayıcı deposunda saklanır | Kriptografik rastgelelik (NFR15), hesapsız tanıma (FR2.3) | IP ya da cihaz parmak izi: proje kuralı (C-14) ve gizlilik nedeniyle yasak |
| Anahtar özeti | Sunucuda `node:crypto` SHA-256 | Düz anahtar saklanmaz (NFR7.21); ek kütüphane gerekmez | Düz anahtar saklamak: depo sızarsa yasak kaydı kişiyle eşleşir |
| Ayar ve havuz doğrulaması | `src/shared` içinde zod şemaları; istemci ve sunucu aynı şemayı kullanır | Tek kaynak, aynı aralıklar (NFR7.23); C1 şema düzeni zaten zod | Elle yazılmış denetim: iki yerde ayrı ayrı bakım |
| Rol kataloğu | `content/roles.json` 9 role genişler; metinler `content/tr.json`'da | Roller veri olarak eklenir (NFR12), metinler ayrı dosyada (NFR11) | Rolleri kodda tanımlamak: NFR12'ye aykırı |
| Özellik kilidi | GameRules içinde sürümle gelen sabit bir `FeatureAvailability` listesi; kurallar listeyi parametre olarak alır | Sahip kararı Q1 = A; testler 9 rolün hepsiyle çalışabilir; U3 tek satır değişiklikle açar | Ortam değişkeniyle açma: canlıda yanlışlıkla açılabilir, sunucu ayarı gerektirir |
| Tarayıcıda hatırlama | Tarayıcı deposu (`localStorage`); her okuma ve yazma hataya karşı korunur | FR2.8 ve FR2.5 tarayıcı başınadır; sunucu kaydı gerekmez | Sunucuda moderatör profili: hesap yok, kişisel veri olur |
| Depo değişikliği | Yeni bir göç dosyası (`002_u2_room_lobby.sql`) yalnızca ekler: sütunlar ve `room_kick_records` tablosu | NFR5.21, C9 | Var olan tabloyu yeniden kurmak: canlı odaları bozar |
