# Kullanıcı Hikâyeleri Değerlendirmesi — Gulyabani–Köylü (çalışma adı)

## Karar

**Uygula (Execute).** Bu proje için kullanıcı hikâyeleri yazılacak.

## Gerekçe

Gulyabani–Köylü, tarayıcıdan oynanan, baştan sona kullanıcıya dönük bir oyundur. Aynı oyunda birbirinden çok farklı şeyler gören ve yapan kişiler vardır (moderatör, yaşayan oyuncu, ölü oyuncu, oyunun sahibi). Kurallar karmaşıktır: 9 rol, gece adım sırası, ölüm sonrası etki zinciri, oylama ve eşitlik kuralları, kazanma sırası, gizli bilginin kime gideceği. Gereksinimler (`inception/requirements-analysis/requirements.md`, FR1–FR21 ve NFR1–NFR15) bu kuralları sistem açısından anlatıyor; hikâyeler aynı kuralları her kişinin gözünden, test edilebilir kabul ölçütleriyle yazacak ve yürüyen iskelet (yalnızca Gulyabani ve Köylü) ile sonraki parçaların sınırını görünür kılacak.

## Değerlendirilen etkenler

- **Proje türü:** sıfırdan yazılan (greenfield) bir web oyunu; yeniden düzenleme ya da yalnızca altyapı işi değil.
- **Kullanıcıya dönük kapsam:** ana sayfa, lobi, kart, gece, sabah, gündüz, oylama, mezarlık, oyun sonu, rehber ekranlarının hepsi kullanıcıya dönük. (requirements FR1–FR19)
- **Birden çok kişi:** moderatör, oyuncu, ölü oyuncu, sahip; her birinin görme hakkı farklı (requirements NFR8 görünürlük tablosu).
- **Karmaşık iş mantığı:** rol yetenekleri (FR10), ölüm zinciri (FR7.2), oylama (FR9), kazanma sırası (FR11.1), bağlantı kopması (FR14).
- **Ekip çalışma biçimi:** yürüyen iskelet açık, oyun kuralları önce testle yazılıyor (`inception/practices-discovery/team-practices.md`). Hikâyelerin Given/When/Then kabul ölçütleri, bu testlerin doğrudan kaynağı olur.

## Hikâyelerin en çok değer katacağı yerler

- Her kişinin bir oyunda gördüğü ve yapabildiği şeylerin tek tek, test edilebilir hâle gelmesi (özellikle gizli bilginin yalnızca hak edene gitmesi).
- Rol yeteneklerinin ve ölüm zincirinin uç durumlarıyla yazılması (oyun kuralı testlerinin önce yazılması için).
- Gereksinim incelemesinde açık kalan noktaların (R-01…R-07) burada karara bağlanması.
- Yürüyen iskelete girecek hikâyelerin ayrıca işaretlenmesi.
