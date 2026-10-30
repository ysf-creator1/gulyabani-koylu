# Fizibilite Değerlendirmesi — Gulyabani–Köylü (çalışma adı)

## Sonuç

**Uygulanabilir, koşullu.** v1, sıfır aylık bütçeyle ve tek kişilik, AI destekli bakımla yapılabilir görünüyor. Üç koşul var:

1. Sürekli açık kalan ve oyuncu bağlantılarını tutabilen ücretsiz bir sunucu bulunması gerekiyor. En güçlü aday, süre sınırı olmayan Oracle Cloud ücretsiz hakları. [Q1] [Q7]
2. Telefonda oyundan başka uygulamaya geçildiğinde yaşanan kopmalar, "kimse kopmadan" başarı ölçütünü en çok tehdit eden konu. Gereksinim analizinde ele alınmalı. [Q6]
3. Çözüm, tek bir bakımcının AI yardımıyla düzeltebileceği kadar sade kalmalı. [Q7]

Bu değerlendirme, onaylanan niyet beyanındaki (intent-statement) v1 kapsamına, başarı ölçütlerine ve açık konulara dayanır.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- [Q1]–[Q10]: `feasibility-questions.md` içindeki cevaplar (özet onayı: Looks correct).
- Onaylanan niyet beyanı: `ideation/intent-capture/intent-statement.md` (intent-statement).

## Teknik Uygulanabilirlik

| Alan | Değerlendirme | Zorluk |
|---|---|---|
| Gerçek zamanlı oda oyunu (en fazla 26 oyuncu, aynı anda yaklaşık 50 oda) | Oyun durumunu sunucunun yönetmesi ve oyuncularla sürekli bağlantı kurması gerekiyor. Yalnızca dosya sunan ücretsiz barındırma yetmez; sürekli çalışan bir sunucu gerekir. [desc] [Q1] | Orta |
| Gizli bilginin yalnızca hak eden oyuncuya gitmesi (roller, gece eylemleri) | Kararları sunucu verdiği sürece mümkün. Niyet beyanının temel ihtiyacıyla örtüşür. [desc] | Orta |
| Yeniden bağlanma ve mobil kullanım | Katılım karışık olacak (bazıları toplantı ile oyunu aynı telefonda açacak). Telefon tarayıcısı arka plana geçince bağlantı askıya alınabilir. Yeniden bağlanma v1 kapsamında; yine de oyunun kopmaya dayanıklı tasarlanması gerekir. [Q6] | Yüksek |
| Kayıtlar (1 yıl), geri bildirim ve basit rapor | Veri hacmi küçük (az sayıda oyun, metin kayıtları). Ücretsiz depolama sınırlarına sığması beklenir; seçim sırasında doğrulanacak. [Q1] | Düşük |
| Sohbette kötüye kullanım | Moderatörün oyuncuyu çıkarması (intent'te zaten var), basit kelime filtresi ve mesaj şikayeti (kayıtlara düşer) birlikte yapılabilir. Türkçe kelime filtresi kusursuz olmaz; filtre, atlatmaları ve yanlış engellemeleri tam olarak önleyemez. [Q4] | Düşük–Orta |
| Gizlilik bilgilendirmesi (KVKK) | Ana sayfada ve odaya girişte kısa bir metin göstermek teknik olarak basit. [Q3] | Düşük |

## Barındırma Seçenekleri (karşılaştırma notu)

Kesin seçim sonraki aşamalarda yapılacak. Aşağıdaki bilgiler bugünkü genel bilgiye dayanır ve seçimden önce sağlayıcıların güncel koşullarıyla yeniden kontrol edilmelidir. [Q7]

| Sağlayıcı | Ücretsiz hakların süresi | Not | Durum |
|---|---|---|---|
| Oracle Cloud | Süre sınırı yok ("Always Free") | Görece cömert; kullanılmayan sunucuyu geri alabiliyor; hesap açarken kart istiyor | Öncelikli aday [Q7] |
| Azure | 30 günlük kredi, bazı hizmetler 12 ay, birkaç küçük hizmet süresiz | 12 ay sonrası ücret riski var | Aday [Q7] |
| Google Cloud | 90 günlük kredi; yalnızca ABD'de çok küçük bir sunucu süresiz | Yalnızca karşılaştırma notu | Aday değil [Q7] |
| AWS | Yeni hesaplarda yaklaşık 6 aylık kredi; süresiz kısım sınırlı | AWS zorunlu değil (intent-statement) | Aday değil [Q7] |

Şu an hiçbir bulut hesabı ve alan adı yok; hesap açma işi bir bağımlılık olarak kayda alındı. [Q8]

## Maliyet

- Hedef aylık işletme maliyeti sıfır; yalnızca ücretsiz haklar kullanılır. [Q1]
- Hesap kredi kartıyla açılabilir; ücretsiz sınır aşılırsa ayda birkaç dolarlık aşım kabul edilir. [Q10]
- Önce sağlayıcının verdiği ücretsiz alt adres kullanılır. Oyun tutarsa kendi alan adı alınır (yılda yaklaşık 10–15 ABD doları; bugünkü kabul edilen bütçenin dışında, ileride karar verilecek). [Q9]

## Zaman ve Organizasyon

- Sabit bir yayın tarihi yok; oyun hazır olunca yayınlanır. Başarı ölçütlerindeki "ilk ay" süresi yayın günü başlar. [Q2]
- Geliştirme ve bakımı tek kişi, sınırlı yazılım bilgisiyle ve AI yardımıyla yapacak. Bu yüzden az parçalı, kendi kendine çalışan ve kolay yeniden başlatılabilen bir çözüm tercih edilmelidir. [Q7]
- İlk testleri oyunun sahibi ve bir arkadaş grubu yapacak (intent-statement).

## Mevzuat

- Kayıtlar IP adresi içermese de nick, cihaz türü, tarayıcı, ülke ve işlemler birlikte bir kişiyi tanımlayabilir; bu yüzden KVKK kapsamına girebilir. Kısa bir gizlilik bilgilendirmesi gösterilmesi kararlaştırıldı. [Q3]
- Bu bir hukuki görüş değildir. Yayından önce bilgilendirme metninin bir uzmana ya da güvenilir bir kaynağa göre gözden geçirilmesi önerilir.

## Oyun Adı

Adın "Gulyabani" içermesinin, piyasadaki aynı adlı kutu oyunuyla karışma riski kabul edildi. Kutu oyununun isimleri, metinleri ve görselleri kullanılmayacak. [Q5] [desc]

## Sonraki Aşamalara Notlar

- Başlıca riskler ve bağımlılıklar `raid-log.md`, kısıtlar `constraint-register.md` dosyasındadır.
- Niyet beyanındaki açık konular sürüyor: nihai oyun adı, bulut ve teknoloji seçimi, yayın aşamalarının plana eklenmesi (intent-statement).
- İnceleme notları R-05, R-06 ve R-07 Gereksinim Analizi'nde karara bağlanacak.

## Assumptions & Open Questions

None.
