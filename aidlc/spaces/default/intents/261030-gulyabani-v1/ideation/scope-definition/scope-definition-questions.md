# Kapsam Tanımı ve Önceliklendirme — Sorular

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.

Not: Sorular, onaylanan niyet beyanı (`ideation/intent-capture/intent-statement.md`), fizibilite değerlendirmesi (`ideation/feasibility/feasibility-assessment.md`), kısıt kaydı (`ideation/feasibility/constraint-register.md`) ve `gulyabani-koylu-intent.md` dosyası göz önüne alınarak hazırlandı. Daha önce cevaplanan konular (v1/v2 sınırı, bütçe, yayın tarihi, gizlilik, sohbet önlemleri, oyun adı) yeniden sorulmuyor. Lobi ayarlarının varsayılanları (ör. "ilk gece kimse kaçırılmaz", eşitlik kuralı) Gereksinim Analizi'nde sorulacak.

## Q1. [Ürün sahibi] v1 nasıl yayına çıksın?

v1 epey büyük bir iş (9 rol, mezarlık, rehber, kayıtlar, rapor...) ve sabit bir yayın tarihi yok. Hepsini bitirip tek seferde yayınlamak mı, yoksa önce oynanabilir bir çekirdek sürümü denemek mi istediğini bilmemiz gerekiyor; bu, işlerin sırasını belirler.

A. v1'in tamamı bitince tek seferde herkese açık yayınlanır
B. Önce oynanabilir bir çekirdek sürüm arkadaş grubuyla denenir; v1'in geri kalanı eklendikten sonra herkese açık yayın yapılır (başarı ölçütlerindeki "ilk ay" bu yayınla başlar)
C. Önce çekirdek sürüm herkese açık yayınlanır; v1'in geri kalanı sonradan eklenerek yayınlanır
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. [Ürün sahibi] Çekirdek sürümde başka neler olsun? (select all that apply)

Q1'de B veya C seçilirse geçerlidir. Çekirdek sürümde her durumda şunlar olur: oda kurma ve kodla katılma, moderatör ekranı, Gulyabani ve Köylü rolleri, gece/gündüz döngüsü, gündüz sohbeti, oylama–son söz–onay oylaması–infaz, kazanma kontrolü, yeniden bağlanma, gizlilik bilgilendirmesi, sohbet önlemleri (çıkarma, kelime filtresi, şikayet) ve kayıtlar. Aşağıdakilerden hangileri de çekirdekte olsun?

A. Özel rollerin tamamı (Boşboğaz Gulyabani, Bekçi, Ürkek, Ahbaplar, Celalli Damat, Dertli, Görücü ve sevdalılar)
B. Mezarlık (ölüler odası, izleme ve ölülerin sohbeti)
C. Rehber bölümü (kartlar, nasıl oynanır, moderatör rehberi)
D. Oyun sonu memnuniyet anketi, öneri/şikayet girişi ve basit rapor
X. Other (please specify)

[Answer]: A, B, C, D

## Q3. [Ürün sahibi] İşler hangi sırayla yapılsın?

Fizibilitede en büyük risk, telefonda başka uygulamaya geçince bağlantının kopması olarak kaydedildi (RSK-01). Sıralama, bu riskin ne zaman sınanacağını belirler.

A. Değer önce: önce baştan sona oynanabilen en basit oyun yapılır, kopma konusu sonra ele alınır
B. Risk önce: önce kopma ve yeniden bağlanma, gerçek telefonlarda denenerek çözülür; oyun kuralları sonra eklenir
C. İkisi birlikte: ilk iş en basit oynanabilir oyun yapılır ve ilk günden gerçek telefonlarda kopma/yeniden bağlanma ile birlikte denenir
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q4. [Ürün sahibi] Raporu nasıl göreceksin?

v1'de kayıtlardan basit bir rapor olacak (oyun sayısı, süreler, kopmalar, memnuniyet ortalaması). Oyunda üyelik/şifre yok; raporun oyunculara görünmemesi gerekiyor. Raporu görme şekli, yapılacak işin büyüklüğünü değiştirir.

A. Yalnızca senin girebileceğin, şifreyle korunan basit bir yönetici sayfası
B. Ekran olmadan: sunucuda bir komutla rapor dosyası üretilir (AI yardımıyla çalıştırırsın)
C. Kayıtlar tablo dosyası (CSV) olarak indirilir; rapor bir tablo programında hazırlanır
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q5. [Ürün sahibi] Oyunun tanıtımı bu çalışmanın içinde mi?

Hedef kitle linki bulan herkes; ilk ay ölçütü en az 5 tam oyun. Oyunun duyurulması (sosyal medya paylaşımları, tanıtım sayfası vb.) ayrı bir iş.

A. Hayır: link arkadaşlarla elle paylaşılır; tanıtım bu çalışmanın dışında
B. Yalnızca ana sayfada oyunu anlatan kısa bir tanıtım metni olsun; ayrıca duyuru yapılmaz
C. B'ye ek olarak sosyal medyada paylaşılabilir bir bağlantı önizlemesi (başlık, görsel) olsun
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q6. [Tasarım] Kart görselleri v1'de ne düzeyde olsun?

Intent dosyası (Bölüm 13) v1 kartlarının simge + kilim çerçeve + taraf rengiyle hazırlanabileceğini, tam illüstrasyonların sonradan eklenebileceğini söylüyor. Projede ayrı bir tasarımcı yok ve bütçe sıfır.

A. v1'de yalnızca simge + çerçeve + taraf rengi; tam illüstrasyonlar bu çalışmanın dışında (sonraki bir sürüm)
B. v1 simge + çerçeve + renkle yayınlanır; tam illüstrasyonlar bu çalışma içinde, ilk yayından sonra eklenir
C. v1'de baştan tam illüstrasyonlar olsun (AI ile görsel üretimi dahil)
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q7. [Geliştirici] Bot oyuncularla otomatik uçtan uca test v1'de olsun mu?

Intent dosyasının kabul kriterlerinde (Bölüm 16) "bot oyuncularla, farklı rol kombinasyonlarında tam bir oyunu baştan sona simüle eden otomatik test" var. Bu, oyunun tek başına bakımını kolaylaştırır ama ek iş demektir. (Bu, v2'deki "bot moderatör" ile aynı şey değildir; yalnızca test içindir.)

A. Evet, v1'de olsun: her değişiklikten sonra tam oyun otomatik olarak denenir
B. Daha basiti yeterli: oyun kurallarının otomatik testleri olsun; ekranlarla tam oyun simülasyonu v1 dışında kalsın
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q8. [Tasarım] Tam illüstrasyonları kim, nasıl üretecek?

Q6'da v1'de baştan tam illüstrasyon istedin; Q1'de de v1'in tek seferde yayınlanmasını seçtin. Bu durumda 9 kartın illüstrasyonları ve kart arka yüzü bitmeden yayın yapılmaz. Bütçe sıfır (C-01) ve görseller özgün olmalı, kutu oyununa benzememeli (C-18). Kodu yazan AI, fotoğraf benzeri resim üretemez; yalnızca çizim kodu (SVG) yazabilir.

A. Ben ücretsiz bir AI görsel aracıyla üretirim (tarifler intent dosyasının 13. bölümünden); görseller hazır olana kadar geliştirmede simge+çerçeve yer tutucu kullanılır, yayın için hepsi tamamlanmış olmalı
B. Kodu yazan AI, linol baskı üslubunda sade SVG çizimler hazırlar; bunlar v1'in tam illüstrasyonu sayılır
C. A gibi, ama yayın görsellere bağlanmaz: eksik kalan kart yer tutucu ile yayınlanır, görseli sonra eklenir
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q9. [Ürün sahibi] Yayından önce arkadaş grubuyla deneme yapılsın mı?

Q1'de v1'in tek seferde yayınlanmasını seçtin. Niyet beyanına göre oyunu ilk olarak sen ve arkadaş grubun deneyeceksiniz; güvenilirlik ölçütü de "en az 6 oyunculu bir oyunun kimse kopmadan sonuna kadar oynanması".

A. Evet: yayından önce arkadaş grubuyla en az 6 oyunculu bir tam deneme oyunu kimse kopmadan oynanır; bu yayına çıkış koşuludur. Deneme oyunları "ilk ay" sayımına girmez
B. Evet, deneme yapılır ama yayına çıkış koşulu değildir; yayından sonra da yapılabilir
C. Hayır, ayrı bir deneme yok; ilk oyunlar yayından sonra oynanır
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Consolidated Summary Confirmation

- Yayın şekli: v1'in tamamı bitince tek seferde herkese açık yayınlanır (Q1). Bu yüzden ayrı bir "çekirdek sürüm" yok; Q2'de seçilen özel roller, mezarlık, rehber, anket ve rapor zaten ilk yayında yer alır (Q2)
- Geliştirme sırası: İlk iş baştan sona oynanabilen en basit oyun (Gulyabani + Köylü) yapılır ve ilk günden gerçek telefonlarda kopma/yeniden bağlanma ile birlikte denenir; diğer parçalar bunun üzerine eklenir (Q3)
- Rapor: Ekran yok; sunucuda bir komutla rapor dosyası üretilir, AI yardımıyla çalıştırırsın (Q4)
- Tanıtım: Yalnızca ana sayfada oyunu anlatan kısa bir tanıtım metni; sosyal medya duyurusu ve bağlantı önizlemesi kapsam dışı (Q5)
- Kart görselleri: v1'de baştan tam illüstrasyon; kodu yazan AI, linol baskı üslubunda sade SVG çizimler hazırlar ve bunlar v1'in tam illüstrasyonu sayılır (Q6, Q8)
- Test: Bot oyuncularla, farklı rol kombinasyonlarında tam oyunu baştan sona deneyen otomatik test v1'de olur (Q7)
- Deneme: Yayından önce ayrı bir arkadaş grubu denemesi yapılmaz; ilk oyunlar yayından sonra oynanır (Q9)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
