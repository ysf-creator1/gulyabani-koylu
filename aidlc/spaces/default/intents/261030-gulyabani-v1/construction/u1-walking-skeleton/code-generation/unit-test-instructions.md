# Birim Testi Talimatları — U1 Yürüyen İskelet

## Sources

- Plan: `code-generation-plan.md` (Adım 2 test koşucusu, Testing Contract).
- Ekip kuralları: `memory/team.md` Testing Posture (oyun kuralında önce test; %80 / %90 kapsam; bot testi; erişilebilirlik taraması).
- Teknoloji: `nfr-requirements/tech-stack-decisions.md` (Vitest + v8 kapsam, Playwright + axe-core), `infrastructure-design/cicd-pipeline.md` (`npm run verify`).

## Test Çatısı ve Ayarlar

- **Vitest** (`vitest.config.ts`): `tests/**/*.test.ts` ve `tests/**/*.test.tsx`; `*.e2e.test.ts` hariç. Ekran testleri `happy-dom` ortamında `@testing-library/preact` ile çalışır.
- **Uçtan uca** (`vitest.e2e.config.ts`): yalnızca `tests/**/*.e2e.test.ts`; tek iş parçacığı; test kendi sunucusunu, geçici veri klasörünü, kendinden imzalı sertifikasını ve `PUBLIC_ORIGIN=https://localhost:<kapı>` değerini kurar.
- **Erişilebilirlik** (`playwright.config.ts`): Chromium, 320 px genişlik, açık ve koyu tema; `@axe-core/playwright`.
- Ön koşul yalnızca `npm ci` (ilk kez erişilebilirlik taraması için ayrıca `npx playwright install chromium`).

## Bu Parçanın Test Komutları

Bu parçanın bütün testleri `tests/u1/` altındadır; komutlar yalnızca bu klasörü çalıştırır.

1. Birim ve entegrasyon testleri (ilk test öncesinde çalışır, Adım 2):

   ```bash
   npx vitest run tests/u1/
   ```

2. Kural modülü (Adım 4'te kırmızı, Adım 5'te yeşil):

   ```bash
   npx vitest run tests/u1/rules/
   ```

3. Bot oyunculu uçtan uca test:

   ```bash
   npx vitest run --config vitest.e2e.config.ts tests/u1/e2e/
   ```

4. Erişilebilirlik taraması:

   ```bash
   npx playwright test tests/u1/a11y/
   ```

5. Kapsam ölçümü (kendi komutu; ardında başka adım yok):

   ```bash
   npx vitest run tests/u1/ --coverage
   ```

## Beklenen Kapsam Hedefleri

- Proje geneli sınır: tüm kodda satır kapsamı en az **%80**, oyun kuralı kodunda (`src/rules/**`) en az **%90** (team.md Testing Posture). Eşikler `vitest.config.ts`'te tanımlıdır ve gevşetilmez.
- Bu sınırları Build and Test, birleştirilmiş projenin bütün test takımında (`npm run verify`) denetler. U1 ilk parça olduğu için 5. komutun sonucu da aynı sınırları gösterir; komut yalnızca eşik yüzünden sıfır dışı kodla biterse ve bütün testler geçmişse bu, başarısız test değil, kapsam açığı olarak kaydedilir.
- Test hacmi (Standard): her parça (component) için 5–8 test; anahtar sınırlarda entegrasyon testleri; uçtan uca ve güvenlik testleri gereksinimlerin istediği yerde. Toplam ~110 test beklenir.

## Taklit (Mock) ve Yer Tutucu Rehberi

- Kural modülü saftır: saat (`now`) ve rastgelelik (`randomInt`) `RulesContext` ile dışarıdan verilir; testler sabit değerli sahte saat ve sırası belli rastgelelik kullanır. Ağ ve depo yoktur.
- Oyun akışı ve süre zamanlayıcısı `vi.useFakeTimers()` ile sınanır; sunucu bitiş zamanı sahte saatten okunur.
- Depo testleri gerçek SQLite kullanır (geçici klasörde dosya); taklit edilmez. Silme ve IP testleri dosyanın baytlarını tarar.
- Bağlantı kapısı ve entegrasyon testleri gerçek `ws` istemcileriyle yerel bir sunucuya bağlanır; dış hizmet yoktur.
- Ekran testleri sunucuya bağlanmaz: bağlantı katmanı sahte bir taşıyıcıyla değiştirilir ve gönderilen komutlar denetlenir.
- `assert(true)` gibi her durumda geçen test yazılmaz; her dosyada mutlu yol ve en az iki hata/kenar durumu vardır.

## Test Verisi Yönetimi

- Bot nickleri sabit ve yapaydır (`Bot1`…`Bot8`, `Moderator`); gerçek kişi verisi kullanılmaz.
- Her test kendi geçici veri klasörünü açar ve sonunda siler; testler birbirinin verisini paylaşmaz.
- Raporlar (`reports/e2e-summary.json`, kapsam özeti, erişilebilirlik raporu) yalnızca bot nickleri ve sayılar içerir; depoya eklenmez (`.gitignore`).
- Rol dağıtımını belirli yapmak için testler sırası belli rastgelelik kaynağı verir; uçtan uca testte gerçek kriptografik rastgelelik kullanılır ve sonuçtan bağımsız denetlenir (hangi taraf kazanırsa kazansın kazanan doğru olmalı).
