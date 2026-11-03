# İzleme Tasarımı — U1 Yürüyen İskelet

Bu belge, izleme gereksinimlerinin (NFR13.1–NFR13.8) nasıl karşılanacağını tasarlar: günlük kaydının biçimi ve olay listesi, bellek içi ölçümler, iki sağlık ucunun çıktısı, hizmet hedefleri (SLI/SLO), uyarı eşikleri ve bot testi raporu. Uyarıların kime ve hangi ücretsiz araçla gideceği izleme aşamasında kurulur (ISS-03); iskelet bunun için gereken uçları ve ölçümleri hazırlar.

## Sources

- İzleme gereksinimleri: `nfr-requirements/observability-requirements.md` (observability-requirements; NFR13.1–NFR13.8).
- Hız gereksinimleri: `nfr-requirements/performance-requirements.md` (performance-requirements; NFR1.1 sunucu işleme süresi ve ölçüm noktası).
- Güvenlik gereksinimleri: `nfr-requirements/security-requirements.md` (security-requirements; NFR7.11 IP yok, NFR7.12 iç kapı, NFR8.4 günlükte yasak alanlar).
- Ölçek gereksinimleri: `nfr-requirements/scalability-requirements.md` (scalability-requirements; NFR2.5 %80 uyarısı, NFR2.6 büyüme tetikleri).
- Dayanıklılık gereksinimleri: `nfr-requirements/reliability-requirements.md` (reliability-requirements; NFR5.2 açılışta 503, NFR6.1 %99 erişilebilirlik).
- Teknoloji kararları: `nfr-requirements/tech-stack-decisions.md` (tech-stack-decisions; `systemd` sistem günlüğü, Vitest bot testi, NFR12.2 doğrulama komutu).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A13 sağlık kontrolü, A14 bot testi) ve `functional-design/rules.md` (rules; BR10.4, BR12.2, BR12.3).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 `/healthz`, C6 olaylarda IP ve metin yok).
- Güvenlik tasarımı: `security-design.md` (günlük alan beyaz listesi, iç dinleyici).
- Operation kuralları: `memory/phases/operation.md` (SLO yüzde ve zaman penceresiyle; uyarı eşiği SLO ihlalinden önce; her bileşenin sağlık ve hata ölçümü).
- Özet onayı: `nfr-design-questions.md` (Looks correct).

## Günlük Kaydı (NFR13.2, NFR13.3)

- Program günlüğü satır başına bir JSON nesnesidir ve standart çıktıya yazılır; `systemd` sistem günlüğü toplar. Sistem günlüğü 7 gün ya da 200 MB'tan sonra eskileri siler (ayarı Altyapı Tasarımı'nda).
- Günlük kendi küçük modülümüzdür (dış paket yok). Fonksiyon yalnızca beyaz listedeki alanları kabul eder; alan türleri TypeScript'te sabittir, listede olmayan alan derlenmez (security-design Kişisel Veri).

| Alan | Her kayıtta | Açıklama |
|---|---|---|
| `t` | Evet | ISO zaman (UTC, milisaniyeli) |
| `level` | Evet | `info`, `warn`, `error` |
| `event` | Evet | Olay adı (aşağıdaki liste) |
| `version` | Evet | Program sürümü (`APP_VERSION`) |
| `roomCode`, `matchId` | Olaya göre | Kimlikler |
| `command`, `commandId` | Olaya göre | Komut adı ve numarası (iz sürme anahtarı) |
| `reasonCode` | Olaya göre | C1 neden kodu |
| `durationMs`, `count`, `limit` | Olaya göre | Sayılar |
| `connId` | Olaya göre | Bağlantıya program içinde verilen rastgele kimlik (IP değil) |
| `err` | Yalnızca `error` | Hata türünün adı, varsa sabit hata kodu ve yığın izinin dosya:satır çerçeveleri; **mesaj metni yazılmaz** (kullanıcı girdisinden parça içerebilir; security-design Kişisel Veri) |

Asla bulunmayanlar: IP adresi, oturum belirteci ya da özeti, nick, sohbet metni, rol ya da rol eşleşmesi, gulyabani işaretleri. Birim testi günlük çıktısını bu alanlar ve IPv4/IPv6/belirteç desenleri için tarar.

### Olay listesi

| Düzey | `event` | Ne zaman |
|---|---|---|
| `info` | `startup.begin`, `startup.ready`, `shutdown.begin`, `shutdown.done` | Açılış ve kapanış (açılış süresi `durationMs`'te) |
| `info` | `sweep.done` | Her temizlik taraması (silinen ve silinemeyen sayısı) |
| `warn` | `limit.near` | Bir koruma sınırının %80'i (dakikada en fazla bir kez; `limit` alanında hangisi) |
| `warn` | `limit.flood` | Mesaj seli yüzünden kapatılan bağlantı, genel oda kodu sınırına takılma |
| `warn` | `command.rejected` | Reddedilen komut (neden koduyla); `phase_closed` ve `duplicate` gibi normal akış retleri dakikalık özet olarak tek satır |
| `warn` | `store.conflict` | Sürüm çakışması |
| `warn` | `overload` | Oda sırası ya da yazım bekleyen istek sınırı (`server_busy`) |
| `error` | `command.internal_error` | Her `internal_error` (yığın izi dahil) |
| `error` | `store.batch_failed`, `store.worker_restart`, `store.corrupt` | Depo hataları |
| `error` | `startup.failed`, `fatal` | Açılış hatası, yakalanmamış hata |
| `error` | `listener.failed` | Bir olay dinleyicisinin hatası |

Normal akışta kabul edilen komutlar tek tek günlüğe yazılmaz; sayıları ölçümlerdedir (NFR13.3).

## Bellek İçi Ölçümler (NFR13.4)

| Ölçüm | Tür | Nasıl hesaplanır |
|---|---|---|
| `activeRooms` | Anlık | Bellekteki süresi dolmamış oda sayısı |
| `activeMatches` | Anlık | `in_game` durumundaki oda sayısı |
| `connections` | Anlık | Açık WebSocket sayısı |
| `errorCount` | Sayaç (açılıştan beri) | `internal_error` + başarısız silme + dinleyici hatası + başarısız toplu işlem |
| `commandsProcessed` | Sayaç | Kabul edilen + reddedilen komutlar |
| `commandLatencyP50Ms`, `commandLatencyP95Ms` | Son 5 dakika | Dakikalık 5 kova; her kovada sabit sınırlı sayım çizelgesi (1, 2, 5, 10, 20, 50, 100, 150, 200, 300, 400, 500, 1000 ms ve üstü); yüzdelik birleşik çizelgeden |
| `commitP95Ms` | Son 5 dakika | Toplu kesinleştirme süreleri, aynı yöntemle |
| `eventLoopDelayP95Ms` | Son 5 dakika | `perf_hooks.monitorEventLoopDelay` |
| `sweepDeleted`, `sweepFailed` | Son tarama | ExpirySweep sonucu |
| `memoryRssMb`, `heapUsedMb` | Anlık | `process.memoryUsage()` |
| `writeQueueDepth` | Anlık | Yazım bekleyen istek sayısı |
| `uptimeSec` | Anlık | Açılıştan beri |

Ölçümler yalnızca bellektedir; program yeniden başlayınca sayaçlar sıfırlanır (reliability-requirements Bozulma Öncelikleri: kapatılabilir). Sunucu işleme süresi performance-design'daki ölçüm noktasıyla aynıdır: komutun okunmasından onun değişikliğini içeren gönderim turunun başlamasına kadar.

## Sağlık Uçları (NFR13.1)

| Uç | Çıktı | 503 ne zaman |
|---|---|---|
| Genel `/healthz` (127.0.0.1:8080, Caddy üzerinden dışarıya) | `{"status":"ok","version":"v0.1.0"}` | Açılış bitmedi; ya da yazım iş parçacığı 1 sn içinde yanıt vermedi |
| İç `/healthz` (127.0.0.1:8081, yalnızca sunucu içinden) | Aynı alanlar + `activeRooms`, `activeMatches`, `connections`, `errorCount` + yukarıdaki ölçümlerin hepsi | Aynı |

- Yazım iş parçacığının yanıt verip vermediği basit bir yoklama mesajıyla denenir (depoda okuma yapmaz, yalnızca iş parçacığının döngüsünün döndüğünü gösterir); sonuç 1 saniye önbelleğe alınır, böylece sık sorgu yazım iş parçacığını meşgul etmez.
- Yanıtlar `Cache-Control: no-store` taşır. İç uç C2'deki dört alanı aynen verir; ek ölçüm alanları C2'ye yalnızca eklemedir (logical-components Hizalamalar).

## Hizmet Hedefleri (NFR13.5)

| SLI | Tanım | SLO | Pencere | Hata bütçesi |
|---|---|---|---|---|
| Erişilebilirlik | Başarılı dış `/healthz` denetimi / bütün denetimler (5 dakikada bir) | ≥ %99 | 30 gün kayan | ~7 sa 12 dk / 30 gün |
| Hız | Sunucu işleme süresi 150 ms altında kalan komutlar / bütün komutlar | ≥ %95 | 7 gün kayan | %5 |
| Hata | `internal_error` ile biten komutlar / bütün komutlar | ≤ %0,1 | 7 gün kayan | %0,1 |

Hız ve hata SLI'ları için iç uç anlık değerleri verir; 7 günlük pencere izleme aşamasında, iç ucu dakikada bir okuyup saklayan küçük bir sunucu içi betikle hesaplanır (betik yalnızca sayıları saklar; kişisel veri yoktur).

## Uyarı Eşikleri (NFR13.6)

| Uyarı | Eşik | Hangi SLO'dan önce | Kaynak ölçüm |
|---|---|---|---|
| Hizmet yok | Dış `/healthz` art arda 2 denetimde (10 dk) başarısız | Erişilebilirlik | Dış denetim |
| Hata artışı | 10 dakikada 10'dan fazla yeni hata | Hata | `errorCount` farkı |
| Yavaşlama | Son 5 dk `commandLatencyP95Ms` > 300 ms | Hız (ayrıca NFR2.6 büyüme tetiği) | İç uç |
| Bellek | `memoryRssMb` > 400 | Çökme öncesi (NFR2.6) | İç uç |
| İşlemci | 5 dk ortalama > %70 | Büyüme tetiği (NFR2.6) | Sistem ölçümü |

Her uyarı ilgili SLO ihlal edilmeden önce tetiklenir (operation.md). Uyarının sahibine nasıl ulaşacağı (ör. e-posta) ve dış denetim aracı izleme aşamasında ücretsiz bir araçla kurulur; iskelet iki ucu ve ölçümleri hazır tutar. Pano (dashboard) iskelette yoktur; iç uç ve günlük yeterlidir.

## İz Sürme (NFR13.7)

Dağıtık izleme yoktur: tek süreçtir. Bir komutun yolu `commandId` ile takip edilir: reddedilen ya da hatalı komutun günlük kaydı `commandId` taşır; istemci de geliştirme ekranında aynı numarayı gösterebilir. Bağlantıya özgü sorunlarda `connId` kullanılır.

## Bot Testi Raporu (NFR13.8)

Bot oyunculu uçtan uca test bitince Construction doğrulama komutu (`npm run verify`) şu kısa raporu yazar (standart çıktıya ve `reports/e2e-summary.json`'a; depoya alınmaz):

- Kazanan taraf, oyun süresi, gece ve gün sayısı
- İşlenen komut sayısı, sunucu işleme süresinin %50 ve %95 değeri (iç uçtan okunur)
- Reddedilen komutlar ve neden kodları (sayılarıyla)
- Gizli bilgi taraması sonucu (köylü botlarına giden mesajlarda yasak alan sayısı: 0 olmalı)
- Kapsam özeti (tüm kod ve `src/rules/`)

## Bileşen Başına Sağlık ve Hata Ölçümü

| Bileşen | Sağlık ölçümü | Hata ölçümü |
|---|---|---|
| ConnectionGateway | `connections`, genel `/healthz` | Mesaj seli kapatmaları, `command.rejected` |
| RoomQueue + MatchFlow + RoomManager | `activeRooms`, `activeMatches`, `commandLatencyP95Ms` | `command.internal_error` |
| StoreWriter | `/healthz` yoklaması, `commitP95Ms`, `writeQueueDepth` | `store.batch_failed`, `store.worker_restart` |
| ViewDispatcher | `eventLoopDelayP95Ms` | Atlanan görünüm sayısı (`errorCount`'a girmez, ayrı sayaç `viewsSkipped`) |
| ExpirySweep | `sweepDeleted` | `sweepFailed` |

## Assumptions & Open Questions

- [assumption] Yüzdelik hesabının sabit sınırlı kovalarla yaklaşık yapılması benim seçtiğim yöntemdir; 150 ms ve 300 ms kova sınırlarında olduğu için SLO ve uyarı eşikleri tam ölçülür.
- [assumption] Normal akış retlerinin (`phase_closed`, `duplicate`) dakikalık özet satırına indirilmesi, günlüğün 200 MB sınırını korumak içindir.
- [assumption] 7 günlük SLI penceresini hesaplayan sunucu içi betik izleme aşamasında yazılır; iskelette yoktur.
- Açık soru: dış denetim aracı ve uyarı kanalı izleme aşamasında seçilir (contract-summary C2 Açık Sorular, ISS-03).
