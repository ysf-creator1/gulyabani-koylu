# Teknoloji Kararları — U1 Yürüyen İskelet

Bu belge, yürüyen iskeletin (ve onun üstüne kurulacak U2–U8'in) dilini, çalışma ortamını, kalıcı deposunu, araçlarını ve gerekçelerini yazar. Dil ve depo sahibin onayıyla seçildi (ISS-02 kapandı); diğer seçimler sahibin kuralı gereği (project.md Corrections) benim seçtiğim varsayılanlardır ve özet onayıyla onaylandı. Sunucunun kurulumu (makine türü, ön program ayarları, ücretsiz alt adres) Altyapı Tasarımı'ndadır.

## Sources

- Özet onayı: `nfr-requirements-questions.md` — [Q1] TypeScript, [Q2] SQLite (Looks correct).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR3 maliyet, NFR9 erişilebilirlik, NFR10 tarayıcılar, NFR11 Türkçe metin dosyası, NFR12 test edilebilirlik ve kapsam, NFR15 rastgelelik; C-10 Oracle, C-11 tek kişilik geliştirme).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 WSS üzerinde JSON, C3 saf kural modülü, C4 Türkçe metin paketi, C9 depo bölümleri ve Açık Sorular'daki "depo ürünü ve oyun kaydının biçimi"; Doğrulama: sözleşme biçimleri tek ortak tanım dosyasında).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A12 komut işleme, A14 bot testi) ve `functional-design/rules.md` (rules; BR10.2 tek işlemde yazım, BR13.1–BR13.3 arayüz kuralları).
- Ekip kuralları: `memory/team.md` (Testing Posture: kural kodunda önce test, %80/%90 kapsam, CI'da birleştirme engeli, bot testi, CI'da erişilebilirlik taraması; Code Style: kod içi adlar İngilizce, yorumlar Türkçe, TypeScript seçilirse Prettier + ESLint).
- Ayrıntılı Taslaklar: `inception/refined-mockups/design-system-mapping.md` (hazır arayüz kütüphanesine bağlanılmaz; tasarım belirteçleri ve parça listesi tek kaynaktır).

## Karar Tablosu

| Alan | Seçim | Neden | Kaynak |
|---|---|---|---|
| Dil | TypeScript (sıkı tür denetimi açık) | Sunucu, tarayıcı ve bot testi tek dil; sözleşme biçimleri tek ortak dosyada | [Q1], C1 Doğrulama, C-11 |
| Sunucu çalışma ortamı | Node.js 24 LTS | Uzun süreli destek (2028'e kadar); canlı bağlantı için yaygın | [Q1] |
| Canlı bağlantı | `ws` paketi + Node.js'in yerleşik `http` modülü; ayrı web çatısı yok | En az bağımlılık; yalnızca birkaç adres var (C2) | C1, C2 |
| Kalıcı depo | SQLite, `better-sqlite3` paketiyle; günlük modu WAL, tam eşitleme, grup kaydı; oda verisi ve U7 kayıtları ayrı dosyalarda (TD-04) | Ayrı veritabanı programı yok, ücretsiz; bir komutun bütün kayıtları ya hep ya hiç | [Q2], C9, BR10.2 |
| Oyun kaydının biçimi | Tam durum kaydı: oyun başına bir satır (sürüm numarası, seri hâle getirilmiş durum, son 500 komut numarası) | İşlem günlüğünden sadedir; açılışta tek satır okunur (C9 `GameStateSnapshot`) | C9 Açık Soru, ADR-004 |
| Depo bölümleri | Tablo adları yapı taşının önekiyle (`room_`, `match_`, `chat_`, `session_`); her yapı taşı yalnızca kendi tablolarına yazar; bir komutun yazımları odanın sırasının açtığı tek işlemde | C9 bölüm kuralı + tek işlemde yazım | C9, NFR5.1 |
| Ortak şemalar | `zod` ile tanımlanan tek ortak şema klasörü (`src/shared/`): C1 mesajları, C5 görünüm, neden kodları | Sunucu, tarayıcı ve botlar aynı tanımı kullanır | C1 Doğrulama, NFR7.5 |
| Kural modülü | `src/rules/` altında saf TypeScript: ağ, depo, saat ve rastgelelik dışarıdan verilir | C3, NFR12 | C3 |
| Rastgelelik | `node:crypto` (`randomInt`, `randomBytes`) | Kriptografik güvenli | NFR15, security-requirements NFR15.1 |
| Ekranlar | Preact (çok küçük görünüm yardımcısı) + Vite ile derleme; düz CSS ve tasarım belirteçleri; hazır bileşen kütüphanesi yok | Paket boyutu bütçesi (NFR1.6); kendi tasarım sistemi (design-system-mapping) | NFR1, NFR10 |
| Türkçe metinler | Tek metin paketi dosyası (`tr.json`, C4 `TextBundle`); kodda oyuncuya görünen metin yok | NFR11, BR13.1 | C4 |
| Birim ve entegrasyon testleri | Vitest + v8 kapsam ölçümü; kapsam sınırları yapılandırmada: tüm kod %80, `src/rules/` %90 | Hızlı, TypeScript'i doğrudan çalıştırır | NFR12, team-practices |
| Bot oyunculu uçtan uca test | Vitest içinde gerçek sunucu süreci + `ws` istemcili botlar, test başında üretilen kendinden imzalı sertifikayla gerçek şifreli bağlantı | A14 "gerçek şifreli bağlantı" | NFR12, A14 |
| Erişilebilirlik taraması | Playwright (Chromium) + axe-core; iskelet ekranları 320 px'te taranır | Team Testing Posture: CI'da otomatik tarama | NFR9, NFR10 |
| Biçimlendirme ve denetim | Prettier + ESLint (typescript-eslint) | team.md Code Style | team-practices |
| CI | GitHub Actions: biçim, denetim, tür denetimi, testler + kapsam, bot testi, erişilebilirlik taraması, paket boyutu, bağımlılık güvenlik denetimi, sır taraması | Ücretsiz; birleştirme engeli | NFR7.8, NFR7.10, NFR12 |
| Sunucu (Altyapı Tasarımı'nda kesinleşir) | Oracle Cloud Always Free Linux makinesi; TLS'i Caddy sonlandırır (ücretsiz sertifikayı kendisi alır, erişim günlüğü kapalı); program `systemd` ile çalışır | C-10, NFR3, NFR7.1, NFR7.11 | team-practices Deployment |

## Arayüz ve Test Gereksinimleri

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR9.1 | İskelet ekranları WCAG 2.1 AA'ya uyar, iki temada da: normal metin kontrastı en az 4.5:1, büyük metin ve arayüz parçaları en az 3:1; taraf renkle birlikte simgeyle ayırt edilir; dokunma alanı en az 44x44 px ve aralarında en az 8 px boşluk; her işlev klavyeyle yapılır ve odak her zaman görünür; faz değişimi ve yeni sohbet mesajı ekran okuyucuya duyurulur (kibar duyuru alanıyla); hareket azaltma tercihinde animasyon olmaz; gece sırası için duyuru yapılmaz (BR4.7). CI'da axe taraması iskelet ekranlarının her birinde ciddi ya da kritik bulgu bulmaz; ekran okuyucu ve klavye denemesi elle yapılır. | CI axe taraması (kontrast dahil); bileşen testleri: duyuru alanı ve hareket azaltma; elle deneme (iskelet denetiminde) | NFR9, BR13.3 |
| NFR11.1 | Oyuncuya görünen bütün metinler `tr.json`'dan gelir; her neden kodu (C1) ve her ekran metni için anahtar vardır; eksik anahtar CI testinde hata verir. | CI testi | NFR11, C4, BR13.1 |
| NFR12.1 | Kural kodunda (`src/rules/`) testler koddan önce yazılır; satır kapsamı tüm kodda en az %80, kural kodunda en az %90'dır; sınırın altında CI başarısız olur ve parça `main`'e eklenmez. | Vitest kapsam sınırları | NFR12, team-practices |
| NFR12.2 | Bot oyunculu uçtan uca test gerçek şifreli bağlantı üzerinden bir bot moderatör sürücüsü ve en az 3 bot oyuncuyla tam bir oyunu kazananla bitirir; Construction doğrulama komutu bu testi ve kapsam ölçümünü tek komutla çalıştırır (önerilen komut: `npm run verify`; sahip ilk denetim noktasında onaylar). | Bot testi | NFR12, A14 |
| NFR12.3 | Testler belgelenmiş ön koşullar dışında elle kurulum istemez (`npm ci` ve `npm run verify` yeterlidir); kural modülü testleri ağ ve depo olmadan çalışır. | CI | NFR12, C3 |

## Önemli Kararların Gerekçesi

### TD-01 — Dil: TypeScript (Node.js)

- **Bağlam:** Sunucu, tarayıcı ve bot testi aynı mesaj biçimlerini kullanır; sözleşme biçimlerin tek ortak dosyada tutulmasını istiyor (C1 Doğrulama). Geliştirme tek kişilik ve yapay zekâ destekli (C-11); bütçe sıfır (NFR3).
- **Karar:** Her yer TypeScript; sunucu Node.js 24 LTS üzerinde.
- **Sonuçlar:** (+) Tek dil, ortak şemalar doğrudan paylaşılır, bot testi ekranlarla aynı kodu kullanabilir. (+) Araçlar ücretsiz ve yaygın. (−) Node.js, Go'ya göre daha çok bellek kullanır; NFR2.4'ün 512 MB bütçesi bunu sınırlar. (−) Tek iş parçacıklı çalışma; ağır hesap yok, kural hesapları küçüktür.
- **Reddedilen seçenekler:** Go sunucu + TypeScript tarayıcı (daha az bellek, ama iki dil ve iki kez yazılan şemalar); Python sunucu + TypeScript tarayıcı (iki dil; canlı bağlantıda daha az yaygın).

### TD-02 — Depo: SQLite

- **Bağlam:** Her kabul edilen işlem önce kalıcı yazılmalı (NFR5, ADR-004); tek sunucu ve sıfır bütçe; oda verisi 24 saatlik.
- **Karar:** Sunucunun diskinde tek SQLite dosyası; WAL günlük modu ve tam eşitleme; bir komutun bütün yazımları tek işlemde.
- **Sonuçlar:** (+) Ayrı program, kullanıcı adı, şifre ya da ağ yok; yedeklenecek sır yok. (+) Tek işlem, Fonksiyonel Tasarım incelemesinin "oda kurulurken kesilme" notunu kendiliğinden çözer (reliability-requirements NFR5.1). (−) Tek yazar: yazımlar sıraya girer; komut başına kısa işlemle NFR1.3 sağlanır. (−) Yatay büyüme yok; v1'de zaten tek sunucu var (NFR2.6). (−) `better-sqlite3` derlenmiş bir pakettir; ARM (Ampere) makinesi için hazır sürümü vardır, yoksa sunucuda derlenir.
- **Reddedilen seçenekler:** Aynı sunucuda PostgreSQL (kurulum, güncelleme ve bellek yükü; tek sunucuda getirisi yok); Oracle Autonomous Database (ağ gecikmesi her komuta eklenir, kullanılmayınca Oracle kapatabiliyor, bağlantı sırrı gerekir).

### TD-03 — Oyun kaydı: tam durum

- **Bağlam:** C9 açık sorusu: oyun kaydı tam durum mu, işlem günlüğü mü?
- **Karar:** Oyun başına tek satırda tam durum + sürüm + son 500 komut numarası; her kabul edilen komutta satır yeni sürümle yeniden yazılır.
- **Sonuçlar:** (+) Açılışta yükleme tek okuma; yeniden oynatma mantığı yok. (+) Durum boyutu küçük (26 koltuk, oylar, gece kayıtları). (−) Geçmiş adımlar depoda tutulmaz; zaten gerekmez (kayıtlar U7'de olaylardan yazılır).
- **Reddedilen seçenek:** İşlem günlüğü (her komutu ayrı satır olarak saklayıp açılışta yeniden oynatmak): daha karmaşık, kural kodu değiştikçe eski günlüğün yeniden oynatılması risklidir.

### TD-04 — Yazım: tam eşitleme + grup kaydı, iki ayrı depo dosyası

- **Bağlam:** Tasarım zirvesi saniyede yaklaşık 130 komut (scalability-requirements); her kabul edilen komut diske kesinleşmeden kabul edilmemeli (NFR5). Komut başına ayrı kesinleştirme, 20 ms'lik disk süresinde saniyede yalnızca yaklaşık 50 komuta izin verir.
- **Karar:** WAL günlük modu ve tam eşitleme (işletim sistemi çökmesine ve elektrik kesintisine karşı da korur). Tek yazar, aynı anda hazır olan bütün odaların yazımlarını tek bir işlemde toplar; her komut bu işlemin içinde kendi geri alma noktasıyla ayrıdır; işlem kesinleşince her komutun `accepted`'ı ve olayları gönderilir. Oda verisi oyun deposu dosyasında (`game.db`), U7'nin uzun süreli kayıtları ayrı kayıt deposu dosyasında tutulur (reliability-requirements NFR5.9). Silinen içerik üzerine yazılır (`secure_delete`, security-requirements NFR7.14).
- **Sonuçlar:** (+) Yazım hızı komut sayısıyla değil kesinleştirme sayısıyla sınırlı; saniyede en az 300 komut (NFR1.3). (+) Tam dayanıklılık korunur. (−) Yazar kodu biraz daha karmaşık (toplama, geri alma noktaları); kendi testleri vardır. (−) Bir komut, aynı toplu işlemdeki öteki komutların kesinleşmesini en fazla bir kesinleştirme süresi kadar bekler.
- **Reddedilen seçenekler:** WAL + normal eşitleme (süreç çökmesine karşı yeterli, ama işletim sistemi çökmesinde son işlemler kaybolabilir; NFR5 "kabul edilmiş hiçbir işlem kaybolmaz" der); komut başına ayrı tam eşitlemeli işlem (zirveyi taşımaz); tek depo dosyası (bozulmada uzun süreli kayıtlar da etkilenirdi).

## Assumptions & Open Questions

- [assumption] Preact, "hazır arayüz kütüphanesi yok" kararıyla (design-system-mapping) çelişmez: Preact bir bileşen kütüphanesi değil, ekranları çizen küçük bir yardımcıdır; bütün parçalar projenin kendi tasarım belirteçleriyle yazılır.
- [assumption] Node.js 24 LTS, Kod Üretimi başladığında güncel destekli LTS sürümüdür; daha yeni bir LTS çıkmışsa ve bütün paketler destekliyorsa o seçilir.
- [assumption] Construction doğrulama komutunun adı (`npm run verify`) öneridir; sahip ilk iskelet denetim noktasında onaylar.
- Açık soru: Oracle makine türü, Caddy ayarları ve ücretsiz alt adres (DEP-02) Altyapı Tasarımı'nda kesinleşir.
