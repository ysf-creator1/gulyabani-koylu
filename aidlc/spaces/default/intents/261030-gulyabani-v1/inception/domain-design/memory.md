<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-31T18:20:37Z — Sahibin "yalnızca büyük kararları sor" kuralı (project.md Corrections) gereği Standard derinliğin 5–8 sorusu yerine tek ürün sorusu soruldu (R-09, teklif süresi); bileşen ayrıştırması, varlık sahipliği ve etkileşim yönleri benim varsayılanlarım olarak özet onayına kondu ve Looks correct ile onaylandı.
- 2026-10-31T18:20:37Z — Ayrıntılı Taslaklar'daki sahip düzeltmeleri (M-18, bekleyenleri çıkarma) gereksinimlerin önüne geçtiği için requirements.md'de FR2.2, FR2.3, FR14.5, kabul ölçütleri ve Kapsam Dışı satırı güncellendi; özet onayında sahibe söylendi, audit'e Change Request notu düşüldü.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-31T18:20:37Z — Uçtan uca test için BotPlayer bir yapı taşı olarak kataloğa kondu (test kodu olmasına rağmen); Units Generation'ın iskelet doğrulamasını planlayabilmesi için görünür olması gerekiyor.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-31T18:20:37Z — Döngüyü kırmak için RoomManager, MatchFlow ve ChatService bağlantı katmanını çağırmıyor, olay yayınlıyor; ConnectionGateway dinliyor (ADR-005). Karşılığında olay kaybında yeniden bağlanan istemciye tam görünüm gönderilmesi gerekiyor.
- 2026-10-31T18:20:37Z — Mesaj şikayeti iki yerde tutuluyor (ChatService'te 24 saatlik işaret, EventRecorder'da 1 yıllık kayıt); saklama sürelerini ayırmak için kabul edildi (ADR-006).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-31T18:20:37Z — Oyun sırasında moderatör bilgisi hem MatchFlow'da hem RoomManager'da; değişikliğin ikisinde aynı anda yapılma sırası Fonksiyonel Tasarım'da netleşmeli.
- 2026-10-31T18:20:37Z — VisibilityFilter'ın her olayda 27 alıcı × 50 oda için görünüm üretmesinin NFR1'e sığdığı NFR tasarımında/yük testinde ölçülmeli.
