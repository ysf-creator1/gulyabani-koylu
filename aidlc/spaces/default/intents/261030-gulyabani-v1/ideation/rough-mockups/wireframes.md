# Kaba Taslaklar (Wireframes) — Gulyabani–Köylü (çalışma adı)

v1 ekranlarının düşük çözünürlüklü taslakları: her ekranda ne olduğu, nerede durduğu ve hangi durumlarda nasıl göründüğü. Renk, yazı tipi ve kart çizimleri burada yoktur; onlar Ayrıntılı Taslaklar aşamasında ve kart tasarımı işinde (intent-backlog IB-16) ele alınır. Kullanıcı akışları `user-flow.md` dosyasındadır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı." Ekranların içeriği bu dosyanın 7., 8., 13. ve 14. bölümlerinden gelir.
- [scope] Workflow-selected scope: `mvp`.
- [Q1]–[Q6]: `rough-mockups-questions.md` içindeki cevaplar (özet onayı: Looks correct).
- Onaylanan niyet beyanı: `ideation/intent-capture/intent-statement.md` (intent-statement).
- Kapsam belgesi: `ideation/scope-definition/scope-document.md` (scope-document).
- İş listesi: `ideation/scope-definition/intent-backlog.md` (intent-backlog); IB kimlikleri bu dosyadandır.

## Genel İlkeler

- **Önce telefon.** Bütün ekranlar önce telefon genişliğine göre çizildi; bilgisayarda aynı alanlar yan yana açılır. Katılım karışıktır: bilgisayar + telefon ya da tek telefon. (intent-statement, scope-document) [Q1]
- **Oyuncu ekranı düzeni.** Üstte sabit faz şeridi ve geri sayım; altta sekme çubuğu: Oyuncular / Sohbet / Kartım / Rehber. Oy verme veya hedef seçme sırası gelince ekranın altından bir eylem paneli açılır. [Q3]
- **Moderatör ekranı düzeni.** Telefonda dört sekme: Akış / Oyuncular / Günlük / Sohbet. Bilgisayarda bu alanlar üç sütun halinde yan yana durur. [Q1]
- **Gece ve gündüz teması.** Gece ekranları koyu (çivit mavisi, kömür siyahı, gaz lambası kehribarı), gündüz ekranları açık tonlarda (toprak, kerpiç, gün ışığı). Faz değişince herkesin teması aynı anda değişir. [Q5] [desc]
- **Gece sırası uyarısı.** Sırası gelen oyuncunun uyku ekranı seçim ekranına döner; destekleyen telefonlarda kısa bir titreşim olur, ses çalmaz (toplantıda duyulup kimin uyandığını ele vermesin diye). iPhone tarayıcıları titreşimi desteklemediği için iPhone'da yalnızca ekran değişir. [Q4]
- **Gizli bilgi ekranda da sızmaz.** Uyku ekranı herkeste birebir aynıdır. Kendi kartın varsayılan olarak kapalı durur, dokununca açılır. Rozetler (Ahbap, Sevdalı) yalnızca bunu bilmesi gereken oyuncunun ekranında görünür. Rehber hiçbir zaman kimin hangi rolde olduğunu göstermez. (intent-statement) [desc]
- **Erişilebilirlik: WCAG 2.1 AA'nın tamamı.** [Q6] Buna göre:
  - Metin kontrastı her iki temada en az 4.5:1, büyük metin ve arayüz parçaları en az 3:1.
  - Taraf yalnızca renkle değil simgeyle de ayrılır (renk körlüğü). [desc]
  - Bütün dokunma alanları en az 44x44 piksel, aralarında en az 8 piksel boşluk.
  - Her işlev klavyeyle yapılabilir; odak her zaman görünür.
  - Faz değişimi, yeni sohbet mesajı ve "sıra sende" gibi değişiklikler ekran okuyucuya duyurulur.
  - Oyun süreleri oyunun doğası gereği zorunludur. Moderatör süreyi uzatabilir ve duraklatabilir (W-09).
  - Hareket azaltma tercihi olan cihazlarda kart çevirme ve tema geçişi animasyonsuz olur.
  - Ekran okuyucu kullanan bir oyuncunun "sıra sende" duyurusu toplantıda duyulabilir. Rehber, bu oyunculara kulaklık önerir (W-12).
- **Ekran durumları.** Her ekran için boş, yükleniyor, hata ve kısmi durumlar aşağıda ayrıca yazıldı.

## Bilgi Mimarisi

```
Ana sayfa (W-01)
  |-- Oda Kur --------------------> Lobi: moderatör (W-04)
  |-- Oda kodu / link -> Giriş (W-02) -> Lobi: oyuncu (W-03)
  |-- Rehber (W-12)
  |-- Gizlilik ayrıntısı
Lobi (W-03 / W-04)
  |-- Oyunu Başlat -> Rol dağıtımı (W-05)
Oyun
  |-- Gece: uyku (W-06) <-> gece eylem paneli (W-07)
  |-- Sabah: kara haber ve kart açılışı (W-08e)
  |-- Gündüz: oyuncu ekranı (W-08) -> oylama (W-08b) -> son söz (W-08c)
  |-- Ölünce: mezarlık (W-10)
  |-- Her an: Rehber katmanı (W-12), bağlantı uyarısı (W-13)
  |-- Moderatör: moderatör ekranı (W-09)
Oyun sonu ve geri bildirim (W-11) -> Ana sayfa
```

<!-- Text fallback: Ana sayfadan oda kurulur (moderatör lobisi), kod veya linkle giriş ekranından oyuncu lobisine geçilir, rehber ve gizlilik ayrıntısı açılır. Lobiden oyun başlar: rol dağıtımı, gece uyku ve eylem ekranları, sabah haberi, gündüz oyuncu ekranı, oylama ve son söz; ölen oyuncu mezarlığa geçer; rehber ve bağlantı uyarısı her an açılabilir; moderatörün kendi ekranı vardır. Oyun sonu ekranından ana sayfaya dönülür. -->

Her ekran ana sayfadan en fazla üç adımda erişilebilir. Raporun ekranı yoktur; sahibi raporu sunucuda bir komutla üretir. (scope-document)

## Ekranlar

Örneklerdeki köy: moderatör Ayşe; oyuncular Ali (Ürkek), Can (Köylü), Deniz ve Gül (Ahbaplar), Ece (Görücü), Fırat (Köylü), Hakan (Bekçi), Mert (Gulyabani), Zeynep (Boşboğaz Gulyabani). Ece ile Fırat sevdalıdır.

### W-01 Ana Sayfa

Amaç: Oyunu tanıtmak, oda kurmak veya koda katılmak. (IB-01, IB-11)

```
+----------------------------------+
| [sisli köy silueti, dolunay]     |
|                                  |
| GULYABANİ-KÖYLÜ                  |
| Sisli bir Anadolu köyünde        |
| geceleri gulyabaniler dolaşır.   |
| Aranızdakini bulabilir misiniz?  |
+----------------------------------+
| [        Oda Kur         ]       |
|                                  |
| Oda kodu: [______] [Katıl]       |
+----------------------------------+
| [Rehber]   [Nasıl oynanır?]      |
+----------------------------------+
| Gizlilik: Nick, işlemler,        |
| cihaz türü, tarayıcı ve ülke     |
| 1 yıl kaydedilir; IP saklanmaz.  |
| [Ayrıntı]                        |
+----------------------------------+
```

- Kısa tanıtım metni yalnızca bu sayfadadır; sosyal medya önizlemesi yoktur. (scope-document)
- Durumlar: Kod 6 haneden kısaysa "Katıl" pasiftir ve altında "6 haneli kodu gir" yazar. Kod bulunamazsa W-14'teki "Oda bulunamadı" mesajı çıkar. "Oda Kur"a basınca düğmede "Oda kuruluyor..." görünür; kurulamazsa "Oda kurulamadı, tekrar dene" yazar.
- Erişilebilirlik: h1 oyunun adı; bölgeler header / main / footer (gizlilik notu footer'da); klavye giriş noktası "Oda Kur" düğmesi.

### W-02 Odaya Giriş

Amaç: Linkle ya da kodla gelen kişinin nick seçmesi ve gizlilik bilgilendirmesini görmesi. Oda kuran kişi de nick'ini burada girer. (IB-01, IB-11)

```
+----------------------------------+
| < Geri            Oda 482913     |
+----------------------------------+
| Nick (2-16 karakter)             |
| [______________________]         |
+----------------------------------+
| Gizlilik bilgilendirmesi         |
| Nick, oyundaki işlemler, cihaz   |
| türü, tarayıcı ve ülke 1 yıl     |
| kaydedilir. IP saklanmaz.        |
| Oda ve sohbetler 24 saatte       |
| silinir.          [Ayrıntı]      |
+----------------------------------+
| [       Odaya Gir        ]       |
+----------------------------------+
```

- Durumlar: Nick 2 karakterden kısa ya da 16'dan uzunsa alanın altında sebep yazar; yazılan nick silinmez. Nick odada varsa "Bu nick odada kullanılıyor, başka bir nick seç" yazar. Oda doluysa (26 oyuncu) ya da süresi dolmuşsa W-14 mesajı çıkar.
- Erişilebilirlik: h1 "Odaya Giriş"; bölgeler header / main; klavye giriş noktası nick alanı; hata mesajı alana bağlıdır ve okunur.

### W-03 Lobi — Oyuncu Görünümü

Amaç: Katılımcıları ve odada aktif rolleri görmek, başlamayı beklemek. (IB-01, IB-05, IB-15)

```
+----------------------------------+
| LOBİ  Oda 482913     [Rehber]    |
| Link: [Kopyala] [Paylaş]         |
+----------------------------------+
| Moderatör: Ayşe                  |
| Oyuncular (5/26)                 |
| - Ali    - Can    - Deniz        |
| - Ece    - Hakan (sen)           |
+----------------------------------+
| Bu odada aktif roller:           |
| Gulyabani x1, Köylü, Bekçi       |
+----------------------------------+
| ! 6 oyuncunun altındasınız;      |
|   oyun daha kısa ve zor olur.    |
+----------------------------------+
| Moderatörün başlatması           |
| bekleniyor...                    |
| [Nasıl oynanır?]                 |
+----------------------------------+
```

- 6 oyuncunun altındaki uyarı yalnızca 3–5 oyuncu varken görünür. (intent-statement)
- Oyunda ilk kez bulunan oyuncuya "Nasıl oynanır?" kartı bir kez kendiliğinden açılır ve kapatılabilir. [desc]
- Durumlar: Yalnızca moderatör varken liste "Henüz oyuncu yok. Linki paylaş." der. Moderatör seni çıkarırsa W-14'teki "Odadan çıkarıldın" mesajı çıkar.
- Erişilebilirlik: h1 "Lobi"; bölgeler header / main; klavye giriş noktası "Kopyala" düğmesi; listeye yeni katılan ekran okuyucuya duyurulur.

### W-04 Lobi — Moderatör Görünümü

Amaç: Rol havuzunu ve ayarları yapmak, oyuncuları yönetmek, oyunu başlatmak. (IB-01, IB-05)

Roller sekmesi:

```
+----------------------------------+
| LOBİ  Oda 482913 (Moderatör)     |
| [Oyuncular] [Roller] [Ayarlar]   |
+----------------------------------+
| Ön ayar: (Acemi)(Klasik)(Dolu)   |
| [kilitli] Gulyabani  [- 2 +]     |
| [kilitli] Köylü (kalan herkes)   |
| [ AÇIK ] Bekçi                   |
| [KAPALI] Boşboğaz Gulyabani      |
| [ AÇIK ] Ahbaplar (2 adet)       |
| [ AÇIK ] Ürkek                   |
| ...  (her rol: küçük kart,       |
|      kısa açıklama, anahtar)     |
| Önerilen gulyabani: 1            |
| ! 5 kişide 2 gulyabani: dengesiz |
+----------------------------------+
| [  Oyunu Başlat (pasif)  ]       |
| Neden: 6 rol var, 5 oyuncu.      |
+----------------------------------+
```

Oyuncular sekmesi:

```
+----------------------------------+
| [Oyuncular] [Roller] [Ayarlar]   |
+----------------------------------+
| Ali     [Köyün en genci] [Çıkar] |
| Can                      [Çıkar] |
| Deniz                    [Çıkar] |
+----------------------------------+
| [ Moderatörlüğü devret... ]      |
+----------------------------------+
```

Ayarlar sekmesi:

```
+----------------------------------+
| [Oyuncular] [Roller] [Ayarlar]   |
+----------------------------------+
| Gündüz süresi        [4 dk]      |
| Son söz              [30 sn]     |
| Gulyabani kararı     [90 sn]     |
| İlk gece kaçırma yok [AÇIK]      |
| Eşitlik kuralı  [Yeniden oy]     |
| Oylar canlı görünsün [AÇIK]      |
| Hayalet modu         [AÇIK]      |
| Her gün yeni kelime  [KAPALI]    |
| Ürkek fark edilme    [%50]       |
| Dertli süresi  [2. gündüz]       |
| (varsayılanlar Gereksinim        |
|  Analizi'nde kesinleşir)         |
+----------------------------------+
```

- Gulyabani ve Köylü anahtarları kilitlidir. Ahbaplar açılınca 2 adet eklenir. Ön ayar seçildikten sonra anahtarlar tek tek değiştirilebilir. Son ayarlar tarayıcıda hatırlanır. [desc]
- Roller oyuncu sayısını aşınca "Oyunu Başlat" pasif kalır ve hemen altında nedeni yazar. Dengesiz kombinasyon uyarısı başlatmayı engellemez. [desc]
- "Çıkar" ve "Moderatörlüğü devret" onay ister: "Ali odadan çıkarılsın mı?" (geri alınamayan işlem).
- "Köyün en genci" işareti yalnızca eşitlik kuralı "Köyün en genci" seçiliyken görünür. [desc]
- Ayarlardaki değerler intent dosyasındaki örnek değerlerdir; kesin varsayılanlar Gereksinim Analizi'nde belirlenir. (scope-document)
- Bilgisayarda üç sekme yan yana üç sütun olur.
- Durumlar: Hiç oyuncu yokken "Oyunu Başlat" pasiftir, nedeni "En az 3 oyuncu gerekli" yazar.
- Erişilebilirlik: h1 "Lobi (Moderatör)"; bölgeler header / nav (sekmeler) / main; klavye giriş noktası ilk sekme; anahtarlar klavyede Boşluk ile açılıp kapanır ve durumunu ("açık"/"kapalı") okutur.

### W-05 Rol Dağıtımı ve Kart

Amaç: Oyuncunun kendi rolünü gizlice görmesi ve "Gördüm" demesi. (IB-02, IB-16)

```
+----------------------------------+
| ROL DAĞITIMI                     |
| Kartına bak, kimseye gösterme.   |
+----------------------------------+
| [ KART ARKA YÜZÜ           ]     |
| [ sisli köy, dolunay       ]     |
| [ Dokun veya Enter: aç     ]     |
+----------------------------------+
| Açık hali:                       |
| BEKÇİ    Köylüler (fener)        |
| [illüstrasyon]                   |
| Her gece bir evi yoklar.         |
| "Yatağı boş olanın derdi         |
| büyük."                          |
+----------------------------------+
| [         Gördüm         ]       |
| 4/9 oyuncu gördü                 |
+----------------------------------+
```

- Kart yapısı intent dosyasının 13. bölümündeki gibidir: ad, illüstrasyon, taraf etiketi ve simgesi, en fazla 2 satır yetenek, tek satır atmosfer sözü. [desc]
- Kart, ekrandan ayrılınca ya da tekrar dokununca kapanır. Oyun boyunca "Kartım" sekmesinden yeniden açılır.
- Durumlar: Kart yüklenene kadar yalnızca arka yüz görünür. Herkes "Gördüm" deyince ilk gece başlar (moderatör geçirir).
- Erişilebilirlik: h1 "Rol Dağıtımı"; bölge main; klavye giriş noktası kart; açılan kart ekran okuyucuya rol adı, taraf ve yeteneği okur.

### W-06 Uyku Ekranı

Amaç: Gece, sırası gelmeyen herkese aynı, bilgi sızdırmayan ekran. (IB-02, IB-03)

```
+----------------------------------+
|                                  |
| [sisli köy silueti, dolunay]     |
|                                  |
|         Köy uyuyor...            |
|                                  |
|                                  |
| Ekranı açık tut; telefon         |
| kilitlenirse bağlantı kopabilir. |
|                                  |
+----------------------------------+
```

- Sayaç, düğme, isim yoktur. Yaşayan herkes aynı anda bu ekrana geçer.
- "Ekranı açık tut" notu, telefonda ekran kilitlenince bağlantının kopması riskine karşıdır (RSK-01). Not herkeste aynıdır.
- Erişilebilirlik: h1 "Gece"; bölge main; odaklanacak bir öğe yoktur; ekran okuyucu herkes için aynı cümleyi okur: "Gece. Köy uyuyor."

### W-07 Gece Eylem Panelleri

Amaç: Sırası gelen oyuncunun gece seçimini yapması. Uyku ekranının yerine geçer; telefon destekliyorsa kısa titreşim olur. [Q4] (IB-02, IB-06, IB-07, IB-08)

Bekçi:

```
+----------------------------------+
| GECE 2  Bekçi'nin sırası 0:42    |
| Bir evi yokla:                   |
| ( ) Ali          ( ) Can         |
| ( ) Deniz        ( ) Ece         |
| ( ) Fırat        ( ) Gül         |
| ( ) Mert         ( ) Zeynep      |
| [    Seçimi Onayla       ]       |
+----------------------------------+
| Sonuç: Can GULYABANİ DEĞİL       |
| (yalnızca sen ve moderatör)      |
| [ Tamam ] -> uyku ekranı         |
+----------------------------------+
```

Gulyabanilerin ortak kararı (Mert'in ekranı):

```
+----------------------------------+
| GECE 2  Gulyabaniler    1:30     |
| Kurban seç (işaretler canlı):    |
| Ali    <- Zeynep                 |
| Can    <- sen                    |
| Deniz Ece Fırat Gül Hakan        |
| ! Pencerede bir gölge var: Ali   |
+----------------------------------+
| Gulyabani sohbeti                |
| Zeynep: Ali olsun, bizi gördü    |
| Sen: tamam, Ali                  |
| [mesaj yaz.......] [Gönder]      |
+----------------------------------+
| [ Kararı Onayla (pasif)  ]       |
| Herkes aynı hedefi seçmeli.      |
+----------------------------------+
```

Aynı panelin diğer rollerdeki halleri:

| Rol | Başlık ve içerik | Kaynak |
|---|---|---|
| Görücü (ilk gece) | "İki kişiyi birbirine sevdalı et"; iki seçim, kendisi de seçilebilir | [desc] |
| Sevdalılar (ilk gece) | "Sevdalın: Fırat" bilgisi; rol gösterilmez | [desc] |
| Ahbaplar (ilk gece) | "Ahbabın: Gül" bilgisi | [desc] |
| Gulyabaniler (ilk gece) | Birbirini tanıma listesi | [desc] |
| Ürkek (2. geceden itibaren) | Gulyabani adımında "Pencereden bak" / "Uyumaya devam" seçimi; bakarsa gulyabanilerin adları | [desc] |
| Celalli Damat (ölünce) | "Yanında götüreceğin kişiyi seç" 0:30; süre dolarsa kimse gitmez | [desc] |
| Boşboğaz (her sabah, ayar açıksa) | Yalnızca Boşboğaz'a ve moderatöre "Bugünün kelimesi: sis" | [desc] |

- Hedef listesinde yalnızca yaşayan oyuncular vardır; moderatör yoktur, gulyabani panelinde gulyabaniler yoktur.
- Gulyabani panelinde herkes aynı hedefi seçene kadar "Kararı Onayla" pasiftir ve nedeni yazar. [desc]
- Durumlar: Seçim süresi dolarsa panel "Süre doldu" der ve uyku ekranına döner. Seçim gönderilemezse "Gönderilemedi, tekrar dene" yazar ve seçim korunur.
- Erişilebilirlik: h1 "Gece: [rol] sırası"; bölge main; klavye giriş noktası ilk seçenek; seçenekler ok tuşlarıyla gezilir; kalan süre her 30 saniyede bir okunur.

### W-08 Gündüz Oyuncu Ekranı

Amaç: Sabah haberini görmek, meydanda konuşmak, oy vermek. (IB-02, IB-10)

Sabah — kara haber:

```
+----------------------------------+
| SABAH   Kara haber               |
| "Dün gece köyde kara bir olay    |
| oldu: Ali kaçırıldı."            |
+----------------------------------+
| [ ALİ'NİN KARTI AÇILIYOR   ]     |
| [ ÜRKEK  (çivit, yorgan)   ]     |
+----------------------------------+
```

Gündüz, Sohbet sekmesi:

```
+----------------------------------+
| GÜNDÜZ 2  Meydan   3:12  [?]     |
+----------------------------------+
| Ali: Dün gece kim nerdeydi?      |
| Can: Bekçi konuşsun!             |
| Ece: ben bir şey görmedim        |
|    (mesaja uzun bas: Şikayet)    |
| [mesaj yaz.......] [Gönder]      |
+----------------------------------+
| Oyuncular|Sohbet|Kartım|Rehber   |
+----------------------------------+
```

Oylama paneli (alttan açılır):

```
+----------------------------------+
| OYLAMA                   0:20    |
| Kime oy veriyorsun?              |
| ( ) Ali      2 oy                |
| (o) Can      3 oy   <- sen       |
| ( ) Ece      0 oy                |
| ( ) Fırat    1 oy                |
| [  Oyumu Ver  ] [Çekimser]*      |
| * Çekimser yalnızca ayar         |
|   açıksa görünür.                |
+----------------------------------+
```

Son söz:

```
+----------------------------------+
| SON SÖZ   Sanık: Can     0:30    |
| Yalnızca Can yazabilir.          |
+----------------------------------+
| Can: Ben köylüyüm, yemin         |
| ederim! Bekçi varsa konuşsun.    |
+----------------------------------+
| Oyuncular|Sohbet|Kartım|Rehber   |
+----------------------------------+
```

Oyuncular sekmesi (Deniz'in ekranı):

```
+----------------------------------+
| (Deniz'in ekranı)                |
| Ali  (öldü)         Ürkek        |
| Can                 yaşıyor      |
| Ece                 yaşıyor      |
| Fırat          bağlantı yok      |
| Gül  [Ahbap]        yaşıyor      |
| Hakan               yaşıyor      |
| Mert                yaşıyor      |
| Zeynep              yaşıyor      |
+----------------------------------+
| Oyuncular|Sohbet|Kartım|Rehber   |
+----------------------------------+
```

- Ölen oyuncu gri görünür ve adının yanında açılmış rolü yazar. Deniz yalnızca kendi ahbabını (Gül) rozetle görür; sevdalıları göremez. [desc]
- Oy sayıları "oylar canlı görünsün" ayarı açıksa görünür. Kendine oy verilemez. [desc]
- Onay oylamasında aynı panel "Oyunu değiştirebilirsin" başlığıyla, mevcut oylar korunarak açılır. [desc]
- Mesaja uzun basınca (klavyede mesajın menü düğmesiyle) "Şikayet et" seçeneği çıkar; şikayet kayıtlara düşer. (scope-document) Filtreye takılan mesajın nasıl gösterileceği Gereksinim Analizi'nde belirlenir.
- [?] simgesi o fazda ne yapılacağını kısaca anlatır.
- Durumlar: Sohbette henüz mesaj yoksa "Meydan sessiz. İlk sözü sen söyle." yazar. Mesaj gönderilemezse mesajın yanında "Gönderilemedi, tekrar dene" yazar ve metin silinmez. Çok uzun mesaj ve tek parça uzun kelime satıra sığacak şekilde kırılır.
- Erişilebilirlik: h1 faz adı ("Gündüz 2: Meydan"); bölgeler header (faz şeridi) / main / nav (sekme çubuğu); klavye giriş noktası mesaj alanı; yeni mesajlar ve faz değişimi ekran okuyucuya duyurulur; sekmeler ok tuşlarıyla gezilir.

### W-09 Moderatör Ekranı

Amaç: Oyunu adım adım yönetmek; okunacak anonsu, beklenen işlemi ve her şeyi görmek. (IB-02, IB-06, IB-08)

Telefonda Akış sekmesi:

```
+----------------------------------+
| MODERATÖR   GECE 2  Adım 3/5     |
| [Akış][Oyuncu][Günlük][Sohbet]   |
+----------------------------------+
| Okuyacağın anons:                |
| "Bekçi uyansın, fenerini         |
| alsın ve bir evi yoklasın."      |
| Beklenen: Bekçi seçim yapıyor    |
| Durum: bekleniyor      0:35      |
| [      Sonraki Adım      ]       |
| [Süre +30 sn]  [Duraklat]        |
+----------------------------------+
| Boşboğaz: Zeynep  kelime: sis    |
| [x] Bugün söyledi (sohbetten)    |
| Dertli: rolde yok                |
+----------------------------------+
```

Telefonda Oyuncu sekmesi:

```
+----------------------------------+
| [Akış][Oyuncu][Günlük][Sohbet]   |
+----------------------------------+
| Ali    Ürkek           yaşıyor   |
| Can    Köylü           yaşıyor   |
| Deniz  Ahbap           yaşıyor   |
| Ece    Görücü [Sevdalı]          |
| Fırat  Köylü [Sevdalı] kopuk     |
| Gül    Ahbap           yaşıyor   |
| Hakan  Bekçi           yaşıyor   |
| Mert   Gulyabani       yaşıyor   |
| Zeynep Boşboğaz G.     yaşıyor   |
+----------------------------------+
```

Telefonda Günlük sekmesi (sabah, 2. gece bittikten sonra):

```
+----------------------------------+
| [Akış][Oyuncu][Günlük][Sohbet]   |
+----------------------------------+
| Gece 1: Görücü: Ece + Fırat      |
| Gece 1: kimse kaçırılmadı        |
| Gece 2: Bekçi -> Can: değil      |
| Gece 2: Ürkek baktı, görüldü     |
| Gece 2: Gulyabani -> Ali         |
+----------------------------------+
| Sohbet sekmesi: gulyabani        |
| sohbeti (salt okunur), gündüz    |
| sohbeti, şikayet edilenler       |
+----------------------------------+
```

Bilgisayarda aynı alanlar yan yana:

```
+----------------------------------+  +----------------------------------+  +----------------------------------+
| Okuyacağın anons:                |  | Ali    Ürkek           yaşıyor   |  | Gece 1: Görücü: Ece + Fırat      |
| "Bekçi uyansın, fenerini         |  | Can    Köylü           yaşıyor   |  | Gece 1: kimse kaçırılmadı        |
| alsın ve bir evi yoklasın."      |  | Deniz  Ahbap           yaşıyor   |  | Gece 2: Bekçi -> Can: değil      |
| Beklenen: Bekçi seçim yapıyor    |  | Ece    Görücü [Sevdalı]          |  | Gece 2: Ürkek baktı, görüldü     |
| Durum: bekleniyor      0:35      |  | Fırat  Köylü [Sevdalı] kopuk     |  | Gece 2: Gulyabani -> Ali         |
| [      Sonraki Adım      ]       |  | Gül    Ahbap           yaşıyor   |  +----------------------------------+
| [Süre +30 sn]  [Duraklat]        |  | Hakan  Bekçi           yaşıyor   |  | Sohbet sekmesi: gulyabani        |
+----------------------------------+  | Mert   Gulyabani       yaşıyor   |  | sohbeti (salt okunur), gündüz    |
| Boşboğaz: Zeynep  kelime: sis    |  | Zeynep Boşboğaz G.     yaşıyor   |  | sohbeti, şikayet edilenler       |
| [x] Bugün söyledi (sohbetten)    |  +----------------------------------+  +----------------------------------+
| Dertli: rolde yok                |
+----------------------------------+
```

- Sonraki Adım her zaman aynı yerdedir. Pasif yapılan rollerin adımları hiç gösterilmez. Aktif olup oyuncusu ölmüş rollerin adımı okunur ve kısa beklemeden sonra atlanır. [desc]
- "kopuk", oyuncunun bağlantısının o an olmadığını gösterir; yalnızca durum bilgisidir, rol bilgisi taşımaz.
- Boşboğaz kutusu gizli kelime sohbette yazılınca kendiliğinden işaretlenir; sesli söylendiyse moderatör işaretler. Dertli göstergesi yalnızca Dertli rolü aktifse dolu görünür. [desc]
- Durumlar: Bir oyuncu kopukken "Sonraki Adım" yine kullanılabilir. Moderatörün kendi bağlantısı koparsa oyunun ne yapacağı Gereksinim Analizi'nde belirlenir.
- Erişilebilirlik: h1 "Moderatör"; bölgeler header / nav (sekmeler) / main; klavye giriş noktası "Sonraki Adım"; anons metni büyük ve okunaklı; "Durum" değişince ekran okuyucuya duyurulur.

### W-10 Mezarlık

Amaç: Ölen oyuncunun oyunu izlemesi ve diğer ölülerle konuşması. (IB-09)

```
+----------------------------------+
| MEZARLIK   Öldün (Ürkek)         |
| [Canlı izle] [Mezarlık sohbeti]  |
+----------------------------------+
| Canlı: GÜNDÜZ 3  Oylama          |
| Can 3 oy, Ece 1 oy               |
| Yaşayanların sohbeti (okuma)     |
| Hakan: bence Mert                |
+----------------------------------+
| Hayalet modu açık:               |
| Mert Gulyabani, Zeynep Boşboğaz  |
| Gece 2: Bekçi Can'ı yokladı      |
+----------------------------------+
```

- Ölen oyuncu otomatik olarak buraya geçer. Yaşayanların sohbetinde yazma alanı yoktur. Mezarlık sohbeti yaşayanlara hiç görünmez. [desc]
- Hayalet modu kapalıysa alt bölüm görünmez. [desc]
- Durumlar: Mezarlıkta tek kişi varken sohbet "Burada henüz yalnızsın." der.
- Erişilebilirlik: h1 "Mezarlık"; bölgeler header / nav / main; klavye giriş noktası "Canlı izle" sekmesi.

### W-11 Oyun Sonu ve Geri Bildirim

Amaç: Kazananı ve bütün rolleri göstermek; memnuniyet geri bildirimi almak. (IB-02, IB-13)

```
+----------------------------------+
| OYUN BİTTİ                       |
| KÖYLÜLER KAZANDI                 |
| + Sevdalılar: Ece ve Fırat       |
+----------------------------------+
| Mert Gulyabani, Zeynep Boşboğaz, |
| Hakan Bekçi, Ali Ürkek ...       |
| [Gece olay günlüğü]              |
+----------------------------------+
| Oyun nasıldı?                    |
| [:( kötü] [:| orta] [:) iyi]     |
| Açıklama (isteğe bağlı)          |
| [______________________]         |
| [Gönder]  [Öneri/Şikayet yaz]    |
+----------------------------------+
| [Ana sayfa]                      |
+----------------------------------+
```

- Memnuniyet 3 yüz ifadesiyle sorulur: kötü / orta / iyi. Yüzlerin yanında yazı da vardır (yalnızca simgeye dayanılmaz). [Q2]
- Dertli kazanırsa başlık "DERTLİ KAZANDI" olur; karışık sevdalı çift kazanırsa ikisinin adı yazar. [desc]
- Durumlar: Gönderilince "Teşekkürler!" görünür ve düğmeler pasifleşir. Gönderilemezse "Gönderilemedi, tekrar dene" yazar, seçim ve açıklama korunur. Geri bildirim vermek zorunlu değildir.
- Erişilebilirlik: h1 "Oyun Bitti"; bölgeler header / main; klavye giriş noktası ilk yüz ifadesi; yüz ifadeleri bir seçim grubu olarak ok tuşlarıyla gezilir.

### W-12 Rehber

Amaç: Kartları, nasıl oynandığını ve moderatör rehberini oyunu durdurmadan göstermek. Ana sayfadan, lobiden ve oyun içinden açılır; oyunun üstüne katman olarak gelir. (IB-15)

```
+----------------------------------+
| REHBER                    [X]    |
| [Kartlar][Nasıl oynanır][Mod.]   |
+----------------------------------+
| (Bu odada aktif) (Tümü)          |
| (Gulyabaniler) (Köylüler)        |
| (Bağımsızlar)                    |
| [Gulyabani] [Köylü] [Bekçi]      |
| [Ahbaplar]  (Ürkek: soluk)       |
+----------------------------------+
| Karta dokun: büyük görsel,       |
| taraf, yetenek, ne zaman         |
| uyanır, kazanma koşulu, ipucu    |
+----------------------------------+
```

- Oda içinde açılınca "Bu odada aktif" filtresi seçili gelir; pasif roller soluk görünür. Tılsım filtresi yoktur (v2). [desc] (scope-document)
- "Nasıl oynanır" sekmesi: tek ekranlık özet, resimli adımlar, sık sorulanlar. Sık sorulanlara iki madde eklenir: telefon ekranının açık tutulması ve ekran okuyucu kullananlara kulaklık önerisi. [Q6]
- Rehber açıkken arkada oyun sürer; faz değişirse rehberin üstünde kısa bir uyarı çıkar.
- Durumlar: Filtre sonucu boşsa "Bu filtrede kart yok" yazar.
- Erişilebilirlik: h1 "Rehber"; bölge dialog; klavye giriş noktası ilk sekme; Esc ile kapanır ve odak açan düğmeye döner.

### W-13 Bağlantı Uyarısı

Amaç: Bağlantı koptuğunda oyuncuyu bilgilendirmek, yeniden bağlanmak ve sorun bildirmesini sağlamak. Her ekranın üstünde şerit olarak çıkar. (IB-03, IB-13)

```
+----------------------------------+
| ! Bağlantı koptu.                |
| Yeniden bağlanılıyor... (3)      |
| Rolün ve durumun korunuyor.      |
| [Sorun bildir]                   |
+----------------------------------+
| (bağlantı gelince)               |
| Tekrar oyundasın.                |
+----------------------------------+
```

- Sayfa kapanıp aynı linkle açılırsa oyuncu kendiliğinden aynı rol ve durumla döner. [desc]
- "Sorun bildir", kopma geri bildirimidir ve kayıtlara düşer. (intent-statement)
- Durumlar: Yeniden bağlanma uzun sürerse şerit "Bağlanamadık. İnternetini kontrol edip sayfayı yenile." der.
- Erişilebilirlik: rol alert; kopma ve geri gelme ekran okuyucuya duyurulur; "Sorun bildir" klavyeyle erişilebilir.

### W-14 Hata ve Bilgi Mesajları

Tam ekran ya da kart halinde, her biri ne olduğunu ve ne yapılacağını söyler:

| Durum | Mesaj | Sonraki adım |
|---|---|---|
| Oda bulunamadı veya 24 saati doldu | "Bu oda bulunamadı ya da süresi doldu." | [Ana sayfa] [Yeni oda kur] |
| Oda dolu (26 oyuncu) | "Bu oda dolu." | [Ana sayfa] |
| Odadan çıkarıldın | "Moderatör seni odadan çıkardı." | [Ana sayfa] |
| Bağlantı hiç kurulamıyor | "Oyuna bağlanamadık. İnternetini kontrol et." | [Tekrar dene] |

- Oyun başlamışken yeni bir kişinin linkle gelmesi durumunda ne olacağı Gereksinim Analizi'nde belirlenir.
- Erişilebilirlik: h1 mesajın kendisi; bölge main; klavye giriş noktası ilk düğme.

## Kapsam Dışı Ekranlar

- Rapor ekranı veya yönetici sayfası: yok; rapor sunucuda komutla üretilir. (scope-document)
- Tılsım kartları, Ağız Bağlama rozeti, ek roller, oyunculara gösterilen geçmiş/istatistik: v2. (scope-document, intent-backlog)

## Sonraki Aşamalara Bırakılanlar

- Ayarların kesin varsayılanları (W-04 Ayarlar sekmesi). (scope-document)
- Kelime filtresine takılan mesajın nasıl gösterileceği (W-08).
- Oyun başlamışken linkle gelen yeni kişinin durumu (W-14).
- Moderatörün bağlantısı koptuğunda oyunun ne yapacağı (W-09).
- Renkler, yazı tipleri, simgeler ve kart çizimleri: Ayrıntılı Taslaklar ve kart tasarımı işi (IB-16).

## Assumptions & Open Questions

None.
