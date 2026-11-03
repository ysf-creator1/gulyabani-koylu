# Fonksiyonel Tasarım — U1 Yürüyen İskelet — Sorular

Bu aşama, yürüyen iskeletin (U1: yalnızca Gulyabani ve Köylü ile baştan sona oynanabilen en küçük tam oyun) iş kurallarını, verilerini ve akışlarını yazar. Gereksinimler (`requirements.md`), hikâyeler (`stories.md`), parça tanımı (`unit-of-work.md`), sözleşmeler (`contract-summary.md`) ve Teslim Planlaması (`bolt-plan.md` B1) bu parçanın kurallarını zaten ayrıntılı belirliyor. Sahibin kuralı gereği (project.md Corrections) bu aşamada sahibe ayrı soru sorulmadı; açık kalan küçük kararları ben seçtim ve aşağıdaki özette onaya sunuyorum.

## Consolidated Summary Confirmation

- **Ayarlar iskelette sabit:** Ayarlar ekranı U2'de geldiği için iskelet varsayılan ayarlarla oynar: gündüz 4 dk, son söz 30 sn, onay oylaması 20 sn, gulyabani kararı 90 sn; gulyabani eşitliğinde eşitler arasında rastgele; oylama eşitliğinde yeniden oylama; oylar canlı görünür; çekimser yok; erken bitiş açık; ilk gece kaçırma var.
- **Gulyabani sayısı otomatik:** Rol havuzu paneli U2'de geldiği için iskelette gulyabani sayısı oyuncu sayısına göre önerilen sayıdır (3–7 oyuncu 1, 8–11 oyuncu 2, 12–17 oyuncu 3, 18–23 oyuncu 4, 24–26 oyuncu 5); kalan herkes Köylüdür.
- **Moderatör her zaman insan:** Moderatörün bağlantısı koparsa oyun ve sayaçlar durur, herkes "Moderatör bekleniyor" görür ve moderatör dönene kadar beklenir (devralma kuralı U5'te).
- **Her işlem önce kaydedilir:** Sunucu her komutu sırayla işler, kalıcı depoya yazdıktan sonra kabul eder; aynı komut iki kez gelirse bir kez işlenir.
- **Korumalar:** Sağlık kontrolü (oyun sürüyor mu bilgisiyle), oda kodu (dakikada 10) ve mesaj (10 saniyede 5) denemelerine sınır, oda–oyun–sohbet–oturum verisinin 24 saatte silinmesi iskelette vardır.
- **Komut yönlendirme:** Oda ve lobi komutları oda yöneticisine, oyun komutları oyun akışı üzerinden kural motoruna, sohbet komutları sohbet servisine gider; tablo belgede yazılıdır.
- **Ekranlar:** Moderatör ekranı telefonda sekmeli, bilgisayarda sütunludur; bütün metinler Türkçe metin dosyasından gelir; hata nedenleri kısa kodla gelir ve ekranda Türkçe gösterilir.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
