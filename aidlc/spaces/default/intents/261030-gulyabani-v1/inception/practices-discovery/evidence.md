# Kanıt Kaydı — Çalışma Biçimi Keşfi

> Lider: aidlc-pipeline-deploy-agent. Yardımcı ajanlar bu çalışmada kapalıydı (katkı dosyası yok); lider taslağı görüşmeyle (Q1–Q10) kesinleştirildi ve sahibin özet onayı (`Looks correct`) alındı.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp` (kapsam dosyası `.claude/scopes/aidlc-mvp.md`: `skeleton: on`).
- `aidlc/spaces/default/intents/261030-gulyabani-v1/aidlc-state.md` — Test Strategy `Standard`, Construction Checkpoints `enabled`.
- `aidlc/spaces/default/memory/org.md` — beş bölümün varsayılanları (greenfield öneri kaynağı).
- `aidlc/spaces/default/memory/team.md` — boş; önceden onaylı ekip pratiği yok.
- Onaylı ideation belgeleri: `ideation/intent-capture/intent-statement.md`, `ideation/feasibility/constraint-register.md` (C-01…C-18), `ideation/scope-definition/scope-document.md`, `ideation/scope-definition/intent-backlog.md`, `ideation/rough-mockups/wireframes.md`.
- Git geçmişi: `5b89c36` … `a8e06b1`, hepsi doğrudan `main` üzerinde, "AI-DLC: <aşama> onaylandı" biçiminde.
- [Q1]…[Q10] ve Consolidated Summary Confirmation: `inception/practices-discovery/practices-discovery-questions.md`.

## İncelenenler ve Çıkarımlar

| Kaynak | Bulgu | Sonuca etkisi |
|---|---|---|
| Git geçmişi | Tek dal (`main`), dal/PR yok, her onaydan sonra commit + push | Way of Working: trunk-based, PR'sız akış |
| Proje kökü | Uygulama kodu, CI yapılandırması, linter/formatter dosyası yok (greenfield) | Code Style dilden bağımsız; araçlar dil seçilince belirlenecek |
| `aidlc-mvp.md` | `skeleton: on` | Walking Skeleton açık |
| scope-document Sıralama 1–2, IB-02, IB-04 | Önce en basit oynanabilir oyun; bot testi onunla başlar; gerçek telefon denemesi ilk günden | İskeletin içeriği ve doğrulama yolu |
| constraint-register C-01, C-02, C-10 | Sıfır bütçe, ücretsiz haklar; Oracle / Azure adayları | Tek ücretsiz sunucu, ayrı staging yok |
| constraint-register C-13, scope ISS-03 | Yayın aşamaları planda yok, sonra eklenecek | Deployment ilke düzeyinde |
| constraint-register C-05, C-07, C-09, C-14…C-18; wireframes Q6; phases/construction.md | Gizlilik, saklama, özgünlük, erişilebilirlik, dil, sır kararları | 13 kesin kural |

## Görüşme Kararları

| Soru | Konu | Cevap | Sonuç |
|---|---|---|---|
| [Q1] | Parçaların `main`'e eklenmesi | A | Her parça kendi geçici dalında; onaylanınca squash ile tek commit; PR yok |
| [Q2] | Ayrı deneme sunucusu | A | Tek ücretsiz sunucu; ayrı staging yok |
| [Q3] | Canlıya çıkış | A | Sahibin açık onayı + sürüm etiketi (ör. `v1.0.0`); sorunda önceki sürüme dönüş |
| [Q4] | Yürüyen iskelet | A | AÇIK: Gulyabani + Köylü ile en basit tam oyun; bot oyunculu otomatik test + gerçek telefonda yeniden bağlanma |
| [Q5] | İlk çalışan sürümün yeri | B | Baştan Oracle ücretsiz sunucusunda dış adreste; telefonlar mobil veriyle de dener |
| [Q6] | Kod içi dil | A | Adlar İngilizce, yorumlar Türkçe; oyuncu metinleri Türkçe ve ayrı dosyada |
| [Q7] | Test sırası | A | Karma: oyun kuralları önce test; ekranlar ve diğerleri önce kod, hemen ardından test → `Methodology: custom` |
| [Q8] | Kapsam alt sınırı | B | Tüm kodda ≥%80, oyun kuralı kodunda ≥%90; test kırmızı veya kapsam düşükse birleştirme yok |
| [Q9] | 13 aday kesin kural | A | Hepsi olduğu gibi onaylandı (8 ALWAYS, 5 NEVER) |
| [Q10] | Tek sunucunun yayın öncesi kullanımı | A | v1'e kadar deneme için; yayından sonra yalnızca canlı, yeni parçalar bilgisayarda ve otomatik testlerle denenir |

### Q2 ile Q5 arasındaki çelişki ve çözümü

[Q2]'de sahip "tek ücretsiz sunucu olsun, o da canlı oyun olsun; denemeler bilgisayarda yapılsın" dedi; [Q5]'te ise "ilk çalışan sürüm baştan ücretsiz sunucuda (Oracle) dış adreste denensin" dedi. İkisi birlikte okunduğunda sunucunun hem yalnızca canlı hem de deneme yeri olması gerekiyordu. Çelişki taşınmadı; ek soru [Q10] soruldu ve sahip A'yı seçti: v1 yayınına kadar canlı oyun olmadığından tek sunucu deneme için kullanılır, yayından sonra yalnızca canlı oyundur ve yeni parçalar önce bilgisayarda ve otomatik testlerle denenir. Bunun doğrudan sonucu: Oracle hesabı yapım aşamasının en başında kurulmalıdır.

## org.md Varsayılanlarından Farklar

- **Way of Working:** trunk-based, taban/hedef `main`, squash — aynen benimsendi; PR olmaması açıkça eklendi.
- **Walking Skeleton:** `skeleton: on` — aynen; içerik ve doğrulama kapsam belgesinden ve Q4/Q5'ten.
- **Testing Posture:** org.md varsayılanı `test-after` idi; ekip `custom` (karma) seçti. Kapsam tabanı `mvp`'nin %80'inden daha sıkı: oyun kuralı kodunda %90.
- **Deployment:** org.md "birleştirmede staging'e yayın, canlıya elle onay" diyor; ekip ayrı staging kurmadı. Canlıya elle onay ilkesi korundu, onaylayan tek kişi (sahip).
- **Code Style:** proje yapılandırmasına bırakma ve CI'da denetim aynen; kod içi dil kuralı (İngilizce adlar, Türkçe yorumlar) eklendi.

## Assumptions & Open Questions

- [assumption] Sahip tek başına geliştirir ve tek onaylayıcıdır; ikinci bir inceleyici yoktur (constraint-register C-11).
- [assumption] GitHub deposunun herkese açık mı özel mi olduğu bilinmiyor; sır kuralları her iki durumda da geçerli kabul edildi ve [Q9]'da onaylandı.
- Açık risk: Oracle Cloud Always Free hesabı, yapım aşamasının ilk parçasından (yürüyen iskelet) önce açılmış ve sunucu hazır olmalıdır. Hesap açılamazsa (kart doğrulaması, bölge kapasitesi vb.) iskeletin dış adreste çalışması gecikir; alternatif aday Azure'dur (C-10). Bu, iskeleti başlatmadan önce sahibine sorulmalıdır.
- Açık risk: v1 yayınından sonra canlı sunucuda deneme yapılmadığı için, yeniden bağlanma gibi gerçek ağa bağlı davranışlar yayın öncesinde yalnızca bilgisayarda ve otomatik testlerle sınanabilir; yayın sonrası sağlık kontrolü ve geri alma yolu bu boşluğu kapatır.
- WCAG 2.1 AA, sahibin [Q9] onayıyla gereksinim değil kesin kural (ALWAYS) olarak tutuldu; otomatik tarama tüm kriterleri yakalayamayacağı için elle denetim de gerekir.
- Programlama dili ve bunun biçimlendirici/denetleyicisi henüz seçilmedi (ISS-02); Code Style bölümü dilden bağımsız yazıldı.
- Yayın aşamaları (ortam kurulumu, dağıtım, izleme) planda henüz yok (C-13, ISS-03); ayrıntılı yayın ve geri alma adımları o aşamalarda yazılacak.
