# Sözleşmeler — Gulyabani–Köylü (çalışma adı)

Bu belge, v1'in 8 parçasının (U1–U8) birbirleriyle ve dış dünyayla hangi biçimde konuştuğunu sabitler: sınırdan hangi veri geçer, hangi biçimde, hangi yolla ve bir şey ters gidince ne olur. Bütün parçalar tek bir sunucu programının içindedir (`unit-of-work.md`); bu yüzden parçalar arasındaki sözleşmeler ağ adresi değil, program içi arayüz, olay ve veri biçimidir. Dışarıya açık asıl sözleşme, tarayıcı (ve test botları) ile sunucu arasındaki canlı bağlantıdır. Kod içi adlar İngilizce, açıklamalar Türkçedir (team-practices Code Style).

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Parçalar: `inception/units-generation/unit-of-work.md` (unit-of-work; U1–U8, sorumluluklar, Ortak Kurallar).
- Parça bağımlılıkları ve bağlantı noktaları: `inception/units-generation/unit-of-work-dependency.md` (unit-of-work-dependency; bağımlılık bloğu ve "Parçalar Arası Bağlantı Noktaları" tablosu — her satır bir sözleşme adayıdır).
- Yapı taşları ve varlıklar: `inception/domain-design/components.md` (components; 13 yapı taşı, varlık sahipliği) ve `inception/domain-design/decisions.md` (ADR-002 tek süzgeç, ADR-004 kaydedilmeden kabul yok, ADR-005 tek yönlü bağımlılık ve olaylar, ADR-006 kayıtların ayrı tutulması).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; özellikle FR1.2, FR14, FR16, FR17, FR20, FR21, NFR1, NFR4, NFR5, NFR7, NFR8, NFR13, NFR14).
- [Q1]: `contract-design-questions.md` — yeni sürüm yalnızca hiç oyun sürmüyorken yüklenir (C). Diğer ayrıntılar sahibin kuralı gereği (project.md Corrections) benim seçtiğim varsayılanlardır ve özet onayıyla onaylandı (Looks correct).

## Sözleşme Tablosu

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---|---|---|---|
| C1 — Canlı bağlantı protokolü | U1 (ConnectionGateway) | External: tarayıcı (WebClient); BotPlayer testleri. U2–U8 yeni komut ve alan ekler | Şifreli WebSocket (WSS) üzerinde JSON mesajları — AsyncAPI | U1 |
| C2 — Web adresleri ve sağlık kontrolü | U1 (sayfa, link, sürüm); U8 (ölçüm alanları) | External: tarayıcı; sahibin yayın betiği ve izleme | HTTPS — OpenAPI | U1 (ölçüm alanları U8) |
| C3 — Kural arayüzü (GameRules) | U1 | U2, U3, U5 (yeni komut ve kural ekler); MatchFlow ve RoomManager çağırır | Program içi doğrudan çağrı — shared schema | U1 |
| C4 — İçerik kataloğu biçimi (ContentCatalog) | U1 | U2 (9 rol), U3 (kelime listesi), U6 (görsel ve Rehber); GameRules ve WebClient okur | Paylaşılan salt okunur veri — shared schema | U1 |
| C5 — Alıcıya özel görünüm (VisibilityFilter) | U1 | U3, U4, U5 yeni bilgi türü ekler; U8 tamamını sınar; C1 bunu taşır | Program içi saf çağrı — shared schema | U1 |
| C6 — Alan olayları | U1 (olay yolu ve temel olaylar) | U2–U5 olay ekler; ConnectionGateway (U1) ve EventRecorder (U7) dinler | Program içi olay — AsyncAPI | U1 |
| C7 — Kayıt olayı biçimi (EventRecorder girişi) | U7 | U1–U5 olaylarının kayda dönüşümü; U4 mesaj şikayeti | Olay → kalıcı kayıt — shared schema | U7 |
| C8 — Silme arayüzü | U1 (oda, oyun, sohbet, oturum sahipleri); U7 (kayıt ve geri bildirim sahipleri) | U7 (Housekeeping tetikler) | Program içi doğrudan çağrı — shared schema | U7 |
| C9 — Kalıcı depo düzeni | U1 | U2–U8 (her yapı taşı yalnızca kendi bölümüne yazar) | Paylaşılan depo, ayrık bölümler — shared schema | U1 |
| C10 — Sahibe rapor komutu | U7 (OwnerReport) | External: sahip (sunucuda komut satırı) | Komut satırı (CLI) | U7 |

Parçalar arası bağlantı noktalarının (`unit-of-work-dependency.md`) karşılığı: "Komut → yeni durum ve olaylar" = C3; "Rol tanımları" = C4; "Alıcıya özel görünüm" = C5; "Oda ve oyun olayları" = C6; "Kayıt olayları" ve "Mesaj şikayeti" = C6 + C7; "Silme tetikleri" = C8; "Ortak kalıcı veri deposu" = C9. Dış uçlar C1, C2 ve C10'dur.

---

## C1 — Canlı bağlantı protokolü

Tarayıcının ve BotPlayer'ın sunucuyla tek konuşma yolu. Her bağlı kişi tek bir şifreli WebSocket bağlantısı açar (`/ws`). İstemci yalnızca **komut** gönderir; sunucu yalnızca **onay** ve **görünüm** gönderir. Görünüm her değişiklikten sonra, o kişinin görmeye hakkı olan bilginin **tamamıdır** (C5); parça parça fark gönderilmez. Böylece yeniden bağlanan da, bir mesajı kaçıran da bir sonraki görünümle tam ve doğru ekrana döner (NFR4, ADR-005).

**Kurallar:**
- Bağlantı yalnızca `wss://` ile kabul edilir (NFR7). İlk mesaj `hello` olmak zorundadır; 10 saniye içinde gelmezse bağlantı kapatılır.
- **Oturum belirteci:** sunucu en az 256 bitlik tahmin edilemez bir belirteç üretir, yalnızca özetini (hash) saklar (components `Session.tokenHash`) ve belirteci yalnızca `welcome` mesajında bir kez gönderir; tarayıcı yerel depoda tutar (FR14.1).
- **Komut numarası:** her komutun istemcinin ürettiği tekil bir `commandId`'si vardır. Aynı numara ikinci kez gelirse yeniden işlenmez, ilk sonucun onayı (`duplicate`) döner. Kabul edilmiş komut numaraları oyun durumu ile birlikte kalıcı yazılır; sunucu yeniden başlasa da tekrar işlenmez (ADR-004, FR14.6).
- **Onay:** her komut için bir `ack` döner: `accepted`, `rejected` (+ `reasonCode`) ya da `duplicate`. `accepted` yalnızca durum kalıcı depoya yazıldıktan sonra gönderilir (ADR-004).
- **Neden kodları** dile bağlı değildir; ekranda gösterilecek Türkçe metin ContentCatalog'daki `error.<reasonCode>` anahtarından gelir (NFR11). Liste aşağıda; parçalar yalnızca yeni kod ekler.
- **Gece eşitliği:** gece bir adım değiştiğinde görünüm o odadaki herkese aynı anda gönderilir (yalnızca sırası gelene değil); böylece mesaj zamanlaması bile kimin uyandığını belli etmez (FR5.5).
- **İkinci sekme:** aynı oturumla yeni bir bağlantı gelince eski bağlantıya `superseded` gönderilir ve eski bağlantıdan gelen komutlar `session_superseded` ile reddedilir (FR14.7; U5 ekler, U1'de yalnızca son bağlantı geçerlidir).
- **Saat eşitleme:** her `view` ve `pong` mesajı `serverTime` taşır; istemci geri sayımı `deadline - (serverTime + yerel kayma)` ile çizer (FR14.8, NFR14).
- **Hız sınırı** (U8 ekler): mesaj gönderimi oyuncu başına 10 saniyede 5, oda koduyla katılma bağlantı başına dakikada 10; aşılırsa `rate_limited` (NFR7).
- **Sürüm ([Q1]):** `hello` içinde `appVersion` gelir. Sunucunun sürümü farklıysa sunucu `reload` gönderir, sayfa kendiliğinden yenilenir ve oturum belirteciyle aynı ekrana döner. Yeni sürüm yalnızca hiç oyun sürmüyorken yüklendiği için bu durum oyun ortasında oluşmaz (C2 `activeMatches` denetimi).
- **IP yok:** bağlantı anında IP'den yalnızca ülke çıkarılır ve IP bellekten atılır; hiçbir mesaja, olaya ya da kayda yazılmaz (FR20.2, C-14).

**Yeniden bağlanma (istemci):** bağlantı koparsa istemci 1, 2, 4, 8 saniye ve sonra en fazla 10 saniyede bir, küçük rastgele sapmayla yeniden dener; 60 saniyede bağlanamazsa FR14.2'deki uyarıyı gösterir ama arka planda denemeyi sürdürür. Onayı 5 saniyede gelmeyen komut aynı `commandId` ile yeniden gönderilir. İstemci 20 saniyede bir `ping` gönderir; sunucu 45 saniye hiçbir şey alamazsa bağlantıyı kopuk sayar ve C6 `connection.lost` olayını yayınlar.

```yaml
asyncapi: 2.6.0
info:
  title: Gulyabani live connection protocol (C1)
  version: "1"            # protocolVersion; yalnızca kırıcı değişiklikte artar
  description: >
    Tarayıcı (WebClient) ve BotPlayer ile ConnectionGateway arasındaki tek kanal.
    Mesajlar JSON; her mesajın "type" alanı vardır. Tanınmayan alanlar görmezden gelinir.
servers:
  production:
    url: "{host}/ws"
    protocol: wss
    variables:
      host:
        description: Ücretsiz Oracle sunucusunun dış adresi (C-04, C-10)
channels:
  /ws:
    publish:               # istemci -> sunucu
      operationId: clientToServer
      message:
        oneOf:
          - $ref: "#/components/messages/hello"
          - $ref: "#/components/messages/command"
          - $ref: "#/components/messages/ping"
    subscribe:             # sunucu -> istemci
      operationId: serverToClient
      message:
        oneOf:
          - $ref: "#/components/messages/welcome"
          - $ref: "#/components/messages/ack"
          - $ref: "#/components/messages/view"
          - $ref: "#/components/messages/pong"
          - $ref: "#/components/messages/reload"
          - $ref: "#/components/messages/superseded"
          - $ref: "#/components/messages/closed"
components:
  messages:
    hello:
      payload:
        type: object
        required: [type, protocolVersion, appVersion]
        properties:
          type: { const: hello }
          protocolVersion: { type: integer, example: 1 }
          appVersion: { type: string, description: "main üzerindeki sürüm etiketi, ör. v1.0.0" }
          sessionToken: { type: string, description: "varsa; yeni ziyaretçide yok" }
          roomCode: { type: string, pattern: "^[0-9]{6}$", description: "linkten geliyorsa" }
          deviceType: { type: string, enum: [phone, tablet, desktop] }
    welcome:
      payload:
        type: object
        required: [type, serverTime, protocolVersion]
        properties:
          type: { const: welcome }
          serverTime: { type: integer, description: "epoch ms" }
          protocolVersion: { type: integer }
          sessionToken: { type: string, description: "yalnızca yeni oturumda, bir kez" }
    command:
      payload:
        type: object
        required: [type, commandId, name]
        properties:
          type: { const: command }
          commandId: { type: string, format: uuid }
          name:
            type: string
            description: >
              Komut adı "<alan>.<eylem>" biçimindedir. U1 çekirdeği:
              room.create, room.join, lobby.startGame, lobby.kick, game.cardSeen,
              game.nightSelect, game.ghulMark, game.ghulConfirm, game.nextStep,
              game.revealResult, game.moveToVote, game.vote, game.timerExtend,
              game.pause, game.resume, game.newGame, chat.send.
              U2 ekler: lobby.setSettings, lobby.setRolePool, lobby.transferModerator,
              lobby.closeToNewRequests, lobby.markYoungest.
              U3 ekler: game.kickPlayer, game.secretWordCheck, game.groomSelect,
              game.lookThroughWindow.
              U4 ekler: chat.report.
              U5 ekler: moderator.acceptOffer, moderator.declineOffer,
              moderator.transfer, rejoin.request, rejoin.approve, rejoin.reject.
              U7 ekler: feedback.submit.
          args:
            type: object
            description: >
              Komuta özgü alanlar. Örnekler — room.join: {roomCode, nick};
              game.vote: {targetSeatId | null (çekimser)}; game.nightSelect: {targetSeatIds[]};
              game.timerExtend: {seconds}; chat.send: {channel: day|ghul|graveyard, text};
              chat.report: {messageId, note?}; feedback.submit: {kind: rating|suggestion|problem,
              rating?: bad|ok|good, text?, submissionKey}.
    ack:
      payload:
        type: object
        required: [type, commandId, status]
        properties:
          type: { const: ack }
          commandId: { type: string }
          status: { type: string, enum: [accepted, rejected, duplicate] }
          reasonCode: { $ref: "#/components/schemas/ReasonCode" }
    view:
      payload:
        type: object
        required: [type, viewVersion, serverTime, view]
        properties:
          type: { const: view }
          viewVersion: { type: integer, description: "alıcı başına artar; eski sürüm gelirse istemci yok sayar" }
          serverTime: { type: integer }
          view: { description: "C5 RecipientView" }
    ping:
      payload:
        type: object
        required: [type, clientTime]
        properties:
          type: { const: ping }
          clientTime: { type: integer }
    pong:
      payload:
        type: object
        required: [type, clientTime, serverTime]
        properties:
          type: { const: pong }
          clientTime: { type: integer }
          serverTime: { type: integer }
    reload:
      payload:
        type: object
        required: [type, reason]
        properties:
          type: { const: reload }
          reason: { type: string, enum: [version] }
    superseded:
      payload:
        type: object
        required: [type]
        properties:
          type: { const: superseded }
    closed:
      description: Sunucu bu bağlantıyı bilerek kapatırken son mesaj.
      payload:
        type: object
        required: [type, reasonCode]
        properties:
          type: { const: closed }
          reasonCode: { $ref: "#/components/schemas/ReasonCode" }
  schemas:
    ReasonCode:
      type: string
      description: >
        Ekranda error.<kod> metin anahtarıyla Türkçe gösterilir. Parçalar yalnızca kod ekler.
      enum:
        # U1
        - room_not_found          # FR1.5 (bulunamadı ya da süresi doldu)
        - room_full               # FR1.5, FR2.4
        - nick_invalid            # FR1.3 uzunluk
        - nick_taken              # FR1.3
        - too_few_players         # FR2.4
        - not_moderator
        - not_your_turn           # NFR7, AC13.5.1
        - invalid_target          # FR5.6, FR9.1
        - phase_closed            # süre dolmuş ya da adım geçmiş
        - chat_not_allowed        # FR16.1, FR9.3
        - message_empty           # FR16.2
        - message_too_long        # FR16.2
        - session_invalid
        - kicked                  # FR2.3, FR15.2
        - unsupported_protocol
        - internal_error          # hata sayılır, durum değişmez
        # U2
        - settings_out_of_range   # FR2.6
        - pool_invalid            # FR3.5
        - room_expiring           # FR17.2 (22 saat)
        - closed_to_new           # FR2.3
        - kick_banned             # FR2.3 (30 dakika)
        - waiting_full            # FR2.4
        # U4
        - nick_filtered           # FR1.4, FR16.3
        - report_own_message      # FR16.4
        # U5
        - session_superseded      # FR14.7
        - rejoin_pending          # US9.6
        - offer_closed            # FR14.5
        # U8
        - rate_limited            # NFR7
```

## C2 — Web adresleri ve sağlık kontrolü

Sayfayı, oda linkini, statik dosyaları ve sağlık kontrolünü veren normal şifreli web adresleri. Oda linki FR1.2'nin "paylaşılabilir link"idir.

**Kurallar:**
- Herkese açık `/healthz` yalnızca çalışıp çalışmadığını ve sürümü söyler. Sayılar (etkin oda, etkin oyun, bağlantı, hata) yalnızca sunucunun kendi içinden (`127.0.0.1`) sorulduğunda döner; dışarıya oyun trafiği bilgisi verilmez.
- **Yayın denetimi ([Q1]):** yayın betiği yeni sürümü yüklemeden önce sunucu içinden `/healthz` sorar; `activeMatches` 0 değilse yüklemez ve bekler. Ayrıntılı betik ortam ve dağıtım aşamalarında yazılır (team-practices Deployment, ISS-03).
- Hiçbir yanıt ve sunucu günlüğü IP içermez (C-14, NFR13).

```yaml
openapi: 3.0.3
info:
  title: Gulyabani web endpoints (C2)
  version: "1"
paths:
  /:
    get:
      summary: Ana sayfa (tek web uygulaması; KVKK bilgilendirmesi dahil, FR1.1)
      responses:
        "200": { description: HTML }
  /oda/{roomCode}:
    get:
      summary: Paylaşılabilir oda linki (FR1.2); aynı web uygulamasını açar, oda kodunu doldurur
      parameters:
        - name: roomCode
          in: path
          required: true
          schema: { type: string, pattern: "^[0-9]{6}$" }
      responses:
        "200": { description: HTML (oda yoksa uygulama C1 üzerinden room_not_found gösterir) }
  /static/{path}:
    get:
      summary: Betikler, stiller, kart görselleri (dosya adında sürüm özeti; uzun süre önbellek)
      parameters:
        - name: path
          in: path
          required: true
          schema: { type: string }
      responses:
        "200": { description: Dosya }
        "404": { description: Yok }
  /ws:
    get:
      summary: C1 canlı bağlantıya geçiş (WebSocket upgrade)
      responses:
        "101": { description: Protokol değişimi }
  /healthz:
    get:
      summary: Sağlık kontrolü (NFR13)
      responses:
        "200":
          description: Çalışıyor
          content:
            application/json:
              schema:
                type: object
                required: [status, version]
                properties:
                  status: { type: string, enum: [ok] }
                  version: { type: string, example: v1.0.0 }
                  activeRooms: { type: integer, description: "yalnızca sunucu içinden" }
                  activeMatches: { type: integer, description: "yalnızca sunucu içinden; yayın denetimi bunu okur" }
                  connections: { type: integer, description: "yalnızca sunucu içinden (U8)" }
                  errorCount: { type: integer, description: "yalnızca sunucu içinden (U8)" }
        "503": { description: Depoya ulaşılamıyor ya da açılış sürüyor }
```

## C3 — Kural arayüzü (GameRules)

Oyunun bütün kurallarını işleten saf modülün arayüzü (ADR-001). İnternet, ekran, saat ve veritabanı bilmez; saati ve rastgeleliği çağıran verir (NFR12, NFR15). U1 bu arayüzü sabitler; U2, U3 ve U5 yeni komut, yeni durum alanı ve yeni olay ekler ama imzayı değiştirmez.

**Kurallar:**
- Aynı durum, komut, saat ve rastgele kaynakla her çağrı aynı sonucu verir; kural testleri buna dayanır (team-practices Testing Posture, %90 kapsam).
- Geçersiz komut durumu değiştirmez ve bir neden kodu döner (AC13.5.1). Kural kodunda beklenmeyen bir hata `internal_error` olarak işlenir: durum değişmez, hata sayılır, oyun sürer.
- Ölüm zinciri ve kazanma kontrolü tek çağrının içinde biter (FR7.2, FR11.1); çağıran ara durum görmez.

```yaml
shared-schema: GameRules (C3)
version: 1
operations:
  validatePool:
    input: { pool: RolePool, playerCount: integer, catalog: CatalogSnapshot }
    output:
      ok: boolean
      blockReasonCode: ReasonCode?        # too_few_players | pool_invalid
      warnings: [few_players, unbalanced] # FR2.4, FR3.5
      recommendedGhulCount: integer       # FR3.3
  dealRoles:
    input: { pool: RolePool, participants: [participantId], random: RandomSource, catalog: CatalogSnapshot }
    output: { state: GameState, events: [DomainEvent] }   # FR4.1
  decide:
    input:
      state: GameState
      command: RuleCommand              # { name, actorSeatId | moderator, args }
      ctx: { now: epochMs, random: RandomSource, catalog: CatalogSnapshot }
    output:
      oneOf:
        - { ok: true, state: GameState, events: [DomainEvent] }
        - { ok: false, reasonCode: ReasonCode }
  legalActions:
    input: { state: GameState, seatId: string }
    output: [ { kind: string, targets: [seatId], deadline: epochMs? } ]
types:
  RandomSource: "nextInt(maxExclusive) -> integer; işletim sisteminin kriptografik kaynağından (NFR15); testte sabit tohumlu"
  GameState: "components.md GameState + Seat + NightAction + Vote + DeathRecord alanları; seri hâle getirilebilir (C9)"
  CatalogSnapshot: "C4 RoleDefinition listesi + SecretWordList; oyun başında alınır, oyun boyunca değişmez"
rules:
  - Saf: yan etki, ağ, depo, saat okuma yok.
  - Komut adları C1 komut adlarıyla aynıdır (game.*, lobby.startGame).
  - Yeni rol yeteneği yeni komut ve yeni olay ekler; var olan komutun anlamı değişmez.
```

## C4 — İçerik kataloğu biçimi (ContentCatalog)

Rollerin, kart metinlerinin ve görsellerinin, Rehber içeriğinin ve oyuncuya görünen bütün Türkçe metinlerin tek kaynağı (FR18.5, NFR11, NFR12). U1 yapıyı ve 2 rolü kurar; U2 9 rolü, U3 gizli kelime listesini, U6 görselleri ve Rehber içeriğini ekler. Yeni rol kod değil veri olarak eklenir.

**Kurallar:**
- Salt okunurdur; program açılırken yüklenir ve biçim denetiminden geçmezse program açılmaz (hatalı katalogla oyun başlamaz).
- Kimin hangi rolde olduğu hiçbir zaman katalogda bulunmaz (FR18.6).
- Kutu oyununun isim, metin ve görselleri bulunmaz (FR19.4, C-18).
- Her neden kodu (C1) ve her ekran metni için bir metin anahtarı bulunur; eksik anahtar CI testinde hata verir.

```yaml
shared-schema: ContentCatalog (C4)
version: 1
RoleDefinition:
  roleId: string            # ör. ghul, villager, loudmouth_ghul, watchman, timid, buddy, groom, troubled, matchmaker
  name: textKey
  side: enum [ghuls, villagers, independents]
  sideIcon: assetPath        # renk körlüğü için simge (FR19.2, NFR9)
  abilityText: textKey
  wakeTiming: enum [never, first_night, every_night, on_death]
  winCondition: textKey
  strategyTip: textKey
  flavorText: textKey
  frontImagePath: assetPath  # U6
  mandatory: boolean         # ghul ve villager: true (FR3.2)
  copiesWhenEnabled: integer # buddy: 2 (FR3.2), diğerleri 1
  presets: [beginner, classic, full_village]   # FR3.4
GuideArticle:                # U6
  articleId: string
  tab: enum [cards, how_to_play, moderator_guide]
  title: textKey
  body: textKey
  illustrationPaths: [assetPath]
  order: integer
SecretWordList:              # U3
  listId: string
  words: [string]            # en az 30 Türkçe kelime (A19)
TextBundle:
  locale: tr
  entries: { "<alan>.<öğe>": string }   # ör. "error.room_full": "Bu oda dolu."
```

## C5 — Alıcıya özel görünüm (VisibilityFilter)

Bir kişiye giden her oyun ve oda bilgisinin geçtiği tek süzgecin çıktısı (ADR-002, NFR8). C1'in `view` mesajı bu biçimi taşır. U1 kurar; U3 (Bekçi sonucu, gizli kelime, Ürkek uyarısı, rozetler), U4 (hayalet modu, Mezarlık Sohbeti) ve U5 (moderatör teklifi, yeniden katılma) yeni alan ekler; U8 bütün alanları her alıcı türü için sınar (US13.1).

**Kurallar:**
- Görmeye hakkı olmadığı bilgi kişiye **hiç** gitmez: alan boş ya da `null` olarak da gönderilmez, görünümde yer almaz.
- Bekleyen ve onayı bekleyen yeniden katılma isteği sahibi yalnızca `me` ve `room.status` alır; oyun ve sohbet bloğu gitmez (FR1.6, AC9.6.3).
- Gece, sırası gelmeyen herkesin `game` bloğu birbirinin aynısıdır (FR5.5); sırası gelenin farkı yalnızca `game.myAction` alanındadır.
- `moderator` bloğu yalnızca moderatöre gider; "kopuk" bilgisi yalnızca burada bulunur (FR14.3).
- Sohbet satırları kelime filtresinden geçmiş metinle gelir (FR16.3, U4); metin düz metindir, istemci biçimlendirme çalıştırmaz (FR16.2).

```yaml
shared-schema: RecipientView (C5)
version: 1
RecipientView:
  me:
    participantId: string
    nick: string
    kind: enum [player, moderator, waiting, pending_rejoin, spectator]  # spectator: yerine moderatör seçilen eski moderatör (U5)
    seatId: string?
    roleId: string?          # yalnızca kendi rolü (NFR8)
    alive: boolean?
    badges?: [ { kind: "lover | buddy", peerSeatId: string } ]   # U3; yalnızca ilgili iki oyuncu
  room:
    roomCode: string
    link: string
    status: enum [lobby, in_game, ended]
    moderatorNick: string
    participants: [ { participantId, nick, isYoungest: boolean? } ]   # isYoungest yalnızca kural seçiliyse (FR2.7)
    openRoleIds: [roleId]    # herkes görür (FR2.1)
    settings: object?        # U2; moderatöre tamamı, oyunculara oyunu etkileyenler
    startBlock?: { reasonCode, warnings }   # yalnızca moderatöre
  game:                      # bekleyene ve onay bekleyene hiç gitmez
    phase: enum [first_night, night, morning, day, voting, last_words, confirm_vote, ended]
    nightNumber: integer
    dayNumber: integer
    deadline: epochMs?
    paused: boolean
    pauseReason: enum [moderator, moderator_lost]?   # U5
    seats: [ { seatId, nick, alive, revealedRoleId: roleId?, roleId: roleId? } ]  # roleId yalnızca hakkı olana
    myAction?: { kind, targets: [seatId], deadline: epochMs }   # yalnızca sırası gelene
    ghulMarks?: [ { bySeatId, targetSeatId } ]   # yalnızca yaşayan gulyabaniler (FR6.2)
    votes?: [ { voterSeatId, targetSeatId } ]    # canlı oy açıksa herkes, değilse oylama bitince (FR9.1)
    accusedSeatId: string?
    morningResult?: { deadSeatIds: [seatId] }
    winners?: { sides: [side], extraSeatIds: [seatId] }   # FR11
    nightLog?: [ object ]    # moderatör; hayalet modunda ölüler; oyun sonunda herkes
    private: object?         # U3: watchmanResult, secretWord, timidWarning — yalnızca hak edene
  moderator:                 # yalnızca moderatöre (FR13)
    announcementTextKey: string
    expectedAction: string
    stepStatus: enum [waiting, done, timed_out, player_disconnected]
    allSeats: [ { seatId, nick, roleId, alive, badges, connected } ]
    notices: [ { textKey, params } ]   # ör. "hâlâ kopuk, çıkarılsın mı?" (FR14.4, U5)
  chat:
    channels:
      - channel: enum [day, ghul, graveyard]
        canWrite: boolean
        messages: [ { messageId, authorNick, text, sentAt, flagged: boolean? } ]   # flagged yalnızca moderatöre (FR13.3)
  offers?: [ { offerId, opensAt, expiresAt } ]   # U5; yalnızca teklif giden ölülere
```

## C6 — Alan olayları

Yapı taşlarının kabul edilmiş bir değişikliği duyurduğu program içi olay yolu (ADR-005). Olayı yayınlayan dinleyeni bilmez. ConnectionGateway her olaydan sonra ilgili odadaki herkese yeni görünüm ürettirir (C5) ve gönderir; EventRecorder olayları kayda dönüştürür (C7).

**Kurallar:**
- Olay, durum kalıcı depoya yazıldıktan sonra yayınlanır (ADR-004); yazılamayan değişikliğin olayı yoktur.
- Aynı odanın olayları üretildiği sırayla iletilir.
- Olaylarda IP adresi ve sohbet mesajı metni bulunmaz; mesaj için yalnızca `messageId` ve kanal taşınır (FR20.2, C-14).
- Bir dinleyicinin hatası diğerlerini durdurmaz; EventRecorder oyunu bekletmeyen bir sırayla dinler, sıra dolarsa en eski kayıt yazımı düşer ve hata sayılır (NFR13). ConnectionGateway bir görünümü gönderemezse sorun yoktur: bir sonraki tam görünüm onun yerini alır.

```yaml
asyncapi: 2.6.0
info:
  title: Gulyabani in-process domain events (C6)
  version: "1"
channels:
  domain-events:
    subscribe:
      message:
        payload:
          type: object
          required: [eventId, type, occurredAt, roomCode]
          properties:
            eventId: { type: string, format: uuid }
            type:
              type: string
              description: >
                U1: room.created, participant.joined, participant.left, participant.kicked,
                lobby.changed, match.started, card.seen, phase.changed, step.changed,
                night.actionTaken, vote.cast, death.occurred, match.ended, timer.extended,
                match.paused, match.resumed, connection.lost, connection.restored,
                chat.messageSent.
                U2: settings.changed, rolePool.changed, moderator.transferred, room.closedToNew.
                U3: ability.used, player.kickedInGame.
                U4: chat.messageFlagged.
                U5: moderator.lost, moderator.offerSent, moderator.offerAccepted,
                moderator.none, rejoin.requested, rejoin.approved, session.superseded.
                U7: feedback.submitted.
            occurredAt: { type: integer, description: "epoch ms" }
            roomCode: { type: string }
            matchId: { type: string }
            actor: { type: object, properties: { participantId: { type: string }, nick: { type: string } } }
            payload:
              type: object
              description: >
                Olaya özgü kimlikler ve sayılar (ör. death.occurred: {seatId, cause, chainOrder,
                revealedRoleId}; connection.lost: {participantId, deviceType, browser, country}).
                Sohbet metni ve IP asla bulunmaz.
```

## C7 — Kayıt olayı biçimi (EventRecorder girişi)

U7, C6 olaylarını FR20.1'deki kayıtlara dönüştürür ve mesaj şikayetinin kalıcı kaydını yazar (FR16.5). Kayıtlar oda verisinden ayrı tutulur ve oda silinse de 1 yıl durur (ADR-006).

**Kurallar:**
- **IP koruması:** bir kaydın herhangi bir metin alanı IPv4 ya da IPv6 biçimine benziyorsa kayıt reddedilir ve hata sayılır (C-14). Bunun otomatik testi vardır (FR20.1 kabul ölçütü).
- Sohbet içeriği kayda yazılmaz; tek istisna `MessageReportLog.messageText` ve `note`'tur, bunlar 1 ay sonra silinir (FR16.5).
- Kayıt yazımı oyunu yavaşlatmaz; yazılamazsa oyun sürer, hata sayılır (NFR13).

| C6 olayı | FR20.1 kaydı |
|---|---|
| room.created | Oda kurma |
| participant.joined / participant.left | Odaya giriş ve çıkış |
| match.started | Oyun başlangıcı (oyuncu sayısı, açık roller, ayarlar) |
| phase.changed | Faz geçişleri |
| vote.cast / night.actionTaken / ability.used | Oylar ve gece seçimleri |
| death.occurred | Ölümler ve nedenleri |
| match.ended | Oyun sonu (süre, kazanan taraf) |
| connection.lost / connection.restored | Kopma ve geri gelme (süresiyle) |
| match.paused / timer.extended / participant.kicked / player.kickedInGame / moderator.* | Moderatör işlemleri |
| feedback.submitted | Memnuniyet, öneri/şikayet, "Sorun bildir" |
| chat.messageFlagged | Mesaj şikayeti (MessageReportLog) |

```yaml
shared-schema: EventRecorder input (C7)
version: 1
LogEvent:
  eventId: string
  type: string               # C6 olay türü
  occurredAt: epochMs
  roomCode: string           # düz değer; Room'a başvuru değil
  nick: string?
  deviceType: enum [phone, tablet, desktop]?
  browser: string?
  country: string?           # ISO 3166-1 alpha-2
  payload: object            # sayılar ve kimlikler; metin yok
  retentionUntil: epochMs    # occurredAt + 1 yıl (FR20.3)
MessageReportLog:            # U4 olayı, U7 kaydı (FR16.5)
  reportLogId: string
  roomCode: string
  channel: enum [day, ghul, graveyard]
  messageText: string        # textPurgeAt'te silinir
  authorNick: string
  messageSentAt: epochMs
  reporterNick: string
  reportedAt: epochMs
  note: string?              # textPurgeAt'te silinir
  textPurgeAt: epochMs       # reportedAt + 1 ay
  retentionUntil: epochMs    # reportedAt + 1 yıl
validation:
  - rejectIfAnyStringMatches: ipv4_or_ipv6_pattern
```

## C8 — Silme arayüzü

Her verinin sahibi kendi verisini siler; Housekeeping (U7) yalnızca zamanında tetikler (ADR-006, Alan Tasarımı R-01'in U7'deki karşılığı, `unit-of-work.md`).

**Kurallar:**
- Her sahip `purgeExpired(now)` sunar; aynı çağrı tekrar tekrar ve program açılışında güvenle çalıştırılabilir (kaçırılan silmeler açılışta yapılır, FR20.4).
- **Süresi dolan veri hemen görünmez olur:** oda, kurulmasından 24 saat sonra fiziksel olarak silinmeden önce bile "bulunamadı" sayılır (FR1.5, FR20.4 kabul ölçütü). Fiziksel silme en geç 15 dakika gecikebilir.
- Silme sırası: önce bağlı veriler, sonra sahibi — MatchFlow (oyun) → ChatService (mesajlar) → ConnectionGateway (oturumlar) → RoomManager (oda). Kayıtlar ve geri bildirimler ayrı süreyle silinir.
- Bir silme başarısız olursa bir sonraki çalıştırmada yeniden denenir ve hata sayılır; diğer sahiplerin silmesi durmaz.

```yaml
shared-schema: Purgeable (C8)
version: 1
interface:
  purgeExpired:
    input: { now: epochMs }
    output: { deleted: integer, failed: integer }
owners:
  - { component: MatchFlow,         unit: U1, data: "Match, GameState, ModeratorOffer", rule: "odası silinen oyun" }
  - { component: ChatService,       unit: U1, data: "ChatMessage, MessageFlag",          rule: "odası silinen mesajlar (24 saat)" }
  - { component: ConnectionGateway, unit: U1, data: "Session",                           rule: "odası silinen oturumlar (24 saat)" }
  - { component: RoomManager,       unit: U1, data: "Room, Participant, RoomSettings, RolePool, KickRecord, RejoinRequest", rule: "createdAt + 24 saat" }
  - { component: EventRecorder,     unit: U7, data: "LogEvent, MessageReportLog",        rule: "1 yıl; şikayet metni ve notu 1 ay" }
  - { component: FeedbackService,   unit: U7, data: "Feedback",                          rule: "1 yıl" }
trigger:
  component: Housekeeping
  unit: U7
  schedule: "10 dakikada bir ve program açılışında"
```

Not: U1'den U7'ye kadar Housekeeping yoktur; U1'de odanın 24 saat sonra "bulunamadı" sayılması kuralı vardır ama fiziksel silme U7 ile gelir (`unit-of-work-dependency.md`: U7 → U5).

## C9 — Kalıcı depo düzeni

Bütün yapı taşları tek ücretsiz kalıcı depoyu paylaşır ama her biri yalnızca kendi bölümüne yazar ve okur; başka bir yapı taşının verisine doğrudan dokunmaz, onun arayüzünü çağırır (components Varlık Sahipliği). Depo ürünü ve oyun kaydının biçimi (tam durum ya da işlem günlüğü) NFR ve altyapı aşamalarında, U1 yazılmadan önce seçilir (ADR-004, ISS-02).

**Kurallar:**
- Bölüm adları yapı taşının önekiyle başlar; aşağıdaki tablo dışında yazma yoktur.
- Oyun kaydı sürüm numaralıdır: MatchFlow yeni durumu yalnızca beklediği sürüm üzerine yazar; çakışırsa komut reddedilir (`internal_error`) ve sayılır. Komut numaraları (C1) aynı yazımın içindedir.
- Hiçbir bölümde IP alanı yoktur (C-14).
- Depo biçimine yalnızca alan ve bölüm eklenir; var olan alanın anlamı değişmez (aşağıdaki kurallar).

```yaml
shared-schema: Storage layout (C9)
version: 1
namespaces:
  room_:     { owner: RoomManager,       unit: U1, holds: [Room, Participant, RoomSettings, RolePool, KickRecord, RejoinRequest] }
  match_:    { owner: MatchFlow,         unit: U1, holds: [Match, GameStateSnapshot, ModeratorOffer, processedCommandIds] }
  chat_:     { owner: ChatService,       unit: U1, holds: [ChatMessage, MessageFlag] }
  session_:  { owner: ConnectionGateway, unit: U1, holds: [Session] }
  log_:      { owner: EventRecorder,     unit: U7, holds: [LogEvent, MessageReportLog] }
  feedback_: { owner: FeedbackService,   unit: U7, holds: [Feedback] }
GameStateSnapshot:
  matchId: string
  version: integer           # her kabul edilen komutta +1
  state: serialized          # C3 GameState + Match alanları + bitiş zamanları (FR14.8)
  processedCommandIds: [string]   # son 500
  updatedAt: epochMs
write-rule: "yeni sürüm = beklenen sürüm + 1 değilse yazma reddedilir"
restore-rule: "açılışta her etkin oyun son kayıttan yüklenir; sayaçlar kalan süreyle sürer (FR14.6, NFR5: 1 dakika içinde hazır)"
```

## C10 — Sahibe rapor komutu

Sahibin sunucuda çalıştırdığı tek komut; ekranı yoktur (FR21.1). Kayıtları ve geri bildirimleri yalnızca okur.

```yaml
cli: gulyabani-report (C10)
version: 1
usage: "gulyabani-report --from YYYY-MM-DD --to YYYY-MM-DD [--out <dosya yolu>]"
arguments:
  from: { type: date, required: true, description: "dahil" }
  to:   { type: date, required: true, description: "dahil" }
  out:  { type: path, required: false, default: "rapor-<from>-<to>.md" }
output:
  format: Türkçe Markdown metin dosyası
  contents:                      # FR21.2
    - sayılan oyun sayısı
    - en az 6 oyunculu sorunsuz oyun sayısı
    - oyun süreleri (en kısa, ortalama, en uzun)
    - kopma sayısı
    - memnuniyet ortalaması ve geri bildirim sayısı
    - öneri/şikayet sayısı
    - mesaj şikayeti sayısı
  emptyValue: "veri yok"         # 0 yazılmaz
exitCodes:
  0: rapor yazıldı
  2: hatalı tarih ya da from > to
  3: depoya ulaşılamadı
privacy: "rapor nick, IP ya da mesaj metni içermez; yalnızca sayılar"
```

---

## Sözleşme Sahipliği ve Değişiklik Kuralları

- **Sahiplik:** her sözleşmenin sahibi tablodaki parçadır. Sahibi olmayan bir parça sözleşmeye yalnızca ekleme yapabilir (yeni komut, alan, olay türü, neden kodu, metin anahtarı); var olanı değiştiremez.
- **Yalnızca ekleme güvenlidir:** yeni alan eklenir; var olan alan silinmez, adı ve anlamı değişmez. Okuyan taraf tanımadığı alanı ve tanımadığı olay türünü görmezden gelir.
- **Kırıcı değişiklik:** bu kuralı bozan bir değişiklik gerekirse ilgili sözleşmenin `version` değeri artar ve değişiklik sahibin açık onayıyla yapılır (AI-DLC onay kapısı; team-practices Way of Working). C1'de bu `protocolVersion`'ın artması demektir.
- **Tarayıcı ile sunucu aynı sürümde çalışır ([Q1]):** yeni sürüm yalnızca hiç oyun sürmüyorken yüklenir (C2 yayın denetimi); eski sayfa bağlanırsa `reload` alır ve kendiliğinden yenilenir. Bu yüzden sunucunun eski istemci sürümlerini desteklemesi gerekmez.
- **Gizli bilgi:** her parça, sözleşmeye eklediği her yeni görünüm alanı için C5 kurallarını uygular ve o alanın gizli bilgi testini yazar (`unit-of-work.md` Ortak Kurallar, NFR8).
- **Doğrulama:** sözleşme biçimleri kod içinde tek bir ortak tanım dosyasında tutulur; WebClient, BotPlayer ve sunucu aynı tanımı kullanır. Bot oyunculu uçtan uca test (NFR12) gerçek C1 bağlantısı üzerinden çalıştığı için protokol kırılırsa test başarısız olur ve parça `main`'e eklenmez (team-practices Testing Posture).

## Açık Sorular

| Contract | Question | Blocks |
|---|---|---|
| C9 | Depo ürünü ve oyun kaydının biçimi (tam durum mu işlem günlüğü mü) | U1 (NFR ve altyapı aşamalarında seçilir; ISS-02, ADR-004) |
| C1, C5 | Her değişiklikte tam görünüm göndermek, 26 kişilik odada ve 50 odada (yaklaşık 1.350 bağlantı) 1 saniye hedefini karşılıyor mu; gerekirse görünümdeki sohbet geçmişi son N mesajla sınırlanır | U1 tasarımı; U8 yük testiyle ölçer (NFR1, NFR2) |
| C2 | Acil bir hata düzeltmesi oyun sürerken gerekirse: oyunların bitmesi mi beklenir, yoksa sahip onayıyla yine de yüklenip oyunlar kaldığı yerden mi sürdürülür (FR14.6 bunu korur) | Ortam kurulumu ve dağıtım aşamaları (ISS-03) |
| C2 | Sağlık kontrolünü dışarıdan izleyecek ücretsiz bir araç gerekecek mi; gerekirse ayrıntılı sayılar ona nasıl açılır | U8; izleme aşaması (ISS-03) |
| C4 | Küfür/hakaret listesinin kaynağı (DEP-04) ve gizli kelime listesinin içeriği (A19) | U4 (filtre), U3 (kelime listesi) |

## Assumptions & Open Questions

- [assumption] Telefon ağlarında şifreli WebSocket (443 numaralı kapıdan) engellenmez; yedek bağlantı yolu (ör. uzun sorgulama) v1'de yoktur. Bu, iskeletin gerçek telefon denemesinde (Wi-Fi ve mobil veri) doğrulanır (team-practices Walking Skeleton, NFR4).
- [assumption] Sayısal sınırlar (yeniden deneme aralıkları, 45 saniyelik kopukluk eşiği, son 500 komut numarası, 10 dakikalık silme aralığı, en fazla 15 dakika silme gecikmesi) benim seçtiğim varsayılanlardır; NFR Tasarımı'nda ölçümle değiştirilebilir ve değişmeleri sözleşmeyi bozmaz.
- [assumption] Komut adları, olay türleri ve neden kodları U1–U8 sorumluluklarından (`unit-of-work.md`) türetildi; parçaların Fonksiyonel Tasarım'ında ek alan ve kod çıkması beklenir ve "yalnızca ekleme" kuralıyla eklenir.
- Açık sorular yukarıdaki tablodadır; gereksinim belgesindeki diğer açık sorular (oyunun nihai adı ISS-01) sözleşmeleri etkilemez.
