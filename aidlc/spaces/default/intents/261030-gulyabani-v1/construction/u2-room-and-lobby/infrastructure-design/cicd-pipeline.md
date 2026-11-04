# CI/CD Hattı — U2 Oda ve Lobi

U1'in hattı (`../../u1-walking-skeleton/infrastructure-design/cicd-pipeline.md`) aynen kullanılır:
- `ci.yml`: biçim, denetim, tür, göç, `npm run verify`, web, güvenlik;
- `release.yml`: `vX.Y.Z` etiketi, ARM64 paket, GitHub Release;
- `scripts/merge-bolt.sh`, `scripts/deploy.sh`, `scripts/rollback.sh`.

v0.1.1'den beri CI her gönderimde çalışır (`paths-ignore` kaldırıldı). Bu belge U2'nin hatta eklediklerini ve U2 yayınının özel adımlarını yazar.

## Sources

- NFR tasarımı: `construction/u2-room-and-lobby/nfr-design/` (reliability-design göç, performance-design uçtan uca test ve erişilebilirlik, security-design testleri).
- U1 hattı: `construction/u1-walking-skeleton/infrastructure-design/cicd-pipeline.md`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `scripts/`.
- Ekip kuralları: `memory/team.md` (Way of Working, Testing Posture, Deployment).
- Sahip kararı: `functional-design/functional-design-questions.md` Q1 = A.

## Dal ve Birleştirme

1. U2 kodu `main`'den açılan `bolt/b2-room-and-lobby` dalında yazılır (team.md Way of Working).
2. Dala her gönderimde CI çalışır.
3. CI yeşilse U2'nin parça onayı otomatik devam kipinde (sahibin seçimi) AI-DLC tarafından verilir.
4. `scripts/merge-bolt.sh b2-room-and-lobby` parçayı tek commit olarak `main`'e squash ile ekler.

## Test Kapıları (U2 eklemeleri)

| Aşama | U2 eklemesi | Kapı |
|---|---|---|
| Göç denetimi (`npm run check:migrations`) | `002_u2_room_lobby.sql` yalnızca `ADD COLUMN` ve `CREATE TABLE IF NOT EXISTS` içerir | Başka ifade → kırmızı |
| Göç uygulama testi | v0.1.1 ile oluşturulmuş bir depo dosyası (test verisi olarak depoda, kişisel veri içermez) açılır, 002 uygulanır, oda varsayılan ayar ve havuzla okunur | Hata → kırmızı (NFR5.21) |
| Birim ve entegrasyon (`npm run verify` içinde) | Kural testleri (havuz, ön ayar, deste, StartCheck, en genç), RoomManager (giriş sırası, bekleme, çıkarma ve yasak, devir, kapatma), görünürlük izin listeleri, yetki ret testleri, hız sınırı, günlük taraması, silme sonrası depo ve `-wal` taraması | Bir test başarısız ya da kapsam %80 / `src/rules` %90 altı → kırmızı |
| Uçtan uca bot testi | Bekleyen bot; ayarlı ve "Klasik" havuzlu ikinci oyun; `DEV_ALL_ROLES=1` test sunucusunda özel rollerle üçüncü oyun | Kazanan çıkmazsa ya da yasak alan bulunursa → kırmızı (NFR12.22) |
| Erişilebilirlik taraması | Bekleme ekranı, Ayarlar, Rol Havuzu, "Nasıl oynanır?" kartı; açık ve koyu tema; 320 px | Ciddi ya da kritik bulgu → kırmızı (NFR9.20) |
| Paket boyutu | `npm run check:bundle` | 150 KB sıkıştırılmış üstü → kırmızı (NFR10.20) |
| Ayar denetimi | `NODE_ENV=production DEV_ALL_ROLES=1 node dist/server/main.js --check-config` | Sıfır dışı çıkış beklenir; kabul ederse → kırmızı |

## Yayın (U2 sürümü)

1. Sürüm numarası: U2 yeni özellik getirdiği için `v0.2.0`. `package.json` sürümü etiketle aynı olur (release.yml denetler).
2. Canlıya çıkış sahibin açık onayıyla yapılır (team.md Deployment). Otomatik devam kipi parça onaylarını kapsar, yayını kapsamaz. Yayın onayı ayrıca sorulur.
3. Yayın `scripts/deploy.sh v0.2.0` ile yapılır. Süren oyun varsa en fazla 30 dakika beklenir. Sahip onaylarsa `SKIP_GAME_WAIT=1` ile beklenmez; oyun kayıtlı olduğu için kaldığı yerden sürer.
4. **Göç ve geri alma:**
   - Yeni sürüm açılırken 002 göçü depoya uygulanır.
   - 002 yalnızca ekleme yaptığı için v0.1.1 bu depoyla açılabilir: bilmediği sütunları okumaz.
   - Bu yüzden geri alma (`scripts/rollback.sh` ya da otomatik geri alma) depo geri yüklemesi gerektirmez.
   - Geri dönülünce U2 verileri (havuz, kapatma, yasak) yok sayılır, oyun sürer.
   - Göç uygulama testi bu durumu da sınar: v0.1.1 kodu 002 uygulanmış bir depoyla açılır.
5. Yayın sonrası kontrol U1'deki gibidir:
   - iç ve dış sağlık, CSP başlığı, http→https yönlendirmesi;
   - duman testi. Duman testi U2 sürümünde bekleme ekranını da dener: oyun sürerken üçüncü bir bot gelir ve `waiting` olarak kabul edilir.

## Sırlar

U2 yeni sır eklemez. Tarayıcı anahtarı bir sır değildir; tarayıcıda üretilir ve sunucuda yalnızca odaya özel özeti tutulur. CI'da sır yoktur (U1).
