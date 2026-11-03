# Ölçek Tasarımı — U1 Yürüyen İskelet

Bu belge, ölçek ve maliyet gereksinimlerinin (NFR2.1–NFR2.6, NFR3.1, NFR3.2) nasıl karşılanacağını tasarlar: tek süreçte yükün nasıl bölündüğü, kapasite modeli, bellek bütçesinin dağılımı, aşırı yükte ne olduğu ve büyüme yolu. v1'de bütün parçalar tek sunucu programının içindedir ve tek ücretsiz Oracle sunucusunda çalışır (unit-of-work); yatay büyüme yoktur.

## Sources

- Ölçek gereksinimleri: `nfr-requirements/scalability-requirements.md` (scalability-requirements; Yük Tahmini, NFR2.1–NFR2.6, NFR3.1, NFR3.2).
- Hız gereksinimleri: `nfr-requirements/performance-requirements.md` (performance-requirements; NFR1.3 grup kaydı, NFR1.4 birleştirme, NFR1.5 görünüm boyutu, Kaynak Kullanımı Bütçesi).
- Güvenlik gereksinimleri: `nfr-requirements/security-requirements.md` (security-requirements; NFR7.7 koruma sınırları).
- Dayanıklılık gereksinimleri: `nfr-requirements/reliability-requirements.md` (reliability-requirements; NFR5.9 iki depo dosyası).
- İzleme gereksinimleri: `nfr-requirements/observability-requirements.md` (observability-requirements; NFR13.4 ölçümler, NFR13.6 eşikler).
- Teknoloji kararları: `nfr-requirements/tech-stack-decisions.md` (tech-stack-decisions; TD-01 tek iş parçacıklı Node.js, TD-02 ve TD-04 SQLite tek yazar ve grup kaydı).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A12 her odanın tek sırası) ve `functional-design/rules.md` (rules; BR2.1, BR10.2, BR12.1).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C1 tek bağlantı ve tam görünüm, C9 tek paylaşılan depo ve ayrık bölümler).
- Hız tasarımı: `performance-design.md` (oda içi boru hattı, StoreWriter, gönderim turu).
- Özet onayı: `nfr-design-questions.md` (Looks correct).

## Yükün Bölünmesi

| Kaynak | Nasıl bölünür | Paylaşılan mı |
|---|---|---|
| Komut işleme | Oda başına bir sıra (RoomQueue); odalar birbirini beklemez (NFR2.2) | Hayır; yalnızca ana iş parçacığının işlemci zamanı paylaşılır |
| Disk yazımı | Tek yazar (StoreWriter); bütün odaların hazır yazımları tek toplu işlemde | Evet: tek yazım iş parçacığı ve tek `game.db` |
| Görünüm üretimi | Oda başına gönderim turu, alıcı başına bir görünüm (NFR2.3) | Hayır |
| Bağlantılar | Kişi başına tek WebSocket | Dinleyici paylaşılır |
| Zamanlayıcılar | Oyun başına tek zamanlayıcı (en yakın bitiş zamanı) | Hayır |

- Depo düzeni oda koduna göre anahtarlıdır (C9: `room_`, `match_`, `chat_`, `session_` bölümleri); odalar arasında hiçbir sorgu yoktur. Bölme (sharding) gerekmez; ileride gerekirse oda kodu doğal bölme anahtarıdır.
- Sunucu durumludur (bütün etkin odalar bellekte). Bu bilinçli bir seçimdir: tek sunucuda yük dengeleyici ve paylaşılan önbellek gerekmez; durumun kaybına karşı koruma depodur (önce kayıt sonra kabul).

## Kapasite Modeli

| Büyüklük | Tasarım hedefi (NFR2) | Koruma sınırı (NFR7.7) | Tasarımın taşıdığı |
|---|---|---|---|
| Etkin oda | 50 | 300 | Oda başına bellek ≤ 200 KB → 300 odada ≤ 60 MB |
| Bağlantı | ~1.350 | 2.000 | Bağlantı başına ≤ 64 KB (tamponlar dahil) → 2.000'de ≤ 128 MB |
| Komut/saniye (zirve) | ~130 | — | ≥ 300 (grup kaydı, NFR1.3) |
| Gönderim turu/saniye (zirve) | ≤ 130 (her komut en fazla bir tur doğurur; oda başına en fazla 20/sn) | — | Tur başına ≤ 3 ms (ortak bloklar sınıf başına bir kez, performance-design) → ≤ 0,39 sn işlemci/sn (~%39) |
| Oturum | — | 3.000 | Oturum başına < 1 KB |
| Depo boyutu | — | ~300 MB | Oda başına ≤ 1 MB; 24 saatte silinir (BR12.1) |

**İşlemci bütçesi (NFR2.1, ortalama %70'in altı):** gönderim turu sayısı komut sayısını aşamaz, çünkü tur yalnızca bir komut kesinleşince doğar ve oda başına 50 ms'de birle sınırlıdır. NFR2'nin en kötü zirvesinde (50 odanın aynı anda oylaması, saniyede ~130 komut) ana iş parçacığının üst sınır hesabı, performance-design'daki %95 bütçeleriyle:

| İş | Hesap | sn işlemci / sn |
|---|---|---|
| Komut işleme (okuma, doğrulama, kural: a + k) | 130 × 3 ms | 0,39 |
| Görünüm üretimi ve gönderimi (r) | ≤ 130 tur × 3 ms | 0,39 |
| `ping`, bağlantı izleyicisi, sayaçlar | ~1.350 bağlantı × 20 sn'de bir | 0,02 |
| **Toplam üst sınır** | | **0,80 (%80, anlık)** |

Bu üst sınır, %95 bütçelerinin her komutta birden gerçekleştiği ve bütün odaların aynı saniyelerde oyladığı varsayımıdır; böyle bir zirve en fazla oylama süresi kadar (≈ 10 sn) sürer. Kaynak bütçesi ve büyüme tetiği 5 dakikalık ortalamaya bakar (performance-requirements Kaynak Kullanımı Bütçesi, NFR2.6); zirve dışında odalar farklı fazlardadır ve ortalama bunun çok altında kalır, yani %70 ortalama bütçesi korunur. Ortalama yine de aşarsa sıra şudur (scalability-requirements Açık soru): önce görünümdeki sohbet sınırı ve birleştirme ayarları, sonra daha büyük makine. U8 yük testi gerçek karışımı ölçer.

## Bellek Bütçesi (NFR2.4)

| Kalem | 50 oda / 1.350 bağlantı | 300 oda / 2.000 bağlantı (sınır) |
|---|---|---|
| Node.js temeli + kod + yazım iş parçacığı | ~80 MB | ~80 MB |
| Bağlantılar (WebSocket + tampon) | ~90 MB | ~130 MB |
| Oda, oyun, oturum durumu + son 100 mesaj/kanal | ~10 MB | ~60 MB |
| Gönderilmiş son görünümler (alıcı başına bir JSON, ≤ 32 KB) | ~45 MB | ~65 MB |
| SQLite sayfa önbelleği (yazım iş parçacığında, 16 MB'la sınırlı) | 16 MB | 16 MB |
| **Toplam** | **~240 MB** | **~350 MB** |

- Bütçe 512 MB'tır (süreç toplam belleği, RSS); 400 MB uyarı eşiğidir (NFR13.6). Bütçe iki katmanla korunur:
  - **Yığın sınırı:** yukarıdaki tabloda yığında duran kalemler (oda/oyun/oturum durumu ~60 MB, son görünümler ~65 MB, kod ve nesneler ~40 MB) sınırda ~165 MB'tır; yığın dışında duranlar (WebSocket tamponları ~130 MB, SQLite önbelleği 16 MB, Node.js yerel belleği ve yazım iş parçacığı ~40 MB) ~186 MB'tır; toplam tablodaki ~350 MB'tır. Node.js yığın sınırı `--max-old-space-size=288` ile verilir (yığın tahmininin üstünde pay): 288 + 186 ≈ 474 MB, 512'nin altında kalır.
  - **Yazım iş parçacığının sınırı:** iş parçacığı `resourceLimits: { maxOldGenerationSizeMb: 32 }` ile başlatılır (istek kopyaları ve açılış yüklemesi için yeterli; SQLite önbelleği yığın dışındadır ve 16 MB'la ayrıca sınırlıdır). Sınırı aşarsa iş parçacığı çöker ve reliability-design'daki yazım iş parçacığı arıza yolu işler.
  - **Süreç sınırı:** `systemd` hizmetinde `MemoryMax=512M` (kesin sınır). Yığın dışı bellek tahmini aşarsa işletim sistemi süreci bu sınırda durdurur; hizmet yöneticisi yeniden başlatır ve önce kayıt sonra kabul olduğu için kabul edilmiş hiçbir işlem kaybolmaz. Gönderim tamponu sınırları (alıcı başına 1 MB / 4 MB) yığın dışı belleğin büyümesini ayrıca sınırlar.
- Silinen odanın bütün bellek kayıtları (durum, sıra, zamanlayıcı, hız sayaçları, son görünümler) aynı anda atılır (NFR2.4); bunun birim testi vardır.
- Sohbet: bellekte kanal başına son 100 mesaj; depoda oyun boyunca kanal başına en fazla 2.000 mesaj, aşan en eski mesaj aynı yazım isteğinde silinir (NFR3.2).

## Aşırı Yükte Davranış

| Durum | Davranış | Neden |
|---|---|---|
| Bir odanın sırasında 100'den çok bekleyen komut | Yeni komut `server_busy` ile reddedilir | Normal oyunda bir odada aynı anda en fazla ~27 komut olur; 100 bir arızanın ya da selin işaretidir |
| Yazım bekleyen istek sayısı 2.000'i aşar | Yeni komutlar `server_busy` alır; `warn` günlüğü | Disk yavaşlarsa bellek büyümesin; mevcut istekler biter |
| Alıcının gönderim tamponu > 1 MB | O alıcıya görünüm atlanır; > 4 MB'ta bağlantı kapanır | Yavaş bir telefon sunucu belleğini doldurmasın (performance-design) |
| Koruma sınırları (bağlantı, oda, oturum) | security-design Kötüye Kullanım Sınırları | Genel üst sınır |

Yük atma reddi her zaman durum değiştirmez; istemci aynı `commandId` ile yeniden gönderebilir (C1) ve sonra işlenir.

## Büyüme Yolu (NFR2.6)

- Yalnızca dikey büyüme: ücretsiz kullanım hakkı içinde daha büyük bir Oracle makinesine geçilir. Program tek süreç olduğu için işlemci çekirdeği artışından çok, tek çekirdeğin hızından yararlanır; bu yüzden Altyapı Tasarımı'nın makine seçiminde çekirdek hızı ve bellek önceliklidir (en az 1 tam çekirdek, en az 1 GB bellek).
- Geçiş tetikleri izleme ölçümlerinden gelir (observability-design): işlemci 5 dakika ortalama %70'in üstünde, ya da son 5 dakikanın %95 işleme süresi 300 ms'yi aşıyor, ya da bellek 400 MB'ı geçiyor.
- Geçişten önce ucuz ayarlar denenir (scalability-requirements Açık soru): görünüm gönderim turu aralığı ve görünümdeki sohbet sınırı; hız hedefleri gevşetilmez.
- İkinci sunucuya bölme v1'de yoktur. Gerekirse yol: odaları oda koduna göre ikinci bir sürece dağıtmak; ortak sözleşmeler (C1, C9) buna engel değildir.

## Maliyet (NFR3.1, NFR3.2)

| Kalem | Ücret | Lisans |
|---|---|---|
| Node.js 24 LTS | Ücretsiz | MIT |
| `ws`, `better-sqlite3`, `zod`, `preact` | Ücretsiz | MIT |
| SQLite | Ücretsiz | Kamu malı |
| Caddy | Ücretsiz | Apache 2.0 |
| Vitest, Vite, Playwright, axe-core, ESLint, Prettier, gitleaks | Ücretsiz | MIT / Apache 2.0 / MPL 2.0 |
| GitHub Actions | Ücretsiz (açık depoda ya da ücretsiz dakikalar içinde) | — |
| Oracle Always Free makine ve disk | Ücretsiz | — |

- Oracle hesabında harcama uyarısı (1 USD) kurulur; ayrıntısı Altyapı Tasarımı'ndadır.
- Disk ihtiyacı (≤ 300 MB depo + 200 MB sistem günlüğü) ücretsiz disk hakkının çok altındadır.

## Assumptions & Open Questions

- [assumption] Bağlantı başına 64 KB ve oda başına 200 KB bellek tahminleri benim varsayımımdır; U8 yük testi gerçek değeri ölçer, gerekirse koruma sınırları düşürülür.
- [assumption] Oda sırası üst sınırı (100) ve yazım bekleyen istek üst sınırı (2.000) benim seçtiğim varsayılanlardır; ikisi de normal oyunda hiç tetiklenmez.
- [assumption] `--max-old-space-size=288` ve yığın dışı ~190 MB tahmini benim hesabımdır; U8 yük testinde RSS ve yığın ayrı ölçülür, gerekirse yığın sınırı ayarlanır (512 MB süreç sınırı değişmez).
- Açık soru: ücretsiz sunucunun NFR2 yükünü gerçekten taşıdığı (ASM-02) U8 yük testinde ölçülür.
