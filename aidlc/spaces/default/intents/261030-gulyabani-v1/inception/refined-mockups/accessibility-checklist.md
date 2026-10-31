# Erişilebilirlik Denetim Listesi — Gulyabani–Köylü (çalışma adı)

Hedef: **WCAG 2.1 AA'nın tamamı** (NFR9, proje kuralı). Bu liste, AA düzeyindeki 50 başarı ölçütünün her birinin bu oyunda nasıl karşılandığını, hangi ekranda geçerli olduğunu ve nasıl sınanacağını yazar. Ekranlar `mockups.md`, davranışlar `interaction-spec.md`, renkler ve ölçüler `design-system-mapping.md` dosyasındadır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Kaba taslaklar: `ideation/rough-mockups/wireframes.md` (wireframes; Genel İlkeler erişilebilirlik maddeleri) ve `ideation/rough-mockups/user-flow.md` (user-flow; Akışlarda Erişilebilirlik).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR9 ve tek istisnası, FR5.5, FR13.4, NFR10).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US13.2 AC13.2.1–AC13.2.4, US11.3 AC11.3.2–AC11.3.3, US13.3 AC13.3.1).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; CI'da otomatik erişilebilirlik taraması, elle ekran okuyucu ve klavye denemesi).
- [Q1]–[Q4]: `refined-mockups-questions.md` (özet onayı: Looks correct).

## Bilinçli Tek Sapma

- **Gece sırası ekran okuyucuya duyurulmaz.** Sırası gelen oyuncunun ekranı yalnızca görsel olarak değişir; canlı duyuru yapılmaz, odak kodla taşınmaz, sayfa başlığı değişmez. Neden: sesli duyuru toplantıda duyulur ve oyuncunun rolünü ele verir. Sahibin onayladığı bilinçli sapmadır (NFR9, FR5.5, requirements [Q17], AC13.2.3). İlgili ölçüt 4.1.3 Durum Mesajları'dır.
- Etkisini azaltmak için: ilk gece anonsu herkese gece ekranlarına bakmalarını hatırlatır (FR13.4); Rehber'in sık sorulanlarında "Gece sıramı nasıl anlarım?" ve ekran okuyucu kullananlara kulaklık önerisi vardır (FR18.3, wireframes W-12); klavye kullanan oyuncu Tab'a basınca panelin ilk seçeneğine gelir.

## Sınama Yolları

| Kısaltma | Yol | Ne zaman |
|---|---|---|
| OT | Otomatik tarama (ör. axe) CI'da her ekran ve her tema için; ihlal varsa birleştirme durur | Her değişiklikte (team-practices Testing Posture) |
| KL | Yalnızca klavyeyle tam bir oyun | Her yeni ekranda, elle |
| EO | Ekran okuyucu: iPhone'da VoiceOver, Android'de TalkBack, bilgisayarda NVDA | Her yeni ekranda, elle |
| GB | Görsel denetim: 320 piksel genişlik, %200 yazı büyütme, renk körlüğü simülasyonu, hareket azaltma | Her yeni ekranda, elle |
| KO | Kontrast hesabı (belirteç tablosu) | Renk değişince |

## Algılanabilir

| Ölçüt | Düzey | Bu oyunda nasıl karşılanır | Ekranlar | Sınama |
|---|---|---|---|---|
| 1.1.1 Metin dışı içerik | A | Kart çizimlerinin kısa açıklaması var ("Fenerli bekçi, köy yolunda"); süs çizimleri ve kilim motifi gizli; simgelerin yanında hep yazı var; logo düz metinle okunur | Hepsi | OT, EO |
| 1.2.1 Yalnızca ses/görüntü | A | Uygulanmaz: oyunda ses ya da video yok | — | — |
| 1.2.2 Altyazı (kayıtlı) | A | Uygulanmaz: video yok | — | — |
| 1.2.3 Sesli betimleme ya da alternatif | A | Uygulanmaz: video yok | — | — |
| 1.2.4 Altyazı (canlı) | AA | Uygulanmaz: oyunda canlı ses/görüntü yok; toplantı ayrı uygulamada (requirements Kapsam Dışı) | — | — |
| 1.2.5 Sesli betimleme (kayıtlı) | AA | Uygulanmaz: video yok | — | — |
| 1.3.1 Bilgi ve ilişkiler | A | Her ekranda bir h1, bölgeler (header / nav / main / footer), listeler liste, seçim grupları `radiogroup`, hata metinleri alana bağlı | Hepsi | OT, EO |
| 1.3.2 Anlamlı sıra | A | Okuma sırası görünüş sırasıyla aynı; bilgisayarda iki/üç sütunda sıra soldan sağa | M-11, M-17 | EO |
| 1.3.3 Duyusal özellikler | A | Yönergeler yer ya da renk anmaz ("yeşil düğme" değil, "Oyunu Başlat düğmesi") | Hepsi | Elle metin taraması |
| 1.3.4 Yön | AA | Telefon dikey ve yatayda çalışır; yön kilidi yok | Hepsi | GB |
| 1.3.5 Girdi amacını belirleme | AA | Nick alanı "takma ad" amacıyla işaretli; oda kodu rakam alanı | M-01, M-02 | OT |
| 1.4.1 Rengin kullanımı | A | Taraf: renk + simge + yazı; durum (öldü, kopuk, seçili, hata): renk + simge + yazı; geri sayımın son saniyeleri: renk + sayı | M-05, M-10, M-11, M-13 | GB (renk körlüğü), AC11.3.2 |
| 1.4.2 Ses denetimi | A | Uygulanmaz: oyun hiç ses çalmaz | — | — |
| 1.4.3 Kontrast (en az) | AA | Bütün metinler iki temada da 4.5:1 üstü (en düşük: gündüz `color.success` 5.54); değerler `design-system-mapping.md` Renk Belirteçleri | Hepsi | KO, OT, AC11.3.3 |
| 1.4.4 Metni yeniden boyutlandırma | AA | Yazı boyutları rem; %200 büyütmede kesilme ve üst üste binme yok | Hepsi | GB |
| 1.4.5 Yazı resimleri | AA | Yalnızca oyunun logosu çizimdir (izinli istisna); faz geçiş başlıkları ve kart metinleri gerçek metindir | M-01, M-05, M-06 | Elle |
| 1.4.10 Yeniden akış | AA | 320 piksel genişlikte hiçbir ekranda yatay kaydırma yok (AC13.3.1) | Hepsi | GB, OT |
| 1.4.11 Metin dışı kontrast | AA | Alan kenarları 3.57–3.76:1, odak halkası 6.7:1 üstü, anahtar ve seçim daireleri 3:1 üstü | Hepsi | KO |
| 1.4.12 Metin aralığı | AA | Satır, harf ve paragraf aralığı kullanıcı ayarıyla büyütülünce metin kesilmez (sabit yükseklikli kutu yok) | Hepsi | GB |
| 1.4.13 Üzerine gelince ya da odakta içerik | AA | [?] yardım kutusu Esc ile kapanır, üzerine gelinince kaybolmaz, kendiliğinden kapanmaz | M-10 | KL |

## Kullanılabilir

| Ölçüt | Düzey | Bu oyunda nasıl karşılanır | Ekranlar | Sınama |
|---|---|---|---|---|
| 2.1.1 Klavye | A | Her işlev klavyeyle: kart çevirme (Enter/Boşluk), seçimler (ok tuşları), şikayet (mesajın menü düğmesi), sekmeler (ok tuşları) (AC13.2.2) | Hepsi | KL |
| 2.1.2 Klavye tuzağı yok | A | Pencerelerde odak içeride kalır ama Esc ile çıkılır; moderatörlük teklif kartında Esc kartı kapatmaz ama [Hayır] her zaman Tab ile ulaşılır (10 saniye sonra etkin); Uyku ekranında odaklanacak öğe yoktur, tuzak yoktur; faz geçiş kartı 2 saniye sonra kendiliğinden kaybolur | M-06, M-07, M-14, M-18 | KL |
| 2.1.4 Tek tuş kısayolları | A | Tek harfli kısayol yok | — | KL |
| 2.2.1 Zamanlamanın ayarlanabilmesi | A | Oyun süreleri gerçek zamanlı bir oyunun zorunlu parçasıdır (ölçütün "gerçek zamanlı olay" istisnası); yine de moderatör her süreyi uzatabilir ve duraklatabilir (FR8.1), lobide bütün süreler ayarlanabilir (FR2.6); kopan oyuncuya 5 dakika tanınır (FR14.4). Moderatörlük teklifindeki 10 saniye bir süre sınırı değil, yanlışlıkla basmayı önleyen bekleme süresidir; teklif yanıtlanana kadar açık kalır | M-04, M-08, M-10, M-11, M-18 | Elle |
| 2.2.2 Durdur, duraklat, gizle | A | Kendiliğinden hareket eden içerik yalnızca geri sayım ve sohbettir; ikisi de oyunun zorunlu parçası; moderatör sayacı duraklatabilir; faz geçiş kartı 5 saniyeden kısadır | M-06, M-10 | Elle |
| 2.3.1 Üç parlama | A | Hiçbir şey yanıp sönmez; son 10 saniyede yalnızca renk değişir | Hepsi | Elle |
| 2.4.1 Blokları atlama | A | Bölgeler (header / nav / main) ve her sayfanın başında "İçeriğe geç" bağlantısı | Hepsi | KL, EO |
| 2.4.2 Sayfa başlığı | A | Her ekranın tarayıcı başlığı var ("Lobi · Oda 482913"); gece herkeste aynı: "Gece · Oda 482913" (rol ya da sıra yazmaz) | Hepsi | OT, Elle |
| 2.4.3 Odak sırası | A | Odak görünüş sırasını izler; pencere kapanınca açan düğmeye döner; gece odak kodla taşınmaz (Bilinçli Tek Sapma) | Hepsi | KL |
| 2.4.4 Bağlantı amacı | A | Bağlantı ve düğme metinleri tek başına anlaşılır ("Gizlilik ayrıntısı", "Rehber'i aç") | Hepsi | EO |
| 2.4.5 Birden çok yol | AA | Ekranlar çoğunlukla bir sürecin adımlarıdır (ölçütün istisnası); Rehber ana sayfadan, lobiden ve oyun içinden açılır | M-14 | Elle |
| 2.4.6 Başlıklar ve etiketler | AA | Her ekranın ve bölümün açık başlığı; her alanın görünen etiketi | Hepsi | EO |
| 2.4.7 Görünür odak | AA | 3 piksel `color.accent` odak halkası, iki temada da görünür; odak halkası hiçbir yerde kaldırılmaz | Hepsi | KL |
| 2.5.1 İşaretçi hareketleri | A | Kaydırma ya da çok parmaklı hareket gerektiren işlem yok; mesaja uzun basmanın yanında menü düğmesi de var | M-10 | Elle |
| 2.5.2 İşaretçi iptali | A | Düğmeler parmak kaldırılınca çalışır; parmak düğmeden kaydırılırsa işlem olmaz | Hepsi | Elle |
| 2.5.3 Addaki etiket | A | Ekran okuyucunun okuduğu ad görünen yazıyla başlar ("Oyunu Başlat") | Hepsi | OT |
| 2.5.4 Hareketle çalıştırma | A | Telefonu sallama ya da eğme ile çalışan işlem yok | — | — |

## Anlaşılabilir

| Ölçüt | Düzey | Bu oyunda nasıl karşılanır | Ekranlar | Sınama |
|---|---|---|---|---|
| 3.1.1 Sayfanın dili | A | Sayfa dili Türkçe olarak işaretli; ekran okuyucu Türkçe okur (NFR11) | Hepsi | OT |
| 3.1.2 Bölümlerin dili | AA | Başka dilde metin yok; oyuncunun yazdığı mesajlar sayfa dilinde okunur | — | — |
| 3.2.1 Odakta | A | Odaklanınca hiçbir şey kendiliğinden değişmez | Hepsi | KL |
| 3.2.2 Girdide | A | Anahtarlar ve seçiciler yalnızca kendi ayarını değiştirir; ekran değiştirmez. Seçim gönderimi her zaman ayrı bir düğmeyle olur ("Seçimi Onayla", "Oyumu Ver") | M-04, M-08, M-10 | KL |
| 3.2.3 Tutarlı gezinme | AA | Oyuncu sekmeleri ve moderatör sekmeleri her fazda aynı sırada ve yerde | M-10, M-11 | Elle |
| 3.2.4 Tutarlı tanımlama | AA | Aynı işlev her yerde aynı adı taşır ("Rehber", "Tekrar dene", "Sonraki Adım") | Hepsi | Elle metin taraması |
| 3.3.1 Hata tanımlama | A | Hata metinle ve simgeyle, alanın hemen altında yazar ("Bu nick odada kullanılıyor") | M-01, M-02, M-04 | EO |
| 3.3.2 Etiketler ya da yönergeler | A | Alanların üstünde etiket ve kural ("Nick (2-16 karakter)", "6 haneli kodu gir") | M-01, M-02, M-04 | Elle |
| 3.3.3 Hata önerisi | AA | Hata ne yapılacağını söyler ("başka bir nick seç", "1–15 dk arasında olmalı", "Bir rolü kapat ya da oyuncu bekle") | M-02, M-04 | Elle |
| 3.3.4 Hata önleme (yasal, mali, veri) | AA | Yasal ya da mali işlem yok; geri alınamayan işlemler (çıkarma, devir) onay penceresi ister; yeniden katılma onayı iki adımlıdır ("Onayla..." ve "Emin misin?"); moderatörlük teklifinin düğmeleri 10 saniye sonra açılır | M-04, M-11, M-18 | Elle |

## Sağlam

| Ölçüt | Düzey | Bu oyunda nasıl karşılanır | Ekranlar | Sınama |
|---|---|---|---|---|
| 4.1.1 Ayrıştırma | A | Geçerli, iyi biçimlenmiş sayfa yapısı; aynı kimlik iki kez kullanılmaz | Hepsi | OT |
| 4.1.2 Ad, rol, değer | A | Yerel öğeler önceliklidir (düğme, onay kutusu); özel parçalar doğru rolü taşır (anahtar `switch`, adet seçici `spinbutton`, kart `button` + basılı durumu, sekmeler `tablist`) | Hepsi | OT, EO |
| 4.1.3 Durum mesajları | AA | Faz değişimi, yeni sohbet mesajı, bağlantı kopma/gelme, "Şikayetin alındı", oylama sonucu, hata metinleri odak değişmeden duyurulur. **İstisna:** gece sırası duyurulmaz (Bilinçli Tek Sapma) | Hepsi | EO |

## Oyuna Özgü Ek Maddeler

Bunlar WCAG'ın zorunlu tuttuğu şeyler değil, proje kurallarından gelen ek şartlardır:

- [ ] Dokunma alanları en az 48x48 piksel, aralarında en az 8 piksel (NFR9'un 44x44 sınırının üstünde; `design-system-mapping.md` Boşluk, Köşe ve Ölçüler).
- [ ] Hareket azaltma açıkken kart çevirme, panel kayması ve tema geçişi animasyonsuz (AC13.2.4).
- [ ] Uyku ekranı ve faz geçiş kartı herkeste, her cihazda birebir aynı; ekran okuyucu gece herkes için aynı cümleyi okur: "Gece. Köy uyuyor." (AC3.2.1)
- [ ] Taraf simgeleri renk körlüğü simülasyonunda ayırt edilir (AC11.3.2).
- [ ] Desteklenmeyen tarayıcı uyarısı (AC13.3.2) ekran okuyucuya okunur.
- [ ] Yazı tipleri oyunun kendi sunucusundan gelir; erişilebilirlik için de dış servis kullanılmaz (IP saklanmaz kuralı, C-14).

## Assumptions & Open Questions

- [assumption] Oyun sürelerinin 2.2.1 ölçütündeki "gerçek zamanlı olay" istisnasına girdiği kabul edildi; moderatörün uzatma ve duraklatma düğmeleri ek güvencedir.
- [assumption] Sınama araçları (axe, VoiceOver, TalkBack, NVDA) örnek olarak verildi; kesin CI aracı teknoloji seçimiyle birlikte belirlenir (requirements ISS-02).
- Gece sırasının ekran okuyucu kullananlara hiç duyurulmaması, bu oyuncular için oyunu zorlaştırır; sahibin onayladığı karardır ve değiştirilmesi istenirse yalnızca kulaklık şartıyla açılabilecek bir "gece duyurusu" ayarı v1 sonrasına önerilebilir.
