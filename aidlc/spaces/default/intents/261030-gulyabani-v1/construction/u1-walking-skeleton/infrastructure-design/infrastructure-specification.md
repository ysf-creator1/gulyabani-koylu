# Altyapı Tanımı — U1 Yürüyen İskelet

Bu belge, oyunun çalışacağı yeri tanımlar: Oracle Cloud Always Free hesabı ve bölgesi, makine, ağ, adres, sunucunun içindeki programlar (Caddy, oyun programı, `systemd`), dosya yerleri, günlük ayarları, ortamlar, maliyet ve sunucu kaybolursa yeniden kurulum. Bütün parçalar (U1–U8) tek sunucu programının içindedir (`components.md`, `logical-components.md`); bu yüzden altyapı bir kez kurulur ve sonraki parçalar yalnızca ekleme yapar. Tam ayar dosyaları ve betikler Kod Üretimi'nde yazılır; burada her ayarın değeri ve gerekçesi sabitlenir.

## Sources

- Özet onayı ve sahibin kararları: `infrastructure-design-questions.md` — [Q1] C (önce tamamen ücretsiz hesap, gerekirse "kullandıkça öde"), [Q2] A (ücretsiz DuckDNS alt adresi); Looks correct.
- Hız tasarımı: `nfr-design/performance-design.md` (performance-design; tam eşitlemeli kesinleştirme %95'te ≤ 20 ms varsayımı, en az bir tam çekirdek, önceden sıkıştırılmış statik dosyalar).
- Güvenlik tasarımı: `nfr-design/security-design.md` (security-design; Güven Sınırları, Ağ ve Şifreleme, Kişisel Veri ve IP — Caddy günlük ayarı, Sağlık Kontrolünün İç Kapısı, Sırlar, Süreç Yetkileri).
- Ölçek tasarımı: `nfr-design/scalability-design.md` (scalability-design; Bellek Bütçesi 512 MB, `--max-old-space-size=288`, Büyüme Yolu, Maliyet).
- Dayanıklılık tasarımı: `nfr-design/reliability-design.md` (reliability-design; Hizmet Yöneticisi, Açılış, Planlı Kapanış, Temizlik, Yayın ve Geri Alma).
- İzleme tasarımı: `nfr-design/observability-design.md` (observability-design; sistem günlüğü 7 gün / 200 MB, iki sağlık ucu).
- Mantıksal parçalar: `nfr-design/logical-components.md` (logical-components; Çalışma Yerleri, Depo Dosyaları `game.db` ve `records.db`, Arıza Alanları).
- Yapı taşları: `inception/domain-design/components.md` (components; dış bağımlılıklar: kalıcı veri deposu, işletim sisteminin rastgele sayı kaynağı).
- Fonksiyonel tasarım: `functional-design/functional-spec.md` (functional-spec; A13 sağlık kontrolü ve 24 saatte silme, A14 bot testi).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 web adresleri, `/healthz`, yayın denetimi; C9 depo düzeni).
- Teknoloji kararları: `nfr-requirements/tech-stack-decisions.md` (tech-stack-decisions; Node.js 24 LTS, SQLite, Caddy + `systemd`, GitHub Actions).
- Ekip ve proje kuralları: `memory/team.md` (Deployment: tek ücretsiz sunucu, ayrı deneme ortamı yok, canlıya çıkış elle onaylı ve sürüm etiketiyle, geri alma), `memory/project.md` (sıfır maliyet, IP saklama yasağı, sırların ortam değişkeninde tutulması).

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Bulut hesabı | Oracle Cloud, önce tamamen ücretsiz (Free Tier) hesap. Geçiş koşulu: Ampere makinesi 7 gün denemede açılamazsa ya da Oracle makineyi boşta diye bir kez durdurursa hesap "kullandıkça öde" (Pay As You Go) hesabına yükseltilir; Always Free kaynaklar yine ücretsiz kalır. Yükseltmeden önce 1 USD bütçe uyarısı kurulur | [Q1] C; sıfır maliyet (project.md Mandated, scalability-design Maliyet). Ücretsiz hesapta Oracle, 7 gün boyunca işlemci, ağ ve (Ampere'de) bellek kullanımı %95'lik dilimde %20'nin altında kalan makineyi durdurabilir; boşta bir oyun sunucusu bu sınırın altındadır. Yükseltilmiş hesapta bu durdurma yoktur |
| Bölge | Ana bölge: Italy Northwest (Milano, `eu-milan-1`); Ampere kapasitesi yoksa hesap açılırken Germany Central (Frankfurt, `eu-frankfurt-1`) | Türkiye'ye yakın (gidiş-dönüş yaklaşık 40–60 ms; NFR1.2'nin 1 saniyelik bütçesinde küçük pay). Ücretsiz kaynaklar yalnızca ana bölgededir ve ana bölge sonradan değişmez; bu yüzden hesap açılırken seçilir |
| Hesaplama modeli | Tek sanal makine (VM): `VM.Standard.A1.Flex` (Ampere, ARM64); üzerinde iki uzun süreli hizmet: Caddy ve oyun programı (`systemd`) | Tek süreç tasarımı (logical-components Çalışma Yerleri); kapsayıcı (container) ve sunucusuz yapı gereksiz katman ekler; ücretsiz hak içinde en güçlü makine türü |
| Makine boyutu | Hedef 2 OCPU + 12 GB bellek; kapasite yoksa 1 OCPU + 6 GB ile başlanır, sonra durdurup büyütülür | Ücretsiz hak 4 OCPU + 24 GB'tır (ayda 3.000 OCPU-saat, 18.000 GB-saat). Ampere'de 1 OCPU bir tam fiziksel çekirdektir; 2 çekirdekte ana iş parçacığı, yazım iş parçacığı ve Caddy birbirini beklemez (performance-design "en az bir tam çekirdek", scalability-design Büyüme Yolu "çekirdek hızı ve bellek öncelikli"). Oyun programı 512 MB ile sınırlıdır; bellek payı işletim sistemi, Caddy ve sistem günlüğü içindir |
| İşletim sistemi | Canonical Ubuntu 24.04 LTS (aarch64), Oracle'ın platform kalıbı | `systemd` 255: `RestartSteps` ve `RestartMaxDelaySec` (≥ 254) desteklenir (reliability-design Hizmet Yöneticisi); 2029'a kadar güvenlik güncellemesi; CI ile aynı Ubuntu sürümü |
| Ağ topolojisi | Bir VCN (`10.0.0.0/16`), bir genel alt ağ (`10.0.0.0/24`), İnternet Ağ Geçidi, `0.0.0.0/0` → ağ geçidi yönlendirmesi. Yalnızca IPv4. Makineye geçici (ephemeral) genel IP | Tek makine için en sade ağ; yük dengeleyici yok (scalability-design: tek sunucu, durumlu). Geçici genel IP makine durdurulup başlatılınca korunur; yalnızca makine silinirse değişir (yeniden kurulumda DuckDNS kaydı elle güncellenir) |
| Gelen trafik (Oracle güvenlik listesi) | TCP 80 ve 443 herkese; TCP 22 herkese (yalnızca anahtarla giriş); ICMP tip 3 kod 4 (yol MTU bulma). Başka hiçbir kapı açık değildir; 8080 ve 8081 hiç açılmaz | security-design Ağ ve Şifreleme (NFR7.1, NFR7.2). SSH'yi tek IP'ye kısıtlamak sahibin değişken ev IP'si yüzünden yapılmaz; parola girişi kapalıdır |
| Makinenin kendi güvenlik duvarı | Oracle'ın Ubuntu kalıbındaki `iptables` kuralları yalnızca 22'ye izin verir ve kalanı reddeder; 80 ve 443 için kabul kuralları reddetme kuralının önüne eklenir ve `netfilter-persistent` ile kalıcı yapılır. `LOG` kuralı yoktur | Bu adım unutulursa güvenlik listesi açık olsa da sayfa açılmaz. Paket günlüğü kapalı: IP günlüğe düşmez (security-design Kişisel Veri) |
| Giden trafik | Her yere açık | `apt` güncellemeleri, Caddy'nin sertifika alması (Let's Encrypt), zaman eşitlemesi |
| VCN akış günlükleri | Kapalı (Oracle Logging hizmeti bu ağ için açılmaz) | Akış günlükleri kaynak IP taşır (NFR7.11, project.md Forbidden) |
| Adres ve TLS | DuckDNS ücretsiz alt adresi (ör. `gulyabani.duckdns.org`; kesin ad hesap açılırken seçilir), A kaydı makinenin genel IP'si. TLS'i Caddy sonlandırır; ücretsiz sertifikayı Let's Encrypt'ten kendisi alır ve yeniler (HTTP-01 / TLS-ALPN-01). `PUBLIC_ORIGIN=https://<alt adres>` | [Q2] A; security-design Ağ ve Şifreleme. IP sabit olduğu için sunucuda DuckDNS güncelleme betiği ve belirteci yoktur (sunucuda sır yok, NFR7.8). `duckdns.org` Genel Sonek Listesi'nde olduğundan sertifika sınırları alt adres başına sayılır |
| Depolama | Önyükleme diski 50 GB, "Balanced" başarım (ücretsiz 200 GB hakkının içinde). Ayrı blok disk yok. Oyun deposu `DATA_DIR=/var/lib/gulyabani/game.db` (+ `-wal`, `-shm`); U7'de `records.db` aynı klasöre eklenir | logical-components Depo Dosyaları; depo ≤ ~300 MB + sistem günlüğü ≤ 200 MB + 3 sürüm klasörü (scalability-design). Oda verisi yedeklenmez (reliability-design, NFR5.9); diskin kaybı kabul edilen risktir |
| Ortamlar | Geliştirme: sahibin bilgisayarı (`npm run dev`). CI: GitHub Actions (her çalıştırmada sıfırdan). Sunucu: tek Oracle makinesi — v1 yayınına kadar deneme ve iskelet denetimi için, v1'den sonra yalnızca canlı oyun. Ayrı deneme (staging) ortamı yoktur | team.md Deployment (sıfır bütçe, bilinçli sapma). Ortam farkını azaltmak için CI, sunucuyla aynı Ubuntu, aynı Node.js sürümü ve ARM64 üzerinde de çalışır (`cicd-pipeline.md`) |
| Kurulumun kod olarak tutulması | Sunucunun içi (kullanıcı, klasörler, Node.js, Caddy, `systemd` birimi, günlük, güvenlik duvarı, güncelleme ayarları) depodaki `infra/` klasöründeki yeniden çalıştırılabilir (idempotent) kurulum betiği ve ayar dosyalarıyla kurulur. Oracle hesabındaki birkaç kaynak (VCN, güvenlik listesi, makine, bütçe uyarısı) Türkçe adım adım kılavuzla (`infra/oracle-setup.md`) konsoldan açılır | Bulut tarafı birkaç kaynaktır ve bir kez açılır; Terraform için sahibin bilgisayarında Oracle API anahtarı (bir sır) gerekirdi. Sunucunun içi sık değişir ve tamamen betikle tekrarlanabilir (Yeniden Kurulum aşağıda) |

## Sunucunun İçi

### Programlar ve kullanıcılar

| Program | Sürüm / kaynak | Çalışan kullanıcı | Dinlediği yer | Not |
|---|---|---|---|---|
| Caddy | Caddy 2, Caddy'nin resmî `apt` deposundan | `caddy` (paketin kendi kullanıcısı) | `:80`, `:443` | 1024 altı kapıyı paketin verdiği yetkiyle dinler; oyun verisini okuyamaz (security-design Süreç Yetkileri) |
| Oyun programı | Node.js 24 LTS'nin resmî ARM64 paketi, sürümü depoda `.nvmrc` ile sabit; özet (SHA-256) Node.js'in imzalı `SHASUMS256.txt` listesiyle doğrulanır; `/opt/node/<sürüm>` + `/usr/local/bin/node` bağı | `gulyabani` (sistem kullanıcısı, giriş kabuğu yok) | `127.0.0.1:8080` (genel), `127.0.0.1:8081` (iç) | CI ile aynı Node.js sürümü; güncelleme `.nvmrc` değişikliği + kurulum betiğiyle yapılır |
| Zaman eşitlemesi | Kalıbın `chrony` ayarı (Oracle'ın iç NTP sunucusu) | `_chrony` | — | Süreler mutlak sunucu saatiyle tutulur (reliability-design Süreler); iskelet denetiminde `timedatectl` "eşitlenmiş" gösterir |
| Güvenlik güncellemeleri | `unattended-upgrades` açık, kendiliğinden yeniden başlatma kapalı (`Automatic-Reboot "false"`); `needrestart` oyun programını ve Caddy'yi kendiliğinden yeniden başlatmaz | — | — | Kütüphane güncellemesi oyun ortasında hizmeti yeniden başlatmasın; makine yeniden başlatması ve bekleyen hizmet yeniden başlatmaları sahibin onayıyla, `activeMatches` 0 iken yapılır |

### Dosya yerleri ve izinler

| Yol | Sahibi ve izin | İçerik |
|---|---|---|
| `/opt/gulyabani/releases/<vX.Y.Z>/` | `root:root`, klasör 755, dosya 644 | Bir sürümün derlenmiş programı, web paketi, içerik kataloğu, `node_modules`, `infra/` ayarları (yayın paketi, `cicd-pipeline.md`) |
| `/opt/gulyabani/current` | `root:root` sembolik bağ | Çalışan sürümün klasörü; yayında tek adımda değiştirilir (reliability-design Yayın ve Geri Alma) |
| `/var/lib/gulyabani/` | `gulyabani:gulyabani`, 700 (`systemd` `StateDirectory=` ile, `StateDirectoryMode=0700`) | `game.db` ve yan dosyaları, `game.db.corrupt-*`; program `UMask=0077` ile çalıştığı için yeni dosyalar 600 |
| `/etc/gulyabani/gulyabani.env` | `root:root`, 600 | `PUBLIC_ORIGIN`, `PORT_PUBLIC=8080`, `PORT_INTERNAL=8081`, `DATA_DIR=/var/lib/gulyabani`, `NODE_ENV=production`. Sır yoktur |
| `/etc/gulyabani/version.env` | `root:root`, 644 | `APP_VERSION=<vX.Y.Z>`; yayın betiği yazar |
| `/etc/gulyabani/secrets.env` | `root:root`, 600 | İskelette yok. İleride gereken her sır yalnızca burada durur (NFR7.8); `systemd` dosyayı kök yetkisiyle okuyup programa ortam değişkeni olarak verir, oyun kullanıcısı dosyayı okuyamaz |
| `/etc/caddy/Caddyfile` | `root:root`, 644 | Depodaki `infra/Caddyfile`'dan; alt adres `{$GULYABANI_HOST}` ortam değişkeniyle verilir |

### Oyun programının hizmet birimi (`gulyabani.service`)

| Ayar | Değer | Neden |
|---|---|---|
| `User` / `Group` | `gulyabani` | Ayrıcalıksız kullanıcı (NFR7.13) |
| `WorkingDirectory` | `/opt/gulyabani/current` | Çalışan sürüm |
| `ExecStart` | `/usr/local/bin/node --max-old-space-size=288 dist/server/main.js` | Yığın sınırı (scalability-design Bellek Bütçesi) |
| `EnvironmentFile` | `/etc/gulyabani/gulyabani.env`, `/etc/gulyabani/version.env`, `-/etc/gulyabani/secrets.env` (yoksa atlanır) | Ayarlar ortam değişkeniyle (security-design Sırlar) |
| `Restart` / `RestartSec` | `always` / `2` | Çökmeden 2 sn sonra yeniden başlatma (NFR5.4) |
| `RestartSteps` / `RestartMaxDelaySec` | `5` / `60` | Art arda çökmede bekleme 2 sn'den 60 sn'ye artar (reliability-design) |
| `StartLimitIntervalSec` (`[Unit]`) | `0` | Hizmet kalıcı "başarısız" durumuna düşmez |
| `KillSignal` / `TimeoutStopSec` | `SIGTERM` / `10` | Planlı kapanış ≤ 5 sn, en geç 10 sn (NFR5.3) |
| `MemoryMax` | `512M` | Kesin bellek sınırı (NFR2.4) |
| `LimitNOFILE` | `8192` | 2.000 bağlantı + depo ve statik dosyalar; varsayılan 1.024 yetmez (NFR2.5) |
| `UMask` | `0077` | Depo dosyaları 600, klasörler 700 (NFR7.13) |
| `StateDirectory` / `StateDirectoryMode` | `gulyabani` / `0700` | Veri klasörünü `systemd` doğru sahip ve izinle açar |
| `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `PrivateDevices` | `yes` | security-design Süreç Yetkileri; yazılabilir tek yer veri klasörüdür (`StateDirectory` bunu kendiliğinden yazılabilir yapar) |
| `CapabilityBoundingSet` / `AmbientCapabilities` | boş | Oyun programının hiçbir yetkiye ihtiyacı yoktur |
| `RestrictAddressFamilies` | `AF_INET AF_INET6 AF_UNIX` | Yalnızca ağ ve yerel soket |
| `ProtectKernelTunables`, `ProtectKernelModules`, `ProtectControlGroups`, `RestrictSUIDSGID`, `LockPersonality`, `RestrictRealtime` | `yes` | Ek sertleştirme; iskelet denetiminde `systemd-analyze security gulyabani` puanı kaydedilir |
| `MemoryDenyWriteExecute` | kullanılmaz | Node.js'in anında derleyicisi (JIT) bunu kaldırmaz |
| `StandardOutput` / `StandardError` | `journal` | JSON günlük satırları sistem günlüğüne (observability-design) |

### Caddy ayarı

Caddy yalnızca TLS, HTTP'den HTTPS'e kalıcı yönlendirme (308, Caddy'nin kendiliğinden yaptığı) ve `127.0.0.1:8080`'e iletme yapar; iç kapıyı (8081) hiç iletmez. Güvenlik başlıklarını oyun programı ekler (security-design Web Yanıtları); Caddy yalnızca kendi eklediği `Server` ve `Via` başlıklarını kaldırır ("sunucu başlıkta kendini tanıtmaz" kuralı). Kesin dosya Kod Üretimi'nde yazılır; özü:

```caddyfile
{
	log default {
		output stderr
		format json
		level ERROR
		exclude http.log.access http.stdlib
	}
}
{$GULYABANI_HOST} {
	header -Server
	header -Via
	reverse_proxy 127.0.0.1:8080
}
```

- Erişim günlüğü açılmaz (site bloğunda `log` yönergesi yoktur). `http.stdlib` dışlandığı için "TLS handshake error from <adres>" satırları yazılmaz (security-design Kişisel Veri).
- TLS sürümleri Caddy'nin varsayılanıdır: yalnızca TLS 1.2 ve 1.3.
- İskelet denetiminde Caddy ve oyun programının sistem günlüğü IPv4/IPv6 desenleriyle taranır (`journalctl -u caddy -u gulyabani`); bir adres bulunursa Caddy'nin çalışma günlüğü tamamen kapatılır (`output discard`) — security-design'daki engelleyici ölçüt.
- Caddy, iletilen isteğe `X-Forwarded-For` ekler; oyun programı bu başlığı hiç okumaz (ESLint kuralı, security-design). Asıl önlem budur; başlık ayrıca silinmez.

### Sistem günlüğü ve SSH

| Ayar | Değer | Neden |
|---|---|---|
| `journald` (`/etc/systemd/journald.conf.d/gulyabani.conf`) | `Storage=persistent`, `SystemMaxUse=200M`, `MaxRetentionSec=7day` | observability-design: 7 gün ya da 200 MB |
| SSH | Yalnızca anahtar (`PasswordAuthentication no`, `KbdInteractiveAuthentication no`), `PermitRootLogin no`, `MaxAuthTries 3`; giriş kullanıcısı kalıbın `ubuntu` kullanıcısı, sahibin bilgisayarındaki parolalı ed25519 anahtarı | Yönetim ve yayın betiği bu yoldan girer (security-design: iç kapıya erişim = SSH'ye erişim) |
| SSH günlükleri | Varsayılan düzey | `sshd` satırlarında SSH'ye bağlanmaya çalışan tarayıcıların adresleri olabilir; bunlar oyuncu değildir, oyun trafiği bu hizmetten geçmez ve 7 günde silinir. NFR7.11 taraması oyun programı ve Caddy günlüklerine uygulanır |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| SQLite (`game.db`) | database | Tek dosya, WAL, `synchronous=FULL`, `secure_delete=ON`, 16 MB sayfa önbelleği; tek yazar StoreWriter yazım iş parçacığı | Ayrı veritabanı sunucusu yok (tech-stack-decisions TD-02, TD-04). Kesinleştirme süresi önyükleme diskinde iskelet denetiminde ölçülür; %95'te 20 ms'yi aşarsa önce toplu işlem ve gönderim turu ayarlanır, sonra ücretsiz hak içinde daha yüksek disk başarımı denenir (performance-design varsayımı) |
| SQLite (`records.db`) | database | U7'de aynı klasöre eklenir; aynı ayarlar | logical-components Depo Dosyaları |
| Caddy | load-balancer | Ters vekil (reverse proxy): TLS sonlandırma, 80 → 443 (308), WebSocket iletme, `127.0.0.1:8080`'e tek hedef | Gerçek yük dengeleme yoktur; Oracle'ın ücretsiz yük dengeleyicisi kullanılmaz (tek makine, gereksiz katman) |
| DuckDNS | dns | `A <alt adres> → makinenin genel IP'si`; sahibin DuckDNS hesabında elle girilir | Ücretsiz. Sunucuda güncelleme betiği ve belirteç yok |
| Let's Encrypt (Caddy üzerinden) | other (sertifika) | Caddy'nin otomatik HTTPS'i; sertifika ve anahtar `/var/lib/caddy/` altında, yalnızca `caddy` kullanıcısının | Ücretsiz; yenileme Caddy'nin kendisinde |
| Statik dosyalar | cdn | CDN yok; oyun programı önceden sıkıştırılmış (Brotli, gzip), içerik özetli dosyaları uzun önbellek başlığıyla verir | performance-design Tarayıcı Tarafı (NFR1.6); tek sayfa ve küçük paket, CDN gerekmez |
| Önbellek, kuyruk, arama | cache / queue / search | Yok | Bütün etkin durum programın belleğinde; odanın sırası bellek içidir (logical-components) |
| Oracle Monitoring + Notifications | other (izleme) | Makine ölçümleri (işlemci, bellek) ve programın iç ölçümleri; uyarılar sahibin e-postasına | Ücretsiz hak içinde; kurulumu izleme aşamasında (`monitoring-design.md`) |
| Oracle Budgets | other (maliyet) | Aylık 1 USD bütçe, gerçek harcama %100'e ulaşınca sahibin e-postasına uyarı | Ücretsiz; hesap açılır açılmaz kurulur (scalability-design Maliyet) |
| UptimeRobot (ücretsiz plan) | other (dış denetim) | 5 dakikada bir `https://<alt adres>/healthz` | Kurulumu izleme aşamasında (`monitoring-design.md`); yalnızca genel `/healthz`'i görür, oyuncu verisi görmez |

## Shared Infrastructure

Bütün parçalar (U1–U8) aynı sunucu programının içinde, aynı makinede çalışır (contract-summary, components); aşağıdaki kaynakları paylaşırlar.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Oracle makinesi, ağ, Caddy, `systemd` birimi | U1 | U2–U8 | Yalnızca U1'in kurulum betiği ve yayın paketi değiştirir; sonraki parçalar yalnızca uygulama kodu ekler |
| `game.db` (oda verisi) | U1 (StoreWriter) | U2–U5 (kendi tablo önekleriyle) | Tek yazar; bölüm öneki kuralı (contract-summary C9) |
| `records.db` (1 yıllık kayıtlar) | U7 | U1–U5 olayları (U7'nin kayıt yazarı üzerinden) | Ayrı dosya; oda verisinin bozulmasından etkilenmez (logical-components) |
| İki sağlık ucu ve iç ölçümler | U1 | U8 (ölçüm alanları ekler), izleme betiği | Genel uç yalnızca durum ve sürüm; iç uç yalnızca `127.0.0.1:8081` (security-design) |
| CI ve yayın hattı | U1 | U2–U8 | Her parça aynı kapılardan geçer (`cicd-pipeline.md`); kapılar gevşetilmez |

## Kapasite ve Maliyet

| Kaynak | Ücretsiz hak | Bu tasarımın kullandığı | Ücret |
|---|---|---|---|
| Ampere A1 işlemci ve bellek | 4 OCPU, 24 GB | 2 OCPU, 12 GB (kapasite yoksa 1 OCPU, 6 GB) | 0 |
| Blok depolama | 200 GB toplam | 50 GB önyükleme diski | 0 |
| Giden veri | Ayda 10 TB | Zirvede (50 oda, ~1.350 bağlantı) ayda birkaç on GB | 0 |
| VCN | 2 VCN | 1 | 0 |
| Monitoring / Notifications | Ayda 500 milyon ölçüm noktası / 1.000 e-posta | Dakikada ~12 ölçüm (~520 bin/ay); ayda birkaç uyarı e-postası | 0 |
| DuckDNS, Let's Encrypt, UptimeRobot (ücretsiz plan), GitHub (açık depo: Actions, Releases) | Ücretsiz | — | 0 |

Toplam aylık maliyet: 0 USD (NFR3.1). Hesap "kullandıkça öde"ye geçerse bütçe uyarısı ilk sentte haber verir; ücretli hiçbir kaynak (ücretli disk başarımı, ek makine, yük dengeleyici) sahibin açık onayı olmadan açılmaz (project.md Forbidden).

## Yeniden Kurulum (makine kaybolursa)

Oda verisi 24 saatliktir ve yedeklenmez; makine kaybolursa yalnızca süren odalar kaybolur (reliability-design, kabul edilen risk).

1. `infra/oracle-setup.md` kılavuzuyla yeni makine açılır (aynı VCN ve güvenlik listesi durur).
2. DuckDNS kaydı yeni genel IP'ye güncellenir (sahibin hesabında elle).
3. Kurulum betiği (`infra/provision.sh`) SSH ile bir kez çalıştırılır: kullanıcı, klasörler, Node.js, Caddy, güvenlik duvarı, sistem günlüğü, güncelleme ayarları, hizmet birimi.
4. Son sürüm etiketi yayın betiğiyle yüklenir (`cicd-pipeline.md` Yayın).
5. Yayın sonrası kontrol geçer.

Hedef süre: elle yaklaşık 1 saat (Ampere kapasitesi varsa). Erişilebilirlik hedefi (%99, ayda ~7 saat) bunu karşılar.

## İskelet Denetiminde Sunucuda Yapılacak Kontroller

security-design'ın "Altyapı Tasarımı'nda sınanabilir hâle gelir" dediği ölçütler; iskelet denetim noktasında elle yapılır ve sonuçları sahibin iskelet onayıyla kaydedilir.

| Ölçüt | Kontrol |
|---|---|
| NFR7.1 | `http://<alt adres>/` → 308; `openssl s_client -tls1_1` başarısız, `-tls1_2` ve `-tls1_3` başarılı; HSTS başlığı var |
| NFR7.2 | `ss -ltnp`: 8080 ve 8081 yalnızca `127.0.0.1`'de; dışarıdan 8080/8081'e bağlantı kurulamıyor |
| NFR7.11 | `journalctl -u caddy -u gulyabani` çıktısında IPv4/IPv6 deseni yok (bot oyunu ve telefon denemesinden sonra) |
| NFR7.12 | Dışarıdan `/healthz` yalnızca `status` ve `version`; iç uç dışarıdan erişilemiyor |
| NFR7.13 | `ps`: program `gulyabani` kullanıcısında; `/var/lib/gulyabani` 700, depo dosyaları 600; `systemd-analyze security gulyabani` puanı kaydedilir |
| NFR1.3 | Sunucuda yazım ölçüm testi (saniyede 300 komut); toplu kesinleştirme %95 değeri kaydedilir (performance-design) |
| NFR5.4 | `kill -9` sonrası hizmet ≤ 5 sn'de yeniden başlıyor, bot oyunu kaldığı yerden sürüyor |
| NFR4.5 | Gerçek telefonlarda Wi-Fi ve mobil veriyle yeniden bağlanma denemesi (team.md Walking Skeleton) |
| Zaman | `timedatectl`: saat eşitlenmiş |

## Kod Üretimi'ne Devreden Hizalamalar

Önceki aşamaların belgeleri değiştirilmez; aşağıdakiler yalnızca eklemedir ve Kod Üretimi'nde uygulanır.

| Nerede | Hizalama |
|---|---|
| security-design Web Yanıtları | Caddy, kendi eklediği `Server` ve `Via` başlıklarını kaldırır; güvenlik başlıklarına dokunmaz ("Caddy başlık eklemez ve kaldırmaz" ifadesinin tek istisnası, "sunucu başlıkta kendini tanıtmaz" kuralı için) |
| security-design Sırlar | Gelecekteki sırlar `/etc/gulyabani/secrets.env` dosyasında, `root:root` 600 izinle tutulur (oyun kullanıcısına ait dosyadan daha sıkı; `systemd` kök yetkisiyle okuyup programa verir) |
| Oyun programı | `--check-config` seçeneği: ortam değişkenlerini ve içerik kataloğunu (C4) doğrular, dinleyici açmadan 0 ya da 1 koduyla çıkar; yayın betiği bağ değiştirmeden önce çalıştırır |
| İç `/healthz` | 7 günlük hız ve hata hedefleri için açılıştan beri sayaçlar eklenir: `commandsTotal`, `commandsUnder150Ms`, `commandInternalErrors` (observability-design ölçümlerine yalnızca ekleme; `monitoring-design.md`) |

## Assumptions & Open Questions

- [assumption] Milano bölgesinde Ampere kapasitesinin bulunabileceği ve Türkiye'den gidiş-dönüşün yaklaşık 40–60 ms olduğu varsayılır; hesap açılırken kapasite yoksa Frankfurt seçilir. İskelet denetiminde telefonlardan ölçülür.
- [assumption] Önyükleme diskinin "Balanced" başarımında tam eşitlemeli kesinleştirmenin %95'te 20 ms altında kaldığı varsayılır (performance-design ile aynı varsayım); iskelet denetiminde ölçülür.
- [assumption] Ücretsiz hesapta boşta makinenin durdurulma ölçütü (7 gün, %95'lik dilimde %20 altı) Oracle'ın bugünkü kuralıdır; kural değişirse [Q1] C'nin geçiş koşulu aynen uygulanır.
- [assumption] Geçici genel IP'nin makine durdurulup başlatılınca korunduğu varsayılır; korunmazsa DuckDNS kaydı elle güncellenir (Yeniden Kurulum adım 2).
- [assumption] DuckDNS'te istenen alt adın (ör. `gulyabani`) boş olduğu varsayılır; değilse sahip benzer bir ad seçer ve `PUBLIC_ORIGIN` ona göre yazılır.
- Açık soru: oyun sürerken acil düzeltme gerekirse ne yapılacağı (contract-summary C2 Açık Sorular) Ortam ve Dağıtım aşamalarında kararlaştırılır; yayın betiği o zamana kadar oyun sürerken yüklemez.
- Açık soru: Oracle hesabını sahip açar (DEP-01); iskeletin dış adreste çalışması buna bağlıdır. Kod Üretimi hesap beklenmeden başlar.
