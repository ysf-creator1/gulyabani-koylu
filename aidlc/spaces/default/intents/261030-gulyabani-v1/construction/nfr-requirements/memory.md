<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] Sahibe yalnızca iki büyük karar soruldu (dil, depo); ISS-02 "ben öneririm, sahip onaylar" diye kayıtlıydı ve project.md Corrections küçük ayrıntıları benim seçmemi istiyor. Diğer seçimler özet onayında kısa bir maddeyle gösterildi.
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] NFR9, NFR10, NFR11 ve NFR12 beş NFR kategorisine tam oturmadığı için NFR10 hız belgesine, NFR9/NFR11/NFR12 teknoloji kararları belgesine (araçlarıyla birlikte) yazıldı.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] Sözleşmede U8'e yazılı `connections` ve `errorCount` sayıları iskelete öne alındı (NFR13 baştan istiyor, maliyeti iki sayaç). Yeni neden kodu `server_busy` eklendi (genel oda sınırı); ikisi de yalnızca ekleme.
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] BR10.4'ün "ülke bağlantı anında çıkarılır" kısmı U7'ye ertelendi; iskelette kayıt olmadığı için ülke gerekmiyor. "IP saklanmaz" baştan geçerli.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] SQLite'ın tek işlemi FD incelemesindeki room.create kesilme notunu kendiliğinden çözüyor; tek yazar sınırı komut başına kısa işlemle (NFR1.3) karşılandı.
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] Oda verisi yedeklenmedi: 24 saat silme kuralı (C-15) ile çelişirdi; disk kaybında süren odaların kaybı kabul edilen risk.
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] Sağlık kontrolü sayıları kaynak adres denetimi yerine ayrı iç kapıya taşındı (FD inceleme notu 5); aynı sunucudaki Caddy arkasında kaynak her zaman 127.0.0.1 görünürdü.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-02T07:47:15Z — [unit u1-walking-skeleton] Oracle makine türü, Caddy ayarı ve ücretsiz alt adres (DEP-02) Altyapı Tasarımı'nda; NFR1.3 disk süresi gerçek makinede doğrulanacak.
