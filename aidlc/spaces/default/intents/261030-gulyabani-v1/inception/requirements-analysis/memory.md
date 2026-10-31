<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-31T10:47:01Z — Q7 serbest cevabı (5 dk bekleme, sonraki turda "öldürülmesi için uyarı") belirsizdi; Q15 ile netleştirildi: süre kopuk oyuncunun kendi adımında uzar, uyarı moderatöre gider, karar moderatörün.
- 2026-10-31T10:47:01Z — Q8'deki "ölüm zinciri normal işler" ifadesi rol kurallarıyla okundu: çıkarılan oyuncunun kendi Celalli Damat/Dertli yeteneği tetiklenmez (tarif yalnızca kaçırılma ve infazı sayıyor); varsayım A16 olarak yazıldı.
- 2026-10-31T10:47:01Z — Q14 "ses olmasın" cevabı ekran okuyucu duyurusunu da kapsayabilirdi; WCAG kuralıyla çeliştiği için Q17 ile ayrıca soruldu, sahip duyurunun da olmamasını seçti.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-31T10:47:01Z — Proje kuralı "WCAG 2.1 AA'nın tamamı"ndan tek bir sapma: gece "sıra sende" ekran okuyucu duyurusu yok (Q17, sahip onaylı); NFR9'da istisna olarak yazıldı.
- 2026-10-31T10:47:01Z — "Sohbetler 24 saatte silinir" kuralına sahip onaylı istisna: şikayet edilen mesaj metni 1 ay saklanır (Q12, Q16); FR16.5'te yazıldı.
- 2026-10-31T10:47:01Z — Standard derinlik 5–8 soru önerir; önceki aşamaların bu aşamaya bıraktığı çok sayıda açık nokta nedeniyle 14 soru + 3 ek soru soruldu.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-31T10:47:01Z — Sunucu yeniden başlarken oyunların korunması (Q10) sadelik kısıtıyla (C-11) çekişiyor; sahip güvenilirliği seçti, tasarımda kalıcı oyun durumu gerekecek.
- 2026-10-31T10:47:01Z — Zamanlayıcılar, sınırlar ve kenar durumları (A1–A23) soru yerine varsayım olarak yazıldı; köşe listesi (corner-checklist) bunu öneriyor, sahip onay kapısında düzeltebilir.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-31T10:47:01Z — Kelime filtresi listesi kaynağı (DEP-04) ve "her gün yeni kelime" listesi içeriği sonraki aşamalara kaldı.
