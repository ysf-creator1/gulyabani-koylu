# Tasarım Sistemi — Gulyabani–Köylü (çalışma adı)

Ekranların ortak dili: renkler, yazı, ölçüler, simgeler ve bütün ekranlarda tekrar kullanılan parçalar (bileşenler). Ekranların kendisi `mockups.md`, parçaların davranışı ve durumları `interaction-spec.md`, erişilebilirlik denetimi `accessibility-checklist.md` dosyasındadır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı." Kart yapısı ve renkler tarifin 13. bölümünden gelir.
- [scope] Workflow-selected scope: `mvp`.
- Kaba taslaklar: `ideation/rough-mockups/wireframes.md` (wireframes, W-01…W-14; Genel İlkeler: önce telefon, gece/gündüz teması, WCAG 2.1 AA) ve `ideation/rough-mockups/user-flow.md` (user-flow).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; FR19 kart tasarımları, NFR9 erişilebilirlik, NFR10 cihaz, NFR11 dil).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US11.3, US13.2, US13.3).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; Code Style: oyuncuya görünen metinler ayrı metin dosyasında).
- [Q1]–[Q4]: `refined-mockups-questions.md` (özet onayı: Looks correct).

## Temel Karar: Kendi Küçük Tasarım Sistemimiz

- Projede henüz bir arayüz kütüphanesi yok; teknoloji seçimi sonraki aşamalardadır (requirements ISS-02). Bu yüzden hazır bir kütüphaneye bağlanılmaz; aşağıdaki **tasarım belirteçleri** (renk, yazı, boşluk adları) ve **parça listesi** tek kaynaktır. Hangi teknoloji seçilirse seçilsin bu adlar ve değerler korunur.
- Belirteçler tek bir dosyada tutulur; temalar (gece/gündüz) yalnızca bu dosyadaki değerleri değiştirir. Parçalar renkleri adıyla kullanır, renk kodunu doğrudan yazmaz.
- Oyuncuya görünen bütün metinler koddan ayrı Türkçe metin dosyasındadır (team-practices Code Style, NFR11). Bu belgedeki tırnak içindeki metinler o dosyanın ilk içeriğidir.

## Görünüm Tarzı

Halk sanatı esintili sade görünüm. [Q1]

- Kartlardaki linol baskı dokusu (FR19.1) ekranlarda yalnızca **üç yerde** kullanılır: üst şerit arka planında çok hafif bir doku, faz geçiş kartında (`mockups.md` M-06) ve boş durum çizimlerinde. Metin hiçbir zaman dokunun üstüne doğrudan yazılmaz; altında düz bir yüzey vardır.
- Paneller ve kartların kenarında ince (2 piksel) **kilim motifi şeridi** bulunur. Motif yalnızca süstür; anlam taşımaz ve ekran okuyucudan gizlenir.
- **Oyunun adı** el yazısına yakın, baskı üslubunda çizilmiş bir **SVG logo** olarak hazırlanır; ekran okuyucu için düz metin karşılığı vardır. Logo, WCAG'ın "yazı resmi" kuralında izin verilen tek istisnadır (logo).
- **Faz geçiş başlıkları** ("Gece çöktü", "Gün ağardı") resim değil **gerçek metindir**: aynı yazı ailesinde, büyük ve kalın; el yazısı havasını çevresindeki linol baskı süsleri verir. Böylece büyütme ve okuma araçları bu metinlerde de çalışır (accessibility-checklist 1.4.5). Okunacak bütün metinler tek, okunaklı bir yazı ailesindedir.
- Gereksiz süs yoktur: her ekranda bir ana eylem öne çıkar (wireframes Genel İlkeler).
- Bu tarzın iki temada renkli örneği `visual-sample.html` dosyasındadır (M-05 rol kartı ve M-10 meydan sohbeti, gece ve gündüz). Örnekteki renkler aşağıdaki belirteçlerin aynısıdır; kart çizimi yerine geçici bir SVG çizim kullanılır.

## Renk Belirteçleri

İki tema: **gece** (çivit mavisi, kömür siyahı, gaz lambası kehribarı) ve **gündüz** (toprak, kerpiç, gün ışığı). (wireframes Genel İlkeler, rough-mockups Q5)

Kontrast oranları WCAG formülüyle hesaplandı; ilk sayı zemin (`bg`), ikinci sayı yüzey (`surface`) üzerindedir. Sınır: normal metin 4.5:1, büyük metin ve arayüz parçaları 3:1 (NFR9).

| Belirteç | Kullanım | Gece | Kontrast | Gündüz | Kontrast |
|---|---|---|---|---|---|
| `color.bg` | Sayfa zemini | `#14182B` | — | `#F5EEDF` | — |
| `color.surface` | Panel, kart, eylem paneli | `#1F2540` | — | `#FFFBF3` | — |
| `color.text` | Ana metin | `#F2EBDD` | 14.81 / 12.67 | `#2A1E14` | 14.04 / 15.72 |
| `color.text-muted` | İkincil metin, pasif düğme nedeni | `#BDB5A6` | 8.64 / 7.39 | `#5C4B3B` | 7.20 / 8.06 |
| `color.accent` | Ana düğme, seçili sekme, odak halkası | `#F2B544` | 9.59 / 8.21 | `#8A3B0E` | 6.70 / 7.50 |
| `color.on-accent` | Ana düğme üstündeki yazı | `#14182B` (9.59) | — | `#FFFFFF` (7.74) | — |
| `color.border` | Alan ve panel kenarı | `#6B7299` | 3.76 | `#8C7A66` | 3.57 |
| `color.disabled-text` | Pasif düğme yazısı | `#8A8478` | 4.73 | `#6B6054` | 5.31 |
| `color.success` | "Gördüm", "Tekrar oyundasın", "Teşekkürler!" | `#8FD19E` | 9.86 / 8.43 | `#2E6B3A` | 5.54 / 6.20 |
| `color.warning` | Uyarı şeritleri (6 oyuncu altı, dengesiz, kopuk) | `#FFD27A` | 12.34 | `#7A4B00` | 6.41 |
| `color.side-gulyabani` | Gulyabaniler tarafı | `#FF8A7A` | 7.67 / 6.56 | `#A3262A` | 6.34 / 7.09 |
| `color.side-koylu` | Köylüler tarafı | `#9DB4FF` | 8.71 / 7.45 | `#2F4A9E` | 7.01 / 7.84 |
| `color.side-bagimsiz` | Bağımsızlar | `#D3B3FF` | 9.76 / 8.35 | `#6B3FA0` | 6.39 / 7.15 |
| `color.transition-bg` | Faz geçiş kartı zemini | `#0B0E1A` (metin 16.21) | — | `#F9E7C2` (metin 13.32) | — |

- Hata mesajları ayrı bir kırmızı kullanmaz: `color.side-gulyabani` ile karışmasın diye hata metni `color.text` rengindedir ve başında hata simgesi (ünlem üçgeni) bulunur. Böylece hata hiçbir zaman yalnızca renkle anlatılmaz.
- Faz değişince bütün belirteçler aynı anda gece ya da gündüz değerine geçer (US4.1 AC4.1.3). Lobi, ana sayfa ve oyun sonu ekranları gündüz temasındadır; rol dağıtımı ve gece ekranları gece temasındadır.

## Taraf Simgeleri

Taraf hiçbir yerde yalnızca renkle gösterilmez; her zaman simge ve yazı da vardır (FR19.2, US11.3 AC11.3.2, NFR9).

| Taraf | Renk belirteci | Simge | Yazı |
|---|---|---|---|
| Gulyabaniler | `color.side-gulyabani` (kızıl) | Üç pençe izi | "Gulyabaniler" |
| Köylüler | `color.side-koylu` (çivit) | Gaz lambası (fener) | "Köylüler" |
| Bağımsızlar | `color.side-bagimsiz` (mor) | Nazar boncuğu | "Bağımsız" |

Simgeler renk körlüğü simülasyonunda (kırmızı-yeşil ve mavi-sarı körlüğü) biçimleriyle ayırt edilir; üçü de farklı dış çizgiye sahiptir (çizgi kümesi, uzun dikdörtgen, daire).

## Yazı

- **Tek yazı ailesi:** Türkçe harflerin tamamını (ç, ğ, ı, İ, ö, ş, ü) iyi çizen, açık lisanslı bir sans-serif aile (ör. Noto Sans). Yazı tipi dosyaları **oyunun kendi sunucusundan** verilir; dışarıdaki bir yazı tipi servisinden çekilmez. Böylece oyuncunun tarayıcısı üçüncü bir tarafa bağlanmaz ve IP adresi başka bir yere gitmez (C-14, proje kuralı "IP saklanmaz").
- Yazı boyutları rem ile verilir; tarayıcıda yazı %200 büyütüldüğünde düzen bozulmaz (accessibility-checklist 1.4.4).

| Belirteç | Boyut / satır yüksekliği | Ağırlık | Kullanım |
|---|---|---|---|
| `font.title` | 28 / 34 px | kalın | Ekran başlığı (h1) |
| `font.heading` | 22 / 28 px | kalın | Bölüm başlığı (h2), sonuç ("Can GULYABANİ DEĞİL") |
| `font.announce` | 22 / 32 px | normal | Moderatörün okuyacağı anons metni (büyük ve okunaklı, W-09) |
| `font.body` | 17 / 26 px | normal | Sohbet, liste, açıklama |
| `font.label` | 16 / 22 px | yarı kalın | Düğme, sekme, alan etiketi |
| `font.small` | 14 / 20 px | normal | Sayaç altı notlar, "4/9 oyuncu gördü" |
| `font.timer` | 20 / 24 px | kalın, eşit genişlikli rakam | Geri sayım |

En küçük yazı 14 pikseldir; oyunda 14 pikselden küçük metin kullanılmaz.

## Boşluk, Köşe ve Ölçüler

- Boşluk ölçeği (`space.*`): 4, 8, 12, 16, 24, 32, 48 piksel. Ekran kenarı boşluğu telefonda 16, bilgisayarda 24 pikseldir.
- Dokunma alanı (`size.touch`): en az **48x48 piksel** (WCAG'ın 44x44 sınırının üstünde, telefonda rahat basılsın diye); yan yana iki dokunma alanı arasında en az 8 piksel (NFR9).
- Köşe yuvarlaklığı (`radius.*`): düğme ve alan 10, panel 16, kart 20 piksel.
- Odak halkası (`focus.ring`): 3 piksel `color.accent`, öğeden 2 piksel dışarıda. Her temada zeminle kontrastı 6.7:1'in üstündedir.
- Gölge kullanılmaz; katmanlar kenar çizgisi ve yüzey rengiyle ayrılır (gece temasında gölge görünmez).

## Hareket

- Süreler (`motion.*`): düğme basma 100 ms, panel açılma 200 ms, kart çevirme 300 ms, faz geçişi 2 saniye (kart görünür kalma süresi, `interaction-spec.md` Faz Geçişi). [Q2]
- Cihazda hareket azaltma tercihi açıksa kart çevirme, panel kayması ve tema geçişi animasyonsuz, anında olur; faz geçiş kartı yine 2 saniye görünür ama hareket etmez (US13.2 AC13.2.4).
- Saniyede 3'ten fazla yanıp sönen hiçbir şey yoktur. Geri sayımın son 10 saniyesinde yalnızca sayının rengi `color.warning` olur; yanıp sönme yoktur.

## Ekran Genişliği Eşikleri

Önce telefon (NFR10: 320 pikselden itibaren yatay kaydırma yok).

| Eşik | Genişlik | Oyuncu ekranı | Moderatör ekranı |
|---|---|---|---|
| Telefon | 320–767 px | Tek sütun, alt sekme çubuğu | Tek sütun, üstte 4 sekme (Akış / Oyuncular / Günlük / Sohbet) |
| Tablet | 768–1023 px | Tek sütun, en fazla 640 px genişlikte, ortada | İki sütun: solda Akış, sağda sekmeli Oyuncular / Günlük / Sohbet |
| Bilgisayar | 1024–1199 px | **İki sütun**: solda sohbet, sağda oyuncu listesi ve Kartım; Rehber katman [Q4] | İki sütun (tablet gibi) |
| Geniş bilgisayar | 1200 px ve üstü | İki sütun, toplam en fazla 1200 px | **Üç sütun**: Akış / Oyuncular / Günlük + Sohbet (W-09) |

- Yatay telefon: 768 pikselden dar kaldığı sürece telefon düzeni kullanılır; eylem paneli ekran yüksekliğinin en fazla %80'ini kaplar ve kendi içinde kaydırılır.
- Uyku ekranı (M-07) her genişlikte aynıdır; genişlik ipucu vermesin diye bilgisayarda da tam ekrandır.

## Parça Listesi (Bileşenler)

Hepsi bu projeye özgüdür. Ayrıntılı durumlar, klavye davranışı ve ekran okuyucu metinleri `interaction-spec.md` dosyasındadır.

| Parça | Ne işe yarar | Kullanıldığı ekranlar (`mockups.md`) | Kaynak |
|---|---|---|---|
| `Button` (ana / ikincil / tehlikeli / sade) | Eylem düğmesi; pasifken altında neden yazar | Hepsi | wireframes, FR2.4, FR3.5 |
| `TextField` | Nick, oda kodu, mesaj, açıklama alanı; altında hata | M-01, M-02, M-10, M-13 | FR1.3, FR1.4 |
| `Toggle` (anahtar) | Rol ve ayar aç/kapa; kilitli hali | M-04 | FR3.1, FR3.2 |
| `Stepper` (adet seçici) | Gulyabani sayısı, süreler | M-04 | FR3.3, FR2.6, AC2.1.4 |
| `SegmentedControl` | Ön ayar seçimi (Acemi / Klasik / Dolu Köy), Rehber filtreleri | M-04, M-14 | FR3.4, FR18.2 |
| `TopTabs` | Moderatör sekmeleri, Rehber sekmeleri, lobi sekmeleri | M-04, M-11, M-14 | FR13.2 |
| `BottomTabBar` | Oyuncu alt sekmeleri: Oyuncular / Sohbet / Kartım / Rehber | M-10, M-12 | wireframes Genel İlkeler |
| `PhaseBar` | Üstte sabit faz adı, gün/gece sayısı, geri sayım, [?] yardımı | M-08…M-12 | FR8.1, FR14.8 |
| `Countdown` | Sunucu saatine göre geri sayım | `PhaseBar`, M-08, M-11 | FR14.8, NFR14 |
| `PlayerRow` | Oyuncu adı, durum (yaşıyor / öldü / kopuk / Gördüm), rozet, açılmış rol | M-03, M-04, M-10, M-11, M-12 | FR12.4, FR13.1 |
| `Badge` | "Ahbap", "Sevdalı", "kopuk", "Gördüm", "sen" etiketi; simge + yazı | M-10, M-11 | FR10.4, FR10.8, FR14.3 |
| `RoleCard` | Kart ön/arka yüz, çevirme | M-05, M-09, M-10 (Kartım), M-14 | FR19.1–FR19.3 |
| `ActionSheet` | Alttan açılan eylem paneli (gece seçimi, oylama) | M-08, M-10 | wireframes Genel İlkeler |
| `ChoiceList` | Tek seçimli hedef listesi (yalnızca yaşayanlar) | M-08, M-10 | FR5.6, FR9.1 |
| `VoteTally` | Oy sayıları ve "sen" işareti | M-10, M-11, M-12 | FR9.1, FR9.6 |
| `ChatPanel` | Mesaj listesi + yazma alanı; kanal başlığı; salt okunur hali | M-08, M-10, M-11, M-12 | FR16.1–FR16.3 |
| `MessageMenu` | Mesajın "Şikayet et" menüsü | M-10, M-12 | FR16.4 |
| `ConfirmDialog` | Geri alınamayan işlemler için onay (çıkar, devret, onay ver/ret) | M-04, M-11 | FR2.2, FR2.3, FR15.1 |
| `StatusBanner` | Üstte şerit: bağlantı, "Moderatör bekleniyor", uyarılar | Hepsi (oyun içi) | FR14.2, FR14.5 |
| `PhaseTransition` | 2 saniyelik "Gece çöktü" / "Gün ağardı" kartı [Q2] | M-06 | FR7.3, rough-mockups Q5 |
| `GuideOverlay` | Rehber katmanı (dialog) | M-14 | FR18.1 |
| `EmptyState` | Boş liste/sohbet: küçük çizim + açıklama + varsa eylem | Birçok ekran | wireframes Ekran durumları |
| `MessageScreen` | Tam ekran bilgi/hata mesajı + sonraki adım düğmeleri | M-16, M-18 | FR1.5, W-14 |
| `PrivacyNotice` | Kısa KVKK bilgilendirmesi + [Ayrıntı] | M-01, M-02 | FR1.1, FR1.3, AC10.2.4 |
| `FeedbackFaces` | Kötü / orta / iyi yüz seçimi (simge + yazı) | M-13 | FR17.3 |
| `RejoinRequest` | Moderatöre "Fırat yeniden katılmak istiyor" onay kartı; onay iki adımlı ("Emin misin?") [Q3] | M-11 | US9.6, sahip düzeltmesi |
| `ModeratorOffer` | Moderatör 3 dakikadır yokken ölü oyunculara giden "Moderatör olur musun?" kartı; düğmeler 10 saniye sonra açılır | M-18 | US9.3, sahip düzeltmesi |
| `WaitingList` | Moderatörde bekleyenlerin listesi ve [Çıkar] | M-04, M-11 | FR1.6, sahip düzeltmesi |
| `Toggle` "Yeni isteklere kapat" | Odayı yeni gelenlere ve yeniden katılma isteklerine kapatma (mevcut `Toggle` parçası) | M-04, M-11 | sahip düzeltmesi |
| `Toast` | Kısa onay mesajı ("Şikayetin alındı", "Link kopyalandı") | Birçok ekran | FR16.4 |

## Kart Tasarımına Bağlantı

- Kart ön yüzü: üstte karakter adı, ortada linol baskı SVG çizim, altta taraf etiketi + simgesi, en fazla 2 satır yetenek, italik tek satır atmosfer sözü; çerçeve taraf rengindedir (FR19.2, US11.3 AC11.3.1).
- Kart arka yüzü: sisli köy silueti, dolunay, ortada kilim motifli madalyon; herkeste aynı (FR19.3).
- Kart çizimlerinin kendisi bu aşamanın işi değildir (intent-backlog IB-16); burada yalnızca kartın ölçüleri ve yerleşimi belirlenir: oran 5:7, telefonda ekran genişliğinin en fazla %80'i, bilgisayarda en fazla 360 piksel genişlik. Kartın üstündeki metinler kart yüzeyinde (`color.surface` üstünde) yazılır, çizimin üstünde değil; böylece kontrast 4.5:1'in altına düşmez (AC11.3.3).
- Kart isimleri, metinleri ve görselleri özgündür (C-18, AC11.3.4).

## Assumptions & Open Questions

- [assumption] Yazı ailesi olarak Noto Sans örnek verildi; açık lisanslı ve Türkçeyi tam destekleyen benzer bir aile de kullanılabilir. Kesin seçim teknoloji seçimiyle birlikte yapılır (requirements ISS-02).
- [assumption] Renk kodları ilk değerlerdir; kart çizimleri hazırlanınca (IB-16) tonlar biraz değişebilir. Değişen her ton bu tablodaki kontrast sınırlarını korumak zorundadır.
- Oyunun nihai adı henüz yok (requirements ISS-01); "GULYABANİ-KÖYLÜ" SVG başlığı ad belli olunca yeniden çizilir.
