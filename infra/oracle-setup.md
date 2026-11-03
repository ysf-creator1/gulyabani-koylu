# Oracle Cloud Kurulum Kılavuzu (adım adım)

Bu kılavuz, oyunun çalıştığı ücretsiz Oracle sunucusunun bulut tarafını (hesap, ağ, güvenlik
listesi, makine, bütçe uyarısı) ve ücretsiz DuckDNS adresini anlatır. Sunucunun içi (kullanıcı,
klasörler, Node.js, Caddy, günlük, güvenlik duvarı, hizmet birimi) `infra/provision.sh` ile kurulur.
Kaynak: `infrastructure-specification.md` (Deployment tablosu, Yeniden Kurulum).

> Bu kılavuza hiçbir şifre, anahtar ya da IP adresi yazılmaz. SSH özel anahtarı yalnızca
> sahibin bilgisayarında durur (project.md Forbidden ve Mandated).

## Bu kurulumdaki sapmalar

| Konu | Tasarımdaki | Bu kurulumda | Neden |
|---|---|---|---|
| Ana bölge | Italy Northwest (Milano) | **Germany Central (Frankfurt, `eu-frankfurt-1`)** | Hesap açılırken Frankfurt seçildi; ana bölge sonradan değişmez. Türkiye'ye gidiş-dönüş yine kısa. |
| Makine boyutu | 2 OCPU + 12 GB (yoksa 1 OCPU + 6 GB) | **4 OCPU + 24 GB** (`VM.Standard.A1.Flex`) | Ücretsiz hakkın tamamı (ayda 3.000 OCPU-saat, 18.000 GB-saat) tek makineye verildi; yine ücretsizdir. Oyun programı 512 MB ile sınırlıdır. |

## 1. Hesap

1. <https://www.oracle.com/cloud/free/> adresinden **Free Tier** hesabı aç.
2. **Home Region** olarak **Germany Central (Frankfurt)** seç (sonradan değiştirilemez).
3. Hesaba girişte çok adımlı doğrulamayı (MFA) aç.
4. Hesap önce tamamen ücretsiz kalır. Ampere makinesi 7 gün denemede açılamazsa ya da Oracle
   makineyi boşta diye bir kez durdurursa hesap **Pay As You Go**'ya yükseltilir; Always Free
   kaynaklar yine ücretsizdir. Yükseltmeden önce aşağıdaki bütçe uyarısı mutlaka kurulu olmalı.

## 2. Bütçe uyarısı (1 USD)

1. Menü → **Billing & Cost Management** → **Budgets** → **Create Budget**.
2. Kapsam: kök bölme (root compartment). Aylık tutar: **1 USD**.
3. Uyarı kuralı: **Actual spend**, eşik **%100**, alıcı: sahibin e-postası.
4. Kaydet. İlk sentte e-posta gelir; ücretli hiçbir kaynak sahibin açık onayı olmadan açılmaz.

## 3. Ağ (VCN)

1. Menü → **Networking** → **Virtual Cloud Networks** → **Start VCN Wizard** →
   **Create VCN with Internet Connectivity**.
2. Ad: `gulyabani-vcn`. VCN CIDR: `10.0.0.0/16`. Genel alt ağ: `10.0.0.0/24`.
   Özel alt ağı kullanmayacağız (sihirbaz açsa da boş kalır). Yalnızca IPv4.
3. Sihirbaz İnternet Ağ Geçidini ve `0.0.0.0/0` yönlendirmesini kendisi kurar.
4. **Flow logs (akış günlükleri) açılmaz.** Akış günlükleri kaynak IP taşır (NFR7.11).

## 4. Güvenlik listesi (gelen trafik)

Genel alt ağın **Default Security List**'inde gelen kurallar yalnızca şunlar olmalı:

| Kaynak | Protokol | Kapı | Neden |
|---|---|---|---|
| `0.0.0.0/0` | TCP | 22 | SSH (yalnızca anahtarla giriş) |
| `0.0.0.0/0` | TCP | 80 | HTTP → HTTPS yönlendirmesi (Caddy) |
| `0.0.0.0/0` | TCP | 443 | HTTPS ve WSS (oyun) |
| `0.0.0.0/0` | ICMP | tip 3, kod 4 | Yol MTU bulma |

8080 ve 8081 **hiç açılmaz**; oyun programı yalnızca `127.0.0.1`'i dinler (NFR7.2).
Giden trafik her yere açık kalır (güncellemeler, sertifika, zaman eşitlemesi).

## 5. Makine

1. Menü → **Compute** → **Instances** → **Create instance**.
2. Ad: `gulyabani`. Kalıp (image): **Canonical Ubuntu 24.04** (aarch64).
3. Şekil (shape): **Ampere** → `VM.Standard.A1.Flex`, **4 OCPU, 24 GB** bellek.
   Kapasite yoksa birkaç saat sonra yeniden dene ya da daha küçük başlayıp sonra büyüt.
4. Ağ: `gulyabani-vcn`, genel alt ağ; **Assign a public IPv4 address** açık (geçici genel IP;
   makine durdurulup başlatılınca korunur, yalnızca makine silinirse değişir).
5. SSH anahtarı: sahibin bilgisayarında **parolalı ed25519** anahtar üret
   (`ssh-keygen -t ed25519`), yalnızca **açık** anahtarı (`.pub`) yapıştır.
6. Önyükleme diski: **50 GB**, başarım **Balanced** (ücretsiz 200 GB hakkının içinde).
7. Oluştur. Makine açılınca genel IP'yi not et (bu dosyaya yazma).
8. Sahibin bilgisayarında `~/.ssh/config` içine bir takma ad ekle:
   `Host oracle` → `HostName <genel IP>`, `User ubuntu`, `IdentityFile ~/.ssh/<anahtar>`.

## 6. DuckDNS adresi

1. <https://www.duckdns.org/> adresine sahibin GitHub ya da Google hesabıyla gir.
2. Alt adres olarak `gulyabanikoyu` ekle (`gulyabanikoyu.duckdns.org`).
3. **current ip** alanına makinenin genel IP'sini yaz ve **update ip** de.
4. Sunucuda DuckDNS güncelleme betiği ve belirteci kullanılmaz (IP sabittir; sunucuda sır yok).
   Makine silinip yeniden açılırsa yalnızca bu adım tekrarlanır.

## 7. Sunucunun içi

Sahibin bilgisayarından, depo kökünde:

```bash
infra/run-provision.sh oracle gulyabanikoyu.duckdns.org
```

Betik tekrar tekrar çalıştırılabilir. Kullanıcıyı, klasörleri, `.nvmrc`'deki Node.js sürümünü
(SHA-256 doğrulamalı), Caddy'yi, sistem günlüğü sınırlarını, SSH ayarlarını ve makinenin güvenlik
duvarında 80/443 kurallarını kurar. **Oyun hizmetini etkinleştirmez ve başlatmaz:** henüz
`/opt/gulyabani/current` yokken başlatılırsa hizmet çökme döngüsüne girerdi (inceleme bulgusu
R-05). İlk sürüm yayınlanınca yayın işlemi hizmeti etkinleştirir.

Caddy günlüğü yalnızca `ERROR` düzeyindedir; erişim günlüğü yoktur, "TLS handshake error from"
satırları (`http.stdlib`) dışlanır ve hata satırlarındaki istek alanlarından (`remote_ip`,
`client_ip`, `remote_port`, `headers`) adres ve başlıklar silinir (inceleme bulgusu R-01).

## 8. Kontrol listesi (iskelet denetiminde)

- `http://gulyabanikoyu.duckdns.org/` → 308 ile HTTPS'e gider.
- `ss -ltnp`: 8080 ve 8081 yalnızca `127.0.0.1` üzerinde.
- `journalctl -u caddy -u gulyabani` çıktısında IPv4/IPv6 deseni yok (bot oyunu ve telefon
  denemesinden sonra ve hizmet durdurulmuşken Caddy'ye istek gönderildikten sonra da).
- `timedatectl`: saat eşitlenmiş.
- Oracle konsolunda bütçe uyarısı etkin, akış günlükleri kapalı.
