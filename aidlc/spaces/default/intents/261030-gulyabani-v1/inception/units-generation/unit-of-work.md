# Parçalar (Birimler) — Gulyabani–Köylü (çalışma adı)

v1, yapım aşamasında tek tek yazılıp sınanacak 8 parçaya bölündü. Her parça, sunucu kodu, ekranları ve testleriyle birlikte çalışan bir özellik dilimidir; bütün parçalar **tek bir sunucu programının** içindedir ve tek ücretsiz Oracle sunucusunda çalışır. Parçalar, Alan Tasarımı'ndaki yapı taşlarını (`components.md`) hangi sırayla ve ne kadar büyüttüklerine göre ayrılır; bir yapı taşı birden çok parçada büyüyebilir, ama her parça yalnızca kendi özelliğini ekler. Bu belge yapı (topoloji) içindir: hangi parçanın önce yapılacağına Teslimat Planlaması karar verir.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Yapı taşları: `inception/domain-design/components.md` (components; 13 yapı taşı, yürüyen iskelette kullanılanlar).
- Mimari kararlar: `inception/domain-design/decisions.md` (decisions; ADR-001…ADR-009).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; FR1–FR21, NFR1–NFR15).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US1.1–US13.5, [İskelet] etiketli 16 hikâye).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (yürüyen iskelet AÇIK, test sırası, kapsam sınırları, tek ücretsiz sunucu).
- [Q1]: `units-generation-questions.md` — 8 parça (A). Diğer ayrıntılar sahibin kuralı gereği (project.md Corrections) benim seçtiğim varsayılanlardır ve özet onayıyla onaylandı (Looks correct).

## Parça Tablosu

| Unit ID | Directory | Ad | Tür | Büyüklük | Dağıtım |
|---|---|---|---|---|---|
| U1 | u1-walking-skeleton | Yürüyen iskelet | service | XL | Tek sunucu programının çekirdeği |
| U2 | u2-room-and-lobby | Oda ve lobinin tamamı | service | M | Aynı programa gömülü |
| U3 | u3-role-abilities | Rol yetenekleri | service | L | Aynı programa gömülü |
| U4 | u4-graveyard-and-chat-safety | Mezarlık ve sohbet güvenliği | service | M | Aynı programa gömülü |
| U5 | u5-connection-resilience | Bağlantı dayanıklılığı | service | L | Aynı programa gömülü |
| U6 | u6-guide-and-cards | Rehber ve kartlar | ui | M | Aynı web uygulamasına gömülü |
| U7 | u7-records-feedback-report | Kayıtlar, geri bildirim ve rapor | service | M | Aynı programa gömülü; rapor sunucuda komutla çalışır |
| U8 | u8-quality-and-load | Kalite ve yük | service | M | Aynı programa gömülü; yük testi araçları yalnızca test ortamında |

Tür açıklaması: `service` = sunucuda çalışan programa özellik ekleyen dilim (sunucu kodu, ilgili ekranlar ve testler birlikte); `ui` = ağırlıkla ekran ve içerik ekleyen dilim. Büyüklük göreli tahmindir (S/M/L/XL).

## Ortak Kurallar (her parça için)

- **Test sırası:** oyun kuralı kodunda önce test, sonra kod; diğer katmanlarda önce kod, hemen ardından testi. Satır kapsamı tüm kodda en az %80, oyun kuralı kodunda en az %90; test başarısızsa ya da kapsam düşükse parça `main`'e eklenmez (team-practices Testing Posture).
- **Bot oyunculu uçtan uca test** iskeletle başlar ve her parça kendi özelliğini bu teste ekler (NFR12, ADR-009).
- **Gizli bilgi:** her parça, eklediği her yeni bilgiyi VisibilityFilter'dan geçirir ve o bilgi için gizli bilgi testini yazar (NFR8, ADR-002, C-07).
- **Erişilebilirlik, Türkçe metin ve mobil öncelik:** her parçanın ekranları WCAG 2.1 AA'ya uyar, metinler ayrı Türkçe metin dosyasındadır, 320 pikselde yatay kaydırma olmaz (NFR9–NFR11). Parça U8 bunları baştan sona denetler; ama her parça kendi ekranlarını bu kurallarla yazar.
- **IP yok, sır yok:** hiçbir parça IP adresini saklamaz; şifre ve anahtar koda ya da depoya yazılmaz (project.md Forbidden).

---

## U1 — Yürüyen iskelet (`u1-walking-skeleton`)

**Açıklama:** Yalnızca Gulyabani ve Köylü rolleriyle baştan sona oynanabilen en küçük tam oyun. Bütün ana yapı taşlarının birbirine gerçekten bağlandığını kanıtlar ve baştan ücretsiz Oracle sunucusunda dış adreste çalışır (team-practices Walking Skeleton).

**Sınırlar ve sorumluluklar:**
- **ContentCatalog:** 2 rolün (Gulyabani, Köylü) tanımı, ayrı Türkçe metin dosyasının yapısı ve iskelet ekranlarının metinleri.
- **GameRules:** rol dağıtımı (kriptografik rastgelelik, FR4.1), iskelet için rol havuzu doğrulaması (en az 3 oyuncu, önerilen gulyabani sayısı), ilk gece ve standart gece (yalnızca gulyabani adımı), gulyabani ortak kararı ve eşitlik (FR6), sabah sonucu, oylama, yeniden oylama, son söz, onay oylaması, infaz (FR9), kazanma kontrolü (yalnızca Köylüler / Gulyabaniler, erken bitiş; FR11.1 madde 3–4), geçersiz komutun reddi (AC13.5.1).
- **RoomManager:** oda kodu ve link üretimi, nick kuralları, odaya katılma, lobi, oyunu başlatma (3–26 oyuncu), "Yeni oyun" ile lobiye dönüş (bekleyenler olmadan).
- **MatchFlow:** fazlar, moderatör adımları, sayaçlar (sunucuda bitiş zamanı, FR14.8), gündüz süresinin uzatılması ve duraklatılması, her işlemin kalıcı depoya yazıldıktan sonra kabul edilmesi ve sırayla işlenmesi (ADR-004, AC13.5.3). Moderatör kaybolursa kuralı bu parçada yoktur; moderatör dönene kadar beklenir (FR14.5).
- **VisibilityFilter:** iskeletteki bütün bilgiler için alıcıya özel görünüm (kendi rolü, gulyabanilerin kimliği, gulyabani sohbeti, oylar, gece ekranlarının aynılığı).
- **ConnectionGateway:** yalnızca şifreli bağlantı, tahmin edilemez oturum belirteci, sayfa yenilenince ve bağlantı kopup gelince aynı ekrana dönme (FR14.1–FR14.3, NFR4), moderatöre "kopuk" bilgisi, sunucu saati eşitlemesi (NFR14).
- **ChatService:** gündüz sohbeti ve gulyabani sohbeti; yazma izinleri (gece kapalı, son sözde yalnızca sanık), 300 karakter ve düz metin kuralı.
- **WebClient:** ana sayfa (KVKK bilgilendirmesiyle), giriş, lobi, kart görme, Uyku ekranı, gulyabani eylem paneli, sabah, gündüz, oylama, oyun sonu, moderatör ekranı (telefonda sekmeli, bilgisayarda sütunlu), bağlantı şeridi.
- **BotPlayer:** botların ve bot moderatör sürücüsünün tam bir oyunu kazananla bitirdiği uçtan uca test; Construction doğrulama komutu bunu çalıştırır.

**Uygulama notları ve kısıtlar:**
- İskelet, gerçek telefonlarda yeniden bağlanma denemesinden (Wi-Fi ve mobil veri, başka uygulamaya geçip dönme, ekran kilidi) ve bot testinden geçmeden sonraki parçalara geçilmez (team-practices Walking Skeleton).
- Oracle sunucusu bu parçanın başında kurulur; ortam kurulumunun ayrıntısı sonraki ortam aşamalarında yazılır (team-practices Deployment).
- Kalıcı veri deposu ve programlama dili bu parçadan önce NFR ve altyapı aşamalarında seçilir (ISS-02).

## U2 — Oda ve lobinin tamamı (`u2-room-and-lobby`)

**Açıklama:** Oda ve lobinin iskelette olmayan bütün kuralları ve v1'in 9 rolünün katalogdaki tanımları.

**Sınırlar ve sorumluluklar:**
- **RoomManager:** oyun sürerken gelen kişinin bekleme ekranı ve "Yeni oyun"da lobiye alınması (FR1.6, FR17.2), bekleyenler dahil 26 kişi sınırı (FR2.4), 17 ayar ve izinli aralıkları (FR2.6), rol havuzu ve ön ayarlar (FR3), lobide ve bekleyenlerde çıkarma, art arda 2 çıkarmada 30 dakika yasak, "Yeni isteklere kapat" (FR2.3), lobide moderatörlük devri (FR2.2), köyün en genci işareti (FR2.7), oda kurulduktan 22 saat sonra yeni oyun başlatılamaması (FR17.2), interaction-spec'teki 9 satırlık giriş kuralının tamamı.
- **ContentCatalog:** 9 rolün tanımları (ad, taraf, simge, kısa açıklama, küçük kart görselinin yolu, ön ayar üyelikleri) — Rol Havuzu paneli bunları listeler (FR3.1).
- **GameRules:** 9 rollük havuz doğrulaması (FR3.2–FR3.5) ve ayarların oyuna aktarılması.
- **WebClient:** bekleme ekranı, Ayarlar sekmesi, Rol Havuzu paneli, "Nasıl oynanır?" kartı (FR2.5), moderatörün son havuz ve ayarlarının tarayıcıda hatırlanması (FR2.8).

**Uygulama notları:** Rollerin yetenekleri bu parçada çalışmaz; yalnızca havuzda seçilebilir ve doğrulanır. Ayarların oyundaki etkisi, ilgili kuralı yazan parçada sınanır (ör. Ürkek olasılığı U3'te).

## U3 — Rol yetenekleri (`u3-role-abilities`)

**Açıklama:** 7 özel rolün yetenekleri, tam ölüm zinciri ve oyun sırasında oyuncu çıkarma.

**Sınırlar ve sorumluluklar:**
- **GameRules:** Boşboğaz Gulyabani ve gizli kelime (FR10.1), Bekçi (FR10.2), Ürkek (FR10.3), Ahbaplar (FR10.4), Celalli Damat (FR10.5), Dertli (FR10.6), Görücü ve sevdalılar (FR10.7–FR10.8); ilk gece adım sırasının tamamı (FR5.1), kapalı ve ölü rol adımlarının atlanması (FR5.3); tam ölüm zinciri (Celalli Damat → sevdalı → Dertli → kazanma; FR7.2) ve kazanma kontrolünün tamamı (FR11.1).
- **MatchFlow:** rol adımlarının sayaçları, ölü rol adımının 8–15 saniyelik rastgele beklemeyle atlanması, oyun sırasında oyuncu çıkarmanın ölüm olarak işlenmesi (FR15).
- **RoomManager:** oyunda çıkarılanın kaydı ve aynı tarayıcıdan geri girememesi (FR15.3).
- **ChatService:** Boşboğaz'ın gizli kelimesinin gündüz sohbetinde algılanması (FR10.1).
- **ContentCatalog:** "her gün yeni kelime" listesi (en az 30 Türkçe kelime).
- **VisibilityFilter:** Bekçi sonucu, gizli kelime, Ürkek uyarısı, Sevdalı ve Ahbap rozetleri.
- **WebClient:** rol eylem panelleri, rozetler, moderatör ekranındaki Boşboğaz onay kutusu ve Dertli süre göstergesi.
- **BotPlayer:** farklı rol havuzu kombinasyonlarıyla tam oyun.

**Uygulama notları:** En fazla kural bu parçadadır; kuralların testleri koddan önce yazılır ve %90 kapsam ister.

## U4 — Mezarlık ve sohbet güvenliği (`u4-graveyard-and-chat-safety`)

**Açıklama:** Ölü oyuncuların mezarlık deneyimi ve sohbet güvenliği.

**Sınırlar ve sorumluluklar:**
- **ChatService:** Mezarlık Sohbeti (FR12.2), kelime filtresi (FR16.3; aynı liste nick kontrolünde de), mesaj şikayeti ve moderatörün Sohbet sekmesindeki işaret (FR16.4).
- **VisibilityFilter:** hayalet modu (FR12.3), Mezarlık Sohbeti'nin yaşayanlara gitmemesi.
- **RoomManager:** nick'te filtre listesi kontrolü (FR1.4).
- **WebClient:** mezarlık ekranı, gri ölü oyuncu ve açılmış rolü (FR12.4), şikayet menüsü.

**Uygulama notları:** Şikayetin 1 yıllık kalıcı kaydı (FR16.5) U7'de yazılır; bu parça şikayeti odada işaretler ve kayıt için bir olay yayınlar. Küfür listesinin kaynağı açık sorudur (DEP-04); bu parçaya kadar seçilmelidir.

## U5 — Bağlantı dayanıklılığı (`u5-connection-resilience`)

**Açıklama:** İskeletteki temel yeniden bağlanmanın üstüne kopma ve arıza durumlarının tamamı.

**Sınırlar ve sorumluluklar:**
- **MatchFlow:** kopan oyuncunun sırası olan adımın 5 dakikaya uzaması ve "hâlâ kopuk" uyarısı (FR14.4); moderatör kaybolursa kuralı — duraklatma, 3 dakika bekleme, ölülere 3 dakikalık moderatörlük teklifi, "Moderatör yok" ekranı, ölüler arasında devir (FR14.5, ADR-007); sunucu yeniden başlayınca oyunların ve sayaçların kalan süreyle geri yüklenmesi (FR14.6, NFR5).
- **ConnectionGateway:** ikinci sekme ya da cihazda son bağlantının devralması (FR14.7), moderatör onayıyla yeniden katılmada eski oturumun geçersiz olması (AC9.6.2).
- **RoomManager:** yeniden katılma isteği ve iki adımlı onay (US9.6).
- **ChatService:** moderatör olan ölü oyuncunun Mezarlık Sohbeti'ne yazamaması (FR14.5).
- **WebClient:** "Moderatör bekleniyor", moderatörlük teklifi, "Moderatör yok", "Oyun başka bir pencerede açıldı", yeniden katılma isteği ekranları.
- **BotPlayer:** kopma, ikinci sekme, moderatör kaybolursa ve sunucu yeniden başlatma senaryoları.

## U6 — Rehber ve kartlar (`u6-guide-and-cards`)

**Açıklama:** Rehber'in üç sekmesi ve 9 kartın özgün çizimleri.

**Sınırlar ve sorumluluklar:**
- **ContentCatalog:** Rehber içeriği (Kartlar, Nasıl Oynanır, Moderatör Rehberi; FR18.2–FR18.4), kartların büyük ön yüz ve ortak arka yüz görselleri (FR19), strateji ipuçları ve atmosfer sözleri.
- **WebClient:** ana sayfadan, lobiden ve oyun içinden oyunu durdurmadan açılan Rehber katmanı (FR18.1), taraf filtreleri ve "Bu odada aktif roller" filtresi (FR18.2).

**Uygulama notları:** Rehber karakter açıklamalarını oyunun kullandığı kart verisinden üretir, ayrı kopya tutmaz (FR18.5); kimin hangi rolde olduğunu hiç göstermez (FR18.6). Kartlar ve metinler özgündür (C-18). Görünümle ilgili onaylar resimle istenir (project.md Corrections).

## U7 — Kayıtlar, geri bildirim ve rapor (`u7-records-feedback-report`)

**Açıklama:** Kayıt defteri, otomatik silmeler, oyuncu geri bildirimi ve sahibe rapor.

**Sınırlar ve sorumluluklar:**
- **EventRecorder:** FR20.1'deki olayların IP'siz kaydı (FR20.2), mesaj şikayetinin kalıcı kaydı (FR16.5), 1 yıl ve 1 ay saklama.
- **FeedbackService:** oyun sonu memnuniyeti, öneri/şikayet ve "Sorun bildir" (FR17.3–FR17.5); aynı gönderimin tekrarında ikinci kayıt açılmaması.
- **Housekeeping:** 24 saatte oda, oyun, sohbet ve oturum (Session) verisinin; 1 ayda şikayet metninin; 1 yılda kayıt ve geri bildirimlerin silinmesi; kapalıyken kaçırılan silmelerin açılışta yapılması (FR20.3–FR20.4). Her veriyi sahibi siler (ADR-006).
- **OwnerReport:** sunucuda tek komutla Türkçe rapor dosyası (FR21).
- **Diğer yapı taşları:** önceki parçaların ürettiği oda, oyun, bağlantı ve moderatör olayları bu parçada kayda bağlanır.
- **WebClient:** "Oyun nasıldı?", "Öneri/Şikayet yaz" ve "Sorun bildir" ekranları; gönderilemezse "Tekrar dene".

**Uygulama notları:** Alan Tasarımı incelemesinden devreden R-01 (24 saatlik silmenin sahipliği) burada kapanır: MatchFlow kendi oyun verisini, ConnectionGateway oturum verisini, RoomManager oda verisini, ChatService mesajları siler; Housekeeping yalnızca zamanında tetikler. Bu sahiplik Fonksiyonel Tasarım'da kesinleşir.

## U8 — Kalite ve yük (`u8-quality-and-load`)

**Açıklama:** Bütün özellikler yerindeyken ortak niteliklerin baştan sona denetimi.

**Sınırlar ve sorumluluklar:**
- **VisibilityFilter ve BotPlayer:** görünürlük tablosundaki her bilgi ve her alıcı türü için tam gizli bilgi testi (US13.1).
- **ConnectionGateway:** mesaj (10 saniyede 5) ve oda kodu denemesi (dakikada 10) hız sınırları (NFR7).
- **Yük testi:** 50 oda × 26 oyuncu + moderatörle tepki süresi ölçümü (NFR1, NFR2); ücretsiz sunucunun yükü taşıdığının doğrulanması (ASM-02).
- **WebClient:** CI'da otomatik erişilebilirlik taraması, elle ekran okuyucu ve klavye denemesi listesi, desteklenmeyen tarayıcı uyarısı (NFR9, NFR10).
- **Sunucu:** sağlık kontrolü adresi ve temel ölçümler (NFR13).

**Uygulama notları:** Bu parça önceki parçaların kendi testlerini yazma yükümlülüğünü kaldırmaz; onların üstüne bütünü sınar.

## Assumptions & Open Questions

- [assumption] Bütün parçalar tek bir sunucu programında çalışır; ayrı servislere bölme yoktur (C-01, C-10, C-11). Ölçüm (U8) bunun yetmediğini gösterirse ileride değiştirilebilir.
- [assumption] Kalıcı veri deposu, programlama dili ve barındırma ayrıntısı NFR ve altyapı aşamalarında, U1 yazılmadan önce seçilir (ISS-02).
- Açık sorular gereksinim belgesindeki gibi duruyor: küfür listesinin kaynağı (DEP-04, U4'e kadar), "her gün yeni kelime" listesinin içeriği (A19, U3'e kadar), yayın aşamaları (ISS-03).
- Alan Tasarımı incelemesinden devreden R-02…R-05 ve Ayrıntılı Taslaklar'dan devreden R-08, R-10 Fonksiyonel Tasarım'da ele alınır.
