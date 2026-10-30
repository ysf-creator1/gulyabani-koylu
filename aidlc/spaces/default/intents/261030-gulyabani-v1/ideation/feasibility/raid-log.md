# RAID Kaydı — Gulyabani–Köylü (çalışma adı)

Riskler, varsayımlar, sorunlar ve bağımlılıklar. Onaylanan niyet beyanına (intent-statement) ve bu aşamanın cevaplarına dayanır. Kimlikler, intent-capture inceleme notlarıyla (R-05 vb.) karışmasın diye RSK/ASM/ISS/DEP ile başlar.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- [Q1]–[Q10]: `feasibility-questions.md` içindeki cevaplar.
- Onaylanan niyet beyanı: `ideation/intent-capture/intent-statement.md` (intent-statement).

## Riskler

| ID | Risk | Olasılık | Etki | Önlem | Kaynak |
|---|---|---|---|---|---|
| RSK-01 | Telefonda başka uygulamaya geçince ya da ekran kilitlenince bağlantı kopar; "kimse kopmadan" ölçütü tutmaz | Yüksek | Yüksek | Yeniden bağlanma kesintisiz olmalı; kopan oyuncunun durumu korunmalı; rehberde kısa kullanım ipucu; gerçek telefonlarla test | [Q6], intent-statement |
| RSK-02 | Ücretsiz sunucu hakları değişir ya da sağlayıcı boşta kalan sunucuyu geri alır | Orta | Yüksek | Seçimden önce güncel koşulları kontrol et; kurulumu yeniden yapılabilir tut; yedek aday (Azure) | [Q1], [Q7] |
| RSK-03 | Kart tanımlı hesapta ücretsiz sınır aşılır, beklenmedik ücret çıkar | Düşük | Orta | Harcama uyarısı kur; ayda birkaç doları aşarsa durumu yeniden değerlendir | [Q10] |
| RSK-04 | Azure seçilirse 12 ay sonra ücretsiz haklar biter | Orta | Orta | Seçimde süresiz haklar tercih edilir; 12. ay öncesi hatırlatma | [Q7] |
| RSK-05 | Kayıtlardaki bilgiler birlikte bir kişiyi tanımlar (KVKK) | Orta | Orta | Kısa gizlilik bilgilendirmesi; yalnızca gerekli bilgiyi topla; 1 yıl sonra sil; hukuki görüş değildir | [Q3], intent-statement |
| RSK-06 | Herkese açık sohbette hakaret; Türkçe kelime filtresi atlatılır ya da yanlış engeller | Orta | Orta | Moderatörün oyuncuyu çıkarması + filtre + şikayet; şikayetler raporda izlenir | [Q4] |
| RSK-07 | Adın kutu oyunuyla karıştırılması | Düşük | Orta | Risk kabul edildi; kutu oyununun isim, metin ve görselleri kullanılmaz | [Q5] |
| RSK-08 | Tek bakımcı ve sınırlı yazılım bilgisi: arıza uzun sürer, karmaşık çözüm sürdürülemez | Orta | Yüksek | Sade çözüm; açık kurulum ve sorun giderme notları; kolay yeniden başlatma | [Q7] |
| RSK-09 | 1 yıllık kayıtlar ücretsiz depolama sınırını aşar | Düşük | Düşük | Kayıt hacmini izle; gerekirse eski ayrıntıları özetle | [Q1], intent-statement |

## Varsayımlar

| ID | Varsayım | Doğrulama | Kaynak |
|---|---|---|---|
| ASM-01 | Görüntü ve ses, oyun dışında ayrı bir görüntülü toplantı uygulamasıyla sağlanır; oyunun kendisi sesli/görüntülü görüşme sunmaz | Gereksinim Analizi'nde teyit | intent-statement, [Q6] |
| ASM-02 | Ücretsiz sunucu kapasitesi, aynı anda yaklaşık 50 oda yüküne yeter | Barındırma seçilirken ölçülerek doğrulanır (RSK-02) | [Q1], [desc] |
| ASM-03 | Karşılaştırma tablosundaki ücretsiz hak bilgileri hâlâ geçerli | Seçimden önce sağlayıcı sayfalarından kontrol | [Q7] |

## Sorunlar (açık konular)

| ID | Konu | Ne zaman ele alınacak | Kaynak |
|---|---|---|---|
| ISS-01 | Nihai oyun adı belirlenmedi | Yayından önce | intent-statement |
| ISS-02 | Bulut sağlayıcısı ve teknoloji seçimi açık (adaylar: Oracle Cloud, Azure) | Tasarım aşamalarında | [Q7], intent-statement |
| ISS-03 | Yayın aşamaları çalışma planında yok | Plan güncellenirken | intent-statement |
| ISS-04 | İnceleme notları R-05, R-06, R-07 | Gereksinim Analizi | intent-statement |

## Bağımlılıklar

| ID | Bağımlılık | Kaynak |
|---|---|---|
| DEP-01 | Oracle Cloud (ve gerekirse Azure) ücretsiz hesabının kredi kartıyla açılması | [Q8], [Q10] |
| DEP-02 | Barındırma sağlayıcısının verdiği ücretsiz alt adres | [Q9] |
| DEP-03 | Testlere katılacak arkadaş grubu | intent-statement |
| DEP-04 | Kelime filtresi için bir Türkçe küfür/hakaret kelime listesi | [Q4] |

## Assumptions & Open Questions

None.
