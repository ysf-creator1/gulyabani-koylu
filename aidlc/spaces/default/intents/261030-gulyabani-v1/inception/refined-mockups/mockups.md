# Ayrıntılı Taslaklar (Mockups) — Gulyabani–Köylü (çalışma adı)

v1 ekranlarının ayrıntılı halleri: gerçek metinler, yerleşim, her ekranın durumları ve hangi kullanıcı hikâyesini karşıladığı. Kaba taslaklardaki (W-01…W-14) ekranlar burada M-01…M-18 olarak ayrıntılandırıldı; yeni ekranlar: bekleme, yeniden katılma onayı, faz geçiş kartı ve moderatör kaybolunca görülen ekranlar (M-18). İki temada renkli görsel örnek: `visual-sample.html` (M-05 kart ve M-10 sohbet, gece ve gündüz). Renk, yazı ve parça adları `design-system-mapping.md`, davranışlar ve geçişler `interaction-spec.md`, erişilebilirlik denetimi `accessibility-checklist.md` dosyasındadır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Kaba taslaklar: `ideation/rough-mockups/wireframes.md` (wireframes, W-01…W-14) ve kullanıcı akışları `ideation/rough-mockups/user-flow.md` (user-flow, F-01…F-12); inceleme notu rough-mockups R-03 (örnek veride ölü oyuncu) burada düzeltildi.
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; FR1–FR21, NFR8–NFR11).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US1.1–US13.5, [İskelet] etiketleri) ve inceleme notları user-stories R-01 (yeniden katılma çelişkisi), R-02 (iskelet kümesi).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; yürüyen iskelet yalnızca Gulyabani ve Köylü).
- [Q1]–[Q4]: `refined-mockups-questions.md` (özet onayı: Looks correct).
- Sahibin onay kapısındaki düzeltmeleri (2026-10-31): moderatör kaybolunca oyunun ne olacağı (M-18), bekleyenlerin yeni oyuna alınması, art arda iki kez çıkarılana 30 dakika istek yasağı ve odayı yeni isteklere kapatma (M-02b, M-11), yeniden katılma onayına "Emin misin?" adımı (M-11), örnek verinin tek zaman çizgisine hizalanması (Okuma Kılavuzu) ve görünümün resimle gösterilmesi (`visual-sample.html`).

## Okuma Kılavuzu

- Çizimler telefon genişliğindedir (önce telefon). Bilgisayar düzenleri M-17'dedir. [Q4]
- Her ekranın başında: **Tema** (gece/gündüz), **Hikâyeler** (US kimlikleri), **İskelet** (yürüyen iskelette olup olmadığı) ve **An** (çizimin aşağıdaki örnek oyunun hangi anını gösterdiği).
- Köşeli parantez `[ ... ]` düğme, `( )` ve `(o)` seçim, `[__]` yazı alanı, `[AÇIK]` anahtar demektir.
- Örnek köy (kaba taslaklardaki gibi): moderatör Ayşe; oyuncular Ali (Ürkek), Can (Köylü), Deniz ve Gül (Ahbaplar), Ece (Görücü), Fırat (Köylü), Hakan (Bekçi), Mert (Gulyabani), Zeynep (Boşboğaz Gulyabani). Ece ile Fırat sevdalıdır.
- **Örnek oyunun zaman çizgisi.** Bütün çizimler bu tek oyundan alınır; her ekranın **An** satırı bu listedeki yeri söyler:
  1. **Lobi:** oyuncular gelir, Ayşe rolleri seçer (M-03, M-04).
  2. **Rol dağıtımı:** herkes kartına bakar (M-05).
  3. **Gece 1:** Görücü Ece kendisiyle Fırat'ı sevdalı yapar; Ahbaplar Deniz ve Gül tanışır; gulyabaniler anlaşamaz, süre dolar, kimse kaçırılmaz.
  4. **Gündüz 1:** kimse oy almaz, infaz yok.
  5. **Gece 2:** Ürkek Ali pencereden bakar ve fark edilir; gulyabaniler (Mert ve Zeynep) Ali'yi seçer; Bekçi Hakan Can'ı yoklar: gulyabani değil. Bu gecenin sonuna kadar Ali yaşıyor.
  6. **Sabah 2:** "Ali kaçırıldı" açıklanır. Bu andan sonra Ali ölüdür; hiçbir hedef ya da oy listesinde yer almaz ve gündüz sohbetine yazmaz (rough-mockups R-03 düzeltmesi).
  7. **Gündüz 2:** meydanda konuşulur; Fırat'ın bağlantısı kopar; oylamada Ece 3 oy alır, son söz Ece'dedir. Ece infaz edilene kadar yaşıyor.
  8. **Oyunun sonu:** birkaç gece sonra Köylüler kazanır (M-13).

## Görünüm Tarzı

Halk sanatı esintili sade: kartlarla aynı linol baskı dokusu yalnızca üst şeritte, faz geçiş kartında ve boş durum çizimlerinde; panellerin kenarında ince kilim motifi şeridi; okunacak bütün metinler tek, sade bir yazı ailesinde. [Q1] Ayrıntı: `design-system-mapping.md` Görünüm Tarzı.

## Ekran Haritası ve Hikâyeler

| Ekran | Kaba taslak | Hikâyeler | İskelet |
|---|---|---|---|
| M-01 Ana Sayfa | W-01 | US1.1, US11.1, US10.2 (AC10.2.4), US13.3 (AC13.3.2) | Evet |
| M-02 Odaya Giriş | W-02 | US1.2, US9.6 | Evet (US9.6 hariç) |
| M-02b Bekleme Ekranı | yeni | US1.3, US7.2 (AC7.2.2) | Hayır |
| M-02c Yeniden Katılma Bekleniyor | yeni | US9.6 | Hayır |
| M-03 Lobi — Oyuncu | W-03 | US1.4, US11.2 (AC11.2.1) | Evet |
| M-04 Lobi — Moderatör | W-04 | US1.4, US1.5, US2.1 | Kısmen (aşağıda) |
| M-05 Rol Dağıtımı | W-05 | US2.2, US11.3 | Evet |
| M-06 Faz Geçişi | yeni | US4.1 (AC4.1.3) | Evet |
| M-07 Uyku | W-06 | US3.2 | Evet |
| M-08 Gece Eylem Panelleri | W-07 | US3.2, US3.3, US6.1–US6.5, US6.7 | Kısmen (yalnızca gulyabani paneli) |
| M-09 Sabah | W-08e | US4.1, US4.2, US6.5 | Evet |
| M-10 Gündüz — Oyuncu | W-08 | US5.1, US5.2, US5.3, US6.4, US6.7, US10.1, US10.2 | Evet (rozetler ve şikayet hariç) |
| M-11 Moderatör Ekranı | W-09 | US2.2, US3.1, US4.1, US5.4, US6.1, US6.6, US9.2, US9.6, US10.1, US10.3 | Evet (rol adımları, onay ve çıkarma hariç) |
| M-12 Mezarlık | W-10 | US8.1, US8.2 | Hayır |
| M-13 Oyun Sonu ve Geri Bildirim | W-11 | US7.1, US7.2, US7.3 | Evet (US7.3 hariç) |
| M-14 Rehber | W-12 | US11.1, US11.2, US11.3 | Hayır |
| M-15 Durum Şeritleri | W-13 | US9.1, US9.3, US9.4, US9.5 | Evet (yalnızca bağlantı şeridi) |
| M-16 Bilgi ve Hata Mesajları | W-14 | US1.2 (AC1.2.4), US1.3 (AC1.3.3), US1.4 (AC1.4.3), US10.3 (AC10.3.3), US13.3 (AC13.3.2) | Evet (oda yok / dolu / çıkarıldın) |
| M-17 Bilgisayar Düzenleri | W-09 | US5.4 (AC5.4.3), [Q4] | Evet |
| M-18 Moderatör Kaybolursa | yeni | US9.3 (sahip düzeltmesiyle değişti) | Hayır (iskelette oyun duraklar ve moderatör beklenir) |

Ekranı olmayan hikâyeler: US12.1–US12.3 (kayıtlar ve rapor, sunucuda komutla; FR21.1), US13.1 (gizli bilgi, sunucu kuralı), US13.4 (eşzamanlılık), US13.5 (hile koruması). Bu hikâyelerin arayüzdeki tek izi, reddedilen bir işlemde gösterilen mesajlardır (M-16).

## Yürüyen İskeletteki Ekranlar

Ekip kuralına göre iskelet yalnızca Gulyabani ve Köylü rolleriyle en basit tam oyundur (team-practices Walking Skeleton). Kullanıcı hikâyeleri incelemesindeki R-02 bulgusu (iskelet kümesinin kendi içinde tamamlanmaması) ekran tarafında şöyle kapatıldı:

- **Rol havuzu (M-04 Roller):** iskelette yalnızca **Acemi** ön ayarı ve **gulyabani adet seçici** vardır (AC2.1.2'nin Acemi karşılığı, AC2.1.4); Klasik / Dolu Köy ve diğer rol anahtarları iskelet sonrası eklenir. Bu sayede iskeletteki rol dağıtımı (US2.2) gulyabani sayısını bilir.
- **Ayarlar (M-04 Ayarlar):** iskelette yalnızca gündüz süresi, son söz süresi, onay oylaması süresi, gulyabani kararı süresi, gulyabani kararında eşitlik ve oylamada eşitlik kuralı (yalnızca "Yeniden oylama") görünür.
- **Bekleme ekranı (M-02b):** iskelette yoktur; iskelette oyun sürerken gelen kişi "Bu odada oyun sürüyor" mesajını görür (M-16). Bu yüzden US7.2'nin AC7.2.2 ölçütündeki "bekleme ekranındaki kişi" kısmı iskelet dışıdır; kesin parça sırası Teslimat Planlaması'nda belirlenir.
- **Gece (M-08):** iskelette yalnızca "Gulyabani yoldaşların" bilgisi ve gulyabanilerin ortak kararı vardır.
- **Moderatör (M-11):** iskelette Akış, Oyuncular ve Günlük vardır; Boşboğaz kutusu, Dertli göstergesi, yeniden katılma onayı, oyuncu çıkarma, bekleyenler listesi ve "Yeni isteklere kapat" anahtarı yoktur.
- **Moderatör kaybolursa (M-18):** iskelette yoktur; iskelette moderatör koparsa oyun duraklar ve moderatör aynı linkle dönene kadar beklenir (M-15 "Moderatör bekleniyor").

## Ekranlar

### M-01 Ana Sayfa

**Tema:** gündüz · **Hikâyeler:** US1.1, US11.1, US10.2, US13.3 · **İskelet:** Evet · **An:** oyundan önce

```
+----------------------------------+
| [SVG: sisli köy, dolunay]        |
| GULYABANİ-KÖYLÜ  (SVG başlık)    |
| Sisli bir Anadolu köyünde        |
| geceleri gulyabaniler dolaşır.   |
| Aranızdakini bulabilir misiniz?  |
+----------------------------------+
| [          Oda Kur          ]    |
|                                  |
| Oda kodu                         |
| [__________]  [   Katıl   ]      |
| 6 haneli kodu gir                |
+----------------------------------+
| [  Rehber  ]  [Nasıl oynanır?]   |
+----------------------------------+
| Gizlilik: Nick, oyundaki         |
| işlemler, cihaz türü, tarayıcı   |
| ve ülke 1 yıl saklanır; IP       |
| saklanmaz. Oda ve sohbetler 24   |
| saatte silinir; şikayet edilen   |
| mesaj 1 ay saklanır. [Ayrıntı]   |
+----------------------------------+
```

- Gizlilik metni KVKK bilgilendirmesidir; şikayet edilen mesajın 1 ay saklandığını da söyler (FR1.1, AC10.2.4). [Ayrıntı] aynı sayfada açılan bir bölümdür, yeni sayfa değildir.
- Oda kodu alanı yalnızca rakam kabul eder; telefonda rakam klavyesi açılır. 6 haneden kısaysa "Katıl" pasiftir ve altında "6 haneli kodu gir" yazar.
- "Nasıl oynanır?" Rehber'i Nasıl Oynanır sekmesinde açar (M-14).
- **Durumlar:**
  - Yükleniyor: "Oda Kur" düğmesinde "Oda kuruluyor..." yazar, düğme pasifleşir.
  - Hata: "Oda kurulamadı. Tekrar dene." düğmenin altında yazar; düğme yeniden etkinleşir.
  - Kod bulunamadı: M-16 "Bu oda bulunamadı ya da süresi doldu."
  - Desteklenmeyen tarayıcı: sayfanın üstünde şerit: "Bu tarayıcı desteklenmiyor. Chrome ya da Safari'nin güncel sürümüyle açmanı öneririz." Oyun yine de açılabilir (AC13.3.2).

### M-02 Odaya Giriş

**Tema:** gündüz · **Hikâyeler:** US1.2, US9.6 · **İskelet:** Evet (US9.6 hariç) · **An:** lobi (1); yeni gelen biri, odada zaten olan "ali" nick'ini yazınca

Oda kuran kişi de nick'ini burada girer; o durumda başlıkta "Yeni oda" yazar.

```
+----------------------------------+
| < Geri               Oda 482913  |
+----------------------------------+
| Odaya Giriş                      |
| Nick (2-16 karakter)             |
| [ali _______________________]    |
| ! Bu nick odada kullanılıyor,    |
|   başka bir nick seç.            |
+----------------------------------+
| Gizlilik: Nick, işlemler, cihaz  |
| türü, tarayıcı ve ülke 1 yıl     |
| saklanır; IP saklanmaz. Oda ve   |
| sohbetler 24 saatte silinir;     |
| şikayet edilen mesaj 1 ay        |
| saklanır.             [Ayrıntı]  |
+----------------------------------+
| [        Odaya Gir         ]     |
+----------------------------------+
```

- Nick kuralları: 2–16 karakter, baştaki ve sondaki boşluk atılır, oda içinde büyük/küçük harf farkı (Türkçe kurallarıyla) gözetilmeden benzersiz, filtre listesindeki bir kelimeyi içeremez (FR1.3, FR1.4). Hata alanın altında, simgeyle yazar; yazılan metin silinmez (AC1.2.2, AC1.2.3).
- **Aynı nick'in iki farklı anlamı** (user-stories R-01 çözümü, [Q3]):

| Odanın durumu | O nick'in sahibi | Ekranda |
|---|---|---|
| Lobi (oyun başlamadı) | Odada | "Bu nick odada kullanılıyor, başka bir nick seç." (AC1.2.2) |
| Oyun sürüyor | Odada değil | Bekleme ekranına geçilir (M-02b, US1.3) |
| Oyun sürüyor | Oyunda ve bağlantısı açık | "Bu oyuncu şu an oyunda. Sen o oyuncuysan, önce eski pencereyi kapat." |
| Oyun sürüyor | Oyunda ve bağlantısı kopuk | "Yeniden katılma isteği gönderilsin mi?" sorusu, ardından M-02c |
| Oyun sürüyor | Moderatör tarafından oyun sırasında çıkarılmış | M-16 "Moderatör seni odadan çıkardı." (AC10.3.3) |
| Oyun bitti, "Yeni oyun" henüz basılmadı | Odada değil | Bekleme ekranına geçilir (M-02b); "Yeni oyun" basılınca lobiye alınır (review R-03) |
| Oyun bitti, "Yeni oyun" henüz basılmadı | Odada | Lobideki gibi: "Bu nick odada kullanılıyor, başka bir nick seç." |
| Herhangi bir an | Oda yeni isteklere kapalı ve nick odada değil | M-16 "Bu oda şu an yeni oyunculara kapalı." |
| Herhangi bir an | Bu tarayıcı art arda 2 kez lobiden çıkarılmış, 30 dakika dolmadı | M-16 "Bu odaya bir süre istek gönderemezsin. 30 dakika sonra tekrar dene." |

- **Bekleme bir istektir.** Oyun sürerken ya da oyun bittikten sonra gelen yeni kişi bekleme ekranına geçer; bu, odaya katılma isteğidir. Moderatör "Yeni oyun" deyince bekleyenlerin hepsi kendiliğinden lobiye alınır; moderatör istemediği kişiyi lobiden çıkarabilir (FR2.3, sahip düzeltmesi).
- **Art arda iki çıkarma = 30 dakika.** Lobiden çıkarılan kişi aynı tarayıcıyla yeniden istek gönderebilir. Aynı tarayıcı aynı odadan arada bir oyun oynamadan art arda 2 kez çıkarılırsa, 30 dakika boyunca bu odaya istek gönderemez. Oyun sırasında çıkarılan kişi ise o odaya bir daha giremez (FR15.3, değişmedi).
- **Odayı kapatma.** Farklı nick'lerle tekrar tekrar istek gönderip rahatsız eden biri için moderatör "Yeni isteklere kapat" anahtarını açar (M-11 Oyuncular); açıkken yeni gelen kimse bekleme ekranına geçemez ve yeniden katılma isteği de gönderilemez. Moderatör anahtarı istediği an kapatır.
- Yeniden katılma yalnızca oturum bilgisi kaybolmuş kişi içindir (ör. WhatsApp içinden açılan oyunu başka tarayıcıda açmak, US9.6). Aynı tarayıcıda sayfayı yenileyen ya da aynı linki açan oyuncu bu ekranı hiç görmez, doğrudan oyuna döner (US9.1).
- **Durumlar:** Yükleniyor: düğmede "Giriliyor..."; hata: "Giriş yapılamadı. Tekrar dene."; oda dolu ya da süresi dolmuş: M-16.

### M-02b Bekleme Ekranı

**Tema:** gündüz · **Hikâyeler:** US1.3, US7.2 (AC7.2.2) · **İskelet:** Hayır · **An:** Gündüz 2; Selin linkle yeni geldi

```
+----------------------------------+
| Oda 482913                       |
+----------------------------------+
| Bu odada bir oyun sürüyor.       |
|                                  |
| İsteğin moderatöre iletildi.     |
| Moderatör yeni oyunu başlatınca  |
| lobiye alınacaksın.              |
|                                  |
| [SVG: köy kahvesi, çay bardağı]  |
+----------------------------------+
| [  Rehber  ]  [Nasıl oynanır?]   |
+----------------------------------+
```

- Ekranda oyunun hiçbir bilgisi yoktur: oyuncu listesi, sayaç, faz adı, sohbet yok (FR1.6, AC1.3.1). Bekleyen kişi Rehber'i açabilir; Rehber oda filtresi olmadan açılır (hangi rollerin açık olduğu da gösterilmez).
- Moderatör "Yeni oyun" deyince kişi kendiliğinden lobiye geçer (AC1.3.2, AC7.2.2). Oyun bittikten sonra, "Yeni oyun" basılmadan gelen kişi de bu ekranı görür; üst satırda "Bu odadaki oyun bitti." yazar.
- Moderatör bekleyen kişiyi oyun sürerken de çıkarabilir (M-11 Oyuncular > Bekleyenler); o zaman kişi M-16 "Moderatör seni odadan çıkardı." görür ve art arda iki çıkarma kuralı işler (M-02).
- Moderatör odayı yeni isteklere kapatırsa bekleyenler yerinde kalır; yalnızca yeni gelenler giremez.

### M-02c Yeniden Katılma Bekleniyor

**Tema:** gündüz · **Hikâyeler:** US9.6 · **İskelet:** Hayır · **An:** Gündüz 2; bağlantısı kopan Fırat başka tarayıcıdan dönüyor

```
+----------------------------------+
| Oda 482913                       |
+----------------------------------+
| Moderatör onayı bekleniyor       |
|                                  |
| Moderatöre "Fırat yeniden        |
| katılmak istiyor" dedik.         |
| Onaylarsa kaldığın yerden        |
| devam edeceksin.                 |
|                                  |
| Toplantıda moderatöre sesli      |
| haber ver.                       |
|                                  |
| [      İsteği geri al      ]     |
+----------------------------------+
```

- Onaydan önce bu tarayıcıya hiçbir oyun bilgisi gelmez (AC9.6.3).
- Onaylanırsa oyuncu aynı rol ve durumla döner, eski oturum geçersiz olur (AC9.6.2). Reddedilirse: "Moderatör isteği onaylamadı." ve [Ana sayfa] düğmesi.
- 5 dakika içinde yanıt gelmezse istek düşer: "Yanıt gelmedi. İstersen tekrar dene." [Tekrar dene] [Ana sayfa]. (Süre, kopan oyuncu için tanınan 5 dakikalık süreyle aynıdır; FR14.4.)

### M-03 Lobi — Oyuncu

**Tema:** gündüz · **Hikâyeler:** US1.4, US11.2 · **İskelet:** Evet · **An:** lobi (1); henüz 5 oyuncu gelmiş, Hakan'ın ekranı

```
+----------------------------------+
| Lobi               Oda 482913    |
| [ Linki kopyala ] [ Paylaş ]     |
+----------------------------------+
| Moderatör: Ayşe                  |
| Oyuncular (5/26)                 |
|  Ali                             |
|  Can                             |
|  Deniz                           |
|  Ece                             |
|  Hakan  (sen)                    |
+----------------------------------+
| Bu odada açık roller:            |
| Gulyabani x1, Köylü, Bekçi       |
+----------------------------------+
| ! En iyi deneyim için en az 6    |
|   oyuncu önerilir.               |
+----------------------------------+
| Moderatörün başlatması           |
| bekleniyor...                    |
| [  Rehber  ]  [Nasıl oynanır?]   |
+----------------------------------+
```

- Herkes katılımcı listesini ve açık rolleri görür; kimin hangi rolü alacağı hiçbir yerde görünmez (FR2.1; user-stories R-05'in ekran karşılığı).
- 6 oyuncu uyarısı yalnızca 3–5 oyuncuda görünür (FR2.4, AC1.4.2).
- İlk kez gelen oyuncuya bir kez "Nasıl oynanır?" kartı açılır; [Kapat] ile kapanır ve aynı tarayıcıda bir daha açılmaz (AC11.2.1).
- "Paylaş" düğmesi telefonun paylaşma menüsünü açar; desteklenmeyen tarayıcıda görünmez, yalnızca "Linki kopyala" kalır. Kopyalanınca "Link kopyalandı" kısa mesajı çıkar.
- **Durumlar:** Yalnızca moderatör varken: "Henüz oyuncu yok. Linki paylaş." Moderatör seni çıkarırsa: M-16. Oyun başlayınca herkes M-05'e geçer.

### M-04 Lobi — Moderatör

**Tema:** gündüz · **Hikâyeler:** US1.4, US1.5, US2.1 · **İskelet:** Kısmen (Yürüyen İskeletteki Ekranlar bölümüne bak) · **An:** lobi (1); 9 oyuncunun hepsi gelmiş, Ayşe'nin ekranı

Roller sekmesi (9 oyuncu, Klasik ön ayar):

```
+----------------------------------+
| Lobi (Moderatör)    Oda 482913   |
| [Oyuncular] [*Roller*] [Ayarlar] |
+----------------------------------+
| Ön ayar                          |
| ( Acemi ) (*Klasik*) (Dolu Köy)  |
+----------------------------------+
| Gulyabani     [kilitli] [- 2 +]  |
| Önerilen: 2 (9 oyuncu)           |
| Köylü         [kilitli] kalan    |
| Bekçi                  [ AÇIK ]  |
| Ahbaplar (2 adet)      [ AÇIK ]  |
| Boşboğaz Gulyabani     [KAPALI]  |
| Ürkek                  [KAPALI]  |
| Görücü                 [KAPALI]  |
| Celalli Damat          [KAPALI]  |
| Dertli                 [KAPALI]  |
+----------------------------------+
| Toplam: 2 gulyabani + 3 rol = 5  |
| Köylü: 4                         |
+----------------------------------+
| [       Oyunu Başlat       ]     |
+----------------------------------+
```

- Her rol satırının solunda küçük kart resmi ve altında tek satır açıklama vardır (çizimde yer kazanmak için gösterilmedi; FR3.1). Satıra dokununca Rehber'deki kart ayrıntısı açılır.
- Gulyabani adet seçicisi 1'in altına inmez (AC2.1.4). Önerilen sayı oyuncu sayısıyla birlikte güncellenir (FR3.3).
- "Toplam" satırı kalan Köylü sayısını gösterir; roller oyuncu sayısını aşarsa "Oyunu Başlat" pasifleşir ve altında "6 rol var, 5 oyuncu. Bir rolü kapat ya da oyuncu bekle." yazar (FR3.5, AC2.1.3).
- Gulyabani sayısı önerilenden fazlaysa sarı uyarı: "! 5 oyuncuda 2 gulyabani dengesiz olabilir." Başlatma engellenmez.
- Ön ayar seçildikten sonra bir anahtar değişirse ön ayar seçimi kalkar ve "Özel" yazar.

Oyuncular sekmesi:

```
+----------------------------------+
| [*Oyuncular*] [Roller] [Ayarlar] |
+----------------------------------+
| Oyuncular (9/26)                 |
| Ali   [Köyün en genci]  [Çıkar]  |
| Can                     [Çıkar]  |
| Deniz                   [Çıkar]  |
| Ece                     [Çıkar]  |
| ...                              |
+----------------------------------+
| [ Linki kopyala ] [ Paylaş ]     |
| [ Moderatörlüğü devret... ]      |
+----------------------------------+
```

- "Çıkar" ve "Moderatörlüğü devret..." onay ister (ConfirmDialog): "Ali odadan çıkarılsın mı? Bu geri alınamaz." [Çıkar] [Vazgeç]; "Moderatörlük Ali'ye geçsin mi? Sen oyuncu olacaksın." [Devret] [Vazgeç] (FR2.2, FR2.3).
- "Köyün en genci" işareti yalnızca eşitlik kuralı "Köyün en genci" iken görünür; bir oyuncuya verilir, ikinciye verilince birincisinden kalkar (FR2.7, AC1.5.3).

Ayarlar sekmesi:

```
+----------------------------------+
| [Oyuncular] [Roller] [*Ayarlar*] |
+----------------------------------+
| Süreler                          |
| Gündüz (meydan)    [- 4 dk +]    |
| Son söz            [- 30 sn +]   |
| Onay oylaması      [- 20 sn +]   |
| Gulyabani kararı   [- 90 sn +]   |
| Diğer gece seçimi  [- 60 sn +]   |
| Celalli Damat      [- 30 sn +]   |
+----------------------------------+
| Kurallar                         |
| İlk gece kaçırma yok   [KAPALI]  |
| Gulyabani eşitliği  [Rastgele v] |
| Oylama eşitliği  [Yeniden oy v]  |
| Oylar canlı görünsün   [ AÇIK ]  |
| Çekimser seçeneği      [KAPALI]  |
| Erken bitiş            [ AÇIK ]  |
+----------------------------------+
| Roller                           |
| Hayalet modu           [ AÇIK ]  |
| Her gün yeni kelime    [KAPALI]  |
| Ürkek fark edilme  [- %50 +]     |
| Ürkek uyarısında isim  [KAPALI]  |
| Dertli süresi  [2. gündüz v]     |
+----------------------------------+
| [ Varsayılanlara dön ]           |
+----------------------------------+
```

- Değerler ve izinli aralıklar gereksinimlerdeki tablodadır (FR2.6). Adet seçici aralığın dışına çıkmaz; elle yazılan aralık dışı değerde alanın altında "1–15 dk arasında olmalı" yazar ve değer kabul edilmez (AC1.5.2).
- "Roller" bölümündeki ayarlar yalnızca ilgili rol açıksa görünür (ör. Ürkek kapalıysa Ürkek ayarları yok).
- Son ayarlar ve rol havuzu bu tarayıcıda hatırlanır; yeni odada varsayılan olarak gelir (FR2.8, AC1.5.4).
- **Durumlar:** 3'ten az oyuncu: "Oyunu Başlat" pasif, "En az 3 oyuncu gerekli" (AC1.4.1). Oda 22 saatten eski: pasif, "Oda süresi dolmak üzere, yeni oda kur" (AC7.2.3). Başlatılamazsa: "Oyun başlatılamadı. Tekrar dene."

### M-05 Rol Dağıtımı

**Tema:** gece · **Hikâyeler:** US2.2, US11.3 · **İskelet:** Evet · **An:** rol dağıtımı (2)

Kapalı kart:

```
+----------------------------------+
| Rol Dağıtımı                     |
| Kartına bak, kimseye gösterme.   |
+----------------------------------+
|     +----------------------+     |
|     | [SVG: kart arka yüzü]|     |
|     | sisli köy, dolunay,  |     |
|     | kilim madalyon       |     |
|     |                      |     |
|     | Açmak için dokun     |     |
|     +----------------------+     |
+----------------------------------+
| [          Gördüm          ]     |
| 4/9 oyuncu gördü                 |
+----------------------------------+
```

Açık kart (Hakan'ın ekranı):

```
+----------------------------------+
|     +----------------------+     |
|     | BEKÇİ                |     |
|     | [SVG: fenerli bekçi] |     |
|     |                      |     |
|     | [fener] Köylüler     |     |
|     | Her gece bir evi     |     |
|     | yoklar.              |     |
|     | "Yatağı boş olanın   |     |
|     |  derdi büyük."       |     |
|     +----------------------+     |
| Kapatmak için tekrar dokun       |
+----------------------------------+
| [          Gördüm          ]     |
+----------------------------------+
```

- Kart kapalı gelir; dokununca (klavyede Enter ya da Boşluk) açılır, tekrar dokununca kapanır. Ekrandan ayrılınca kendiliğinden kapanır (FR4.2, AC2.2.1).
- "Gördüm"e basınca düğme "Gördün" olur ve pasifleşir; moderatör ekranında yanında "Gördüm" işareti çıkar (AC2.2.3).
- Kartın yapısı ve kontrastı `design-system-mapping.md` Kart Tasarımına Bağlantı'dadır (FR19.2, AC11.3.1, AC11.3.3).
- **Durumlar:** Kart yüklenene kadar yalnızca arka yüz görünür ve "Kartın hazırlanıyor..." yazar. Sonra moderatör ilk geceyi başlatınca herkes faz geçişine (M-06) geçer.

### M-06 Faz Geçişi

**Tema:** geçiş kartı · **Hikâyeler:** US4.1 (AC4.1.3) · **İskelet:** Evet · **An:** Gece 2 başlarken (5) · [Q2]

```
+----------------------------------+
|                                  |
|                                  |
|   [SVG: dolunay, sis, pençe]     |
|                                  |
|          GECE ÇÖKTÜ              |
|   (büyük gerçek metin, süslü)    |
|                                  |
|          Gece 2                  |
|                                  |
|                                  |
+----------------------------------+
```

- Gece başlarken "Gece çöktü", gündüz başlarken "Gün ağardı" kartı **herkeste aynı anda ve birebir aynı** görünür (yaşayan, ölü, rolü ne olursa olsun); 2 saniye sonra kendiliğinden kaybolur ve tema değişir. Hiçbir düğmesi yoktur; bilgi sızdırmaz.
- Moderatörün ekranı geçiş kartıyla kapanmaz: moderatör yalnızca temanın değiştiğini ve üst şeritte "Gece 2 başladı" yazısını görür, akışı kesintisiz sürer.
- Hareket azaltma açıksa kart animasyonsuz belirir ve kaybolur (US13.2 AC13.2.4).
- Ekran okuyucu "Gece 2 başladı" / "Gündüz 2 başladı" der (faz değişimi duyurusu, NFR9).
- Ne zaman çıkar: "Gece çöktü" — moderatör ilk gece anonsundan sonra geceyi başlatınca ve her infaz/gün sonu adımından sonra; "Gün ağardı" — sabah sonucu açıklanıp kazanan çıkmayınca, meydan toplantısından hemen önce (FR7.3).

### M-07 Uyku

**Tema:** gece · **Hikâyeler:** US3.2 · **İskelet:** Evet · **An:** Gece 2 (5); sırası gelmeyen herkes

```
+----------------------------------+
|                                  |
|   [SVG: sisli köy, dolunay]      |
|                                  |
|         Köy uyuyor...            |
|                                  |
|                                  |
|  Ekranı açık tut; telefon        |
|  kilitlenirse bağlantı           |
|  kopabilir.                      |
|                                  |
+----------------------------------+
```

- Herkeste birebir aynıdır: sayaç, düğme, isim, faz şeridi ve alt sekme çubuğu yoktur (FR5.5, AC3.2.1). Bilgisayarda da tam ekrandır.
- Sırası gelen oyuncunun ekranı sessizce eylem paneline (M-08) döner: titreşim, ses ya da ekran okuyucu duyurusu yoktur; odak da kodla taşınmaz ve sayfa başlığı herkeste "Gece · Oda 482913" kalır (FR5.5, AC3.2.2; `interaction-spec.md` Gece Sırası). Bu, kaba taslaktaki titreşim fikrinin yerine geçer (requirements [Q14], [Q17]).
- Ekran okuyucu bu ekrana gelindiğinde herkes için aynı cümleyi bir kez okur: "Gece. Köy uyuyor."
- Ölü oyuncular gece Uyku ekranını görmez; mezarlıkta kalır (M-12).
- Sabaha geçerken (son gece adımından sonra) Uyku ekranındaki yazı herkeste aynı anda "Sabah oluyor. Moderatörü dinle." olur.

### M-08 Gece Eylem Panelleri

**Tema:** gece · **Hikâyeler:** US3.2, US3.3, US6.1–US6.5, US6.7 · **İskelet:** Kısmen · **An:** Gece 2 (5); Ali henüz yaşıyor

Panel Uyku ekranının yerine tam ekran açılır; üstte rolün adı ve kalan süre vardır.

Gulyabanilerin ortak kararı (Gece 2, Mert'in ekranı; ikisi de Ali'yi seçti, karar onaylanmadan hemen önce) — **İskelet**:

```
+----------------------------------+
| Gece 2 · Gulyabaniler     1:12   |
+----------------------------------+
| Kurbanı birlikte seçin           |
| (o) Ali       <- Zeynep, sen     |
| ( ) Can                          |
| ( ) Deniz                        |
| ( ) Ece                          |
| ( ) Fırat                        |
| ( ) Gül                          |
| ( ) Hakan                        |
| ! Pencerede bir gölge var        |
+----------------------------------+
| Gulyabani sohbeti                |
| Zeynep: Ali olsun, bizi gördü    |
| Sen: tamam, Ali                  |
| [mesaj yaz.........] [Gönder]    |
+----------------------------------+
| [      Kararı Onayla       ]     |
| İkiniz de Ali'yi seçtiniz.       |
+----------------------------------+
```

- Seçimler ayrıysa (ör. Zeynep Ali'de, Mert Can'da) düğme pasiftir ve altında "Herkes aynı kişiyi seçmeli." yazar.
- "Pencerede bir gölge var" burada Ürkek Ali'nin baktığını ve fark edildiğini gösterir; gulyabaniler bu yüzden Ali'yi seçer.

- Listede yalnızca yaşayan, gulyabani olmayan oyuncular vardır; moderatör yoktur (FR6.1). Her satırın yanında hangi gulyabaninin o kişiyi seçtiği canlı yazar (FR6.2).
- "Kararı Onayla" herkes aynı kişide birleşince etkinleşir; onaylanınca "Karar verildi: Ali" yazar ve panel 2 saniye sonra Uyku ekranına döner (FR6.3, AC3.3.2).
- "Pencerede bir gölge var" uyarısı yalnızca Ürkek baktığında ve fark edildiğinde çıkar; ayar açıksa adı da yazar ("Pencerede bir gölge var: Ali") (FR10.3, AC6.3.3). İskelette yoktur.
- Süre dolarsa: "Süre doldu. Çoğunluğun seçimi geçerli." ya da eşitlikte "Süre doldu. Eşit seçimler arasından biri seçildi." / "Süre doldu. Bu gece kimse kaçırılmadı." (FR6.4, AC3.3.3, AC3.3.4).

Bekçi (Gece 2, Hakan'ın ekranı; gulyabaniler kararını verdi ama sabah açıklanmadığı için Ali listede yaşıyor görünür):

```
+----------------------------------+
| Gece 2 · Bekçi            0:42   |
+----------------------------------+
| Bir evi yokla                    |
| ( ) Ali                          |
| ( ) Can                          |
| ( ) Deniz                        |
| ( ) Ece                          |
| ( ) Fırat                        |
| ( ) Gül                          |
| ( ) Mert                         |
| ( ) Zeynep                       |
+----------------------------------+
| [      Seçimi Onayla       ]     |
+----------------------------------+
```

Sonuç:

```
+----------------------------------+
| Gece 2 · Bekçi                   |
+----------------------------------+
| Can                              |
| GULYABANİ DEĞİL                  |
|                                  |
| Bunu yalnızca sen ve moderatör   |
| görüyorsunuz.                    |
+----------------------------------+
| [          Tamam           ]     |
+----------------------------------+
```

- Bekçi kendini seçemez (FR10.2, AC6.2.1). Sonuç büyük yazıyla ve simgeyle gösterilir (gulyabaniyse pençe simgesi, değilse fener); Boşboğaz da "GULYABANİ" çıkar (AC6.2.2). "Tamam" Uyku ekranına döner; süre dolarsa sonuç yine gösterilir ve 10 saniye sonra kendiliğinden kapanır.

Aynı panelin diğer halleri:

| Rol ve an | Başlık | İçerik | Düğme | İskelet |
|---|---|---|---|---|
| Gulyabaniler (ilk gece, tanışma) | "Gulyabani yoldaşların" | Diğer yaşayan gulyabanilerin adları (tek gulyabaniyse "Bu gece köyde tek gulyabani sensin.") | [Tamam] | Evet |
| Görücü (ilk gece) | "İki kişiyi birbirine sevdalı et" | Yaşayan herkes (kendisi dahil) çoklu seçim, en fazla 2; 2 seçilmeden düğme pasif (FR10.7, AC6.7.1) | [Seçimi Onayla] | Hayır |
| Sevdalılar (ilk gece) | "Sevdalın" | "Sevdalın: Fırat." Rolü gösterilmez (FR10.8, AC6.7.2) | [Tamam] | Hayır |
| Ahbaplar (ilk gece) | "Ahbabın" | "Ahbabın: Gül. İkiniz de Köylüler tarafındasınız." (FR10.4, AC6.4.1) | [Tamam] | Hayır |
| Ürkek (2. geceden itibaren) | "Pencereden bakacak mısın?" | "Bakarsan gulyabanileri görürsün ama fark edilebilirsin." | [Pencereden bak] [Uyumaya devam] | Hayır |
| Ürkek (baktıysa) | "Pencereden gördüklerin" | Yaşayan gulyabanilerin adları (FR10.3, AC6.3.2) | [Tamam] | Hayır |
| Celalli Damat (öldüğünde) | "Yanında götüreceğin kişiyi seç" | Yaşayan herkes; 30 sn; süre dolarsa "Süre doldu, kimseyi götürmedin." (FR10.5, AC6.5.1) | [Seçimi Onayla] | Hayır |
| Boşboğaz (her sabah, kelime değişiyorsa) | "Bugünün kelimesi" | "Bugünün kelimesi: sis. Gündüz en az bir kez söyle." (FR10.1, AC6.1.1) | [Tamam] | Hayır |

- Celalli Damat paneli gündüz infazdan sonra da açılır; o an tema gündüzdür.
- **Durumlar:** Seçim gönderilemezse: "Gönderilemedi, tekrar dene." ve seçim korunur. Süre dolarsa: "Süre doldu." ve panel Uyku ekranına döner; seçim boş geçer (FR5.7, AC3.1.4). Kopan oyuncu dönerse panel kaldığı yerden, kalan süreyle açılır (FR14.4).

### M-09 Sabah

**Tema:** gece (sonuç açıklanınca gündüze döner) · **Hikâyeler:** US4.1, US4.2, US6.5 · **İskelet:** Evet · **An:** Sabah 2 (6)

Oyuncuların ekranı, moderatör "Sonucu Açıkla" dedikten sonra:

```
+----------------------------------+
| Sabah · Kara haber               |
+----------------------------------+
| Dün gece köyde kara bir olay     |
| oldu: Ali kaçırıldı.             |
+----------------------------------+
|     +----------------------+     |
|     | ÜRKEK                |     |
|     | [SVG: yorgan, mum]   |     |
|     | [fener] Köylüler     |     |
|     | Ali                  |     |
|     +----------------------+     |
+----------------------------------+
```

- Kimse kaçırılmadıysa: "Dün gece kimse kaçırılmadı." ve kart açılmaz (AC4.1.2).
- Birden çok ölüm varsa (ör. sevdalı ölümü, AC4.2.2) kartlar sırayla, aynı ekranda alt alta açılır; her kartın üstünde ölüm nedeni yazar ("Sevdalısının acısına dayanamadı").
- Etki zinciri (Celalli Damat seçimi → sevdalı ölümü → Dertli → kazanma kontrolü) sırasında diğer oyuncular "Köyde bir şeyler oluyor..." yazısını görür; Celalli Damat seçim panelini (M-08) görür (FR7.2, AC4.2.1, AC4.2.3).
- Ölen oyuncunun kendi ekranı: "Kaçırıldın. Artık mezarlıktasın." ve 3 saniye sonra mezarlık (M-12).
- Kazanan yoksa faz geçişi "Gün ağardı" (M-06), ardından gündüz (M-10); kazanan varsa oyun sonu (M-13).

### M-10 Gündüz — Oyuncu

**Tema:** gündüz · **Hikâyeler:** US5.1, US5.2, US5.3, US6.4, US6.7, US10.1, US10.2 · **İskelet:** Evet (rozetler ve şikayet hariç) · **An:** Gündüz 2 (7); Ali ölü, Ece infaz edilmeden önce yaşıyor

Meydan, Sohbet sekmesi (Gündüz 2, Deniz'in ekranı):

```
+----------------------------------+
| Gündüz 2 · Meydan   3:12   [?]   |
+----------------------------------+
| Can: Dün gece kim nerdeydi?      |
| Ece: ben bir şey görmedim        |
| Hakan: Bekçi olarak bir şey      |
|   söyleyeceğim...                |
| Mert: K****E diyemezsin bana     |
|                                  |
| [mesaj yaz............] [Gönder] |
| 0/300                            |
+----------------------------------+
| Oyuncular| Sohbet |Kartım|Rehber |
+----------------------------------+
```

- Ölü Ali sohbette yazmaz; ölüler gündüz sohbetini yalnızca mezarlıktan okur (FR8.2, rough-mockups R-03).
- Filtreye takılan kelime ilk ve son harfi açık, arası yıldızla gösterilir (FR16.3, AC10.1.1). Mesajlar düz metindir (FR16.2).
- Mesaja uzun basınca (klavyede mesajın yanındaki menü düğmesiyle) "Şikayet et" menüsü açılır; kendi mesajında bu seçenek yoktur (FR16.4, AC10.2.1, AC10.2.2). İskelette yoktur.
- Yazma alanının altında karakter sayacı vardır; 300'ü geçince "Gönder" pasifleşir ve "En fazla 300 karakter" yazar (AC10.1.2).
- [?] o fazda ne yapılacağını kısa bir kutuda anlatır: "Konuşun, şüphelendiğiniz kişiyi tartışın. Süre bitince moderatör oylamayı başlatır."
- Gündüz süresi dolunca oyuncular "Süre doldu. Moderatör oylamayı başlatacak." görür; oylama kendiliğinden başlamaz (FR8.1, AC5.1.2).

Oylama paneli (alttan açılır, Deniz'in ekranı):

```
+----------------------------------+
| Oylama                    0:20   |
| Kime oy veriyorsun?              |
+----------------------------------+
| ( ) Can        2 oy              |
| (o) Ece        3 oy  <- sen      |
| ( ) Fırat      1 oy              |
| ( ) Gül        0 oy              |
| ( ) Hakan      0 oy              |
| ( ) Mert       1 oy              |
| ( ) Zeynep     0 oy              |
+----------------------------------+
| [   Oyumu Ver   ] [Çekimser]     |
| Oy veren: 7/8                    |
+----------------------------------+
```

- Listede yalnızca yaşayan ve kendisi dışındaki oyuncular vardır; Deniz kendine oy veremez, ölü Ali listede yoktur (FR9.1, AC5.2.1; rough-mockups R-03 düzeltmesi).
- Oy sayıları yalnızca "Oylar canlı görünsün" açıksa görünür; kapalıysa sayı sütunu yoktur ve "Oylar oylama bitince açıklanacak" yazar (AC13.1.2).
- "Çekimser" yalnızca ayar açıksa görünür (FR9.1).
- Oy verildikten sonra seçim değiştirilebilir; "Oyumu Ver" yazısı "Oyumu Değiştir" olur.
- Eşitlik yeniden oylamasında başlık "Yeniden oylama: Ali ile Can eşit" olur ve listede yalnızca eşitler vardır (FR9.2, AC5.2.3).
- Oylama bitince sonuç: "Sanık: Ece (3 oy)" ya da "Kimse oy almadı. Bugün infaz yok." (AC5.2.2).

Son söz:

```
+----------------------------------+
| Son söz · Sanık: Ece      0:30   |
| Yalnızca Ece yazabilir.          |
+----------------------------------+
| Ece: Ben Görücüyüm, yemin        |
| ederim! Fırat'a sorun.           |
| Ayşe (moderatör): Süre azalıyor. |
+----------------------------------+
| (Ece değilsen yazma alanı yok)   |
+----------------------------------+
| Oyuncular| Sohbet |Kartım|Rehber |
+----------------------------------+
```

- Sanık dışındakilerin yazma alanı görünmez; yerinde "Son söz sırasında yalnızca sanık yazabilir." yazar. Moderatörün mesajı görünür (FR9.3, AC5.3.1).

Onay oylaması: oylama paneliyle aynıdır; başlık "Son karar: Oyunu değiştirebilirsin", mevcut oylar korunarak açılır ve süre 20 saniyedir (FR9.4).

- Sonuçlar: "Ece infaz edildi." ve kartı herkesin ekranında açılır (AC5.3.2); "Çoğunluk bozuldu. Yeni sanık: Can." ve son söz yeniden başlar (AC5.3.3); "Bugün iki kez yeniden oylandı. İnfaz yok." (AC5.3.4).

Oyuncular sekmesi (Deniz'in ekranı):

```
+----------------------------------+
| Gündüz 2 · Meydan   3:12   [?]   |
+----------------------------------+
| Ali    (öldü)  Ürkek             |
| Can            yaşıyor           |
| Ece            yaşıyor           |
| Fırat          yaşıyor           |
| Gül   [Ahbap]  yaşıyor           |
| Hakan          yaşıyor           |
| Mert           yaşıyor           |
| Zeynep         yaşıyor           |
| Deniz (sen)    yaşıyor           |
+----------------------------------+
| Oyuncular| Sohbet |Kartım|Rehber |
+----------------------------------+
```

- Ölen oyuncu soluk görünür, adının yanında "(öldü)" ve açılmış rolü yazar; durum yalnızca renkle değil yazıyla da belirtilir (FR12.4).
- Rozetler yalnızca hak eden oyuncunun ekranında görünür: Deniz yalnızca ahbabını (Gül) görür; sevdalıları göremez (FR10.4, AC6.4.2, NFR8).
- "kopuk" durumu oyunculara gösterilmez; yalnızca moderatör görür (FR14.3). Oyuncu listesinde bağlantı durumu rol ipucu vermesin diye yoktur.

Kartım sekmesi: M-05'teki kartın aynısıdır, kapalı gelir; dokununca açılır. Rozetler kartın altında listelenir ("Ahbabın: Gül").

### M-11 Moderatör Ekranı

**Tema:** faza göre gece/gündüz · **Hikâyeler:** US1.3, US2.2, US3.1, US4.1, US5.4, US6.1, US6.6, US9.2, US9.6, US10.1, US10.3 · **İskelet:** Evet (rol adımları, Boşboğaz/Dertli göstergeleri, yeniden katılma onayı, çıkarma, bekleyenler ve odayı kapatma hariç) · **An:** her çizimin başında yazar

Akış sekmesi, gece (An: Gece 2, Bekçi adımı; Ali henüz yaşıyor):

```
+----------------------------------+
| Moderatör   Gece 2   Adım 2/3    |
| [*Akış*][Oyuncular][Günlük][Soh] |
+----------------------------------+
| Okuyacağın anons:                |
| "Bekçi uyansın, fenerini         |
| alsın ve bir evi yoklasın."      |
+----------------------------------+
| Beklenen: Bekçi (Hakan) seçiyor  |
| Durum: bekleniyor        0:35    |
+----------------------------------+
| [       Sonraki Adım       ]     |
| [ Süre +30 sn ] [ Duraklat ]     |
+----------------------------------+
| Boşboğaz: Zeynep · kelime: sis   |
| [x] Bugün söyledi (sohbetten)    |
| Dertli: rolde yok                |
+----------------------------------+
```

- Anons metni `font.announce` boyutundadır ve sayfadaki en büyük metindir (W-09).
- Durum dört değerden biridir ve simgeyle de gösterilir: bekleniyor (kum saati), yapıldı (onay işareti), süre doldu (saat), oyuncu kopuk (kopuk kablo) (FR5.4, AC3.1.1).
- İlk gece anonsu şu cümleyle biter: "Gece sıranız gelince yalnızca ekranınız değişecek; titreşim ya da ses olmayacak." (FR13.4, AC3.1.2)
- Ölü rolün adımında anons normal gösterilir ve altında "Bu rolün oyuncusu öldü; adım birkaç saniye içinde kendiliğinden geçecek." yazar (FR5.3, AC3.1.3).
- "Sonraki Adım" her zaman aynı yerdedir ve herkes "Gördüm" demeden de kullanılabilir (AC2.2.3). Rol dağıtımı sırasında Akış'ta "Gördüm: 7/9" ve kimin henüz görmediği yazar.
- Boşboğaz kutusu ve Dertli göstergesi yalnızca o roller açıksa görünür (FR13.1, AC6.1.2, AC6.6.3).

Akış sekmesi, sabah (An: Sabah 2, sonuç açıklanmadan önce):

```
+----------------------------------+
| Moderatör   Sabah 2              |
+----------------------------------+
| Okuyacağın anons:                |
| "Dün gece köyde kara bir olay    |
| oldu: Ali kaçırıldı."            |
+----------------------------------+
| Gecenin sonucu (yalnızca sen):   |
| Gulyabaniler -> Ali              |
| Bekçi -> Can: değil              |
+----------------------------------+
| [      Sonucu Açıkla       ]     |
+----------------------------------+
```

- "Sonucu Açıkla" ile kartlar herkeste açılır ve etki zinciri işler; zincir sürerken düğmenin yerinde "Etkiler işleniyor: Celalli Damat seçiyor (0:24)" yazar (FR7.1, FR7.2).

Akış sekmesi, gündüz oylama (An: Gündüz 2, oylama; Fırat kopuk olduğu için oy vermedi):

```
+----------------------------------+
| Moderatör   Gündüz 2   Oylama    |
+----------------------------------+
| Oy dağılımı         0:14         |
| Ece    3  (Deniz, Can, Gül)      |
| Can    2  (Mert, Zeynep)         |
| Fırat  1  (Ece)                  |
| Mert   1  (Hakan)                |
| Oy vermeyen: Fırat               |
+----------------------------------+
| Adımlar: Meydan > *Oylama* >     |
| Son söz > Son karar > İnfaz      |
| Yeniden oylama: 0/2              |
+----------------------------------+
| [       Sonraki Adım       ]     |
| [ Süre +30 sn ] [ Duraklat ]     |
+----------------------------------+
```

- Moderatör kimin kime oy verdiğini her zaman görür (FR9.6, AC5.4.1). Meydan süresi dolunca bu alanda "Süre doldu. Oylamaya geç?" ve [Oylamaya geç] [Süre +2 dk] çıkar (FR8.1, AC5.1.2).
- Son söz sırasında Akış'ta sanığın adı ve kalan süre, sohbete yazma alanı (moderatör yazabilir) görünür.

Uyarı ve onay kartları (Akış sekmesinin en üstünde, gelen sırayla; An: Gündüz 2, Fırat'ın bağlantısı 3 dakikadır kopuk):

```
+----------------------------------+
| ? Fırat yeniden katılmak         |
|   istiyor. Fırat'ın bağlantısı   |
|   3 dakikadır kopuk. İsteği      |
|   gerçekten Fırat mı gönderdi?   |
|   Toplantıda sor.                |
| [  Onayla...  ]  [  Reddet  ]    |
+----------------------------------+
```

"Onayla..."ya basınca ikinci adım (sahip düzeltmesi, review R-05):

```
+----------------------------------+
| Emin misin?                      |
| Bu tarayıcı Fırat'ın yerine      |
| geçecek ve Fırat'ın rolünü       |
| görecek. Yanlış kişiyse gizli    |
| bilgi ona gider.                 |
| [   Vazgeç   ] [ Evet, onayla ]  |
+----------------------------------+
```

Sonraki faz başladığında Fırat hâlâ kopuksa:

```
+----------------------------------+
| ! Fırat hâlâ kopuk.              |
|   Oyundan çıkarılsın mı?         |
| [ Çıkar... ]  [ Bekle ]          |
+----------------------------------+
```

- Kopuk oyuncu uyarısı sonraki faz başladığında hâlâ kopuk olan oyuncu için çıkar; karar moderatöründür (FR14.4, AC9.2.4). "Çıkar..." ConfirmDialog açar.
- Yeniden katılma kartı yalnızca o oyuncunun bağlantısı kopukken gelebilir [Q3]. Kart, moderatörü isteği gönderenin gerçekten o oyuncu olup olmadığını toplantıda sormaya yönlendirir (başkasının yerine geçme riski; user-stories R-01). Onay iki adımdır: "Onayla..." ve ardından "Emin misin?" penceresinde "Evet, onayla"; pencerede ilk odak "Vazgeç"tedir. Onaylanınca: "Fırat oyuna döndü." (AC9.6.1, AC9.6.2). "Reddet" tek adımdır, çünkü geri alınabilir: kişi yeniden istek gönderebilir. Bekleyen istek varken Fırat'ın eski bağlantısı geri gelirse istek kendiliğinden düşer.

Oyuncular sekmesi (An: Gündüz 2, oylama; Selin bekleme ekranında):

```
+----------------------------------+
| [Akış][*Oyuncular*][Günlük][Soh] |
+----------------------------------+
| Ali    Ürkek          öldü       |
| Can    Köylü          yaşıyor    |
| Deniz  Ahbap          yaşıyor    |
| Ece    Görücü [Sevdalı] yaşıyor  |
| Fırat  Köylü [Sevdalı] kopuk     |
| Gül    Ahbap          yaşıyor    |
| Hakan  Bekçi          yaşıyor    |
| Mert   Gulyabani      yaşıyor    |
| Zeynep Boşboğaz G.    yaşıyor    |
+----------------------------------+
| Satıra dokun: [Çıkar...]         |
+----------------------------------+
| Bekleyenler (yeni oyunda gelir)  |
| Selin                  [Çıkar]   |
+----------------------------------+
| Yeni isteklere kapat   [KAPALI]  |
| Açarsan yeni kimse istek         |
| gönderemez.                      |
+----------------------------------+
```

- Rol adının önünde taraf simgesi vardır (çizimde gösterilmedi). Satıra dokununca o oyuncunun ayrıntısı ve oyun sırasında "Çıkar..." düğmesi açılır (FR15.1, US10.3).
- **Bekleyenler:** oyun sürerken ya da oyun bittikten sonra gelen kişiler; "Yeni oyun" basılınca hepsi lobiye alınır. "Çıkar" ConfirmDialog açar ("Selin bekleyenlerden çıkarılsın mı?"). Art arda 2. kez çıkarılan kişi 30 dakika istek gönderemez (M-02). Bekleyen yoksa bu bölüm görünmez. Aynı liste lobide (M-04 Oyuncular) moderatöre de görünür.
- **Yeni isteklere kapat:** açıkken yeni gelen kimse bekleme ekranına geçemez ve yeniden katılma isteği gönderilemez; gelen kişi M-16 "Bu oda şu an yeni oyunculara kapalı." görür. Anahtar lobide de vardır; oyun boyunca ve yeni oyunda açık kalır, moderatör istediği an kapatır. Açıkken oyunculara bir şey gösterilmez.

Günlük sekmesi (An: Gündüz 2, oylama; infazdan önce):

```
+----------------------------------+
| [Akış][Oyuncular][*Günlük*][Soh] |
+----------------------------------+
| Gece 1 · Görücü: Ece + Fırat     |
| Gece 1 · kimse kaçırılmadı       |
| Gece 2 · Ürkek baktı, görüldü    |
| Gece 2 · Gulyabaniler -> Ali     |
| Gece 2 · Bekçi -> Can: değil     |
| Sabah 2 · Ali kaçırıldı (Ürkek)  |
+----------------------------------+
```

Sohbet sekmesi: üç kanal alt sekme olarak: Gündüz (yazabilir), Gulyabani (salt okunur), Mezarlık (salt okunur). Şikayet edilen mesajlar bayrak simgesi ve "Şikayet edildi (Can)" etiketiyle işaretlenir (FR13.3, AC10.1.4, AC10.2.1). Salt okunur kanallarda yazma alanı yoktur, yerinde "Bu sohbeti yalnızca okuyabilirsin." yazar.

- **Durumlar:** Bir oyuncu kopukken "Sonraki Adım" yine kullanılabilir. Moderatörün kendi bağlantısı koparsa oyun duraklar (oyuncu tarafı M-15); 3 dakika içinde dönerse Akış kaldığı adımdan açılır (FR14.5). 3 dakikadan sonra ne olduğu M-18'dedir.

### M-12 Mezarlık

**Tema:** faza göre · **Hikâyeler:** US8.1, US8.2 · **İskelet:** Hayır · **An:** Gündüz 2, oylama (7); Ali'nin ekranı

```
+----------------------------------+
| Mezarlık · Öldün (Ürkek)         |
| [*Canlı izle*] [Mezarlık soh.]   |
+----------------------------------+
| Gündüz 2 · Oylama        0:14    |
| Ece 3 oy · Can 2 oy · Fırat 1    |
+----------------------------------+
| Yaşayanların sohbeti (okuma)     |
| Hakan: bence Mert                |
| Can: Ece'ye bakın                |
| (buraya yazamazsın)              |
+----------------------------------+
| Hayalet modu açık                |
| Mert: Gulyabani                  |
| Zeynep: Boşboğaz Gulyabani       |
| Gece 2 · Bekçi -> Can: değil     |
+----------------------------------+
```

- Ölen oyuncu kendiliğinden buraya geçer; gece Uyku ekranını görmez, gece adımlarını hayalet modu açıksa günlükten izler (FR12.1, AC8.1.1).
- Mezarlık Sohbeti sekmesinde ölüler yazar; yaşayanlar bu sekmeyi hiç görmez (FR12.2, AC8.1.2).
- Hayalet modu kapalıysa alt bölüm hiç yoktur; açıkken de gulyabani sohbeti gösterilmez (FR12.3, AC8.2.1, AC8.2.2).
- **Durumlar:** Mezarlıkta tek kişi varken: "Burada henüz yalnızsın." Mesaj gönderilemezse "Gönderilemedi, tekrar dene."

### M-13 Oyun Sonu ve Geri Bildirim

**Tema:** gündüz · **Hikâyeler:** US7.1, US7.2, US7.3 · **İskelet:** Evet (geri bildirim hariç) · **An:** oyunun sonu (8)

```
+----------------------------------+
| Oyun Bitti                       |
| KÖYLÜLER KAZANDI  [fener]        |
| + Sevdalılar: Ece ve Fırat       |
+----------------------------------+
| Herkesin rolü                    |
| Mert    Gulyabani                |
| Zeynep  Boşboğaz Gulyabani       |
| Hakan   Bekçi                    |
| Ali     Ürkek                    |
| Deniz, Gül  Ahbaplar             |
| ...                              |
| [   Gece olay günlüğü   ]        |
+----------------------------------+
| Oyun nasıldı?                    |
| [ :( Kötü ] [ :| Orta ] [ :) İyi]|
| Açıklama (isteğe bağlı)          |
| [__________________________]     |
| [ Gönder ] [Öneri/Şikayet yaz]   |
+----------------------------------+
| [ Yeni oyun ]  (yalnız moderatör)|
| [ Ana sayfa ]                    |
+----------------------------------+
```

- Kazanan başlığında taraf simgesi ve yazısı vardır; Dertli kazanırsa "DERTLİ KAZANDI", karışık sevdalı çift kazanırsa "SEVDALILAR KAZANDI: Ece ve Fırat" (FR11.1, AC7.1.1–AC7.1.4).
- Herkesin rolü, ahbaplar ve gece olay günlüğü herkese açılır (FR11.2, AC7.2.1).
- Yüzlerin yanında her zaman yazı vardır; seçili yüz kalın çerçeve ve onay işaretiyle belirtilir (FR17.3, AC7.3.1). Açıklama ve "Öneri/Şikayet" alanları en fazla 1.000 karakterdir; sayaç gösterilir (AC7.3.3).
- "Yeni oyun" yalnızca moderatörde görünür; basınca herkes aynı odanın lobisine geçer, ayarlar korunur; bekleme ekranındakiler de lobiye alınır (FR17.2, AC7.2.2). Moderatörün ekranında düğmenin üstünde "Bekleyenler: 2 kişi yeni oyunda gelecek" yazar.
- **Durumlar:** Gönderilince "Teşekkürler!" görünür ve geri bildirim alanı pasifleşir. Gönderilemezse "Gönderilemedi. Tekrar dene." ve seçim ile metin korunur (AC7.3.2). Oda 22 saatten eskiyse "Yeni oyun" pasif, "Oda süresi dolmak üzere, yeni oda kur" (AC7.2.3).

### M-14 Rehber

**Tema:** açıldığı yerin teması · **Hikâyeler:** US11.1, US11.2, US11.3 · **İskelet:** Hayır · **An:** Gündüz 2, oylama başladığı an (7)

```
+----------------------------------+
| Rehber                     [X]   |
| [*Kartlar*][Nasıl oynanır][Mod.] |
+----------------------------------+
| (*Bu odada açık*) (Tümü)         |
| (Gulyabaniler) (Köylüler)        |
| (Bağımsızlar)                    |
+----------------------------------+
| [Gulyabani] [ Köylü ] [ Bekçi ]  |
| [Ahbaplar ] [Ürkek-soluk]        |
| [Görücü-soluk] [Dertli-soluk]    |
+----------------------------------+
| ! Faz değişti: Oylama başladı.   |
|   [Oyuna dön]                    |
+----------------------------------+
```

- Oyunun üstünde bir katman (dialog) olarak açılır; oyun arkada sürer (FR18.1, AC11.1.1). Oda içinde "Bu odada açık" filtresi seçili gelir, kapalı roller soluk ve "bu odada yok" yazısıyla görünür (FR18.2, AC11.1.2).
- Karta dokununca ayrıntı: büyük görsel, taraf (simge + yazı), yetenek, ne zaman uyandığı, kazanma koşulu, kısa ipucu (AC11.1.3). Kimin hangi rolde olduğu hiçbir yerde yoktur (FR18.6).
- "Mod." sekmesi yalnızca moderatörde görünür (FR18.4, AC11.2.3). Nasıl Oynanır sekmesi: tek ekranlık özet, resimli adımlar ve sık sorulanlar; sık sorulanlarda "Gece sıramı nasıl anlarım?", "Telefon ekranım kilitlenirse ne olur?" ve ekran okuyucu kullananlara kulaklık önerisi vardır (FR18.3, AC11.2.2; wireframes W-12).
- Faz değişirse rehberin üstünde kısa şerit çıkar; [Oyuna dön] rehberi kapatır.
- **Durumlar:** Filtre sonucu boşsa: "Bu filtrede kart yok." Gece sırası gelmişse rehber kendiliğinden kapanır ve eylem paneli (M-08) açılır.

### M-15 Durum Şeritleri

**Tema:** açıldığı yerin teması · **Hikâyeler:** US9.1, US9.3, US9.4, US9.5 · **İskelet:** Evet (yalnızca bağlantı şeridi) · **An:** herhangi bir an

Bağlantı şeridi (her ekranın en üstünde):

```
+----------------------------------+
| ! Bağlantı koptu.                |
|   Yeniden bağlanılıyor...        |
|   Rolün ve durumun korunuyor.    |
|   [ Sorun bildir ]               |
+----------------------------------+
| v Tekrar oyundasın.              |
+----------------------------------+
| ! Bağlanamadık. İnternetini      |
|   kontrol edip sayfayı yenile.   |
|   [ Sayfayı yenile ]             |
+----------------------------------+
```

- Kopunca ilk şerit çıkar; ağ gelince en fazla 5 saniyede "Tekrar oyundasın." görünür ve 3 saniye sonra kaybolur; 60 saniyede bağlanılamazsa üçüncü şerit (FR14.2, AC9.1.2).
- "Sorun bildir" isteğe bağlı kısa açıklama alanı açar (en fazla 300 karakter) ve "Bildirimin alındı." der (FR17.5, AC9.1.3).
- Bağlantı koparken ekrandaki son görünüm yerinde kalır; düğmeler pasifleşir, yazılan mesaj ve seçim silinmez.
- Sunucu yeniden başladığında oyuncu aynı şeridi görür; geri gelince oylama kalan süreyle sürer (US9.4, AC9.4.1).

Diğer şeritler:

| Durum | Şerit | Kaynak |
|---|---|---|
| Moderatör koptu | "Moderatör bekleniyor. Oyun duraklatıldı." ve geri sayım: "2:41 sonra yeni moderatör aranacak." Sayaçlar durur, yanında duraklama simgesi. 3 dakika dolunca M-18 | FR14.5 (sahip düzeltmesiyle değişti), AC9.3.1 |
| Moderatör döndü | "Moderatör döndü. Oyun sürüyor." | AC9.3.2 |
| Oyun başka sekmede açıldı | Tam ekran: "Oyun başka bir pencerede açıldı." [Burada devam et] | FR14.7, AC9.5.1 |
| Moderatör süreyi duraklattı | "Moderatör oyunu duraklattı." | FR8.1, AC5.1.3 |

- "Burada devam et" bu sekmeyi yeniden oyunun sahibi yapar; diğer sekme aynı mesajı görür (son açılan devralır, A9).

### M-16 Bilgi ve Hata Mesajları

**Tema:** gündüz · **Hikâyeler:** US1.2, US1.3, US1.4, US10.3, US13.3 · **İskelet:** Evet (oda yok, dolu, çıkarıldın) · **An:** herhangi bir an

```
+----------------------------------+
|   [SVG: sisli patika, tabela]    |
|                                  |
| Bu oda bulunamadı ya da süresi   |
| doldu.                           |
|                                  |
| [       Ana sayfa        ]       |
| [       Yeni oda kur     ]       |
+----------------------------------+
```

| Durum | Mesaj | Düğmeler | Kaynak |
|---|---|---|---|
| Oda yok ya da 24 saati doldu | "Bu oda bulunamadı ya da süresi doldu." | [Ana sayfa] [Yeni oda kur] | FR1.5, AC1.2.4 |
| Oda dolu (26 oyuncu, bekleyenler dahil) | "Bu oda dolu." | [Ana sayfa] | FR2.4, AC1.3.3 |
| Odadan çıkarıldın | "Moderatör seni odadan çıkardı." | [Ana sayfa] | FR2.3, FR15.2, AC1.4.3, AC10.3.3 |
| Yeniden katılma reddedildi | "Moderatör isteği onaylamadı." | [Ana sayfa] | AC9.6.3 |
| Oda yeni isteklere kapalı | "Bu oda şu an yeni oyunculara kapalı." | [Ana sayfa] [Yeni oda kur] | sahip düzeltmesi (M-11) |
| Art arda 2 kez çıkarıldı, 30 dakika dolmadı | "Bu odaya bir süre istek gönderemezsin. 30 dakika sonra tekrar dene." | [Ana sayfa] | sahip düzeltmesi (M-02) |
| Moderatör yok, ölü oyuncu yok | M-18 "Moderatör yok" ekranı | [Yeni oda kur] [Oyundan çık] | sahip düzeltmesi (M-18) |
| Oyun sürüyor (yalnızca iskelette, bekleme ekranı yokken) | "Bu odada oyun sürüyor. Oyun bitince tekrar dene." | [Ana sayfa] | team-practices Walking Skeleton |
| Bağlantı hiç kurulamıyor | "Oyuna bağlanamadık. İnternetini kontrol et." | [Tekrar dene] | FR14.2 |
| Sırası olmayan işlem reddedildi | "Bu işlem şu an yapılamaz." (kısa mesaj, ekran değişmez) | — | NFR7, AC13.5.1 |
| Çok hızlı mesaj | "Biraz yavaş: birkaç saniye bekle." (yazma alanının altında) | — | NFR7, AC13.5.2 |
| Çok fazla kod denemesi | "Çok fazla deneme yaptın. Bir dakika sonra tekrar dene." | — | NFR7, AC13.5.2 |

### M-17 Bilgisayar Düzenleri

**Hikâyeler:** US5.4 (AC5.4.3), [Q4] · **İskelet:** Evet · **An:** Gündüz 2, meydan (7); Deniz'in ekranı

Oyuncu, bilgisayar (1024 piksel ve üstü), iki sütun:

```
+--------------------------------------------------------------------+
| Gündüz 2 · Meydan                    3:12                     [?]  |
+-----------------------------------------+--------------------------+
| Sohbet                                  | Oyuncular                |
| Can: Dün gece kim nerdeydi?             | Ali   (öldü) Ürkek       |
| Ece: ben bir şey görmedim               | Can          yaşıyor     |
| Hakan: Bekçi olarak bir şey...          | Ece          yaşıyor     |
|                                         | Gül  [Ahbap] yaşıyor     |
|                                         | ...                      |
|                                         +--------------------------+
|                                         | Kartım  [Kartı aç]       |
| [mesaj yaz.................] [Gönder]   | [ Rehber ]               |
+-----------------------------------------+--------------------------+
```

- Alt sekme çubuğu bilgisayarda yoktur; dört alan aynı anda görünür (Sohbet solda; Oyuncular, Kartım ve Rehber düğmesi sağda) [Q4]. Oylama paneli sağ sütunun üstüne açılır, sohbet görünür kalır.
- Uyku ekranı ve faz geçiş kartı bilgisayarda da tam ekrandır (bilgi sızmasın diye).

Moderatör, geniş bilgisayar (1200 piksel ve üstü), üç sütun: soldan sağa Akış / Oyuncular / Günlük + Sohbet (W-09 düzeni). 768–1199 piksel arasında iki sütun: solda Akış, sağda sekmeli Oyuncular / Günlük / Sohbet (`design-system-mapping.md` Ekran Genişliği Eşikleri; AC5.4.3).

### M-18 Moderatör Kaybolursa

**Tema:** faza göre · **Hikâyeler:** US9.3 (sahip düzeltmesiyle değişti) · **İskelet:** Hayır · **An:** Gündüz 2 (7); Ayşe'nin telefonu kapandı, tek ölü oyuncu Ali

Sahibin kuralı (review R-01 çözümü): moderatör kaybolursa oyun 3 dakika durur; dönmezse ölü oyunculara moderatörlük teklif edilir; ölü yoksa oyun devam edemez.

**1. İlk 3 dakika (herkes):** M-15'teki "Moderatör bekleniyor. Oyun duraklatıldı." şeridi ve geri sayım ("2:41 sonra yeni moderatör aranacak"). Moderatör bu sürede aynı linkle dönerse oyun kaldığı yerden sürer.

**2. Teklif kartı (yalnızca ölü oyuncular; Ali'nin ekranı):**

```
+----------------------------------+
| Moderatör 3 dakikadır yok        |
+----------------------------------+
| Oyunun sürmesi için moderatör    |
| olur musun?                      |
|                                  |
| Moderatör olursan herkesin       |
| rolünü görür, anonsları okur ve  |
| oyunu sen yönetirsin.            |
|                                  |
| [   Moderatör ol (0:07)    ]     |
| [          Hayır           ]     |
| Düğmeler 10 saniye sonra açılır. |
+----------------------------------+
```

- Kart bütün ölü oyunculara aynı anda gider. İki düğme de kart açıldıktan **10 saniye sonra** etkinleşir; bu sürede düğmenin üstünde geri sayım vardır (yazıyı okumadan basılmasın diye).
- **İlk kabul eden moderatör olur.** Diğer ölülerin kartı kapanır ve "Ali moderatör oldu." yazar.
- "Hayır" diyen kişinin kartı kapanır. Bütün ölüler "Hayır" derse herkes 4. maddedeki "Moderatör yok" ekranını görür. Kimse yanıt vermezse teklif açık kalır.
- Teklif açıkken eski moderatör dönerse teklif kendiliğinden kapanır ve oyun eski moderatörle sürer.

**3. Yeni moderatör (herkes):** yaşayan oyuncular "Ali artık moderatör. Oyun Ali devam edince sürecek." şeridini görür. Ali'nin ekranı moderatör ekranına (M-11) döner; oyun kaldığı adımda duraklamış olarak açılır ve Ali "Devam et"e basınca sürer. Ali bundan sonra mezarlık sohbetini yalnızca okur.

- **Devretme:** yeni moderatör, yanlışlıkla kabul ettiyse ya da sorun çıkarsa Akış'taki [Moderatörlüğü devret...] ile moderatörlüğü başka bir ölü oyuncuya devreder. Seçilen kişiye aynı teklif kartı (10 saniye kuralıyla) gider; kabul ederse moderatör o olur, "Hayır" derse moderatörlük Ali'de kalır. Lobideki devretme kuralı (FR2.2) değişmez.
- **Eski moderatör sonradan dönerse:** "Moderatörlük Ali'ye geçti. Ali isterse sana geri devredebilir." yazar ve oyunu izleyici olarak görür (mezarlıktaki "Canlı izle" gibi, hiçbir yere yazamaz). Ali'nin devretme listesinde "Ayşe (eski moderatör)" de görünür.

**4. Ölü oyuncu yoksa ya da herkes "Hayır" dediyse (herkes):**

```
+----------------------------------+
|   [SVG: sönmüş gaz lambası]      |
|                                  |
| Moderatör yok                    |
|                                  |
| Moderatör 3 dakikadır gelemedi   |
| ve oyunu yönetecek kimse yok.    |
| Bu oyun devam edemiyor.          |
|                                  |
| [       Yeni oda kur       ]     |
| [       Oyundan çık        ]     |
+----------------------------------+
```

- "Yeni oda kur" basan kişi yeni bir odanın moderatörü olur (M-02 "Yeni oda"); yeni linki diğerlerine kendisi gönderir. "Oyundan çık" ana sayfaya döner.
- Ekranda kimsenin rolü açılmaz; oyun bitmiş sayılmaz. Bu ekrandayken eski moderatör dönerse oyun kaldığı yerden sürer ve herkes "Moderatör döndü. Oyun sürüyor." görür.
- Gece de aynı kural geçerlidir; şeritler ve ekranlar herkeste aynı olduğu için gece sırası belli olmaz. Teklif kartı yalnızca ölülere gider; ölü olmak zaten herkesin bildiği bir bilgidir.

## Assumptions & Open Questions

- [assumption] Yeni moderatör kabul edince oyun duraklamış açılır ve yeni moderatör "Devam et"e basınca sürer; ölü oyuncu moderatör olunca mezarlık sohbetini yalnızca okur. Bu ayrıntıları sahip yerine ben seçtim.
- [assumption] Teklifi kimse yanıtlamazsa teklif açık kalır; "Moderatör yok" ekranı yalnızca ölü yoksa ya da bütün ölüler "Hayır" derse çıkar.
- [assumption] "Aynı kişi" (art arda iki çıkarma kuralı) aynı tarayıcı demektir; hesap yok ve IP saklanmadığı için başka tarayıcıdan gelen kişi tanınmaz. Bunun için moderatörün "Yeni isteklere kapat" anahtarı vardır.
- [assumption] Lobiden ya da bekleyenlerden çıkarılan kişi tekrar istek gönderebilir (art arda iki çıkarmaya kadar); oyun sırasında çıkarılan kişi ise odaya hiç dönemez (FR15.3 değişmedi).
- Sahip düzeltmesi FR14.5'i değiştirir ("oda silinene kadar beklenir" yerine 3 dakika bekleme ve ölülere moderatörlük teklifi) ve FR2.3'e art arda iki çıkarma kuralı ile odayı yeni isteklere kapatma anahtarını ekler. requirements.md bu noktalarda Fonksiyonel Tasarım'dan önce güncellenmeli.
- [assumption] Yeniden katılma isteğine 5 dakika içinde yanıt gelmezse istek düşer (M-02c); süre, kopan oyuncuya tanınan 5 dakikayla aynı seçildi (FR14.4).
- [assumption] İskelette oyun sürerken gelen kişi bekleme ekranı yerine "Bu odada oyun sürüyor" mesajı görür (M-16); kesin parça sırası Teslimat Planlaması'nda belirlenir.
- [assumption] "kopuk" durumu oyunculara gösterilmez, yalnızca moderatöre (FR14.3); kaba taslakta oyuncu ekranında "bağlantı yok" görünüyordu, gereksinimle uyumlu olsun diye kaldırıldı.
- [assumption] Ölen oyuncu gece Uyku ekranını görmez, mezarlıkta kalır.
- [assumption] Moderatör faz geçiş kartını tam ekran görmez; yalnızca tema ve üst şerit değişir.
- Yeniden katılma kuralı (Q3) gereksinim belgesinde FR14.1'in altında ayrı bir madde olarak henüz yok (user-stories R-01, R-06); Fonksiyonel Tasarım'da kural olarak yazılmalı.
