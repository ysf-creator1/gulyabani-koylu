<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-31T20:31:25Z — sözleşme sınırları tek program içinde; bütün parçalar aynı programda olduğundan (unit-of-work Ortak Kurallar, ADR-005) parçalar arası sözleşmeler ağ API'si değil, yapı taşı arayüzü, olay ve paylaşılan veri biçimi olarak yazılacak. Asıl dış (public) sözleşme tarayıcı/bot ↔ ConnectionGateway canlı bağlantı protokolü; ek dış uçlar sağlık kontrolü adresi (U8) ve sahibin rapor komutu (U7).
- 2026-10-31T20:31:25Z — sahibin kuralı (project.md Corrections) gereği yalnızca oyuncunun fark edeceği tek büyük karar soruldu (yeni sürümde açık sayfalar); mekanizma, sürümleme, hata ve yeniden deneme ayrıntıları benim varsayılanlarım olarak özet onayında gösterilecek.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-31T20:31:25Z — fark (delta) yerine her değişiklikte tam alıcı görünümü seçildi; gizli bilgi sızması ve kaçırılan mesaj riskini en aza indirir, yeniden bağlanmayı basitleştirir. Bedeli mesaj boyutu; 1.350 bağlantıda NFR1'i karşılayıp karşılamadığı U8 yük testinde ölçülecek (açık soru olarak yazıldı).
- 2026-10-31T20:31:25Z — sahip Q1'de C'yi seçti (yalnızca oyun yokken yükleme); bu, sunucunun eski istemci sürümünü desteklemesini gereksiz kıldı. Yedek olarak `hello` sürüm denetimi ve `reload` mesajı kondu; acil düzeltme durumu yayın aşamasına açık soru olarak bırakıldı.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
