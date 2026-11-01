# Dış Bağımlılıklar — Gulyabani–Köylü (çalışma adı)

Bu belge, yapımı bekletebilecek dış işleri ve bunların hangi **Bolt**'u etkilediğini gösterir. Bolt, işin bir parçası (bir birim) üzerinden yapılan ve sonunda çalışan, sınanmış bir şey bırakan tek bir yapım turudur (sıra: `bolt-plan.md`). Kod yazımı tamamen yapay zekâ tarafından yapıldığı için dış bağımlılıkların çoğu sahibin yapması gereken işlerdir.

## Sources

- Fizibilite bağımlılıkları: `ideation/feasibility/raid-log.md` (DEP-01…DEP-04).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; Kısıtlar, Açık Sorular ISS-01…ISS-03, DEP-04, ASM-02).
- Parçalar ve bağımlılıklar: `inception/units-generation/unit-of-work.md` (unit-of-work; U1 ön koşulları, U3 ve U4 açık soruları), `inception/units-generation/unit-of-work-dependency.md` (unit-of-work-dependency), `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map).
- Hikâyeler, ekranlar ve yapı taşları: `inception/user-stories/stories.md` (stories), `inception/refined-mockups/mockups.md` (mockups), `inception/domain-design/components.md` (components).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; Açık Sorular C2, C4, C9).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; Oracle hesabı yapımın başında, gerçek telefon denemesi).
- [Q1]: `delivery-planning-questions.md` — özet onayı: Looks correct.

## Bağımlılık Tablosu

| # | Bağımlılık | Kim sağlar | Ne zaman gerekli | Ne kadar sürer | Beklettiği Bolt | Gecikirse ne yaparız |
|---|---|---|---|---|---|---|
| DEP-01 | Oracle Cloud ücretsiz hesabının kredi kartıyla açılması (ücret alınmaz) | Sahip | Yapımın en başında, B1 sunucuya çıkmadan önce | Bir oturum; hesap onayı birkaç saat ile birkaç gün sürebilir | B1 (sunucuya çıkış ve telefon denemesi) | B1 bilgisayarda ve bot testiyle ilerler; hesap açılamazsa Azure ücretsiz hesabı yedektir |
| DEP-02 | Barındırma sağlayıcısının verdiği ücretsiz alt adres ve şifreli bağlantı sertifikası | Barındırma sağlayıcısı (sahibin hesabıyla) | B1 sunucuya çıkarken | Sunucu kurulumu sırasında | B1 (dış adresten telefon denemesi) | Ücretsiz bir alt adres hizmeti kullanılır; ücretli alan adı sahibin onayı olmadan alınmaz (project.md Forbidden) |
| DEP-03 | Testlere katılacak arkadaş grubu | Sahip | İskelet onayında birkaç telefon; v1 öncesinde (B8) tam deneme oyunu | Bir akşam | B1 denetim noktası (en az sahibin kendi telefonları); B8 | İskelet denemesi sahibin kendi telefonları ve bot testiyle yapılabilir; tam deneme oyunu yayından önceye kayar |
| DEP-04 | Kelime filtresi için Türkçe küfür/hakaret listesi | Ben hazırlarım; sahip gözden geçirir | B4'ten önce | Kısa | B4 | Küçük bir başlangıç listesiyle başlanır, sonra genişletilir |
| A19 | "Her gün yeni kelime" listesi (en az 30 Türkçe kelime) | Ben hazırlarım; sahip gözden geçirir | B3'ten önce | Kısa | B3 | Başlangıç listesiyle başlanır |
| ISS-02 | Programlama dili ve kalıcı depo ürününün seçimi | Ben öneririm; sahip onaylar | B1'in NFR ve altyapı aşamalarında | B1 tasarımı sırasında | B1 | — (B1'in parçası) |
| ISS-01 | Oyunun nihai adı | Sahip | v1 yayınından önce | — | Hiçbir Bolt'u bekletmez; yalnızca yayını | "Gulyabani–Köylü" çalışma adıyla devam edilir |
| ISS-03 | Yayın aşamaları (ortam kurulumu, dağıtım, izleme) | Sonraki çalışma planı | v1 yayınından önce | — | Hiçbir Bolt'u bekletmez; yalnızca yayını | İskelet ve erken sürümler elle, sahibin onayıyla sunucuya konur (team-practices Deployment) |
| ASM-02 | Ücretsiz sunucu kapasitesinin hedef yükü taşıdığının doğrulanması | Ölçüm (B8 yük testi) | v1 yayınından önce | B8 içinde | B8 | Sohbet geçmişi sınırı ya da görünüm küçültme; gerekirse ayda birkaç dolarlık aşım sahibin onayıyla (project.md Mandated) |

## Bolt'a Göre Özet

- **B1:** DEP-01 (Oracle hesabı), DEP-02 (ücretsiz alt adres), ISS-02 (dil ve depo seçimi), DEP-03'ün ilk payı (gerçek telefon denemesi).
- **B2:** Dış bağımlılık yok.
- **B3:** A19 (kelime listesi).
- **B4:** DEP-04 (küfür listesi).
- **B5, B6, B7:** Dış bağımlılık yok. (B6'da kart görünümü sahibe resimle gösterilir; bu bir onaydır, dış bağımlılık değildir.)
- **B8:** ASM-02 (yük ölçümü), DEP-03 (arkadaş grubuyla deneme oyunu).
- **Yayın (yapımdan sonra):** ISS-01 (oyunun adı), ISS-03 (yayın aşamaları).

## Assumptions & Open Questions

- [assumption] Oracle ücretsiz hesabı kredi kartı ister ama ücret almaz; ücretsiz sınır aşılmadıkça maliyet sıfırdır (project.md Mandated, C-01).
- Açık soru (contract-summary C2): acil bir hata düzeltmesi oyun sürerken gerekirse ne yapılacağı ve sağlık kontrolünü dışarıdan izleyecek ücretsiz bir araç gerekip gerekmediği; yayın aşamalarında (ISS-03) kararlaştırılır.
