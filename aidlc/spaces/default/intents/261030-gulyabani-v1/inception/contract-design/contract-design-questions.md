# Sözleşme Tasarımı — Sorular

Bu aşama, parçaların (U1–U8) birbirleriyle ve tarayıcıyla hangi biçimde konuştuğunu yazılı hâle getirir. Sahibin kuralı gereği (project.md Corrections) küçük ve teknik ayrıntıları ben seçiyorum; sahibe yalnızca oyuncunun fark edeceği büyük karar soruluyor. Benim seçtiğim varsayılanlar özet onayında gösterilir.

## Q1. [Ürün sahibi] Sunucuya yeni sürüm yüklenince açık sayfalar

v1 yayınından sonra sunucuya yeni bir sürüm yüklendiğinde, telefonunda oyun sayfası açık olan oyuncular olabilir. Oyunlar kaybolmaz (FR14.6: kabul edilmiş her işlem korunur, oyun kalan süreyle sürer). Soru, eski sayfanın yeni sunucuyla nasıl buluşacağı.

A) Sayfa kendiliğinden yenilenir; oyuncu birkaç saniye içinde aynı ekrana ve aynı rolüne döner (oyuncu hiçbir şey yapmaz).
B) Ekranda "Yeni sürüm hazır — Yenile" düğmesi çıkar; oyuncu kendisi basar. Basana kadar eski sayfa çalışmaya devam eder (sunucu bir süre eski sürümü de anlamak zorunda kalır).
C) Yeni sürüm yalnızca hiç oyun sürmüyorken yüklenir; sayfalar bir sonraki girişte yenilenir.
X) Other (please specify)

[Answer]: C

## Consolidated Summary Confirmation

- **Q1 (sizin kararınız):** Yeni sürüm yalnızca hiç oyun sürmüyorken yüklenir. Eski bir sayfa yeni sunucuya bağlanırsa sunucu "yenile" der ve sayfa kendiliğinden yenilenir; o sırada oyun olmadığı için kayıp olmaz.
- **Benim varsayılanım — bağlantı:** Tarayıcı ve test botları sunucuyla tek bir şifreli canlı bağlantıdan konuşur. Sayfa, resimler ve sağlık kontrolü normal şifreli web adresinden gelir.
- **Benim varsayılanım — gizli bilgi:** Her değişiklikten sonra sunucu her kişiye, yalnızca görmeye hakkı olan bilgiyle hazırlanmış güncel ekranın tamamını gönderir; yeniden bağlanan da tamamını alır.
- **Benim varsayılanım — tekrar ve hata:** Her komutun bir numarası olur; aynı komut iki kez gelirse bir kez işlenir ("Tekrar dene" güvenli). Kabul edilmeyen komuta kısa bir neden kodu döner, ekranda Türkçe metin dosyasından gösterilir.
- **Benim varsayılanım — parçalar arası:** Bütün parçalar aynı programda olduğu için aralarındaki sözleşmeler ağ adresi değil; ortak arayüz, olay listesi ve veri biçimleridir. Temel biçimleri ilk parça (iskelet) kurar, sonraki parçalar yalnızca ekleme yapar.
- **Benim varsayılanım — değişiklik kuralı:** Biçimlere yalnızca yeni alan eklenir; var olan alan silinmez ve anlamı değişmez; tanınmayan alan görmezden gelinir. Bunu bozan bir değişiklik gerekirse sürüm numarası artar ve sizin onayınızla yapılır.
- **Benim varsayılanım — arızalar:** Kayıt yazılamazsa oyun durmaz, hata sayılır. Bağlantı koparsa tarayıcı giderek seyrelen aralıklarla yeniden dener; 60 saniyede bağlanamazsa mevcut uyarı çıkar (FR14.2).

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
