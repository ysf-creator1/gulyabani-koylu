# İzleme Gereksinimleri — U1 Yürüyen İskelet

Bu belge, iskeletin sağlık kontrolünü, günlüklerini, ölçümlerini ve hizmet hedeflerini (SLI/SLO) yazar. Uyarıların nereye gideceği ve dışarıdan izleme aracı izleme aşamasında seçilir (ISS-03); iskelet bunlar için gereken uçları ve ölçümleri hazırlar.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR13 sağlık kontrolü ve en az etkin oda, eşzamanlı bağlantı ve hata sayısı ölçümleri, günlüklerde IP yok; NFR6 %99 erişilebilirlik; NFR1 tepki süresi).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 `/healthz` alanları ve yayın denetimi; C6 olaylarda IP ve sohbet metni yok; Açık Sorular: dışarıdan izleme aracı).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A13 sağlık kontrolü, A14 bot testi) ve `functional-design/rules.md` (rules; BR10.4 IP yok, BR12.2 sağlık kontrolü, BR12.3 temizlik zamanlayıcısı).
- Operation kuralları: `memory/phases/operation.md` (SLO yüzde ve zaman penceresiyle; uyarı eşiği SLO ihlalinden önce; her bileşenin en az bir sağlık ve bir hata oranı ölçümü).
- Özet onayı: `nfr-requirements-questions.md` (Looks correct).

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR13.1 | Dışarıya açık `/healthz` yalnızca `{status: "ok", version}` döner; depoya ulaşılamıyorsa ya da açılış bitmediyse 503 döner. Sayılar yalnızca `127.0.0.1`'de dinleyen iç kapıdaki `/healthz`'ten verilir (security-requirements NFR7.12; C2'nin uygulama değişikliği orada listelidir): `activeRooms`, `activeMatches`, `connections`, `errorCount`. | Entegrasyon testi: iki kapıdaki `/healthz`'in alanları; açılış sırasında 503 | NFR13, C2, BR12.2 |
| NFR13.2 | Program günlüğü satır başına bir JSON kaydıdır ve standart çıktıya yazılır (sistem günlüğü toplar). Her kayıtta zaman, düzey, olay adı ve sürüm bulunur; olaya göre oda kodu, oyun numarası, komut adı, `commandId`, neden kodu ve süre (ms). Günlükte hiçbir zaman IP adresi, oturum belirteci, sohbet metni, nick ya da rol eşleşmesi bulunmaz (security-requirements NFR7.11, NFR8.4). | Birim testi: günlük biçimi ve yasak alanlar taranır | NFR13, C-14, BR10.4 |
| NFR13.3 | Günlük düzeyleri: `info` açılış, hazır, kapanış ve temizlik taraması sonuçları; `warn` hız sınırına takılan seller, koruma sınırının %80'i, sürüm çakışması; `error` her `internal_error` (yığın izi dahil, kişisel veri olmadan) ve açılış hataları. Normal oyun akışındaki her komut günlüğe yazılmaz (yalnızca reddedilen ve hatalı olanlar). Sistem günlüğü 7 gün ya da 200 MB'tan sonra eskileri siler. | Birim testi; altyapı ayarı | NFR13, NFR3 |
| NFR13.4 | Bellekte tutulan ölçümler: etkin oda sayısı, etkin oyun sayısı, bağlantı sayısı, hata sayısı (`internal_error` + başarısız silme + düşen olay), işlenen komut sayısı, son 5 dakikanın sunucu işleme süresi (%50 ve %95), temizlik taramasında silinen ve silinemeyen kayıt sayısı, program belleği. İç sağlık ucu bunları verir. | Birim testi: her komut ölçümleri günceller | NFR13, NFR1, NFR2 |
| NFR13.5 | Hizmet hedefleri (SLI → SLO): (a) Erişilebilirlik: başarılı dış `/healthz` denetimleri / bütün denetimler ≥ %99, 30 günlük kayan pencere (NFR6). (b) Hız: sunucu işleme süresi 150 ms altında kalan komutlar / bütün komutlar ≥ %95, 7 günlük kayan pencere (NFR1.1). (c) Hata: `internal_error` ile biten komutlar / bütün komutlar ≤ %0,1, 7 günlük kayan pencere. | İzleme aşamasında panoya bağlanır | NFR6, NFR1, NFR13 |
| NFR13.6 | Uyarı eşikleri SLO ihlalinden önce tetiklenir: dış `/healthz` art arda 2 denetimde (10 dakika) başarısızsa; 10 dakikada 10'dan fazla yeni hata sayılırsa; son 5 dakikanın %95 işleme süresi 300 ms'yi geçerse; bellek 400 MB'ı geçerse. Uyarının kime ve nasıl gideceği (ör. sahibe e-posta) izleme aşamasında, ücretsiz bir araçla kurulur. | İzleme aşaması (ISS-03) | NFR13, NFR6 |
| NFR13.7 | Dağıtık izleme (tracing) yoktur; tek süreç olduğu için bir komutun izi `commandId` ile günlükte takip edilir. | — | NFR13 |
| NFR13.8 | Bot oyunculu uçtan uca test bitince kısa bir rapor yazar: kazanan, oyun süresi, işlenen komut sayısı, sunucu işleme süresinin %95 değeri, reddedilen komutlar ve nedenleri. Construction doğrulama komutu bu raporu gösterir. | Bot testi | NFR13, NFR12, A14 |

## Assumptions & Open Questions

- [assumption] `connections` ve `errorCount` sözleşmede (C2) U8 alanı olarak yazılıydı; NFR13 bu ölçümleri baştan istediği ve maliyeti yalnızca iki sayaç olduğu için iskelette eklenir. Bu, sözleşmeye yalnızca erken ekleme yapar; U8 ek ölçümleri yine ekler.
- [assumption] Sistem günlüğünün 7 gün saklanması, günlükte kişisel veri olmadığı için 24 saat silme kuralıyla çakışmaz (oda kodu rastgele 6 rakamdır, kişiyi tanımlamaz).
- Açık soru: dışarıdan `/healthz` denetleyecek ücretsiz araç ve uyarı kanalı izleme aşamasında seçilir (contract-summary Açık Sorular, C2).
