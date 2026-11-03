# Kod Üretimi Planı — U1 Yürüyen İskelet

## Summary

- Builds: Yalnızca Gulyabani ve Köylü ile baştan sona oynanan en küçük tam oyun (sunucu, ekranlar, bot testi) ve Oracle sunucusuna yayın betikleri
- Touches: `package.json` ve araç ayarları, `src/` (shared, rules, server, web), `content/`, `tests/u1/`, `scripts/`, `.github/workflows/`, `infra/`, `.gitignore`
- Tests: ~110 test — kural birim testleri (önce yazılır), sunucu birim ve entegrasyon testleri, ekran testleri, bot oyunculu uçtan uca test, 320 px erişilebilirlik taraması

## Sources

- Parça tanımı ve hikâyeler: `inception/units-generation/unit-of-work.md` (U1), `inception/units-generation/unit-of-work-story-map.md` (U1 hikâyeleri ve parça içi yapım sırası), `inception/delivery-planning/bolt-plan.md` (B1 kapsamı, korumalar, bitti tanımı).
- Gereksinimler: `inception/requirements-analysis/requirements.md`.
- Fonksiyonel tasarım: `construction/u1-walking-skeleton/functional-design/functional-spec.md` (akışlar A1–A14, komut yönlendirme ve faz bitirme tabloları, durum makineleri), `rules.md` (BR1–BR13), `entities.md`.
- Sözleşmeler: `inception/contract-design/contract-summary.md` (C1–C9) ve tasarım aşamalarının "Kod Üretimi'ne devreden hizalamaları".
- NFR: `nfr-requirements/tech-stack-decisions.md` (TypeScript, Node.js 24, `ws`, `better-sqlite3`, `zod`, Preact + Vite, Vitest, Playwright + axe), `nfr-design/*.md` (performance, security, reliability, scalability, observability, logical-components).
- Altyapı: `infrastructure-design/infrastructure-specification.md`, `cicd-pipeline.md`, `monitoring-design.md`; inceleme bulguları `infrastructure-design/reviews/review-01.md`.
- Ekip ve proje kuralları: `memory/team.md` (Testing Posture, Way of Working, Code Style), `memory/project.md` (Forbidden, Mandated).

## Çalışma Düzeni

- Kod, `main`'den açılan geçici `bolt/b1-walking-skeleton` dalında yazılır (team.md Way of Working). Parça onaylanınca `scripts/merge-bolt.sh b1-walking-skeleton` ile tek commit olarak `main`'e eklenir.
- Kod içi adlar İngilizce, kod yorumları Türkçe; oyuncuya görünen her metin `content/tr.json`'da (team.md Code Style).
- Bu parçanın testleri `tests/u1/` altındadır; sonraki parçalar kendi `tests/u<n>/` klasörlerini açar (parçaya özel test komutu için).
- Önceden yapılmış iş: sunucu hazırlığı sırasında (2026-11-02, sahibin "ikisini birlikte yap" kararıyla) `.nvmrc` (24.22.2) ve `infra/` altındaki `Caddyfile`, `gulyabani.service`, `journald-gulyabani.conf`, `sshd-gulyabani.conf`, `provision.sh`, `run-provision.sh` yazıldı ve sunucuda çalıştırıldı. Adım 21 bunları korur ve eksikleri ekler.

## Adımlar

### Adım 1: Proje iskeleti ve üretim ayarları
- [x] `bolt/b1-walking-skeleton` dalını aç.
- [x] `package.json` (sürüm `0.1.0`, `"type": "module"`, `engines.node` `.nvmrc` ile aynı; betikler: `dev`, `build`, `build:server`, `build:web`, `typecheck`, `lint`, `format:check`, `test`, `test:e2e`, `test:a11y`, `verify`), `package-lock.json`.
- [x] Bağımlılıklar: çalışma zamanı `ws`, `better-sqlite3`, `zod`, `preact`; geliştirme `typescript`, `vite`, `@preact/preset-vite`, `vitest`, `@vitest/coverage-v8`, `@testing-library/preact`, `happy-dom`, `eslint`, `typescript-eslint`, `prettier`, `@playwright/test`, `@axe-core/playwright`, `tsx`, `@types/ws`, `@types/better-sqlite3`, `@types/node`.
- [x] `tsconfig.json` (sıkı mod), `tsconfig.server.json` (sunucu derlemesi → `dist/server/`), `vite.config.ts` (web → `dist/web/`, içerik özetli dosya adları, Brotli ve gzip kopyaları), `.prettierrc`, `.prettierignore`, `eslint.config.js` (yasaklar: `socket.remoteAddress`, `X-Forwarded-For`/`Forwarded` okuma, `dangerouslySetInnerHTML`, kodda Türkçe oyuncu metni).
- [x] `.gitignore`'a ekleme (sahibin dosyası; yalnızca satır eklenir): `node_modules/`, `dist/`, `coverage/`, `reports/`, `test-results/`, `playwright-report/`, `.deploy.env`.
- Hikâye: US13.3, US13.5 (yapı) · Gereksinim: NFR11, NFR12.3

### Adım 2: Test koşucusunun hazırlanması
- [x] `vitest.config.ts`: `tests/**/*.test.ts(x)` (uçtan uca hariç), v8 kapsam; eşikler tüm kodda satır %80, `src/rules/**` satır %90 (gevşetilmez).
- [x] `vitest.e2e.config.ts`: yalnızca `tests/**/*.e2e.test.ts`, tek iş parçacığı, uzun zaman aşımı.
- [x] `playwright.config.ts`: Chromium, 320 px görüntü alanı, açık ve koyu tema.
- [x] Bir duman testi (`tests/u1/setup.test.ts`) ile `npx vitest run tests/u1/` komutunun çalıştığını göster; komut `unit-test-instructions.md`'de.
- Gereksinim: NFR12.1, NFR12.3

### Adım 3: Ortak şemalar ve içerik kataloğu (önce kod, sonra test)
- [x] `src/shared/`: C1 mesajları (`hello`, `ping`, `room.*`, `lobby.*`, `game.*`, `chat.send`; `ack`, `view`, `closed`), neden kodları (C1 ReasonCode + U1 eklemeleri `step_waiting`, `game_paused`, `server_busy`), C5 `FilteredView` türleri, `stepVersion` alanları — hepsi `zod` ile.
- [x] `content/roles.json` (Gulyabani, Köylü; özgün metinler, C-18) ve `content/tr.json` (iskelet ekranlarının bütün metinleri, her neden kodu, anonslar, KVKK bilgilendirmesi).
- [x] `src/content/catalog.ts`: katalog yükleme ve C4 biçim denetimi.
- [x] Testler: `tests/u1/shared/schemas.test.ts`, `tests/u1/content/catalog.test.ts` (eksik `tr.json` anahtarı testi kırar — NFR11.1; kodda gömülü Türkçe metin taraması).
- Hikâye: US13.3, US13.5 · Gereksinim: NFR7.5, NFR11.1, C1, C4

### Adım 4: Kural modülü — önce testler (kırmızı)
- [x] `src/rules/types.ts`: `GameState`, `RuleCommand` (aktörde `system`), `Decision`, `RulesContext` (saat ve rastgelelik dışarıdan) — yalnızca türler, davranış yok.
- [x] Testleri yaz: `tests/u1/rules/dealRoles.test.ts` (gulyabani sayısı BR3.1, 3–26 oyuncu BR2.1/BR2.2, kriptografik rastgelelik arayüzü BR3.2), `night.test.ts` (adım sırası BR4.1–BR4.3, hedef listesi BR4.4, işaretler ve oybirliği onayı BR4.5, süre dolunca çoğunluk/eşitlik/kimse BR4.6, `game.nightSelect` → `not_your_turn` BR4.9), `morning.test.ts` (BR5.1–BR5.3, ölüm zinciri yapısı), `voting.test.ts` (oy, kapatma, eşitlik ve en fazla 2 yeniden oylama BR6.5–BR6.7, son söz ve onay oylaması BR6.8, infaz BR6.9), `win.test.ts` (Köylüler / Gulyabaniler, erken bitiş BR7.1), `legalActions.test.ts` (geçersiz komut reddi AC13.5.1, `stepVersion` BR10.7, duraklatma BR10.8, `system.deadlineReached` BR10.6).
- [x] `npx vitest run tests/u1/rules/` çalıştır; testlerin **başarısız** olduğunu gör ve çıktıyı `code-summary.md` için not al.
- Hikâye: US2.2, US3.1, US3.3, US4.1, US4.2, US5.2, US5.3, US7.1, US13.5

### Adım 5: Kural modülü — kod (yeşil) ve düzenleme
- [x] `src/rules/` saf kod: `dealRoles.ts`, `night.ts`, `morning.ts`, `voting.ts`, `win.ts`, `decide.ts`, `legalActions.ts`, `index.ts` (C3 `dealRoles`, `decide`, `legalActions`, `enterNight`). Ağ, depo, saat ve rastgelelik yok.
- [x] Testler yeşil; `src/rules/**` satır kapsamı ≥ %90; testler yeşilken düzenle.
- Hikâye: Adım 4 ile aynı · Gereksinim: C3, NFR12.1, NFR15.1

### Adım 6: Görünüm süzgeci (VisibilityFilter)
- [x] `src/server/visibility/filter.ts`: alıcı türüne göre (oyuncu, gulyabani, ölü, moderatör) `FilteredView`; izin listesiyle alan ekleme; gece ekranları sırası gelmeyenler için aynı.
- [x] Testler: `tests/u1/server/visibility.test.ts` — köylüye başka oyuncunun açılmamış rolü, gulyabani kimlikleri, gulyabani sohbeti, işaretler gitmez; gulyabaniler birbirini görür; moderatör her şeyi görür; oylar ayara göre (BR11.1–BR11.5, NFR8.1).
- Hikâye: US13.1, US3.2, US5.4

### Adım 7: Kalıcı depo (StoreWriter ve bölümler)
- [x] `src/server/store/migrations/001_init.sql` (`room_`, `match_`, `chat_`, `session_` tabloları; yalnızca ekleme kuralı), `writerWorker.ts` (yazım iş parçacığı: WAL, `synchronous=FULL`, `secure_delete=ON`, toplu işlem + geri alma noktaları, açılış yüklemesi, bütünlük denetimi, bozuk dosyayı kenara alma), `storeClient.ts` (ana iş parçacığı tarafı), bölüm başına depo sınıfları (`roomRepo`, `matchRepo`, `chatRepo`, `sessionRepo`; tam durum kaydı + sürüm + son 500 komut numarası, TD-03).
- [x] Testler: `tests/u1/server/store.test.ts` — yazılmadan kabul yok, toplu işlemde bir komutun hatası ötekileri bozmaz, açılışta durum geri gelir, sürüm artar, tekrar numarası bulunur, silinen veri dosyada kalmaz (NFR7.14), depoda IP deseni yok (NFR7.11).
- [x] `scripts/check-migrations.ts`: göç dosyalarında `DROP`/`RENAME`/sütun silme yok (NFR5.10).
- Hikâye: US13.5, US9.1 · Gereksinim: C9, NFR1.3, NFR5.1, NFR5.9, NFR5.10, BR10.2

### Adım 8: Oda yönetimi (RoomManager)
- [x] `src/server/room/`: 6 haneli kriptografik oda kodu ve link (BR1.1), 24 saatlik ömür (BR1.2), nick kuralları ve benzersizlik (BR1.3), katılma denetim sırası (BR1.4, BR1.6), oturum başına bir kez kurma/katılma (BR10.5), lobide çıkarma (BR2.3), başlatma (BR2.2 → MatchFlow), "Yeni oyun"la lobiye dönüş (BR7.3), boş lobi süresi ve bağlanmayan oturum (BR12.4).
- [x] Testler: `tests/u1/server/roomManager.test.ts`.
- Hikâye: US1.1, US1.2, US1.4, US7.2

### Adım 9: Oyun akışı (MatchFlow ve süre zamanlayıcısı)
- [x] `src/server/match/`: fazlar ve adımlar (Faz Bitirme Tablosu), moderatör adımları, oyun başına tek zamanlayıcı ve sunucu bitiş zamanı (FR14.8), uzatma ve duraklatma (BR6.3), `system.deadlineReached`, moderatör kopunca duraklatma ve kalan sürenin doğru hesabı (BR8.2, BR8.3), açılışta geciken süreler (NFR5.2), `system.connectionLost`/`connectionRestored`.
- [x] Testler: `tests/u1/server/matchFlow.test.ts` (sahte saatle).
- Hikâye: US3.1, US3.2, US4.1, US5.1, US5.3, US5.4

### Adım 10: Sohbet (ChatService)
- [x] `src/server/chat/chatService.ts`: gündüz ve gulyabani kanalları; yazma izinleri (gece kapalı, son sözde yalnızca sanık ve moderatör, onay oylamasında kapalı, ölüler okur), 300 karakter ve düz metin (BR6.4), bellekte 100 / depoda 2.000 mesaj.
- [x] Testler: `tests/u1/server/chatService.test.ts`.
- Hikâye: US5.1, US3.3

### Adım 11: Bağlantı kapısı, oda sırası ve gönderim
- [x] `src/server/gateway/`: `publicHttp.ts` (`/`, `/oda/{kod}`, `/static/*` izin listesi, önbellek ve güvenlik başlıkları, CSP `unsafe-inline` yok, genel `/healthz` yalnızca `status`+`version`, `/ws` geçişinde `Origin` denetimi, 403/503), `internalHttp.ts` (127.0.0.1:8081 iç `/healthz`: `activeRooms`, `activeMatches`, `connections`, `errorCount`, `commandsTotal`, `commandsUnder150Ms`, `commandInternalErrors`), `wsGateway.ts` (`hello` ve oturum belirteci, mesaj doğrulama, 45 sn sessizlikte kopuk, sunucu saati eşitlemesi), `rateLimiter.ts` (dakikada 10 oda kodu denemesi, 10 sn'de 5 mesaj ve genel sınırlar), `roomQueue.ts` (oda başına tek sıra, tekrar denetimi, sıra üst sınırı → `server_busy`), `viewDispatcher.ts` (gönderim turu, aynı görünümü atlama, gecede herkese eşit gönderim, tampon sınırı).
- [x] Testler: `tests/u1/server/gateway.test.ts`, `rateLimiter.test.ts`, `roomQueue.test.ts`, `http.test.ts` (başlıklar, CSP, iç uç dışarıdan kapalı, `X-Forwarded-For` okunmaz).
- Hikâye: US9.1, US13.4, US13.5 · Gereksinim: NFR7.1–NFR7.9, NFR7.12, NFR13, NFR14

### Adım 12: Temizlik, ölçüm, günlük ve program girişi
- [x] `src/server/ops/`: `config.ts` (ortam değişkenleri: `PUBLIC_ORIGIN`, `PORT_PUBLIC`, `PORT_INTERNAL`, `DATA_DIR`, `APP_VERSION`, `NODE_ENV`; sır yok), `expirySweep.ts` (açılışta ve 10 dakikada bir; C8 sırası: oyun → sohbet → oturum → oda; açık bağlantılar `room_not_found` ile kapanır), `metrics.ts`, `logger.ts` (JSON, alan beyaz listesi; IP ve mesaj metni yok).
- [x] `src/server/main.ts`: açılış, iki dinleyici, planlı kapanış (SIGTERM ≤ 5 sn), `--check-config` (ortam + katalog denetimi, dinleyici açmadan 0/1 kodu).
- [x] Testler: `tests/u1/server/expirySweep.test.ts` (24 saat sonra her şey silinir — project.md Mandated, C-15), `logger.test.ts` (günlükte IP deseni yok — project.md Forbidden, C-14), `main.test.ts` (`--check-config`, kapanış süresi).
- Hikâye: US13.4, US13.5 · Gereksinim: BR12.1–BR12.4, NFR5.3, NFR7.11, NFR8.4

### Adım 13: Sunucu entegrasyon testleri
- [x] `tests/u1/server/integration.test.ts`: gerçek süreçte (geçici veri klasörü) `ws` istemcileriyle oda kurma → katılma → başlatma; yeniden bağlanınca tam görünüm ve onaylanmamış komutun bir kez işlenmesi (BR9.4, BR10.2); süreç yeniden başlayınca durum depodan gelir; `room.create` yeniden gönderilince ikinci oda yok (BR10.5).
- Hikâye: US9.1, US13.5

### Adım 14: Ekranlar — tasarım belirteçleri, bağlantı ve uygulama kabuğu
- [x] `src/web/index.html`, `src/web/styles/` (Ayrıntılı Taslakların tasarım belirteçleri; açık/koyu tema; hareket azaltma; satır içi stil yok), `src/web/net/connection.ts` (yeniden bağlanma: 1, 2, 4 sn sonra her 4 sn, 0–500 ms sapma, "ağ geldi"/"sayfa görünür"de hemen; onay bekleyen komutları aynı numarayla yeniden gönderme; 60 sn uyarısı), `src/web/net/clock.ts` (sunucu saati farkı), `src/web/i18n.ts` (`tr.json`), `src/web/app.tsx` (yönlendirme, bağlantı şeridi, "Tekrar oyundasın", kibar duyuru alanı).
- [x] Testler: `tests/u1/web/connection.test.ts`, `clock.test.ts`, `app.test.tsx`.
- Hikâye: US9.1, US13.3, US13.4

### Adım 15: Ekranlar — oyuncu ekranları
- [x] `src/web/screens/`: ana sayfa (KVKK bilgilendirmesi), giriş, lobi, kart görme (dokun-aç/kapat, "Gördüm"), Uyku, gulyabani eylem paneli (hedef listesi, canlı işaretler, "Kararı Onayla", gulyabani sohbeti), sabah, gündüz (geri sayım, sohbet), oylama, son söz, onay oylaması, oyun sonu. Her etkileşimli öğede `data-testid`; 44x44 px dokunma alanı; renk + simge; klavye ve görünür odak.
- [x] Testler: `tests/u1/web/screens.test.tsx` (her ekran doğru görünümle çizilir, düğmeler doğru komutu gönderir, duyuru alanı faz değişimini söyler, gece sırası duyurulmaz).
- Hikâye: US1.1, US1.2, US1.4, US2.2, US3.2, US3.3, US4.1, US5.1, US5.2, US5.3, US7.2, US13.3

### Adım 16: Ekranlar — moderatör ekranı
- [x] `src/web/screens/moderator/`: faz/adım, anons metni, beklenen işlem ve durumu, kalan süre, "Sonraki Adım"/"Sonucu Açıkla"/"Oylamaya geç"/"Oylamayı kapat", oyuncular (rol, yaşam, "kopuk"), oy ayrıntısı, gece olay günlüğü, gulyabani sohbeti; telefonda dört sekme, bilgisayarda sütunlar; uzatma ve duraklatma.
- [x] Testler: `tests/u1/web/moderator.test.tsx`.
- Hikâye: US5.4, US3.1

### Adım 17: Bot oyuncular ve uçtan uca test
- [x] `tests/bots/botPlayer.ts`, `tests/bots/moderatorDriver.ts` (C1 istemcisi; ortak şemaları kullanır).
- [x] `tests/u1/e2e/fullGame.e2e.test.ts`: test başında kendinden imzalı sertifika, gerçek sunucu süreci ve gerçek şifreli bağlantı; bot moderatör + 3 ve 8 bot oyuncu; oyun kazananla biter; köylü botlarına giden mesajlarda yasak alan 0; gece görünümleri aynı; sayaçlar sunucu saatine uyar; ortasında bir botun bağlantısı koparılıp geri gelir. Rapor: `reports/e2e-summary.json` (yalnızca bot nickleri ve sayılar).
- [x] `npm run verify`: Vitest (kapsam eşikleriyle) + uçtan uca test + kısa rapor. **Construction doğrulama komutu önerisi.**
- Hikâye: US7.1, US13.1, US13.4, US9.1 · Gereksinim: NFR12.2, NFR8.2, NFR8.3, A14

### Adım 18: Erişilebilirlik taraması ve web paketi denetimleri
- [x] `tests/u1/a11y/screens.a11y.spec.ts`: Playwright + axe; iskelet ekranları 320 px'te, iki temada; ciddi/kritik bulgu 0.
- [x] `scripts/check-bundle.ts`: derlenmiş betik + stil gzip toplamı ≤ 150 KB; derlenmiş HTML'de `style` özniteliği ve `<style>` yok.
- Hikâye: US13.3 · Gereksinim: NFR1.6, NFR7.9, NFR9.1, NFR10.1

### Adım 19: CI ve sürüm iş akışları
- [x] `.github/workflows/ci.yml`: `checks`, `verify` (x64 + ARM64 matrisi), `web`, `security` (npm audit, audit signatures, gitleaks); tetikleyiciler `push` (`main`, `bolt/**`) ve `workflow_call` (inceleme bulgusu); eylemler commit numarasıyla sabit; yetki `contents: read`.
- [x] `.github/workflows/release.yml`: `guard` → `ci.yml` yeniden kullanımı → `bundle` (ARM64; `npm prune --omit=dev`; SHA-256; paket denemesi: `--check-config`, iki `/healthz`, CSP, `scripts/smoke.ts`, SIGTERM ≤ 10 sn) → `publish` (v0.x ön sürüm).
- Gereksinim: NFR7.8, NFR7.10, NFR12.1

### Adım 20: Birleştirme, yayın ve geri alma betikleri
- [x] `scripts/merge-bolt.sh` (dal temiz ve güncel, baş commit'te yeşil CI, squash, geçici dalı silme).
- [x] `scripts/smoke.ts` (bir bot oda kurar, ikinci bot katılır, ikisi de `ack accepted`).
- [x] `scripts/deploy.sh vX.Y.Z` (indir + özet → `activeMatches` 0 bekle → yükle → `--check-config` → yeniden denetim → bağ değişimi + yeniden başlatma; **ilk yayında hizmeti etkinleştirir** → 60 sn sağlık → dış kontrol → otomatik geri alma; 3 sürüm tut). İnceleme bulgusu: dış kontrol başarısızsa önce sunucunun kendi içinden aynı kontrol yapılır; içeride geçiyorsa geri alma yerine "sahibin ağı" uyarısı verilir.
- [x] `scripts/rollback.sh` (inceleme bulgusu: yeniden başlatmadan önce `activeMatches` 0 beklenir).
- [x] Testler: `tests/u1/scripts/smoke.test.ts` (yerel sunucuya karşı), betikler için `bash -n` sözdizimi denetimi.
- Gereksinim: NFR5.4, NFR5.10, team.md Deployment

### Adım 21: Sunucu kurulum dosyaları
- [x] Mevcut `infra/` dosyalarını koru; `infra/oracle-setup.md` (Türkçe adım adım: hesap, VCN, güvenlik listesi 22/80/443, makine, 1 USD bütçe uyarısı, DuckDNS kaydı; bu kurulumdaki Frankfurt sapmasını ve 4 OCPU/24 GB makineyi yaz).
- [x] Caddy günlüğünde IP alanları başından siliniyor (inceleme bulgusu; `infra/Caddyfile` filtre ayarı). Hizmet ilk yayına kadar etkinleştirilmiyor (inceleme bulgusu; `provision.sh`).
- Gereksinim: NFR7.1, NFR7.2, NFR7.11, NFR7.13

### Adım 22: Belgeler ve izlenebilirlik
- [x] Türkçe kod yorumları; `content/tr.json` anahtar listesi; `code-summary.md`, `source-manifest.json`, `traceability.json` (Infrastructure Design incelemesinde json'da eksik kalan NFR5.8, NFR11.1, NFR12.1, NFR12.3, NFR13.5, NFR13.7 burada izlenir).

## Hikâye → Adım Eşlemesi

| Hikâye | Adımlar |
|---|---|
| US1.1 Oda kurma | 8, 15 |
| US1.2 Odaya katılma | 8, 15 |
| US1.4 Lobi ve başlatma | 4, 5, 8, 15 |
| US2.2 Rol dağıtımı ve kart | 4, 5, 15 |
| US3.1 Gece adımları | 4, 5, 9, 16 |
| US3.2 Uyku ekranı | 6, 9, 15 |
| US3.3 Gulyabani ortak kararı | 4, 5, 10, 15 |
| US4.1 Sabah | 4, 5, 9, 15 |
| US4.2 Ölüm zinciri (U1 payı) | 4, 5 |
| US5.1 Gündüz ve sohbet | 9, 10, 15 |
| US5.2 Oy ve eşitlik | 4, 5, 15 |
| US5.3 Son söz, onay, infaz | 4, 5, 9, 15 |
| US5.4 Moderatör ekranı (U1 payı) | 6, 9, 16 |
| US7.1 Kazanan (U1 payı) | 4, 5, 17 |
| US7.2 Oyun sonu ve yeni oyun (U1 payı) | 8, 15 |
| US9.1 Yeniden bağlanma | 7, 11, 13, 14, 17 |
| US13.1 Gizli bilgi (U1 payı) | 6, 17 |
| US13.3 Telefon ve Türkçe (U1 payı) | 3, 14, 15, 18 |
| US13.4 Akıcı oyun (U1 payı) | 11, 12, 14, 17 |
| US13.5 Hileye karşı (U1 payı) | 3, 4, 5, 7, 11, 12, 13 |

## Testing Contract

```json
{
  "version": 1,
  "methodology": "custom",
  "source": "team",
  "ordering": "Oyun kuralı mantığında önce testler yazılıp çalıştırılır ve başarısız olduğu görülür, ardından kural kodu yazılarak testler geçirilir; ekranlar ve diğer tüm katmanlarda önce o katmanın kodu yazılır, hemen ardından o katmanın testleri yazılıp çalıştırılır.",
  "scope": "mvp",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: custom\n- **Methodology evidence**: Sahip karma bir test sırası seçti (practices-discovery Q7 = A): oyun kuralları (roller, gece/gündüz akışı, oylama, kazanma koşulları) net ve kural tabanlı olduğu için önce test yazılır; ekranlar ve diğer katmanlarda önce kod yazılır. İki farklı sıra bir arada olduğu için yöntem `custom` olarak kaydedildi.\n- **Ordering**: Oyun kuralı mantığında önce testler yazılıp çalıştırılır ve başarısız olduğu görülür, ardından kural kodu yazılarak testler geçirilir; ekranlar ve diğer tüm katmanlarda önce o katmanın kodu yazılır, hemen ardından o katmanın testleri yazılıp çalıştırılır.\n- **Kapsam alt sınırı:** tüm kodda satır kapsamı en az %80, oyun kuralı kodunda en az %90. (practices-discovery Q8 = B; org.md'deki `mvp` %80 tabanından daha sıkı)\n- **Birleştirme engeli:** testlerden biri başarısızsa ya da kapsam bu sınırların altındaysa parça `main`'e eklenmez. Testler ve kapsam ölçümü birleştirmeden önce CI'da çalışır; sınırlar bir adımı geçirmek için gevşetilmez.\n- **Uçtan uca test:** bot oyuncuların tam bir oyunu baştan sona oynadığı otomatik test v1'de vardır; iskeletle başlar ve her yeni rol ya da özellikle genişletilir.\n- **Test stratejisi:** `Standard` — birim testleri (oyun kuralları, rol yetenekleri, oylama), entegrasyon testleri (sunucu–tarayıcı iletişimi, yeniden bağlanma) ve bot oyunculu uçtan uca test.\n- **Projeye özgü testler:** yeniden bağlanma; gizli bilginin yalnızca hak eden oyuncuya gitmesi (C-07); odaların ve sohbetlerin 24 saat sonra silinmesi ve IP adresinin saklanmaması (C-14, C-15) otomatik testle sınanır. Erişilebilirlik (WCAG 2.1 AA) için CI'da otomatik erişilebilirlik taraması çalışır; ekran okuyucu ve klavye denemesi elle yapılır."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Meet an 80% line-coverage floor.",
      "Run the selected tests in CI before merge."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "custom",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Custom ordering - Oyun kuralı mantığında önce testler yazılıp çalıştırılır ve başarısız olduğu görülür, ardından kural kodu yazılarak testler geçirilir; ekranlar ve diğer tüm katmanlarda önce o katmanın kodu yazılır, hemen ardından o katmanın testleri yazılıp çalıştırılır.",
      "Implementation and tests - preserve that exact ordering; do not convert it to layer-local TDD.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:704cfad20abb2d1371f9b8fc7e94edc13bf72362951cd9149c21f6c6ef213188",
  "contract_sha256": "sha256:89444318c8eb1d6642385abcad0b03ef75d91c21109e2c64204d5fa0e9f8dc0a"
}
```

## Assumptions & Open Questions

- [assumption] Oyun kuralı kodu `src/rules/` klasörüdür; %90 kapsam sınırı bu klasöre uygulanır. Görünüm süzgeci ve oyun akışı sunucu katmanında sayılır ve önce kod, sonra test sırasıyla yazılır (team.md Ordering).
- [assumption] Ekranların görünüşü Ayrıntılı Taslaklarda sahibin onayladığı görsellere uyar; yeni bir görünüm kararı çıkarsa sahibe resimle sorulur (project.md Corrections).
- [assumption] Sunucuya ilk yayın (`v0.1.0`) bu planın kodu bitip iskelet denetiminden geçtikten ve sahip yayını açıkça onayladıktan sonra yapılır; DuckDNS adresi o zamana kadar sunucunun IP'sini (130.61.214.155) göstermelidir.
- [assumption] İzleme ölçüm zamanlayıcısı (`gulyabani-metrics`), UptimeRobot ve Oracle uyarıları izleme aşamasında kurulur (`monitoring-design.md`); bu planda yalnızca iç `/healthz` sayaçları vardır.
