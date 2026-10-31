# Parçalara Bölme Soruları — Gulyabani–Köylü (çalışma adı)

Bu aşama, oyunu yapım aşamasında tek tek yazılıp sınanacak parçalara (birimlere) böler. Sahibin kuralı gereği (project.md Corrections) yalnızca büyük karar soruldu; diğer ayrıntılar aşağıdaki "Benim seçtiğim varsayılanlar" bölümündedir ve özet onayıyla birlikte onaylanır.

## Q1. [Mimar] Oyunu kaç parçaya bölelim?

Her parça yapım aşamasında ayrı yazılır, test edilir ve senin onayınla `main`'e eklenir. İlk parça her zaman yürüyen iskelettir (yalnızca Gulyabani ve Köylü ile baştan sona tam oyun). Önerilen 8 parça:

1. Yürüyen iskelet — oda kurma, katılma, lobi, rol dağıtımı, gece, sabah, gündüz, oylama, oyun sonu, sayfa yenilenince dönme, bot oyunculu uçtan uca test
2. Oda ve lobinin tamamı — bekleme ekranı, ayarlar, rol havuzu ve 9 rolün tanımları, lobide çıkarma ve 30 dakika yasak, "Yeni isteklere kapat", moderatörlük devri, 22 saat kuralı
3. Rol yetenekleri — 7 özel rol (Boşboğaz, Bekçi, Ürkek, Ahbaplar, Celalli Damat, Dertli, Görücü/sevdalılar), tam ölüm zinciri, oyun sırasında oyuncu çıkarma
4. Mezarlık ve sohbet güvenliği — Mezarlık Sohbeti, hayalet modu, kelime filtresi, mesaj şikayeti
5. Bağlantı dayanıklılığı — kopan oyuncunun sırası, moderatör kaybolursa kuralı, sunucu yeniden başlayınca sürme, ikinci sekme, moderatör onayıyla dönme
6. Rehber ve kartlar — Rehber'in üç sekmesi, 9 kartın özgün çizimleri
7. Kayıtlar, geri bildirim ve rapor — IP'siz olay kaydı, 24 saat / 1 ay / 1 yıl silmeleri, oyun sonu geri bildirimi, "Sorun bildir", sahibe rapor
8. Kalite ve yük — tüm roller için gizli bilgi testi, 50 odalık yük testi, hız sınırları, erişilebilirlik ve telefon kontrolü

A. Önerilen 8 parça (yukarıdaki liste)
B. Daha az ve büyük parça (5 parça: 2+6, 3+4, 7+8 birleşir) — onay sayısı azalır, her parça daha uzun sürer
C. Daha çok ve küçük parça (yaklaşık 12 parça) — her parça kısa sürer, ama çok daha fazla onay gerekir
X. Other (please specify)

[Answer]: A

## Benim seçtiğim varsayılanlar (özet onayıyla onaylanır)

- **Bölme biçimi:** özelliğe göre dikey dilimler; her parça sunucu, ekran ve testleriyle birlikte çalışan bir özellik ekler.
- **Program yapısı:** bütün parçalar tek bir sunucu programının içindedir (tek ücretsiz Oracle sunucusu, sıfır bütçe; C-01, C-10, C-11). Yapı taşları program içinde ayrı modüllerdir, birbirine yalnızca tanımlı arayüzlerle bağlanır (Alan Tasarımı ADR-001…ADR-005).
- **Sıra ve paralellik:** parçalar arasında yalnızca gerçek bağımlılık oku vardır; aralarında ok olmayan parçalar aynı anda yazılabilir. Hangi parçanın önce yapılacağına Teslimat Planlaması karar verir.
- **Parçalar arası bağlantı:** aynı program içinde doğrudan çağrı ve olaylar; ayrı ağ arayüzü yoktur. Biçimleri Sözleşme Tasarımı aşamasında yazılır.
- **Parça türleri:** 7 parça `service` (sunucu + ekran + test içeren özellik dilimi), Rehber ve kartlar parçası `ui` (ekran ve içerik ağırlıklı).
- **Bağımlılıklar:** 2 ve 4 iskelete; 3 ve 6, 2'ye; 5, 3 ve 4'e; 7, 5'e; 8, 6 ve 7'ye dayanır. 3 ile 4, 4 ile 6 gibi aralarında ok olmayan parçalar aynı anda yazılabilir.
- **İskelet sunucuda:** iskelet baştan ücretsiz Oracle sunucusunda dış adreste çalışır ve bot oyunculu testle doğrulanır (team-practices Walking Skeleton).
- **Alan Tasarımı'ndan devreden R-01 (24 saat silme sahipliği):** 24 saatlik oda, oyun ve sohbet silmesi parça 7'de yazılır; her veriyi kendi sahibi siler, oturum (Session) verisinin silinmesi de bu parçadadır.

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
