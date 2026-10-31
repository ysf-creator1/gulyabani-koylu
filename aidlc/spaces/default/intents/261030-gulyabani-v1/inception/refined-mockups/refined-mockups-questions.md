# Ayrıntılı Taslaklar — Sorular

Sahip ayrıntılı ve küçük konuları bana bıraktı (proje kuralı, `memory/project.md` Corrections). Bu yüzden yalnızca dört büyük karar soruluyor; geri kalanını makul varsayılanlarla ben tasarlıyorum ve özet onayında gösteriyorum.

Daha önce kararlaştırılanlar yeniden sorulmuyor: önce telefon, gece koyu / gündüz açık tema, oyuncu ekranında alt sekmeler, moderatörde Akış / Oyuncular / Günlük / Sohbet, WCAG 2.1 AA'nın tamamı, gece sırası için titreşim/ses/ekran okuyucu duyurusu yok (rough-mockups Q1–Q6, requirements Q14, Q17).

## Q1. [Tasarım] Ekranların genel görünüş tarzı

Kart çizimleri linol baskı üslubunda olacak (FR19.1). Ekranların geri kalanı bu çizimlerle ne kadar uyumlu olsun?

A. Halk sanatı esintili sade görünüm: kartlarla aynı linol baskı dokusu, kenarlarda ince kilim motifi, el yazısına yakın başlık yazısı; metinler sade ve okunaklı (önerilen)
B. Tamamen sade, modern görünüm: düz renkler, süs yok; köy havası yalnızca kartlarda
C. Masal kitabı görünümü: kâğıt dokusu, süslü başlıklar, bol çizim
X. Other (please specify)

[Answer]: A

## Q2. [Tasarım] Gece ile gündüz arasındaki geçiş

Faz değişince herkesin teması aynı anda değişiyor (rough-mockups Q5). Geçişin kendisi nasıl görünsün?

A. Kısa bir geçiş ekranı: 2 saniyelik "Gece çöktü" / "Gün ağardı" kartı, ardından tema değişir; hareket azaltma açıksa animasyonsuz (önerilen)
B. Geçiş ekranı yok: yalnızca renkler ve üstteki faz şeridi değişir
C. Geçiş ekranı, oyuncu dokununca kapanır
X. Other (please specify)

[Answer]: A

## Q3. [Ürün] Tarayıcı değiştirip dönen oyuncu (US9.6)

Kullanıcı Hikâyeleri incelemesi (review-01 R-01) bir çelişki buldu: oyun sürerken biri odadaki bir oyuncunun nick'iyle yeni bir tarayıcıdan gelirse, bazı yerlerde "Bu nick kullanılıyor", bazı yerlerde "Moderatör onayı bekleniyor" deniyor. Ayrıca nick'i bilen biri başkasının yerine geçmeye çalışabilir.

A. Oyun sürüyorsa ve o oyuncunun eski bağlantısı kopuksa moderatöre "Ali yeniden katılmak istiyor" onayı gider; eski bağlantı hâlâ açıksa istek kabul edilmez ve "Bu oyuncu şu an oyunda" yazar. Lobide (oyun başlamadan) aynı nick her zaman "Bu nick kullanılıyor" der (önerilen)
B. Eski bağlantı açık olsa bile moderatör onaylarsa yeni tarayıcı geçer, eski kapanır
C. Bu özelliği kaldır; tarayıcı değiştiren oyuncu oyuna dönemez
X. Other (please specify)

[Answer]: A

## Q4. [Tasarım] Bilgisayardan oynayan oyuncunun ekranı

Telefonda alt sekmeler var (Oyuncular / Sohbet / Kartım / Rehber). Bilgisayarda geniş ekran nasıl kullanılsın?

A. İki sütun: solda sohbet, sağda oyuncu listesi ve kartım; Rehber yine katman olarak açılır (önerilen)
B. Telefon görünümünün aynısı, ekranın ortasında dar bir sütun
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

Cevaplar ve benim seçtiğim ayrıntılar:

- Görünüm: halk sanatı esintili sade tarz; kartlarla aynı linol baskı dokusu, kenarlarda ince kilim motifi, okunaklı metin. [Q1]
- Geçiş: faz değişince 2 saniyelik "Gece çöktü" / "Gün ağardı" kartı, ardından tema değişir; hareket azaltmada animasyonsuz. [Q2]
- Geri dönüş: oyun sürerken aynı nick yeni tarayıcıdan gelirse, eski bağlantı kopuksa moderatöre onay sorulur, açıksa "Bu oyuncu şu an oyunda" yazar; lobide aynı nick her zaman "Bu nick kullanılıyor" der. [Q3]
- Bilgisayar: oyuncu ekranı iki sütun (solda sohbet, sağda oyuncular ve kartım); moderatör ekranı üç sütun (önceden kararlaştırıldı). [Q4]
- Benim seçtiğim ayrıntılar: renk ve yazı ölçüleri (iki temada da kontrast en az 4.5:1), tek bir yazı ailesi, düğme/anahtar/panel gibi ortak parçaların listesi ve durumları, ekran genişlik eşikleri (telefon, tablet, bilgisayar), her ekranın boş/yükleniyor/hata durumları, örnek verideki ölü oyuncu düzeltmesi (rough-mockups R-03), iskelette yer alan ekranların işaretlenmesi (user-stories R-02).

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
