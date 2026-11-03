# Hız Gereksinimleri — U1 Yürüyen İskelet

Bu belge, yürüyen iskeletin tepki süresi, zaman doğruluğu ve telefonda açılış hedeflerini ölçülebilir biçimde yazar. Tam yük altındaki ölçüm U8'in yük testindedir; iskelet aynı hedefleri tek odada, bot oyunculu uçtan uca testle ölçer.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR1 tepki süresi %95'te 1 saniye, NFR2 yük, NFR10 cihaz ve tarayıcı, NFR14 zaman doğruluğu; varsayım A20, A22).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 tam görünüm ve `serverTime`, istemcinin 20 saniyede bir `ping`'i; C5 görünüm biçimi; Açık Sorular: tam görünümün 26 kişilik odada hız hedefini karşılaması, gerekirse sohbet geçmişinin son N mesajla sınırlanması).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A12 komut işleme sırası, A14 bot testi) ve `functional-design/rules.md` (rules; BR4.7 gece görünümünün herkese aynı anda gitmesi, BR9.6 sunucu saati, BR10.2 önce kayıt sonra kabul).
- Özet onayı: `nfr-requirements-questions.md` (Q1 TypeScript, Q2 SQLite; Looks correct).

## Ölçüm Noktaları

- **Sunucu işleme süresi:** komutun sunucuya ulaşmasından, kalıcı yazımın bitip odadaki herkese yeni görünümün gönderilmeye başlanmasına kadar.
- **Uçtan uca yansıma:** bir oyuncunun işleminden diğer ilgili ekranların değişmesine kadar (NFR1'in asıl ölçüsü; ağ dahil).

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR1.1 | Sunucu işleme süresi (sıra, doğrulama, kural, SQLite yazımı, görünüm üretimi dahil) NFR2 yükünde komutların %95'inde en fazla 150 ms, %99'unda en fazla 400 ms'dir. İskelette tek odada 26 bot oyuncuyla %95'te en fazla 100 ms'dir. | Bot testi her komutun sunucu işleme süresini ölçer ve %95 değerini raporlar. Paylaşılan CI makinesinde ölçüm kararsız olabileceği için CI'da engelleyici sınır 3 katıdır (%95'te 300 ms); 100 ms sınırı Oracle sunucusundaki iskelet denemesinde engelleyicidir. NFR2 yükünde U8 ölçer. | NFR1, BR10.2 |
| NFR1.2 | Uçtan uca yansıma, normal bir mobil bağlantıda ve NFR2 yükünde, işlemlerin %95'inde en fazla 1 saniyedir. | U8 yük testi; iskelette gerçek telefon denemesinde gözle (sahibin iskelet denemesi) | NFR1 |
| NFR1.3 | Kalıcı yazım grup kaydıyla yapılır (reliability-requirements NFR5.1, tech-stack-decisions TD-04): aynı anda hazır olan bütün komutların yazımı tek bir tam eşitlemeli disk kesinleştirmesinde toplanır. Bir toplu kesinleştirme sunucu diskinde %95'te en fazla 20 ms sürer ve depo saniyede en az 300 komutu (tasarım zirvesi saniyede yaklaşık 130 komutun iki katından fazlası, scalability-requirements Yük Tahmini) %95'te 150 ms sunucu işleme süresini bozmadan yazar. Komut başına ayrı kesinleştirmede 20 ms'lik süre saniyede yalnızca yaklaşık 50 komuta izin verirdi; grup kaydı bu yüzden zorunludur. | Yazım ölçüm testi: saniyede 300 komutluk yük, toplu kesinleştirme süresi ve komut işleme süresi ölçülür; Oracle sunucusunda iskelet denemesinde engelleyici olarak doğrulanır | NFR1, NFR2, NFR5, C9 |
| NFR1.4 | Odadaki komutlar art arda geldiğinde (ör. oylamada), sunucu bir alıcıya en fazla 50 ms aralıkla tek bir güncel görünüm gönderir (görünümler birleştirilir); son komuttan sonra görünüm en geç 50 ms içinde gider. Gece adım değişiminde görünüm odadaki herkese aynı turda gider (BR4.7). | Birim testi: 26 hızlı oyda alıcı başına giden görünüm sayısı oy sayısından az; son görünüm son oyu içerir | NFR1, NFR2, C1 |
| NFR1.5 | 26 oyunculu bir odada tek bir alıcının görünümü en fazla 32 KB JSON'dur. Bunun için görünümdeki her sohbet kanalı son 100 mesajla sınırlıdır (sözleşmedeki açık sorunun cevabı; eski mesajlar depoda durur, görünüme girmez). | Birim testi: 26 oyuncu ve dolu sohbetle görünüm boyutu ölçülür | NFR1, NFR2, C1, C5 |
| NFR1.6 | Telefonda ilk açılış: sayfanın betik ve stil dosyaları sıkıştırılmış hâlde toplam en fazla 150 KB'tır; orta sınıf bir Android telefonda 4G bağlantıyla sayfa en fazla 3 saniyede kullanılabilir olur. Betik ve stil dosyalarının adında içerik özeti bulunur ve uzun süre önbellekte tutulur (C2 `/static`). | CI'da paket boyutu denetimi (sınırı aşarsa başarısız); açılış süresi iskelet denetiminde tarayıcının mobil ölçüm aracıyla | NFR1, NFR10, C2 |
| NFR10.1 | Arayüz 320 piksel genişlikten itibaren yatay kaydırma olmadan kullanılır; desteklenen tarayıcılar Android Chrome, iPhone Safari (iOS 16 ve sonrası) ve masaüstü Chrome, Firefox, Edge ve Safari'nin son iki ana sürümüdür. Derleme hedefi bu tarayıcıların hepsinin desteklediği dil sürümüdür. Desteklenmeyen tarayıcıda kısa uyarı gösterilmesi bilinçli olarak U8'e ertelenmiştir (functional-spec Kapsam: "tarayıcı uyarısı (U8)"). | Erişilebilirlik ve ekran testlerinde 320 px genişlik denetlenir; iskelet denemesi Android Chrome ve iPhone Safari'de yapılır | NFR10, BR13.2 |
| NFR14.1 | Ekrandaki geri sayım sunucudaki bitiş zamanından en fazla 1 saniye sapar, telefonun saati yanlış olsa da. İstemci her `view` ve `pong` mesajındaki `serverTime` ile saat farkını hesaplar (gidiş-dönüş süresinin yarısı düzeltmesiyle) ve 20 saniyede bir `ping` ile yeniler. | Birim testi: istemci saati 5 dakika kaydırılmış bot, kalan süreyi sunucuyla 1 saniye içinde hesaplar (A14'ün "sayaçlar sunucu saatine uydu" denetimi) | NFR14, BR9.6, C1 |

## Kaynak Kullanımı Bütçesi

| Kaynak | Bütçe (NFR2 yükünde) | Neden |
|---|---|---|
| Sunucu programının belleği | en fazla 512 MB | En küçük ücretsiz Oracle makinesinde de çalışabilsin (Altyapı Tasarımı makineyi seçer) |
| İşlemci | ortalama %70'in altında | Ani oylama yığılmalarına pay kalsın |
| Disk yazımı | komut başına bir işlem | Önce kayıt sonra kabul (BR10.2) |

## Assumptions & Open Questions

- [assumption] 150 ms ve 100 ms sunucu işleme hedefleri, 1 saniyelik uçtan uca hedefin (NFR1) çoğunu mobil ağa bırakmak için seçildi; U8 ölçümüyle değiştirilebilir.
- [assumption] Görünüm birleştirme aralığı (50 ms) ve sohbet geçmişi sınırı (kanal başına son 100 mesaj) benim seçtiğim varsayılanlardır; görünüm her zaman tam olduğu için (C1) birleştirme hiçbir bilgiyi kaybettirmez.
- [assumption] Görünümler sıkıştırılmadan gönderilir; U8 yük testi bant genişliğini sorun olarak gösterirse WebSocket sıkıştırması eklenir.
- Açık soru: Oracle makinesinin türü (Ampere A1 ya da küçük AMD) Altyapı Tasarımı'nda seçilir; NFR1.3'ün disk süresi orada gerçek makinede doğrulanır.
