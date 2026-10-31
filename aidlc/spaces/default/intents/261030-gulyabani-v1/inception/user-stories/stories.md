# Kullanıcı Hikâyeleri — Gulyabani–Köylü (çalışma adı)

v1'in kullanıcı hikâyeleri. Her hikâye bir kişinin (`personas.md`: P1 Moderatör, P2 Oyuncu, P3 Ölü oyuncu, P4 Sahip) gözünden yazıldı ve gereksinimlere (`inception/requirements-analysis/requirements.md`, FR/NFR kimlikleri) bağlandı. Kimlikler kalıcıdır: hikâye `US{grup}.{sıra}`, kabul ölçütü `AC{grup}.{sıra}.{n}`. Kabul ölçütleri Türkçe Gherkin ile yazıldı: **Diyelim ki** (başlangıç), **Eğer ki** (eylem), **O zaman** (sonuç), **Ve** (ek). Ekip çalışma biçimi (`inception/practices-discovery/team-practices.md`) gereği oyun kuralı ölçütleri, yapım aşamasında önce yazılacak testlerin kaynağıdır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- Gereksinimler: `inception/requirements-analysis/requirements.md` (FR1–FR21, NFR1–NFR15) ve inceleme notları R-01…R-07 (`inception/requirements-analysis/reviews/review-01.md`).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (yürüyen iskelet, test sırası).
- [Q1]–[Q8]: `user-stories-questions.md` (sahip ayrıntılı kararları bana bıraktı; özet onayı: Looks correct).

## Plan özeti

- **Kişiler:** 4 (P1–P4). [Q1]
- **Gruplama:** oyunun akışına göre (1 Oda ve lobi → 2 Rol havuzu ve kart → 3 Gece → 4 Sabah → 5 Gündüz ve oylama → 7 Oyun sonu), roller ve ortak konular ayrı gruplarda. [Q2]
- **Büyüklük:** orta; 13 grupta 48 hikâye, her birinde 3–4 kabul ölçütü. [Q3]
- **Öncelik:** tüm hikâyeler **Must Have** (v1 tek seferde yayınlanır). **[İskelet]** etiketli 16 hikâye, ilk yapılacak en basit tam oyunu (yalnızca Gulyabani ve Köylü) oluşturur; bu hikâyelerde iskelet yalnızca Gulyabani ve Köylü kurallarını kapsar, diğer roller sonraki parçalarda eklenir. Kesin parça sırası Teslimat Planlaması'nda belirlenir. [Q4]

## Hikâye haritası

| Grup | Hikâyeler | İskelet |
|---|---|---|
| 1 Oda ve lobi | US1.1–US1.5 | US1.1, US1.2, US1.4 |
| 2 Rol havuzu ve kart | US2.1–US2.2 | US2.2 |
| 3 Gece | US3.1–US3.3 | US3.1, US3.2, US3.3 |
| 4 Sabah | US4.1–US4.2 | US4.1, US4.2 |
| 5 Gündüz ve oylama | US5.1–US5.4 | US5.1, US5.2, US5.3, US5.4 |
| 6 Rol yetenekleri | US6.1–US6.7 | — |
| 7 Oyun sonu | US7.1–US7.3 | US7.1, US7.2 |
| 8 Mezarlık | US8.1–US8.2 | — |
| 9 Bağlantı | US9.1–US9.6 | US9.1 |
| 10 Sohbet güvenliği | US10.1–US10.3 | — |
| 11 Rehber ve kartlar | US11.1–US11.3 | — |
| 12 Kayıtlar ve rapor | US12.1–US12.3 | — |
| 13 Ortak nitelikler | US13.1–US13.5 | — |

## INVEST notları

- **Bağımsız:** Her hikâye kendi kabul ölçütleriyle tek başına sınanabilir. Oyun akışı hikâyeleri (gece, sabah, gündüz) birbirini izler ama her biri bir test ortamında doğrudan o faza getirilmiş bir oyunla sınanır (bot oyunculu test düzeneği). Rol hikâyeleri (grup 6) temel akış hikâyelerine dayanır; bu bağımlılık her hikâyede yazılıdır.
- **Küçük:** Büyük gereksinimler (oylama, bağlantı) birden çok hikâyeye bölündü.
- **Test edilebilir:** Her ölçütün açık bir geçti/kaldı sonucu vardır; sayısal sınırların (3/26 oyuncu, 5 dk, 2 yeniden oylama, 300 karakter) hem sınır değeri hem sınır dışı değeri yazıldı.

---

## 1 — Oda ve lobi

### US1.1 — Oda kurma [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR1.1, FR1.2 · **Bağımlılık:** —

Bir moderatör olarak tek tuşla bir oda kurup arkadaşlarıma link göndermek istiyorum, böylece kimse hesap açmadan aynı oyuna toplanabilsin.

- **AC1.1.1** **Diyelim ki** ana sayfadayım, **O zaman** kısa tanıtım metnini, KVKK gizlilik bilgilendirmesini, "Oda Kur" düğmesini, oda koduyla "Katıl" alanını ve Rehber bağlantısını görürüm.
- **AC1.1.2** **Diyelim ki** ana sayfadayım, **Eğer ki** "Oda Kur" deyip nick girersem, **O zaman** 6 haneli kodu ve paylaşılabilir linki olan bir odanın moderatör lobisine geçerim.
- **AC1.1.3** **Diyelim ki** başka bir odada "123456" kodu kullanımda, **Eğer ki** yeni oda kurulursa, **O zaman** yeni odaya "123456" verilmez.

### US1.2 — Odaya katılma [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR1.3, FR1.4, FR1.5 · **Bağımlılık:** US1.1

Bir oyuncu olarak linke tıklayıp yalnızca bir nick yazarak odaya girmek istiyorum, böylece toplantıdayken saniyeler içinde oyuna katılabileyim.

- **AC1.2.1** **Diyelim ki** linkle geldim, **Eğer ki** 2–16 karakterlik, odada olmayan bir nick yazarsam, **O zaman** lobiye girerim **Ve** giriş ekranında kısa KVKK bilgilendirmesini görmüş olurum.
- **AC1.2.2** **Diyelim ki** odada "Ali" var, **Eğer ki** "ali " yazarsam, **O zaman** "Bu nick kullanılıyor" uyarısı çıkar **Ve** yazdığım metin silinmez.
- **AC1.2.3** **Diyelim ki** 1 karakterlik ya da filtre listesindeki bir kelimeyi içeren bir nick yazdım, **O zaman** alanın altında nedeni yazar **Ve** giriş yapılmaz.
- **AC1.2.4** **Diyelim ki** oda kodu yok ya da odanın 24 saati doldu, **O zaman** "Bu oda bulunamadı ya da süresi doldu." yazar; oda doluysa "Bu oda dolu." yazar **Ve** her iki durumda ana sayfaya dönüş düğmesi görünür.

### US1.3 — Oyun sürerken gelen kişinin beklemesi

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR1.6, FR2.4 · **Bağımlılık:** US1.2, US7.2

Bir oyuncu olarak oyun başladıktan sonra gelirsem beklemek istiyorum, böylece süren oyunu bozmadan bir sonraki oyuna katılabileyim.

- **AC1.3.1** **Diyelim ki** odada oyun sürüyor, **Eğer ki** linkle gelip nick girersem, **O zaman** bekleme ekranını görürüm **Ve** tarayıcıma oyuncuların rolü, yaşam durumu ya da sohbeti hakkında hiçbir veri gelmez.
- **AC1.3.2** **Diyelim ki** bekleme ekranındayım, **Eğer ki** moderatör "Yeni oyun" derse, **O zaman** lobiye alınırım.
- **AC1.3.3** **Diyelim ki** odada bekleyenler dahil 26 oyuncu var, **Eğer ki** biri daha gelirse, **O zaman** "Bu oda dolu." mesajını görür.

### US1.4 — Lobi ve oyunu başlatma [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR2.1, FR2.2, FR2.3, FR2.4 · **Bağımlılık:** US1.2

Bir moderatör olarak lobide kimlerin geldiğini görüp yeterli oyuncu olunca oyunu başlatmak istiyorum, böylece oyunu doğru kalabalıkla açabileyim.

- **AC1.4.1** **Diyelim ki** lobide 2 oyuncu var, **O zaman** "Oyunu Başlat" pasiftir **Ve** altında "En az 3 oyuncu gerekli" yazar.
- **AC1.4.2** **Diyelim ki** lobide 4 oyuncu var, **O zaman** "Oyunu Başlat" etkindir **Ve** "En iyi deneyim için en az 6 oyuncu önerilir" uyarısı görünür; 6 oyuncuda uyarı görünmez.
- **AC1.4.3** **Diyelim ki** lobideyim, **Eğer ki** bir oyuncuyu onay sorusundan sonra çıkarırsam, **O zaman** o kişi "Moderatör seni odadan çıkardı." mesajını görür **Ve** listeden düşer.
- **AC1.4.4** **Diyelim ki** lobideyim, **Eğer ki** moderatörlüğü onay sorusundan sonra Ayşe'ye devredersem, **O zaman** moderatör ekranı Ayşe'ye geçer **Ve** ben oyuncu olurum; oyun başladıktan sonra devir seçeneği görünmez.

### US1.5 — Oyun ayarları

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR2.6, FR2.7, FR2.8 · **Bağımlılık:** US1.4

Bir moderatör olarak süreleri ve kural seçeneklerini lobide ayarlamak istiyorum, böylece oyunu grubumun hızına ve zevkine göre oynatabileyim.

- **AC1.5.1** **Diyelim ki** Ayarlar sekmesindeyim, **O zaman** her ayar varsayılanıyla gelir (ör. gündüz 4 dk, son söz 30 sn, eşitlikte yeniden oylama, oylar canlı, hayalet modu açık).
- **AC1.5.2** **Diyelim ki** gündüz süresine 20 dk yazdım, **O zaman** değer kabul edilmez **Ve** izinli aralık (1–15 dk) gösterilir; 15 dk kabul edilir.
- **AC1.5.3** **Diyelim ki** eşitlik kuralı "Köyün en genci" seçili, **O zaman** bir oyuncuyu "Köyün en genci" olarak işaretleyebilirim; kural "Yeniden oylama"ya dönünce işaret görünmez.
- **AC1.5.4** **Diyelim ki** son odamda ayarları ve rol havuzunu değiştirmiştim, **Eğer ki** aynı tarayıcıdan yeni oda kurarsam, **O zaman** aynı ayarlar ve havuz varsayılan olarak gelir.

---

## 2 — Rol havuzu ve kart

### US2.1 — Rol havuzunu seçme

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR3.1–FR3.6 · **Bağımlılık:** US1.4

Bir moderatör olarak oyunda hangi rollerin olacağını seçmek istiyorum, böylece yeni başlayanlarla basit, deneyimli grupla dolu bir köy oynatabileyim.

- **AC2.1.1** **Diyelim ki** Rol Havuzu panelindeyim, **O zaman** 9 rol küçük kart resmi, kısa açıklama ve aç/kapa anahtarıyla listelenir **Ve** Gulyabani ile Köylü anahtarları kapatılamaz.
- **AC2.1.2** **Diyelim ki** 9 oyuncu var, **Eğer ki** "Klasik" ön ayarını seçersem, **O zaman** Bekçi ve 2 Ahbap açılır **Ve** önerilen gulyabani sayısı 2 gösterilir.
- **AC2.1.3** **Diyelim ki** 5 oyuncu ve 6 rol seçili, **O zaman** "Oyunu Başlat" pasiftir **Ve** "6 rol var, 5 oyuncu" yazar; gulyabani sayısı önerilenden fazlaysa yalnızca "dengesiz" uyarısı çıkar, başlatma engellenmez.
- **AC2.1.4** **Diyelim ki** gulyabani adet seçicisi 1'de, **Eğer ki** azaltmaya çalışırsam, **O zaman** değer 1'in altına inmez. (inceleme notu R-06)
- **AC2.1.5** **Diyelim ki** oyun başladı, **O zaman** rol havuzu paneli değiştirilemez.

### US2.2 — Rol dağıtımı ve kartıma bakma [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR4.1, FR4.2, FR4.3 · **Bağımlılık:** US1.4

Bir oyuncu olarak rolümü yalnızca benim görebileceğim bir kartta görmek istiyorum, böylece toplantıda kimse ekranıma bakmadan rolümü öğrenebileyim.

- **AC2.2.1** **Diyelim ki** oyun başladı, **O zaman** kartım kapalı gelir; dokununca açılır, tekrar dokununca kapanır.
- **AC2.2.2** **Diyelim ki** oyun başladı, **Eğer ki** bir köylünün tarayıcısına giden tüm mesajlar incelenirse, **O zaman** hiçbirinde başka bir oyuncunun rolü bulunmaz.
- **AC2.2.3** **Diyelim ki** "Gördüm" dedim, **O zaman** moderatör ekranında yanımda "Gördüm" işareti çıkar; moderatör tüm rol eşleşmesini görür **Ve** herkes basmadan da "Sonraki Adım" ile ilerleyebilir. (inceleme notu R-05)
- **AC2.2.4** **Diyelim ki** aynı rol havuzuyla 1.000 dağıtım yapıldı, **O zaman** her rol her oyuncu sırasına istatistiksel olarak eşit dağılır (otomatik testte ki-kare sınaması geçer).

---

## 3 — Gece

### US3.1 — Gece adımlarını yönetme [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR5.1, FR5.2, FR5.3, FR5.4, FR5.7, FR13.4 · **Bağımlılık:** US2.2

Bir moderatör olarak gece hangi adımda olduğumu, ne okuyacağımı ve kimin ne yaptığını görmek istiyorum, böylece geceyi kâğıda bakmadan, hatasız yönetebileyim.

- **AC3.1.1** **Diyelim ki** ilk gece başladı, **O zaman** yalnızca açık rollerin adımları tarifteki sırayla gelir; her adımda okunacak anons metnini, beklenen işlemi, durumunu (bekleniyor / yapıldı / süre doldu / oyuncu kopuk), kalan süreyi ve "Sonraki Adım"ı görürüm.
- **AC3.1.2** **Diyelim ki** ilk gece anonsu gösteriliyor, **O zaman** metin, gece sırasının yalnızca ekranda görüneceğini (titreşim ve ses olmadığını) hatırlatan bir cümle içerir.
- **AC3.1.3** **Diyelim ki** Görücü kapalı, **O zaman** Görücü ve sevdalı adımları hiç görünmez; Bekçi açık ama ölüyse adımın anonsu gösterilir **Ve** 8–15 saniye sonra adım kendiliğinden geçer.
- **AC3.1.4** **Diyelim ki** bir gece seçimi süresi içinde yapılmadı, **O zaman** panel "Süre doldu" der **Ve** seçim boş geçer.

### US3.2 — Gece Uyku ekranı ve sıranın gelmesi [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR5.5, FR5.6 · **Bağımlılık:** US3.1

Bir oyuncu olarak gece sıram gelmediğinde herkesle aynı ekranı görmek istiyorum, böylece ekranıma bakan biri rolümü tahmin edemesin.

- **AC3.2.1** **Diyelim ki** gece ve sıra bende değil, **O zaman** herkesle birebir aynı Uyku ekranını görürüm.
- **AC3.2.2** **Diyelim ki** gece sıra bana geldi, **O zaman** ekranım eylem paneline döner **Ve** cihazımda titreşim, ses ya da ekran okuyucu duyurusu tetiklenmez.
- **AC3.2.3** **Diyelim ki** bir hedef seçiyorum, **O zaman** listede yalnızca yaşayan oyuncular vardır **Ve** moderatör listede yoktur.

### US3.3 — Gulyabanilerin ortak kurban kararı [İskelet]

**Kişi:** P2 Oyuncu (gulyabani) · **Öncelik:** Must Have · **Kaynak:** FR6.1–FR6.5 · **Bağımlılık:** US3.2

Bir gulyabani olarak diğer gulyabanilerle gizlice konuşup birlikte bir kurban seçmek istiyorum, böylece köylülere fark ettirmeden ortak karar verebilelim.

- **AC3.3.1** **Diyelim ki** gulyabani adımı başladı, **O zaman** yalnızca yaşayan gulyabanilerin ekranında hedef listesi (gulyabaniler hariç) ve gulyabani sohbeti açılır **Ve** kimin kimi işaretlediğini canlı görürüz; moderatör sohbeti salt okunur görür.
- **AC3.3.2** **Diyelim ki** iki gulyabani farklı hedef işaretledi, **O zaman** "Kararı Onayla" pasif kalır; aynı hedefte birleşince etkinleşir **Ve** onaylanınca karar kilitlenip moderatöre iletilir.
- **AC3.3.3** **Diyelim ki** 3 gulyabaniden ikisi Ali'yi, biri Can'ı işaretledi, **Eğer ki** süre dolarsa, **O zaman** Ali kaçırılır.
- **AC3.3.4** **Diyelim ki** 2 gulyabani farklı hedefte ve eşitlik ayarı "kimse kaçırılmaz", **Eğer ki** süre dolarsa, **O zaman** o gece kimse kaçırılmaz; hiç işaret yoksa da kimse kaçırılmaz.

---

## 4 — Sabah

### US4.1 — Sabah kara haberi [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR7.1, FR7.3 · **Bağımlılık:** US3.3

Bir moderatör olarak sabah gecenin sonucunu hazır bir anons metniyle görmek istiyorum, böylece haberi doğru ve heyecanlı okuyabileyim.

- **AC4.1.1** **Diyelim ki** gece Ali kaçırıldı, **O zaman** "Dün gece köyde kara bir olay oldu: Ali kaçırıldı" anonsunu görürüm **Ve** "Sonucu Açıkla" deyince Ali'nin kartı herkesin ekranında açılır.
- **AC4.1.2** **Diyelim ki** gece kimse kaçırılmadı, **O zaman** "Dün gece kimse kaçırılmadı" anonsunu görürüm **Ve** hiçbir kart açılmaz.
- **AC4.1.3** **Diyelim ki** sonuç açıklandı ve kazanan yok, **O zaman** tema gündüze döner **Ve** meydan toplantısı başlar.

### US4.2 — Ölüm sonrası etkilerin sırayla işlemesi [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR7.2 · **Bağımlılık:** US4.1

Bir moderatör olarak bir ölümün tetiklediği etkilerin kendiliğinden ve doğru sırayla işlemesini istiyorum, böylece karmaşık zincirlerde kural hatası yapmayayım.

- **AC4.2.1** **Diyelim ki** bir ölüm oldu, **O zaman** etkiler şu sırayla işlenir: Celalli Damat'ın seçimi → sevdalı ölümü → Dertli kontrolü → kazanma kontrolü. (İskelette yalnızca kazanma kontrolü vardır.)
- **AC4.2.2** **Diyelim ki** sevdalılardan biri gece kaçırıldı, **Eğer ki** "Sonucu Açıkla" dersem, **O zaman** diğer sevdalı da aynı sabah ölür **Ve** iki kart da açılır.
- **AC4.2.3** **Diyelim ki** bir etki yeni bir ölüm doğurdu, **O zaman** zincir o ölüm için de işler **Ve** kazanma kontrolü yalnızca zincirin sonunda bir kez yapılır.

---

## 5 — Gündüz ve oylama

### US5.1 — Meydan toplantısı ve gündüz sohbeti [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR8.1, FR8.2 · **Bağımlılık:** US4.1

Bir oyuncu olarak gündüz kalan süreyi görüp sohbette tartışmak istiyorum, böylece kime şüphelendiğimi anlatabileyim.

- **AC5.1.1** **Diyelim ki** gündüz başladı, **O zaman** herkesin ekranında aynı geri sayım (varsayılan 4 dk) görünür.
- **AC5.1.2** **Diyelim ki** gündüz süresi doldu, **O zaman** oylama kendiliğinden başlamaz **Ve** moderatöre "Oylamaya geç" hatırlatması görünür.
- **AC5.1.3** **Diyelim ki** moderatör süreyi 2 dakika uzattı ya da duraklattı, **O zaman** tüm oyuncuların geri sayımı aynı anda değişir.
- **AC5.1.4** **Diyelim ki** ben ölüyüm, **Eğer ki** gündüz sohbetine yazmaya çalışırsam, **O zaman** mesajım gönderilmez; okumaya devam ederim.

### US5.2 — Oy verme ve eşitlik [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR9.1, FR9.2 · **Bağımlılık:** US5.1

Bir oyuncu olarak şüphelendiğim kişiye oy vermek istiyorum, böylece köy olarak bir gulyabaniyi bulmaya çalışalım.

- **AC5.2.1** **Diyelim ki** oylama açık, **O zaman** yaşayan başka bir oyuncuya oy verebilirim, kendime veremem **Ve** oylar ayar açıksa canlı görünür.
- **AC5.2.2** **Diyelim ki** hiç oy verilmedi, **O zaman** sanık çıkmaz **Ve** o gün infaz yapılmaz; süresinde oy vermeyenin oyu sayılmaz.
- **AC5.2.3** **Diyelim ki** eşitlik kuralı "Yeniden oylama" ve Ali ile Can 3'er oy aldı, **Eğer ki** yeniden oylamada yine 3–3 olursa, **O zaman** o gün infaz yapılmaz.
- **AC5.2.4** **Diyelim ki** kural "Köyün en genci" ve işaretli oyuncu Ali'ye oy verdi, **Eğer ki** Ali ile Can eşit kalırsa, **O zaman** o oy 2 sayılır **Ve** Ali sanık olur.

### US5.3 — Son söz, onay oylaması ve infaz [İskelet]

**Kişi:** P2 Oyuncu (sanık) · **Öncelik:** Must Have · **Kaynak:** FR9.3, FR9.4, FR9.5 · **Bağımlılık:** US5.2

Bir sanık olarak infazdan önce kendimi savunmak istiyorum, böylece köyü fikrini değiştirmeye ikna edebileyim.

- **AC5.3.1** **Diyelim ki** son söz süresi sürüyor, **Eğer ki** sanık dışındaki bir oyuncu yazmaya çalışırsa, **O zaman** mesajı gönderilmez; moderatörün mesajı gönderilir. [Q7]
- **AC5.3.2** **Diyelim ki** onay oylamasında sanık hâlâ tek başına en çok oya sahip, **O zaman** infaz edilir, kartı herkese açılır **Ve** mezarlığa geçer.
- **AC5.3.3** **Diyelim ki** onay oylamasında çoğunluk bozuldu, **O zaman** yeni sanıkla son söz başlar.
- **AC5.3.4** **Diyelim ki** o gün bir eşitlik yeniden oylaması ve bir çoğunluk bozulması oldu (2 yeniden oylama), **Eğer ki** çoğunluk yine bozulursa, **O zaman** o gün infaz yapılmaz. [Q8]

### US5.4 — Moderatör ekranı (gündüz ve genel görünüm) [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR9.6, FR13.1, FR13.2 · **Bağımlılık:** US5.1

Bir moderatör olarak oyunun tüm durumunu tek ekranda görmek istiyorum, böylece her an ne olduğunu bilip oyunu yönetebileyim.

- **AC5.4.1** **Diyelim ki** gündüz oylaması sürüyor, **O zaman** kimin oy verip vermediğini, oy dağılımını, sanığı ve "Oylamaya geç", son söz, onay oylaması, infaz adımlarını görürüm.
- **AC5.4.2** **Diyelim ki** oyun sürüyor, **O zaman** tüm oyuncuları rolleri, yaşam durumları, rozetleri ve "kopuk" durumlarıyla, gece olay günlüğünü ve süre uzat/duraklat düğmelerini görürüm.
- **AC5.4.3** **Diyelim ki** telefondayım, **O zaman** ekran Akış / Oyuncular / Günlük / Sohbet sekmelerine ayrılır; bilgisayarda aynı bilgiler yan yana sütunlarda görünür.

---

## 6 — Rol yetenekleri

Bu gruptaki hikâyeler temel akışa (US3.1–US5.4) dayanır; her rol yalnızca rol havuzunda açıksa oyunda bulunur (US2.1).

### US6.1 — Boşboğaz Gulyabani'nin gizli kelimesi

**Kişi:** P2 Oyuncu (Boşboğaz) · **Öncelik:** Must Have · **Kaynak:** FR10.1 · **Bağımlılık:** US3.3, US5.1

Bir Boşboğaz Gulyabani olarak her gündüz gizli kelimeyi fark ettirmeden söylemek istiyorum, böylece hem hayatta kalayım hem de köylüleri yanıltayım.

- **AC6.1.1** **Diyelim ki** "her gün yeni kelime" kapalı, **O zaman** gizli kelime "gulyabani"dir **Ve** yalnızca bana ve moderatöre gösterilir; açıksa her sabah listeden yeni bir kelime gelir.
- **AC6.1.2** **Diyelim ki** kelimeyi gündüz sohbetine ayrı bir sözcük olarak (büyük/küçük harf farkı gözetilmeden) yazdım, **O zaman** moderatör ekranındaki onay kutusu kendiliğinden işaretlenir; sesli söylediysem moderatör elle işaretler.
- **AC6.1.3** **Diyelim ki** gündüz kutu boş kaldı, **Eğer ki** standart gece başlarsa, **O zaman** ölürüm, ölümüm o sabah açıklanır **Ve** o gecenin sonraki adımlarında yer almam.

### US6.2 — Bekçi'nin yoklaması

**Kişi:** P2 Oyuncu (Bekçi) · **Öncelik:** Must Have · **Kaynak:** FR10.2 · **Bağımlılık:** US3.2

Bir Bekçi olarak her gece bir evi yoklayıp oradakinin gulyabani olup olmadığını öğrenmek istiyorum, böylece köye doğru yolu gösterebileyim.

- **AC6.2.1** **Diyelim ki** Bekçi adımındayım, **O zaman** kendim dışında yaşayan oyuncuları seçebilirim.
- **AC6.2.2** **Diyelim ki** Boşboğaz'ı yokladım, **O zaman** sonuç "gulyabani" olur.
- **AC6.2.3** **Diyelim ki** bir sonuç aldım, **O zaman** sonuç yalnızca bana ve moderatöre ulaşır; başka hiçbir tarayıcıya gönderilmez.

### US6.3 — Ürkek'in pencereden bakması

**Kişi:** P2 Oyuncu (Ürkek) · **Öncelik:** Must Have · **Kaynak:** FR10.3 · **Bağımlılık:** US3.3

Bir Ürkek olarak riski göze alıp gulyabanileri gizlice görmek istiyorum, böylece köye bilgi taşıyabileyim.

- **AC6.3.1** **Diyelim ki** 1. gecedeyiz, **O zaman** "pencereden bak" seçeneğini görmem; 2. gecede görürüm.
- **AC6.3.2** **Diyelim ki** pencereden baktım, **O zaman** o gece yaşayan gulyabanilerin kim olduğunu görürüm.
- **AC6.3.3** **Diyelim ki** baktım ve fark edilme olasılığı tuttu (varsayılan %50), **O zaman** gulyabanilerin ekranına "Pencerede bir gölge var" uyarısı düşer; ayar açık değilse uyarıda adım yazmaz.

### US6.4 — Ahbapların birbirini tanıması

**Kişi:** P2 Oyuncu (Ahbap) · **Öncelik:** Must Have · **Kaynak:** FR10.4 · **Bağımlılık:** US3.1

Bir Ahbap olarak diğer Ahbap'ı tanımak istiyorum, böylece köyde güvenebileceğim bir kişi olsun.

- **AC6.4.1** **Diyelim ki** Ahbaplar açık, **Eğer ki** ilk gece ahbap adımı gelirse, **O zaman** iki ahbap birbirini görür **Ve** ikisinin de köylü olduğunu bilir.
- **AC6.4.2** **Diyelim ki** ahbabım belli oldu, **O zaman** onun isminin yanında yalnızca benim ekranımda "Ahbap" rozeti görünür.
- **AC6.4.3** **Diyelim ki** bir köylünün tarayıcısına giden mesajlar incelendi, **O zaman** ahbap rozetleri bulunmaz.

### US6.5 — Celalli Damat'ın yanında götürmesi

**Kişi:** P2 Oyuncu (Celalli Damat) · **Öncelik:** Must Have · **Kaynak:** FR10.5 · **Bağımlılık:** US4.2

Bir Celalli Damat olarak öldüğümde birini yanımda götürmek istiyorum, böylece ölümüm köyün işine yarasın.

- **AC6.5.1** **Diyelim ki** gece kaçırıldım ya da gündüz infaz edildim, **O zaman** süre içinde (varsayılan 30 sn) yaşayan bir kişiyi seçebilirim **Ve** seçtiğim kişi hangi taraftan olursa olsun ölür.
- **AC6.5.2** **Diyelim ki** infaz edildim ve sevdalılardan birini seçtim, **O zaman** seçilen kişi ölür **Ve** onun sevdalısı da ölür.
- **AC6.5.3** **Diyelim ki** süre doldu ya da oyundan çıkarıldım veya sevdalı ölümüyle öldüm, **O zaman** kimseyi götürmem.

### US6.6 — Dertli'nin ölerek kazanması

**Kişi:** P2 Oyuncu (Dertli) · **Öncelik:** Must Have · **Kaynak:** FR10.6 · **Bağımlılık:** US4.2

Bir Dertli olarak dert süresi içinde öldürülmek istiyorum, böylece oyunu tek başıma kazanayım.

- **AC6.6.1** **Diyelim ki** 2. gündüzün sonuna kadar infaz edildim, **O zaman** herkesin ekranında "Dertli kazandı" görünür **Ve** oyun biter.
- **AC6.6.2** **Diyelim ki** dert süresi geçti, **O zaman** normal Köylü gibi devam ederim; sonra ölmem kazandırmaz.
- **AC6.6.3** **Diyelim ki** süre içinde sevdalı ölümüyle ya da oyundan çıkarılarak öldüm, **O zaman** kazanmam; moderatör Dertli süre göstergesini her zaman görür.

### US6.7 — Görücü ve sevdalılar

**Kişi:** P2 Oyuncu (Görücü / sevdalı) · **Öncelik:** Must Have · **Kaynak:** FR10.7, FR10.8 · **Bağımlılık:** US3.1, US4.2

Bir Görücü olarak ilk gece iki kişiyi birbirine sevdalı etmek istiyorum, böylece oyuna beklenmedik bir ortaklık katayım.

- **AC6.7.1** **Diyelim ki** ilk gece Görücü adımındayım, **O zaman** iki farklı oyuncu seçerim (kendim dahil olabilirim); süre dolarsa sevdalı çift oluşmaz.
- **AC6.7.2** **Diyelim ki** sevdalı oldum, **O zaman** sevdalımı tanırım ama rolünü görmem **Ve** isminin yanında yalnızca benim ekranımda "Sevdalı" rozeti görünür.
- **AC6.7.3** **Diyelim ki** sevdalımdan biri öldü, **O zaman** ben de hemen ölürüm **Ve** kartım açılır.
- **AC6.7.4** **Diyelim ki** çiftin biri Gulyabaniler tarafında, diğeri değil, **O zaman** ikimizin amacı köyde sağ kalan son iki kişi olmaktır.

---

## 7 — Oyun sonu

### US7.1 — Kazananın belirlenmesi [İskelet]

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR11.1 · **Bağımlılık:** US4.2

Bir moderatör olarak oyunun kim kazandığında kendiliğinden bitmesini istiyorum, böylece karmaşık durumlarda yanlış karar vermeyeyim.

- **AC7.1.1** **Diyelim ki** son gulyabani infaz edildi, **O zaman** "Köylüler kazandı" ekranı herkeste görünür.
- **AC7.1.2** **Diyelim ki** erken bitiş açık, 2 gulyabani ve 2 köylü yaşıyor, **O zaman** Gulyabaniler kazanır.
- **AC7.1.3** **Diyelim ki** karışık bir sevdalı çift sağ kalan son iki kişi, **O zaman** ikisi kazanır **Ve** Gulyabaniler kazanmaz; oyun kimin zaferiyle biterse bitsin iki sevdalı da hayattaysa kazananlar arasında gösterilir.
- **AC7.1.4** **Diyelim ki** bir ölüm zincirinin sonunda kimse yaşamıyor, **O zaman** tüm gulyabaniler öldüğü için Köylüler kazanır (Dertli ve karışık sevdalı kuralları önce denenir). [Q5] (inceleme notu R-01)

### US7.2 — Oyun sonu ekranı ve yeni oyun [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR11.2, FR17.1, FR17.2 · **Bağımlılık:** US7.1

Bir oyuncu olarak oyun bitince herkesin rolünü ve gecelerde ne olduğunu görmek istiyorum, böylece oyunu arkadaşlarımla konuşup hemen bir tane daha oynayalım.

- **AC7.2.1** **Diyelim ki** oyun bitti, **O zaman** herkesin ekranında kazanan taraf, varsa sevdalılar, herkesin rolü, ahbaplar ve gece olay günlüğü açılır.
- **AC7.2.2** **Diyelim ki** oyun bitti ve bir kişi bekleme ekranında, **Eğer ki** moderatör "Yeni oyun" derse, **O zaman** herkes ve bekleyen kişi aynı odanın lobisine geçer **Ve** son ayarlar korunur.
- **AC7.2.3** **Diyelim ki** oda kurulalı 22 saatten fazla oldu, **O zaman** "Oyunu Başlat" pasiftir **Ve** "Oda süresi dolmak üzere, yeni oda kur" yazar.

### US7.3 — Oyun sonu geri bildirimi

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR17.3, FR17.4 · **Bağımlılık:** US7.2

Bir oyuncu olarak oyunun nasıl geçtiğini birkaç dokunuşla söylemek istiyorum, böylece oyun benim gibi oyuncular için iyileşsin.

- **AC7.3.1** **Diyelim ki** oyun bitti, **O zaman** "Oyun nasıldı?" sorusu kötü / orta / iyi yüzleriyle ve isteğe bağlı açıklama alanıyla (en fazla 1.000 karakter) çıkar; gönderince "Teşekkürler!" görünür.
- **AC7.3.2** **Diyelim ki** geri bildirim ağ hatası yüzünden gönderilemedi, **O zaman** seçtiğim yüz ve yazdığım metin silinmez **Ve** "Tekrar dene" görünür.
- **AC7.3.3** **Diyelim ki** "Öneri/Şikayet yaz"a 1.001 karakter yazdım, **O zaman** gönderilmez **Ve** sınır gösterilir; 1.000 karakter gönderilir.

---

## 8 — Mezarlık

### US8.1 — Mezarlıktan izleme ve Mezarlık Sohbeti

**Kişi:** P3 Ölü oyuncu · **Öncelik:** Must Have · **Kaynak:** FR12.1, FR12.2, FR12.4 · **Bağımlılık:** US4.1, US5.3

Bir ölü oyuncu olarak elendikten sonra oyunu izleyip diğer ölülerle konuşmak istiyorum, böylece oyunun dışında kalıp sıkılmayayım.

- **AC8.1.1** **Diyelim ki** öldüm, **O zaman** kendiliğinden mezarlığa geçerim; fazları, oylamaları, açılan kartları canlı izlerim **Ve** yaşayanların sohbetini okurum ama yazamam.
- **AC8.1.2** **Diyelim ki** Mezarlık Sohbeti'ne yazdım, **O zaman** mesajımı ölüler ve moderatör görür **Ve** yaşayanların tarayıcısına bu kanaldan hiçbir mesaj gitmez.
- **AC8.1.3** **Diyelim ki** öldüm, **O zaman** oyuncu listesinde gri/pasif görünürüm **Ve** ismimin altında açılmış rolüm yazar.

### US8.2 — Hayalet modu

**Kişi:** P3 Ölü oyuncu · **Öncelik:** Must Have · **Kaynak:** FR12.3 · **Bağımlılık:** US8.1

Bir ölü oyuncu olarak, ayar açıksa herkesin rolünü ve gecelerde olanları görmek istiyorum, böylece oyunu bir izleyici gibi bütünüyle takip edebileyim.

- **AC8.2.1** **Diyelim ki** hayalet modu açık, **O zaman** tüm rolleri ve gece olay günlüğünü görürüm; gulyabani sohbetini görmem.
- **AC8.2.2** **Diyelim ki** hayalet modu kapalı, **O zaman** tarayıcıma yaşayan oyuncuların açılmamış rolleri gönderilmez.
- **AC8.2.3** **Diyelim ki** hayalet modu açık ve ben ölüyüm, **Eğer ki** Mezarlık Sohbeti'ne bir rol yazarsam, **O zaman** yaşayanlar bunu göremez.

---

## 9 — Bağlantı

### US9.1 — Sayfa yenilenince ya da bağlantı kopunca oyuna dönme [İskelet]

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR14.1, FR14.2, FR17.5, NFR4 · **Bağımlılık:** US1.2

Bir oyuncu olarak telefonda başka uygulamaya geçip döndüğümde kaldığım yerden devam etmek istiyorum, böylece toplantı uygulamasıyla oyun arasında rahatça geçebileyim.

- **AC9.1.1** **Diyelim ki** oyun sırasında sayfayı yeniledim ya da kapatıp aynı linkle açtım, **O zaman** aynı rol, aynı ekran ve aynı durumla dönerim.
- **AC9.1.2** **Diyelim ki** bağlantım koptu, **O zaman** "Yeniden bağlanılıyor" şeridi çıkar; ağ gelince en fazla 5 saniyede "Tekrar oyundasın" görünür; 60 saniyede bağlanamazsa "Bağlanamadık. İnternetini kontrol edip sayfayı yenile." yazar.
- **AC9.1.3** **Diyelim ki** şeritte "Sorun bildir"e bastım ve kısa bir açıklama yazdım, **O zaman** kopma bildirimi kayda düşer.
- **AC9.1.4** **Diyelim ki** Android Chrome ve iPhone Safari'de başka uygulamaya geçip dönme, ekran kilidi sonrası dönme ve mobil veri denendi, **O zaman** her durumda oyuncu aynı ekrana döner (gerçek telefonda elle deneme).

### US9.2 — Kopan oyuncunun sırası

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR14.3, FR14.4 · **Bağımlılık:** US9.1

Bir moderatör olarak kopan bir oyuncu yüzünden oyunun kilitlenmemesini istiyorum, böylece oyun bir kişinin bağlantısı yüzünden durmasın.

- **AC9.2.1** **Diyelim ki** Ali koptu, **O zaman** ekranımda Ali'nin yanında "kopuk" yazar; dönünce kalkar.
- **AC9.2.2** **Diyelim ki** Ali oylama sırasında koptu, **O zaman** o adımın süresi en fazla 5 dakikaya uzar; Ali dönerse kaldığı yerden oy verir.
- **AC9.2.3** **Diyelim ki** Ali 5 dakika içinde dönmedi, **O zaman** oylama Ali'nin oyu olmadan biter; oylar Ali'de toplanırsa Ali infaz edilir.
- **AC9.2.4** **Diyelim ki** sonraki faz başladı ve Ali hâlâ kopuk, **O zaman** ekranımda "Ali hâlâ kopuk, oyundan çıkarılsın mı?" uyarısı çıkar **Ve** karar benimdir.

### US9.3 — Moderatörün bağlantısı koptuğunda

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR14.5 · **Bağımlılık:** US9.1

Bir oyuncu olarak moderatör koptuğunda oyunun beklemesini istiyorum, böylece moderatörsüz oyun ilerleyip bozulmasın.

- **AC9.3.1** **Diyelim ki** moderatörün bağlantısı koptu, **O zaman** tüm sayaçlar durur **Ve** ekranımda "Moderatör bekleniyor" yazar.
- **AC9.3.2** **Diyelim ki** moderatör aynı linkle döndü, **O zaman** sayaçlar kalan süreden devam eder.
- **AC9.3.3** **Diyelim ki** moderatör dönmedi, **O zaman** oda 24 saatlik süresi dolup silinene kadar bekler.

### US9.4 — Sunucu yeniden başladığında oyunun sürmesi

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR14.6, NFR5 · **Bağımlılık:** US9.1

Bir oyuncu olarak sunucu güncellense ya da arıza verse bile oyunun kaybolmamasını istiyorum, böylece yarım saatlik oyun boşa gitmesin.

- **AC9.4.1** **Diyelim ki** gündüz oylaması sırasında sunucu yeniden başladı, **Eğer ki** aynı linkle dönersem, **O zaman** önceden verilmiş oylar korunur **Ve** oylama kalan süreyle sürer.
- **AC9.4.2** **Diyelim ki** sunucu yeniden başladı, **O zaman** en fazla 1 dakika içinde oyunlar oyuncuların dönmesine hazırdır.
- **AC9.4.3** **Diyelim ki** bir işlem (oy, seçim, faz geçişi) kabul edildi, **O zaman** yeniden başlatmadan sonra kaybolmamıştır.

### US9.5 — Oyunu ikinci bir sekmede açma

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR14.7 · **Bağımlılık:** US9.1

Bir oyuncu olarak oyunu telefondan bilgisayara geçirebilmek istiyorum, böylece hangi cihaz rahatsa ondan oynayabileyim.

- **AC9.5.1** **Diyelim ki** oyunu bir sekmede açtım, **Eğer ki** aynı tarayıcıda ikinci sekmede açarsam, **O zaman** oyun yeni sekmeye geçer **Ve** eski sekmede "Oyun başka bir pencerede açıldı" yazar.
- **AC9.5.2** **Diyelim ki** eski sekmeden oy vermeye çalıştım, **O zaman** işlem kabul edilmez.
- **AC9.5.3** **Diyelim ki** yeni sekmeye geçtim, **O zaman** rolüm ve durumum aynıdır.

### US9.6 — Oturumu kaybolan oyuncunun moderatör onayıyla dönmesi

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR14.1, [Q6] (inceleme notu R-02) · **Bağımlılık:** US9.2

Bir oyuncu olarak WhatsApp'ın içinden açtığım oyunu başka tarayıcıda açmak zorunda kalırsam yine de oyuna dönmek istiyorum, böylece tarayıcı değiştirdim diye oyundan düşmeyeyim.

- **AC9.6.1** **Diyelim ki** oyundaki nick'im "Ali" ve oturum bilgim kayboldu, **Eğer ki** aynı oda koduyla "Ali" nick'ini girersem, **O zaman** "Moderatör onayı bekleniyor" ekranını görürüm **Ve** moderatöre "Ali yeniden katılmak istiyor" onayı çıkar.
- **AC9.6.2** **Diyelim ki** moderatör onayladı, **O zaman** aynı rol ve durumla dönerim **Ve** eski oturum geçersiz olur.
- **AC9.6.3** **Diyelim ki** moderatör reddetti ya da Ali oyundan çıkarılmıştı, **O zaman** oyuna giremem **Ve** onaydan önce tarayıcıma hiçbir oyun bilgisi gelmez.

---

## 10 — Sohbet güvenliği

### US10.1 — Sohbet kanalları ve kelime filtresi

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR16.1, FR16.2, FR16.3, FR13.3 · **Bağımlılık:** US5.1

Bir oyuncu olarak sohbette küfür ve hakaret görmek istemiyorum, böylece oyun arkadaşça kalsın.

- **AC10.1.1** **Diyelim ki** filtre listesinde "kelime" var, **Eğer ki** bir oyuncu "Bu bir KELİME testi" yazarsa, **O zaman** herkes "Bu bir K****E testi" görür.
- **AC10.1.2** **Diyelim ki** 301 karakterlik ya da boş bir mesaj yazdım, **O zaman** gönderilmez; mesajdaki biçimlendirme ve kod işaretleri düz metin olarak görünür.
- **AC10.1.3** **Diyelim ki** gece oldu, **Eğer ki** yaşayan bir köylü gündüz sohbetine yazmaya çalışırsa, **O zaman** mesajı gönderilmez.
- **AC10.1.4** **Diyelim ki** moderatörüm, **O zaman** gündüz sohbetine yazabilirim; gulyabani sohbetini ve Mezarlık Sohbeti'ni yalnızca okurum **Ve** şikayet edilen mesajlar Sohbet sekmemde işaretli görünür.

### US10.2 — Mesaj şikayeti

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR16.4, FR16.5 · **Bağımlılık:** US10.1

Bir oyuncu olarak rahatsız edici bir mesajı şikayet etmek istiyorum, böylece moderatör ve oyunun sahibi durumdan haberdar olsun.

- **AC10.2.1** **Diyelim ki** bir mesaja uzun bastım (ya da klavyede mesajın menü düğmesini kullandım), **Eğer ki** "Şikayet et" deyip isteğe bağlı not yazarsam, **O zaman** "Şikayetin alındı" görünür **Ve** şikayet moderatörün Sohbet sekmesinde görünür.
- **AC10.2.2** **Diyelim ki** kendi mesajıma bakıyorum, **O zaman** "Şikayet et" seçeneği yoktur; aynı mesajı ikinci kez şikayet etmem yeni kayıt oluşturmaz.
- **AC10.2.3** **Diyelim ki** Can, Ali'nin mesajını not yazarak şikayet etti, **O zaman** kayıtta mesaj metni, yazan, oda, sohbet kanalı, zamanlar ve not bulunur **Ve** 1 ay sonra metin ile not silinir, diğer alanlar 1 yıl kalır.
- **AC10.2.4** **Diyelim ki** ana sayfadaki ya da girişteki KVKK bilgilendirmesine baktım, **O zaman** şikayet edilen mesaj metninin 1 ay saklandığını söyler. (inceleme notu R-07)

### US10.3 — Oyun sırasında oyuncu çıkarma

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR15.1, FR15.2, FR15.3 · **Bağımlılık:** US4.2

Bir moderatör olarak kötü davranan bir oyuncuyu oyun sırasında da çıkarabilmek istiyorum, böylece diğerlerinin oyunu bozulmasın.

- **AC10.3.1** **Diyelim ki** oyun sürüyor, **Eğer ki** onay sorusundan sonra bir sevdalıyı çıkarırsam, **O zaman** çıkarılanın kartı herkese açılır, diğer sevdalı da ölür **Ve** kazanma kontrolü yapılır.
- **AC10.3.2** **Diyelim ki** çıkarılan oyuncu Celalli Damat ya da Dertli, **O zaman** onun yeteneği tetiklenmez.
- **AC10.3.3** **Diyelim ki** çıkarılan kişi aynı tarayıcıdan linki tekrar açtı, **O zaman** odaya giremez **Ve** "Moderatör seni odadan çıkardı." mesajını görür.

---

## 11 — Rehber ve kartlar

### US11.1 — Rehber'de kartları inceleme

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR18.1, FR18.2, FR18.5, FR18.6 · **Bağımlılık:** —

Bir oyuncu olarak oyun sırasında bir rolün ne yaptığına bakabilmek istiyorum, böylece kuralları bilmesem de oyunu takip edebileyim.

- **AC11.1.1** **Diyelim ki** ana sayfadayım, lobideyim ya da oyun içindeyim, **O zaman** Rehber'i açabilirim; oyun içinde oyunu durdurmadan bir katman olarak açılır.
- **AC11.1.2** **Diyelim ki** odada yalnızca Gulyabani, Köylü ve Bekçi açık, **Eğer ki** oyun içinde Kartlar sekmesini açarsam, **O zaman** bu üç rol vurgulu, diğerleri soluk görünür.
- **AC11.1.3** **Diyelim ki** bir karta dokundum, **O zaman** büyük görsel, taraf, yetenek, ne zaman uyandığı, kazanma koşulu ve strateji ipucu görünür **Ve** kimin hangi rolde olduğu hiçbir yerde görünmez.
- **AC11.1.4** **Diyelim ki** kart veri kaynağında Bekçi'nin yetenek metni değişti, **O zaman** Rehber ayrı bir düzenleme yapılmadan yeni metni gösterir.

### US11.2 — Nasıl oynanır ve Moderatör Rehberi

**Kişi:** P2 Oyuncu, P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** FR18.3, FR18.4, FR2.5 · **Bağımlılık:** US11.1

Bir oyuncu olarak oyunu ilk kez oynarken kısa ve resimli bir anlatım görmek istiyorum, böylece kimseye sormadan oyuna başlayabileyim.

- **AC11.2.1** **Diyelim ki** lobiye ilk kez girdim, **O zaman** bir kez "Nasıl oynanır?" kartı çıkar; kapatınca aynı tarayıcıda tekrar çıkmaz.
- **AC11.2.2** **Diyelim ki** Nasıl Oynanır sekmesini açtım, **O zaman** 1 ekranlık özet, adım adım resimli anlatım (Odaya katıl → … → Kazanan) ve sık sorulanlar ("Gece sıramı nasıl anlarım?" dahil) görünür.
- **AC11.2.3** **Diyelim ki** moderatörüm ve Moderatör Rehberi'ni açtım, **O zaman** her fazda ne yapılacağı, örnek anons metinleri, ayarların açıklamaları ve sık hatalar görünür.

### US11.3 — Özgün kart tasarımları

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** FR19.1–FR19.4 · **Bağımlılık:** —

Bir oyuncu olarak kartımın tarafını rengi ve simgesiyle hemen anlamak istiyorum, böylece renk körü olsam bile rolümü karıştırmayayım.

- **AC11.3.1** **Diyelim ki** kartımı açtım, **O zaman** üstte karakter adı, ortada linol baskı üslubunda SVG çizim, altta taraf etiketi ve simgesi, en fazla 2 satır yetenek ve tek satır atmosfer sözü görünür; arka yüz herkeste aynıdır.
- **AC11.3.2** **Diyelim ki** kartlar renk körlüğü simülasyonuyla görüntülendi, **O zaman** her kartın tarafı simgesinden ayırt edilebilir.
- **AC11.3.3** **Diyelim ki** bir kartın metin kontrastı ölçüldü, **O zaman** normal metinde en az 4.5:1'dir.
- **AC11.3.4** **Diyelim ki** kart isimleri, metinleri ve görselleri kutu oyunuyla karşılaştırıldı, **O zaman** hiçbiri kutu oyunundan alınmamıştır ("Gulyabani" adı hariç).

---

## 12 — Kayıtlar ve rapor

### US12.1 — Olay kayıtları ve IP'nin saklanmaması

**Kişi:** P4 Sahip · **Öncelik:** Must Have · **Kaynak:** FR20.1, FR20.2 · **Bağımlılık:** —

Bir sahip olarak oyunda olanları kişisel veriyi gereğinden fazla tutmadan kaydetmek istiyorum, böylece başarıyı ölçebileyim ve KVKK'ya uyayım.

- **AC12.1.1** **Diyelim ki** bir oyun oynandı, **O zaman** giriş/çıkış, oda kurma, oyun başlangıcı, faz geçişleri, oylar ve seçimler, ölümler, oyun sonu, kopmalar, moderatör işlemleri ve geri bildirimler zaman, oda kodu, nick, cihaz türü, tarayıcı ve ülkeyle kaydedilir.
- **AC12.1.2** **Diyelim ki** bir oyun oynandı, **Eğer ki** veritabanı ve tüm sunucu günlükleri IP adresi biçimleri için taranırsa, **O zaman** hiçbir IP adresi bulunmaz.
- **AC12.1.3** **Diyelim ki** oyuncular sohbet etti, **O zaman** sohbet içeriği kayıtlara yazılmaz (şikayet edilen mesaj hariç).

### US12.2 — Verilerin kendiliğinden silinmesi

**Kişi:** P4 Sahip · **Öncelik:** Must Have · **Kaynak:** FR20.3, FR20.4 · **Bağımlılık:** US12.1

Bir sahip olarak eski verilerin kendiliğinden silinmesini istiyorum, böylece elimde gereğinden uzun kişisel veri kalmasın.

- **AC12.2.1** **Diyelim ki** bir oda 24 saat önce kuruldu, **O zaman** oda ve sohbetleri artık sorgulanamaz.
- **AC12.2.2** **Diyelim ki** bir kayıt 1 yıldan eski, **O zaman** silinmiştir; 1 yıldan yeni kayıtlar durur.
- **AC12.2.3** **Diyelim ki** bir oda 23 saat 59 dakika önce kuruldu, **O zaman** oda hâlâ açılır.

### US12.3 — Sahibe rapor

**Kişi:** P4 Sahip · **Öncelik:** Must Have · **Kaynak:** FR20.5, FR21.1, FR21.2 · **Bağımlılık:** US12.1

Bir sahip olarak bir tarih aralığı için tek komutla rapor almak istiyorum, böylece oyunun başarılı olup olmadığını sayılarla göreyim.

- **AC12.3.1** **Diyelim ki** dönem içinde 3 tam oyun ve 1 yarıda bırakılmış oyun var, **Eğer ki** rapor komutunu çalıştırırsam, **O zaman** Türkçe rapor dosyasında oyun sayısı 3 olur.
- **AC12.3.2** **Diyelim ki** 6 oyunculu bir oyunda bir oyuncu 10 saniyeliğine koptu, **O zaman** o oyun sorunsuz oyun sayısına girmez.
- **AC12.3.3** **Diyelim ki** dönemde hiç geri bildirim yok, **O zaman** memnuniyet ortalaması "veri yok" yazar (0 değil); oyunculara geçmiş ya da istatistik ekranı gösterilmez.

---

## 13 — Ortak nitelikler

### US13.1 — Gizli bilginin sızmaması

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** NFR8 · **Bağımlılık:** US2.2

Bir oyuncu olarak tarayıcımın arka planında bile başkalarının sırlarının bulunmamasını istiyorum, böylece teknik bilen biri hile yapamasın.

- **AC13.1.1** **Diyelim ki** görünürlük tablosundaki her bilgi (rol, rozet, Bekçi sonucu, gizli kelime, gulyabani sohbeti, Mezarlık Sohbeti, gece günlüğü) için otomatik test çalıştı, **O zaman** her bilgi yalnızca tabloda hakkı olanların tarayıcısına gider.
- **AC13.1.2** **Diyelim ki** oylar canlı değil, **O zaman** oylama bitmeden hiçbir oyuncuya kimin kime oy verdiği gönderilmez.
- **AC13.1.3** **Diyelim ki** oyun bitti, **O zaman** tüm roller ve günlük herkese gönderilir.

### US13.2 — Herkesin oynayabilmesi (erişilebilirlik)

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** NFR9 · **Bağımlılık:** —

Bir oyuncu olarak görme ya da hareket zorluğum olsa da oyunu oynayabilmek istiyorum, böylece arkadaş grubumun dışında kalmayayım.

- **AC13.2.1** **Diyelim ki** CI'da otomatik erişilebilirlik taraması çalıştı, **O zaman** WCAG 2.1 AA ihlali bulunmaz (kontrast en az 4.5:1, dokunma alanı en az 44x44 piksel).
- **AC13.2.2** **Diyelim ki** yalnızca klavye kullanıyorum, **O zaman** her işlevi yapabilirim **Ve** odak her zaman görünür.
- **AC13.2.3** **Diyelim ki** ekran okuyucu kullanıyorum, **O zaman** faz değişimi ve yeni sohbet mesajı duyurulur; gece sıranın bana gelmesi duyurulmaz (sahibin onayladığı tek istisna).
- **AC13.2.4** **Diyelim ki** cihazımda hareket azaltma açık, **O zaman** animasyon oynatılmaz.

### US13.3 — Telefonda ve Türkçe kullanım

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** NFR10, NFR11 · **Bağımlılık:** —

Bir oyuncu olarak oyunu küçük bir telefonda, Türkçe ve sorunsuz kullanmak istiyorum, böylece ayrı bir uygulama kurmadan oynayabileyim.

- **AC13.3.1** **Diyelim ki** ekran genişliği 320 piksel, **O zaman** hiçbir ekranda yatay kaydırma gerekmez.
- **AC13.3.2** **Diyelim ki** desteklenmeyen bir tarayıcıyla geldim, **O zaman** kısa bir uyarı görünür; Android Chrome, iPhone Safari (iOS 16+) ve masaüstü tarayıcıların son iki sürümü desteklenir.
- **AC13.3.3** **Diyelim ki** arayüzdeki metinler incelendi, **O zaman** hepsi Türkçedir **Ve** koddan ayrı metin dosyasından gelir.

### US13.4 — Akıcı ve eşzamanlı oyun

**Kişi:** P2 Oyuncu · **Öncelik:** Must Have · **Kaynak:** NFR1, NFR2, NFR14, FR14.8 · **Bağımlılık:** —

Bir oyuncu olarak verdiğim oyun ve sayaçların herkeste aynı anda görünmesini istiyorum, böylece oyun canlı ve adil hissettirsin.

- **AC13.4.1** **Diyelim ki** 50 oda ve oda başına 26 oyuncu + moderatörle yük testi çalıştı, **O zaman** işlemlerin %95'i diğer ekranlara 1 saniye içinde yansır.
- **AC13.4.2** **Diyelim ki** bir geri sayım çalışıyor, **O zaman** ekranımdaki süre sunucudaki bitiş zamanından en fazla 1 saniye sapar; telefonumun saati yanlış olsa da sayım doğrudur.

### US13.5 — Hileye ve kötüye kullanıma karşı koruma

**Kişi:** P1 Moderatör · **Öncelik:** Must Have · **Kaynak:** NFR7, NFR15 · **Bağımlılık:** —

Bir moderatör olarak kimsenin sırası olmadan işlem yapamamasını istiyorum, böylece oyunun sonucuna güvenebilelim.

- **AC13.5.1** **Diyelim ki** bir köylü gece gulyabani hedef seçme isteği gönderdi, **O zaman** sunucu isteği reddeder **Ve** oyun durumu değişmez.
- **AC13.5.2** **Diyelim ki** bir oyuncu 10 saniyede 6 mesaj göndermeye çalıştı, **O zaman** 6. mesaj kabul edilmez; bir bağlantı dakikada 11. oda kodu denemesini yaparsa deneme reddedilir.
- **AC13.5.3** **Diyelim ki** iki oyuncu aynı anda oy verdi, **O zaman** iki oy da sayılır, hiçbiri kaybolmaz.
- **AC13.5.4** **Diyelim ki** bağlantı şifresiz (HTTP/WS) kurulmaya çalışıldı, **O zaman** kabul edilmez.

---

## Assumptions & Open Questions

- [assumption] R-05: "Gördüm"e herkes basmadan moderatör ilerleyebilir (AC2.2.3).
- [assumption] R-06: gulyabani adet seçicisi en az 1'dir (AC2.1.4).
- [assumption] R-07: KVKK bilgilendirmesi 1 aylık şikayet saklamayı söyler (AC10.2.4).
- [assumption] US9.6'da yeniden katılma isteği, odada aynı nick'le kayıtlı ve oyunda olan bir oyuncu için yapılabilir; onaydan önce isteyene oyun bilgisi gitmez.
- Aylık maliyet (NFR3), hizmet erişilebilirliği (NFR6), test edilebilirlik ve bakım (NFR12) ve gözlemlenebilirlik (NFR13) kullanıcıya dönük bir hikâye değil; NFR Gereksinimleri aşamasında ayrıntılandırılır.
- Açık sorular gereksinim belgesindeki gibi duruyor: oyunun nihai adı (ISS-01), teknoloji seçimi (ISS-02), yayın aşamaları (ISS-03), küfür listesinin kaynağı (DEP-04), "her gün yeni kelime" listesi (A19).
