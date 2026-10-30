# Niyet Yakalama ve Çerçeveleme — Sorular

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.

Not: Sorular, `gulyabani-koylu-intent.md` dosyasının içeriği göz önüne alınarak hazırlandı. Dosyadaki bilgiler, ancak aşağıdaki cevaplarla onaylandıktan sonra çıktılara girer.

## Q1. [Ürün sahibi] Çözülen temel problem

Bu oyun hangi temel problemi çözüyor? (Intent dosyası, arkadaş gruplarının telefondan ve aynı anda bir sesli/görüntülü toplantıdayken oynayabileceği, moderatörü adım adım yönlendiren bir oyun tarif ediyor.)

A. Arkadaş grupları uzaktayken (görüntülü toplantıda) bu tür sosyal çıkarım oyunlarını oynamakta zorlanıyor: kart dağıtmak, gizli bilgiyi yalnızca hak edene iletmek ve moderatörlük yapmak elle zor
B. Bu türün mevcut dijital sürümleri Türkçe ve yerel kültüre (Anadolu köyü, Türk folkloru) uygun değil
C. Her ikisi (A ve B)
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q2. [Ürün sahibi] Hedef oyuncu kitlesi

Oyunu kimler oynayacak? Bu cevap, oyunun herkese açık mı yoksa kapalı bir çevre için mi tasarlanacağını belirler.

A. Kendi arkadaş ve aile çevrem (kapalı, tanıdık gruplar)
B. Türkçe konuşan genel oyuncu kitlesi (linki bulan herkes oynayabilir)
C. Ekip etkinlikleri, sınıflar, kulüpler gibi organize gruplar
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q3. [Ürün sahibi] Başarı ölçütü

v1'in başarılı olduğunu hangi ölçülebilir sonuçla anlayacağız?

A. Gerçek bir arkadaş grubuyla (8 veya daha fazla oyuncu) baştan sona en az bir tam oyun, oyunu durduran bir teknik aksaklık olmadan oynanır
B. A'ya ek olarak, yayından sonraki ilk ay içinde en az 5 tam oyun oynanır
C. A'ya ek olarak, oyunculara sorulan "Tekrar oynar mısın?" sorusuna en az %80 "evet" cevabı gelir
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q4. [Ürün sahibi] Neden şimdi?

Bu projeyi şimdi başlatmanın nedeni nedir?

A. Kişisel/hobi projesi: arkadaşlarımla oynamak istiyorum
B. AI-DLC yöntemini gerçek bir proje üzerinde öğrenmek ve denemek
C. Her ikisi (A ve B)
D. Not yet defined
X. Other (please specify)

[Answer]: C

## Q5. [Ürün sahibi] Paydaşlar

Bu projede kimlerin söz hakkı veya beklentisi var?

A. Yalnızca ben (geliştirici, ürün sahibi ve oyuncu aynı kişi)
B. Ben ve oyunu test edecek arkadaş grubum
C. Ben, arkadaş grubum ve tasarıma katkı veren biri (ör. kart görsellerini çizecek bir tasarımcı)
D. Not identified
X. Other (please specify)

[Answer]: B

## Q6. [Ürün sahibi] Karar yetkisi

Kapsam ve öncelik kararlarını kim verir, kimler yalnızca görüş bildirir?

A. Kararları yalnızca ben veririm
B. Kararları ben veririm; arkadaş grubum görüş bildirir
C. Arkadaş grubumla birlikte ortak karar veririz
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q7. [Ürün sahibi] İletişim ve raporlama

İlerleme nasıl paylaşılacak?

A. None: tek kişilik proje, ayrıca raporlama gerekmez
B. Her aşama onayından sonra değişiklikler GitHub reposuna gönderilir; ilerleme repodan izlenir
C. B'ye ek olarak, arkadaş grubuyla belli aralıklarla deneme oturumu (demo) yapılır
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q8. [Ürün sahibi] Bu ilk sürümün yapmayacakları

Çalışma için `mvp` planı seçildi. Intent dosyası şunları zaten v2'ye bırakıyor: tılsım kartları, "Ağız Bağlama" varyantı, ek roller (Ebe Nine, Muhtar, Kahveci), otomatik (bot) moderatör, anonsların sesli okunması ve oyun geçmişi/istatistik. Bu listeye ek olarak v1'in dışında kalacak bir şey var mı?

A. Hayır, yalnızca intent dosyasındaki v2 listesi kapsam dışı
B. v2 listesine ek olarak, oyunun internette (AWS'de) canlı yayınlanması da bu ilk sürümün dışında kalsın; v1 önce yerelde/deneme ortamında çalışsın
C. v2 listesine ek olarak, kartların tam illüstrasyonları da dışarıda kalsın; v1'de yalnızca simge, çerçeve ve renkten oluşan basit kart görselleri olsun
D. B ve C birlikte
X. Other (please specify)

[Answer]: A

## Q9. [Ürün sahibi] Oyunun adı

Intent dosyasında oyunun nihai adı açık soru olarak bırakılmış. Oyunun adı ne olsun?

A. Gulyabani–Köylü
B. Gulyabani Köyü
C. Sisli Köy
D. Not yet defined (ad sonra kararlaştırılsın; şimdilik "Gulyabani–Köylü" çalışma adı kullanılsın)
X. Other (please specify)

[Answer]: D

## Q10. [Ürün sahibi] "Yayın" ne anlama geliyor?

Başarı ölçütü (Q3) "yayından sonraki ilk ay içinde en az 5 tam oyun" diyor; Q8'de AWS'de canlı yayın v1 kapsamında bırakıldı ve hedef kitle (Q2) genel Türkçe oyuncular. Seçilen planda oyunu internete çıkaran yayın aşamaları bulunmuyor (oyunun kodu, testleri ve altyapı kodu üretiliyor). v1 için "yayın" hangi anı ifade ediyor?

A. Oyun AWS'de herkese açık bir adreste yayınlanır ve bu yayın bu çalışmanın içinde yapılır (yayın aşamaları plana sonradan eklenir)
B. Oyun AWS'de herkese açık bir adreste yayınlanır, ama yayın bu çalışma bittikten sonra ayrıca yapılır (bu çalışma yayına hazır kod ve altyapı kodunu teslim eder)
C. Önce yalnızca test grubuma verilen bir deneme adresinde yayınlanır; herkese açık yayın daha sonra
D. Not yet defined
X. Other (please specify)

[Answer]: X. Oyun herkese açık bir internet adresinde, bu çalışmanın içinde yayınlanır (yayın aşamaları plana sonradan eklenir). Bulut sağlayıcısı ve teknoloji seçimi şimdilik açık konu; zamanı gelince değerlendirilip seçilir (AWS zorunlu değil).

## Consolidated Summary Confirmation

- Problem: Arkadaş grupları uzaktayken (görüntülü toplantıda) bu tür oyunları oynamakta zorlanıyor; kart dağıtmak, gizli bilgiyi yalnızca hak edene iletmek ve moderatörlük elle zor (Q1)
- Hedef kitle: Türkçe konuşan genel oyuncu kitlesi; linki bulan herkes oynayabilir (Q2)
- Başarı ölçütü 1 (güvenilirlik): En az 6 oyunculu bir oyun, kimse kopmadan ve sorun yaşanmadan sonuna kadar oynanır (Q3, Q11)
- Başarı ölçütü 2 (kullanım): Yayından sonraki ilk ay içinde en az 5 tam oyun oynanır; kim oynarsa sayılır, ama yarıda bırakılan deneme oyunları sayılmaz; en az 3 oyuncu + moderatörlü, sonuna kadar oynanan oyunlar sayılır (Q3, Q13, Q15)
- Başarı ölçütü 3 (geri bildirim): İlk ay içinde hiç şikayet girdisi gelmez (Q19)
- Asgari oyuncu: Oyun 3 oyuncu + moderatörle de başlatılabilir; 6'nın altında lobide uyarı gösterilir (Q15)
- Kayıtlar (v1'e yeni): Giriş/çıkışlar, nick'ler, yapılan işlemler, kopmalar, ne zaman ve nereden (cihaz türü, tarayıcı, ülke; IP saklanmaz) sunucuda kaydedilir; sistemi yormadan analiz için mümkün olduğunca fazla bilgi toplanır (Q11, Q12, Q16)
- Geri bildirim (v1'e yeni): Kopmalarda oyun ekranında geri bildirim butonu; oyun sonunda simgeli memnuniyet anketi ve isteğe bağlı açıklama; isteyen oyuncu öneri veya şikayet girebilir; hepsi kaydedilir (Q11)
- Saklama: Kayıtlar ve geri bildirimler 1 yıl saklanır; odalar ve sohbetler yine 24 saatte silinir (Q17)
- Raporlar: v1'de basit bir rapor olur (oyun sayısı, oyun süreleri, kopma sayısı, memnuniyet ortalaması) (Q18)
- v1 özeti beyana eklenir (Q14)
- Neden şimdi: Hem hobi (arkadaşlarla oynamak) hem AI-DLC yöntemini gerçek bir projede öğrenmek (Q4)
- Paydaşlar: Ben ve oyunu test edecek arkadaş grubum (Q5)
- Karar yetkisi: Kararları ben veririm; arkadaş grubum görüş bildirir (Q6)
- İletişim: Her aşama onayından sonra değişiklikler GitHub reposuna gönderilir; ilerleme repodan izlenir (Q7)
- v1 dışı: Yalnızca intent dosyasındaki v2 listesi (Q8)
- Oyunun adı: Henüz kararlaştırılmadı; şimdilik "Gulyabani–Köylü" çalışma adı (Q9)
- Yayın: Oyun herkese açık bir internet adresinde bu çalışmanın içinde yayınlanır; yayın aşamaları plana sonradan eklenir. Bulut sağlayıcısı ve teknoloji seçimi açık konu, zamanı gelince seçilir (Q10)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct

## Q11. [Ürün sahibi] "Tam oyun" ve "oyunu durduran aksaklık" ne demek?

Başarı ölçütünün (Q3) test edilebilmesi için bu iki ifadenin ve "8 veya daha fazla oyuncu"nun anlamı netleşmeli.

A. Tam oyun: rol dağıtımından kazananın ilanına kadar oynanan oyun. Durduran aksaklık: oyunun yeni oda açmadan veya baştan başlatmadan sürdürülemediği hata. 8 oyuncu asgari sayıdır
B. A ile aynı tanımlar, ama asgari oyuncu sayısı 6 (oyunun izin verdiği en az sayı)
C. Not yet defined (açık soru olarak kalsın)
X. Other (please specify)

[Answer]: X. en az 6 oyuncu kopmadan, sorun yaşamdaan oyunu bitirmesi lazım. Oyunda kopmalar tespit edilirse loglansın. giriş, çıkışlar, oyuncu isimleri yapılan işlemler loglansın. Sonra bu log'lardan raporlar oluşturulmasını isteyeceğim. Oyun ekranında kopmalarda geri bildirim butonu da olsun ve loglansın. oyun sonunda kullanıcılarda icon ile memnuniyet geri bildirimi alalım. Alt kısımda opsiyonel açıklama olsun. Eğer kullanıcılar girmek isterse öneri ya da şikayet girdileri yapabilirler. Burada şikayet girdisi olmaması başarı kriteri olabilir.

## Q12. [Ürün sahibi] Oynanan oyunlar nasıl sayılacak?

İlk ay ölçütü (en az 5 tam oyun) için bir sayım yöntemi gerekiyor; oyun geçmişi ve istatistik ekranları v2'de.

A. Elle: her tam oyundan sonra ben kaydederim (ör. GitHub'daki bir listeye)
B. Sunucu, biten her oyunu yalnızca tarih ve oyuncu sayısıyla (kişisel veri olmadan) kaydeder; oyunculara gösterilen bir ekran olmaz
C. Not yet defined (açık soru olarak kalsın)
X. Other (please specify)

[Answer]: X. bir önceki mesajda da yazmıştım. bilgiler sunucuda bir yerde tutulsun. kim, nereden, ne zaman oyuna başladı, ne zaman çıktı gibi temel log bilgileri dışında sistemi çok yormayacak ama mümkün olduğunca fazla bilgi toplamak isterim, ileride analiz etmek isterim.

## Q13. [Ürün sahibi] Kimin oynadığı oyunlar sayılır?

Hedef kitle genel oyuncular (Q2), ilk deneyenler ise test grubu (Q5).

A. Test grubu dahil, kim oynarsa oynasın
B. Yalnızca test grubu dışındaki oyuncuların oyunları
C. Not yet defined (açık soru olarak kalsın)
X. Other (please specify)

[Answer]: X. Herkes ama az sayıda test amaçlı girilip yarım bırakılan oyunlar sayılmaz. Normal sonuna kadar oynanan en az 4 kişilik oyunlar sayılır. 1 i moderator olup 3 oyuncu olabilir.

## Q14. [Ürün sahibi] v1 özeti beyana eklensin mi?

Beyan şu an v1 içeriği için yalnızca intent dosyasına atıf yapıyor. Şu özet eklensin mi: oda kurma ve oda koduyla katılma (yalnızca nick, şifre yok); 6–26 oyuncu ve bir insan moderatör; rol havuzu ve rollerin aç/kapa yapılması (Gulyabani, Boşboğaz Gulyabani, Köylü, Bekçi, Ürkek, Ahbaplar, Celalli Damat, Dertli, Görücü); gece/gündüz döngüsü ve gulyabani ortak kararı; gündüz sohbeti, oylama, son söz, onay oylaması, infaz ve kart açılışı; mezarlık; kazanma kontrolü; yeniden bağlanma; rehber bölümü; kart tasarımları; Türkçe, mobil öncelikli arayüz.

A. Evet, bu özet doğru; eklensin
B. Hayır, beyan yalnızca intent dosyasına atıf yapsın
C. Not yet defined
X. Other (please specify)

[Answer]: A

## Q15. [Ürün sahibi] En az kaç oyuncuyla oynanabilir?

Q11'de başarı için "en az 6 oyuncu", Q13'te ise sayım için "en az 4 kişi (1 moderatör + 3 oyuncu)" dedin. Intent dosyasındaki kurala göre oyun moderatör hariç en az 6 oyuncuyla başlar.

A. Kural aynı kalır: oyun en az 6 oyuncu + moderatörle başlar; ilk ay sayımında da en az 6 oyunculu tam oyunlar sayılır
B. v1'de oyun 3 oyuncu + moderatörle de başlatılabilir (6'nın altında lobide uyarı gösterilir); ilk ay sayımında en az 3 oyuncu + moderatörlü tam oyunlar sayılır; güvenilirlik ölçütü (Q11) en az 6 oyuncu olarak kalır
C. Kural 6 kalır, ama yalnızca deneme için 3 oyuncuyla başlatılabilen bir deneme modu olur; deneme modundaki oyunlar sayılmaz
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q16. [Ürün sahibi] Kayıtlardaki "nereden" bilgisi ne olsun?

Intent dosyası "Kişisel veri toplanmaz; yalnızca nick" diyor. IP adresi kişisel veri sayılır ve saklanırsa oyunculara bir gizlilik bilgilendirmesi gerekir.

A. IP adresi saklanmaz; yalnızca cihaz türü (telefon/bilgisayar), tarayıcı ve ülke kaydedilir
B. IP adresi de saklanır; oyunculara bir gizlilik bilgilendirmesi gösterilir
C. "Nereden" hiç kaydedilmez
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Q17. [Ürün sahibi] Kayıtlar ve geri bildirimler ne kadar saklansın?

Intent dosyasına göre odalar ve sohbetler 24 saat sonra silinir. Analiz için tutulan kayıtlar (giriş/çıkış, nick, yapılan işlemler, kopmalar, geri bildirimler) bundan bağımsız olarak saklanacak.

A. 90 gün
B. 1 yıl
C. Süresiz, ama nick'ler bir süre sonra anonimleştirilir
D. Not yet defined
X. Other (please specify)

[Answer]: B

## Q18. [Ürün sahibi] Kayıtlardan raporlar v1'de mi?

"Sonra bu loglardan raporlar oluşturulmasını isteyeceğim" dedin.

A. v1 yalnızca kayıtları ve geri bildirimleri toplar; raporlar sonraki bir sürümde yapılır
B. v1'de basit bir rapor da olsun (ör. oyun sayısı, oyun süreleri, kopma sayısı, memnuniyet ortalaması)
C. Not yet defined
X. Other (please specify)

[Answer]: B

## Q19. [Ürün sahibi] Geri bildirimler başarı ölçütü olsun mu?

"Şikayet girdisi olmaması başarı kriteri olabilir" dedin.

A. Evet: ilk ay içinde hiç şikayet girdisi gelmemesi başarı ölçütü olsun
B. A'ya ek olarak memnuniyet ortalaması en az 4/5 olsun
C. Hayır, geri bildirimler yalnızca bilgi amaçlı toplansın
D. Not yet defined
X. Other (please specify)

[Answer]: A

## Requested Changes Feedback

şimdilik teknoloji seçimi açık konu kalsın, zamanı gelince değerlendirip yaparız.

[Answer]: şimdilik teknoloji seçimi açık konu kalsın, zamanı gelince değerlendirip yaparız.
