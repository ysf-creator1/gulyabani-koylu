# Kod Özeti — U1 Yürüyen İskelet

Bu belge, yürüyen iskeletin (yalnızca Gulyabani ve Köylü ile baştan sona oynanan en küçük tam oyun) Kod Üretimi aşamasında yazılan kodu, önemli kararları, test sonuçlarını, kapsam değerlerini ve plandan sapmaları özetler. Kod `bolt/b1-walking-skeleton` dalında, henüz commit edilmeden durur.

## Sources

- Onaylı plan: `code-generation-plan.md` (Adım 1–22, Testing Contract) ve `unit-test-instructions.md`.
- Fonksiyonel tasarım: `functional-design/functional-spec.md`, `rules.md` (BR1–BR13), `entities.md`.
- Sözleşmeler: `inception/contract-design/contract-summary.md` (C1–C9).
- NFR: `nfr-requirements/tech-stack-decisions.md`, `nfr-design/*.md`.
- Altyapı: `infrastructure-design/infrastructure-specification.md`, `cicd-pipeline.md`, `reviews/review-01.md`.
- Ekran tasarımı: `inception/refined-mockups/design-system-mapping.md`, `mockups.md`.
- Ekip ve proje kuralları: `memory/team.md`, `memory/project.md`.

## Ne Yapıldı (adım adım)

| Adım | Durum | Ana dosyalar |
|---|---|---|
| 1 Proje iskeleti | Tamam | `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts`, `eslint.config.js`, `.prettierrc`, `.prettierignore`, `.gitignore` (yalnızca satır eklendi) |
| 2 Test koşucusu | Tamam | `vitest.config.ts` (%80 / `src/rules/**` %90), `vitest.e2e.config.ts`, `playwright.config.ts`, `tests/u1/setup.test.ts` |
| 3 Ortak şemalar ve içerik | Tamam | `src/shared/*`, `content/roles.json`, `content/tr.json`, `src/content/catalog.ts` |
| 4 Kural testleri (kırmızı) | Tamam | `src/rules/types.ts`, `tests/u1/rules/*.test.ts` |
| 5 Kural kodu (yeşil) | Tamam | `src/rules/*.ts` |
| 6 Görünüm süzgeci | Tamam | `src/server/visibility/filter.ts` |
| 7 Kalıcı depo | Tamam | `src/server/store/**`, `scripts/check-migrations.ts` |
| 8 Oda yönetimi | Tamam | `src/server/room/*` |
| 9 Oyun akışı ve zamanlayıcı | Tamam | `src/server/match/matchFlow.ts` |
| 10 Sohbet | Tamam | `src/server/chat/*` |
| 11 Bağlantı kapısı, sıra, gönderim | Tamam | `src/server/gateway/*` |
| 12 Temizlik, ölçüm, günlük, giriş | Tamam | `src/server/ops/*`, `src/server/app.ts`, `src/server/main.ts` |
| 13 Entegrasyon testleri | Tamam | `tests/u1/server/integration.test.ts` |
| 14 Ekran temeli | Tamam | `src/web/index.html`, `src/web/styles/*`, `src/web/net/*`, `src/web/i18n.ts`, `src/web/app.tsx` |
| 15 Oyuncu ekranları | Tamam | `src/web/screens/*`, `src/web/components/*` |
| 16 Moderatör ekranı | Tamam | `src/web/screens/moderator/ModeratorScreen.tsx` |
| 17 Botlar ve uçtan uca test | Tamam | `tests/bots/*`, `tests/u1/e2e/fullGame.e2e.test.ts`, `scripts/verify.ts` |
| 18 Erişilebilirlik ve paket denetimi | Tamam | `tests/u1/a11y/screens.a11y.spec.ts`, `scripts/check-bundle.ts` |
| 19 CI ve sürüm iş akışları | Tamam | `.github/workflows/ci.yml`, `.github/workflows/release.yml` |
| 20 Birleştirme, yayın, geri alma | Tamam — `scripts/deploy.sh` yürütücü tarafından eklendi (aşağıda) | `scripts/merge-bolt.sh`, `scripts/deploy.sh`, `scripts/smoke.ts`, `scripts/rollback.sh`, `scripts/lib/release-common.sh` |
| 21 Sunucu kurulum dosyaları | Tamam | `infra/oracle-setup.md` (yeni); var olan `infra/` dosyaları korundu |
| 22 Belgeler ve izlenebilirlik | Tamam | bu belge, `source-manifest.json`, `traceability.json` |

## Önemli Kararlar

- **TypeScript kaynakları doğrudan çalışır:** `rewriteRelativeImportExtensions` + `erasableSyntaxOnly` ile içe aktarmalar `.ts` uzantılıdır; Node.js'in tür ayıklaması sayesinde testler ve uçtan uca test `node src/server/main.ts` ile derlemesiz gerçek süreç açar, `tsc` derlemesinde uzantılar `.js`'e çevrilir. Yazım iş parçacığı da aynı yolla çalışır.
- **Önce kayıt sonra kabul ve oda içi boru hattı:** her oda tek sırada; sıradaki komutlar aday durum üzerinde sırayla hesaplanır, yazımları aynı toplu işleme girer, onay ve görünüm yalnızca kesinleşmeden sonra gider (`roomQueue.ts`). Yazım iş parçacığı WAL, `synchronous=FULL`, `secure_delete=ON`, geri alma noktalı toplu işlem ve `quick_check` ile bozuk dosyayı kenara alma yapar (`storeEngine.ts`).
- **Tek süzgeç:** `FilteredView` işaretli türdür; görünümü gönderen tek yol `ViewDispatcher.sendView`'dur. Faz ya da adım değişen turda görünüm herkese aynı anda gider (gece eşitliği).
- **Sürüm eşlemesi:** sunucu, verdiği `index.html`'e `meta name="app-version"` yazar; tarayıcı `hello`'da bunu gönderir. Böylece tarayıcı ile sunucu her zaman aynı sürümdedir ve sonsuz `reload` döngüsü oluşmaz (CSP'ye uygun; satır içi betik yok).
- **IP hiç okunmaz:** kodda `remoteAddress`/`X-Forwarded-For` yok (ESLint kuralı); günlük yalnızca biçimi denetlenen beyaz liste alanlarını yazar, hata mesaj metnini hiç yazmaz.
- **Görünüm adı uyumu:** C5'e yalnızca ekleme yapıldı: `room.expiresAt`, `game.remainingMs`, `game.ghulDecided`, `game.voteRound`, `game.tiedSeatIds`, `moderator.stepVersion`, `moderator.announcementParams`, `moderator.pendingDeathSeatIds`, `moderator.allSeats[].cardSeen`.
- **Yalnızca test/geliştirme için iki ayar:** `DEV_TIME_SCALE` (süreleri kısaltır; üretimde reddedilir) ve `WEB_DIR`. Üretim dışında kapı 0 ve `NODE_ENV=development`'ta `http://localhost` kökeni kabul edilir (yerel geliştirme ve erişilebilirlik taraması için).

## Test Sonuçları

### Adım 4 — kural testleri önce, kırmızı

`npx vitest run tests/u1/rules/` (kural kodu yazılmadan önce):

```text
Error: Cannot find module '../../../src/rules/index.ts' imported from tests/u1/rules/helpers.ts
 Test Files  6 failed (6)
      Tests  no tests
```

Bütün kural test dosyaları (dealRoles, night, morning, voting, win, legalActions) kural kodu olmadığı için başarısız oldu. Adım 5'teki kod yazıldıktan sonra: **6 dosya, 77 test geçti** (bir test yardımcısı 2 oyunculu oyun kurduğu için düzeltildi; kural kodu değişmedi).

### Son çalıştırma

| Komut | Sonuç |
|---|---|
| `npx vitest run tests/u1/` (birim + entegrasyon) | 30 dosya, **261 test geçti**, 0 başarısız |
| `npx vitest run --config vitest.e2e.config.ts tests/u1/e2e/` | **3 test geçti**: 3 bot (kazanan gulyabaniler, 1 gece) ve 8 bot (3 gece / 3 gün; ortasında bir botun bağlantısı koparılıp geri geldi); köylü botlarına giden mesajlarda yasak alan **0**, gece görünümü farkı **0**, aynı adımın farklı bitiş zamanı **0**; günlükte bot nicki, sohbet metni, bozuk girdi ve IP deseni yok |
| `npx playwright test tests/u1/a11y/` | **2 geçti** (açık ve koyu tema; her biri gerçek oyunda 19–20 ekran, 320 px): ciddi/kritik bulgu **0**, yatay kaydırma yok |
| `npm run verify` | **BAŞARILI** (birim + kapsam eşikleri + uçtan uca + kısa rapor) |
| `npm run check:bundle` | Betik + stil gzip toplamı **47,4 KB / 150 KB**; derlenmiş HTML'de satır içi stil yok |
| `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run check:migrations` | Temiz |
| `npm audit --audit-level=high`, `npm audit signatures` | Yüksek/kritik bulgu yok (yalnızca orta düzey); imzalar doğrulandı |
| Derlenmiş program (`npm run build:server`, `node dist/server/main.js`) | `--check-config` geçti; açılış, iki `/healthz`, CSP ve sürüm meta etiketi denendi |

Erişilebilirlik taraması ilk çalıştırmada gerçek bulgular yakaladı ve düzeltildi: duyuru alanında rolsüz `aria-label`, sohbet listesinde `ul role="log"`, kart düğmesinin adının görünen metinle uyuşmaması; kontrast bulguları tema geçiş animasyonu sırasında taramadan kaynaklanıyordu (tarama 400 ms bekler).

### Kapsam (v8, `npx vitest run tests/u1/ --coverage`)

| Kapsam | Satır | Sınır |
|---|---|---|
| Tüm kod (`src/**`) | **%89,44** | %80 |
| Oyun kuralı kodu (`src/rules/**`) | **%99,56** | %90 |

Kapsam dışı bırakma (ignore) kullanılmadı. `src/server/store/writerWorker.ts` iş parçacığında çalıştığı için v8 ölçümünde %0 görünür ve toplama dahildir; davranışı `store.test.ts` (gerçek iş parçacığı) ve gerçek süreç testleriyle sınanır.

### Yazılıp çalıştırılmayanlar

- `.github/workflows/ci.yml` ve `release.yml` GitHub'da çalıştırılmadı (commit/push yapılmadı). Adımlarının yerel karşılıkları çalıştırıldı (biçim, denetim, tür, göç denetimi, verify, web derlemesi, paket denetimi, erişilebilirlik, audit). gitleaks ve ARM64 matrisi yalnızca CI'da çalışır.
- `scripts/merge-bolt.sh` ve `scripts/rollback.sh` yalnızca `bash -n` sözdizimi denetiminden geçti; gerçek dal/sunucu üzerinde çalıştırılmadı (görev gereği git ve sunucu işlemi yapılmadı).
- NFR1.3'ün sunucuda saniyede 300 komutluk yazım ölçüm testi yazılmadı; tasarımda iskelet denetiminde Oracle sunucusunda yapılacak engelleyici ölçümdür.

## Plandan Sapmalar ve Açık Konular

1. **`scripts/deploy.sh` geliştirici ajan tarafından yazılamadı.** AI-DLC'nin yazım kancası ilk içeriği engelledi ("AIDLC runtime records and hooks belong to the harness"). Kanca dosya adına değil içeriğe bakar (`.claude/hooks/runtime-integrity.ts`, kabuk komutlarının yazma/silme hedefleri) ve dolanılmadı. Dosyayı yürütücü (orkestratör) cicd-pipeline.md "Yayın" adım 1–10'a göre yeniden yazdı. Ortak işlevler `scripts/lib/release-common.sh`'ten gelir. Yerel geçici klasör `find -delete` ile, sunucudaki geçici klasör ise sunucu tarafında temizlenir. Kanca yeni içeriği geçirdi. `bash -n` denetimi `tests/u1/scripts/smoke.test.ts` listesine eklendi. Sunucuda gerçek çalıştırma ilk yayında (`v0.1.0`) yapılır. İnceleme sonrası düzeltmeler:
   - Sunucu kilidi (`/run/gulyabani-release.lock`, `mkdir` ile) bütün yayın boyunca tutulur.
   - Otomatik geri almadan sonra önceki sürüm için dış/iç kontrol de çalışır.
   - "Sahibin ağı" uyarısıyla çıkılırken eski sürümler yine temizlenir.
   - `--reinstall` çalışan sürümü yeniden yazmayı reddeder.
   - `ci.yml`'deki `paths-ignore` kaldırıldı; CI her gönderimde çalışır, böylece birleştirme kapısı belge commit'inde kilitlenmez (8. madde artık geçerli değil).
2. **Yerel Node.js 26.12.0** (plan 24.22.2). `engines` ve `.nvmrc` 24.22.2'de bırakıldı; CI ve sunucu `.nvmrc`'yi kullanır.
3. **Bağımlılık sürümleri** planlanandan yenidir (Vitest 4, ESLint 10, Vite 7, zod 4, happy-dom 21): eski sürümler `npm audit --audit-level=high` kapısını geçmiyordu. npm 12'nin kurulum betiği izni `package.json` `allowScripts` alanına yazıldı (better-sqlite3, esbuild, fsevents).
4. **Görünüm üretimi alıcı başınadır;** performance-design'daki "sınıf başına ortak blok" hızlandırması yapılmadı (bot testinde %95 işleme süresi 2 ms). U8 yük testi gerekirse ekler.
5. **Yazı tipi:** performance-design kararıyla sistem yazı tipleri kullanıldı (design-system-mapping'deki Noto Sans önerisi yerine; indirilen yazı tipi yok).
6. **Oda düzeyi komut numaraları** ayrı tablo yerine oda satırında son 500 numaralık JSON listesinde tutulur (entities `Room.processedCommandIds`).
7. **Oturumun `lastSeenAt`'i** her mesajda depoya yazılmaz; bağlanmayan oturumun 10 dakikada silinmesi `createdAt` ve bağlı olmamaya bakar. Ülke bilgisi (U7) yoktur.
8. **`ci.yml` `paths-ignore`** bütün gönderimlere uygulanır; yalnızca `aidlc/`/`.claude/` değiştiren bir `bolt/**` baş commit'inde CI çalışmaz ve birleştirme kapısı onu bekler.
9. **`.gitignore`'a** plandaki satırlara ek olarak security-design'ın istediği `.env`, `*.db`, `*.db-*` satırları eklendi; ekleme kabuk komutuyla yapıldı (içerik yalnızca satır eklemedir).
10. **ESLint** IP okuma ve gömülü metin yasaklarını yalnızca `src/`'ye uygular; testler `X-Forwarded-For`'u bilerek gönderip okunmadığını sınar.
11. İzlenebilirlik aracı ilk çalıştırmada dosyayı çalışma klasörüne göre iç içe bir yola yazdı; yanlış kopya silindi ve mutlak yolla yeniden üretildi. Algılayıcı sonucu: **passed** (199/199 satır; incelemede eksik kalan NFR5.8, NFR11.1, NFR12.1, NFR12.3, NFR13.5, NFR13.7 eklendi).
12. Erişilebilirlik taraması sunucuyu `NODE_ENV=development` ve `http://localhost` kökeniyle açar (TLS uçtan uca testte sınanır).

## `content/tr.json` Anahtar Listesi (227 anahtar)

- `app.*` (4): title, logoAlt, tagline, loading
- `privacy.*` (4): title, short, more, long
- `home.*` (9): heading, create, joinTitle, codeLabel, join, codeInvalid, howToPlay, howToPlayText, close
- `entry.*` (9): createTitle, joinTitle, roomLabel, nickLabel, nickHint, submitCreate, submitJoin, back, inGame
- `lobby.*` (19): title, codeLabel, linkLabel, copyLink, linkCopied, participants, playerCount, moderatorLabel, openRoles, start, minPlayers, warn.few_players, kick, kickLabel, kickConfirm, kickYes, kickNo, waitingForModerator, expires
- `role.*` (10): ghul.name, ghul.ability, ghul.win, ghul.tip, ghul.flavor, villager.name, villager.ability, villager.win, villager.tip, villager.flavor
- `side.*` (4): ghuls, villagers, iconLabel.ghuls, iconLabel.villagers
- `card.*` (7): title, reveal, hide, back, seen, seenDone, myCard
- `sleep.*` (2): title, text
- `ghul.*` (11): meetTitle, meetText, killTitle, targets, marks, markLine, noMarks, confirm, confirmHint, decided, select
- `morning.*` (4): title, waiting, died, nobody
- `day.*` (3): title, number, hint · `night.*` (1): number
- `vote.*` (10): title, prompt, revotePrompt, myVote, noVote, count, waitClose, cannot, select, tallyTitle
- `lastWords.*` (3): title, accused, text · `confirm.*` (2): title, text
- `end.*` (6): title, villagers, ghuls, roles, nightLog, waitNewGame
- `log.*` (6): ghulKill, noKill, ghulTimedOut, execution, noExecution, empty
- `seat.*` (6): alive, dead, disconnected, you, seen, accused
- `chat.*` (8): day, ghul, placeholder, inputLabel, send, readOnly, empty, newMessage
- `conn.*` (6): connecting, reconnecting, back, failed, moderatorLost, paused
- `phase.*` (8): first_night, night, morning, day, voting, last_words, confirm_vote, ended
- `transition.*` (2): night, day · `timer.*` (3): label, paused, expired
- `mod.*` (25): title, tabs, tabFlow, tabPlayers, tabLog, tabChat, announcement, expected, status, nextStep, revealResult, moveToVote, closeVoting, extend, pause, resume, newGame, seenCount, votesTitle, noVotes, voteLine, notVoted, pending, pendingNone, ghulChat
- `step.*` (3), `stepStatus.*` (4), `expected.*` (9), `announce.*` (12), `notice.*` (2), `msg.*` (2), `a11y.*` (2)
- `error.*` (21): title ve her neden kodu (room_not_found … rate_limited, U1 eklemeleri step_waiting, game_paused, server_busy dahil)

Her neden kodunun ve zorunlu ekran anahtarının varlığı, kodda kullanılan her anahtarın `tr.json`'da bulunması ve kodda gömülü Türkçe metin olmaması `tests/u1/content/catalog.test.ts` ile denetlenir.

## Doğrulama Komutları

```bash
npm ci
npx vitest run tests/u1/
npx vitest run tests/u1/rules/
npx vitest run --config vitest.e2e.config.ts tests/u1/e2e/
npx vitest run tests/u1/ --coverage
npm run build:web && npm run check:bundle
npx playwright install chromium && npx playwright test tests/u1/a11y/
npm run verify          # Construction doğrulama komutu önerisi
```

## Assumptions & Open Questions

- [assumption] `DEV_TIME_SCALE` yalnızca test ve geliştirme içindir; üretimde ayar denetimi programı açmaz.
- [assumption] Kart görme adımında moderatör sürücüsü bütün botların "Gördüm" demesini bekler; gerçek oyunda moderatör beklemeden de ilerleyebilir (BR3.3).
- Açık konu: ilk yayın (`v0.1.0`), iskelet denetimi ve sahibin açık onayından sonra yapılır; gerçek telefon denemesi (NFR4.5) ve sunucudaki yazım ölçümü (NFR1.3) iskelet denetiminde elle yapılır.
