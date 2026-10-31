# Çalışma Biçimi Keşfi — Sorular

> Taslak öneriler: `team-practices.md` ve `discovered-rules.md` (aynı klasör). Her soruda önerilen seçenek "(Önerilen)" ile işaretli.

## Q1. [Sürüm mühendisi] Kod parçaları ana dala nasıl eklensin?

Yapım aşamasında oyun parça parça yazılacak. Her parçanın GitHub'daki ana dala (`main`) nasıl ekleneceği, geçmişin ne kadar okunaklı kalacağını belirler.

A. Her parça kendi geçici dalında yazılsın, onaylanınca ana dala tek bir kayıt (commit) olarak eklensin; ayrıca PR (birleştirme isteği) açılmasın (Önerilen)
B. Her parça doğrudan ana dala yazılsın, aradaki tüm küçük kayıtlar kalsın
C. Her parça için GitHub'da bir PR açılsın ve PR üzerinden birleştirilsin
X. Other (please specify)

[Answer]: A

## Q2. [Sürüm mühendisi] Ayrı bir deneme sunucusu olsun mu?

Bütçe sıfır olduğu için ikinci bir sunucu ücretsiz sınırı zorlayabilir.

A. Tek ücretsiz sunucu olsun, o da canlı oyun olsun; denemeler bilgisayarda ve otomatik testlerle yapılsın (Önerilen)
B. Aynı ücretsiz hesapta küçük ayrı bir deneme sunucusu da kurulsun (ücretsiz sınır izin verirse)
X. Other (please specify)

[Answer]: A

## Q3. [Sürüm mühendisi] Yeni sürüm canlı oyuna nasıl çıksın?

A. Senin açık onayınla ve bir sürüm numarasıyla (ör. v1.0.0) çıksın; sorun olursa bir önceki sürüme dönülsün (Önerilen)
B. Ana dala her eklenen parça otomatik olarak canlıya çıksın
X. Other (please specify)

[Answer]: A

## Q4. [Geliştirici] Önce ince bir uçtan uca dilim yapılsın mı?

Walking skeleton (yürüyen iskelet), parçaların birbirine bağlandığını kanıtlamak için en başta yapılan, baştan sona çalışan en küçük sürümdür. Kapsamda "önce en basit oynanabilir oyun" kararı vardı.

A. Evet: yalnızca Gulyabani ve Köylü rolleriyle oda kurma, katılma, gece/gündüz, oylama ve oyun sonu olan en basit tam oyun önce yapılsın; bot oyuncularla otomatik test ve gerçek telefonda yeniden bağlanma denemesiyle doğrulansın (Önerilen)
B. Hayır: her bölüm (lobi, roller, oylama…) sırayla eksiksiz yapılsın, birleştirme sonra
X. Other (please specify)

[Answer]: A

## Q5. [Geliştirici] İlk çalışan sürüm nerede denensin?

Telefonda yeniden bağlanmayı ilk günden denemek kararlaştırıldı. Sunucu kurulum aşamaları ise planda daha sonra.

A. Önce kendi bilgisayarında çalışsın; telefonlar aynı Wi-Fi'den bağlanarak denesin; ücretsiz sunucuya sonra geçilsin (Önerilen)
B. Baştan ücretsiz sunucuda (Oracle) dış adreste çalışsın; telefonlar mobil veriyle de denesin
C. Bilgisayarda çalışsın ama geçici, ücretsiz bir dış bağlantı (tünel) ile telefonlar mobil veriyle de bağlanabilsin
X. Other (please specify)

[Answer]: B

## Q6. [Geliştirici] Kodun içindeki dil ne olsun?

Oyuncuya görünen tüm yazılar her durumda Türkçe olacak ve koddan ayrı bir metin dosyasında tutulacak. Bu soru yalnızca kodun içini ilgilendiriyor.

A. Kod içindeki adlar İngilizce, açıklama notları (yorumlar) Türkçe olsun (Önerilen)
B. Kod içindeki adlar da yorumlar da İngilizce olsun
C. Her şey Türkçe olsun (adlar dahil)
X. Other (please specify)

[Answer]: A

## Q7. [Kalite mühendisi] Testler ne zaman yazılsın?

Kodu ve testleri yapay zekâ yazacak. Oyun kuralları (roller, gece/gündüz, kazanma koşulları) çok net olduğu için önce test yazmak hataları erken yakalar.

A. Oyun kuralları için önce test, sonra kod; ekranlar ve geri kalan için önce kod, hemen ardından test (karma) (Önerilen)
B. Her yerde önce kod, hemen ardından test
C. Her yerde önce test, sonra kod
X. Other (please specify)

[Answer]: A

## Q8. [Kalite mühendisi] Test kapsamı alt sınırı ne olsun?

Kapsam, kodun ne kadarının testlerle çalıştırıldığını gösterir. Testler geçmezse veya sınırın altında kalınırsa parça ana dala eklenmez.

A. Tüm kodda en az %80 (Önerilen)
B. Tüm kodda en az %80, oyun kurallarında en az %90
C. Sınır olmasın, yalnızca testler geçsin
X. Other (please specify)

[Answer]: B

## Q9. [Ürün sahibi] Önceki aşamalardan çıkarılan kesin kurallar onaylanıyor mu?

`discovered-rules.md` içinde, daha önce verdiğin kararlardan çıkarılmış 13 aday kural var (8 "her zaman", 5 "asla"). Onaylananlar projenin kalıcı kuralları olur.

A. Hepsini onaylıyorum (Önerilen)
B. Bazılarını değiştirmek veya çıkarmak istiyorum (hangileri olduğunu yaz)
X. Other (please specify)

[Answer]: A

## Q10. [Sürüm mühendisi] Tek sunucu, yayından önce deneme için de kullanılsın mı?

Q2'de "tek ücretsiz sunucu olsun, o da canlı oyun olsun; denemeler bilgisayarda yapılsın", Q5'te ise "ilk çalışan sürüm baştan ücretsiz sunucuda (Oracle) denensin" dedin. İkisini birleştirmek için: v1 yayınlanana kadar henüz canlı oyun olmadığından o tek sunucu deneme için kullanılabilir. Bu, Oracle hesabının yapım aşamasının en başında kurulması gerektiği anlamına gelir.

A. Evet: v1 yayınına kadar tek sunucu deneme için kullanılsın; yayından sonra yalnızca canlı oyun olsun, yeni parçalar önce bilgisayarda ve otomatik testlerle denensin (Önerilen)
B. Yayından sonra da yeni parçalar önce bu sunucuda denensin (oyunda kısa kesinti kabul)
X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Kod parçaları: her parça kendi geçici dalında yazılır, onaylanınca ana dala (`main`) tek bir kayıt olarak eklenir; PR açılmaz. (Q1)
- Tek ücretsiz sunucu var; v1 yayınına kadar deneme için kullanılır, yayından sonra yalnızca canlı oyundur ve yeni parçalar önce bilgisayarda ve otomatik testlerle denenir. Oracle hesabı yapım aşamasının başında kurulur. (Q2, Q5, Q10)
- Canlıya çıkış: senin açık onayınla ve bir sürüm numarasıyla (ör. v1.0.0); sorun olursa bir önceki sürüme dönülür. (Q3)
- Önce yürüyen iskelet: yalnızca Gulyabani ve Köylü rolleriyle en basit tam oyun önce yapılır; bot oyuncularla otomatik test ve gerçek telefonda yeniden bağlanma denemesiyle doğrulanır. (Q4)
- İlk çalışan sürüm baştan ücretsiz sunucuda (Oracle) dış adreste çalışır; telefonlar mobil veriyle de dener. (Q5)
- Kod dili: kod içindeki adlar İngilizce, yorumlar Türkçe; oyuncuya görünen metinler Türkçe ve ayrı bir metin dosyasında. (Q6)
- Test sırası (karma): oyun kuralları için önce test sonra kod; ekranlar ve geri kalan için önce kod, hemen ardından test. (Q7)
- Test kapsamı: tüm kodda en az %80, oyun kurallarında en az %90; testler geçmezse veya sınırın altında kalınırsa parça ana dala eklenmez. (Q8)
- 13 aday kesin kuralın hepsi (8 "her zaman", 5 "asla") olduğu gibi onaylandı. (Q9)

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
