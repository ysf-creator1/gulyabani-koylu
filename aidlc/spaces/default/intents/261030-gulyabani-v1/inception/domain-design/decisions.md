# Mimari Karar Kayıtları (ADR) — Alan Tasarımı

Alan Tasarımı'nda verilen önemli kararlar. Her kayıt Bağlam, Karar, Sonuçlar ve Reddedilen Seçenekler'i içerir (Inception kuralları). Yapı taşlarının ayrıntısı `components.md`'dedir. Teknoloji seçimi ve yapı taşlarının tek program mı ayrı programlar mı olacağı burada kararlaştırılmaz (NFR/altyapı aşamaları ve Units Generation).

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements).
- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices).
- Ayrıntılı Taslaklar: `inception/refined-mockups/interaction-spec.md`.
- [Q1] ve onaylanan varsayılanlar: `domain-design-questions.md` (özet onayı: Looks correct).

## Karar Dizini

| ADR | Başlık | Durum |
|---|---|---|
| ADR-001 | Oyun kuralları saf ve bağımsız bir modülde (GameRules) | Accepted |
| ADR-002 | Gizli bilgi tek bir süzgeçten geçer (VisibilityFilter) | Accepted |
| ADR-003 | Oda yönetimi ile süren oyun ayrı yapı taşları | Accepted |
| ADR-004 | Süren oyunun tek sahibi MatchFlow; işlem kaydedilmeden kabul edilmez | Accepted |
| ADR-005 | Bağımlılıklar tek yönlü; sunucudan istemciye bildirimler olay olarak yayınlanır | Accepted |
| ADR-006 | Kayıtlar ve geri bildirim oda verisinden ayrı tutulur | Accepted |
| ADR-007 | Moderatör kaybolursa kuralı MatchFlow'da; teklif 3 dakika açık kalır | Accepted |
| ADR-008 | Oyuncu, moderatör ve Rehber için tek web uygulaması | Accepted |
| ADR-009 | Bot oyuncular gerçek bağlantı üzerinden oynar | Accepted |

---

## ADR-001: Oyun kuralları saf ve bağımsız bir modülde (GameRules)

### Status
Accepted

### Context
Oyunun kuralları karmaşıktır: 9 rol, ilk gece ve standart gece sırası, ölüm sonrası etki zinciri (Celalli Damat → sevdalı → Dertli → kazanma kontrolü), oylama eşitlikleri, onay oylaması (FR5–FR11). NFR12, oyun motorunun altyapıdan bağımsız, saf ve test edilebilir olmasını; team-practices ise kural kodunda önce test yazılmasını ve en az %90 satır kapsamını ister. Rol dağıtımı ve olasılıklar kriptografik rastgelelik ister (NFR15).

### Decision
Bütün oyun kurallarını, internet, ekran, saat ve veritabanı bilmeyen saf bir modülde (`GameRules`) toplarız: "bu durumda bu komut gelirse yeni durum ve olaylar ne olur" sorusunu cevaplar. Saati ve rastgeleliği çağıran taraf (MatchFlow) verir. Zamanlama, kalıcılık ve moderatör adımlarının yürütülmesi `MatchFlow`'dadır.

### Consequences
- **Olumlu:** Kurallar ağ ya da veritabanı kurmadan, binlerce senaryoyla hızlı test edilir; ki-kare dağıtım testi (FR4) ve kazanma koşulları birim testiyle sınanır. Yeni rol veri olarak eklenebilir (ContentCatalog ile birlikte). Bot oyuncular "yasal eylemler" bilgisini buradan alır.
- **Olumsuz:** Kural ile yürütme arasında net bir sınır çizmek gerekir; süre dolunca ne olacağı gibi kararlar ikiye bölünür (süre MatchFlow'da, sonucun hesabı GameRules'da).
- **Güvenlik:** Her komutun sıra, rol ve durum doğrulaması tek yerde olur (NFR7); istemciye güvenilmez (C-07).

### Alternatives Rejected
- **Kuralları akış ve sunucu koduna gömmek:** Başta daha az dosya demektir, ama kurallar ağ ve zamanlayıcı olmadan test edilemez, %90 kapsam ve önce-test sırası zorlaşır.
- **Kuralları istemcide de işletmek:** Ekran daha hızlı tepki verirdi, ama gizli bilgi istemciye gitmek zorunda kalır (C-07'ye aykırı).

---

## ADR-002: Gizli bilgi tek bir süzgeçten geçer (VisibilityFilter)

### Status
Accepted

### Context
Oyunun asıl değeri gizli bilginin hiç sızmamasıdır (intent-statement, C-07). NFR8'deki görünürlük tablosu 11 bilgi türünü ve kimin gördüğünü tanımlar; hayalet modu, bekleyenler, onay bekleyen yeniden katılma isteği, ölü moderatör ve izleyici eski moderatör gibi özel alıcılar vardır. Gece, sırası gelen dışında herkesin ekranı aynı görünmelidir (FR5.5).

### Decision
Herhangi bir istemciye giden her oyun ve oda bilgisi, alıcıya özel görünüm üreten tek bir saf süzgeçten (`VisibilityFilter`) geçer. Bağlantı katmanı (`ConnectionGateway`) yalnızca bu süzgecin ürettiği görünümü gönderir; diğer yapı taşları istemciye doğrudan veri göndermez.

### Consequences
- **Olumlu:** Görünürlük kuralı tek yerde yazılır ve tek yerden, her alıcı türü için otomatik test edilir (US13.1). Yeni bir rol ya da bilgi türü eklenince değişecek yer bellidir.
- **Olumsuz:** Her olayda her alıcı için ayrı görünüm üretmek ek iş demektir; 50 oda × 27 kişide (NFR2) bunun hızlı olması NFR tasarımında ölçülmelidir.
- **Güvenlik ve uyum:** Hile riski (tarayıcının arka planını okumak) yapı gereği kapanır; bu, kişisel veri olmasa da oyuncunun güvenini korur.

### Alternatives Rejected
- **Her yapı taşının kendi gönderdiğini süzmesi:** Kural birçok yere dağılır; bir yerde unutulan alan sızıntı demektir.
- **Bütün durumu istemciye gönderip ekranda gizlemek:** En kolay yol, ama C-07 ve NFR8'e doğrudan aykırı.

---

## ADR-003: Oda yönetimi ile süren oyun ayrı yapı taşları

### Status
Accepted

### Context
Bir oda 24 saat yaşar ve içinde birden çok oyun oynanabilir ("Yeni oyun", FR17.2). Giriş kararı 9 satırlık bir kurala dayanır (interaction-spec "Yeniden Katılma Kuralı"); bekleyenler, lobide çıkarma, art arda 2 çıkarmada 30 dakika yasak ve "Yeni isteklere kapat" (FR2.3) oyunun kurallarından bağımsızdır. Oyun ise saniyeler içinde değişen bir durumdur.

### Decision
Oda, katılımcılar, lobi, ayarlar, rol havuzu, çıkarma kayıtları ve yeniden katılma istekleri `RoomManager`'da; süren oyun `MatchFlow`'dadır. Oyun başlarken MatchFlow lobi görüntüsünü RoomManager'dan alır, oyun bitince odayı lobiye döndürür. Oyunda çıkarma ölüm olarak MatchFlow'da işler, çıkarma kaydı ve yasak RoomManager'da tutulur.

### Consequences
- **Olumlu:** Oda kuralları ile oyun kuralları birbirini bozmadan değişir; lobi ve giriş, oyun olmadan da test edilir. "Yeni oyun" bir oyunu kapatıp yenisini açmak kadar basittir.
- **Olumsuz:** Oyunda çıkarma ve moderatör değişikliği gibi iki tarafı ilgilendiren işler iki yapı taşına yayılır; sıraları (önce ölüm, sonra yasak kaydı) Fonksiyonel Tasarım'da netleşmelidir.
- **Güvenlik:** Tarayıcı tanıması oturum bilgisiyle yapılır, IP kullanılmaz (C-14).

### Alternatives Rejected
- **Oda ve oyunu tek yapı taşında toplamak:** Başta sade, ama 24 saatlik oda ömrü ile oyunun saniyelik durumu birbirine karışır ve tek bir büyük, zor test edilen parça çıkar.
- **Girişi bağlantı katmanında karar vermek:** Giriş kuralı oda verisine dayandığı için veri sahibinden kopar.

---

## ADR-004: Süren oyunun tek sahibi MatchFlow; işlem kaydedilmeden kabul edilmez

### Status
Accepted

### Context
Sunucu güncelleme ya da arıza ile yeniden başlasa bile süren oyunlar kaybolmamalı, kabul edilen her oy, seçim ve faz geçişi korunmalı, oyun kalan süreyle sürmelidir (FR14.6, NFR5). Aynı anda gelen oylardan hiçbiri kaybolmamalıdır (NFR7, AC13.5.3). Bütün süreler sunucuda bitiş zamanı olarak tutulur (FR14.8).

### Decision
Her odanın süren oyununun tek sahibi `MatchFlow`'dur. Bir odaya gelen komutlar sıraya konur ve tek tek işlenir; GameRules'un hesapladığı yeni durum kalıcı depoya yazıldıktan sonra komut kabul edilir ve olay yayınlanır. Bitiş zamanları da kalıcı durumun parçasıdır; açılışta oyunlar ve sayaçlar kalan süreyle geri yüklenir. Hangi deponun ve kayıt biçiminin (tam durum ya da işlem günlüğü) kullanılacağı NFR tasarımında seçilir.

### Consequences
- **Olumlu:** Yeniden başlatmada kabul edilmiş hiçbir işlem kaybolmaz; aynı anda gelen komutlar sırayla işlendiği için çakışma olmaz.
- **Olumsuz:** Her komut bir yazma işlemi gerektirir; NFR1'deki 1 saniye hedefine bu yazmanın sığdığı yük testinde ölçülmelidir.
- **Güvenlik ve uyum:** Kalıcı oyun verisi oda ile birlikte 24 saatte silinir (FR20.4); IP içermez.

### Alternatives Rejected
- **Oyunu yalnızca bellekte tutmak:** En hızlısı, ama yeniden başlatmada oyun kaybolur (FR14.6'ya aykırı).
- **Belirli aralıklarla toplu kaydetmek:** Yazma sayısı azalır, ama son aralıktaki oylar kaybolabilir (NFR5'e aykırı).

---

## ADR-005: Bağımlılıklar tek yönlü; sunucudan istemciye bildirimler olay olarak yayınlanır

### Status
Accepted

### Context
İstemciden gelen komutlar bağlantı katmanından yapı taşlarına gider; ama sunucu da kendi başına istemcilere bilgi göndermelidir (süre doldu, moderatör teklifi, yeni mesaj). Bağlantı katmanı yapı taşlarını, yapı taşları da bağlantı katmanını çağırırsa döngü oluşur ve parçalar ayrı test edilemez.

### Decision
`ConnectionGateway` komutları RoomManager, MatchFlow, ChatService ve FeedbackService'e iletir; bu yapı taşları ConnectionGateway'i hiç çağırmaz, yalnızca olay yayınlar. ConnectionGateway bu olayları dinler, her bağlı kişi için VisibilityFilter'a görünüm ürettirir ve gönderir. Kayıt yazımı (EventRecorder) oyunu bekletmeyen biçimde yapılır. Bağımlılık grafiğinde döngü yoktur (`components.md` diyagramı).

### Consequences
- **Olumlu:** Her yapı taşı bağlantı olmadan test edilir; BotPlayer ve WebClient aynı kapıdan bağlanır. Kayıt hatası oyunu durdurmaz.
- **Olumsuz:** Olayların sırası ve kaybolmaması dikkat ister; bir olay gönderilemezse yeniden bağlanan istemci güncel görünümü baştan alır (NFR4).
- **Güvenlik:** İstemciye çıkan tek yol tek süzgeçten geçer (ADR-002).

### Alternatives Rejected
- **Yapı taşlarının bağlantı katmanını doğrudan çağırması:** Daha az yapı, ama döngü oluşur ve gizli bilgi süzgeci atlanabilir.
- **Ayrı bir mesaj kuyruğu ürünü:** Tek sunucu ve sıfır bütçe (C-01, C-10) için gereksiz karmaşıklık; ileride gerekirse eklenir.

---

## ADR-006: Kayıtlar ve geri bildirim oda verisinden ayrı tutulur

### Status
Accepted

### Context
Odalar ve sohbetler 24 saatte, kayıtlar ve geri bildirimler 1 yılda, şikayet edilen mesajın metni ve notu 1 ayda silinmelidir (FR16.5, FR20.3, FR20.4). Hiçbir kayıtta IP olmamalıdır (C-14). Rapor (FR21) yalnızca kayıtları okur.

### Decision
Olay kayıtları ve mesaj şikayeti kaydı `EventRecorder`'da, geri bildirimler `FeedbackService`'te, oda verisinden ayrı tutulur. Kayıtlardaki oda kodu ve nick düz değerdir, odaya başvuru değildir. Şikayet iki yere yazılır: odada moderatöre gösterilen işaret (ChatService, 24 saat) ve kalıcı şikayet kaydı (EventRecorder, metin 1 ay, kalanı 1 yıl). Silmeleri `Housekeeping` zamanında tetikler, her veriyi sahibi siler.

### Consequences
- **Olumlu:** Saklama süreleri birbirine karışmaz; oda silinince kayıt kaybolmaz, kayıt dururken oda verisi kalmaz. IP'siz kayıt güvencesi tek yerde test edilir.
- **Olumsuz:** Şikayet bilgisi iki yerde durur (kısa ve uzun süreli); ikisinin aynı anda yazılması gerekir.
- **Uyum (KVKK):** Kişisel veri en kısa süreyle tutulur; KVKK bilgilendirmesindeki süreler (24 saat, 1 ay, 1 yıl) yapıya oturur (C-15, C-16).

### Alternatives Rejected
- **Kayıtları oda verisiyle aynı yerde tutmak:** 24 saatlik silme kayıtları da silerdi ya da kayıtlar için oda silinemezdi.
- **Şikayeti yalnızca kayıtlarda tutmak:** Moderatörün Sohbet sekmesinde işaretli görmesi (FR13.3) için oda içinde de bilgi gerekir.

---

## ADR-007: Moderatör kaybolursa kuralı MatchFlow'da; teklif 3 dakika açık kalır

### Status
Accepted

### Context
Sahip, Ayrıntılı Taslaklar'da FR14.5'teki "oda silinene kadar beklenir" kuralını değiştirdi (M-18): moderatör 3 dakika dönmezse ölülere moderatörlük teklifi gider, ilk kabul eden moderatör olur; ölü yoksa "Moderatör yok" ekranı gelir. Teklife kimse cevap vermezse ne olacağı yazılı değildi (Ayrıntılı Taslaklar inceleme notu R-09). Sahip Q1'de teklifin 3 dakika açık kalmasını seçti. Gereksinim belgesindeki FR14.5 buna göre güncellendi.

### Decision
Moderatör kaybolursa kuralının bütün zamanlaması ve durumu (`ModeratorOffer`) `MatchFlow`'dadır, çünkü oyunu duraklatmak ve sürdürmek onun işidir. Teklif 3 dakika açık kalır; kabul edilmezse, herkes reddederse ya da ölü yoksa oyun "Moderatör yok" durumuna geçer ve roller açılmaz. Yeni moderatör belirlenince RoomManager'a bildirilir. Moderatör olan ölü oyuncu Mezarlık Sohbeti'ne yazamaz, yalnızca okur (ChatService bu bilgiyi MatchFlow'un bağlamından alır). Yürüyen iskelette bu kural kapalıdır; moderatör dönene kadar beklenir.

### Consequences
- **Olumlu:** Oyun en fazla 6 dakika donar (3 dk bekleme + 3 dk teklif), sonra ya sürer ya da açıkça biter. Duraklatma, sayaçlar ve teklif tek yerde olduğu için yeniden başlatmada da doğru geri yüklenir.
- **Olumsuz:** Moderatör bilgisi oyun sırasında hem MatchFlow'da (kimin komut verebileceği) hem RoomManager'da (odanın moderatörü) yer alır; değişiklik ikisinde aynı anda yapılmalıdır.
- **Gizlilik:** Teklif yalnızca ölülere gider; ölü olmak herkesçe bilinen bir bilgidir. Yeni moderatör bütün rolleri görür, ama ölü olduğu için oyunu etkileyemez; Mezarlık Sohbeti'ne yazamaması, hayalet modu kapalıyken ölülere rol sızdırmasını da önler.

### Alternatives Rejected
- **Kuralı RoomManager'a koymak:** Oyunun duraklatılması ve sayaçlar MatchFlow'da olduğu için iki yapı taşı arasında sık gidip gelme gerekirdi.
- **Teklifi süresiz açık bırakmak (Q1 seçeneği C):** Oyun 24 saate kadar donabilirdi; sahip reddetti.
- **Teklif süresini 1 dakika yapmak (Q1 seçeneği B):** Daha kısa donma, ama sahip moderatör beklemesiyle aynı, akılda kalan süreyi seçti.

---

## ADR-008: Oyuncu, moderatör ve Rehber için tek web uygulaması

### Status
Accepted

### Context
Moderatör ve oyuncular aynı linkten girer; moderatör telefonda ya da bilgisayarda oynar (FR13.2). Oyun sırasında ölü bir oyuncu moderatör olabilir (FR14.5), yani aynı kişinin ekranı oyuncudan moderatöre dönebilir. Rehber oyun içinden de açılır (FR18.1). Kurulum yok, hesap yok (tarif §3).

### Decision
Oyuncu, ölü oyuncu, moderatör, bekleme ve Rehber ekranları tek bir web uygulamasında (`WebClient`) bulunur; kişinin hangi ekranı göreceğine sunucudan gelen görünüm karar verir. Uygulama hiçbir kuralı kendisi işletmez. Kart ve Rehber metinleri ile Türkçe metinler ContentCatalog'dan gelir.

### Consequences
- **Olumlu:** Tek link, tek uygulama; ölü oyuncunun moderatör olması ya da eski moderatörün izleyici olması ekran değişikliğinden ibarettir. Ortak parçalar (RoleCard, ChatPanel, StatusBanner) bir kez yazılır.
- **Olumsuz:** Moderatör ekranının kodu oyuncuların telefonuna da iner; bu yalnızca ekran kodudur, gizli bilgi içermez (ADR-002). Uygulama boyutu telefonda hızlı açılacak şekilde tutulmalıdır.
- **Erişilebilirlik:** WCAG 2.1 AA kuralları tek yerde uygulanır ve CI taraması tek uygulamayı tarar (NFR9).

### Alternatives Rejected
- **Ayrı bir moderatör uygulaması:** Moderatör kodu oyunculara inmezdi, ama ölü oyuncunun oyun sırasında moderatör olması iki uygulama arasında geçiş gerektirirdi.
- **Rehber'i ayrı bir site yapmak:** Oyun içinden oyunu durdurmadan açılma (FR18.1) ve "bu odada aktif roller" filtresi (FR18.2) zorlaşırdı.

---

## ADR-009: Bot oyuncular gerçek bağlantı üzerinden oynar

### Status
Accepted

### Context
Yürüyen iskelet, bot oyuncuların tam bir oyunu baştan sona otomatik oynadığı uçtan uca testle kanıtlanır; bu test her yeni rol ve özellikle genişler (team-practices Walking Skeleton ve Testing Posture, NFR12). Yeniden bağlanma ve gizli bilginin sızmaması da otomatik test edilmelidir (team-practices projeye özgü testler).

### Decision
Uçtan uca test için `BotPlayer` yapı taşı yazılır; botlar gerçek bir tarayıcı gibi ConnectionGateway'e bağlanır, aldıkları görünüme göre yasal eylem seçer ve oyunu kazanana kadar oynar. Bir bot moderatör sürücüsü moderatör adımlarını ilerletir. Bu yalnızca test aracıdır; oyuncuya sunulan bir "bot moderatör" değildir (v2 kapsamı, C-05).

### Consequences
- **Olumlu:** Test, oda kurmadan oyun sonuna kadar bütün yapı taşlarını ve bağlantıyı gerçek yoldan sınar; gizli bilgi testi her botun gerçekten aldığı mesajlara bakar. Construction doğrulama komutu bunu çalıştırabilir.
- **Olumsuz:** Gerçek bağlantı üzerinden oynayan test, kural modülü üzerindeki testlerden yavaştır; bu yüzden kural ayrıntıları GameRules'un birim testlerinde, akış bütünlüğü bot testinde sınanır.
- **Güvenlik:** Botlar yalnızca test ortamında çalışır; canlı sunucuda çalışmaz (team-practices Deployment).

### Alternatives Rejected
- **Botları yalnızca GameRules üzerinde oynatmak:** Hızlı, ama bağlantı, görünüm süzgeci ve yeniden bağlanma sınanmaz; iskeletin "parçalar birbirine bağlı" kanıtı olmaz.
- **Gerçek tarayıcıyı süren ekran testleri:** Ekranı da sınar, ama yavaş ve kırılgandır; birkaç ekran testi ayrıca yazılabilir, ama tam oyun için botlar kullanılır.
