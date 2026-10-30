# Fizibilite ve Kısıtlar — Sorular

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.

Not: Sorular, onaylanan niyet beyanı (`ideation/intent-capture/intent-statement.md`) ve `gulyabani-koylu-intent.md` dosyası göz önüne alınarak hazırlandı. Teknoloji ve bulut sağlayıcısı seçimi niyet beyanında açık konu olarak bırakıldığı için burada sorulmuyor; burada yalnızca o seçimi etkileyecek kısıtlar soruluyor.

## Q1. [Ürün sahibi] Aylık işletme bütçesi

Oyun herkese açık bir adreste yayınlanacak (niyet beyanı). Sunucu, veritabanı ve kayıtların 1 yıl saklanması küçük de olsa aylık bir maliyet doğurabilir. Bu bütçe, ileride hangi bulut hizmetinin seçilebileceğini doğrudan sınırlar.

A. Hiç para harcanmasın: yalnızca ücretsiz kullanım hakları (free tier) kullanılsın
B. Ayda en fazla yaklaşık 5 ABD doları
C. Ayda en fazla yaklaşık 20 ABD doları
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. [Ürün sahibi] Yayın için zaman hedefi

Başarı ölçütleri "yayından sonraki ilk ay" üzerinden tanımlı; ama yayının ne zaman olacağı belirlenmedi. Bir hedef tarih, v1'in ne kadarının ilk yayına sığacağını etkiler.

A. 1 ay içinde
B. 2–3 ay içinde
C. Sabit bir tarih yok; hazır olunca yayınlanır
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q3. [Ürün sahibi] Kişisel verilerin korunması (KVKK)

Site herkese açık olacak ve kayıtlarda nick, cihaz türü, tarayıcı, ülke, yapılan işlemler ve geri bildirim açıklamaları 1 yıl tutulacak (niyet beyanı). IP saklanmasa da bu bilgiler birlikte bir kişiyi tanımlayabilir ve Türkiye'deki kişisel veri yasası (KVKK) kapsamına girebilir; böyle durumlarda genellikle kısa bir gizlilik bilgilendirmesi (aydınlatma metni) gösterilir. (Bu bir hukuki görüş değildir; risk olarak kaydedilecektir.)

A. Ana sayfada ve odaya girişte kısa bir gizlilik bilgilendirmesi gösterilsin; kayıtlar niyet beyanındaki gibi tutulsun
B. Kayıtlarda nick yerine anlamsız bir oturum numarası tutulsun (kişisel veri en aza insin); yine de kısa bir bilgilendirme gösterilsin
C. Şimdilik bir şey yapılmasın; konu risk olarak kaydedilip yayından önce yeniden ele alınsın
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q4. [Ürün sahibi] Sohbette kötüye kullanım

Linki bulan herkes katılabilecek ve oyunda yazılı sohbet var (niyet beyanı). Hakaret veya uygunsuz içerik yazılması bir risk. Intent dosyasında moderatörün oyuncuyu odadan çıkarabilmesi zaten var.

A. Moderatörün oyuncuyu odadan çıkarabilmesi v1 için yeterli
B. A'ya ek olarak basit bir küfür/hakaret kelime filtresi olsun
C. A'ya ek olarak oyuncular bir sohbet mesajını şikayet edebilsin (şikayet kayıtlara düşsün)
D. Not yet defined
X. Other (please specify)

[Answer]: X. a, b ve c birlikte olsun. ortak a dan bir defaa olacak elbette.

## Q5. [Ürün sahibi] Oyun adı ve marka karışıklığı riski

Intent dosyası piyasada "Gulyabani" adlı bir kutu oyunu bulunduğunu (NeoTroy) belirtiyor ve onun isimlerinin, metinlerinin, görsellerinin kullanılmayacağını söylüyor. Gulyabani bir folklor varlığının adı olduğu için karakter adı olarak kullanmak sorun değil; ama oyunun adının da "Gulyabani" ile başlaması o ürünle karıştırılma riski taşıyabilir. Nihai ad henüz açık konu.

A. Nihai ad seçilirken bu risk göz önüne alınsın; oyunun adı "Gulyabani" kelimesini ana isim olarak kullanmasın
B. Risk kabul edilsin; oyunun adı yine "Gulyabani" içerebilir
C. Ad kararından önce resmi marka kayıtlarına (TÜRKPATENT) bakılsın, karar ona göre verilsin
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q6. [Ürün sahibi] Oyuncular oyuna nasıl katılacak?

Güvenilirlik ölçütü "kimse kopmadan" diyor. Telefonda başka bir uygulamaya (örneğin görüntülü toplantı uygulamasına) geçildiğinde veya ekran kilitlendiğinde tarayıcı bağlantıyı çoğu zaman askıya alır; bu, kopma riskini en çok etkileyen durum.

A. Çoğunlukla görüntülü toplantı bilgisayarda, oyun telefonda açık olacak (iki ayrı cihaz)
B. Çoğunlukla aynı telefonda hem görüntülü toplantı hem oyun açık olacak
C. Karışık; ikisi de olacak
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q7. [Geliştirici] Geliştirme ve bakım kimde?

Kodun büyük kısmını AI üretecek. Yayından sonra bir hata çıktığında veya site çöktüğünde kimin, hangi bilgiyle müdahale edeceği; seçilecek teknolojinin ne kadar sade olması gerektiğini belirler.

A. Ben; yazılım bilgim sınırlı, düzeltmeleri AI yardımıyla yaparım (en sade ve az bakım isteyen çözüm gerekir)
B. Ben; yazılım tecrübem var, gerektiğinde kodu kendim okuyup düzeltebilirim
C. Teknik bilgisi olan bir arkadaşım destek verecek
D. Not yet defined
X. Other (please specify)

[Answer]: X. A; ek olarak: Q7 için oracle free cloud sunucusu olma ihtimali yüksek. Diğer alternatif de azure olabilir. / Q7 için oracle ve azure free hesapları olur büyük ihtimalle demiştim. google ve aws in free hesapları var mı ve süresi uzun mu bilmiyorum. Diğer maddeler tamam.

## Q8. [Operasyon] Elinizde hazır hangi hesaplar var? (select all that apply)

Mevcut bir hesap, ileride teknoloji seçilirken kurulum işini ve maliyeti azaltabilir. Bu soru bir seçim yapmıyor; yalnızca elde ne olduğunu kayda geçiriyor.

A. AWS hesabı
B. Google Cloud / Firebase hesabı
C. Kendime ait bir alan adı (örneğin oyunadi.com)
D. Hiçbiri yok
X. Other (please specify)

[Answer]: D

## Q9. [Ürün sahibi] Herkese açık adres ücretsiz bir alt alan adı olabilir mi?

Bütçe "hiç para harcanmasın" (Q1) ve elinde kendi alan adın yok (Q8). Kendi alan adı (örneğin oyunadi.com) yılda yaklaşık 10–15 ABD doları tutar. Ücretsiz seçenek, barındırma hizmetinin verdiği bir alt adrestir (örneğin oyunadi.<hizmet-adı>.app gibi).

A. Evet, ücretsiz bir alt adres yeterli
B. Hayır, kendi alan adı alınsın; bu yıllık küçük ücret bütçe dışı istisna olsun
C. Önce ücretsiz alt adresle başlansın, oyun tutarsa sonra alan adı alınsın
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q10. [Operasyon] Ücretsiz kullanım haklarında kredi kartı ve harcama sınırı

Bulut sağlayıcılarının çoğu, ücretsiz kullanım hakları için bile hesap açarken kredi kartı ister; ücretsiz sınır aşılırsa ücret kesilebilir. Bütçe sıfır olduğu için (Q1) bu durumun nasıl karşılanacağı belirlenmeli.

A. Kredi kartıyla hesap açılabilir; ama harcama uyarısı/sınırı kurulsun ve sınır aşılmadan oyun kapansın ya da yavaşlasın
B. Kredi kartıyla hesap açılabilir; küçük bir aşım olursa (ayda birkaç dolar) kabul edilir
C. Kredi kartı istemeyen bir hizmet seçilsin; bulunamazsa yeniden konuşalım
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Consolidated Summary Confirmation

- Bütçe: Hedef aylık işletme maliyeti sıfır; yalnızca ücretsiz kullanım hakları kullanılır (Q1). Kredi kartıyla hesap açılabilir; ücretsiz sınır aşılırsa ayda birkaç dolarlık küçük bir aşım kabul edilir (Q10)
- Zaman: Sabit bir yayın tarihi yok; oyun hazır olunca yayınlanır (Q2)
- Kişisel veriler (KVKK): Ana sayfada ve odaya girişte kısa bir gizlilik bilgilendirmesi gösterilir; kayıtlar niyet beyanındaki gibi tutulur (Q3)
- Sohbette kötüye kullanım: Moderatör oyuncuyu odadan çıkarabilir; buna ek olarak basit bir küfür/hakaret kelime filtresi olur ve oyuncular bir sohbet mesajını şikayet edebilir, şikayet kayıtlara düşer (Q4)
- Oyun adı: Adın "Gulyabani" içermesinin piyasadaki kutu oyunuyla karışma riski kabul edilir; ad yine "Gulyabani" içerebilir (Q5)
- Katılım: Oyuncular karışık katılır; bazıları toplantıyı bilgisayarda oyunu telefonda, bazıları ikisini aynı telefonda açar (Q6)
- Geliştirme ve bakım: Sen yaparsın; yazılım bilgin sınırlı, düzeltmeleri AI yardımıyla yaparsın; en sade ve az bakım isteyen çözüm gerekir. Büyük ihtimalle Oracle Cloud ve Azure'un ücretsiz hesapları açılacak ; kesin sunucu seçimi sonraki aşamalarda yapılır. Google Cloud ve AWS'nin ücretsiz hakları ve süreleri belgeye yalnızca karşılaştırma notu olarak girer (Q7)
- Hazır hesaplar: Şu an AWS, Google Cloud/Firebase hesabı ve alan adı yok (Q8)
- Adres: Önce barındırma hizmetinin verdiği ücretsiz bir alt adresle başlanır; oyun tutarsa sonra kendi alan adı alınır (Q9)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

## Requested Changes Feedback

What should change?

[Answer]: Q7 için oracle free cloud sunucusu olma ihtimali yüksek. Diğer alternatif de azure olabilir. / Q7 için oracle ve azure free hesapları olur büyük ihtimalle demiştim. google ve aws in free hesapları var mı ve süresi uzun mu bilmiyorum. Diğer maddeler tamam. / Oracle + Azure
