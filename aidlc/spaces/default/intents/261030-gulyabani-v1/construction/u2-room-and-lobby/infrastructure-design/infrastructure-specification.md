# Altyapı Şartnamesi — U2 Oda ve Lobi

U2 yeni bir sunucu, hizmet, ağ kuralı ya da sır eklemez. U1'in altyapısı (`../../u1-walking-skeleton/infrastructure-design/infrastructure-specification.md`) aynen kullanılır:
- Oracle Cloud Always Free, Frankfurt, Ubuntu 24.04 ARM64 tek makine;
- Caddy (TLS ve ters vekil);
- systemd hizmeti ve SQLite depo dosyası.

Bu belge yalnızca U2'nin bu altyapıya etkisini yazar.

## Sources

- NFR tasarımı: `construction/u2-room-and-lobby/nfr-design/` (security-design, performance-design, scalability-design, reliability-design, observability-design, logical-components).
- Yapı taşları: `inception/domain-design/components.md` (components).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 sağlık kontrolü, C9 depo).
- U1 altyapısı: `construction/u1-walking-skeleton/infrastructure-design/`, `infra/` klasörü, `scripts/deploy.sh`.
- Proje kuralları: `memory/project.md` (sıfır maliyet, IP yasağı, sır yasağı).

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Hesaplama modeli | Değişmez: tek VM'de tek Node.js süreci (systemd `gulyabani.service`, `MemoryMax=512M`, yığın 288 MB) | U2 yeni süreç eklemez (NFR6.20, NFR3.20). Çıkarma kayıtlarının en kötü bellek etkisi yaklaşık 22 MB'tır ve bütçe içindedir (scalability-design) |
| Ağ | Değişmez: dışarıya yalnızca 80/443 (Caddy), iç 8080/8081 yalnızca 127.0.0.1 | Yeni uç nokta yoktur; lobi komutları aynı WSS bağlantısından gider |
| Depolama | Aynı SQLite dosyası (`/var/lib/gulyabani/game.db`, WAL, `synchronous=FULL`, `secure_delete`). Açılışta `002_u2_room_lobby.sql` göçü uygulanır: yalnızca yeni sütunlar ve `room_kick_records` tablosu | NFR5.20, NFR5.21; `settings_json` U1'den gelir, yeniden eklenmez |
| Silme taraması | U1'in 24 saatlik taraması `room_kick_records` satırlarını da siler ve her oda silmesinden sonra `PRAGMA wal_checkpoint(TRUNCATE)` çalıştırır | NFR7.21, C-15; silinen özetler `-wal` dosyasında kalmaz |
| Ortamlar | Değişmez: ayrı deneme ortamı yok (team.md Deployment). Bilgisayarda testler, canlıda tek sunucu | team.md Deployment |
| Ortam değişkenleri | Yeni değişken yalnızca `DEV_ALL_ROLES` (test sunucusunda bütün rolleri açar). `NODE_ENV=production` iken `--check-config` bu değişkeni reddeder; canlı `gulyabani.env` dosyasına eklenmez | NFR12.21, sahip kararı Q1 = A ("Yakında" kilidi canlıda açılmasın) |
| Altyapı kodu | Değişmez: `infra/provision.sh`, `infra/gulyabani.service`, `infra/Caddyfile` | U2 sunucu kurulumunu değiştirmez |
| Boyutlandırma | Değişmez (4 OCPU / 24 GB makine; süreç 512 MB ile sınırlı) | Ek yük yalnızca küçük JSON sütunları ve sayaçlardır |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| SQLite (better-sqlite3) | database | U1 ayarları; yeni tablo `room_kick_records (room_code, browser_key_hash, consecutive_kicks, banned_until, updated_at)`, birincil anahtar `(room_code, browser_key_hash)`; oda başına en çok 200 satır | Tek yazar iş parçacığı (U1). Göç yalnızca ekleme (`npm run check:migrations`) |
| Caddy | load-balancer / TLS | Değişmez; IP alanları günlükten silinir | U2 yeni yol eklemez |
| Tarayıcı deposu (`localStorage`) | cache (istemci) | `gulyabani.browserKey`, son ayarlar ve havuz, "Nasıl oynanır?" işareti | Sunucu tarafı değil; erişim hataya karşı korumalı |

## Kararlar

- **Yeni altyapı yok.** U2'nin bütün ihtiyaçları mevcut süreç ve depo dosyasıyla karşılanır. Ek bir önbellek (ör. Redis) ya da ayrı bir veritabanı sıfır maliyet kuralına (NFR3) aykırıdır ve gerekli değildir. *Reddedilen:* çıkarma kayıtlarını ayrı bir dosyada tutmak; tek yazar ve aynı işlemde yazma güvencesini bozar.
