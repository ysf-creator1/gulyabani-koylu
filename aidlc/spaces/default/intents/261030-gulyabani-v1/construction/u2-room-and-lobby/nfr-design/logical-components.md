# Mantıksal Bileşenler — U2 Oda ve Lobi

Bu belge U2'nin NFR tasarımlarının hangi mantıksal bileşende uygulandığını gösterir. U1'in bileşen envanteri (`../../u1-walking-skeleton/nfr-design/logical-components.md`) aynen geçerlidir. U2 yeni süreç ya da hizmet eklemez; bütün bileşenler aynı Node.js süreci ve aynı web paketi içindedir.

## Sources

- NFR tasarımları: `nfr-design/security-design.md`, `performance-design.md`, `scalability-design.md`, `reliability-design.md`, `observability-design.md`.
- Yapı taşları: `inception/domain-design/components.md` (components; RoomManager, ContentCatalog, GameRules, VisibilityFilter, ConnectionGateway, WebClient, BotPlayer).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; Komut Yönlendirme Eklemeleri).

## Bileşen Envanteri

| Bileşen (yapı taşı) | U2'deki yeni ya da değişen parça | Uygulanan NFR | Arıza alanı |
|---|---|---|---|
| GameRules (saf) | `rolePool.ts`, `startCheck.ts`, `availability.ts`; `voting.ts` (en genç), `legalActions.ts` (çekimser), `dealRoles.ts` (havuzdan deste) | NFR1.21, NFR12.20, NFR12.21, NFR15.20 | Yalnızca çağıran komut; hata `internal_error`, durum değişmez (U1) |
| ContentCatalog | `content/roles.json` (9 rol), `content/tr.json` (yeni anahtarlar) | NFR11.20, NFR12 | Açılışta doğrulanır; bozuksa program açılmaz (U1 `--check-config`) |
| RoomManager | Lobi komutları, giriş kararı, bekleme, çıkarma kaydı, devir, yeni oyunda bekleyenler, `requireModerator` | NFR7.20, NFR7.22, NFR2.20, NFR5.20 | Tek oda; oda sırası |
| ConnectionGateway | Katılımcı başına lobi hız sınırı (`SlidingWindow(10, 10s)`, oturum kapanınca `forget`), bekleyen için komut izin listesi, `browserKey` şeması | NFR7.7 genişletmesi, NFR7.20, NFR7.21 | Tek bağlantı ya da tek oda |
| VisibilityFilter | Bekleyen, oyuncu ve moderatör için ayrı izin listeleri; canlı olmayan oylar | NFR8.20–NFR8.23, NFR7.25 | Tek alıcı görünümü |
| Store | `002_u2_room_lobby.sql`; oda silmeye `room_kick_records`; 200 kayıt sınırı | NFR5.21, NFR2.21, NFR7.21 | Tek yazar iş parçacığı (U1) |
| Ops | `/healthz` yeni sayaçlar; 6 yeni küçük harfli günlük satırı (`lobby.*`, `room.waiting_joined`, `room.kick_ban_applied`). Satırlar yalnızca var olan `LogFields` alanlarını kullanır; izin listesi değişmez | NFR13.20–NFR13.22 | Yok (salt okuma) |
| WebClient | Bekleme ekranı, Ayarlar sekmesi (300 ms birleştirici), Rol Havuzu paneli, "Nasıl oynanır?" kartı, tarayıcı anahtarı ve hatırlanan ayarlar (`localStorage`, hataya karşı korumalı) | NFR1.23, NFR9.20, NFR10.20, NFR7.24 | Tek tarayıcı |
| BotPlayer | Bekleyen bot, ayarlı ve havuzlu oyunlar; `DEV_ALL_ROLES` test sunucusu | NFR12.22 | Yalnızca test |

## Paylaşılan Kaynaklar

- **Depo dosyası:** tek yazar, U1 ile aynı.
- **Oda sırası:** lobi komutları oyun komutlarıyla aynı sırayı paylaşır. Hız sınırı sıraya girmeden ve katılımcı başına uygulanır. Kötü niyetli bir moderatör yalnızca kendi odasını yavaşlatabilir; bir oyuncu moderatörün hakkını tüketemez.
- **Depo göçü:** `settings_json` U1'den gelir; 002 yalnızca yeni sütun ve tablo ekler (reliability-design).
