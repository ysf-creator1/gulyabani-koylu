# Teslim Planlaması — Sorular

Bu aşama, yapım aşamasında 8 parçanın (U1–U8) hangi sırayla yapılacağını planlar. Her parça bir **Bolt** olarak yapılır: Bolt, işin bir parçası üzerinden yapılan ve sonunda çalışan bir şey bırakan tek bir yapım turudur. İlk Bolt kesindir: **yürüyen iskelet** (U1), yani yalnızca Gulyabani ve Köylü ile baştan sona oynanabilen en küçük tam oyun (team-practices Walking Skeleton). Parçaların birbirine dayanması (`unit-of-work-dependency.md`) sırayı büyük ölçüde belirler; U8 her durumda en sondadır, U7 de U5'ten sonra gelir.

Sahibin kuralı gereği (project.md Corrections) küçük ve teknik ayrıntıları ben seçiyorum; sahibe yalnızca iskeletten sonraki sıralama soruluyor. Benim seçtiğim varsayılanlar özet onayında gösterilir.

## Q1. [Ürün sahibi] İskeletten sonra hangi sırayla ilerleyelim?

İskelet (U1) onaylandıktan sonra kalan 7 parça tek tek, sırayla yapılacak. Soru, oyunun hangi yüzünü önce görmek istediğiniz: tam rol kadrosuyla oynanabilen oyunu mu, yoksa özgün kart çizimleri ve Rehber'i mi.

A) Önce oyunun tamamı (önerim): U2 oda ve lobi (9 rolün seçilebilmesi) → U3 rol yetenekleri → U4 mezarlık ve sohbet güvenliği → U5 bağlantı dayanıklılığı → U6 Rehber ve kart çizimleri → U7 kayıtlar, geri bildirim ve rapor → U8 kalite ve yük. 3. Bolt'tan sonra 9 rolün hepsiyle arkadaşlarınızla oynayabilirsiniz; en çok kural içeren ve en riskli parça (U3) erkenden yapılır. Kart çizimleri ve Rehber sona yakın gelir; o zamana kadar kartlarda yalnızca ad, simge ve kısa açıklama görünür.
B) Önce kartlar ve Rehber: U2 → U6 Rehber ve kart çizimleri → U3 → U4 → U5 → U7 → U8. Özgün kart çizimlerini ve Rehber'i 3. Bolt'ta görürsünüz (görünüm onayı resimle istenir); 9 rolün yetenekleri bir Bolt sonra gelir.
X) Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- **Q1 (sizin kararınız):** Sıra U1 iskelet → U2 oda ve lobi → U3 rol yetenekleri → U4 mezarlık ve sohbet güvenliği → U5 bağlantı dayanıklılığı → U6 Rehber ve kart çizimleri → U7 kayıtlar, geri bildirim ve rapor → U8 kalite ve yük. Bu, parçaların numara sırasıdır ve parçaların birbirine dayanmasına tam uyar.
- **Benim varsayılanım — Bolt büyüklüğü:** Her Bolt tek bir parçadır (8 Bolt). Her biri `main`'den açılan kendi geçici dalında yazılır, onaylanınca tek commit olarak `main`'e eklenir (team-practices Way of Working).
- **Benim varsayılanım — aynı anda yapım yok:** Bolt'lar teker teker yapılır; her parçanın tasarımı ve kodu bitip sizin onayınızı aldıktan sonra sıradakine geçilir. Bütün kodu yapay zekâ geliştirici yazar; onaylar sizdedir.
- **Benim varsayılanım — puanlama yok:** Ayrı bir puanlama modeli kullanmıyorum; sıra "önce iskelet, sonra en riskli ve en değerli" mantığıyla kuruldu (gerekçesi belgede).
- **Benim varsayılanım — iskelet baştan korumalı:** İskelet herkese açık adreste çalışacağı için üç küçük koruma U1'e alınır: sağlık kontrolü adresi (`/healthz`, oyun sürüyor mu bilgisiyle; yeni sürüm yükleme kuralınız buna dayanır), oda kodu ve mesaj denemelerine basit sınır, odaların ve sohbetlerin 24 saatte silinmesi. Kayıt ve geri bildirim silmeleri yine U7'de, ölçüm ve sınırların ince ayarı U8'dedir. (Önceki incelemelerdeki R-01, R-02 ve R-05 notları böyle kapanır.)
- **Benim varsayılanım — dış bağımlılıklar:** Sizin yapmanız gerekenler: (1) yapımın en başında Oracle ücretsiz hesabını kredi kartıyla açmak (U1'in sunucuya çıkmasını bekletir), (2) iskelet bitince gerçek telefonlarla bağlanma denemesi (Wi-Fi ve mobil veri), (3) v1 öncesi arkadaş grubuyla deneme oyunu, (4) yayından önce oyunun nihai adı. Küfür listesinin ilk hâlini ve "her gün yeni kelime" listesini ben hazırlarım, siz U3 ve U4'te gözden geçirirsiniz.
- **Benim varsayılanım — doğrulama komutu:** Programlama dili henüz seçilmediği için her parçayı denetleyecek komut şimdi yazılamaz; ilk parça bittiğinde (bot oyunculu uçtan uca test + kapsam ölçümü) size ayrıca sorulur.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
