# İş Kuralları — U2 Oda ve Lobi

Bu belge, U2'nin eklediği iş kurallarını listeler. Aşağıdaki yaml bloğu tek doğru kaynaktır; `functional-spec.md`'deki kural özeti buradan türetilir.

- U1'in kuralları (BR1–BR12) geçerliliğini korur. U2 numaralarını BR13'ten başlatır; böylece iki parçanın kuralları karışmaz.
- U1 kuralı bu parçada genişletildiğinde, U2 kuralı hangi U1 kuralını genişlettiğini yazar.
- Oyun kuralı kodunda (rol havuzu doğrulaması, deste kurma, en genç oyu, oy görünürlüğü) testler koddan önce yazılır ve %90 kapsam ister (team-practices Testing Posture).

## Sources

- Parça tanımı: `inception/units-generation/unit-of-work.md` (unit-of-work; U2 sorumlulukları ve Ortak Kurallar).
- Hikâye eşlemesi: `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map; US1.3, US1.5, US2.1, US7.2).
- Kabul ölçütleri: `inception/user-stories/stories.md` (stories).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; FR1.6, FR2.2–FR2.8, FR3, FR9.2, FR17.2, A7, A8, A10).
- Yapı taşları: `inception/domain-design/components.md` (components).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary):
  - C1 U2 komutları: `lobby.setSettings`, `lobby.setRolePool`, `lobby.transferModerator`, `lobby.closeToNewRequests`, `lobby.markYoungest`;
  - C1 U2 neden kodları: `settings_out_of_range`, `pool_invalid`, `room_expiring`, `closed_to_new`, `kick_banned`, `waiting_full`.
- Etkileşim şartnamesi: `inception/refined-mockups/interaction-spec.md` ("Yeniden Katılma Kuralı" 9 satır, "Bekleyenler ve Odayı Kapatma").
- Sahip kararı: `functional-design-questions.md` Q1 = A.
- v0.1.1 sahip geri bildirimi: odadan çıkma (`room.leave`).

```yaml
rules:
  # 13 — Giriş ve bekleme
  - id: BR13.1
    statement: Giriş (room.join) interaction-spec'teki karar tablosunun sırasıyla değerlendirilir; ilk tutan satır sonucu belirler.
    category: policy
    applies_to: Room, Participant
    trigger: room.join
    logic: "Oda yok ya da süresi dolmuşsa her durumda önce room_not_found. Sonra sırayla: (1) bu tarayıcı bu odadan oyun sırasında çıkarılmış → kicked [U3, FR15.3]; (2) tarayıcı yasaklı → kick_banned; (3) nick kuralları → nick_invalid; (4) nick odadaki moderatörle, active ya da waiting bir katılımcıyla aynı → nick_taken. Bu satır her oda durumunda (lobby, in_game, ended) uygulanır; böylece iki bekleyen aynı nicki taşıyamaz ve 'Yeni oyun'da nick benzersizliği (U1 normalizedNick) bozulmaz. Oyun sürerken nick koltuktaki bir oyuncunun nickiyse bu satır interaction-spec satır 8–9'dur; U5 yeniden katılma isteğini getirene kadar o da nick_taken döner [U5]. (5) oda yeni isteklere kapalı → closed_to_new. 4. satır odadaki herkesi zaten ayıkladığı için bu satıra yalnızca odada olmayan yeni nickler gelir; interaction-spec'teki 'kopuk oyuncunun nicki' durumu U5'te 8–9. satırlardan önce bu denetime bağlanır. (6) oda lobide → lobiye active; (7) oyun sürüyor ya da bitmiş → waiting; oyuncu sayısı 26 ise room_full."
    violation: İlk tutan satırın neden kodu döner; durum değişmez.
    source: FR1.6, FR2.3, FR2.4
  - id: BR13.2
    statement: Oyun sürerken ya da oyun bitmişken ('Yeni oyun' basılmadan) gelen yeni kişi bekleme durumunda odaya alınır.
    category: policy
    applies_to: Participant
    trigger: room.join (BR13.1 satır 7)
    logic: "IF Room.status ∈ {in_game, ended} ve satır 1–5 tutmadı THEN Participant.status = waiting; oturum bağlanır; me.kind = waiting."
    violation: —
    source: FR1.6
  - id: BR13.3
    statement: Bekleyen kişi oyuna katılmaz; koltuğu, rolü ve oyu yoktur; 'Yeni oyun'da lobiye alınır.
    category: constraint
    applies_to: Participant
    trigger: game.newGame (BR18.3)
    logic: "waiting katılımcı hiçbir oyun komutunu gönderemez (not_your_turn); sohbet yazamaz (chat_not_allowed)."
    violation: not_your_turn / chat_not_allowed
    source: FR1.6
  - id: BR13.4
    statement: Bekleyenler dahil odadaki oyuncu sayısı 26'yı geçemez.
    category: constraint
    applies_to: Room
    trigger: room.join
    logic: "oyuncu = moderatör dışı, status ∈ {active, waiting}. IF oyuncu sayısı ≥ 26 THEN room_full (lobide ve beklemede aynı mesaj: 'Bu oda dolu.'). waiting_full kodu C1'de ayrılmıştır ama ekranda aynı mesajı verdiği için room_full kullanılır."
    violation: room_full
    source: FR2.4, A7
  - id: BR13.5
    statement: Bekleyen kişiye yalnızca kendi bilgisi ve oda durumu gider; oyun ve sohbet bilgisi hiç gitmez.
    category: authorization
    applies_to: VisibilityFilter
    trigger: her görünüm gönderimi
    logic: "IF me.kind = waiting THEN görünüm = { me, room: {roomCode, link, status, moderatorNick} }; game, chat, participants rolleri/yaşam durumu, settings gönderilmez."
    violation: Gizli bilgi testi başarısız olur (NFR8).
    source: FR1.6

  # 14 — Çıkarma, yasak ve kapatma
  - id: BR14.1
    statement: Moderatör lobideki ya da bekleyen bir kişiyi onay sorusundan sonra çıkarabilir; çıkarılan 'Moderatör seni odadan çıkardı.' görür.
    category: authorization
    applies_to: Participant
    trigger: lobby.kick
    logic: "U1 BR2.3'ü genişletir: hedef status ∈ {active (Room.status = lobby), waiting (her oda durumunda)}. Oyun sırasındaki çıkarma U3'tedir (FR15)."
    violation: not_moderator / invalid_target / phase_closed
    source: FR2.3
  - id: BR14.2
    statement: Aynı tarayıcı aynı odadan, arada bir oyunda oynamadan art arda 2 kez çıkarılırsa 30 dakika o odaya giremez; tarayıcı bir oyunda koltuk alınca sayaç sıfırlanır.
    category: policy
    applies_to: KickRecord
    trigger: lobby.kick, lobby.startGame
    logic: "Çıkarmada consecutiveKicks + 1; IF consecutiveKicks = 2 THEN bannedUntil = now + 30 dk ve consecutiveKicks = 0. Oyun başlarken koltuk alan her katılımcının browserKeyHash'i için consecutiveKicks = 0."
    violation: —
    source: FR2.3
  - id: BR14.3
    statement: Tarayıcı, tarayıcıda saklanan rastgele bir anahtarla tanınır; IP kullanılmaz.
    category: constraint
    applies_to: Participant, KickRecord
    trigger: room.create, room.join
    logic: "İstemci ilk açılışta 128 bit rastgele bir anahtar üretip tarayıcıda saklar ve room.create / room.join ile gönderir; sunucu yalnızca tek yönlü özetini tutar. Anahtar yoksa ya da biçimi bozuksa giriş yine kabul edilir ama yasak denetimi o kişi için yapılamaz (hesapsız sistemde tam engel mümkün değil, A8)."
    violation: —
    source: FR2.3, C-14
  - id: BR14.6
    statement: Tarayıcı anahtarı ve özeti günlüğe yazılmaz; çıkarma kayıtları ve katılımcıların anahtar özetleri oda ile birlikte 24 saatte silinir.
    category: constraint
    applies_to: KickRecord, Participant, RoomManager
    trigger: her günlük satırı; oda silme taraması (U1 BR12.1)
    logic: "Günlük satırları browserKey ve browserKeyHash alanlarını hiçbir zaman taşımaz (U1'deki IP ve sohbet metni yasağıyla aynı süzgeç). U1'in süresi dolan odayı silen taraması room_kick_records satırlarını ve room_participants.browser_key_hash değerlerini de siler. Test maddeleri: günlük taramasında anahtar ve özet yok; süresi dolan odadan sonra depo dosyasında odanın çıkarma kaydı ve anahtar özeti yok."
    violation: Gizlilik testi başarısız olur.
    source: FR2.3, C-14, C-15
  - id: BR14.4
    statement: Yasaklı tarayıcı 30 dakika dolana kadar o odaya katılamaz.
    category: validation
    applies_to: KickRecord
    trigger: room.join (BR13.1 satır 2)
    logic: "IF KickRecord(roomCode, browserKeyHash).bannedUntil > now THEN kick_banned ('Bu odaya bir süre istek gönderemezsin. 30 dakika sonra tekrar dene.')."
    violation: kick_banned
    source: FR2.3
  - id: BR14.5
    statement: Moderatör lobide ve oyun sırasında 'Yeni isteklere kapat' anahtarını açıp kapatabilir; açıkken yeni gelen kimse giremez.
    category: policy
    applies_to: Room
    trigger: lobby.closeToNewRequests {closed}
    logic: "Yalnızca moderatör; Room.status her değerde kabul edilir. Açıkken BR13.1 satır 5 closed_to_new döner. Odadakiler ve bekleyenler etkilenmez. Anahtar 'Yeni oyun'da korunur; oyunculara ve bekleyenlere gönderilmez."
    violation: not_moderator
    source: FR2.3

  # 15 — Devir ve köyün en genci
  - id: BR15.1
    statement: Moderatör, onay sorusundan sonra moderatörlüğü lobideki başka bir etkin oyuncuya devredebilir; devreden oyuncu olur.
    category: authorization
    applies_to: Room, Participant
    trigger: lobby.transferModerator {participantId}
    logic: "IF actor moderatör değil THEN not_moderator; IF Room.status ≠ lobby THEN phase_closed; IF hedef yok, kendisi ya da status ≠ active THEN invalid_target; ELSE Room.moderatorParticipantId = hedef. Hedef oyuncu listesinden çıkıp moderatör olur, eski moderatör aynı kişi olarak oyuncu listesine girer; oyuncu sayısı değişmez, bu yüzden 26 oyunculu dolu lobide de devir kabul edilir (test maddesi)."
    violation: not_moderator / phase_closed / invalid_target
    source: FR2.2
  - id: BR15.2
    statement: Devirden sonra eski moderatörün oyuncu görünümüne, yeni moderatörün moderatör görünümüne geçmesi aynı yazımdan sonraki ilk görünümle olur.
    category: policy
    applies_to: VisibilityFilter
    trigger: lobby.transferModerator kabulü
    logic: "Görünüm alıcıya göre yeniden üretilir; moderatör bloğu (ayarlar, havuz, startBlock) yalnızca yeni moderatöre gider."
    violation: —
    source: FR2.2
  - id: BR15.3
    statement: Eşitlik kuralı 'Köyün en genci' iken moderatör lobide tek bir oyuncuyu köyün en genci olarak işaretler; işaret herkese görünür.
    category: policy
    applies_to: Room
    trigger: lobby.markYoungest {participantId | null}
    logic: "IF actor moderatör değil THEN not_moderator; IF Room.status ≠ lobby THEN phase_closed; IF settings.voteTieRule ≠ youngest THEN phase_closed; IF hedef null değil ve 'moderatör olmayan, status = active bir oyuncu' değilse THEN invalid_target (moderatör ve bekleyen işaretlenemez); ELSE Room.youngestParticipantId = hedef (null işareti kaldırır). participants[].isYoungest yalnızca kural youngest iken gönderilir."
    violation: not_moderator / phase_closed / invalid_target
    source: FR2.7
  - id: BR15.4
    statement: Kural 'Yeniden oylama'ya dönerse, işaretli kişi çıkarsa, çıkarılırsa ya da moderatör olursa işaret silinir.
    category: constraint
    applies_to: Room
    trigger: lobby.setSettings, lobby.kick, room.leave, lobby.transferModerator
    logic: "Bu komutlardan sonra işaret geçersizse Room.youngestParticipantId = null."
    violation: —
    source: FR2.7
  - id: BR15.5
    statement: Oylama eşitliğinde 'Köyün en genci' kuralı seçiliyse işaretli oyuncunun oyu 2 sayılır; yine eşitse o gün infaz yoktur.
    category: calculation
    applies_to: GameState
    trigger: oylamanın kapanması, onay oylamasının sonu
    logic: "U1 BR6.7'yi genişletir. Önce normal sayım; IF tek lider THEN U1 gibi. IF eşitlik ve voteTieRule = youngest THEN en genç koltuk yaşıyorsa ve oy verdiyse onun hedefine +1 ile yeniden say; IF tek lider THEN o sanık olur ELSE infaz yok → gece. İşaretli kişi yoksa ya da ölüyse sonuç 'infaz yok'tur. Yeniden oylama turu bu kuralda açılmaz."
    violation: —
    source: FR9.2

  # 16 — Ayarlar
  - id: BR16.1
    statement: Moderatör lobide 17 ayarı değiştirebilir; her ayar varsayılanıyla gelir.
    category: authorization
    applies_to: RoomSettings
    trigger: lobby.setSettings {kısmi ayarlar}
    logic: "IF actor moderatör değil THEN not_moderator; IF Room.status ≠ lobby THEN phase_closed; ELSE gönderilen alanlar BR16.2'den geçerse hepsi birlikte yazılır, gönderilmeyenler aynen kalır."
    violation: not_moderator / phase_closed
    source: FR2.6
  - id: BR16.2
    statement: Aralık dışı, türü yanlış ya da bilinmeyen bir ayar değeri kabul edilmez; komut hiçbir ayarı değiştirmez.
    category: validation
    applies_to: RoomSettings
    trigger: lobby.setSettings
    logic: "Her alan entities.md RoomSettings min/max/allowed değerlerine ve timidChancePercent için 10'un katı kuralına göre denetlenir. IF biri bozuk THEN settings_out_of_range (ayrıntıda alan adı ve izinli aralık) ve hiçbir alan yazılmaz."
    violation: settings_out_of_range
    source: FR2.6
  - id: BR16.3
    statement: Oyunculara yalnızca oyunu etkileyen ayarların özeti gider; moderatöre ayarların tamamı gider.
    category: authorization
    applies_to: VisibilityFilter
    trigger: görünüm
    logic: "Oyuncuya: daySeconds, lastWordsSeconds, confirmVoteSeconds, voteTieRule, liveVotes, abstainAllowed, earlyEnd, noKillFirstNight ve bu sürümde çalışan özelliklerin ayarları. closedToNew hiç gitmez. Bekleyene ayar gitmez (BR13.5)."
    violation: —
    source: FR2.6, C5
  - id: BR16.4
    statement: Ayarlar oyun başlarken oyuna kopyalanır ve oyun boyunca değişmez; 'Yeni oyun'da son ayarlar korunur.
    category: constraint
    applies_to: RoomSettings, GameState
    trigger: lobby.startGame, game.newGame
    logic: "U1 RoomSettings kısıtını 17 alana genişletir."
    violation: —
    source: FR2.6, FR17.2
  - id: BR16.5
    statement: Ayarlar sekmesinde 17 ayarın hepsi varsayılanıyla görünür; bu sürümde çalışmayan özelliklerin ayarları 'Yakında' yazısıyla kilitlidir ve değiştirilemez.
    category: policy
    applies_to: RoomSettings, FeatureAvailability
    trigger: Ayarlar sekmesi çizimi, lobby.setSettings
    logic: "otherNightSeconds (other_night_steps), groomSeconds (groom), ghostMode (ghost_mode), dailyWord (daily_word), timidChancePercent ve timidRevealName (timid), grievingDeadlineDay (grieving): IF ilgili özellik availableFeatures'ta değilse THEN alan varsayılan değeriyle, pasif ve 'Yakında' etiketiyle çizilir; lobby.setSettings bu alanı değiştirmeye çalışırsa settings_out_of_range döner ve hiçbir alan yazılmaz. Rollerdeki kilitle (BR17.8) aynı davranış; sahip kararı Q1 rolleri sordu, ayarlara aynı kural tutarlılık için uygulandı."
    violation: settings_out_of_range
    source: FR2.6, AC1.5.1, sahip kararı Q1
  - id: BR16.6
    statement: Oylar canlı değilse oylar oylama kapanınca herkese açılır.
    category: authorization
    applies_to: VisibilityFilter
    trigger: oylamanın kapanması
    logic: "U1 görünür kuralını genişletir: IF liveVotes = false THEN phase = voting iken oylar yalnızca moderatöre ve oy verenin kendi oyu kendisine gider; last_words ve confirm_vote'ta kapanan turun oyları herkese gider."
    violation: Gizli bilgi testi başarısız olur.
    source: FR9.1, görünürlük tablosu "Oylar"
  - id: BR16.7
    statement: Çekimser seçeneği açıksa oy ekranında 'Çekimser' seçeneği bulunur; çekimser oy sanık hesabına girmez.
    category: policy
    applies_to: GameState
    trigger: game.vote {targetSeatId: null}
    logic: "U1 BR6.5 null oyu abstainAllowed iken zaten kabul eder; U2 ekranda seçeneği gösterir ve legalActions vote eylemine abstain: true ekler."
    violation: invalid_target (kapalıyken)
    source: FR2.6, FR9.1

  # 17 — Rol havuzu ve katalog
  - id: BR17.1
    statement: Rol Havuzu paneli katalogdaki 9 rolü kart görseli, kısa açıklama ve aç/kapa anahtarıyla listeler; Gulyabani ve Köylü kapatılamaz.
    category: constraint
    applies_to: RolePool, RoleDefinition
    trigger: lobby.setRolePool, panel çizimi
    logic: "mandatory roller enabledSpecialRoleIds'e hiç girmez ve her zaman destededir; anahtarları açık ve pasiftir."
    violation: pool_invalid (mandatory rol kapatılmaya çalışılırsa)
    source: FR3.1, FR3.2
  - id: BR17.2
    statement: Özel roller tek tek açılıp kapatılır; Ahbaplar açılınca destede her zaman 2 Ahbap bulunur.
    category: calculation
    applies_to: RolePool
    trigger: lobby.setRolePool {enabledSpecialRoleIds, ghulCount?}
    logic: "IF actor moderatör değil THEN not_moderator; IF Room.status ≠ lobby THEN phase_closed; IF bilinmeyen roleId ya da FeatureAvailability'de olmayan rol THEN pool_invalid; ELSE yazılır. buddy'nin copiesWhenEnabled değeri 2'dir."
    violation: not_moderator / phase_closed / pool_invalid
    source: FR3.2
  - id: BR17.3
    statement: Ön ayarlar Acemi, Klasik ve Dolu Köy'dür; seçildikten sonra anahtarlar tek tek değiştirilebilir.
    category: calculation
    applies_to: RolePool
    trigger: lobby.setRolePool {presetId}
    logic: "Acemi: özel rol yok. Klasik: watchman + buddy (FeatureAvailability'de olanlar). Dolu Köy: fullVillageOrder sırasıyla (watchman, buddy, matchmaker, vengeful_groom, grieving, timid, blabbermouth_ghul) önerilen gulyabani sayısıyla birlikte oyuncu sayısına sığdıkça açılır; blabbermouth_ghul bir gulyabaninin yerine geçtiği için sığma hesabına eklenmez. Ön ayar ghulCountMode = auto yapar."
    violation: —
    source: FR3.4
  - id: BR17.4
    statement: Önerilen toplam gulyabani sayısı oyuncu sayısına göre gösterilir; adet seçici 1'in altına inmez.
    category: calculation
    applies_to: RolePool
    trigger: oyuncu sayısı değişimi, lobby.setRolePool {ghulCount}
    logic: "önerilen = 3–7 → 1, 8–11 → 2, 12–17 → 3, 18–23 → 4, 24–26 → 5 (3'ten azken 1). auto iken ghulCount = önerilen. Moderatör ghulCount gönderirse manual olur; IF ghulCount < 1 THEN pool_invalid (ekranda seçici 1'de durur)."
    violation: pool_invalid
    source: FR3.3, AC2.1.4
  - id: BR17.5
    statement: Rol sayısı oyuncu sayısını aşarsa başlatma pasiftir ve nedeni yazar; gulyabani sayısı önerilenden fazlaysa yalnızca 'dengesiz' uyarısı çıkar.
    category: validation
    applies_to: StartCheck
    trigger: her lobi görünümü, lobby.startGame
    logic: "roleCount = ghulCount + Σ(açık köylü taraflı özel rolün copiesWhenEnabled). IF roleCount > oyuncu sayısı THEN blockReason = pool_invalid, blockDetail = {roleCount, playerCount} ('6 rol var, 5 oyuncu'). IF ghulCount > önerilen THEN warnings += unbalanced. blabbermouth_ghul açıkken ayrı bir rol sayılmaz; ghulCount'un içindedir ve ghulCount ≥ 1 kuralı (BR17.4) Boşboğaz için de yeterlidir."
    violation: pool_invalid (lobby.startGame)
    source: FR3.5
  - id: BR17.6
    statement: Oyun başlarken deste havuzdan kurulur ve kriptografik rastgelelikle dağıtılır.
    category: calculation
    applies_to: GameRules
    trigger: lobby.startGame
    logic: "U1 BR3.1'i genişletir: deste = (blabbermouth_ghul açıksa 1 blabbermouth_ghul + ghulCount−1 ghul, değilse ghulCount ghul) + açık özel rollerin kopyaları + kalan villager. Karıştırma ve dağıtım U1'deki gibidir."
    violation: —
    source: FR3.2, FR3.3, FR4.1
  - id: BR17.7
    statement: Oyun başladıktan sonra rol havuzu değiştirilemez.
    category: constraint
    applies_to: RolePool
    trigger: lobby.setRolePool
    logic: "IF Room.status ≠ lobby THEN phase_closed; panel salt okunur görünür."
    violation: phase_closed
    source: FR3.6
  - id: BR17.8
    statement: Yeteneği bu sürümde yazılmamış roller panelde 'Yakında' yazısıyla kilitli görünür ve havuza eklenemez.
    category: policy
    applies_to: RolePool, FeatureAvailability
    trigger: panel çizimi, lobby.setRolePool, ön ayar
    logic: "IF roleId ∉ availableRoleIds THEN anahtar pasif + 'Yakında'; komut pool_invalid; ön ayarlar bu rolleri atlar. Kurallar availableRoleIds'i parametre alır; testler 9 rolün hepsi açıkken de çalışır. U3 bu listeyi genişletir."
    violation: pool_invalid
    source: sahip kararı Q1 = A

  # 18 — Başlatma ve yeni oyun
  - id: BR18.1
    statement: Oda kurulduktan 22 saat sonra oyun başlatılamaz; moderatör 'Oda süresi dolmak üzere, yeni oda kur' görür.
    category: validation
    applies_to: StartCheck
    trigger: lobi görünümü, lobby.startGame
    logic: "IF now ≥ Room.createdAt + 22 saat THEN blockReason = room_expiring; lobby.startGame room_expiring ile reddedilir. Süren oyun etkilenmez."
    violation: room_expiring
    source: FR17.2, A10
  - id: BR18.2
    statement: Başlatma engellerinin önceliği oyuncu azlığı, oda süresi, havuz sırasıdır; uyarılar başlatmayı engellemez.
    category: policy
    applies_to: StartCheck
    trigger: lobi görünümü
    logic: "blockReason sırası: too_few_players → room_expiring → pool_invalid. warnings: few_players (3–5 oyuncu), unbalanced (BR17.5), youngest_unmarked (voteTieRule = youngest ve işaret yok)."
    violation: —
    source: FR2.4, FR3.5, FR17.2, FR2.7
  - id: BR18.3
    statement: 'Yeni oyun'da bekleyenlerin hepsi lobiye alınır; ayarlar, havuz, kapatma anahtarı ve en genç işareti korunur.
    category: policy
    applies_to: Room, Participant
    trigger: game.newGame
    logic: "U1 BR7.3'ü genişletir: her waiting katılımcı active olur. İşaretli en genç kişi artık odada değilse işaret silinir (BR15.4)."
    violation: —
    source: FR17.2, AC7.2.2
  - id: BR18.4
    statement: Oyun başlarken koltuk alan oyuncuların çıkarma sayacı sıfırlanır ve en genç işareti oyuna kopyalanır.
    category: calculation
    applies_to: KickRecord, GameState
    trigger: lobby.startGame
    logic: "BR14.2 sıfırlaması; GameState.settings'e youngestSeatId = işaretli katılımcının koltuğu (yoksa null) eklenir."
    violation: —
    source: FR2.3, FR2.7

  # 19 — Tarayıcıda hatırlama, ilk kez kartı, ayrılma
  - id: BR19.1
    statement: Moderatörün son rol havuzu ve ayarları tarayıcısında hatırlanır ve yeni kurduğu odada varsayılan olarak gelir.
    category: policy
    applies_to: WebClient, RoomManager
    trigger: lobby.setSettings / lobby.setRolePool kabulü (saklama), room.create (kullanma)
    logic: "İstemci kabul edilen son ayarları ve havuzu tarayıcıda saklar; room.create'e isteğe bağlı settings ve rolePool alanlarıyla ekler. Sunucu bunları BR16.2 ve BR17.2'den geçirir; geçmeyen alan sessizce varsayılana döner (eski sürümden kalmış olabilir), oda yine kurulur."
    violation: —
    source: FR2.8, AC1.5.4
  - id: BR19.2
    statement: İlk kez katılan oyuncuya lobide bir kez 'Nasıl oynanır?' kartı gösterilir; kapatılınca aynı tarayıcıda tekrar gösterilmez.
    category: policy
    applies_to: WebClient
    trigger: lobi ekranı ilk çizimi
    logic: "Tarayıcıda 'görüldü' işareti yoksa kart açılır; kapatınca işaret yazılır. Tarayıcı deposu kullanılamıyorsa kart her oturumda bir kez açılır."
    violation: —
    source: FR2.5
  - id: BR19.3
    statement: Moderatörlük lobide devredildiğinde ayarlar ve havuz odada kalır; yeni moderatörün tarayıcısındaki hatırlanmış değerler bu odayı değiştirmez.
    category: constraint
    applies_to: Room
    trigger: lobby.transferModerator
    logic: "Tarayıcıdaki değerler yalnızca room.create'te kullanılır (BR19.1)."
    violation: —
    source: FR2.2, FR2.8
  - id: BR19.4
    statement: Moderatör dışındaki oyuncu lobide ya da oyun bitince odadan çıkabilir; bekleyen kişi her zaman çıkabilir; oyun sürerken oynayan çıkamaz.
    category: policy
    applies_to: Participant
    trigger: room.leave
    logic: "v0.1.1'de geldi; U2 bekleyeni ekler. IF moderatör THEN not_your_turn; IF status = active ve Room.status = in_game THEN phase_closed; ELSE status = left, oturum kapanır (kapanış nedeni left), en genç işaretiyse silinir. Ayrılma çıkarma sayılmaz (KickRecord değişmez)."
    violation: not_your_turn / phase_closed / session_invalid
    source: FR1.6, v0.1.1 sahip geri bildirimi
```

## Kural Özeti

| Grup | Kurallar | Kısaca |
|---|---|---|
| 13 Giriş ve bekleme | BR13.1–BR13.5 | 9 satırlık giriş sırası, bekleme durumu, 26 sınırı, bekleyene oyun bilgisi gitmez |
| 14 Çıkarma ve kapatma | BR14.1–BR14.6 | Lobide ve beklemede çıkarma, art arda 2 çıkarmada 30 dk yasak (tarayıcı anahtarıyla, IP yok), "Yeni isteklere kapat", anahtarın günlüğe yazılmaması ve 24 saatte silinmesi |
| 15 Devir ve en genç | BR15.1–BR15.5 | Lobide moderatörlük devri, köyün en genci işareti ve eşitlikte oyunun 2 sayılması |
| 16 Ayarlar | BR16.1–BR16.7 | 17 ayar, aralık denetimi, oyuncuya özet, oyun boyunca sabit, çalışmayan özelliğin ayarı gizli, canlı olmayan oylar, çekimser |
| 17 Rol havuzu | BR17.1–BR17.8 | 9 rol, zorunlu roller, Ahbap ×2, ön ayarlar, önerilen gulyabani sayısı, rol sayısı denetimi, deste, "Yakında" kilidi |
| 18 Başlatma ve yeni oyun | BR18.1–BR18.4 | 22 saat kuralı, engel önceliği, bekleyenlerin lobiye alınması, sayaç sıfırlama |
| 19 Tarayıcı ve ayrılma | BR19.1–BR19.4 | Son ayar ve havuzun hatırlanması, "Nasıl oynanır?" kartı, devirde ayarlar, odadan çıkma |
