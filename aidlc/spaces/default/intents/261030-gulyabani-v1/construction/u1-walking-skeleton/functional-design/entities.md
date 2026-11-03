# Varlıklar — U1 Yürüyen İskelet

Bu belge, yürüyen iskeletin (yalnızca Gulyabani ve Köylü ile oynanan en küçük tam oyun) kullandığı verileri tanımlar. Aşağıdaki yaml bloğu tek doğru kaynaktır; `functional-spec.md`'deki ilişki diyagramı buradan türetilir. Varlık adları ve sahiplikleri Alan Tasarımı'ndaki yapı taşlarıyla (`components.md`) aynıdır; iskelet her varlığın yalnızca kendi kullandığı alanlarını tanımlar, sonraki parçalar yalnızca alan ekler (`contract-summary.md` "yalnızca ekleme" kuralı). Teknolojiden bağımsızdır; mantıksal türler kullanılır.

## Sources

- Parça tanımı: `inception/units-generation/unit-of-work.md` (unit-of-work; U1 sınırları ve sorumlulukları).
- Hikâye eşlemesi: `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map; U1'in 20 satırı ve çok parçalı hikâyelerin U1 payı).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US1.1, US1.2, US1.4, US2.2, US3.1–US3.3, US4.1, US4.2, US5.1–US5.4, US7.1, US7.2, US9.1, US13.1, US13.3–US13.5).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; FR1–FR9, FR11, FR13, FR14, FR16, FR17, FR20, NFR4, NFR7, NFR8, NFR11, NFR14).
- Yapı taşları ve varlık sahipliği: `inception/domain-design/components.md` (components).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 komutları, C3 kural arayüzü, C5 görünüm, C8 silme, C9 depo bölümleri).
- Teslim Planlaması: `inception/delivery-planning/bolt-plan.md` (B1 korumaları: sağlık kontrolü, hız sınırı, 24 saatte silme).
- Özet onayı: `functional-design-questions.md` (Looks correct; iskelet varsayılanları).

```yaml
entities:
  - name: Room
    owner: RoomManager
    description: Bir arkadaş grubunun oyun odası; 24 saat yaşar.
    identifier: roomCode
    attributes:
      - { name: roomCode, type: string, required: true, unique: true, constraints: "6 haneli rakam; etkin odalar arasında benzersiz" }
      - { name: createdAt, type: timestamp, required: true }
      - { name: expiresAt, type: timestamp, required: true, constraints: "createdAt + 24 saat; yeni oyunla değişmez" }
      - { name: status, type: enum, required: true, allowed: [lobby, in_game, ended], default: lobby, constraints: "C5 room.status ile aynı adlar; kalıcı yazılmaz, currentMatchId ve Match.status'tan türetilir (currentMatchId yok → lobby; Match running → in_game; Match ended → ended)" }
      - { name: currentMatchId, type: id, required: false, references: Match, constraints: "lobby.startGame'in kesinleşme noktası; game.newGame ile boşalır" }
      - { name: moderatorParticipantId, type: id, required: true, references: Participant }
      - { name: version, type: integer, required: true, min: 1, constraints: "oda kaydının sürümü; oda düzeyindeki her kabul edilen komutta +1; yalnızca beklenen sürüm üzerine yazılır (BR10.2, C9 write-rule)" }
      - { name: processedCommandIds, type: list<string>, required: true, constraints: "oda düzeyindeki komutların (room.create, room.join, lobby.kick, lobby.startGame, game.newGame) son 500 numarası; oda kaydıyla aynı yazımda saklanır (BR10.2)" }
    constraints:
      - "Bir odada aynı anda en fazla bir oyun (Match) sürer."
      - "expiresAt geçen oda, fiziksel olarak silinmeden önce bile hiçbir komutu ve hello'yu kabul etmez, room_not_found döner (BR12.1, C8)."
      - "Oda kodu yalnızca 'kayıt yoksa yaz' koşuluyla ayrılır; çakışırsa yeni kod üretilir (BR1.1)."
    relationships:
      - { to: Participant, cardinality: "1..27", direction: "Room has Participants (26 oyuncu + 1 moderatör)" }
      - { to: RoomSettings, cardinality: "1", direction: "Room has RoomSettings" }
      - { to: Match, cardinality: "0..1 etkin", direction: "Room hosts Match" }
      - { to: ChatMessage, cardinality: "0..*", direction: "Room has ChatMessages" }

  - name: Participant
    owner: RoomManager
    description: Odadaki bir kişi (oyuncu ya da moderatör).
    identifier: participantId
    attributes:
      - { name: participantId, type: id, required: true, unique: true }
      - { name: roomCode, type: id, required: true, references: Room }
      - { name: nick, type: string, required: true, min: 2, max: 16, constraints: "baştaki ve sondaki boşluklar atılmış hâli" }
      - { name: normalizedNick, type: string, required: true, constraints: "Türkçe küçük harfe çevrilmiş nick; oda içinde benzersiz" }
      - { name: status, type: enum, required: true, allowed: [active, kicked], default: active, constraints: "U1'de ayrılma komutu yoktur (C1); ayrılma durumu sonraki parçalarda yalnızca ekleme olarak gelir (BR2.5)" }
      - { name: sessionId, type: id, required: true, references: Session, constraints: "bu katılımcıyı oluşturan oturum; aynı oturum ikinci bir katılımcı oluşturamaz (BR10.5)" }
      - { name: joinedAt, type: timestamp, required: true }
    constraints:
      - "Moderatör de bir Participant'tır ama oyuncu sayısına ve hedef listelerine girmez."
      - "Bir oturuma en fazla bir etkin Participant bağlıdır (BR10.5)."
    relationships:
      - { to: Session, cardinality: "0..1 geçerli", direction: "Participant is represented by Session" }
      - { to: Seat, cardinality: "0..1 oyun başına", direction: "Participant plays as Seat" }

  - name: RoomSettings
    owner: RoomManager
    description: Odanın oyun ayarları. İskelette ayar ekranı yoktur; değerler sabit varsayılanlardır (U2 değiştirilebilir yapar).
    identifier: roomCode
    attributes:
      - { name: daySeconds, type: integer, required: true, default: 240 }
      - { name: lastWordsSeconds, type: integer, required: true, default: 30 }
      - { name: confirmVoteSeconds, type: integer, required: true, default: 20 }
      - { name: ghulDecisionSeconds, type: integer, required: true, default: 90 }
      - { name: noKillFirstNight, type: boolean, required: true, default: false }
      - { name: ghulTieRule, type: enum, required: true, allowed: [random, none], default: random }
      - { name: voteTieRule, type: enum, required: true, allowed: [revote, youngest], default: revote }
      - { name: liveVotes, type: boolean, required: true, default: true }
      - { name: abstainAllowed, type: boolean, required: true, default: false }
      - { name: earlyEnd, type: boolean, required: true, default: true }
    constraints:
      - "Oyun başlarken GameState.settingsSnapshot'a kopyalanır; oyun sırasında değişmez."

  - name: Match
    owner: MatchFlow
    description: Bir odada oynanan tek oyunun akış kaydı (fazlar, sayaçlar, duraklatma, kalıcı sürüm).
    identifier: matchId
    attributes:
      - { name: matchId, type: id, required: true, unique: true }
      - { name: roomCode, type: id, required: true, references: Room }
      - { name: gameId, type: id, required: true, references: GameState }
      - { name: status, type: enum, required: true, allowed: [running, ended], default: running }
      - { name: paused, type: boolean, required: true, default: false }
      - { name: pauseReason, type: enum, required: false, allowed: [moderator, moderator_lost], constraints: "C5 adlarıyla aynı; moderator = elle duraklatma, moderator_lost = moderatör kopuk (BR8.2, BR8.3)" }
      - { name: moderatorConnected, type: boolean, required: true, default: true, constraints: "elle duraklatma sürerken moderatör koparsa pauseReason değişmez, yalnızca bu alan false olur (BR8.3)" }
      - { name: activeDeadline, type: Deadline, required: false, constraints: "o anki adımın bitiş zamanı (sunucu saati); süresi olmayan adımlarda boş (Faz Bitirme Tablosu)" }
      - { name: remainingOnPause, type: integer, required: false, constraints: "duraklatılınca kalan saniye" }
      - { name: lastStepChangeAt, type: timestamp, required: true, constraints: "stepVersion'ın son arttığı an; kopma duraklatmasının başlangıcını hesaplamakta kullanılır (BR8.2)" }
      - { name: persistedVersion, type: integer, required: true, min: 1, constraints: "her kabul edilen oyun komutunda +1; yalnızca beklenen sürüm üzerine yazılır (C9)" }
      - { name: processedCommandIds, type: list<string>, required: true, constraints: "bu oyunun game.* ve system.deadlineReached komutlarının son 500 numarası (C1, C9)" }
      - { name: startedAt, type: timestamp, required: true }
      - { name: endedAt, type: timestamp, required: false }
    constraints:
      - "Biten Match (status ended) game.newGame'den sonra silinmez; oda silinene kadar salt okunur kalır, komut numaraları aranmaya devam eder (BR10.2)."
      - "Room.currentMatchId'nin göstermediği running Match açılışta yarım kalmış başlatma sayılır ve silinir (BR10.2)."

  - name: GameState
    owner: GameRules
    description: Oyunun kural durumu; GameRules'un saf fonksiyonlarının girdisi ve çıktısı (C3).
    identifier: gameId
    attributes:
      - { name: gameId, type: id, required: true, unique: true }
      - { name: phase, type: enum, required: true, allowed: [first_night, night, morning, day, voting, last_words, confirm_vote, ended], constraints: "C5 game.phase ile birebir aynı adlar; kart görme ilk gecenin ilk adımıdır (stepCursor card_reveal)" }
      - { name: nightNumber, type: integer, required: true, min: 1, default: 1 }
      - { name: dayNumber, type: integer, required: true, min: 0, default: 0 }
      - { name: stepCursor, type: enum, required: false, allowed: [card_reveal, ghul_meet, ghul_kill], constraints: "first_night ve night içinde hangi adımda olunduğu; diğer fazlarda boş" }
      - { name: stepStatus, type: enum, required: false, allowed: [waiting, done, timed_out, player_disconnected], constraints: "C5 moderator.stepStatus ile aynı; gece adımının durumu" }
      - { name: stepVersion, type: integer, required: true, min: 1, constraints: "faz ya da adım her değiştiğinde +1; moderatörün ilerletme komutları ve sistem süre komutu bu sayıyı taşır (BR10.6, BR10.7)" }
      - { name: dayTimerExpired, type: boolean, required: true, default: false, constraints: "gündüz süresi doldu hatırlatması (BR6.2); süre uzatılınca ya da devam edilince yeniden hesaplanır" }
      - { name: settingsSnapshot, type: RoomSettings, required: true }
      - { name: ghulCount, type: integer, required: true, min: 1, max: 5 }
      - { name: voteRound, type: enum, required: false, allowed: [initial, revote, confirm] }
      - { name: revoteCount, type: integer, required: true, min: 0, max: 2, default: 0, constraints: "gün başına; yeni gün başında 0" }
      - { name: accusedSeatId, type: id, required: false, references: Seat }
      - { name: tiedSeatIds, type: list<id>, required: false, constraints: "yeniden oylamada oy alabilecekler" }
      - { name: pendingDeaths, type: list<id>, required: false, constraints: "sabah açıklanmayı bekleyen ölümler" }
      - { name: winners, type: enum, required: false, allowed: [villagers, ghuls] }
      - { name: nightLog, type: list<string>, required: true, constraints: "oyun sonunda herkese açılan gece olay günlüğü (metin anahtarları ve koltuk numaraları)" }
    relationships:
      - { to: Seat, cardinality: "3..26", direction: "GameState has Seats" }
      - { to: NightAction, cardinality: "0..*", direction: "GameState records NightActions" }
      - { to: Vote, cardinality: "0..*", direction: "GameState records Votes" }
      - { to: DeathRecord, cardinality: "0..*", direction: "GameState records DeathRecords" }

  - name: Seat
    owner: GameRules
    description: Bir oyuncunun bu oyundaki yeri, rolü ve yaşam durumu.
    identifier: seatId
    attributes:
      - { name: seatId, type: id, required: true, unique: true }
      - { name: gameId, type: id, required: true, references: GameState }
      - { name: participantId, type: id, required: true, references: Participant }
      - { name: nick, type: string, required: true }
      - { name: roleId, type: enum, required: true, allowed: [ghul, villager], constraints: "iskelette yalnızca iki rol; U2 dokuzuna çıkarır" }
      - { name: alive, type: boolean, required: true, default: true }
      - { name: deathCause, type: enum, required: false, allowed: [night_kill, execution] }
      - { name: cardSeen, type: boolean, required: true, default: false }
      - { name: revealed, type: boolean, required: true, default: false, constraints: "kartı herkese açıldı mı" }

  - name: NightAction
    owner: GameRules
    description: Bir gece adımında bir oyuncunun işareti ya da kilitlenmiş ortak karar.
    identifier: actionId
    attributes:
      - { name: actionId, type: id, required: true, unique: true }
      - { name: gameId, type: id, required: true, references: GameState }
      - { name: nightNumber, type: integer, required: true, min: 1 }
      - { name: step, type: enum, required: true, allowed: [ghul_mark, ghul_decision] }
      - { name: actorSeatId, type: id, required: false, references: Seat, constraints: "ghul_decision için boş" }
      - { name: targetSeatId, type: id, required: false, references: Seat, constraints: "boş = kimse kaçırılmaz" }
      - { name: timedOut, type: boolean, required: true, default: false }

  - name: Vote
    owner: GameRules
    description: Gündüz oylamasında bir oyuncunun oyu.
    identifier: voteId
    attributes:
      - { name: voteId, type: id, required: true, unique: true }
      - { name: gameId, type: id, required: true, references: GameState }
      - { name: dayNumber, type: integer, required: true, min: 1 }
      - { name: round, type: enum, required: true, allowed: [initial, revote, confirm] }
      - { name: roundIndex, type: integer, required: true, min: 0, max: 2 }
      - { name: voterSeatId, type: id, required: true, references: Seat }
      - { name: targetSeatId, type: id, required: true, references: Seat, constraints: "voterSeatId'den farklı, yaşayan; abstainAllowed kapalıyken boş (çekimser) oy kabul edilmez (BR6.5)" }
    constraints:
      - "Aynı oylama turunda bir oyuncunun tek geçerli oyu vardır; yeni oy eskisinin yerine geçer."

  - name: DeathRecord
    owner: GameRules
    description: Bir ölüm ve ölüm zincirindeki sırası.
    identifier: deathId
    attributes:
      - { name: deathId, type: id, required: true, unique: true }
      - { name: gameId, type: id, required: true, references: GameState }
      - { name: seatId, type: id, required: true, references: Seat }
      - { name: cause, type: enum, required: true, allowed: [night_kill, execution] }
      - { name: phase, type: enum, required: true, allowed: [night, day] }
      - { name: chainOrder, type: integer, required: true, min: 1 }
      - { name: revealedRoleId, type: enum, required: true, allowed: [ghul, villager] }

  - name: Session
    owner: ConnectionGateway
    description: Bir tarayıcının odadaki kişiyi temsil eden oturumu. IP içermez.
    identifier: sessionId
    attributes:
      - { name: sessionId, type: id, required: true, unique: true }
      - { name: tokenHash, type: string, required: true, unique: true, constraints: "en az 256 bitlik belirtecin özeti; belirtecin kendisi saklanmaz" }
      - { name: createdAt, type: timestamp, required: true, constraints: "belirteçsiz hello'da açılır (C1 welcome belirteci bir kez verir)" }
      - { name: roomCode, type: id, required: false, references: Room, constraints: "room.create ya da room.join kabul edilince dolar; bir kez dolunca değişmez" }
      - { name: participantId, type: id, required: false, references: Participant, constraints: "roomCode ile aynı anda dolar (BR10.5)" }
      - { name: activeConnectionId, type: id, required: false, constraints: "iskelette son bağlantı geçerlidir" }
      - { name: connected, type: boolean, required: true, default: true }
      - { name: lastSeenAt, type: timestamp, required: true }
      - { name: deviceType, type: enum, required: true, allowed: [phone, tablet, desktop] }
      - { name: browser, type: string, required: true }
      - { name: country, type: string, required: false, constraints: "bağlantı anında çıkarılır; IP saklanmaz" }
      - { name: revoked, type: boolean, required: true, default: false }
    constraints:
      - "Odaya bağlanmamış oturum createdAt + 24 saatte, odaya bağlı oturum odasıyla birlikte silinir (BR12.1, C8)."

  - name: ChatMessage
    owner: ChatService
    description: Gündüz ya da gulyabani sohbetindeki bir mesaj.
    identifier: messageId
    attributes:
      - { name: messageId, type: id, required: true, unique: true }
      - { name: roomCode, type: id, required: true, references: Room }
      - { name: channel, type: enum, required: true, allowed: [day, ghul], constraints: "graveyard kanalı U4'te eklenir" }
      - { name: authorParticipantId, type: id, required: true, references: Participant }
      - { name: authorNick, type: string, required: true }
      - { name: text, type: string, required: true, min: 1, max: 300, constraints: "düz metin; biçimlendirme çalıştırılmaz" }
      - { name: sentAt, type: timestamp, required: true }
      - { name: commandId, type: string, required: true, unique: true, constraints: "mesajı oluşturan chat.send komutunun numarası; aynı numara ikinci mesaj oluşturmaz (BR10.2)" }

  - name: RateCounter
    owner: ConnectionGateway
    description: Hız sınırı için bellekte tutulan kayan pencere sayacı; kalıcı yazılmaz, IP içermez.
    identifier: "subjectId + kind"
    attributes:
      - { name: subjectId, type: id, required: true, constraints: "chat_send için participantId (yeniden bağlanınca sıfırlanmaz); room_join için connectionId (C1)" }
      - { name: kind, type: enum, required: true, allowed: [chat_send, room_join] }
      - { name: hits, type: list<timestamp>, required: true, constraints: "pencere içindeki deneme zamanları" }

value_objects:
  - name: Deadline
    description: Bir adımın sunucu saatine göre bitiş zamanı (FR14.8).
    attributes:
      - { name: endsAt, type: timestamp, required: true }
      - { name: totalSeconds, type: integer, required: true }
  - name: RoleDefinition
    owner: ContentCatalog
    description: Katalogdaki rol tanımı; iskelette yalnızca ghul ve villager.
    attributes:
      - { name: roleId, type: enum, allowed: [ghul, villager] }
      - { name: side, type: enum, allowed: [ghuls, villagers] }
      - { name: nameKey, type: string, constraints: "Türkçe metin anahtarı" }
      - { name: iconKey, type: string }
  - name: HealthStatus
    owner: ConnectionGateway
    description: Sağlık kontrolü cevabı (C2); kişisel veri içermez. Sorun varsa bu cevap yerine 503 döner (BR12.2).
    attributes:
      - { name: status, type: enum, allowed: [ok], constraints: "C2 ile aynı; başka değer yoktur" }
      - { name: version, type: string }
      - { name: activeRooms, type: integer, min: 0, constraints: "yalnızca sunucunun kendi içinden (127.0.0.1) gelen isteğe" }
      - { name: activeMatches, type: integer, min: 0, constraints: "yalnızca sunucunun kendi içinden (127.0.0.1) gelen isteğe; yayın denetimi bunu okur" }
```

## Sözleşme Adlarıyla Eşleme (C5)

Durum adları görünüm sözleşmesindeki (C5) adlarla birebir aynıdır; aşağıdaki tablo görünümün bu alanları nasıl taşıdığını gösterir. Sözleşmeye yapılan eklemeler "yalnızca ekleme" kuralına uyar.

| Varlık alanı | C5 alanı | Not |
|---|---|---|
| `Room.status` (`lobby`, `in_game`, `ended`) | `room.status` | Türetilmiş; aynı adlar |
| `GameState.phase` | `game.phase` | Aynı adlar; ilk gece `first_night`, sonraki geceler `night` |
| `stepCursor = card_reveal` | `game.phase = first_night` + her oyuncuya `game.myAction.kind = see_card` | Kart görme ilk gecenin ilk adımıdır; herkesin `game` bloğu aynıdır, yalnızca `me.roleId` kişiye özeldir. Süresi olmayan adımlarda (`see_card`, `ghul_meet`) `myAction.deadline` gönderilmez (**C5'e ekleme:** bu alan isteğe bağlı olur) |
| oylama turları | oy verebilen her yaşayan oyuncuya `game.myAction.kind = vote` | `targets` yeniden oylamada yalnızca eşitlerdir |
| `stepCursor = ghul_meet` / `ghul_kill` | yaşayan gulyabanilere `game.myAction.kind = ghul_meet` / `ghul_mark` | Diğer herkes Uyku ekranını görür (BR4.7) |
| `GameState.stepStatus` | `moderator.stepStatus` | Aynı adlar |
| `GameState.stepVersion` | `moderator.stepVersion` | **C5'e ekleme** (U1): yalnızca moderatöre gider; ilerletme komutları bu sayıyı geri yollar (BR10.7) |
| `GameState.dayTimerExpired` | `moderator.notices` içinde `day.move_to_vote_reminder` | Yeni alan gerekmez |
| `Match.paused`, `Match.pauseReason` (`moderator`, `moderator_lost`) | `game.paused`, `game.pauseReason` | Aynı adlar; C5'te U5 diye işaretli alan U1'de kullanılmaya başlanır (ekleme) |

## Özet

- **Oda tarafı (RoomManager):** `Room`, `Participant`, `RoomSettings`. Oda 24 saat yaşar; moderatör de bir katılımcıdır ama oyuncu sayılmaz. Ayarlar iskelette sabit varsayılanlardır. Oda kendi sürüm numarasını ve oda düzeyindeki komut numaralarını tutar (oyun yokken gelen komutların tekrar koruması).
- **Oyun tarafı (MatchFlow, GameRules):** `Match` akışı, sayaçları, kalıcı sürümü ve oyun komutlarının numaralarını tutar; `GameState`, `Seat`, `NightAction`, `Vote`, `DeathRecord` kural durumudur. İskelette rol yalnızca `ghul` ya da `villager`'dır. Faz ve adım adları görünüm sözleşmesiyle (C5) aynıdır.
- **Bağlantı tarafı (ConnectionGateway):** `Session` yalnızca belirtecin özetini tutar ve en fazla bir katılımcıya bağlanır; `RateCounter` bellekte yaşar. Hiçbir varlıkta IP alanı yoktur.
- **Sohbet (ChatService):** `ChatMessage` iki kanallıdır (gündüz, gulyabani); Mezarlık Sohbeti U4'te eklenir.
- **Değer nesneleri:** `Deadline` (sunucu saatine göre bitiş), `RoleDefinition` (katalog), `HealthStatus` (sağlık kontrolü).
