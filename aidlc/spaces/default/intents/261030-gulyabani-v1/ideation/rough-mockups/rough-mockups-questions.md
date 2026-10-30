# Kaba Taslaklar — Sorular

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.

Not: Sorular, onaylanan niyet beyanı (`ideation/intent-capture/intent-statement.md`), kapsam belgesi (`ideation/scope-definition/scope-document.md`), iş listesi (`ideation/scope-definition/intent-backlog.md`) ve `gulyabani-koylu-intent.md` dosyası göz önüne alınarak hazırlandı. Ekranların içeriği (Bölüm 8), oyun akışı (Bölüm 7), kart görsel dili (Bölüm 13) ve rehber (Bölüm 14) intent dosyasında zaten tarif edildiği için yeniden sorulmuyor; burada yalnızca yerleşimi ve kullanımı etkileyen açık noktalar soruluyor.

## Q1. [Ürün sahibi] Moderatör oyunu çoğunlukla hangi cihazdan yönetecek?

Moderatör ekranı çok bilgi taşıyor (anons metni, tüm oyuncular ve rolleri, gece olay günlüğü, gulyabani sohbeti, Boşboğaz onay kutusu, süre düğmeleri). Telefonda bunlar sekmelere bölünmek zorunda; bilgisayarda yan yana durabilir.

A. Çoğunlukla telefon: moderatör ekranı telefona göre, sekmeli tasarlanır
B. Çoğunlukla bilgisayar: moderatör ekranı geniş ve çok sütunlu tasarlanır; telefonda da çalışır ama sade
C. İkisi de eşit: önce telefona göre tasarlanır, bilgisayarda alanlar yan yana açılır
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q2. [Ürün sahibi] Oyun sonu memnuniyet sorusu hangi simgelerle sorulsun?

Oyun sonunda simgeli bir memnuniyet sorusu olacak ve raporda "memnuniyet ortalaması" hesaplanacak.

A. 5 yüz ifadesi (çok kötü → çok iyi)
B. 5 yıldız
C. 3 yüz ifadesi (kötü / orta / iyi)
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q3. [Tasarım] Oyuncu ekranı telefonda nasıl düzenlensin?

Oyuncu ekranında kendi kartı, oyuncu listesi, faz bilgisi ve geri sayım, sohbet, eylem alanı (oy verme, hedef seçme) ve Rehber düğmesi var. Telefonda hepsi aynı anda sığmaz.

A. Üstte sabit faz şeridi ve geri sayım; altta sekme çubuğu (Oyuncular / Sohbet / Kartım / Rehber); oy verme veya hedef seçme sırası gelince ekranın altından açılan bir panel
B. Tek uzun sayfa: üstte faz ve eylem, altında oyuncu listesi, en altta sohbet; aşağı kaydırarak gezilir
C. Sohbet ana alan; oyuncu listesi ve kart bir menüden açılır
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q4. [Tasarım] Gece sırası gelen oyuncuya nasıl haber verilsin?

Gece herkes karanlık "uyku" ekranında bekler. Sırası gelen oyuncunun (ör. Bekçi) bunu fark etmesi gerekir. Ancak oyuncular aynı anda görüntülü toplantıda; telefondan çıkan bir ses toplantıda duyulursa kimin uyandığı anlaşılabilir.

A. Yalnızca ekran değişir (uyku ekranı seçim ekranına döner)
B. Ekran değişir ve destekleyen telefonlarda kısa bir titreşim olur (ses yok)
C. Ekran değişir, titreşim ve kısa bir ses çalar (oyuncu sesi ayarlardan kapatabilir)
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q5. [Tasarım] Gündüz ekranları gece ekranlarından farklı görünsün mü?

Intent dosyası gece/gündüz temalı bir tasarım istiyor; palet gece çivit mavisi, kömür siyahı ve gaz lambası kehribarı.

A. Evet: gece koyu (çivit/kömür), gündüz açık tonlar (toprak, kerpiç, gün ışığı); faz değişince tema da değişir
B. Hayır: her zaman koyu tema; gündüz yalnızca üst şeritteki simge ve renk vurgusu değişir
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q6. [Tasarım] Erişilebilirlik hedefi ne olsun?

Intent dosyası metin kontrastı için WCAG AA'yı ve tarafların yalnızca renkle değil simgeyle de ayrılmasını (renk körlüğü) istiyor. Ekran okuyucu ve yalnızca klavyeyle oynama ek iş demek.

A. WCAG 2.1 AA'nın tamamı: kontrast, renk körlüğü, büyük dokunma alanları, klavyeyle oynama ve ekran okuyucu desteği
B. Görsel erişilebilirlik zorunlu (kontrast, renk körlüğü, büyük dokunma alanları, yazı büyütme); klavye ve ekran okuyucu desteği en iyi çabayla
C. Yalnızca intent dosyasındakiler (metin kontrastı ve taraf simgeleri)
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Moderatör ekranı: Önce telefona göre (sekmeli) tasarlanır; bilgisayarda aynı alanlar yan yana açılır (Q1)
- Memnuniyet sorusu: 3 yüz ifadesi (kötü / orta / iyi) (Q2)
- Oyuncu ekranı (telefon): Üstte sabit faz şeridi ve geri sayım; altta sekme çubuğu (Oyuncular / Sohbet / Kartım / Rehber); oy verme veya hedef seçme sırası gelince alttan açılan eylem paneli (Q3)
- Gece sırası uyarısı: Ekran değişir ve destekleyen telefonlarda kısa titreşim olur, ses çalmaz. iPhone tarayıcıları titreşimi desteklemediği için iPhone'da yalnızca ekran değişir (Q4)
- Tema: Gece koyu (çivit/kömür), gündüz açık tonlar (toprak, kerpiç, gün ışığı); faz değişince tema da değişir (Q5)
- Erişilebilirlik: WCAG 2.1 AA'nın tamamı: kontrast, renk körlüğü, büyük dokunma alanları, klavyeyle oynama ve ekran okuyucu desteği (Q6)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
