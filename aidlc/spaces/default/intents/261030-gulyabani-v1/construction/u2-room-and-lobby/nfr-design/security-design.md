# Güvenlik Tasarımı — U2 Oda ve Lobi

Bu belge U2'nin güvenlik ve gizli bilgi gereksinimlerinin (NFR7.20–NFR7.25, NFR8.20–NFR8.23, NFR15.20) nasıl karşılandığını yazar.

U1'in güvenlik tasarımı (`../../u1-walking-skeleton/nfr-design/security-design.md`) aynen geçerlidir:
- `wss://`, köken denetimi, 256 bitlik oturum belirteci;
- içerik güvenlik politikası;
- IP okumayan ağ geçidi;
- hız sınırları;
- ayrıcalıksız süreç.

## Sources

- NFR gereksinimleri: `construction/u2-room-and-lobby/nfr-requirements/security-requirements.md` (security-requirements; NFR7.20–NFR7.25, NFR8.20–NFR8.23, NFR15.20) ve `performance-requirements.md` (NFR1.23).
- NFR Gereksinimleri incelemesinin devreden notları (`nfr-requirements/reviews/review-01.md`); hepsi bu belgede çözüldü:
  - lobi komutlarının hız sınırı yok;
  - `browser_key_hash`'in silinmesi ölçülebilir değil, özet tuzsuz;
  - `lobby.kick` ve bekleyenin komutları için yetki testi yok;
  - çıkarma kaydı sayısının sayısal üst sınırı yok;
  - `participant.waiting` olayı sözleşmede yok;
  - hata sayacı tanımı U1 ile çelişiyor.
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec) ve `rules.md` (rules; BR13.1, BR13.3, BR13.5, BR14.1–BR14.6, BR15.1–BR15.3, BR16.2, BR16.6, BR17.8, BR19.1).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 neden kodları `rate_limited`, C5, C6, C9).
- U1 kodu: `src/server/gateway/rateLimiter.ts` (SlidingWindow), `src/server/store/repos/roomRepo.ts` (oda silme), `src/server/ops/logger.ts` (günlük süzgeci).

## Tasarım

| Konu | Tasarım | Karşıladığı |
|---|---|---|
| Moderatör yetkisi | Lobi komutları RoomManager'da tek bir `requireModerator(agg, actor)` denetiminden geçer. Denetim her komutta odanın **o anki** `moderatorParticipantId` değerine bakar; önbellek yoktur. `lobby.kick` aynı denetimi kullanır ve hedef olarak bekleyeni de kabul eder. | NFR7.20, BR14.1, BR15.1 |
| Bekleyenin komutları | Komut yönlendiricisi, katılımcı `waiting` ise yalnızca `room.leave`, `hello` ve `ping`'e izin verir. Oyun komutları `not_your_turn`, sohbet `chat_not_allowed`, lobi komutları `not_moderator` alır. | NFR7.20, BR13.3 |
| Yetki testleri | Beş yeni lobi komutu ve `lobby.kick` için üç ret testi vardır: oyuncu adına, bekleyen adına ve devirden sonra eski moderatör adına. Bekleyen adına oyun, sohbet ve lobi komutu ret testleri de vardır. | NFR7.20 (devreden not) |
| Lobi komutu hız sınırı | Yeni bir `SlidingWindow(10, 10_000)` sayacı **katılımcı kimliği** anahtarıyla çalışır ve beş lobi komutunu sayar. Oda kodu anahtarı kullanılmaz: sayaç ortak olsaydı bir oyuncu ya da bekleyen, reddedilecek lobi komutları göndererek gerçek moderatörün hakkını tüketebilirdi. Her katılımcının sayacı yalnızca kendini sınırlar. Moderatör olmayanın lobi komutu sırada `not_moderator` ile yazımsız reddedilir; U1'in bağlantı başına saniyede 20 mesaj sınırı onu ayrıca durdurur. Devirden sonra yeni moderatörün kendi sayacı vardır. Sayaç girdisi, katılımcının oturumu kapanınca (çıkarma, ayrılma, oda silme) U1'deki gibi `forget` ile silinir; bellekte kalmaz. Sınır aşılırsa komut sıraya girmeden `rate_limited` alır; depoya yazım olmaz, görünüm üretilmez. Sayaç U1'in `RateLimiter` sınıfına `lobbyCommand` olarak eklenir ve U1'in var olan `forgetParticipant` yolundan silinir. Test: bir oyuncu 10 saniyede 10 lobi komutu gönderip `not_moderator` alır; aynı anda moderatörün `lobby.setSettings` komutu kabul edilir. Normal kullanımda istemci ayar düğmelerini 300 ms bekleterek tek komutta toplar (NFR1.23). Bu yüzden moderatör sınıra yalnızca kötü niyetle ya da hatalı istemciyle ulaşır. U1'in bağlantı başına saniyede 20 mesaj sınırı da ayrıca geçerlidir. | NFR7.7 genişletmesi (devreden not), NFR1.23 |
| Tarayıcı anahtarı | İstemci 16 baytlık rastgele anahtarı `crypto.getRandomValues` ile bir kez üretir ve tarayıcı deposunda `gulyabani.browserKey` adıyla saklar. Anahtar yalnızca `room.create` ve `room.join` argümanında gider. Şema `^[A-Za-z0-9_-]{22}$` biçimini ister; bozuksa alan yok sayılır. | NFR7.21, NFR15 |
| Odaya özel özet | Sunucu yalnızca `SHA-256(roomCode + ":" + browserKey)` değerini saklar. Aynı tarayıcının iki odadaki özetleri birbirine benzemez; odalar arası eşleştirme yapılamaz. Düz anahtar bellekte yalnızca komut işlenirken bulunur. | NFR7.21 (devreden not: tuzsuz özet) |
| Günlük süzgeci | U1 günlüğünün izin verilen alan listesine `browserKey` ve `browserKeyHash` eklenmez; süzgeç bilinmeyen alanı zaten düşürür. Günlük tarama testi anahtar biçimini (22 karakter base64url) ve 64 haneli onaltılık özeti arar. | NFR7.21, NFR13.21 |
| 24 saatte silme | U1'in oda silme yazımına `DELETE FROM room_kick_records WHERE room_code = ?` eklenir. Anahtar özetini taşıyan `room_participants` satırları U1'de zaten oda ile silinir. Depo `secure_delete` açıktır (U1). Depo WAL kipinde çalıştığı için silinen satırlar kontrol noktasına kadar `-wal` dosyasında kalabilir. Bu yüzden silme taraması bir odayı sildikten sonra `PRAGMA wal_checkpoint(TRUNCATE)` çalıştırır. Test: silmeden sonra hem ana depo dosyasının hem `-wal` dosyasının baytlarında bu odanın özetlerinden hiçbiri bulunmaz. | NFR7.21, NFR2.21, BR14.6, C-15 (devreden not) |
| Çıkarma kaydı üst sınırı | Oda başına en fazla 200 çıkarma kaydı tutulur. 201. kayıt yazılırken yasağı bitmiş (`bannedUntil` geçmiş ya da boş) en eski kayıt silinir. Hepsi yasaklıysa en eski yasak silinir; bu, 200 farklı tarayıcıyı çıkaran bir moderatörde yasağın erken bitmesi demektir ve kabul edilir. | NFR2.21 (devreden not) |
| Ayar ve havuz doğrulaması | `src/shared` içindeki zod şemaları:<br>• `RoomSettingsPatch`: her alan isteğe bağlı, aralıklı, `.strict()`;<br>• `RolePoolCommand`: bilinen rol kimlikleri ve ön ayar adları, `.strict()`.<br>Kilitli rol ve kilitli ayarın varsayılan dışı değeri, şemadan sonra GameRules'daki `FeatureAvailability` denetiminde reddedilir. | NFR7.23, BR16.2, BR16.5, BR17.8 |
| Hatırlanan ayarlar | `room.create` alanları aynı şemalardan `safeParse` ile geçer. Geçmeyen alan, kilitli rol ve kilitli ayar sessizce varsayılana döner; oda kurulur. | NFR7.24, BR19.1 |
| Görünüm süzgeci | VisibilityFilter alıcı türüne göre ayrı üretir:<br>• `waiting` için izin listesi `{me, room: {roomCode, link, status, moderatorNick}}`;<br>• oyuncu için `room.settings` özeti (BR16.3);<br>• moderatör için `moderatorRoom: {settings, rolePool, startBlock, closedToNew, waiting[]}`.<br>Testler her alıcı türü için alan listesini sabit izin listeleriyle karşılaştırır. | NFR8.20, NFR8.21, NFR7.25 |
| Devir | Devir kabul edildiği yazımdan sonra odadaki herkese yeni görünüm gider. Eski moderatörün görünümü oyuncu olarak üretilir; moderatör bloğu taşımaz. | NFR8.22 |
| Canlı olmayan oylar | `liveVotes = false` iken `phase = voting` süresince oyuncu görünümünde `votes` yalnızca alıcının kendi oyunu içerir. `last_words` ve `confirm_vote`'ta kapanan turun oyları herkese gider. | NFR8.23, BR16.6 |
| Deste rastgeleliği | Havuzdan kurulan deste U1'in `random.ts` kriptografik kaynağıyla Fisher–Yates karıştırılır. | NFR15.20 |

## Kararlar ve Reddedilen Seçenekler

- **Katılımcı başına lobi sınırı:** katılımcı kimliği anahtarı yeniden bağlanmayla sıfırlanmaz ve başkasının hakkını tüketemez. *Reddedilen:*
  - Sınır koymamak: yazım kapasitesi doldurulabilir.
  - Oda başına ortak sayaç: bir oyuncu moderatörü kilitleyebilir (inceleme bulgusu).
  - Bağlantı başına sayaç: yeniden bağlanarak sıfırlanır.
- **Odaya özel özet:** sunucuda bir sır (pepper) yerine oda kodu kullanıldı. Odalar arası eşleştirmeyi önler ve yeni bir sır yönetimi gerektirmez. Özet zaten 24 saatte silinir. *Reddedilen:* tuzsuz özet (odalar arası takip), sunucu sırrı (yeni sır, dönüşüm planı gerektirir).
- **200 kayıt sınırı:** gerçek bir arkadaş grubunda çıkarılan tarayıcı sayısı onlarla sınırlıdır; 200, 1 MB bütçesinin çok altında kalır.
