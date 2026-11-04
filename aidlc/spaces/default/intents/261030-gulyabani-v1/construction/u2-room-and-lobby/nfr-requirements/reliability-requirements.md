# Dayanıklılık Gereksinimleri — U2 Oda ve Lobi

U1'in dayanıklılık gereksinimleri (`../../u1-walking-skeleton/nfr-requirements/reliability-requirements.md`, NFR4.1–NFR4.5, NFR5.1–NFR5.10, NFR6.1–NFR6.2) aynen geçerlidir. Bu belge U2'nin yeni durumlarının yeniden başlatmaya ve kopmaya dayanmasını yazar. Alt numaralar 20'den başlar.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR4 yeniden bağlanma, NFR5 dayanıklılık, NFR6, FR1.6, FR17.2).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C9 depo düzeni, "yalnızca ekleme" göç kuralı).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; B1, B8, Hata ve Kenar Durumları) ve `rules.md` (rules; BR13.2, BR14.2, BR16.4, BR18.3).
- U1 dayanıklılık gereksinimleri: `construction/u1-walking-skeleton/nfr-requirements/reliability-requirements.md`.

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR4.20 | Bekleyen kişi bağlantısı kopup gelince ya da sayfayı yenileyince en fazla 5 saniyede yine bekleme ekranına döner. "Yeni oyun" o kopukken olduysa lobiye döner | Entegrasyon testi: bekleyen bağlantıyı kapatıp aynı belirteçle açar | NFR4, FR1.6, BR13.2, BR18.3 |
| NFR5.20 | Kabul edilmiş ayar, havuz, kapatma anahtarı, en genç işareti, devir, bekleme durumu ve çıkarma kayıtları sunucu yeniden başladıktan sonra aynen geri gelir. Hepsi kabulden önce, oda kaydıyla aynı yazımda depoya yazılır | Depo testi: yaz, yeniden aç, oku; süreç testinde yeniden başlatma sonrası lobi aynı | NFR5, BR16.1, BR14.2 |
| NFR5.21 | Depo değişiklikleri yalnızca eklemedir: yeni sütunların varsayılanı vardır, yeni tablo eklenir, var olan sütun silinmez ve anlamı değişmez. v0.1.x sürümünde kurulmuş odalar U2 sürümünde varsayılan ayar ve havuzla açılır | `npm run check:migrations`; v0.1.1 depo dosyasıyla açılış testi | NFR5, C9 |
| NFR6.20 | U2 yeni bir dış hizmet ya da süreç eklemez; erişilebilirlik hedefi (%99, 30 gün) U1 düzeniyle karşılanır | Mimari denetim: yeni bağımlılık yok (tech-stack-decisions.md) | NFR6 |
