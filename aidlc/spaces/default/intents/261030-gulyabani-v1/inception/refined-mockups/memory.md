<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-31T13:08:31Z — Yalnızca 4 büyük soru soruldu; sahibin "küçük konuları kendin tasarla" kuralı (project.md Corrections) Standard derinliğin 5-8 soru hedefinden önce geldi. Renk, yazı, eşikler ve parça listesi varsayılanla seçildi ve özet onayında gösterildi.
- 2026-10-31T13:08:31Z — Sabah ekranı gece temasında kalır, tema "Sonucu Açıkla"dan ve kazanma kontrolünden sonra gündüze döner; FR7.3'ün sırası böyle okunuyor. "Gün ağardı" kartı da bu ana konuldu.
- 2026-10-31T13:08:31Z — "kopuk" durumu oyuncu ekranından kaldırıldı (kaba taslakta vardı); FR14.3 yalnızca moderatörü anıyor ve durum bilgisi kimin sırasının geldiğini ele verebilir.
- 2026-10-31T14:02:21Z — Sahibin "arka arkaya 2 defa odadan atılırsa 30 dk" kuralı FR15.3 ile çelişmesin diye ikiye ayrıldı: lobiden/bekleyenlerden çıkarma tekrar istek göndermeye izin verir (2. çıkarmada 30 dk yasak), oyun sırasında çıkarma odaya hiç dönüşü engeller (FR15.3 değişmedi).
- 2026-10-31T14:02:21Z — "Ölülere moderatörlük teklifi" ayrıntıları ben seçtim: teklif bütün ölülere aynı anda gider, yanıtlanmazsa açık kalır, yeni moderatör oyunu duraklamış devralır ve "Devam et"e basar; eski moderatör dönerse izleyici olur ve geri devredilebilir.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-31T13:08:31Z — Q1-A'daki "el yazısına yakın başlık yazısı" yalnızca oyun logosunda SVG çizim olarak uygulandı; faz geçiş başlıkları gerçek metin yapıldı, çünkü yazı resmi WCAG 1.4.5'i bozar. El yazısı havası süslerle verildi.
- 2026-10-31T13:08:31Z — Gece eylem paneli açılınca odak kodla taşınmıyor (ilk taslakta taşınıyordu); odak taşımak ekran okuyucunun sesli okumasına yol açar ve FR5.5'in "duyuru yok" kuralını bozar.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-31T13:08:31Z — Hazır arayüz kütüphanesi yerine kendi küçük tasarım sistemi (belirteçler + 27 parça) seçildi; teknoloji henüz seçilmedi (ISS-02) ve oyunun kendine özgü parçaları (Uyku ekranı, faz geçişi, gulyabani paneli) hiçbir kütüphanede yok.
- 2026-10-31T13:08:31Z — Yazı tipleri oyunun kendi sunucusundan verilecek; dış yazı tipi servisi daha kolay ama oyuncunun IP'sini üçüncü tarafa gönderir (C-14).
- 2026-10-31T14:02:21Z — "Yeni isteklere kapat" anahtarı yeniden katılma isteklerini de kapatır; gerçek oyuncu dönemeyebilir ama sahip tacize karşı tam kapanma istedi, moderatör anahtarı istediği an açabilir.
- 2026-10-31T14:02:21Z — Görsel örnekte gece için meydan sohbeti yerine gulyabani paneli sohbeti (M-08) gösterildi; gece meydan sohbeti kapalı olduğu için gece temasında sohbetin gerçek hali budur.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-31T13:08:31Z — Yeniden katılma kuralı (Q3) gereksinim belgesinde ayrı madde olarak yok; Fonksiyonel Tasarım'da kural olarak yazılmalı (user-stories R-01, R-06).
- 2026-10-31T13:08:31Z — İskelette oyun sürerken gelen kişi için "Bu odada oyun sürüyor" mesajı varsayıldı; Teslimat Planlaması bekleme ekranını iskelete alırsa bu mesaj gereksiz olur.
- 2026-10-31T14:02:21Z — Sahip düzeltmesi FR14.5'i değiştirdi ve FR2.3'e kural ekledi; requirements.md bu stage'in işi değil, Fonksiyonel Tasarım'dan önce güncellenmeli (audit: Change Request notu).
