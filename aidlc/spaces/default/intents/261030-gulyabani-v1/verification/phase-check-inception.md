# Aşama Geçiş Kontrolü — Hazırlık → Yapım

**Sonuç: GEÇTİ.** Hazırlık (Inception) aşamalarının izlenebilirlik dosyalarında çözülmemiş bulgu yok: boşluk (`GAP`), sahipsiz öğe (`ORPHAN`), geçersiz hedef ya da eksik üst kimlik bulunmadı. Yapım aşamasına geçilebilir.

- Kontrol tarihi: 2026-11-01T10:54:03Z
- Kontrol eden: Teslim Planlaması aşaması (Step 5)
- [ ] Sahip onayı (Teslim Planlaması onay noktasında verilir)

## Okunan Dosyalar

- `inception/user-stories/traceability.json` — gereksinimler → hikâyeler
- `inception/domain-design/traceability.json` — hikâyeler → yapı taşları
- `inception/units-generation/traceability.json` — hikâyeler → parçalar
- Sözleşme Tasarımı izlenebilirlik dosyası üretmez (gereksinim kapsamı değil, sözleşme sahipliği tutar); bu kontrole katılmaz.

## Kapsam Tablosu

| Zincir | Üst kimlik sayısı | OK | Deferred | N/A | GAP | ORPHAN | Eksik |
|---|---|---|---|---|---|---|---|
| Gereksinimler (FR, NFR) → Hikâyeler | 117 | 113 | 4 | 0 | 0 | 0 | 0 |
| Hikâyeler → Yapı taşları | 48 | 48 | 0 | 0 | 0 | 0 | 0 |
| Hikâyeler → Parçalar | 48 | 48 | 0 | 0 | 0 | 0 | 0 |

**Ters yön (yukarıya bağlanmayan çıktı):** Yalnızca `BotPlayer` yapı taşı, `N/A` olarak gerekçelendirilmiş: kullanıcı hikâyesi değil, NFR12 ve team-practices Walking Skeleton doğrulamasından gelen test aracıdır. Geçerli.

## Ertelenen Gereksinimler (Deferred)

Bu dört işlevsel olmayan gereksinim bir hikâyeye değil, yapım aşamasındaki NFR Gereksinimleri aşamasına bağlıdır; hedefleri dolu ve geçerlidir:

| Kimlik | Hedef |
|---|---|
| NFR3 | nfr-requirements |
| NFR6 | nfr-requirements |
| NFR12 | nfr-requirements |
| NFR13 | nfr-requirements |

## Uyarılar (geçişi engellemez)

- **Çok parçalı hikâyeler (Birim incelemesi R-01, risk olarak kabul edildi):** `units-generation/traceability.json` her hikâye için tek bir parça yazıyor; 9 hikâye (US4.2, US5.4, US7.1, US7.2, US10.2, US13.1, US13.3, US13.4, US13.5) ise birden çok parçaya yayılır. Paylaşımın yetkili kaynağı `unit-of-work-story-map.md` "Birden Çok Parçaya Yayılan Hikâyeler" tablosudur; `bolt-plan.md` her Bolt'un kapsamını bu tabloya göre yazar. Özellikle iskelet etiketli US4.2 ve US7.1'in U1 payı (ve US13.1, US13.3, US13.4, US13.5'in iskelet payı) B1'in kapsamındadır. Her parçanın Fonksiyonel Tasarımı kendi payını izler.

## Tutarlılık Kontrolleri

- 48 hikâyenin hepsi en az bir yapı taşına ve bir parçaya bağlı.
- İskelet etiketli 16 hikâyenin hepsi U1'de (`unit-of-work-story-map.md` Kapsama Kontrolü) ve B1'in kapsamında (`bolt-plan.md`).
- Bolt sırası (U1 → U8) parça bağımlılıklarına (`unit-of-work-dependency.md`) tam uyuyor; sapma yok (`risk-and-sequencing-rationale.md`).
- v2 maddelerinin hiçbiri bir parçaya ya da Bolt'a atanmadı (project.md Forbidden).
