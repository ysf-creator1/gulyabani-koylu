# Varlıklar — U2 Oda ve Lobi

Bu belge, U2'nin eklediği ve genişlettiği verileri tanımlar. Aşağıdaki yaml bloğu tek doğru kaynaktır; `functional-spec.md`'deki ilişki diyagramı buradan türetilir.

U1'in varlıkları geçerliliğini korur (`../../u1-walking-skeleton/functional-design/entities.md`). Bu parça yalnızca alan, değer ve varlık **ekler** (`contract-summary.md` "yalnızca ekleme" kuralı); var olan bir alanın anlamını değiştirmez. Teknolojiden bağımsızdır; mantıksal türler kullanılır.

## Sources

- Parça tanımı: `inception/units-generation/unit-of-work.md` (unit-of-work; U2 sınırları: RoomManager, ContentCatalog, GameRules, WebClient).
- Hikâye eşlemesi: `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map; US1.3, US1.5, US2.1, US7.2'nin U2 payı).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; AC1.3.x, AC1.5.x, AC2.1.x, AC7.2.2, AC7.2.3).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements):
  - FR1.6, FR2.2–FR2.8, FR3.1–FR3.6, FR9.2, FR17.2;
  - varsayımlar A7, A8, A10;
  - görünürlük tablosu.
- Yapı taşları: `inception/domain-design/components.md` (components).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary):
  - C1'e U2'nin eklediği komutlar ve neden kodları;
  - C4 rol kataloğu;
  - C5 `me.kind: waiting`, `room.settings`, `room.startBlock`, `isYoungest`.
- Etkileşim şartnamesi: `inception/refined-mockups/interaction-spec.md` ("Yeniden Katılma Kuralı", "Bekleyenler ve Odayı Kapatma").
- Sahip kararı: `functional-design-questions.md` Q1 = A (yeteneği henüz yazılmamış roller "Yakında" kilidiyle görünür).
- v0.1.1 sahip geri bildirimi: `room.leave` ve `Participant.status = left` (U1 code-summary "Sahip Geri Bildirimi Sonrası Değişiklikler").

```yaml
entities:
  - name: Room
    owner: RoomManager
    description: U1'deki oda; U2 kapatma anahtarı, rol havuzu, en genç işareti ve değiştirilebilir ayarları ekler.
    identifier: roomCode
    attributes_added:
      - { name: closedToNew, type: boolean, required: true, default: false, constraints: "açıkken yeni kişi lobiye ya da beklemeye giremez (BR14.5); yeni oyunda da açık kalır; oyunculara gönderilmez" }
      - { name: rolePool, type: RolePool, required: true, constraints: "oda kurulurken varsayılan ya da tarayıcının hatırladığı havuz (BR19.1); yalnızca lobide değişir (BR17.7)" }
      - { name: youngestParticipantId, type: id, required: false, references: Participant, constraints: "yalnızca settings.voteTieRule = youngest iken anlamlıdır; kural değişince, kişi çıkınca ya da moderatör olunca boşalır (BR15.4)" }
    constraints:
      - "Oyuncu sayısı (status active ya da waiting olan moderatör dışı katılımcılar) 26'yı geçemez (BR13.4)."
      - "settings ve rolePool yalnızca Room.status = lobby iken değişir; oyun başlarken GameState'e kopyalanır (BR16.4, BR17.7)."

  - name: Participant
    owner: RoomManager
    description: U1'deki katılımcı; U2 bekleme durumunu ve tarayıcı anahtarının özetini ekler.
    identifier: participantId
    attributes_added:
      - { name: status, type: enum, allowed_added: [waiting], constraints: "tam liste [active, waiting, kicked, left]; waiting = oyun sürerken ya da bitmişken gelen, 'Yeni oyun'da active olur (BR13.3, BR18.3); left v0.1.1 ile geldi (BR19.4)" }
      - { name: browserKeyHash, type: string, required: false, constraints: "tarayıcı anahtarının tek yönlü özeti (BR14.3); IP değildir; oda silinince silinir" }
    constraints:
      - "Moderatör hiçbir zaman waiting değildir."
      - "waiting katılımcıya oyun ve sohbet bilgisi gitmez (BR13.5)."

  - name: RoomSettings
    owner: RoomManager
    description: Odanın 17 oyun ayarı (FR2.6). U1'in 10 alanına 7 alan eklenir; hepsi lobide moderatörce değiştirilebilir olur.
    identifier: roomCode
    attributes:
      - { name: daySeconds, type: integer, required: true, default: 240, min: 60, max: 900, constraints: "ekranda dakika; 1–15 dk, dakika adımlı" }
      - { name: lastWordsSeconds, type: integer, required: true, default: 30, min: 10, max: 120 }
      - { name: confirmVoteSeconds, type: integer, required: true, default: 20, min: 10, max: 120 }
      - { name: ghulDecisionSeconds, type: integer, required: true, default: 90, min: 30, max: 300 }
      - { name: otherNightSeconds, type: integer, required: true, default: 60, min: 20, max: 300, constraints: "Görücü, Bekçi, Ürkek seçimleri (A1); U3'te kullanılır" }
      - { name: groomSeconds, type: integer, required: true, default: 30, min: 10, max: 120, constraints: "Celalli Damat seçimi; U3'te kullanılır" }
      - { name: noKillFirstNight, type: boolean, required: true, default: false }
      - { name: ghulTieRule, type: enum, required: true, allowed: [random, none], default: random }
      - { name: voteTieRule, type: enum, required: true, allowed: [revote, youngest], default: revote }
      - { name: liveVotes, type: boolean, required: true, default: true }
      - { name: abstainAllowed, type: boolean, required: true, default: false }
      - { name: ghostMode, type: boolean, required: true, default: true, constraints: "U4'te kullanılır" }
      - { name: dailyWord, type: boolean, required: true, default: false, constraints: "Boşboğaz Gulyabani; U3'te kullanılır" }
      - { name: timidChancePercent, type: integer, required: true, default: 50, min: 0, max: 100, constraints: "10'un katı; U3'te kullanılır" }
      - { name: timidRevealName, type: boolean, required: true, default: false, constraints: "U3'te kullanılır" }
      - { name: grievingDeadlineDay, type: integer, required: true, default: 2, min: 1, max: 4, constraints: "Dertli dert süresi (N. gündüzün sonu); U3'te kullanılır" }
      - { name: earlyEnd, type: boolean, required: true, default: true }
    constraints:
      - "Aralık dışı ya da türü yanlış bir değer hiçbir ayarı değiştirmez; komut settings_out_of_range ile reddedilir (BR16.2)."
      - "17 ayarın hepsi Ayarlar sekmesinde görünür; ilgili özelliği bu sürümde çalışmayan ayar varsayılanında kilitli kalır ve 'Yakında' etiketi taşır (FeatureAvailability; BR16.5)."

  - name: RolePool
    owner: RoomManager
    description: Moderatörün seçtiği rol havuzu (değer nesnesi). Gulyabani ve Köylü her zaman vardır; Köylü sayısı oyuncu sayısından kalan olarak hesaplanır.
    attributes:
      - { name: enabledSpecialRoleIds, type: set<roleId>, required: true, default: [], constraints: "ghul ve villager dışındaki roller; yalnızca katalogda var olan ve FeatureAvailability'de açık roller (BR17.2, BR17.8)" }
      - { name: ghulCountMode, type: enum, required: true, allowed: [auto, manual], default: auto, constraints: "auto: oyuncu sayısı değiştikçe önerilen sayıyı izler; moderatör adet seçicisine dokununca manual olur; ön ayar seçmek auto'ya döndürür (BR17.4)" }
      - { name: ghulCount, type: integer, required: true, min: 1, max: 26, constraints: "Boşboğaz dahil toplam gulyabani sayısı (FR3.3); auto iken önerilen sayıdır. U1'de GameState.ghulCount yalnızca önerilen tablodan geldiği için en fazla 5'ti (U1 entities.md GameState); U2 elle seçimle bu üst sınırı açıkça genişletir: GameState.ghulCount ≤ oyuncu sayısı (en çok 26). Rol sayısı oyuncu sayısını aşarsa başlatma pool_invalid ile engellenir (BR17.5)" }
      - { name: lastPresetId, type: enum, required: false, allowed: [beginner, classic, full_village], constraints: "yalnızca bilgi; anahtar değişince boşalır" }
    constraints:
      - "Deste = ghulCount gulyabani (Boşboğaz açıksa biri Boşboğaz) + her açık özel rolün copiesWhenEnabled adedi + kalan Köylüler (BR17.5)."

  - name: RoleDefinition
    owner: ContentCatalog
    description: C4 rol kataloğunun bir satırı. U1'in 2 rolüne 7 rol eklenir (9 rol, FR3.1). Kod değil veri.
    identifier: roleId
    attributes:
      - { name: roleId, type: enum, required: true, allowed: [ghul, villager, blabbermouth_ghul, watchman, timid, buddy, vengeful_groom, grieving, matchmaker] }
      - { name: name, type: textKey, required: true }
      - { name: side, type: enum, required: true, allowed: [ghuls, villagers], constraints: "Boşboğaz gulyabaniler; diğer özel roller köylüler" }
      - { name: sideIcon, type: enum, required: true, allowed: [claws, lantern] }
      - { name: shortText, type: textKey, required: true, constraints: "Rol Havuzu panelindeki kısa açıklama (FR3.1)" }
      - { name: cardImage, type: path, required: true, constraints: "küçük kart görseli; görseller U6'da gelir, U2'de yer tutucu simge kullanılır" }
      - { name: mandatory, type: boolean, required: true, constraints: "ghul ve villager true" }
      - { name: copiesWhenEnabled, type: integer, required: true, constraints: "buddy 2, diğerleri 1" }
      - { name: countsAsGhul, type: boolean, required: true, constraints: "ghul ve blabbermouth_ghul true; ghulCount'a dahil (FR3.3)" }
      - { name: presets, type: set<enum>, required: true, allowed: [beginner, classic, full_village] }
      - { name: fullVillageOrder, type: integer, required: false, constraints: "Dolu Köy'de sığdıkça açılma sırası (BR17.3)" }
      - "U1 alanları (abilityText, wakeTiming, winCondition, strategyTip, flavorText) aynen kalır."

  - name: FeatureAvailability
    owner: GameRules
    description: Bu sürümde kuralı yazılmış olan rollerin ve ayar özelliklerinin listesi (sahip kararı Q1 = A). Programla birlikte gelen sabit veridir; oda başına değildir.
    attributes:
      - { name: availableRoleIds, type: set<roleId>, required: true, constraints: "U2 sürümünde [ghul, villager]; U3 kalanları ekler" }
      - { name: availableFeatures, type: set<enum>, required: true, allowed: [other_night_steps, groom, ghost_mode, daily_word, timid, grieving], constraints: "U2 sürümünde boş" }
    constraints:
      - "Testler bütün rollerin ve özelliklerin açık olduğu bir listeyle de çalışır; kurallar listeyi parametre olarak alır (BR17.8)."

  - name: KickRecord
    owner: RoomManager
    description: Bir tarayıcının bir odadan art arda kaç kez çıkarıldığı ve yasağın bitişi (FR2.3, A8).
    identifier: "roomCode + browserKeyHash"
    attributes:
      - { name: roomCode, type: id, required: true, references: Room }
      - { name: browserKeyHash, type: string, required: true }
      - { name: consecutiveKicks, type: integer, required: true, min: 0, constraints: "lobide ya da beklemede çıkarılınca +1; o tarayıcı bir oyunda koltuk alınca 0 (BR14.2)" }
      - { name: bannedUntil, type: timestamp, required: false, constraints: "consecutiveKicks 2'ye ulaşınca şimdi + 30 dk; sonra sayaç 0'lanır" }
    constraints:
      - "Oda silinince birlikte silinir (24 saat kuralı, C8)."

  - name: StartCheck
    owner: GameRules
    description: "Oyunu Başlat"ın durumu (değer nesnesi); yalnızca moderatöre gider (C5 room.startBlock).
    attributes:
      - { name: blockReason, type: enum, required: false, allowed: [too_few_players, pool_invalid, room_expiring], constraints: "doluysa başlatma pasif" }
      - { name: blockDetail, type: object, required: false, constraints: "pool_invalid için {roleCount, playerCount}" }
      - { name: warnings, type: list<enum>, required: true, allowed: [few_players, unbalanced, youngest_unmarked] }
```

## Özet

- **Room** üç alan kazanır:
  - `closedToNew`: "Yeni isteklere kapat" anahtarı;
  - `rolePool`: rol havuzu;
  - `youngestParticipantId`: köyün en genci işareti.
- **Participant** iki şey kazanır:
  - `waiting` durumu: oyun sürerken ya da bitmişken gelen kişi;
  - `browserKeyHash`: çıkarma sayacı için tarayıcı tanıma özeti.
- **RoomSettings** 17 ayara çıkar. U3 ve U4'ün kullanacağı 7 ayar şimdiden saklanır ve doğrulanır. Ayarlar sekmesinde görünürler ama ilgili özellik çalışana kadar "Yakında" kilidiyle varsayılan değerlerinde kalırlar.
- **RolePool**, **RoleDefinition** (9 rol), **FeatureAvailability** ("Yakında" kilidi), **KickRecord** (30 dakika yasağı) ve **StartCheck** (başlatma engeli ve uyarılar) yeni varlıklardır.
- Kişisel veri: `browserKeyHash` rastgele bir tarayıcı anahtarının özetidir; IP ya da cihaz bilgisi değildir ve oda ile birlikte 24 saatte silinir (C-14, C-15).
