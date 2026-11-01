# Sıralama Gerekçesi ve Riskler — Gulyabani–Köylü (çalışma adı)

Bu belge, yapım aşamasındaki **Bolt**'ların neden bu sırayla yapıldığını açıklar. Bolt, işin bir parçası (bir birim) üzerinden yapılan ve sonunda çalışan, sınanmış bir şey bırakan tek bir yapım turudur. Sıra: B1 (U1) → B2 (U2) → B3 (U3) → B4 (U4) → B5 (U5) → B6 (U6) → B7 (U7) → B8 (U8) (`bolt-plan.md`).

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Parçalar ve bağımlılıklar: `inception/units-generation/unit-of-work.md` (unit-of-work), `inception/units-generation/unit-of-work-dependency.md` (unit-of-work-dependency; bağımlılık bloğu ve paralel çiftler), `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR1, NFR2, NFR4, NFR7, NFR8, NFR13; açık sorular ISS-01…ISS-03, DEP-04, ASM-02).
- Hikâyeler ve ekranlar: `inception/user-stories/stories.md` (stories), `inception/refined-mockups/mockups.md` (mockups).
- Yapı taşları ve sözleşmeler: `inception/domain-design/components.md` (components), `inception/contract-design/contract-summary.md` (contract-summary; açık sorular ve inceleme bulguları).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; yürüyen iskelet AÇIK, tek ücretsiz sunucu).
- Fizibilite riskleri: `ideation/feasibility/raid-log.md` (RSK, ASM ve DEP satırları).
- [Q1]: `delivery-planning-questions.md` — iskeletten sonra önce oyunun tamamı (A).

## Kullanılan Yaklaşım

Sıra iki yaklaşımın birleşimidir:

1. **Önce yürüyen iskelet** (Cockburn, *Crystal Clear*): ilk Bolt, mimarinin bütün ana parçalarını en sade hâlleriyle gerçek bağlantı üzerinden birbirine bağlayan, baştan sona oynanabilen en küçük oyundur. Ekip bunu her zaman ister (team-practices Walking Skeleton) ve `mvp` kapsamı iskeleti açık tutar.
2. **Sonra önce risk ve değer** (Boehm'in risk öncelikli yaklaşımı; değer öncelikli sıralama): iskeletten sonra, hem en çok değer (9 rolle gerçek oyun) hem en çok kural riski taşıyan parçalar öne alınır. Bu sahibin kararıdır ([Q1] = A).

Ayrı bir puanlama modeli (ör. WSJF: değer, aciliyet ve risk azaltmanın iş büyüklüğüne bölündüğü sıralama puanı) kullanılmadı. Parçaların birbirine dayanması sırayı zaten büyük ölçüde belirliyor: U8 en sonda olmak zorunda, U7 U5'ten, U5 de U3 ve U4'ten sonra gelmek zorunda. Gerçek seçim yalnızca U4 ve U6'nın yeri üzerineydi; bu kadar dar bir seçim için puanlama gereksiz karmaşa olurdu.

## Bağımlılık Sırasına Uyum

Seçilen sıra (U1, U2, U3, U4, U5, U6, U7, U8) `unit-of-work-dependency.md`'deki bütün okları korur; bağımlılık sırasından sapma yoktur:

| Bolt | Dayandıkları | Önce mi yapıldı? |
|---|---|---|
| B2 U2 | U1 | Evet (B1) |
| B3 U3 | U2 | Evet (B2) |
| B4 U4 | U1 | Evet (B1) |
| B5 U5 | U3, U4 | Evet (B3, B4) |
| B6 U6 | U2 | Evet (B2) |
| B7 U7 | U5 | Evet (B5) |
| B8 U8 | U6, U7 | Evet (B6, B7) |

## Sıranın Gerekçesi

- **B1 U1 önce:** İskelet, en büyük bilinmeyenleri ilk haftada ortaya çıkarır: telefon ağlarında şifreli canlı bağlantının tutması (NFR4), ücretsiz sunucunun kurulup dış adreste çalışması (DEP-01), kalıcı depoya yazıp öyle kabul etmenin (ADR-004) çalışması ve gizli bilginin sızmaması (NFR8). Bunlardan biri tutmazsa, sonraki parçalara emek harcanmadan öğrenilir.
- **B2 U2, sonra B3 U3:** U3 en çok kuralı ve en karmaşık rol etkileşimlerini (ölüm zinciri, sevdalılar, Dertli) içerir ve %90 kapsam ister. Erken yapılırsa kural arayüzündeki (C3) zayıflıklar, üstüne başka parça kurulmadan görülür. U3, U2'ye dayandığı için U2 hemen önündedir. B3 bittiğinde 9 rolün hepsiyle gerçek oyun oynanabilir; bu sahibin istediği değerdir.
- **B4 U4:** Mezarlık ve sohbet güvenliği, U5'in (moderatörlük teklifi ölülere yapılır) ön koşuludur; bu yüzden U5'ten hemen önce gelir. Sohbet filtresi iskelet döneminde yoktur; bu dönemde sunucuda yalnızca sahibin ve arkadaşlarının deneme oyunları olacağı için kabul edilebilir.
- **B5 U5:** Bağlantı dayanıklılığının zor senaryoları (sunucu yeniden başlatma, moderatör kaybolursa) rollerin ve mezarlığın üstüne kurulur; U3 ve U4'ten sonra gelmek zorundadır.
- **B6 U6:** Rehber ve kart çizimleri yalnızca U2'ye dayanır; sahibin kararıyla ([Q1] = A) oyunun tamamından sonraya alındı. O zamana kadar kartlarda ad, simge ve kısa açıklama görünür.
- **B7 U7:** Kayda bağlanacak olayların hepsi U1–U5'te üretilir; bu yüzden U5'ten sonra gelir.
- **B8 U8:** Bütünün denetimi (tam gizli bilgi testi, erişilebilirlik, yük testi) bütün özellikler yerindeyken yapılır; en sonda olmak zorundadır.

## İskeletin Öne Alınan Korumaları

İskelet baştan herkese açık adreste çalıştığı için, önceki incelemelerin uyardığı üç açık iskelette kapatılır (`bolt-plan.md` B1):

| Açık | Kaynak | Karar |
|---|---|---|
| Yeni sürüm yükleme kuralı `activeMatches`'a dayanıyor, ama `/healthz` U8'e bırakılmıştı | Sözleşme incelemesi R-01; Birim incelemesi R-02 | `/healthz` temel alanlarıyla U1'de; U8 yalnızca ek ölçüm ekler |
| Oda kodu ve mesaj denemesine sınır U8'e kadar yoktu | Sözleşme incelemesi R-05; Birim incelemesi R-02 | Basit sınır U1'de; U8 yük altında sınar |
| 24 saatte silme U7'ye kadar yoktu, oysa project.md bunu her zaman ister | Birim incelemesi R-02; project.md Mandated | Oda, oyun, sohbet ve oturum silme tetiği U1'de; U7 kayıt ve geri bildirim silmelerini ekler |
| Komutların hangi yapı taşına gittiği yazılı değildi | Sözleşme incelemesi R-02 | U1 Fonksiyonel Tasarımı'nda yönlendirme tablosu yazılır |

## Risk Kaydı

| # | Risk | Olasılık | Etki | Önlem | Hangi Bolt'ta ortaya çıkar |
|---|---|---|---|---|---|
| R1 | U1 çok büyük (XL); iskelet gecikirse bütün yapım bekler (Birim incelemesi R-03) | Orta | Yüksek | İskeletin sırası bölümlere ayrılı (`unit-of-work-story-map.md` U1 sırası); gerekirse U1 Fonksiyonel Tasarımı'nda ertelenebilecek kalemler sahibe sorulur | B1 |
| R2 | Telefon ağlarında şifreli canlı bağlantı engellenir ya da sık kopar; v1'de yedek bağlantı yolu yok | Düşük | Yüksek | İskeletin gerçek telefon denemesi (Wi-Fi ve mobil veri) bunu ilk Bolt'ta ölçer; sorun çıkarsa U5'ten önce karar verilir | B1 |
| R3 | Oracle ücretsiz hesabı açılamaz ya da kapasite bulunamaz (DEP-01) | Orta | Yüksek | Yapımın en başında açılır; açılamazsa Azure yedektir (requirements Kısıtlar); iskelet o arada bilgisayarda ve bot testiyle ilerler | B1 öncesi |
| R4 | Ücretsiz sunucu 50 oda × 26 oyuncu yükünü taşımaz (ASM-02) | Orta | Orta | Her değişiklikte tam görünüm gönderimi U1'de ölçülebilir yazılır; U8 yük testi yayından önce ölçer; gerekirse sohbet geçmişi görünümde son N mesajla sınırlanır (contract-summary Açık Sorular) | B8 (ilk işaret B1'de) |
| R5 | Gizli bilgi sızıntısı (yanlış oyuncuya rol ya da sohbet gitmesi) | Düşük | Kritik | Tek görünüm süzgeci (ADR-002); her Bolt kendi eklediği bilginin gizli bilgi testini yazar; U8 tamamını sınar | Her Bolt |
| R6 | U3'ün kural etkileşimleri beklenenden karmaşık çıkar; %90 kapsam zorlanır | Orta | Orta | Kural testleri koddan önce yazılır; U3 erkenden yapılır | B3 |
| R7 | Küfür listesi ya da kelime listesi zamanında hazır olmaz (DEP-04, A19) | Düşük | Düşük | Listeleri ben hazırlarım; sahip yalnızca gözden geçirir | B3, B4 |
| R8 | Sunucu yeniden başlatmada kabul edilmiş işlem kaybolur | Düşük | Yüksek | "Önce kaydet, sonra kabul et" (ADR-004) iskelette kurulur; U5 yeniden başlatma senaryosunu bot testine ekler | B5 (temeli B1'de) |

## Bolt Denetim Noktaları

Her Bolt'tan sonra sahip denetim noktasını onaylar; onay olmadan sıradakine geçilmez. İskelet denetim noktası iki kanıt ister: bot oyunculu uçtan uca testin geçmesi ve gerçek telefonlarla yeniden bağlanma denemesi (team-practices Walking Skeleton). Bir Bolt'ta öğrenilen (ör. bağlantı ya da yük sorunu) sonraki Bolt'ların tasarımına aktarılır.
