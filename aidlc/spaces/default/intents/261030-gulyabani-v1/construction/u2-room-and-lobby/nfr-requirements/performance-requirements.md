# Performans Gereksinimleri — U2 Oda ve Lobi

U1'in performans gereksinimleri (`../../u1-walking-skeleton/nfr-requirements/performance-requirements.md`, NFR1.1–NFR1.6, NFR10.1, NFR14.1) aynen geçerlidir. U2'nin yeni komutları aynı işleme yolundan geçer: sıra, depoya yazma, kabul, görünüm. Bu belge yalnızca U2'ye özgü hedefleri ekler. Alt numaralar 20'den başlar.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR1 tepki süresi, NFR9, NFR10, NFR11, NFR14).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 komut işleme, C5 görünüm).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; B1–B10, Ekranlar) ve `rules.md` (rules; BR13.1, BR17.5, BR18.2).
- U1 performans gereksinimleri ve ölçümleri: `construction/u1-walking-skeleton/code-generation/code-summary.md` (komut işleme süresi %95'te 2–5 ms).

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR1.20 | Moderatörün lobi komutları (ayar, havuz, devir, kapatma, en genç) ve giriş kararı, lobideki herkesin ekranına normal mobil bağlantıda %95'te 1 saniye içinde yansır | U1 ölçüm düzeneği: sunucu içi komut işleme süresi %95'te ≤ 150 ms (U1 NFR1 bütçesi); uçtan uca testte lobi komutlarının ölçümü | NFR1, BR16.1, BR17.2 |
| NFR1.21 | StartCheck (rol sayısı, önerilen gulyabani, 22 saat, uyarılar) her lobi görünümünde yeniden hesaplanır ve oyuncu sayısıyla doğrusal, saklanmayan bir hesaptır. 26 oyunculu lobide bir hesap 1 ms'nin altındadır | Kural birim testinde 26 oyunculu ve 9 rollü havuzla süre ölçümü | NFR1, BR17.5, BR18.2 |
| NFR1.22 | Giriş kararındaki çıkarma kaydı okuması oda kodu ve anahtar özetiyle tek bir dizinli aramadır; giriş komutunun işleme süresini U1 bütçesinin dışına taşımaz | Depo testinde aramanın dizin kullandığının denetimi; giriş komutu %95'te ≤ 150 ms | NFR1, BR13.1, BR14.4 |
| NFR1.23 | Ayar adım düğmeleri her dokunuşta bir komut göndermez; son dokunuştan 300 ms sonra tek bir `lobby.setSettings` gider. Böylece hızlı dokunuş U1 hız sınırına takılmaz | Ekran testi: 5 hızlı dokunuş tek komut | NFR1, NFR7 (hız sınırı), BR16.1 |
| NFR10.20 | Ayarlar sekmesi, Rol Havuzu paneli ve bekleme ekranı 320 piksel genişlikte yatay kaydırma olmadan kullanılır. Web paketinin sıkıştırılmış boyutu U1 bütçesinin (150 KB) içinde kalır | Erişilebilirlik taramasındaki 320 px kontrolü; `npm run check:bundle` | NFR10, functional-spec Ekranlar |
| NFR14.20 | 22 saat kuralı ve 30 dakikalık yasak sunucu saatiyle hesaplanır; istemci saati karar vermez | Sahte saatle kural testleri (22. saatin bir ms öncesi ve sonrası; yasağın 30. dakikası) | NFR14, BR14.4, BR18.1 |

## Arayüz, Dil ve Test Edilebilirlik

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR9.20 | Yeni denetimler WCAG 2.1 AA'ya uyar:<br>• anahtarlar ve adım düğmeleri en az 44x44 px;<br>• her denetimin görünür ve ekran okuyucuya söylenen bir etiketi var;<br>• seçili durum yalnızca renkle anlatılmaz (✓ ve `aria-pressed`/`aria-checked`);<br>• kilitli rol ve ayarlar `aria-disabled` taşır ve "Yakında" metni ekran okuyucuya okunur;<br>• adım düğmesi sınıra gelince pasifleşir ve aralık metni okunur | Erişilebilirlik taraması Ayarlar sekmesini, Rol Havuzu panelini, bekleme ekranını ve "Nasıl oynanır?" kartını açık ve koyu temada tarar; ciddi ya da kritik bulgu 0 | NFR9, BR16.5, BR17.8 |
| NFR11.20 | Rol adları ve kısa açıklamaları, ayar adları ve aralık metinleri, bekleme ekranı, "Yakında", yeni neden kodlarının mesajları ve "Nasıl oynanır?" kartı dahil bütün yeni metinler `content/tr.json`'dadır | U1'in katalog testi: koddaki her anahtar `tr.json`'da var, her neden kodunun `error.<kod>` metni var, kodda gömülü Türkçe yok | NFR11 |
| NFR12.20 | Rol havuzu doğrulaması, ön ayarlar, önerilen gulyabani sayısı, deste kurma, StartCheck ve "köyün en genci" oy sayımı saf kural modülündedir (GameRules). Testleri koddan önce yazılır; `src/rules` satır kapsamı %90'ın altına düşmez | Kural testlerinin kırmızı → yeşil çalıştırması; kapsam raporu | NFR12, team-practices Testing Posture |
| NFR12.21 | Kurallar `FeatureAvailability` listesini parametre alır. Testler hem canlı listeyle (yalnızca Gulyabani ve Köylü) hem bütün roller açıkken çalışır | Her iki listeyle havuz ve ön ayar testleri | NFR12, BR17.8 |
| NFR12.22 | Bot oyunculu uçtan uca test U2 için genişler:<br>• oyun sürerken bir bot gelir ve bekler;<br>• "Yeni oyun"da lobiye alınır;<br>• ikinci oyun değiştirilmiş ayarlarla (ör. canlı oylar kapalı, köyün en genci) ve "Klasik" ön ayarla başlar.<br>Bütün roller açık bir test sürümünde özel rollerin dağıtıldığı bir oyun da sonuna kadar oynanır; özel roller U3'e kadar Köylü gibi davranır | `npm run verify` içindeki uçtan uca test | NFR12, AC1.3.1, AC1.3.2, AC7.2.2 |
