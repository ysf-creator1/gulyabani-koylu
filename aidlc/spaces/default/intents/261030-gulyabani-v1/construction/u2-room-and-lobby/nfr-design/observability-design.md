# Gözlemlenebilirlik Tasarımı — U2 Oda ve Lobi

Bu belge NFR13.20–NFR13.22'nin karşılanma biçimini yazar.

U1'in gözlemlenebilirlik tasarımı (`../../u1-walking-skeleton/nfr-design/observability-design.md`) aynen geçerlidir:
- iç ve dış `/healthz`;
- `metrics.ts` sayaçları;
- izin listeli yapılandırılmış günlük;
- `errorCount` tanımı: yalnızca `internal_error`, başarısız silme ve düşen olay (U1 NFR13.4).

## Sources

- NFR gereksinimleri: `construction/u2-room-and-lobby/nfr-requirements/observability-requirements.md` (observability-requirements).
- NFR Gereksinimleri incelemesinin devreden notları (`nfr-requirements/reviews/review-01.md`):
  - `participant.waiting` olayı sözleşmede yok;
  - NFR13.22 U1 hata sayacı tanımıyla çelişiyor.
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 sağlık kontrolü, C6 olaylar).
- U1 kodu: `src/server/ops/metrics.ts`, `src/server/ops/logger.ts`.

## Tasarım

| Konu | Tasarım | Karşıladığı |
|---|---|---|
| Yeni sayaçlar | İç `/healthz` iki sayaç ekler:<br>• `waitingParticipants`: bellekteki odalarda `waiting` katılımcı sayısı, istekte sayılır;<br>• `kickBansApplied`: süreç açıldığından beri uygulanan yasak sayısı.<br>Dış `/healthz` değişmez (yalnızca durum ve sürüm). | NFR13.20 |
| Alan olayları ve günlük satırları ayrıdır | C6'daki alan olayları (`settings.changed`, `rolePool.changed`, `moderator.transferred`, `room.closedToNew`) program içi olaylardır ve sözleşmedeki adlarıyla kalır. U1 bu olayları günlüğe yazmaz; günlüğe yalnızca `startup.*`, `shutdown.*`, `limit.flood`, `command.rejected`, `sweep.done`, `overload` yazılır. U2 günlüğe kendi satırlarını ekler. Satır adları U1 günlüğünün olay biçimine (`^[a-z][a-z_.]{0,63}$`) uyar ve büyük harf taşımaz:<br>• `lobby.settings_changed`;<br>• `lobby.role_pool_changed`;<br>• `lobby.moderator_transferred`;<br>• `lobby.closed_to_new`;<br>• `room.waiting_joined`;<br>• `room.kick_ban_applied`.<br>Bekleme için sözleşmeye yeni bir alan olayı eklenmez (`participant.waiting` kullanılmaz). | NFR13.21 (inceleme bulgusu: olay adı biçimi, var olmayan olay) |
| Yazma yolu | Satırlar `src/server/gateway/wsGateway.ts` içinde, oda komutunun yazımı kesinleştikten sonra (U1'deki `applyEffects` ile aynı yerde) doğrudan `logger.info` ile yazılır. Ayrı bir olay dinleyicisi yoktur. Eşleme sabit bir tablodur:<br>• `lobby.setSettings` → `lobby.settings_changed`;<br>• `lobby.setRolePool` → `lobby.role_pool_changed`;<br>• `lobby.transferModerator` → `lobby.moderator_transferred`;<br>• `lobby.closeToNewRequests` → `lobby.closed_to_new`.<br>`room.join` sonucu `waiting` ise `room.waiting_joined` yazılır. RoomManager'ın yeni `kickBanApplied` etkisi `room.kick_ban_applied` satırını yazar ve `kickBansApplied` sayacını artırır. | NFR13.21 (inceleme bulgusu: yazma yolu) |
| Günlük alanları | Yeni satırlar yalnızca U1 `LogFields` izin listesindeki alanları kullanır: `roomCode`, `command`, `commandId`, `count` (ör. bekleyen sayısı). Yeni alan eklenmez; izin listesi değişmez. Nick, tarayıcı anahtarı, özet ve IP için alan yoktur. Günlük tarama testi bu satırları üretip nick, 22 karakterlik anahtar, 64 haneli özet ve IP biçimini arar; hiçbirini bulmaz. Ayrıca hiçbir satırın `invalid_event` olarak yazılmadığını denetler. | NFR13.21 |
| Reddedilen komutlar | Reddedilen lobi komutlarının hiçbiri `errorCount`'a girmez; U1 tanımı değişmez. Bunlar `settings_out_of_range`, `pool_invalid`, `not_moderator`, `kick_banned`, `closed_to_new`, `rate_limited` ve diğer neden kodlarıdır. Yalnızca `internal_error` sayılır. Neden koduna göre ayrı bir sayaç **eklenmez**; gereksinim bunu istemiyor ve U1'in komut sayaçları (`commandsProcessed`) yeterlidir. | NFR13.22 (devreden not) |
