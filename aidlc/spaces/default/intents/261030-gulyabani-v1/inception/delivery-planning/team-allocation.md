# Ekip Dağılımı — Gulyabani–Köylü (çalışma adı)

Bu belge, yapım aşamasındaki her **Bolt**'u kimin yaptığını gösterir. Bolt, işin bir parçası (bir birim) üzerinden yapılan ve sonunda çalışan, sınanmış bir şey bırakan tek bir yapım turudur. Bu projede ayrı bir insan ekibi yoktur: `mvp` kapsamında Ekip Kurma aşaması (1.5) atlandı, bu yüzden bütün Bolt'ları yapay zekâ geliştirici (`aidlc-developer-agent`) yapar; sahip her onay noktasında karar verir.

## Sources

- [scope] Workflow-selected scope: `mvp` (Ekip Kurma aşaması atlandı).
- Bolt sırası: `bolt-plan.md` (B1–B8).
- Parçalar ve bağımlılıklar: `inception/units-generation/unit-of-work.md` (unit-of-work), `inception/units-generation/unit-of-work-dependency.md` (unit-of-work-dependency), `inception/units-generation/unit-of-work-story-map.md` (unit-of-work-story-map).
- Gereksinimler ve hikâyeler: `inception/requirements-analysis/requirements.md` (requirements), `inception/user-stories/stories.md` (stories).
- Ekranlar: `inception/refined-mockups/mockups.md` (mockups).
- Yapı taşları ve sözleşmeler: `inception/domain-design/components.md` (components), `inception/contract-design/contract-summary.md` (contract-summary).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md` (team-practices; PR yok, onay sahipte, tek ücretsiz sunucu).
- [Q1]: `delivery-planning-questions.md` — önce oyunun tamamı (A); Bolt'lar teker teker yapılır (özet onayı: Looks correct).

## Bolt–Sorumlu Tablosu

| Bolt | Parça | Yapan | Sahibin rolü |
|---|---|---|---|
| B1 | U1 Yürüyen iskelet | aidlc-developer-agent (yapay zekâ) | Oracle hesabını açar; tasarım, kod planı ve denetim noktasını onaylar; gerçek telefonlarla yeniden bağlanmayı dener; iskelet onayını verir |
| B2 | U2 Oda ve lobi | aidlc-developer-agent (yapay zekâ) | Tasarım, kod planı ve denetim noktasını onaylar |
| B3 | U3 Rol yetenekleri | aidlc-developer-agent (yapay zekâ) | "Her gün yeni kelime" listesini gözden geçirir; onaylar |
| B4 | U4 Mezarlık ve sohbet güvenliği | aidlc-developer-agent (yapay zekâ) | Küfür listesinin ilk hâlini gözden geçirir; onaylar |
| B5 | U5 Bağlantı dayanıklılığı | aidlc-developer-agent (yapay zekâ) | Onaylar |
| B6 | U6 Rehber ve kartlar | aidlc-developer-agent (yapay zekâ) | Kart görünümünü resimle görüp onaylar |
| B7 | U7 Kayıtlar, geri bildirim, rapor | aidlc-developer-agent (yapay zekâ) | Sahibe rapor çıktısını dener; onaylar |
| B8 | U8 Kalite ve yük | aidlc-developer-agent (yapay zekâ) | Elle ekran okuyucu ve klavye denemesine katılır; arkadaş grubuyla deneme oyunu düzenler; onaylar |

## Çalışma Düzeni

- **Teker teker:** Bolt'lar aynı anda yapılmaz. Her parçanın tasarım aşamaları ve kodu bitip denetim noktası sahibin onayını aldıktan sonra sıradaki Bolt başlar. Paralel yapılabilecek parça çiftleri (`unit-of-work-dependency.md`) olsa da tek geliştirici ve tek onaylayan olduğu için sıralı yapım daha az karışıklık ve daha kolay onay demektir.
- **Dal ve birleştirme:** Her Bolt `main`'den açılan kendi geçici dalında yazılır, onaylanınca `main`'e parçanın adını taşıyan tek bir commit olarak eklenir; geçici dal silinir. Pull request yoktur; inceleme, onay noktalarında sahibin açık onayıyla yapılır (team-practices Way of Working).
- **İskelet onayı:** İskeletten sonraki Bolt'ların tek tek mi onaylanacağı yoksa otomatik mi ilerleyeceği, iskelet onayından sonra sahibe bir kez sorulur (team-practices Walking Skeleton). Plan onayı, özet onayı, doğrulama komutu seçimi ve hatalar her durumda sahipte kalır.
- **İnceleme:** Her aşamanın belgelerini mimari inceleyici (`aidlc-architecture-reviewer-agent`) ya da ürün inceleyicisi denetler; son söz sahibindir.

Bu projede birden fazla ekip olmadığı için ekipler arası planlama panosuna (Program Board: ekiplerin birbirine bağlı işlerini tek panoda gösteren tablo) gerek yoktur.
