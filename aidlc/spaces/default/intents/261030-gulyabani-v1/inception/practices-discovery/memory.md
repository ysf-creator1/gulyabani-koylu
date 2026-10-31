<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-30T21:51:32Z — Greenfield taslağı org.md varsayılanlarından ve onaylı ideation kararlarından kuruldu; tüm maddeler öneri olarak işaretlendi. Tek somut çalışma kanıtı git geçmişi (doğrudan `main`'e commit + push); bu yüzden Way of Working'e PR'sız akış önerisi eklendi.
- 2026-10-31T09:32:01Z — Q2 (tek sunucu yalnızca canlı, denemeler bilgisayarda) ile Q5 (ilk sürüm baştan Oracle sunucusunda) çelişiyordu; ek soru Q10 = A ile çözüldü: sunucu v1 yayınına kadar deneme için, yayından sonra yalnızca canlı oyun için kullanılır. Sonuç olarak Oracle hesabı Construction'ın başında kurulmalı.
- 2026-10-31T09:32:01Z — Q7 = A karma bir test sırası (oyun kuralları önce test, ekranlar ve diğerleri önce kod) olduğu için Testing Posture'da `Methodology: custom` olarak eşlendi; Ordering iki sırayı tek cümlede açıkça söylüyor.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-30T21:51:32Z — Deployment'ta org.md'nin "birleştirmede deneme ortamına yayın" varsayılanından sapıldı; sıfır bütçe (C-01) ayrı deneme sunucusunu gereksiz kılıyor. Deneme yerelde ve CI bot testleriyle önerildi; görüşmede teyit edilecek.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-30T21:51:32Z — Test yöntemi taslağı `test-after` (org.md varsayılanı) olarak bırakıldı; `tdd` alternatif olarak not edildi. Kodu AI yazdığı için sadelik öne alındı, ama oyun kuralları net olduğundan kural motorunda önce test de makul; karar sahibinde.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-30T21:51:32Z — Kesin kural adayları (13 madde) sahibince tek tek teyit edilmeli. Özellikle WCAG 2.1 AA'nın "kesin kural" mı yoksa gereksinim mi olacağı ve sır kuralının deponun herkese açık olup olmamasından bağımsız kabul edilip edilmeyeceği açık.
