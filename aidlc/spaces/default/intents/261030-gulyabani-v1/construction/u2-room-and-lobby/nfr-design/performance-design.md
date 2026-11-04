# Performans Tasarımı — U2 Oda ve Lobi

Bu belge U2'nin performans, arayüz, dil ve test edilebilirlik gereksinimlerinin karşılanma biçimini yazar:
- NFR1.20–NFR1.23,
- NFR9.20, NFR10.20,
- NFR11.20,
- NFR12.20–NFR12.22,
- NFR14.20.

U1'in performans tasarımı (`../../u1-walking-skeleton/nfr-design/performance-design.md`) aynen geçerlidir: oda başına sıra, tek yazar, alıcıya özel görünüm, sistem yazı tipleri, 150 KB paket bütçesi.

## Sources

- NFR gereksinimleri: `construction/u2-room-and-lobby/nfr-requirements/performance-requirements.md` (performance-requirements).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; B6, B7, Ekranlar) ve `rules.md` (rules; BR13.1, BR15.5, BR17.3–BR17.6, BR18.1, BR18.2).
- Teknoloji kararları: `nfr-requirements/tech-stack-decisions.md`.
- U1 ölçümleri: `construction/u1-walking-skeleton/code-generation/code-summary.md`.

## Tasarım

| Konu | Tasarım | Karşıladığı |
|---|---|---|
| Lobi komutları | U1 oda komutu yolundan geçerler: oda sırası, aday durum, tek yazar, kabul, görünüm. Yeni bir yol yoktur. Bütçe %95'te sunucu içinde ≤ 150 ms; U1'de ölçülen 2–5 ms'nin çok altındadır. | NFR1.20 |
| StartCheck | `src/rules/startCheck.ts` içinde saf bir fonksiyondur: `(oyuncu sayısı, havuz, ayarlar, en genç işareti, now, createdAt, availability) → {blockReason, warnings}`. Moderatör görünümü üretilirken çağrılır; saklanmaz. Döngü yalnızca açık rol listesi (≤ 9) üzerindedir. | NFR1.21 |
| Çıkarma kaydı araması | `room_kick_records` birincil anahtarı `(room_code, browser_key_hash)`'tir; giriş başına tek bir nokta okumasıdır. Kayıtlar oda kümesinin (aggregate) içinde bellekte de tutulur; giriş kararı depoya gitmez. | NFR1.22 |
| Ayar düğmeleri | İstemcide 300 ms bekleten bir birleştirici vardır. Son dokunuştan 300 ms sonra değişen alanlar tek bir `lobby.setSettings` ile gider. Ekran kabul edilene kadar yerel değeri gösterir; ret gelirse sunucu değerine döner ve nedeni alanın altında yazar. | NFR1.23 |
| 320 px | Ayarlar ve Rol Havuzu tek sütundur. Rol satırı: simge, ad ve kısa açıklama, sağda anahtar; açıklama sarar. Adım düğmesi `[−] değer [+]` biçimindedir. | NFR10.20 |
| Paket | Yeni ekranlar mevcut bileşenlerle (Button, Toggle, ChoiceList, ConfirmDialog) yazılır; yeni kütüphane yoktur. Rol simgeleri satır içi SVG yer tutucudur (görseller U6). Bütçe 150 KB içinde kalır. | NFR10.20 |
| Erişilebilirlik | Bileşen düzeyinde:<br>• anahtar `role="switch"` ve `aria-checked`;<br>• adım düğmeleri `aria-label` ("Gündüz süresini azalt");<br>• değer `aria-live="polite"`;<br>• kilitli öğe `aria-disabled="true"` ve görünür "Yakında" metni (açıklama `aria-describedby` ile bağlı).<br>Erişilebilirlik taramasına dört yeni ekran eklenir: bekleme, Ayarlar, Rol Havuzu, "Nasıl oynanır?". | NFR9.20 |
| Metinler | Bütün yeni metinler `content/tr.json`'dadır:<br>• `settings.*`, `pool.*`, `waiting.*`, `howto.*`;<br>• `role.<id>.name` ve `role.<id>.short`;<br>• yeni neden kodları için `error.*`.<br>U1'in katalog testi genişler. | NFR11.20 |
| Saf kurallar | Yeni kural dosyaları: `rolePool.ts` (doğrulama, ön ayar, önerilen sayı, deste), `startCheck.ts`. Değişen: `voting.ts` (köyün en genci sayımı), `legalActions.ts` (çekimser). Testler önce yazılır (kırmızı → yeşil). | NFR12.20 |
| Özellik listesi | `src/rules/availability.ts` sürümün listesini dışa verir (`LIVE_AVAILABILITY`); kurallar bunu parametre alır. Testler `ALL_AVAILABILITY` ile de çalışır. Sunucu yalnızca canlı listeyi kullanır; uçtan uca test sunucusu `DEV_ALL_ROLES=1` ile bütün rolleri açar. Bu değişken üretimde ayar denetimini geçmez (U1'deki `DEV_TIME_SCALE` gibi). | NFR12.21, BR17.8 |
| Uçtan uca test | Bot senaryosu genişler:<br>• oyun sürerken bir bot gelip bekler;<br>• "Yeni oyun"da lobiye alınır;<br>• ikinci oyun "Klasik" ön ayarı, canlı oylar kapalı ve köyün en genci kuralıyla başlar.<br>Bütün rollerin açık olduğu üçüncü bir oyun özel rollerle dağıtılır ve sonuna kadar oynanır. | NFR12.22 |
| Sunucu saati | 22 saat ve 30 dakika hesapları `ctx.now`'dan yapılır; testler sahte saat kullanır. | NFR14.20 |
