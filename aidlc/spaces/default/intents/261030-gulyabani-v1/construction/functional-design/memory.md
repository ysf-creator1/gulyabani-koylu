<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-11-01T20:10:43Z — [unit u1-walking-skeleton] Sahibe soru sorulmadı (project.md Corrections); iskelet varsayılanları (sabit ayarlar, otomatik gulyabani sayısı, moderatör kopunca bekleme) özet onayıyla onaylandı.
- 2026-11-01T20:10:43Z — [unit u1-walking-skeleton] US1.4'teki lobide çıkarma (AC1.4.3) U1'de tutuldu çünkü C1 `lobby.kick`'i U1'e veriyor; moderatörlük devri (AC1.4.4) U2'ye bırakıldı.

- 2026-11-04T19:40:00Z — [unit u2-room-and-lobby] Sahibe tek soru soruldu (Q1: yeteneği yazılmamış roller ne olsun); cevap A — "Yakında" kilidi. Diğer kararlar gereksinimlerden ve sahibin "küçük kararları sen seç" kuralından.
- 2026-11-04T19:40:00Z — [unit u2-room-and-lobby] U1 kural numaralarıyla karışmasın diye U2 kuralları BR13'ten başlatıldı.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-01T20:10:43Z — [unit u1-walking-skeleton] Oyun sürerken giriş iskelette reddediliyor (BR1.6, phase_closed); bekleme ekranı U2'de. Yeni metin anahtarı gerekecek.
- 2026-11-04T19:40:00Z — [unit u2-room-and-lobby] Giriş satırları 8–9 (yeniden katılma) U5 gelene kadar geçici olarak nick_taken verir; waiting_full yerine room_full döner (aynı mesaj).

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-04T19:40:00Z — [unit u2-room-and-lobby] Çıkarma yasağı için tarayıcıda saklanan rastgele anahtar seçildi (IP yasak, hesap yok); gizli pencerede zayıflar, gereksinim A8 bunu kabul ediyor.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
