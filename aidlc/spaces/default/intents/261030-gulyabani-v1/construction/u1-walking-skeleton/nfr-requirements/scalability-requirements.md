# Ölçek Gereksinimleri — U1 Yürüyen İskelet

Bu belge, iskeletin hangi yükü taşıyacak biçimde tasarlandığını, büyümenin nasıl karşılanacağını ve maliyet sınırını yazar. Bütün parçalar tek sunucu programının içindedir ve tek ücretsiz Oracle sunucusunda çalışır (unit-of-work); yatay büyüme v1'de yoktur.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR2 ölçek — 50 oda, oda başına 26 oyuncu + moderatör, yaklaşık 1.350 bağlantı; NFR3 maliyet sıfır; C-08 boşta maliyet yaklaşık sıfır; ASM-02 ücretsiz sunucu kapasitesi ölçülerek doğrulanacak).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 her bağlı kişi tek bağlantı, tam görünüm; C9 tek paylaşılan depo ve ayrık bölümler; Açık Sorular: tam görünümün 50 odada hız hedefini karşılaması).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A12 her odanın tek sırası) ve `functional-design/rules.md` (rules; BR2.1 en fazla 26 oyuncu, BR10.2 odanın tek sırası, BR12.1 24 saatte silme).
- Özet onayı: `nfr-requirements-questions.md` (Q2 SQLite; Looks correct).

## Yük Tahmini

| Büyüklük | Değer | Dayanak |
|---|---|---|
| Aynı anda etkin oda | 50 (tasarım hedefi), en fazla 300 (koruma sınırı) | NFR2; security-requirements NFR7.7 |
| Oda başına kişi | en fazla 27 (26 oyuncu + moderatör) | BR2.1 |
| Eşzamanlı bağlantı | yaklaşık 1.350 (hedef), en fazla 2.000 (koruma sınırı) | NFR2; NFR7.7 |
| En yoğun an | oylamada bir odada 10 saniyede 26 oy; 50 odada aynı anda olursa saniyede yaklaşık 130 komut | BR6.5 |
| Görünüm trafiği | birleştirme olmadan komut başına 27 görünüm; birleştirmeyle alıcı başına en fazla 50 ms'de bir görünüm | performance-requirements NFR1.4 |
| Oda başına veri | en fazla yaklaşık 1 MB (oyun kaydı + sohbet) | NFR1.5 sohbet sınırları |
| Toplam veri | en fazla yaklaşık 300 MB; her oda 24 saatte silindiği için büyümez | BR12.1 |

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR2.1 | Tek sunucu programı aynı anda 50 odayı, oda başına 26 oyuncu ve moderatörle (yaklaşık 1.350 bağlantı) hız hedeflerini (NFR1.1, NFR1.2) bozmadan taşıyacak biçimde tasarlanır. | U8 yük testi; iskelette tek oda 26 bot | NFR2 |
| NFR2.2 | Her odanın komutları kendi tek sırasında işlenir (BR10.2); odalar birbirini beklemez. Odalar arasında paylaşılan tek şey oyun deposudur: SQLite'a tek yazar yazar ve aynı anda hazır olan farklı odaların yazımlarını tek bir disk kesinleştirmesinde toplar (grup kaydı, NFR1.3, TD-04); her komut kendi geri alma noktasıyla ayrı kalır. Böylece yazım hızı komut sayısıyla değil, kesinleştirme sayısıyla sınırlanır ve saniyede en az 300 komut taşınır. | Birim testi: iki odanın komutları birbirini beklemeden işlenir; yazım ölçüm testi NFR1.3 | NFR2, BR10.2, C9 |
| NFR2.3 | Görünüm üretimi alıcı başına yapılır ve art arda gelen komutlarda birleştirilir (NFR1.4); böylece en yoğun anda bile görünüm sayısı komut sayısıyla değil, alıcı sayısıyla sınırlıdır. | Birim testi (NFR1.4) | NFR1, NFR2 |
| NFR2.4 | Sunucu programı NFR2 yükünde en fazla 512 MB bellek kullanır; bellekte yalnızca etkin odaların durumu, sıraları, hız sayaçları ve bağlantılar tutulur; silinen odanın her şeyi bellekten de atılır. | U8 yük testi bellek ölçümü; birim testi: silinen oda bellekte kalmaz | NFR2, BR12.1 |
| NFR2.5 | Genel koruma sınırları: en fazla 2.000 bağlantı, en fazla 300 etkin oda (security-requirements NFR7.7). Sınırın %80'ine ulaşılınca uyarı günlüğe yazılır. | Birim testi | NFR2, NFR7 |
| NFR2.6 | Büyüme yolu yalnızca dikeydir: yük artarsa ücretsiz kullanım hakkı içinde daha büyük bir Oracle makinesine geçilir. Geçiş tetikleri: işlemci 5 dakika boyunca ortalama %70'in üstünde ya da sunucu işleme süresi %95'te 300 ms'yi aşıyor ya da bellek 400 MB'ı geçiyor (observability-requirements NFR13.4 ölçümleri). İkinci bir sunucuya bölme v1'de yoktur. | Altyapı Tasarımı'nda makine seçimi; izleme aşamasında uyarı | NFR2, NFR3 |
| NFR3.1 | Aylık işletme maliyeti sıfırdır: dil, çalışma ortamı, depo, ön program ve test araçlarının hepsi ücretsiz ve açık kaynaktır; ücretli bir hizmet kullanılmaz. Oracle hesabında harcama uyarısı kurulur (ayrıntısı Altyapı Tasarımı'nda). | tech-stack-decisions'daki her seçimin lisansı ve ücreti denetlenir | NFR3, C-01, C-02 |
| NFR3.2 | Veri büyümesi sınırlıdır: oda verisi 24 saatte silinir (BR12.1), sohbet kanalı başına mesaj sayısı oyun boyunca en fazla 2.000'dir (aşanların en eskisi silinir), böylece disk ihtiyacı ücretsiz disk hakkının çok altında kalır. | Birim testi: 2.001. mesajda en eski silinir | NFR3, C-15 |

## Assumptions & Open Questions

- [assumption] Saniyede yaklaşık 130 komutluk en kötü durum, 50 odanın aynı saniyelerde oylama yaptığı varsayımıdır; gerçekte odalar farklı fazlarda olacağı için yük daha düşüktür.
- [assumption] Sohbet kanalı başına 2.000 mesaj üst sınırı, 26 kişilik bir odanın bir akşamlık oyununu rahatça karşılar; sınır yalnızca diski ve belleği korumak içindir.
- Açık soru: ücretsiz sunucunun NFR2 yükünü gerçekten taşıdığı (ASM-02) U8'in yük testinde ölçülür; taşımazsa önce NFR1.4 ve NFR1.5'teki sınırlar ayarlanır, sonra makine büyütülür.
