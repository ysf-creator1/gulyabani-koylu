# Altyapı Tasarımı — U1 Yürüyen İskelet — Sorular

Bu aşama, oyunun çalışacağı ücretsiz Oracle sunucusunu, şifreli adresi, izlemeyi ve yeni sürümlerin sunucuya nasıl çıkacağını tasarlar. Teknik ayrıntıları sahibin kuralı gereği (project.md Corrections) ben seçiyorum; sahibe yalnızca para ve oyuncuların göreceği adresle ilgili iki büyük karar soruluyor.

## Q1. [Ürün sahibi] Oracle hesabının türü

Oracle'a kayıtta her iki türde de kart doğrulaması istenir. Fark, kullanılan ücretsiz makinenin ne kadar sorunsuz çalışacağıdır. Ücretsiz makine (4 çekirdeğe kadar güçlü makine) iki hesap türünde de ücretsizdir.

- A. Kart bağlı "kullandıkça öde" hesabı: ücretsiz makine yine ücretsiz kalır; Oracle boşta kalan makineyi durdurmaz ve güçlü ücretsiz makine daha kolay bulunur. Ücretsiz sınır aşılırsa ücret çıkabilir; bu yüzden 1 dolarlık harcama uyarısı kurulur ve ücretli hiçbir kaynak açılmaz.
- B. Tamamen ücretsiz hesap: karttan hiçbir zaman ücret çekilmez. Ama bir hafta kimse oynamazsa Oracle makineyi durdurabilir (yeniden açmak gerekir) ve güçlü makine bazen "kapasite yok" der; açmak birkaç gün denemeyi gerektirebilir.
- C. Önce tamamen ücretsiz hesapla başla; makine bulunamazsa ya da durdurulursa "kullandıkça öde" hesabına geç.
- X. Other (please specify)

[Answer]: C

## Q2. [Ürün sahibi] Oyunun internet adresi

Oyuncular oda linkini bu adresle paylaşır (ör. `https://<adres>/oda/123456`). Şifreli bağlantı için bir adres gerekir; yalnızca IP numarası yetmez.

- A. Ücretsiz alt adres (DuckDNS), ör. `gulyabani.duckdns.org`: ücretsiz, birkaç dakikada hazır; ileride istenirse kendi adrese geçilir.
- B. Kendi alan adını satın almak, ör. `gulyabani.com` ya da `gulyabani.net`: yılda yaklaşık 10–15 dolar; sıfır bütçe kuralının dışındadır, ancak sizin açık onayınızla.
- C. Şimdilik ücretsiz alt adres, v1 yayınından önce kendi alan adına geçiş.
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- **Hesap ([Q1] C):** Önce tamamen ücretsiz Oracle hesabı açılır. Güçlü ücretsiz makine bulunamazsa ya da Oracle makineyi boşta diye durdurursa "kullandıkça öde" hesabına geçilir; o zaman 1 dolarlık harcama uyarısı kurulur ve ücretli hiçbir şey açılmaz.
- **Adres ([Q2] A):** Ücretsiz DuckDNS alt adresi (ör. `gulyabani.duckdns.org`); ileride istenirse kendi alan adına geçilir.
- **Sunucu:** Oracle'ın Türkiye'ye yakın bir Avrupa bölgesinde (önce Milano, olmazsa Frankfurt) ücretsiz ARM makine: hedef 2 çekirdek ve 12 GB bellek, Ubuntu 24.04. Bölge hesap açılırken bir kez seçilir, sonra değişmez.
- **Güvenlik:** Dışarıya yalnızca web kapıları (80 ve 443) ve yönetim için şifresiz, anahtarlı bağlantı (SSH) açıktır. Şifreli bağlantıyı Caddy yapar ve sertifikayı kendisi alır. Oyun programı sunucunun içinde, kendi yetkisiz kullanıcısıyla çalışır.
- **Kurulum:** Sunucunun içindeki her ayar depodaki betiklerle yapılır; Oracle hesabındaki birkaç adımı (hesap, makine, ağ kuralları, adres) sizinle adım adım yaparız.
- **Otomatik denetimler:** Her kod değişikliğinde GitHub'da biçim, testler, bot oyunu, erişilebilirlik, paket boyutu ve güvenlik denetimleri çalışır; geçmeyen parça `main`'e eklenmez.
- **Yayın:** Yeni sürüm sunucuya yalnızca sizin onayınızla, sürüm etiketiyle ve hiç oyun sürmüyorken çıkar. Ardından kısa bir kontrol yapılır (sayfa açılıyor, oda kurulabiliyor, bir oyuncu katılabiliyor); başarısızsa kendiliğinden önceki sürüme dönülür.
- **İzleme:** Sunucu çalışmazsa, hatalar artarsa, oyun yavaşlarsa ya da makine zorlanırsa e-postanıza uyarı gelir (Oracle'ın ücretsiz izlemesi ve ücretsiz UptimeRobot). Uyarıların kurulumu izleme aşamasında yapılır; iskelette kayıtlar ve sağlık uçları hazır olur.
- **Yedek:** Oda verisi 24 saat yaşadığı için yedeklenmez; sunucu kaybolursa betiklerle yeniden kurulur.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
