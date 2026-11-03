# İş Kuralları — U1 Yürüyen İskelet

Bu belge, yürüyen iskeletin (yalnızca Gulyabani ve Köylü ile oynanan en küçük tam oyun) iş kurallarını listeler. Aşağıdaki yaml bloğu tek doğru kaynaktır; `functional-spec.md`'deki kural özeti buradan türetilir. Kural numaraları (`BRx.y`) kalıcıdır. Oyun kuralı kodunda bu kuralların testleri koddan önce yazılır ve %90 kapsam ister (team-practices Testing Posture).

## Sources

- Parça tanımı: `inception/units-generation/unit-of-work.md` (unit-of-work; U1 sorumlulukları ve Ortak Kurallar).
- Hikâye eşlemesi: `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map; U1 satırları, US4.2/US5.4/US7.1/US7.2/US13.x paylaşımları).
- Kullanıcı hikâyeleri ve kabul ölçütleri: `inception/user-stories/stories.md` (stories).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements).
- Yapı taşları: `inception/domain-design/components.md` (components).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 kuralları ve neden kodları, C2 sağlık kontrolü, C5 görünüm, C8 silme).
- Teslim Planlaması: `inception/delivery-planning/bolt-plan.md` (B1 korumaları).
- Özet onayı: `functional-design-questions.md` (Looks correct).

```yaml
rules:
  # BR1 — Oda ve giriş
  - id: BR1.1
    statement: Yeni odaya 6 haneli, o an etkin hiçbir odada kullanılmayan bir kod ve bu kodu taşıyan paylaşılabilir bir link verilir.
    category: constraint
    applies_to: Room
    trigger: room.create komutu
    logic: "kod kriptografik rastgelelikle üretilir; oda kaydı yalnızca 'bu kodla kayıt yoksa yaz' koşuluyla yazılır; IF koşul tutmazsa (kod etkin bir odada kullanılıyor) THEN yeni kod üretilip yeniden denenir. Aynı oturumdan tekrar gelen room.create yeni oda kurmaz (BR10.5)."
    violation: Kullanımdaki kod hiçbir zaman verilmez.
    source: FR1.2
  - id: BR1.2
    statement: Odayı kuran kişi odanın moderatörüdür; moderatör oyuncu sayısına, rol dağıtımına ve hedef listelerine girmez.
    category: policy
    applies_to: Room, Participant
    trigger: room.create
    logic: "Room.moderatorParticipantId = kurucunun participantId'si"
    violation: —
    source: FR1.2
  - id: BR1.3
    statement: Nick baştaki ve sondaki boşluklar atıldıktan sonra 2–16 karakterdir ve oda içinde Türkçe büyük/küçük harf farkı gözetilmeden benzersizdir.
    category: validation
    applies_to: Participant.nick
    trigger: room.create, room.join
    logic: "nick = trim(girdi); IF uzunluk < 2 veya > 16 THEN reddet (nick_invalid); IF Türkçe küçük harf hâli odadaki bir normalizedNick ile aynıysa THEN reddet (nick_taken). Filtre listesi kontrolü U4'te eklenir (nick_filtered)."
    violation: Komut reddedilir; ekran nedeni alanın altında gösterir ve yazılan metin korunur.
    source: FR1.3, FR1.4
  - id: BR1.4
    statement: Bulunamayan ya da süresi dolmuş odaya giriş "oda bulunamadı", 26 oyuncusu dolmuş odaya giriş "oda dolu" ile reddedilir.
    category: validation
    applies_to: Room
    trigger: room.join
    logic: "IF oda yok veya expiresAt geçti (fiziksel silme beklenmeden, C8) THEN room_not_found; ELSE IF aktif oyuncu sayısı (moderatör hariç) = 26 THEN room_full"
    violation: Reddedilir; ekranda Türkçe mesaj ve ana sayfaya dönüş düğmesi görünür.
    source: FR1.5, FR2.4
  - id: BR1.5
    statement: Ana sayfa kısa tanıtım, KVKK bilgilendirmesi, "Oda Kur", oda koduyla "Katıl" ve Rehber bağlantısı gösterir; giriş ekranında da KVKK bilgilendirmesi görünür.
    category: policy
    applies_to: WebClient ana sayfa ve giriş ekranı
    trigger: Sayfa açılışı
    logic: "Her zaman gösterilir; Rehber bağlantısı U6'ya kadar kısa bir 'Nasıl oynanır' metnine gider"
    violation: —
    source: FR1.1, FR1.3
  - id: BR1.6
    statement: İskelette oyun sürerken odaya yeni giriş kabul edilmez (bekleme ekranı U2'de gelir).
    category: constraint
    applies_to: Room.status
    trigger: room.join
    logic: "IF Room.status = in_game ve kişinin bu odaya bağlı geçerli oturumu yoksa THEN reddet (phase_closed); metin: oyun bitince tekrar dene. Room.status ended iken de giriş reddedilir; yeni oyunla lobiye dönülünce giriş açılır."
    violation: Kişiye hiçbir oyun bilgisi gönderilmez.
    source: FR1.6

  # BR2 — Lobi
  - id: BR2.1
    statement: Oyun moderatör hariç en az 3, en fazla 26 oyuncuyla başlar; 3–5 oyuncuda 6 oyuncu önerisi uyarısı gösterilir.
    category: validation
    applies_to: lobby.startGame
    trigger: Lobi her değiştiğinde ve lobby.startGame
    logic: "IF oyuncu < 3 THEN 'Oyunu Başlat' pasif + 'En az 3 oyuncu gerekli' (too_few_players); IF 3 ≤ oyuncu ≤ 5 THEN etkin + öneri uyarısı; IF ≥ 6 THEN uyarı yok"
    violation: Komut too_few_players ile reddedilir.
    source: FR2.4
  - id: BR2.2
    statement: Oyunu başlatma, oyuncu çıkarma, adım ilerletme, sonuç açıklama, oylamaya geçme, süre uzatma/duraklatma ve yeni oyun yalnızca moderatörün komutlarıdır.
    category: authorization
    applies_to: lobby.*, game.nextStep, game.revealResult, game.moveToVote, game.timerExtend, game.pause, game.resume, game.newGame
    trigger: Komut geldiğinde
    logic: "IF gönderen moderatör değilse THEN reddet (not_moderator)"
    violation: Reddedilir, durum değişmez.
    source: FR2.3, FR8.1, FR13.1, FR17.2
  - id: BR2.3
    statement: Moderatör lobideki bir oyuncuyu onay sorusundan sonra çıkarabilir; çıkarılanın oturumu geçersiz olur ve "Moderatör seni odadan çıkardı." görür.
    category: policy
    applies_to: lobby.kick
    trigger: lobby.kick (onaylı)
    logic: "Participant.status = kicked; Session.revoked = true; kişiye kicked nedeniyle kapanış gönderilir; lobi listesi güncellenir. 30 dakika yasağı U2'de eklenir."
    violation: —
    source: FR2.3
  - id: BR2.4
    statement: Lobide herkes katılımcı listesini ve odada açık rolleri görür; kimin hangi rolü alacağı hiçbir yerde görünmez.
    category: policy
    applies_to: Lobi görünümü
    trigger: Lobi görünümü gönderilirken
    logic: "Açık roller iskelette Gulyabani ve Köylü'dür; rol eşleşmesi oyun başlamadan üretilmez"
    violation: —
    source: FR2.1
  - id: BR2.5
    statement: İskelette odadan ayrılma komutu yoktur; sekmeyi kapatan ya da bağlantısı kopan kişi listede kalır ve oyun başlarsa koltuk alır; lobide istenmeyen kişiyi moderatör çıkarır.
    category: policy
    applies_to: Participant.status
    trigger: Bağlantının kapanması (lobide)
    logic: "Bağlantı kapanması Participant.status'u değiştirmez (yalnızca Session.connected = false); aynı linkle dönen kişi aynı katılımcı olarak devam eder (BR9.1); listeden çıkmanın tek yolu lobby.kick'tir (BR2.3). Ayrılma durumu sonraki parçalarda yalnızca ekleme olarak gelir."
    violation: —
    source: FR2.3, FR14.1

  # BR3 — Rol dağıtımı ve kart
  - id: BR3.1
    statement: İskelette gulyabani sayısı oyuncu sayısına göre önerilen sayıdır; kalan herkes Köylüdür.
    category: calculation
    applies_to: GameState.ghulCount
    trigger: lobby.startGame
    logic: "3–7 → 1; 8–11 → 2; 12–17 → 3; 18–23 → 4; 24–26 → 5"
    violation: —
    source: FR3.3, FR4.1
  - id: BR3.2
    statement: Roller sunucuda kriptografik olarak güvenli rastgelelikle dağıtılır; her rol her oyuncu sırasına eşit olasılıkla düşer.
    category: calculation
    applies_to: Seat.roleId
    trigger: lobby.startGame
    logic: "deste = ghulCount × ghul + kalan × villager; deste güvenli rastgele karıştırılır (Fisher–Yates) ve oyunculara sırayla verilir"
    violation: —
    source: FR4.1
  - id: BR3.3
    statement: Her oyuncu yalnızca kendi kartını görür; kart kapalı gelir, dokununca açılır, tekrar dokununca kapanır; "Gördüm" moderatöre işaret olarak gider; moderatör herkes basmadan da ilerleyebilir.
    category: policy
    applies_to: Seat.cardSeen
    trigger: Kart görme fazı, game.cardSeen
    logic: "Kart görme ilk gecenin ilk adımıdır (phase first_night, stepCursor card_reveal). game.cardSeen → Seat.cardSeen = true; game.nextStep bu adımda Gördüm işaretlerinden bağımsız kabul edilir (BR10.7)"
    violation: —
    source: FR4.2, FR4.3

  # BR4 — Gece
  - id: BR4.1
    statement: İlk gece (first_night) iskelette kart görmeden sonra iki gece adımı vardır — gulyabaniler birbirini tanır, sonra kurban seçer; "ilk gece kimse kaçırılmaz" açıksa kurban adımı yoktur.
    category: policy
    applies_to: GameState.stepCursor
    trigger: lobby.startGame (ilk gece başlangıcı)
    logic: "phase = first_night, nightNumber = 1; adımlar = [card_reveal, ghul_meet, ghul_kill]; IF noKillFirstNight THEN [card_reveal, ghul_meet]"
    violation: —
    source: FR5.1
  - id: BR4.2
    statement: Standart gecede iskelette tek adım vardır — gulyabaniler kurban seçer.
    category: policy
    applies_to: GameState.stepCursor
    trigger: Gece ≥ 2 başlangıcı
    logic: "phase = night; adımlar = [ghul_kill]"
    violation: —
    source: FR5.2
  - id: BR4.3
    statement: Moderatör her gece adımında okunacak anons metnini, beklenen işlemi, durumunu (bekleniyor / yapıldı / süre doldu / oyuncu kopuk), kalan süreyi ve "Sonraki Adım"ı görür; ilk gece anonsu gece sırasının yalnızca ekranda görüneceğini hatırlatan cümleyi içerir.
    category: policy
    applies_to: Moderatör gece görünümü
    trigger: Her adım değişimi
    logic: "Anons metni ContentCatalog'dan; ilk gece anonsu 'titreşim ve ses yok' cümlesini içerir"
    violation: —
    source: FR5.4, FR13.4
  - id: BR4.4
    statement: Hedef listelerinde yalnızca yaşayan oyuncular bulunur, moderatör bulunmaz; gulyabani hedef listesinde gulyabaniler de bulunmaz.
    category: validation
    applies_to: game.ghulMark, game.vote
    trigger: Hedef seçimi
    logic: "IF hedef ölü, moderatör ya da (gulyabani adımında) gulyabani ise THEN reddet (invalid_target)"
    violation: Reddedilir, durum değişmez.
    source: FR5.6, FR6.1
  - id: BR4.5
    statement: Gulyabani adımında her yaşayan gulyabani bir hedef işaretler, diğer gulyabaniler işaretleri canlı görür; "Kararı Onayla" yalnızca tüm yaşayan gulyabaniler aynı hedefteyken etkindir ve onaylanınca karar kilitlenip moderatöre gider.
    category: policy
    applies_to: NightAction
    trigger: game.ghulMark, game.ghulConfirm
    logic: "IF tüm yaşayan gulyabanilerin işareti aynı hedef THEN onay etkin; game.ghulConfirm → ghul_decision kaydı, adım durumu 'yapıldı'; aksi hâlde ghulConfirm reddedilir (invalid_target)"
    violation: Reddedilir.
    source: FR6.2, FR6.3
  - id: BR4.6
    statement: Gulyabani kararı süresi dolarsa çoğunluğun hedefi seçilir; eşitlikte ayara göre eşitler arasında rastgele biri seçilir ya da kimse kaçırılmaz; hiç işaret yoksa kimse kaçırılmaz ve panel "Süre doldu" der.
    category: calculation
    applies_to: NightAction (ghul_decision)
    trigger: ghul_kill adımında system.deadlineReached (BR10.6); karar zaten kilitliyse (stepStatus done) süre komutu yok sayılır
    logic: "say(işaretler); IF hiç yok THEN hedef = yok; ELSE IF tek en çok THEN o; ELSE IF ghulTieRule = random THEN eşitlerden güvenli rastgele biri; ELSE yok. ghul_decision kaydı timedOut = true ile yazılır, stepStatus = timed_out; adım ilerlemez, sabaha moderatör geçirir (BR10.7)"
    violation: —
    source: FR5.7, FR6.4
  - id: BR4.7
    statement: Gece sırası gelmeyen herkes birebir aynı Uyku ekranını görür; sırası gelenin ekranı eylem paneline döner; titreşim, ses ya da ekran okuyucu duyurusu olmaz; adım değişince görünüm odadaki herkese aynı anda gönderilir.
    category: policy
    applies_to: Gece görünümü (C5)
    trigger: Her gece adım değişimi
    logic: "Sırası gelmeyenlerin game bloğu birbirinin aynısıdır; fark yalnızca sırası gelenin myAction alanındadır; gönderim tek turda herkese yapılır"
    violation: —
    source: FR5.5
  - id: BR4.8
    statement: Gulyabani sohbetine yalnızca gulyabani adımında yaşayan gulyabaniler yazar; moderatör salt okunur görür; başkasına gönderilmez.
    category: authorization
    applies_to: chat.send (channel ghul)
    trigger: chat.send
    logic: "IF gönderen yaşayan gulyabani değilse ya da adım ghul_meet/ghul_kill değilse THEN reddet (chat_not_allowed)"
    violation: Reddedilir.
    source: FR6.1, FR6.5, FR16.1
  - id: BR4.9
    statement: Sözleşmenin U1 çekirdeğindeki game.nightSelect komutu iskelette hiçbir adımda beklenmez; ilk kullanımı U3'teki özel rollerdedir.
    category: validation
    applies_to: game.nightSelect
    trigger: game.nightSelect
    logic: "MatchFlow → GameRules; U1'de legalActions bu komutu hiçbir koltuğa vermediği için her zaman not_your_turn ile reddedilir, durum değişmez"
    violation: Reddedilir.
    source: NFR7, FR5.3

  # BR5 — Sabah ve ölüm zinciri
  - id: BR5.1
    statement: 'Sabah moderatöre gecenin sonucu ve anons metni gösterilir ("Dün gece köyde kara bir olay oldu: X kaçırıldı" ya da "Dün gece kimse kaçırılmadı"); "Sonucu Açıkla" ile ölenin kartı herkese açılır.'
    category: policy
    applies_to: GameState.pendingDeaths, Seat.revealed
    trigger: Gece bitişi, game.revealResult
    logic: "pendingDeaths boşsa 'kimse kaçırılmadı' anonsu ve kart açılmaz; değilse revealResult → Seat.alive = false, revealed = true, DeathRecord yazılır"
    violation: —
    source: FR7.1
  - id: BR5.2
    statement: Her ölümden sonra ölüm zinciri işler; iskelette zincirde yalnızca kazanma kontrolü vardır; bir etki yeni ölüm doğurursa zincir onun için de işler ve kazanma kontrolü zincirin sonunda bir kez yapılır.
    category: policy
    applies_to: DeathRecord.chainOrder
    trigger: Her ölüm
    logic: "kuyruk = [ölüm]; WHILE kuyruk boş değil: etkileri sırayla uygula (iskelette etki yok; U3 Celalli Damat → sevdalı → Dertli ekler); sonra kazanmaKontrolü() bir kez"
    violation: —
    source: FR7.2
  - id: BR5.3
    statement: Sonuç açıklandıktan sonra kazanan yoksa tema gündüze döner ve meydan toplantısı başlar.
    category: policy
    applies_to: GameState.phase
    trigger: Zincir sonu
    logic: "IF winners boş THEN phase = day, dayNumber + 1, revoteCount = 0, dayTimerExpired = false, activeDeadline = şimdi + daySeconds"
    violation: —
    source: FR7.3

  # BR6 — Gündüz ve oylama
  - id: BR6.1
    statement: Gündüz herkesin ekranında aynı geri sayım görünür; süre sunucuda bitiş zamanı olarak tutulur (varsayılan 4 dakika).
    category: calculation
    applies_to: Match.activeDeadline
    trigger: Gündüz başlangıcı
    logic: "activeDeadline = şimdi + daySeconds; istemci kalan süreyi sunucu saatine göre çizer"
    violation: —
    source: FR8.1, FR14.8
  - id: BR6.2
    statement: Gündüz süresi dolunca oylama kendiliğinden başlamaz; moderatöre "Oylamaya geç" hatırlatması gelir ve oylamaya moderatör geçirir.
    category: policy
    applies_to: GameState.phase
    trigger: day fazında system.deadlineReached (BR10.6), game.moveToVote
    logic: "Süre dolunca yalnızca dayTimerExpired = true (moderatöre hatırlatma); faz değişmez. phase = voting yalnızca game.moveToVote ile; moveToVote gündüz süresi dolmadan da kabul edilir"
    violation: —
    source: FR8.1
  - id: BR6.3
    statement: Moderatör süreyi uzatır ya da duraklatırsa bütün oyuncuların geri sayımı aynı anda değişir.
    category: policy
    applies_to: Match.activeDeadline, Match.paused
    trigger: game.timerExtend, game.pause, game.resume
    logic: "extend (yalnızca süresi olan adımda; yoksa phase_closed): endsAt += saniye (duraklatılmışsa remainingOnPause += saniye), day fazında dayTimerExpired = false; pause: remainingOnPause = endsAt − şimdi, paused = true, pauseReason = moderator; resume (yalnızca pauseReason = moderator iken): endsAt = şimdi + remainingOnPause; ardından herkese yeni görünüm. Süresi olmayan adımda pause/resume yalnızca paused bayrağını değiştirir"
    violation: —
    source: FR8.1
  - id: BR6.4
    statement: Gündüz sohbetine yaşayan oyuncular ve moderatör yazar, ölüler yalnızca okur; gece gündüz sohbeti kapalıdır; son söz sırasında yalnızca sanık ve moderatör yazar; mesaj 1–300 karakter düz metindir.
    category: authorization
    applies_to: chat.send (channel day)
    trigger: chat.send
    logic: "Gündüz kanalının yazmaya açık olduğu fazlar yalnızca şunlardır: day ve voting (yaşayan oyuncular ve moderatör), last_words (yalnızca sanık ve moderatör). Diğer her durumda — oyun yokken (lobby), first_night, night, morning, confirm_vote, ended — chat_not_allowed. IF gönderen ölü THEN chat_not_allowed; IF boş THEN message_empty; IF > 300 THEN message_too_long; metin düz olarak saklanır ve gösterilir"
    violation: Mesaj gönderilmez.
    source: FR8.2, FR9.3, FR16.1, FR16.2
  - id: BR6.5
    statement: Yaşayan her oyuncu yaşayan başka bir oyuncuya oy verir, kendine veremez; aynı turda yeni oy eskisinin yerine geçer; aynı anda gelen oyların hepsi sayılır; oylar ayar açıksa canlı görünür; süresinde oy vermeyenin oyu sayılmaz.
    category: validation
    applies_to: Vote
    trigger: game.vote
    logic: "IF faz voting ya da confirm_vote değil (tur kapalı) THEN phase_closed; IF oy veren ölü THEN not_your_turn; IF targetSeatId null (çekimser) ve abstainAllowed = false THEN invalid_target; IF hedef kendisi/ölü/moderatör ya da yeniden oylamada tiedSeatIds dışında THEN invalid_target; ELSE oy kaydedilir (komutlar sırayla işlendiği için kayıp olmaz)"
    violation: Reddedilir, durum değişmez.
    source: FR9.1
  - id: BR6.6
    statement: En çok oyu alan oyuncu sanık olur; hiç oy yoksa sanık çıkmaz ve o gün infaz yapılmaz.
    category: calculation
    applies_to: GameState.accusedSeatId
    trigger: Oylama turunun kapanması (voting fazında moderatörün game.nextStep'i, BR6.11)
    logic: "IF hiç oy yok THEN gün infazsız biter → gece; ELSE IF tek en çok THEN accused = o → last_words (activeDeadline = şimdi + lastWordsSeconds); ELSE eşitlik → BR6.7"
    violation: —
    source: FR9.2
  - id: BR6.7
    statement: Eşitlikte yalnızca eşitler arasında yeniden oylama yapılır; yeniden oylama yine eşitse ya da o gün 2 yeniden oylama yapılmışsa o gün infaz yapılmaz.
    category: calculation
    applies_to: GameState.revoteCount, tiedSeatIds
    trigger: Oylama turunun eşitlikle kapanması, onay oylamasında çoğunluğun bozulması
    logic: "Sayaç kuralı: revoteCount'u yalnızca yeni bir tur açan kural ve yalnızca bir kez artırır. IF eşitlik ve voteTieRule = revote THEN IF revoteCount < 2 ve kapanan tur bir eşitlik yeniden oylaması değilse THEN revoteCount + 1, tiedSeatIds = eşitler, oylar silinir, phase = voting (voteRound = revote) ELSE infaz yok → gece. Yani yeniden oylama da eşitse ya da hak dolduysa infaz yok. Bu kural onay oylamasından eşitlikle gelindiğinde de aynı biçimde çalışır; BR6.8 o durumda sayacı kendisi artırmaz. ('Köyün en genci' kuralı U2'de eklenir.)"
    violation: —
    source: FR9.2, FR9.4
  - id: BR6.8
    statement: Sanığın son söz süresinden (30 sn) sonra oylar korunarak onay oylaması (20 sn) açılır; sanık hâlâ tek başına en çok oya sahipse infaz edilir; çoğunluk bozulursa yeni sanıkla son söze dönülür (bu bir yeniden oylama sayılır).
    category: calculation
    applies_to: GameState.voteRound
    trigger: last_words ve confirm_vote fazlarında system.deadlineReached (BR10.6)
    logic: "last_words süresi dolunca → confirm_vote (oylar korunur, oyuncular oylarını değiştirebilir, activeDeadline = şimdi + confirmVoteSeconds). confirm_vote süresi dolunca: IF accused tek en çok THEN infaz (BR6.9); ELSE IF tek en çok başka biri ve revoteCount < 2 THEN revoteCount + 1 (bu dalda tek artış), accused = o → last_words; ELSE IF eşitlik THEN BR6.7'ye gider ve sayacı BR6.7 artırır (burada artış yok); ELSE infaz yok → gece"
    violation: —
    source: FR9.3, FR9.4
  - id: BR6.9
    statement: İnfaz edilen oyuncu ölür, kartı herkese açılır ve ölüm zinciri işler; zincir sonunda kazanan yoksa gece başlar.
    category: policy
    applies_to: Seat, DeathRecord
    trigger: İnfaz kararı
    logic: "Seat.alive = false, revealed = true, deathCause = execution; BR5.2; IF kazanan yok THEN phase = night, nightNumber + 1"
    violation: —
    source: FR9.5
  - id: BR6.10
    statement: Moderatörün gündüz görünümü "Oylamaya geç"i, kimin oy verip vermediğini, oy dağılımını, sanığı, son söz, onay oylaması ve infaz adımlarını ve süre uzat/duraklat düğmelerini gösterir.
    category: policy
    applies_to: Moderatör gündüz görünümü
    trigger: Gündüz ve oylama boyunca
    logic: "Moderatör görünümü oy ayrıntısını liveVotes ayarından bağımsız olarak her zaman taşır"
    violation: —
    source: FR9.6, FR13.1
  - id: BR6.11
    statement: Oylama (ilk tur ve eşitlik yeniden oylaması) süreyle değil moderatörün "Oylamayı kapat" düğmesiyle kapanır; bu düğme voting fazındaki game.nextStep'tir.
    category: policy
    applies_to: GameState.phase = voting
    trigger: voting fazında game.nextStep (BR10.7)
    logic: "voting fazında activeDeadline yoktur; game.nextStep turu kapatır ve BR6.6 / BR6.7 sonucunu uygular. O ana kadar gelmemiş oy sayılmaz (BR6.5)"
    violation: —
    source: FR9.1, FR9.2, FR13.1

  # BR7 — Kazanma ve oyun sonu
  - id: BR7.1
    statement: Kazanma kontrolü zincir sonunda iskelette şu sırayla yapılır — tüm gulyabaniler öldüyse (kimse yaşamıyorsa da) Köylüler kazanır; gulyabaniler dışındaki herkes öldüyse ya da erken bitiş açıkken yaşayan gulyabani sayısı yaşayan diğerlerine eşit veya fazlaysa Gulyabaniler kazanır.
    category: calculation
    applies_to: GameState.winners
    trigger: Ölüm zincirinin sonu
    logic: "g = yaşayan gulyabani, d = yaşayan diğerleri; IF g = 0 THEN villagers; ELSE IF d = 0 THEN ghuls; ELSE IF earlyEnd ve g ≥ d THEN ghuls; ELSE yok. (Dertli ve sevdalı koşulları U3'te bu sıranın önüne eklenir.)"
    violation: —
    source: FR11.1
  - id: BR7.2
    statement: Oyun bitince herkesin ekranında kazanan taraf, herkesin rolü ve gece olay günlüğü açılır.
    category: policy
    applies_to: GameState.phase = ended
    trigger: winners belirlendiğinde
    logic: "phase = ended; görünüm herkese tüm rolleri ve nightLog'u taşır"
    violation: —
    source: FR11.2, FR17.1
  - id: BR7.3
    statement: Oyun bitince moderatör "Yeni oyun" diyebilir; aynı oda, aynı oyuncular ve aynı ayarlarla lobiye dönülür; odanın 24 saatlik süresi sıfırlanmaz.
    category: policy
    applies_to: Room.status, Match
    trigger: game.newGame
    logic: "IF phase = ended THEN Room.currentMatchId boşalır (Room.status lobby olur), komut numarası Room'a yazılır, biten Match oda silinene kadar salt okunur kalır, ayarlar korunur, expiresAt değişmez. Biten oyuna geç gelen game.* komutları phase_closed alır. (Bekleyenlerin alınması ve 22 saat kuralı U2'de eklenir.)"
    violation: phase ended değilse phase_closed.
    source: FR17.2

  # BR8 — Moderatör ekranı ve moderatörün kopması
  - id: BR8.1
    statement: Moderatör ekranı fazı/adımı, anons metnini, beklenen işlemi ve durumunu, "Sonraki Adım"ı, tüm oyuncuları rolleri, yaşam durumları ve "kopuk" durumlarıyla, gece olay günlüğünü, gulyabani sohbetini (salt okunur) ve süre uzat/duraklat düğmelerini gösterir; telefonda Akış / Oyuncular / Günlük / Sohbet sekmeleri, bilgisayarda yan yana sütunlar kullanılır.
    category: policy
    applies_to: Moderatör görünümü
    trigger: Oyun boyunca
    logic: "Rozetler, Boşboğaz kutusu ve Dertli göstergesi U3'te eklenir"
    violation: —
    source: FR13.1, FR13.2
  - id: BR8.2
    statement: Moderatörün bağlantısı koparsa oyun ve bütün sayaçlar duraklar, herkes "Moderatör bekleniyor. Oyun duraklatıldı." görür; moderatör aynı linkle dönünce sayaçlar kalan süreden devam eder. İskelette devralma kuralı yoktur.
    category: policy
    applies_to: Match.paused, pauseReason
    trigger: Moderatörün connection.lost / connection.restored olayı
    logic: "lost → moderatorConnected = false; IF oyun zaten elle duraklatılmış değilse THEN paused = true, pauseReason = moderator_lost ve duraklatma anı = max(moderatörün lastSeenAt'i, Match.lastStepChangeAt); remainingOnPause = endsAt − duraklatma anı (en az 0). Böylece sessizliğin 45 saniyesi oyunculardan yenmez, ama o arada olmuş adım değişiklikleri geri alınmaz. restored → moderatorConnected = true; IF pauseReason = moderator_lost THEN endsAt = şimdi + remainingOnPause ve paused = false (BR8.3)"
    violation: —
    source: FR14.5
  - id: BR8.3
    statement: Elle duraklatma, moderatörün kopmasından önce gelir; moderatör kopup dönünce elle duraklatılmış oyun kendiliğinden devam etmez.
    category: policy
    applies_to: Match.pauseReason, Match.moderatorConnected
    trigger: game.pause, game.resume, connection.lost, connection.restored
    logic: "IF pauseReason = moderator iken moderatör koparsa THEN pauseReason değişmez, yalnızca moderatorConnected = false; dönünce oyun duraklatılmış kalır ve yalnızca game.resume devam ettirir. Otomatik devam yalnızca pauseReason = moderator_lost iken olur. game.resume pauseReason = moderator_lost iken gelemez (moderatör kopuktur); gelirse game_paused ile reddedilir"
    violation: —
    source: FR8.1, FR14.5

  # BR9 — Bağlantı ve oturum
  - id: BR9.1
    statement: Oturum belirteci en az 256 bitlik tahmin edilemez bir değerdir, tarayıcıda saklanır, sunucuda yalnızca özeti tutulur; sayfa yenilenince ya da aynı linkle açılınca kişi aynı rol, ekran ve durumla döner.
    category: policy
    applies_to: Session
    trigger: hello (belirteçli)
    logic: "IF özet eşleşir ve revoked değil THEN aynı participant'a bağlan ve tam görünüm gönder; ELSE session_invalid → giriş ekranı"
    violation: session_invalid
    source: FR14.1
  - id: BR9.2
    statement: Bağlantı koparsa "Yeniden bağlanılıyor" şeridi çıkar; ağ gelince en fazla 5 saniyede "Tekrar oyundasın" görünür; 60 saniyede bağlanılamazsa "Bağlanamadık. İnternetini kontrol edip sayfayı yenile." yazar ve arka planda deneme sürer.
    category: policy
    applies_to: WebClient bağlantı şeridi
    trigger: Bağlantı kopması
    logic: "Yeniden deneme 1, 2, 4, 8 sn, sonra en fazla 10 sn aralıkla (küçük rastgele sapma); onayı 5 sn'de gelmeyen komut aynı commandId ile yeniden gönderilir"
    violation: —
    source: FR14.2
  - id: BR9.3
    statement: Sunucu 45 saniye bir bağlantıdan hiçbir şey alamazsa kişiyi kopuk sayar; moderatör ekranında kopuk oyuncunun yanında "kopuk" yazar, dönünce kalkar.
    category: policy
    applies_to: Session.connected
    trigger: 45 sn sessizlik, yeniden bağlanma
    logic: "connected = false → connection.lost olayı; dönüş → connection.restored"
    violation: —
    source: FR14.3
  - id: BR9.4
    statement: İskelette aynı oturumla gelen son bağlantı geçerlidir; önceki bağlantı kapatılır.
    category: constraint
    applies_to: Session.activeConnectionId
    trigger: hello (aynı belirteç)
    logic: "activeConnectionId = yeni bağlantı; eskisi kapanır (uyarı ekranı U5'te)"
    violation: —
    source: FR14.7
  - id: BR9.5
    statement: Bağlantı yalnızca şifreli (wss/https) kabul edilir; ilk mesaj 10 saniye içinde hello olmalıdır; istemci sürümü sunucudan farklıysa sayfa kendiliğinden yenilenir.
    category: validation
    applies_to: Bağlantı kurulumu
    trigger: Bağlantı açılışı
    logic: "IF şifresiz THEN kabul edilmez; IF 10 sn'de hello yok THEN kapat; IF appVersion ≠ sunucu sürümü THEN reload"
    violation: Bağlantı kapatılır.
    source: NFR7, FR14.1
  - id: BR9.6
    statement: Bütün süreler sunucuda bitiş zamanı olarak tutulur; her görünüm sunucu saatini taşır; istemci geri sayımı sunucu saatine göre çizer, telefon saati yanlış olsa da sapma en fazla 1 saniyedir.
    category: calculation
    applies_to: Deadline
    trigger: Her görünüm ve ping cevabı
    logic: "kalan = endsAt − (serverTime + yerel kayma)"
    violation: —
    source: FR14.8, NFR14

  # BR10 — Güvenlik ve tutarlılık
  - id: BR10.1
    statement: Sunucu her komutu gönderenin hakkına, o anki faza ve hedefe göre doğrular; geçersiz komut neden koduyla reddedilir ve oyun durumu değişmez.
    category: authorization
    applies_to: Bütün game.* ve lobby.* komutları
    trigger: Komut geldiğinde
    logic: "IF sırası değil/yetkisi yok THEN not_your_turn veya not_moderator; IF faz kapalı THEN phase_closed; IF hedef geçersiz THEN invalid_target"
    violation: Reddedilir; durum değişmez.
    source: NFR7, FR6.1
  - id: BR10.2
    statement: Bir odanın bütün komutları — oyun yokken gelenler dahil — o odanın tek sırasında sırayla işlenir; komut yeni durum kalıcı depoya yazıldıktan sonra kabul edilir; aynı commandId ikinci kez gelirse yeniden işlenmez, ilk sonuç döner.
    category: constraint
    applies_to: Room.version, Room.processedCommandIds, Match.persistedVersion, Match.processedCommandIds, ChatMessage.commandId
    trigger: Her komut
    logic: "Sıra: her oda için tek sıra; room.join (o odaya), lobby.*, game.*, chat.send, system.deadlineReached ve o odanın temizliği bu sıradan geçer. room.create, kurulacak kodun sırasında çalışır (BR1.1). Akış: sıra → tekrar denetimi → doğrula → yeni durumu hesapla → sürüm + 1 ile yaz → accepted + herkese görünüm. Komut numarası değiştirdiği kaydın içinde, aynı yazımda saklanır: oda düzeyi komutlar (room.create, room.join, lobby.kick, lobby.startGame, game.newGame) Room.processedCommandIds ve Room.version'da; game.* ve system.deadlineReached Match.processedCommandIds ve Match.persistedVersion'da; chat.send ChatMessage.commandId'de. Tekrar denetimi numarayı odanın üç yerinde de (biten Match'ler dahil) arar; IF bulunursa THEN duplicate + o kişinin güncel tam görünümü. lobby.startGame iki kayda yazar: önce Match (sürüm 1), sonra Room.currentMatchId; kesinleşme noktası Room yazımıdır ve accepted ancak ondan sonra döner; arada kesilirse açılışta öksüz Match silinir ve tekrar gelen aynı komut yeniden işlenir (hiçbir rol bilgisi kişiye gitmemiştir). IF yazma sürüm çakışması THEN internal_error"
    violation: Kabul edilmez; durum değişmez.
    source: FR14.6, NFR5
  - id: BR10.3
    statement: Bir oyuncu 10 saniyede en fazla 5 mesaj, bir bağlantı dakikada en fazla 10 oda kodu denemesi yapabilir; aşan deneme reddedilir.
    category: constraint
    applies_to: RateCounter
    trigger: chat.send, room.join
    logic: "kayan pencerede deneme sayısı sınırı aşarsa rate_limited; mesaj sayacı participantId'ye bağlıdır (yeniden bağlanınca sıfırlanmaz), oda kodu sayacı connectionId'ye bağlıdır (C1); sayaç bellekte tutulur, IP kullanılmaz. rate_limited kodu C1 listesinde U8 altındadır; Teslim Planlaması B1 basit sınırı U1'e aldığı için kod U1'den itibaren kullanılır (yalnızca ekleme)"
    violation: rate_limited
    source: NFR7
  - id: BR10.4
    statement: IP adresi hiçbir varlıkta, kayıtta ya da sunucu günlüğünde saklanmaz; ülke bağlantı anında çıkarılır ve IP atılır.
    category: constraint
    applies_to: Session, sunucu günlükleri
    trigger: Bağlantı açılışı
    logic: "country = ülkeVeritabanı(IP); IP bellekten atılır; günlük biçimi IP alanı içermez"
    violation: —
    source: FR20.2
  - id: BR10.5
    statement: Oda kurma ve odaya katılma oturum başına bir kez işlenir; bağlantı kopup aynı komut yeniden gönderilse de ikinci oda ya da ikinci katılımcı oluşmaz, ilk sonuç döner.
    category: constraint
    applies_to: Session, Participant.sessionId
    trigger: room.create, room.join
    logic: "Oturum belirteçsiz hello'da açılır ve belirteç welcome ile bir kez verilir (C1); room.create/room.join bu oturumla gelir. IF oturuma zaten bir etkin Participant bağlıysa (Participant.sessionId ile aranır) THEN komut yeniden işlenmez: aynı commandId → duplicate; yeni commandId ile aynı odaya room.join → accepted, var olan katılımcı döner (nick_taken verilmez); başka bir odaya ya da yeniden room.create → session_invalid (istemci 'Oda Kur'da ve başka odanın linkinde her zaman belirteçsiz yeni hello açar; belirteçleri oda koduna göre saklar). Katılımcı kaydı ile oturum bağlantısı arasında kesilme olursa tekrar gelen komut Participant.sessionId'den katılımcıyı bulur ve bağlantıyı tamamlar"
    violation: İkinci kayıt oluşturulmaz.
    source: FR14.1, FR14.6
  - id: BR10.6
    statement: Süre dolması kural motoruna bir sistem komutuyla girer; zaman aşımı, son sözün bitmesi, onay oylamasının kapanması ve gündüz hatırlatması bu komutla olur.
    category: policy
    applies_to: Match.activeDeadline, GameRules.decide
    trigger: activeDeadline geçtiğinde (oyun duraklatılmamışken)
    logic: "MatchFlow'un zamanlayıcısı odanın sırasına system.deadlineReached {stepVersion} koyar; komut numarası 'deadline:<matchId>:<stepVersion>' olduğu için yeniden başlatmada bile bir kez işlenir. GameRules.decide bu komutu actor = system ile alır (C3 RuleCommand'a ekleme: actorSeatId | moderator | system); IF stepVersion güncel değilse THEN hiçbir şey değişmez (accepted değil, sessizce düşer). Etkisi faza göredir: ghul_kill → BR4.6; day → BR6.2 hatırlatması; last_words → confirm_vote; confirm_vote → BR6.8 sonucu. Süresi olmayan adımlarda zamanlayıcı yoktur. Bu komut C1'de yoktur; istemciden gelen 'system.*' adlı komut tanınmayan komut olarak reddedilir (not_your_turn). Açılışta (C9 restore-rule) süresi geçmiş adımın komutu hemen sıraya konur"
    violation: —
    source: FR5.7, FR8.1, FR9.3, FR14.8
  - id: BR10.7
    statement: Moderatörün ilerletme komutları (game.nextStep, game.revealResult, game.moveToVote) gördüğü adımın sürüm numarasını taşır; numara tutmazsa komut phase_closed ile reddedilir, böylece çift dokunuş adım atlatmaz; her adımda nextStep'in ne zaman kabul edildiği Faz Bitirme Tablosu'ndadır.
    category: validation
    applies_to: GameState.stepVersion, game.nextStep, game.revealResult, game.moveToVote
    trigger: Moderatörün ilerletme komutu
    logic: "args.stepVersion zorunludur (C1 args'a ekleme). IF args.stepVersion ≠ GameState.stepVersion THEN phase_closed. Kabul tablosu: card_reveal → her zaman (ghul_meet'e); ghul_meet → her zaman (ghul_kill'e ya da noKillFirstNight ise morning'e); ghul_kill → yalnızca stepStatus done ya da timed_out iken (morning'e), aksi hâlde step_waiting; morning → nextStep phase_closed, yalnızca revealResult; day → nextStep phase_closed, yalnızca moveToVote; voting → nextStep oylamayı kapatır (BR6.11); last_words ve confirm_vote → nextStep step_waiting (süreyle biter, BR10.6); ended → phase_closed (yalnızca newGame). game.revealResult yalnızca morning'de, game.moveToVote yalnızca day'de kabul edilir; başka fazda phase_closed. step_waiting U1'in C1 ReasonCode listesine eklediği yeni koddur ('Bu adım henüz tamamlanmadı')"
    violation: Reddedilir, durum değişmez.
    source: FR5.4, FR13.1, NFR7
  - id: BR10.8
    statement: Oyun duraklatılmışken yalnızca devam ettirme, süre uzatma, kart görme işareti ve izinli sohbet kabul edilir; diğer oyun komutları game_paused ile reddedilir.
    category: validation
    applies_to: Match.paused
    trigger: Duraklatılmış oyunda game.* komutu
    logic: "IF paused THEN kabul: game.resume (BR8.3), game.timerExtend, game.cardSeen, chat.send (BR6.4/BR4.8 izinleriyle); diğer game.* → game_paused. Duraklatılmışken zamanlayıcı çalışmaz, system.deadlineReached üretilmez. game_paused U1'in C1 ReasonCode listesine eklediği yeni koddur"
    violation: Reddedilir, durum değişmez.
    source: FR8.1, FR14.5

  # BR11 — Görünürlük (C5)
  - id: BR11.1
    statement: Her oyuncunun görünümünde yalnızca kendi rolü vardır; bir Köylüye hiçbir zaman başka bir oyuncunun açılmamış rolü gönderilmez.
    category: authorization
    applies_to: VisibilityFilter
    trigger: Her görünüm
    logic: "rol alanı yalnızca kendi koltuğu, açılmış (revealed) koltuklar ve oyun sonunda herkes için dolar"
    violation: —
    source: FR4.2, NFR8
  - id: BR11.2
    statement: Yaşayan gulyabaniler birbirinin kimliğini ve gulyabani sohbetini görür; başka hiçbir oyuncuya bu bilgiler gitmez.
    category: authorization
    applies_to: VisibilityFilter
    trigger: Her görünüm
    logic: "IF alıcı gulyabani THEN diğer gulyabanilerin koltukları ve ghul kanalı eklenir"
    violation: —
    source: FR6.1, NFR8
  - id: BR11.3
    statement: Oylar ayar açıksa canlı, kapalıysa ancak oylama bitince oyunculara gönderilir.
    category: authorization
    applies_to: VisibilityFilter
    trigger: Oylama görünümü
    logic: "IF liveVotes THEN oy dağılımı herkese; ELSE tur kapanana kadar yalnızca moderatöre"
    violation: —
    source: FR9.1, NFR8
  - id: BR11.4
    statement: Açılan kartlar herkese gönderilir; oyun bitince bütün roller ve gece olay günlüğü herkese gönderilir.
    category: policy
    applies_to: VisibilityFilter
    trigger: revealResult, infaz, oyun sonu
    logic: "revealed koltukların rolü herkese; phase ended → tüm roller + nightLog herkese"
    violation: —
    source: FR7.1, FR11.2
  - id: BR11.5
    statement: Moderatör bütün rol eşleşmesini, gece işaretlerini, oyları ve gulyabani sohbetini görür.
    category: authorization
    applies_to: VisibilityFilter
    trigger: Her görünüm
    logic: "alıcı moderatörse tam görünüm"
    violation: —
    source: FR4.3, FR13.1

  # BR12 — Saklama ve sağlık
  - id: BR12.1
    statement: Oda, oyun, sohbet ve oturum verisi oda kurulduktan 24 saat sonra silinir; silinen odaya giriş "oda bulunamadı" ile reddedilir ve açık bağlantılar kapatılır.
    category: policy
    applies_to: Room, Match, ChatMessage, Session
    trigger: ExpirySweep çalışması (BR12.3)
    logic: "Süresi dolan oda silinmeden önce bile room_not_found sayılır (BR1.4). FOR süresi dolan her oda, odanın sırasında: C8 sırasıyla MatchFlow (oyunlar, biten Match'ler dahil) → ChatService (mesajlar) → ConnectionGateway (oturumlar; açık bağlantılara closed{room_not_found}) → RoomManager (oda) kendi purgeExpired(now)'ını çalıştırır. Odaya bağlanmamış oturumlar createdAt + 24 saatte silinir. Bir silme başarısız olursa diğerleri durmaz, hata sayılır, bir sonraki çalıştırmada yeniden denenir"
    violation: —
    source: FR20.4
  - id: BR12.2
    statement: Sağlık kontrolü adresi dışarıya yalnızca çalıştığını ve sürümü söyler; etkin oda ve etkin oyun sayısı yalnızca sunucunun kendi içinden sorulduğunda döner; sorun varsa 503 döner; kişisel veri içermez.
    category: policy
    applies_to: HealthStatus
    trigger: GET /healthz
    logic: "IF depoya ulaşılamıyor ya da açılış (son kayıttan yükleme ve açılış taraması, BR12.3) bitmedi THEN 503. ELSE 200 {status: ok, version}; IF isteğin kaynağı 127.0.0.1 THEN ayrıca {activeRooms, activeMatches}. Kaynak adres yalnızca bu karşılaştırma için o an okunur; saklanmaz ve günlüğe yazılmaz (BR10.4). status için ok dışında değer yoktur (C2). activeMatches yeni sürüm yükleme kuralının dayanağıdır (yalnızca 0 iken yüklenir)"
    violation: —
    source: NFR13
  - id: BR12.3
    statement: İskelette 24 saat silmesini U1'in küçük temizlik zamanlayıcısı (ExpirySweep) tetikler; program açılışında ve sonra 10 dakikada bir çalışır, böylece kapalıyken kaçırılan silmeler de açılışta yapılır.
    category: policy
    applies_to: ExpirySweep
    trigger: Program açılışı (son kayıttan yüklemeden sonra, bağlantı kabul edilmeden önce) ve 10 dakikada bir
    logic: "ExpirySweep yalnızca C8'deki U1 sahiplerinin purgeExpired(now)'ını çağırır; kendi verisi yoktur. Fiziksel silme en geç 15 dakika gecikir (10 dakika aralık + çalışma süresi). U7'de Housekeeping bu zamanlayıcının yerini alır ve kayıt/geri bildirim silmelerini ekler. (C8'deki 'fiziksel silme U7 ile gelir' notu, Teslim Planlaması B1 koruması ve Birim incelemesi R-02 ile U1'e öne alınmıştır.)"
    violation: —
    source: FR20.4

  # BR13 — Arayüz
  - id: BR13.1
    statement: Arayüzdeki bütün metinler Türkçedir ve koddan ayrı metin dosyasından gelir; red nedenleri error.<kod> anahtarıyla gösterilir.
    category: policy
    applies_to: WebClient, ContentCatalog.TextBundle
    trigger: Her ekran
    logic: "Kod içinde oyuncuya görünen metin bulunmaz"
    violation: —
    source: NFR11
  - id: BR13.2
    statement: Ekranlar mobil önceliklidir; 320 piksel genişlikte hiçbir ekranda yatay kaydırma gerekmez.
    category: constraint
    applies_to: WebClient
    trigger: Her ekran
    logic: "Düzen 320 px'ten başlayarak genişler"
    violation: —
    source: NFR10
  - id: BR13.3
    statement: Ekranlar WCAG 2.1 AA'ya uyar — kontrast, rengin yanında simge, büyük dokunma alanları, klavyeyle kullanım ve ekran okuyucu etiketleri (gece sırası için duyuru yapılmaz, BR4.7).
    category: constraint
    applies_to: WebClient
    trigger: Her ekran
    logic: "Normal metin kontrastı ≥ 4.5:1; dokunma alanı ≥ 44×44 px"
    violation: —
    source: NFR9
```

## Kural Özeti

| Grup | Kurallar | Konu |
|---|---|---|
| BR1 | BR1.1–BR1.6 | Oda kodu, moderatör, nick, giriş hataları, ana sayfa, oyun sürerken giriş |
| BR2 | BR2.1–BR2.5 | Oyuncu sayısı, moderatör yetkisi, lobide çıkarma, lobi görünümü, ayrılma komutu yok |
| BR3 | BR3.1–BR3.3 | Gulyabani sayısı, güvenli dağıtım, kart görme |
| BR4 | BR4.1–BR4.9 | Gece adımları, hedef kuralları, gulyabani ortak kararı, Uyku ekranı, gulyabani sohbeti, nightSelect U1'de beklenmez |
| BR5 | BR5.1–BR5.3 | Sabah anonsu, ölüm zinciri, gündüze geçiş |
| BR6 | BR6.1–BR6.11 | Geri sayım, oylama, eşitlik, son söz, onay oylaması, infaz, moderatör görünümü, oylamayı moderatör kapatır |
| BR7 | BR7.1–BR7.3 | Kazanma kontrolü, oyun sonu, yeni oyun |
| BR8 | BR8.1–BR8.3 | Moderatör ekranı, moderatörün kopması, elle duraklatmanın önceliği |
| BR9 | BR9.1–BR9.6 | Oturum, yeniden bağlanma, kopuk bilgisi, son bağlantı, şifreli bağlantı, saat |
| BR10 | BR10.1–BR10.8 | Komut doğrulama, oda sırası ve kalıcı işleme, hız sınırı, IP yok, oda kurma/katılma tekrarı, süre komutu, adım sürümü, duraklatmada komutlar |
| BR11 | BR11.1–BR11.5 | Alıcıya özel görünüm |
| BR12 | BR12.1–BR12.3 | 24 saatte silme, sağlık kontrolü, temizlik zamanlayıcısı |
| BR13 | BR13.1–BR13.3 | Türkçe metin dosyası, mobil öncelik, erişilebilirlik |
