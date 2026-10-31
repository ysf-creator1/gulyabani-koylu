# Gereksinimler — Gulyabani–Köylü (çalışma adı)

v1'in işlevsel ve işlevsel olmayan gereksinimleri. Her gereksinimin kalıcı bir kimliği vardır (`FR{n}`, `FR{n}.{m}`, `NFR{n}`); sonraki aşamalar bu kimlikleri değiştirmeden kullanır. Kabul ölçütleri Türkçe Gherkin anahtar kelimeleriyle yazıldı: **Diyelim ki** (başlangıç durumu), **Eğer ki** (eylem), **O zaman** (beklenen sonuç), **Ve** (ek koşul/sonuç).

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı." Oyunun ayrıntılı tarifi bu dosyadadır; aşağıda "tarif §N" diye bölüm numarasıyla anılır.
- [scope] Workflow-selected scope: `mvp`.
- Onaylanan niyet beyanı: `ideation/intent-capture/intent-statement.md` (intent-statement).
- Onaylanan kapsam belgesi ve iş listesi: `ideation/scope-definition/scope-document.md` (scope-document), `ideation/scope-definition/intent-backlog.md` (IB-01…IB-17).
- Fizibilite çıktıları: `ideation/feasibility/constraint-register.md` (C-01…C-18), `ideation/feasibility/raid-log.md` (RSK, ASM, ISS, DEP).
- Kaba taslaklar: `ideation/rough-mockups/wireframes.md` (W-01…W-14), `ideation/rough-mockups/user-flow.md` (F-01…F-12).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices) ve onaylı proje kuralları (`memory/project.md`).
- [Q1]–[Q17]: `requirements-analysis-questions.md` içindeki cevaplar (özet onayı: Looks correct).

## Niyet Analizi

- **Amaç:** Uzaktaki arkadaş gruplarının, ayrı bir görüntülü toplantıdayken, tarayıcıdan (çoğunlukla telefondan) Anadolu köyü temalı bir sosyal çıkarım oyunu oynayabilmesi. Kart dağıtma, gizli bilgiyi yalnızca hak eden oyuncuya iletme ve moderatörlüğe yardım etme işlerini sistem üstlenir. (intent-statement Problem Tanımı, tarif §1)
- **Asıl değer:** Moderatörün o an ne yapacağını ve ne okuyacağını görmesi; gizli bilginin hiç sızmaması; telefonda başka uygulamaya geçen oyuncunun kaldığı yerden devam edebilmesi. (intent-statement, RSK-01, C-07)
- **Başarı ölçütleri** (intent-statement, [Q13]):
  - En az 6 oyunculu bir oyun **sorunsuz** oynanır. Sorunsuz oyun: rol dağıtımından kazananın ilanına kadar hiçbir oyuncu ve moderatör için kopma kaydı yoktur, oyun yeniden başlatılmamıştır ve "Sorun bildir" basılmamıştır. [Q13]
  - Yayından sonraki ilk ay en az 5 tam oyun oynanır (en az 3 oyuncu + moderatör, kazanan ilan edilene kadar oynanan oyunlar; yarıda bırakılanlar sayılmaz). (intent-statement)
  - İlk ay hiç şikayet girdisi gelmez; bu ölçüt memnuniyet ortalaması ve geri bildirim sayısıyla birlikte okunur (şikayet yokluğu katılımsızlıktan da olabilir). [Q13] (intent-capture inceleme notu R-06)
  - Ölçümler sunucudaki kayıtlardan rapor komutuyla yapılır (FR21).
- **Kullanıcılar:** Moderatör (rol almaz, her şeyi görür; telefon ya da bilgisayar), oyuncu (çoğunlukla telefon), ölü oyuncu (mezarlıkta), oyunun sahibi (rapor üretir, ekranı yok). (user-flow Kişiler)

## İşlevsel Gereksinimler

### FR1 — Ana sayfa, oda kurma ve odaya katılma

Kaynak: intent-statement, scope-document (Oda ve lobi, Gizlilik, Tanıtım), IB-01, IB-11, tarif §3–§4, W-01, W-02, W-14, C-06, C-16, [Q9].

- **FR1.1** Ana sayfa oyunu anlatan kısa bir tanıtım metni, kısa KVKK gizlilik bilgilendirmesi, "Oda Kur" düğmesi, oda koduyla "Katıl" alanı ve Rehber'e erişim gösterir.
- **FR1.2** "Oda Kur" ile sistem 6 haneli, o an kullanımda olmayan bir oda kodu ve paylaşılabilir bir link üretir; odayı kuran kişi varsayılan moderatördür.
- **FR1.3** Katılım link ya da oda koduyla yapılır; kişi yalnızca nick girer (şifre, hesap yok). Nick 2–16 karakterdir, baştaki ve sondaki boşluklar atılır, oda içinde büyük/küçük harf (Türkçe kurallarıyla) farkı gözetilmeden benzersizdir. Giriş ekranında kısa KVKK bilgilendirmesi görünür.
- **FR1.4** Hatalı nick'te (uzunluk, kullanımda, filtre listesinde geçen kelime — FR16.3) ekran alanın altında nedeni yazar ve kişinin yazdığı korunur.
- **FR1.5** Oda bulunamazsa ya da 24 saati dolmuşsa "Bu oda bulunamadı ya da süresi doldu.", oda doluysa "Bu oda dolu." mesajı ve sonraki adım düğmeleri gösterilir.
- **FR1.6** Oyun sürerken linkle gelen kişi nick girdikten sonra bir bekleme ekranında bekler; bu ekranda hiçbir oyun bilgisi (oyuncuların durumu, roller, sohbet) görünmez. Moderatör "Yeni oyun" dediğinde (FR17.2) lobiye alınır. [Q9]

Kabul ölçütleri:
- **Diyelim ki** ana sayfadayım, **Eğer ki** "Oda Kur" deyip nick girersem, **O zaman** 6 haneli kodu ve linki olan bir odanın moderatör lobisine geçerim.
- **Diyelim ki** odada "Ali" adlı bir oyuncu var, **Eğer ki** "ali " nick'iyle girmeye çalışırsam, **O zaman** "Bu nick kullanılıyor" uyarısı çıkar **Ve** yazdığım metin silinmez.
- **Diyelim ki** odada oyun sürüyor, **Eğer ki** linkle gelip nick girersem, **O zaman** bekleme ekranını görürüm **Ve** tarayıcıma oyuncuların rolü, yaşam durumu ya da sohbeti hakkında hiçbir veri gelmez.

### FR2 — Lobi

Kaynak: intent-statement, scope-document (Oda ve lobi, Oyuncu sayısı), IB-01, tarif §4, W-03, W-04, F-01, F-10, C-06.

- **FR2.1** Lobide herkes katılımcı listesini ve odada açık olan rolleri görür; kimin hangi rolü alacağı hiçbir yerde görünmez.
- **FR2.2** Moderatör, onay sorusundan sonra moderatörlüğü lobideki başka bir katılımcıya devredebilir. Devir yalnızca lobide yapılır.
- **FR2.3** Moderatör, onay sorusundan sonra bir oyuncuyu lobiden çıkarabilir; çıkarılan kişi "Moderatör seni odadan çıkardı." mesajını görür.
- **FR2.4** Oyun en az 3, en fazla 26 oyuncuyla (moderatör hariç) başlatılabilir. 3'ten az oyuncuda "Oyunu Başlat" pasiftir ve "En az 3 oyuncu gerekli" yazar; 3–5 oyuncuda lobide "En iyi deneyim için en az 6 oyuncu önerilir" uyarısı görünür. Bekleme ekranındakiler dahil odadaki oyuncu sayısı 26'yı geçemez.
- **FR2.5** İlk kez katılan oyuncuya lobide bir kez "Nasıl oynanır?" kartı gösterilir; kapatılabilir ve aynı tarayıcıda tekrar gösterilmez.
- **FR2.6** Moderatör lobideki Ayarlar sekmesinden aşağıdaki ayarları değiştirebilir; her ayarın varsayılanı ve izinli aralığı tablodaki gibidir. Aralık dışı değer kabul edilmez.

| Ayar | Varsayılan | İzinli aralık | Kaynak |
|---|---|---|---|
| Gündüz (meydan) süresi | 4 dk | 1–15 dk | tarif §7 |
| Son söz süresi | 30 sn | 10–120 sn | tarif §10 |
| Onay oylaması süresi | 20 sn | 10–120 sn | tarif §10 |
| Gulyabani kararı süresi | 90 sn | 30–300 sn | tarif §9 |
| Diğer gece seçimleri (Görücü, Bekçi, Ürkek) | 60 sn | 20–300 sn | varsayım A1 |
| Celalli Damat seçimi | 30 sn | 10–120 sn | tarif §6.2 |
| İlk gece kimse kaçırılmaz | KAPALI | açık/kapalı | [Q1] |
| Gulyabani kararında eşitlik | Eşitler arasında rastgele | rastgele / kimse kaçırılmaz | tarif §9, varsayım A2 |
| Oylamada eşitlik kuralı | Yeniden oylama | yeniden oylama / köyün en genci | [Q2] |
| Oylar canlı görünsün | AÇIK | açık/kapalı | [Q3] |
| Çekimser seçeneği | KAPALI | açık/kapalı | [Q3] |
| Hayalet modu | AÇIK | açık/kapalı | [Q5] |
| Her gün yeni gizli kelime | KAPALI | açık/kapalı | [Q5] |
| Ürkek fark edilme olasılığı | %50 | %0–%100, 10'luk adımlarla | [Q4] |
| Ürkek uyarısında isim | yok | yok/var | [Q4] |
| Dertli dert süresi | 2. gündüzün sonu | 1.–4. gündüzün sonu | tarif §6.3 |
| Erken bitiş (gulyabaniler ≥ diğerleri) | AÇIK | açık/kapalı | tarif §11 |

- **FR2.7** "Köyün en genci" kuralı seçiliyse moderatör lobide bir oyuncuyu "Köyün en genci" olarak işaretler; kural seçili değilken bu işaret görünmez.
- **FR2.8** Moderatörün son rol havuzu ve ayarları tarayıcısında hatırlanır ve yeni kurduğu odada varsayılan olarak gelir.

Kabul ölçütleri:
- **Diyelim ki** lobide 2 oyuncu var, **Eğer ki** moderatör "Oyunu Başlat"a bakarsa, **O zaman** düğme pasiftir **Ve** altında "En az 3 oyuncu gerekli" yazar.
- **Diyelim ki** lobide 4 oyuncu var, **O zaman** "Oyunu Başlat" etkindir **Ve** 6 oyuncu önerisi uyarısı görünür.
- **Diyelim ki** moderatör gündüz süresine 20 dk yazar, **O zaman** değer kabul edilmez **Ve** izinli aralık (1–15 dk) gösterilir.

### FR3 — Rol havuzu

Kaynak: intent-statement, scope-document (Rol havuzu), IB-05, tarif §5.1–§5.2, §16, W-04.

- **FR3.1** Lobide moderatöre Rol Havuzu paneli gösterilir: v1'in 9 rolü küçük kart resmi, kısa açıklama ve aç/kapa anahtarıyla listelenir.
- **FR3.2** Gulyabani ve Köylü her zaman açıktır, kapatılamaz. Diğer roller (Boşboğaz Gulyabani dahil) tek tek açılıp kapatılabilir. Ahbaplar açılınca destede her zaman 2 Ahbap bulunur.
- **FR3.3** Gulyabani sayısı için adet seçici vardır. Panel oyuncu sayısına göre önerilen toplam gulyabani sayısını (Boşboğaz dahil) gösterir: 3–7 oyuncu 1, 8–11 oyuncu 2, 12–17 oyuncu 3, 18–23 oyuncu 4, 24–26 oyuncu 5.
- **FR3.4** Hazır ön ayarlar: *Acemi* (yalnızca Gulyabani + Köylü), *Klasik* (+ Bekçi, Ahbaplar), *Dolu Köy* (oyuncu sayısına sığan tüm roller). Ön ayar seçildikten sonra anahtarlar tek tek değiştirilebilir.
- **FR3.5** Özel roller ile gulyabanilerin toplamı oyuncu sayısını aşarsa "Oyunu Başlat" pasif kalır ve nedeni (ör. "6 rol var, 5 oyuncu") yazar. Toplam gulyabani sayısı önerilenden fazlaysa "dengesiz" uyarısı gösterilir ama başlatma engellenmez.
- **FR3.6** Oyun başladıktan sonra rol havuzu değiştirilemez.

Kabul ölçütleri:
- **Diyelim ki** moderatör Boşboğaz Gulyabani'yi kapattı, **Eğer ki** oyun başlarsa, **O zaman** destede Boşboğaz bulunmaz **Ve** gece akışında Boşboğaz adımı gösterilmez. (tarif §16)
- **Diyelim ki** moderatör Ahbaplar'ı açtı, **O zaman** destede 2 Ahbap bulunur **Ve** Gulyabani ile Köylü anahtarları kapatılamaz. (tarif §16)
- **Diyelim ki** 6 oyuncu ve 3 gulyabani seçildi, **O zaman** dengesiz uyarısı görünür **Ve** "Oyunu Başlat" etkin kalır.

### FR4 — Rol dağıtımı ve kart görme

Kaynak: intent-statement, scope-document (Oyun akışı), IB-02, tarif §5.3, §7 adım 1, W-05, C-07.

- **FR4.1** Dağıtım sunucuda, kriptografik olarak güvenli rastgelelikle yapılır: açık roller desteye konur, kalan herkes Köylü olur.
- **FR4.2** Her oyuncu yalnızca kendi kartını görür; kart varsayılan olarak kapalıdır, dokununca açılır, tekrar dokununca kapanır. Oyuncu "Gördüm" der; moderatör kimin "Gördüm" dediğini görür.
- **FR4.3** Moderatör tüm rol eşleşmesini görür.

Kabul ölçütleri:
- **Diyelim ki** oyun başladı, **Eğer ki** bir köylünün tarayıcısına giden tüm mesajlar incelenirse, **O zaman** hiçbirinde başka bir oyuncunun rolü bulunmaz. (tarif §16)
- **Diyelim ki** aynı rol havuzuyla 1.000 dağıtım yapıldı, **O zaman** her rol her oyuncu sırasına istatistiksel olarak eşit dağılır (otomatik testte ki-kare sınaması geçer).

### FR5 — Gece akışı

Kaynak: intent-statement, scope-document (Oyun akışı), IB-02, tarif §7 adım 2 ve 6, §8 Uyku ekranı, W-06, W-07, W-09, F-03, [Q1], [Q14], [Q17].

- **FR5.1** İlk gece, yalnızca açık rollerin adımları şu sırayla işler: Görücü iki kişi seçer → sevdalılar birbirini görür → ahbaplar birbirini görür → gulyabaniler birbirini tanır (Boşboğaz'ın kim olduğu moderatöre gösterilir) → Bekçi bir evi yoklar → gulyabaniler kurban seçer. "İlk gece kimse kaçırılmaz" ayarı açıksa son adım yoktur.
- **FR5.2** Standart gece şu sırayla işler: Boşboğaz kontrolü (FR10.1) → Bekçi → gulyabaniler (2. geceden itibaren Ürkek'in "pencereden bak" seçeneğiyle birlikte).
- **FR5.3** Kapatılmış rollerin adımları hiç gösterilmez. Açık olup oyuncusu ölmüş ya da oyundan çıkmış rollerin adımı moderatöre normal okunur ve rastgele 8–15 saniyelik bir beklemeden sonra kendiliğinden atlanır (oyuncular sessizlikten kimin öldüğünü anlamasın diye).
- **FR5.4** Moderatör her gece adımında okunacak anons metnini, beklenen işlemi ve durumunu (bekleniyor / yapıldı / süre doldu / oyuncu kopuk) ve "Sonraki Adım" düğmesini görür.
- **FR5.5** Gece, sırası gelmeyen herkes, herkeste birebir aynı görünen Uyku ekranını görür. Sırası gelen oyuncunun ekranı eylem paneline döner. Bu sırada titreşim, ses ya da ekran okuyucu duyurusu olmaz; yalnızca ekran değişir. [Q14] [Q17]
- **FR5.6** Hedef seçimlerinde yalnızca yaşayan oyuncular listelenir, moderatör listelenmez; role özel ek kısıtlar FR6 ve FR10'dadır.
- **FR5.7** Bir gece seçimi süresi içinde yapılmazsa panel "Süre doldu" der ve seçim boş geçer (kopuk oyuncu için FR14.4 geçerlidir).

Kabul ölçütleri:
- **Diyelim ki** Görücü kapalı ve Bekçi açık, **Eğer ki** ilk gece başlarsa, **O zaman** moderatör ekranında Görücü ve sevdalı adımları hiç görünmez **Ve** Bekçi adımı görünür.
- **Diyelim ki** Bekçi açık ama Bekçi ölü, **Eğer ki** standart gecede Bekçi adımına gelinirse, **O zaman** adımın anonsu moderatöre gösterilir **Ve** 8–15 saniye sonra adım kendiliğinden geçer.
- **Diyelim ki** gece Bekçi'nin sırası geldi, **O zaman** diğer oyuncuların ekranı Uyku ekranında kalır **Ve** Bekçi'nin cihazında titreşim ya da ses tetiklenmez.

### FR6 — Gulyabani ortak kararı ve gulyabani sohbeti

Kaynak: intent-statement, scope-document (Oyun akışı), IB-02, tarif §9, §16, W-07, F-05.

- **FR6.1** Gulyabani adımında yalnızca yaşayan gulyabanilerin ekranında hedef listesi (yaşayan oyuncular; moderatör ve gulyabaniler hariç) ve aynı ekranda gulyabani sohbeti açılır.
- **FR6.2** Her gulyabani bir hedef işaretler; diğer gulyabaniler kimin kimi işaretlediğini canlı görür.
- **FR6.3** "Kararı Onayla" yalnızca tüm yaşayan gulyabaniler aynı hedefi işaretlediğinde etkinleşir; onaylanınca karar kilitlenir ve moderatöre iletilir.
- **FR6.4** Süre dolarsa çoğunluğun hedefi seçilir; eşitlikte ayara göre eşitler arasında rastgele biri seçilir ya da kimse kaçırılmaz. Hiç işaret yoksa kimse kaçırılmaz.
- **FR6.5** Moderatör gulyabani sohbetini salt okunur görür.

Kabul ölçütleri:
- **Diyelim ki** iki gulyabani farklı hedef işaretledi, **O zaman** "Kararı Onayla" pasif kalır. (tarif §16)
- **Diyelim ki** 3 gulyabaniden ikisi Ali'yi, biri Can'ı işaretledi, **Eğer ki** süre dolarsa, **O zaman** Ali kaçırılır.
- **Diyelim ki** 2 gulyabaniden biri Ali'yi, biri Can'ı işaretledi ve eşitlik ayarı "kimse kaçırılmaz", **Eğer ki** süre dolarsa, **O zaman** o gece kimse kaçırılmaz.

### FR7 — Sabah (kara haber) ve ölüm sonrası etki zinciri

Kaynak: intent-statement, scope-document (Oyun akışı), IB-02, tarif §7 adım 3, §10 adım 5, §11, W-08, F-04, F-06.

- **FR7.1** Sabah moderatöre anons metni ve gecenin sonucu gösterilir ("Dün gece köyde kara bir olay oldu: X kaçırıldı" ya da kimse ölmediyse "Dün gece kimse kaçırılmadı"). "Sonucu Açıkla" ile ölenlerin kartı herkesin ekranında açılır.
- **FR7.2** Herhangi bir ölümden sonra (gece kaçırılma, infaz, oyundan çıkarılma, Boşboğaz kontrolü, sevdalı ölümü, Celalli Damat'ın seçimi) etkiler şu sırayla işlenir: Celalli Damat'ın seçimi → sevdalı ölümü → Dertli kontrolü → kazanma kontrolü. Bir etki yeni bir ölüm doğurursa zincir o ölüm için de işler; kazanma kontrolü zincirin sonunda yapılır.
- **FR7.3** Kazanan yoksa tema gündüze döner ve meydan toplantısı başlar.

Kabul ölçütleri:
- **Diyelim ki** sevdalılardan biri gece kaçırıldı, **Eğer ki** moderatör "Sonucu Açıkla" derse, **O zaman** diğer sevdalı da aynı sabah ölür **Ve** iki kart da açılır. (tarif §16)
- **Diyelim ki** gece kimse kaçırılmadı, **O zaman** moderatöre "Dün gece kimse kaçırılmadı" anonsu gösterilir **Ve** hiçbir kart açılmaz.

### FR8 — Gündüz: meydan toplantısı

Kaynak: intent-statement, scope-document (Gündüz), IB-02, tarif §7 adım 4, W-08, F-04.

- **FR8.1** Gündüz herkesin ekranında geri sayım görünür (varsayılan 4 dk). Süre dolunca moderatöre "Oylamaya geç" hatırlatması gelir; oylamaya geçiş kendiliğinden olmaz, moderatör geçirir. Moderatör süreyi uzatabilir ve duraklatabilir.
- **FR8.2** Gündüz sohbetine yalnızca yaşayan oyuncular yazar; ölüler okur ama yazamaz.

Kabul ölçütleri:
- **Diyelim ki** gündüz süresi doldu, **O zaman** oylama kendiliğinden başlamaz **Ve** moderatöre "Oylamaya geç" hatırlatması görünür.
- **Diyelim ki** moderatör süreyi 2 dakika uzattı, **O zaman** tüm oyuncuların geri sayımı aynı anda 2 dakika artar.

### FR9 — Oylama, son söz, onay oylaması ve infaz

Kaynak: intent-statement, scope-document (Gündüz), IB-02, tarif §10, §16, W-08, W-09, F-04, [Q2], [Q3].

- **FR9.1** Yaşayan her oyuncu yaşayan başka bir oyuncuya oy verir; kendine oy veremez. Çekimser seçeneği ayara bağlıdır (varsayılan kapalı). Oylar ayara göre canlı görünür (varsayılan) ya da oylama bitince açılır. Süresi içinde oy vermeyenin oyu sayılmaz.
- **FR9.2** En çok oyu alan oyuncu sanık olur; hiç oy yoksa sanık çıkmaz ve o gün infaz yapılmaz. Eşitlikte ayardaki kural işler: *Yeniden oylama* — yalnızca eşitler arasında tekrar oylanır, yine eşitse o gün infaz yok; *Köyün en genci* — işaretli oyuncunun oyu eşitlikte 2 sayılır, yine eşitse o gün infaz yok.
- **FR9.3** Son söz süresinde (varsayılan 30 sn) sohbete yalnızca sanık yazabilir.
- **FR9.4** Onay oylaması: oylar korunarak oylama kısa bir süre (varsayılan 20 sn) yeniden açılır, oyuncular oyunu değiştirebilir. Sanık hâlâ tek başına en çok oya sahipse infaz edilir. Çoğunluk bozulursa yeni sanıkla son söze dönülür. Bir günde en fazla 2 yeniden oylama yapılır; sonrasında o gün infaz yapılmaz.
- **FR9.5** İnfaz edilen oyuncu oyundan çıkar, kartı herkesin ekranında açılır ve mezarlığa geçer; ardından FR7.2'deki zincir işler.
- **FR9.6** Moderatörün gündüz görünümü: "Oylamaya geç", kimin oy verip vermediği ve oy dağılımı, sanık, son söz ve onay oylaması adımları, infaz, tetiklenen etkiler (Celalli Damat seçimi, sevdalı ölümü, Dertli) ve süre uzat/duraklat. (rough-mockups inceleme notu R-01)

Kabul ölçütleri:
- **Diyelim ki** onay oylamasında çoğunluk bozuldu, **O zaman** yeni sanıkla son söz başlar **Ve** aynı gün 2 yeniden oylamadan sonra infaz yapılmaz. (tarif §16)
- **Diyelim ki** eşitlik kuralı "Yeniden oylama" ve Ali ile Can 3'er oy aldı, **Eğer ki** yeniden oylamada yine 3–3 olursa, **O zaman** o gün infaz yapılmaz.
- **Diyelim ki** son söz süresi sürüyor, **Eğer ki** sanık dışındaki bir oyuncu yazmaya çalışırsa, **O zaman** mesajı gönderilmez.

### FR10 — Rol yetenekleri

Kaynak: intent-statement, scope-document (Roller), IB-06, IB-07, IB-08, tarif §6.1–§6.3, §16, [Q4], [Q5].

- **FR10.1 Boşboğaz Gulyabani:** Gulyabani ile aynı yeteneklere sahiptir. Her gündüz tartışmasında gizli kelimeyi en az bir kez söylemelidir. Varsayılan kelime "gulyabani"dir; "her gün yeni kelime" açıksa sistem her sabah bir kelime listesinden yeni bir kelime seçer ve yalnızca Boşboğaz'a ve moderatöre gösterir. Kelime Boşboğaz tarafından gündüz sohbetine ayrı bir sözcük olarak yazılırsa (Türkçe büyük/küçük harf farkı gözetilmeden) moderatör ekranındaki onay kutusu kendiliğinden işaretlenir; sesli söylendiyse moderatör elle işaretler. Kutu standart gece başında boşsa Boşboğaz ölür; ölümü o sabah açıklanır ve o gecenin sonraki adımlarında yer almaz.
- **FR10.2 Bekçi:** Her gece kendisi dışında yaşayan bir oyuncuyu yoklar ve onun gulyabani olup olmadığını öğrenir; Boşboğaz da "gulyabani" çıkar. Sonucu yalnızca Bekçi ve moderatör görür.
- **FR10.3 Ürkek:** 2. geceden itibaren gulyabani adımında dilerse "pencereden bak" seçeneğini kullanır ve o gece yaşayan gulyabanilerin kim olduğunu görür. Baktığında ayardaki olasılıkla (varsayılan %50) gulyabanilerin ekranına uyarı düşer; uyarı varsayılan olarak isim içermez ("Pencerede bir gölge var"), ayar açıksa ismi içerir.
- **FR10.4 Ahbaplar:** İki ahbap ilk gece birbirini tanır ve ikisinin de köylü olduğunu bilir; birbirlerinin isminin yanında yalnızca kendi ekranlarında "Ahbap" rozeti görünür.
- **FR10.5 Celalli Damat:** Gece kaçırılarak ya da gündüz infaz edilerek ölürse, süresi içinde (varsayılan 30 sn) yaşayan bir kişiyi seçip yanında götürür; seçilen kişi hangi taraftan olursa olsun ölür ve zincir onun için de işler. Süre dolarsa kimseyi götürmez. Başka bir yolla ölürse (oyundan çıkarılma, sevdalı ölümü, Celalli Damat'ın kendisi) yeteneği tetiklenmez.
- **FR10.6 Dertli:** Dert süresi içinde (varsayılan 2. gündüzün sonuna kadar) gece kaçırılır ya da gündüz infaz edilirse oyunu tek başına kazanır ve oyun hemen biter. Süre geçince normal Köylü olarak devam eder. Başka bir yolla ölmesi kazandırmaz. Moderatör Dertli süre göstergesini görür.
- **FR10.7 Görücü:** İlk gece iki farklı oyuncuyu (kendisi dahil olabilir) birbirine sevdalı eder; süre dolarsa sevdalı çift oluşmaz. Kendisi sevdalılardan biri değilse sonra normal Köylü gibi oynar.
- **FR10.8 Sevdalılar:** İlk gece birbirini tanır ama birbirinin rolünü görmez; isimlerinin yanında yalnızca kendi ekranlarında "Sevdalı" rozeti görünür. Biri ölürse diğeri hemen ölür ve kartı açılır. Biri Gulyabaniler tarafında, diğeri değilse (karışık çift) ikisinin amacı köyde sağ kalan son iki kişi olmaktır.

Kabul ölçütleri:
- **Diyelim ki** Bekçi Boşboğaz'ı yokladı, **O zaman** sonuç "gulyabani" olur **Ve** sonuç yalnızca Bekçi'ye ve moderatöre ulaşır. (tarif §16)
- **Diyelim ki** Boşboğaz gündüz gizli kelimeyi ne yazdı ne söyledi (kutu boş), **Eğer ki** gece başlarsa, **O zaman** Boşboğaz ölür. (tarif §16)
- **Diyelim ki** 1. gecedeyiz, **O zaman** Ürkek "pencereden bak" seçeneğini görmez; 2. gecede görür. (tarif §16)
- **Diyelim ki** Celalli Damat infaz edildi ve sevdalılardan birini seçti, **O zaman** seçilen kişi ölür **Ve** onun sevdalısı da ölür. (tarif §16)
- **Diyelim ki** Dertli 2. gündüzün sonuna kadar infaz edildi, **O zaman** herkesin ekranında "Dertli kazandı" görünür **Ve** oyun biter. (tarif §16)

### FR11 — Kazanma kontrolü ve oyun sonu ekranı

Kaynak: intent-statement, scope-document (Oyun sonu), IB-02, tarif §11, W-11, F-08.

- **FR11.1** Kazanma kontrolü her ölüm zincirinin sonunda şu sırayla yapılır: (1) Dertli dert süresi içinde kaçırıldıysa ya da infaz edildiyse tek başına kazanır; (2) karışık sevdalı çift sağ kalan son iki kişiyse ikisi kazanır; (3) tüm gulyabaniler öldüyse Köylüler kazanır; (4) Gulyabaniler tarafı dışındaki herkes öldüyse ya da erken bitiş açıkken yaşayan gulyabani sayısı yaşayan diğerlerinin sayısına eşit veya fazlaysa Gulyabaniler kazanır; (5) oyun kimin zaferiyle biterse bitsin iki sevdalı da hayattaysa onlar da kazananlar arasında gösterilir.
- **FR11.2** Oyun sonunda herkesin ekranında kazanan taraf, varsa sevdalılar, herkesin rolü, ahbaplar ve gece olay günlüğü açılır.

Kabul ölçütleri:
- **Diyelim ki** son gulyabani infaz edildi ve sevdalısı yok, **O zaman** "Köylüler kazandı" ekranı herkeste görünür **Ve** tüm roller açılır.
- **Diyelim ki** erken bitiş açık, 2 gulyabani ve 2 köylü yaşıyor, **O zaman** Gulyabaniler kazanır.
- **Diyelim ki** karışık bir sevdalı çift sağ kalan son iki kişi, **O zaman** ikisi kazanır (Gulyabaniler kazanmaz).

### FR12 — Mezarlık

Kaynak: intent-statement, scope-document (Mezarlık), IB-09, tarif §8, §16, W-10, F-06, [Q5].

- **FR12.1** Ölen oyuncu kendiliğinden mezarlığa geçer; oyunu canlı izler (fazlar, oylamalar, açılan kartlar) ve yaşayanların sohbetini okur ama yazamaz.
- **FR12.2** Mezarlık Sohbeti'nde ölüler birbirleriyle yazışır; yaşayanlar bu kanalı göremez. Moderatör salt okunur görür.
- **FR12.3** Hayalet modu açıkken (varsayılan) ölüler tüm rolleri ve gece olaylarını görür; kapalıyken yalnızca herkese açık bilgileri görür.
- **FR12.4** Oyuncu listesinde ölen oyuncu gri/pasif görünür ve isminin altında açılmış rolü yazar.

Kabul ölçütleri:
- **Diyelim ki** bir oyuncu öldü, **O zaman** mezarlığa geçer **Ve** yaşayanların sohbetine yazamaz **Ve** yaşayanlar Mezarlık Sohbeti'ni göremez. (tarif §16)
- **Diyelim ki** hayalet modu kapalı, **O zaman** ölü bir oyuncunun tarayıcısına yaşayan oyuncuların açılmamış rolleri gönderilmez.

### FR13 — Moderatör ekranı

Kaynak: intent-statement (İnsan moderatör), scope-document, IB-02, tarif §7, §8, W-09, F-04, rough-mockups inceleme notu R-01.

- **FR13.1** Moderatör ekranı mevcut fazı/adımı, okunacak anons metnini, beklenen işlemi ve durumunu, "Sonraki Adım" düğmesini; tüm oyuncuları rolleri, yaşam durumları, rozetleri (sevdalı, ahbap, boşboğaz) ve "kopuk" durumlarıyla; gece olay günlüğünü; gulyabani sohbetinin salt okunur görünümünü; Boşboğaz onay kutusunu ve günün gizli kelimesini; Dertli süre göstergesini ve süre uzat/duraklat düğmelerini gösterir.
- **FR13.2** Telefonda Akış / Oyuncular / Günlük / Sohbet sekmeleri, bilgisayarda yan yana sütunlar kullanılır. (W-09)
- **FR13.3** Moderatör gündüz sohbetine yazabilir; gulyabani sohbetini ve Mezarlık Sohbeti'ni yalnızca okur. Şikayet edilen mesajlar moderatörün Sohbet sekmesinde işaretli görünür.
- **FR13.4** İlk gece anonsu, gece sırasının yalnızca ekranda görüneceğini (titreşim ve ses olmadığını) oyunculara hatırlatan bir cümle içerir. [Q14]

Kabul ölçütleri:
- **Diyelim ki** gece Bekçi adımındayız, **O zaman** moderatör anons metnini, "Bekçi seçimi: bekleniyor" durumunu ve kalan süreyi görür.
- **Diyelim ki** gündüz oylaması sürüyor, **O zaman** moderatör kimin oy verdiğini ve kimin vermediğini görür.

### FR14 — Bağlantı, yeniden bağlanma ve süreklilik

Kaynak: intent-statement, scope-document (Bağlantı), IB-03, tarif §15, §16, W-13, F-07, RSK-01, C-09, [Q6], [Q7], [Q10], [Q15].

- **FR14.1** Oyuncunun oturum belirteci tarayıcıda saklanır. Sayfa yenilendiğinde ya da kapatılıp aynı linkle açıldığında oyuncu aynı rol, aynı ekran ve aynı durumla döner.
- **FR14.2** Bağlantı koptuğunda ekranda "Yeniden bağlanılıyor" şeridi, geri geldiğinde "Tekrar oyundasın" görünür. Bağlantı 60 saniyede kurulamazsa "Bağlanamadık. İnternetini kontrol edip sayfayı yenile." yazar. Şeritte "Sorun bildir" düğmesi bulunur (FR17.5).
- **FR14.3** Moderatör ekranında kopuk oyuncunun yanında "kopuk" yazar; oyuncu dönünce kalkar.
- **FR14.4** Kopan oyuncunun kendisinin bir şey yapması gereken her adımda (oy, gece seçimi, son söz, Celalli Damat seçimi) o adımın süresi kendiliğinden en fazla 5 dakikaya uzar. Oyuncu dönerse kaldığı yerden devam eder. Dönmezse adım onsuz biter: oyu sayılmaz, gece seçimi boş geçer; oylar onda toplanırsa infaz edilir. Sonraki gece ya da gündüz başladığında hâlâ kopuksa moderatörün ekranında "X hâlâ kopuk, oyundan çıkarılsın mı?" uyarısı çıkar; karar moderatöründür ve çıkarılırsa FR15.2 geçerlidir. [Q7] [Q15]
- **FR14.5** Moderatörün bağlantısı koparsa oyun ve tüm sayaçlar duraklar, oyunculara "Moderatör bekleniyor" yazar. Moderatör aynı linkle dönünce oyun kaldığı yerden sürer; oda silinene kadar beklenir. [Q6]
- **FR14.6** Sunucu yeniden başlarsa (güncelleme ya da arıza) süren oyunlar kaybolmaz: kabul edilmiş her işlem (oy, seçim, faz geçişi) korunur, oyuncular aynı linkle döner ve oyun kaldığı yerden sürer; sayaçlar kalan süreyle devam eder. [Q10]
- **FR14.7** Aynı oyuncu oyunu ikinci bir sekmede ya da cihazda açarsa son açılan bağlantı oyunu devralır; eski sekmede "Oyun başka bir pencerede açıldı" yazar.
- **FR14.8** Tüm süreler sunucuda bitiş zamanı olarak tutulur; istemciler geri sayımı sunucu saatine göre çizer.

Kabul ölçütleri:
- **Diyelim ki** oyuncu oyun sırasında sayfayı yeniledi, **O zaman** rolünü ve oyun durumunu kaybetmez. (tarif §16)
- **Diyelim ki** Ali oylama sırasında koptu, **Eğer ki** 5 dakika içinde dönmezse, **O zaman** oylama Ali'nin oyu olmadan biter **Ve** sonraki faz başlarken moderatöre "Ali hâlâ kopuk, oyundan çıkarılsın mı?" uyarısı çıkar.
- **Diyelim ki** moderatörün bağlantısı koptu, **O zaman** oyuncuların sayaçları durur **Ve** "Moderatör bekleniyor" görünür; moderatör dönünce sayaçlar kalan süreden devam eder.
- **Diyelim ki** gündüz oylaması sırasında sunucu yeniden başladı, **Eğer ki** oyuncular aynı linkle dönerse, **O zaman** önceden verilmiş oylar korunur **Ve** oylama kalan süreyle sürer.

### FR15 — Oyun sırasında oyuncu çıkarma

Kaynak: scope-document (Sohbet güvenliği), C-17, F-10, W-14, [Q8].

- **FR15.1** Moderatör oyun sırasında da, onay sorusundan sonra bir oyuncuyu çıkarabilir.
- **FR15.2** Oyun sırasında çıkarılan oyuncu ölmüş sayılır, kartı herkese açılır ve FR7.2'deki zincir kendi kurallarıyla işler (ör. sevdalısı ölür; çıkarılan oyuncunun kendi Celalli Damat ya da Dertli yeteneği tetiklenmez, FR10.5–FR10.6). Çıkarılan kişi "Moderatör seni odadan çıkardı." mesajını görür.
- **FR15.3** Çıkarılan kişinin oturumu geçersiz olur; aynı tarayıcıdan aynı odaya tekrar girmesi engellenir.

Kabul ölçütleri:
- **Diyelim ki** moderatör oyun sırasında bir sevdalıyı çıkardı, **O zaman** çıkarılanın kartı herkese açılır **Ve** diğer sevdalı da ölür **Ve** kazanma kontrolü yapılır.
- **Diyelim ki** çıkarılan kişi aynı tarayıcıdan linki tekrar açtı, **O zaman** odaya giremez **Ve** "Moderatör seni odadan çıkardı." mesajını görür.

### FR16 — Sohbet ve sohbet güvenliği

Kaynak: intent-statement, scope-document (Gündüz, Mezarlık, Sohbet güvenliği), IB-10, C-15, C-17, RSK-06, DEP-04, W-08, F-09, [Q12], [Q16].

- **FR16.1** Sohbet kanalları: gündüz sohbeti (gündüz yaşayanlar ve moderatör yazar, ölüler okur; gece kapalıdır), gulyabani sohbeti (yaşayan gulyabaniler yazar, moderatör okur), Mezarlık Sohbeti (ölüler yazar, moderatör okur). Son söz sırasında gündüz sohbetine yalnızca sanık yazar.
- **FR16.2** Bir mesaj en fazla 300 karakterdir; boş mesaj gönderilmez; mesajdaki biçimlendirme ve kod işaretleri çalıştırılmaz, düz metin olarak gösterilir.
- **FR16.3** Kelime filtresi tüm sohbet kanallarına uygulanır: listedeki bir kelimenin ilk ve son harfi açık kalır, aradaki harfler "*" ile gösterilir (ör. "k***t"); mesajın kalanı olduğu gibi gider. Karşılaştırma Türkçe büyük/küçük harf farkı gözetilmeden yapılır. Listedeki bir kelimeyi içeren nick kabul edilmez (FR1.4). [Q12]
- **FR16.4** Oyuncu bir mesaja uzun basarak (klavyede mesajın menü düğmesiyle) "Şikayet et" seçer; isteğe bağlı olarak neden şikayet ettiğine dair bir not yazar ve onaylar. "Şikayetin alındı" mesajı görünür; şikayet moderatörün Sohbet sekmesinde görünür. Kişi kendi mesajını şikayet edemez; aynı kişinin aynı mesaja ikinci şikayeti yeni kayıt oluşturmaz.
- **FR16.5** Şikayet kaydı şunları içerir: şikayet edilen mesajın metni, mesajı yazanın nick'i, hangi odada ve hangi sohbette (kime) yazıldığı, mesajın zamanı, şikayet edenin nick'i, şikayet zamanı ve şikayet edenin notu. Mesaj metni ve not 1 ay sonra kendiliğinden silinir; kalan bilgiler ("kim, kimi, ne zaman, hangi sohbette şikayet etti") diğer kayıtlar gibi 1 yıl saklanır. Bu, sohbetlerin 24 saatte silinmesi kuralına sahibin onayladığı yazılı istisnadır. [Q12] [Q16]

Kabul ölçütleri:
- **Diyelim ki** filtre listesinde "kelime" var, **Eğer ki** bir oyuncu "Bu bir KELİME testi" yazarsa, **O zaman** herkes "Bu bir K****E testi" görür.
- **Diyelim ki** Can, Ali'nin mesajını not yazarak şikayet etti, **O zaman** kayıtta mesaj metni, yazan, sohbet kanalı, zamanlar ve not bulunur **Ve** 1 ay sonra metin ile not silinir, diğer alanlar kalır.
- **Diyelim ki** gece oldu, **Eğer ki** yaşayan bir köylü gündüz sohbetine yazmaya çalışırsa, **O zaman** mesajı gönderilmez.

### FR17 — Oyun sonu, yeni oyun ve geri bildirim

Kaynak: intent-statement (Geri bildirim), scope-document, IB-13, W-11, W-13, F-07, F-08, [Q9].

- **FR17.1** Oyun sonu ekranı FR11.2'deki bilgileri gösterir.
- **FR17.2** Oyun bitince moderatör "Yeni oyun" diyebilir: aynı oda, aynı oyuncular ve son rol havuzu/ayarlarla lobiye dönülür; bekleme ekranındakiler lobiye alınır. Odanın 24 saatlik süresi yeni oyunla sıfırlanmaz; oda kurulduktan 22 saat sonra "Oyunu Başlat" pasif olur ve "Oda süresi dolmak üzere, yeni oda kur" yazar. [Q9]
- **FR17.3** Oyun sonunda "Oyun nasıldı?" sorusu kötü / orta / iyi yüzleriyle ve isteğe bağlı açıklama alanıyla (en fazla 1.000 karakter) sorulur; gönderilince "Teşekkürler!" görünür. Gönderilemezse seçim ve metin korunur, "Tekrar dene" çıkar.
- **FR17.4** İsteyen oyuncu "Öneri/Şikayet yaz" ile ayrı bir metin (en fazla 1.000 karakter) gönderebilir.
- **FR17.5** Bağlantı uyarısı şeridindeki "Sorun bildir" düğmesi, kopma geri bildirimini isteğe bağlı kısa bir açıklamayla kayda düşürür.

Kabul ölçütleri:
- **Diyelim ki** oyun bitti ve bir kişi bekleme ekranında, **Eğer ki** moderatör "Yeni oyun" derse, **O zaman** herkes ve bekleyen kişi aynı odanın lobisine geçer **Ve** son ayarlar korunur.
- **Diyelim ki** memnuniyet geri bildirimi ağ hatası yüzünden gönderilemedi, **O zaman** seçilen yüz ve yazılan metin silinmez **Ve** "Tekrar dene" görünür.

### FR18 — Rehber

Kaynak: intent-statement, scope-document (Rehber), IB-15, tarif §14, §16, W-12, F-11.

- **FR18.1** Rehber ana sayfadan, lobiden ve oyun içinden (alt menüde "Rehber", oyunu durdurmadan açılan bir katman olarak) açılır.
- **FR18.2** Kartlar sekmesi: tüm v1 karakterlerinin galerisi, taraf filtreleri (Gulyabaniler / Köylüler / Bağımsızlar); karta dokununca büyük görsel, taraf, tam yetenek açıklaması, ne zaman uyandığı, kazanma koşulu ve kısa strateji ipucu. Oda içinde açılınca "Bu odada aktif roller" filtresi seçili gelir, kapalı roller soluk görünür. Tılsım filtresi yoktur.
- **FR18.3** Nasıl Oynanır sekmesi: 1 ekranlık özet; adım adım resimli anlatım (Odaya katıl → Kartına bak → Gece → Sabah haberi → Meydan toplantısı → Oylama → Son söz → İnfaz → Kazanan); sık sorulanlar (ör. "Rolümü söyleyebilir miyim?", "Öldüm, ne yapacağım?", "Sayfam kapandı?", "Gece sıramı nasıl anlarım?").
- **FR18.4** Moderatör Rehberi sekmesi: her fazda ne yapılacağı, örnek anons metinleri, ayarların açıklamaları ve sık hatalar.
- **FR18.5** Rehberdeki karakter açıklamaları oyunun kullandığı kart veri kaynağından üretilir.
- **FR18.6** Rehber hiçbir zaman kimin hangi rolde olduğunu göstermez.

Kabul ölçütleri:
- **Diyelim ki** odada yalnızca Gulyabani, Köylü ve Bekçi açık, **Eğer ki** oyun içinde Rehber'in Kartlar sekmesi açılırsa, **O zaman** bu üç rol vurgulu, diğerleri soluk görünür. (tarif §16)
- **Diyelim ki** kart veri kaynağında Bekçi'nin yetenek metni değişti, **O zaman** Rehber'deki Bekçi açıklaması ayrı bir düzenleme yapılmadan aynı metni gösterir.

### FR19 — Kart tasarımları

Kaynak: scope-document (Kart tasarımları), IB-16, tarif §13, C-18.

- **FR19.1** 9 karakterin her biri için ön yüz ve herkeste aynı bir arka yüz bulunur. Çizimler linol baskı üslubunda sade vektör (SVG) çizimlerdir ve v1'in tam illüstrasyonu sayılır.
- **FR19.2** Ön yüz yapısı: üstte karakter adı, ortada illüstrasyon, altta taraf etiketi ve simgesi, en fazla 2 satır yetenek metni, italik tek satırlık atmosfer sözü. Çerçeve taraf rengindedir (Gulyabaniler kızıl, Köylüler çivit mavisi, Bağımsızlar mor) ve taraf ayrıca simgeyle ayırt edilir.
- **FR19.3** Arka yüz: sisli köy silueti, dolunay, ortada kilim motifli madalyon.
- **FR19.4** Kartların isim, metin ve görselleri özgündür; kutu oyununun isim, metin ve görselleri kullanılmaz. Görsel dosya yolları kart veri kaynağında tutulur.

Kabul ölçütleri:
- **Diyelim ki** kartlar renk körlüğü simülasyonuyla görüntülendi, **O zaman** her kartın tarafı simgesinden ayırt edilebilir.
- **Diyelim ki** bir kartın metin kontrastı ölçüldü, **O zaman** normal metinde en az 4.5:1'dir.

### FR20 — Kayıtlar ve veri saklama

Kaynak: intent-statement (Kayıtlar, Saklama), scope-document (Kayıtlar), IB-12, C-14, C-15, RSK-05, intent-capture inceleme notu R-07, [Q11], [Q16].

- **FR20.1** Sunucu şu olayları kaydeder: odaya giriş ve çıkış; oda kurma; oyun başlangıcı (oyuncu sayısı, açık roller, ayarlar); faz geçişleri; oylar ve gece seçimleri; ölümler ve nedenleri; oyun sonu (süre, kazanan taraf); kopma ve geri gelmeler (süreleriyle); moderatör duraklatma/uzatma ve oyuncu çıkarma işlemleri; memnuniyet geri bildirimi; öneri/şikayet metni; "Sorun bildir"; mesaj şikayetleri (FR16.5).
- **FR20.2** Her kayıt zaman, oda kodu, oyuncunun nick'i, cihaz türü, tarayıcı ve ülke bilgisini içerir. IP adresi hiçbir kayıtta, veritabanında ya da sunucu günlüğünde saklanmaz; ülke bağlantı anında belirlenir ve IP saklanmadan atılır. Sohbet mesajlarının içeriği kayda yazılmaz (tek istisna FR16.5).
- **FR20.3** Kayıtlar ve geri bildirimler 1 yıl sonra kendiliğinden silinir.
- **FR20.4** Odalar ve sohbetler, oda kurulduktan 24 saat sonra kendiliğinden silinir.
- **FR20.5** v1 raporu yalnızca sahibe özel sayılar üretir (FR21); oyunculara gösterilen oyun geçmişi ya da istatistik ekranı yoktur (v2).

Kabul ölçütleri:
- **Diyelim ki** bir oyun oynandı, **Eğer ki** veritabanı ve tüm sunucu günlükleri IP adresi biçimleri için taranırsa, **O zaman** hiçbir IP adresi bulunmaz. (C-14)
- **Diyelim ki** bir oda 24 saat önce kuruldu, **O zaman** oda ve sohbetleri artık sorgulanamaz. (C-15)
- **Diyelim ki** bir kayıt 1 yıldan eski, **O zaman** silinmiştir; 1 yıldan yeni kayıtlar durur.

### FR21 — Sahibe rapor

Kaynak: intent-statement (Raporlar, Başarı Ölçütleri), scope-document (Rapor), IB-14, F-12, [Q13].

- **FR21.1** Sahibi sunucuda bir komut çalıştırarak, verdiği tarih aralığı için Türkçe bir rapor dosyası üretir; raporun ekranı yoktur.
- **FR21.2** Rapor şunları içerir: sayılan oyun sayısı (en az 3 oyuncu + moderatör, kazanan ilan edilene kadar oynanmış oyunlar); en az 6 oyunculu sorunsuz oyun sayısı (Niyet Analizi'ndeki tanımla); oyun süreleri (en kısa, ortalama, en uzun); kopma sayısı; memnuniyet ortalaması ve geri bildirim sayısı; öneri/şikayet sayısı; mesaj şikayeti sayısı.

Kabul ölçütleri:
- **Diyelim ki** dönem içinde 3 tam oyun ve 1 yarıda bırakılmış oyun var, **Eğer ki** rapor üretilirse, **O zaman** oyun sayısı 3 olur.
- **Diyelim ki** 6 oyunculu bir oyunda bir oyuncu 10 saniyeliğine koptu, **O zaman** o oyun sorunsuz oyun sayısına girmez.
- **Diyelim ki** dönemde hiç geri bildirim yok, **O zaman** memnuniyet ortalaması "veri yok" yazar (0 değil).

## İşlevsel Olmayan Gereksinimler

- **NFR1 — Tepki süresi:** Bir oyuncunun işlemi (oy, seçim, mesaj) diğer ilgili ekranlara, normal bir mobil bağlantıda, işlemlerin %95'inde 1 saniye içinde yansır; bu, NFR2'deki yük altında ölçülür. (C-08; varsayım A20)
- **NFR2 — Ölçek:** Tek ücretsiz sunucu aynı anda 50 odayı, oda başına 26 oyuncu + moderatörle (yaklaşık 1.350 eşzamanlı bağlantı) NFR1'i bozmadan taşır; bir yük testiyle doğrulanır. (C-08, ASM-02, RSK-02)
- **NFR3 — Maliyet:** Aylık işletme maliyeti sıfırdır; yalnızca ücretsiz kullanım hakları kullanılır; ücretsiz sınır aşılırsa yalnızca ayda birkaç dolarlık aşım kabul edilir ve bunun için harcama uyarısı kurulur. (C-01, C-02, RSK-03; proje kuralları)
- **NFR4 — Yeniden bağlanma:** Ağ geri geldikten sonra oyuncu en fazla 5 saniye içinde aynı ekrana ve duruma döner. Android Chrome ve iPhone Safari'de başka uygulamaya geçip dönme, ekran kilidi sonrası dönme ve mobil veriyle bağlanma gerçek telefonlarda elle denenir. (RSK-01, team-practices Walking Skeleton)
- **NFR5 — Dayanıklılık:** Sunucu yeniden başladığında kabul edilmiş hiçbir işlem kaybolmaz; oyunlar yeniden başlatmadan sonra en fazla 1 dakika içinde oyuncuların dönmesine hazırdır. [Q10]
- **NFR6 — Erişilebilirlik (hizmet):** Oyun, 30 günlük kayan pencerede en az %99 oranında erişilebilir. (varsayım A21)
- **NFR7 — Güvenlik:** Oyun durumu ve kurallar yalnızca sunucuda işletilir; istemciden gelen her istek (oy, seçim, mesaj, ayar) sunucuda sırasına, oyuncunun rolüne ve durumuna göre doğrulanır. Aynı anda gelen oy ve seçimlerde hiçbir işlem sessizce kaybolmaz. Bağlantılar yalnızca şifreli (HTTPS/WSS) yapılır. Oturum belirteçleri tahmin edilemez. Mesaj gönderimi oyuncu başına 10 saniyede en fazla 5 mesajla, oda koduyla katılma denemeleri bağlantı başına dakikada en fazla 10 denemeyle sınırlanır. Sırlar (şifre, anahtar) koda ya da depoya yazılmaz, ortam değişkeninde veya sır yöneticisinde tutulur. (tarif §15, C-07; proje kuralları)
- **NFR8 — Gizli bilgi:** Hiçbir istemciye, o oyuncunun görmeye hakkı olmayan bilgi (başkalarının rolü, rozetleri, gece sonuçları, gizli kelime, gulyabani sohbeti, Mezarlık Sohbeti, hayalet modu kapalıyken açılmamış roller) hiçbir mesajda gönderilmez. Görünürlük kuralları aşağıdaki tablodadır ve otomatik testle sınanır. (C-07, tarif §15–§16)

| Bilgi | Kim görür |
|---|---|
| Kendi rolü | Oyuncunun kendisi, moderatör |
| Başka oyuncuların rolü | Moderatör; ölüm ya da çıkarılmayla açılan roller herkes; hayalet modu açıkken ölüler; oyun sonunda herkes |
| Gulyabanilerin kimliği | Gulyabaniler (birbirini), moderatör, o gece bakan Ürkek |
| Sevdalı / Ahbap rozeti | İlgili iki oyuncu, moderatör; oyun sonunda herkes |
| Bekçi sonucu | Bekçi, moderatör |
| Gizli kelime | Boşboğaz, moderatör |
| Ürkek uyarısı | Gulyabaniler, moderatör |
| Gulyabani işaretleri ve sohbeti | Yaşayan gulyabaniler, moderatör |
| Mezarlık Sohbeti | Ölüler, moderatör |
| Oylar | Oylar canlıysa herkes anında, değilse oylama bitince herkes |
| Gece olay günlüğü | Moderatör; hayalet modu açıkken ölüler; oyun sonunda herkes |

- **NFR9 — Erişilebilirlik (arayüz):** Arayüz WCAG 2.1 AA'nın tamamına uyar: metin kontrastı en az 4.5:1 (büyük metin ve arayüz parçaları en az 3:1, iki temada da); taraf renkle birlikte simgeyle ayırt edilir; dokunma alanları en az 44x44 piksel ve aralarında en az 8 piksel boşluk; her işlev klavyeyle yapılabilir ve odak her zaman görünür; faz değişimi ve yeni sohbet mesajı ekran okuyucuya duyurulur; hareket azaltma tercihinde animasyon olmaz. **Tek istisna:** gece sırası gelen oyuncu için "sıra sende" ekran okuyucu duyurusu yapılmaz (sahibin onayladığı bilinçli sapma; gizliliği korumak için). CI'da otomatik erişilebilirlik taraması çalışır; ekran okuyucu ve klavye denemesi elle yapılır. [Q17] (wireframes Genel İlkeler, rough-mockups inceleme notları R-04, R-05, team-practices; proje kuralları)
- **NFR10 — Cihaz ve tarayıcı:** Arayüz mobil önceliklidir ve 320 piksel genişlikten itibaren yatay kaydırma olmadan kullanılır. Desteklenen tarayıcılar: Android Chrome, iPhone Safari (iOS 16 ve sonrası), masaüstü Chrome, Firefox, Edge ve Safari'nin son iki ana sürümü. Desteklenmeyen tarayıcıda kısa bir uyarı görünür. (C-09; varsayım A22)
- **NFR11 — Dil:** Kullanıcıya görünen tüm metinler Türkçedir ve koddan ayrı bir metin dosyasında tutulur. (C-09, team-practices Code Style)
- **NFR12 — Test edilebilirlik ve bakım:** Oyun motoru (rol dağıtımı, rol havuzu doğrulaması, gece çözümü, ölüm zinciri, oylama çözümü, kazanma kontrolü) altyapıdan bağımsız, saf ve test edilebilir bir modüldür. Roller ve rehber metinleri tek bir veri kaynağında tanımlanır ve yeni roller veri olarak eklenebilir. Satır kapsamı tüm kodda en az %80, oyun kuralı kodunda en az %90'dır; testlerden biri başarısızsa ya da kapsam bu sınırın altındaysa değişiklik `main`'e eklenmez. Bot oyuncuların farklı rol havuzu kombinasyonlarında tam bir oyunu baştan sona oynadığı otomatik uçtan uca test bulunur. (tarif §15–§16, scope-document Otomatik test, IB-04, team-practices Testing Posture)
- **NFR13 — Gözlemlenebilirlik:** Sunucunun bir sağlık kontrolü adresi vardır (çalışıyor mu); en az şu ölçümler tutulur: etkin oda sayısı, eşzamanlı bağlantı sayısı, hata sayısı. Sunucu hata günlükleri IP içermez. (operation kuralları, C-14)
- **NFR14 — Zaman doğruluğu:** İstemcide gösterilen geri sayım, sunucudaki bitiş zamanından en fazla 1 saniye sapar. (tarif §7)
- **NFR15 — Rastgelelik:** Rol dağıtımı, Ürkek'in fark edilme olasılığı, gulyabani kararındaki eşitlik ve günün gizli kelimesi kriptografik olarak güvenli rastgelelikle belirlenir. (tarif §5.3)

## Kısıtlar

- Bütçe: aylık işletme maliyeti sıfır, yalnızca ücretsiz haklar; kart tanımlı hesapta ayda birkaç dolarlık aşım kabul. (C-01, C-02)
- Sabit yayın tarihi yok; kapsam tarihe sığdırmak için kısılmaz. (C-03)
- Önce ücretsiz alt adres; kendi alan adı ileride. (C-04)
- Yalnızca v1; v2 maddeleri yapılmaz. (C-05)
- 3–26 oyuncu + moderatör. Tarifteki "6–26 oyuncu" aralığı, niyet beyanında sahibin kararıyla "en az 3 oyuncu, 6 altında uyarı" olarak değiştirildi. (C-06, intent-statement)
- Oyun durumunu sunucu yönetir. (C-07)
- Aynı anda yaklaşık 50 oda; boşta maliyet yaklaşık sıfır. (C-08)
- Mobil öncelikli, Türkçe, karışık katılım (bilgisayar + telefon ya da tek telefon). (C-09)
- Barındırma: tek ücretsiz Oracle Cloud sunucusu (Azure yedek); ayrı deneme ortamı yok. Tarifteki AWS sunucusuz tercihi, fizibilite aşamasında C-10 ile geçersiz kaldı; kesin teknoloji seçimi tasarım aşamalarında yapılır. (C-10, ISS-02, team-practices Deployment)
- Tek kişilik, AI destekli geliştirme ve bakım; en sade çözüm seçilir. (C-11)
- Bulut hesabı ve alan adı yok; Oracle hesabı yapım aşamasının en başında açılır. (C-12, DEP-01, team-practices)
- IP saklanmaz; kayıtlar 1 yıl, odalar ve sohbetler 24 saat; KVKK bilgilendirmesi. (C-14, C-15, C-16)
- Moderatörün oyuncu çıkarması, kelime filtresi ve mesaj şikayeti birlikte v1'de. (C-17)
- Kartlar ve metinler özgün; "Gulyabani" adı kullanılabilir. (C-18)
- Çalışma biçimi: tek ana dal, parça başına geçici dal ve squash, PR yok, canlıya çıkış sahibin onayı ve sürüm etiketiyle; önce yürüyen iskelet (yalnızca Gulyabani ve Köylü), Oracle sunucusunda dış adreste. (team-practices)

## Varsayımlar

Bu varsayımlar sorulmadı; makul varsayılan olarak yazıldı. Onay kapısında düzeltilebilir.

| ID | Varsayım | Gerekçe |
|---|---|---|
| A1 | Görücü, Bekçi ve Ürkek seçimleri için varsayılan süre 60 sn | Tarifte bu adımlar için süre yok; gulyabani kararından (90 sn) kısa, tek kişilik seçim için yeterli |
| A2 | Gulyabani kararında eşitlik varsayılanı "eşitler arasında rastgele"; hiç işaret yoksa kimse kaçırılmaz | Tarif §9 iki seçenek veriyor; rastgele, oyunun akmasını sağlar |
| A3 | Görücü süresinde seçim yapmazsa sevdalı çift oluşmaz | Süre dolunca seçimin boş geçmesi kuralıyla (FR5.7) tutarlı |
| A4 | Bekçi kendini yoklayamaz | Kendini yoklamak bilgi vermez |
| A5 | 3–5 oyuncu için önerilen gulyabani sayısı 1 | Tarif tablosu 6'dan başlıyor; en az oyuncu kuralı 3'e indirildi |
| A6 | Ölü rolün adımı rastgele 8–15 sn sonra atlanır | Tarif "kısa bir bekleme" diyor; sabit süre ipucu verir |
| A7 | Bekleme ekranındakiler 26 oyuncu sınırına dahildir | Yeni oyunda lobiye alındıklarında sınır aşılmasın diye |
| A8 | Çıkarılan kişi aynı tarayıcıdan aynı odaya tekrar giremez; farklı cihazla girmesi engellenemez (hesap yok) | Hesapsız sistemde tam engel mümkün değil |
| A9 | Aynı oyuncu iki sekmede açarsa son açılan devralır | Telefondan bilgisayara geçişi destekler, çift işlemi önler |
| A10 | Oda süresi yeni oyunla sıfırlanmaz; oda kurulduktan 22 saat sonra yeni oyun başlatılamaz | 24 saat silme kuralı (C-15) oyun ortasında odayı silmesin diye |
| A11 | Sohbet mesajı en fazla 300, geri bildirim metni en fazla 1.000 karakter | Telefonda okunabilirlik ve kötüye kullanım sınırı |
| A12 | Mesaj sınırı 10 sn'de 5 mesaj; kod deneme sınırı dakikada 10 | Taşkın ve oda kodu taramasına karşı |
| A13 | Moderatör gündüz sohbetine yazabilir; gulyabani sohbetini ve Mezarlık Sohbeti'ni yalnızca okur | Moderatör her şeyi görür ama gizli kanallara katılmamalı |
| A14 | Gündüz sohbeti gece kapalıdır | Gece herkes "uyur"; gizli kanallar dışında konuşma yok |
| A15 | Hayalet modu gulyabani sohbetini kapsamaz; ölüler gulyabani sohbetini okuyamaz | Tarif hayalet modunu "roller ve gece olayları" diye tanımlıyor |
| A16 | Celalli Damat ve Dertli yetenekleri yalnızca gece kaçırılma ve gündüz infazla tetiklenir; oyundan çıkarılma tetiklemez | Tarifteki rol metinleri yalnızca bu iki ölümü sayıyor; [Q8]'deki "zincir normal işler" rol kurallarıyla okunur |
| A17 | Karışık sevdalı çift: biri Gulyabaniler tarafında, diğeri değil | Tarif "biri gulyabani, diğeri köylü" diyor; bağımsızlar köylü tarafına yakın sayılır |
| A18 | Dert süresi bitmeden oyun biterse yaşayan Dertli kazanan sayılmaz | Dertli yalnızca ölerek kazanır |
| A19 | Boşboğaz'ın gizli kelimesi sohbette ayrı bir sözcük olarak geçerse (ekli halleri dahil değil) kendiliğinden işaretlenir; "her gün yeni kelime" için en az 30 kelimelik Türkçe bir liste kullanılır | Yanlış eşleşmeyi azaltır; liste içeriği Fonksiyonel Tasarım'da kesinleşir |
| A20 | NFR1'deki 1 saniye / %95 hedefi | Sosyal oyunun akıcı hissetmesi için yaygın hedef; yük testinde ölçülür |
| A21 | NFR6'daki %99 aylık erişilebilirlik hedefi (ayda en fazla ~7 saat kesinti) | Tek ücretsiz sunucu ve hobi projesi için gerçekçi |
| A22 | NFR10'daki tarayıcı listesi | Türkiye'de yaygın tarayıcılar; eski iOS sürümleri bağlantı sürekliliğini zayıflatır |
| A23 | Ülke bilgisi bağlantı anında IP'den belirlenir ve IP hemen atılır | C-14 ile "ülke kaydı" isteğini birlikte karşılar |

## Kapsam Dışı

- v2 listesi: tılsım kartları, "Ağız Bağlama" varyantı, Ebe Nine / Muhtar / Kahveci, otomatik (bot) moderatör, anonsların sesli okunması, oyunculara gösterilen geçmiş/istatistik ekranları. (C-05, scope-document)
- Rapor için ekran veya yönetici sayfası. (scope-document)
- Sosyal medya duyurusu ve paylaşım bağlantısı önizlemesi; ayrı çekirdek sürüm yayını; yayından önce ayrı arkadaş grubu denemesi. (scope-document)
- Kendi alan adı; IP adresinin saklanması; kutu oyununun isim, metin ve görselleri. (C-04, C-14, C-18)
- Oyun içinde sesli/görüntülü konuşma: oyuncular ayrı bir toplantı uygulaması kullanır (ASM-01 teyit edildi). [Q14]
- Gece sırası için titreşim, ses ve ekran okuyucu duyurusu. [Q14] [Q17]
- Hesap, şifre ve kalıcı kullanıcı profili. (tarif §3)
- Oyun sırasında moderatörlük devri. (tarif §4)

## Açık Sorular

- Oyunun nihai adı; yayından önce kararlaştırılacak. (ISS-01)
- Bulut sağlayıcısı ve teknoloji seçimi; tasarım aşamalarında. (ISS-02)
- Yayın aşamaları (ortam kurulumu, dağıtım, izleme) çalışma planında henüz yok. (ISS-03)
- Kelime filtresi için Türkçe küfür/hakaret listesinin kaynağı. (DEP-04)
- Ücretsiz sunucu kapasitesinin NFR2 yükünü taşıdığı, barındırma seçilirken ölçülerek doğrulanacak. (ASM-02)
- "Her gün yeni kelime" listesinin içeriği; Fonksiyonel Tasarım'da. (A19)

## Önceki İnceleme Notlarının Karşılığı

| Not | Karşılığı |
|---|---|
| intent-capture R-05 ("sorun" tanımı) | Niyet Analizi'ndeki sorunsuz oyun tanımı, FR21.2 [Q13] |
| intent-capture R-06 (şikayet ölçütü zayıf) | Niyet Analizi, FR21.2 [Q13] |
| intent-capture R-07 (kayıt listesi, v2 ayrımı, kişisel veri) | FR20, FR21 [Q11] |
| rough-mockups R-01 (moderatörün gündüz görünümü) | FR9.6, FR13.1 |
| rough-mockups R-02 (açık kalan noktalar) | FR1.6, FR14.4, FR14.5, FR15, FR16.3 [Q6]–[Q9], [Q12], [Q15] |
| rough-mockups R-03 (örnek veride ölü oyuncu) | Ayrıntılı Taslaklar'da düzeltilecek; gereksinim FR8.2, FR9.1 |
| rough-mockups R-04 (erişilebilirliğin iş listesine yansıması) | NFR9 |
| rough-mockups R-05 (erişilebilirlik–gizlilik ödünleşimi) | FR5.5, FR13.4, NFR9 [Q14], [Q17] |
| ASM-01 (görüntü ve ses ayrı uygulamada) | Teyit edildi; Kapsam Dışı [Q14] |
