<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-30T21:16:52Z — Q2 (çekirdek sürüm içeriği) Q1=A ile anlamsız kaldı; dört seçeneğin hepsi seçildiği için tek seferlik yayınla çelişmiyor, kapsamda "tek yayın, çekirdek yok" olarak yorumlandı.
- 2026-10-30T21:16:52Z — Bot oyunculu uçtan uca test intent dosyası Bölüm 16'dan geliyor; v2'deki bot moderatörle karıştırılmaması için kapsamda ayrı satır olarak yazıldı.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-30T21:16:52Z — Yayın tarihi sorusu (aşama dosyasındaki "hard deadlines") yeniden sorulmadı; fizibilitede cevaplandı (sabit tarih yok, C-03).

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-30T21:16:52Z — Önceliklendirmede MoSCoW seçildi (tek yayın, sabit kapsam); RICE/WSJF için gerçek kullanım verisi yok. Sıralama Q3=C'ye göre "değer + risk birlikte".
- 2026-10-30T21:16:52Z — Q6=C (baştan tam illüstrasyon) sıfır bütçe ve tek kişilik bakımla gerilim yaratıyordu; Q8 ile SVG çizimlere bağlandı, yayın görsellere bağlı.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-30T21:16:52Z — Yayın aşamaları (ortam kurulumu, dağıtım, izleme) hâlâ planda yok (ISS-03); v1'in "tamamlandı" sayılması buna bağlı.
- 2026-10-30T21:16:52Z — Yayından önce arkadaş denemesi yok (Q9=C); güvenilirlik ölçütü ilk kez yayından sonra ölçülecek, bot testi tek ön güvence.
