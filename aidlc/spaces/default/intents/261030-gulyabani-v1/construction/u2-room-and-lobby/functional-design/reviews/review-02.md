## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04T20:05:03Z
**Iteration:** 2
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/functional-spec.md > Kapsam "Sahip kararı (Q1 = A)" ile B6 adım 1; rules.md > BR16.5 | Sahip kararı Q1 = A tutarsız uygulanmış. Kapsam bölümü "yeteneği yazılmamış roller ve özelliklerin ayarları canlı sürümde görünür ama kilitlidir ("Yakında")" diyor. B6.1 ve BR16.5 ise çalışmayan özelliklerin ayarlarını (ghostMode, dailyWord, timid, grieving, otherNight, groom) "gösterilmez" diye gizliyor. Q1'in kendi metni yalnızca rollerden söz ediyor; ayarlar için "kilitli görünür" ifadesini şartname kendisi ekledi. Sonuç olarak AC1.5.1'in verdiği örnek ("hayalet modu açık") canlı sürümde ekranda görünmez. Geliştirici hangisini yapacağını tahmin etmek zorunda. | Ayarlar için tek bir davranış seç ve hepsini ona göre hizala: ya çalışmayan özelliklerin ayarları "Yakında" ile kilitli görünür (Kapsam, B6.1, BR16.5, entities.md RoomSettings kısıtı ve ekran tablosu güncellenir), ya da gizli kalır (Kapsam'daki cümle düzeltilir ve AC1.5.1 için hayalet modu örneğinin neden görünmediği traceability.json notuna yazılır). Q1 = A'nın ayarları kapsayıp kapsamadığı Assumptions bölümünde açıkça kaydedilir. | Resolved (reviewer) |
| R-02 | Major | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/rules.md > BR13.1 satır 4 ve satır 7; functional-spec.md > B2 | Oyun sürerken (`in_game`) gelen yeni kişinin nick'i, odada zaten bekleyen biriyle aynı olabilir. Satır 4 yalnızca oda lobideyken ya da oyun bitmişken nick çakışmasına bakıyor. Satır 7 çakışma sormadan `waiting` yapıyor. Satır 8–9 yalnızca "nick oyunda" olanı kapsıyor (U5'e kadar `nick_taken`). Sonuç: oyun sürerken iki bekleyen aynı nick'i taşıyabilir. U1 entities.md'ye göre `normalizedNick` oda içinde benzersizdir; "Yeni oyun"da ikisi de `active` olunca benzersizlik bozulur. Ayrıca satır 5 (`closed_to_new`) koşulsuz uygulanıyor; interaction-spec'te bu satır yalnızca nick odada olmayan ya da kopuk oyuncu için geçerli. | Satır 7'den önce, oyun sürerken de nick'in etkin ya da bekleyen biriyle çakışmasını `nick_taken` ile reddeden bir adım ekle (satır 4'ü `in_game` için de genişlet). Satır 5'in interaction-spec'teki koşulunu ya da bilinçli sapmayı yaz. Bu iki durum için kural ve test maddesi ekle. | Resolved (reviewer) |
| R-03 | Major | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/rules.md > BR15.1 (son cümle); functional-spec.md > Hata ve Kenar Durumları satırı "26 kişi varken moderatör devreder" | Devir sırasında 26 sınırı yanlış hesaplanmış. Oyuncu sayısı moderatör hariç sayılıyor (BR13.4, FR2.4). Devirde hedef oyuncu listesinden çıkıp moderatör olur, eski moderatör listeye girer; net değişim sıfırdır. Şartname "27 oyuncu olur" diyerek devri `room_full` ile reddediyor. Bu, dolu bir lobide geçerli bir devri engelleyen ya da hiç tetiklenmeyen ölü bir kural olur. | `room_full` ile reddetme cümlesini BR15.1'den, `room_full` neden kodunu da kural ihlal listesinden ve kenar durumu tablosundan kaldır. Yerine "26 oyuncuyla devir kabul edilir, sayı değişmez" davranışını yaz ve bunun için test maddesi ekle. | Resolved (reviewer) |
| R-04 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/entities.md > RolePool.ghulCount (max 26) | U1 entities.md'de `GameState.ghulCount` için `max: 5` yazıyor. U2 `RolePool.ghulCount` değerini 26'ya kadar izin veriyor ve BR17.6 desteyi bununla kuruyor, ama U1 kısıtının nasıl genişletildiğini söylemiyor. Sözleşmedeki "yalnızca ekleme" ilkesine göre mevcut bir kısıt sessizce değiştirilemez. | U2'nin `GameState.ghulCount` sınırını nasıl genişlettiğini (ya da ghulCount üst sınırının oyuncu sayısıyla nasıl sınırlandığını) açıkça yaz; U1 kısıtına atıf ver. | Resolved (reviewer) |
| R-05 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/rules.md > BR15.3 | `lobby.markYoungest` kuralı `Room.status = lobby` denetimi yapmıyor; yalnızca `voteTieRule` denetleniyor. Oysa B6 ve FR2.7 işaretin lobide konduğunu söylüyor. "hedef moderatör ya da etkin oyuncu değil" cümlesi de iki türlü okunabilir ve moderatörün işaretlenemeyeceği (BR15.4) açık değil. | Lobi dışında `phase_closed` döndüren bir koşul ekle ve geçerli hedefi "moderatör olmayan etkin oyuncu" diye yeniden yaz. | Resolved (reviewer) |
| R-06 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/entities.md > KickRecord ve Participant.browserKeyHash; rules.md > BR14.3 | 24 saatte silinme (C-15) ve IP saklanmaması (C-14) yalnızca varlık açıklamasında anılıyor. U1 BR12.1'in RoomManager.purgeExpired adımının yeni `room_kick_records` satırlarını ve `browserKeyHash` alanını silmesi, ayrıca `browserKey` değerinin günlüğe yazılmaması kural olarak yok. Takımın otomatik test kuralı bunu zorunlu tutuyor. | Silme kapsamını ve "tarayıcı anahtarı günlüğe yazılmaz" kuralını BR14.3 ya da yeni bir kural olarak ekle; silme için test maddesi tanımla. | Resolved (reviewer) |
| R-07 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/rules.md > BR17.5 (son cümle) | "IF blabbermouth_ghul açık ve ghulCount < 1 olamaz" cümlesi anlaşılmıyor; bir koşul ile sonuç karışmış. | Cümleyi kaldır ya da net bir mantık olarak yeniden yaz (örneğin "ghulCount ≥ 1 zaten BR17.4 ile zorunlu"). | Resolved (reviewer) |
| R-08 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/functional-spec.md > B7 adım 1 ve entities.md > RoleDefinition.cardImage | AC2.1.1 "küçük kart resmi" diyor; şartname U2'de yer tutucu simge kullanıyor ve görselleri U6'ya erteliyor. Erteleme geçerli olabilir ama traceability.json'da AC2.1.1 tam `OK` işaretli; kısmi karşılama görünmüyor. | traceability.json'da AC2.1.1 için görsel kısmının U6'da tamamlanacağını not et. | Resolved (reviewer) |
| R-09 | Minor | aidlc/spaces/default/intents/261030-gulyabani-v1/construction/u2-room-and-lobby/functional-design/rules.md > BR13.1 logic satır 6 ve 7; functional-spec.md > B2 adım 6–7 | 26 kişi sınırı yalnızca satır 7'de (oyun sürerken) yazılı. Satır 6 (lobi → active) sınırı anmıyor; lobi dolu olduğunda room_full'un nerede döneceği yalnızca BR13.4'ten çıkarılabiliyor. Giriş tablosunu sırayla uygulayan bir geliştirici dolu lobide 27. kişiyi alabilir. | Satır 6'ya "oyuncu sayısı 26 ise room_full" ekle ya da sınırı satır 6 ve 7'nin ortak öndenetimi olarak yaz; lobide 27. kişi için test maddesi ekle. | New |

> R-01 Reviewer note: Ayarlar için tek davranış seçilmiş: 17 ayar görünür, çalışmayanlar "Yakında" ile varsayılanda kilitli (BR16.5, B6 adım 1, entities.md RoomSettings). AC1.5.1 örneği (ghostMode açık) görünür ve tutarlı. Q1'in ayarlara uygulanması Assumptions'a yazılmış.

> R-02 Reviewer note: BR13.1 satır 4 artık her oda durumunda uygulanıyor; satır 5'in "yalnızca yeni nickler" olduğu yazılmış (B2 adım 4–5). İki test maddesi B2 adım 9'da var.

> R-03 Reviewer note: BR15.1 ve "26 kişi varken moderatör devreder" satırı artık devri kabul ediyor; room_full reddi kalkmış, test maddesi yazılmış.

> R-04 Reviewer note: entities.md RolePool.ghulCount, U1'in max 5 kısıtını açıkça genişletiyor ve U1 GameState'e atıf veriyor.

> R-05 Reviewer note: BR15.3 lobi dışında phase_closed veriyor; hedef "moderatör olmayan, status = active oyuncu" olarak tanımlı.

> R-06 Reviewer note: BR14.6 eklendi: anahtar ve özet günlüğe yazılmaz, 24 saatte silinir; iki test maddesi var.

> R-07 Reviewer note: BR17.5 son cümlesi artık net (Boşboğaz ayrı rol sayılmaz, ghulCount içindedir).

> R-08 Reviewer note: traceability.json AC2.1.1 satırı kart görsellerinin U6'da geleceğini ve U2'de yer tutucu simge kullanıldığını yazıyor.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| sensor-traceability | pass:false; gaps boş; orphans: BR12.1 | BR12.1 U1'in kuralıdır; U2 yalnızca BR14.6'da atıf veriyor. U2'nin kendi kuralı ya da hikâyesi eksik değil, bu bir yanlış pozitiftir. |

### Summary

Önceki turun 3 Major ve 5 Minor bulgusunun hepsi artıklarda düzeltilmiş. Kalan tek yeni bulgu 26 sınırının giriş tablosunda lobi satırında anılmaması (Minor). Geliştirici kuralları ve varlıkları sormadan uygulayabilir.
