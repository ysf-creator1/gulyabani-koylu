# Güvenlik Gereksinimleri — U2 Oda ve Lobi

Bu belge, U2'nin eklediği güvenlik, gizli bilgi ve kişisel veri gereksinimlerini ölçülebilir biçimde yazar.

- U1'in güvenlik gereksinimleri (`../../u1-walking-skeleton/nfr-requirements/security-requirements.md`, NFR7.1–NFR7.14, NFR8.1–NFR8.5, NFR15.1) aynen geçerlidir. Bu belge yalnızca ekleme yapar.
- U1'in alt numaralarıyla karışmasın diye U2'nin alt numaraları 20'den başlar (ör. `NFR7.20`).

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements):
  - NFR7 güvenlik, NFR8 gizli bilgi ve görünürlük tablosu, NFR13, NFR15;
  - FR2.3 (tarayıcıyla tanıma, IP yok), FR1.6 (bekleyene oyun bilgisi gitmez);
  - A8.
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary):
  - C1 U2 komutları ve neden kodları;
  - C5 görünüm kuralları ("bekleyen yalnızca `me` ve `room.status` alır", `moderator` bloğu yalnızca moderatöre);
  - C9 "hiçbir bölümde IP alanı yok".
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; B1–B10, Sözleşmeye Eklemeler) ve `functional-design/rules.md` (rules):
  - BR13.1, BR13.5;
  - BR14.1–BR14.6;
  - BR15.1–BR15.3;
  - BR16.2, BR16.3, BR16.6;
  - BR17.2, BR17.8, BR19.1, BR19.4.
- Proje kuralları: `memory/project.md` (IP saklama yasağı, gizli bilginin yalnızca hak edene gitmesi, sır yasağı).
- U1 güvenlik gereksinimleri: `construction/u1-walking-skeleton/nfr-requirements/security-requirements.md`.

## Tehdit Özeti

U2 hesap ya da ödeme eklemez. Yeni yüzeyler şunlardır:
- moderatörün lobi komutları (ayar, havuz, devir, kapatma, en genç);
- bekleme durumu;
- tarayıcı anahtarı;
- tarayıcıda saklanıp oda kurulurken geri gönderilen ayarlar.

| Tehdit (STRIDE) | Örnek | Karşı önlem |
|---|---|---|
| Kimlik taklidi | Başkasının tarayıcı anahtarını tahmin edip onun yasağını kaldırmak ya da onu yasaklatmak | NFR7.21 (128 bit rastgele, yalnızca özet saklanır, günlüğe yazılmaz) |
| Kurcalama | Oyuncunun ayar, havuz ya da devir komutu göndermesi; aralık dışı ayar; kilitli rolü açmak | NFR7.20, NFR7.23, NFR7.24 |
| Bilgi sızması | Bekleyene oyun ya da sohbet bilgisinin gitmesi; oyunculara moderatör bloğunun gitmesi; devirden sonra eski moderatörde bilginin kalması; canlı olmayan oyların erken görünmesi | NFR8.20–NFR8.23 |
| Hizmet engelleme | Yasaklı kişinin yeni anahtarla tekrar gelmesi; çok sayıda ayar komutu | NFR7.22 (A8 sınırı kabul edilir), U1 hız sınırları (NFR7.7) |
| Yetki yükseltme | Eski moderatörün devirden sonra moderatör komutu göndermesi | NFR7.20 (her komutta güncel moderatör denetlenir) |

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR7.20 | `lobby.setSettings`, `lobby.setRolePool`, `lobby.transferModerator`, `lobby.closeToNewRequests`, `lobby.markYoungest` yalnızca odanın **o anki** moderatöründen kabul edilir; diğer herkes `not_moderator` alır. Devirden sonra eski moderatörün komutu reddedilir | Her komut için oyuncu, bekleyen ve eski moderatör adına gönderilen komutun reddini sınayan otomatik test | NFR7, BR15.1, BR16.1, BR17.2 |
| NFR7.21 | Tarayıcı anahtarı istemcide kriptografik rastgelelikle üretilen en az 128 bitlik bir değerdir. Sunucu yalnızca SHA-256 özetini saklar; anahtarın kendisi depoya, günlüğe, sağlık kontrolüne ve hiçbir görünüme girmez. IP, cihaz bilgisi ya da tarayıcı parmak izi kullanılmaz | Depo dosyası ve günlük taraması anahtarın düz değerini ve IP biçimini bulmaz; biçimi bozuk anahtar girişi engellemez ama yasak denetimine girmez | NFR7, NFR15, FR2.3, C-14, BR14.3, BR14.6 |
| NFR7.22 | Art arda 2 çıkarmadan sonraki 30 dakikalık yasak sunucuda zorlanır. Anahtarı silen ya da gizli pencere açan kişi yasağı aşabilir; bu sınır kabul edilmiştir (A8). Moderatörün asıl aracı "Yeni isteklere kapat"tır | Yasaklı anahtarla 30 dakika boyunca `room.join` reddi ve 30. dakikadan sonra kabul (sahte saatle test) | FR2.3, A8, BR14.2, BR14.4, BR14.5 |
| NFR7.23 | Yeni komutların bütün alanları şema ile doğrulanır: türler, aralıklar, 10'un katı kuralı, bilinen rol kimlikleri, bilinen ön ayar adları. Bilinmeyen alan reddedilir. Bozuk bir alan hiçbir şeyi değiştirmez | Her ayar için en küçük-1, en büyük+1, yanlış tür ve bilinmeyen alan testleri; havuzda bilinmeyen rol ve kilitli rol için `pool_invalid` testi | NFR7, BR16.2, BR17.2, BR17.8 |
| NFR7.24 | `room.create` ile gelen hatırlanmış ayarlar ve havuz güvenilmeyen girdi sayılır. Aynı şemadan geçer; geçmeyen alan varsayılana döner. Kilitli bir rol ya da kilitli özelliğin varsayılan dışı değeri sessizce varsayılana döner | Bozuk, eski sürüm ve kilitli değer içeren `room.create` testleri: oda kurulur, değerler varsayılandır | NFR7, BR19.1, BR16.5, BR17.8 |
| NFR7.25 | `closedToNew`, yasak durumu, çıkarma sayaçları ve bekleyenlerin listesi yalnızca moderatörün görünümüne girer | Görünürlük testi (NFR8.21 ile birlikte) | FR2.3, BR14.5 |
| NFR8.20 | Bekleyen (`me.kind = waiting`) kişinin görünümü yalnızca `me` ve `room` (kod, link, durum, moderatör nicki) içerir. `game`, `chat`, katılımcıların rolleri ya da yaşam durumu, ayarlar ve havuz hiçbir mesajda gitmez | Oyun sürerken bekleyene giden her mesajın alan listesi sabit bir izin listesiyle karşılaştırılır; uçtan uca testte bekleyen bot için de aynı denetim | NFR8, FR1.6, AC1.3.1, BR13.5 |
| NFR8.21 | Moderatör bloğu (ayarların tamamı, rol havuzu, `startBlock`, `closedToNew`, bekleyenler listesi) yalnızca moderatöre gider. Oyuncular ayar özetini (BR16.3) ve açık rolleri (FR2.1) görür | Görünürlük testi: oyuncu görünümünde moderatör bloğu alanı yok | NFR8, C5, BR16.3 |
| NFR8.22 | Devir kabul edilince eski moderatörün bir sonraki görünümünde moderatör bloğu yoktur, yeni moderatörün görünümünde vardır | Devir testi | NFR8, BR15.2 |
| NFR8.23 | Oylar canlı değilken oylama sırasında oyunculara yalnızca kendi oyu gider. Diğer oylar ve sayılar oylama kapanınca herkese açılır; moderatör her zaman görür | Canlı oylar kapalıyken görünürlük testi | NFR8, FR9.1, BR16.6 |
| NFR15.20 | Havuzdan kurulan deste U1'deki kriptografik karıştırmayla dağıtılır; özel rollerin yerleri tahmin edilemez | U1 dağıtım testinin havuzlu sürümü (rastgelelik kaynağı ctx'ten) | NFR15, BR17.6 |
