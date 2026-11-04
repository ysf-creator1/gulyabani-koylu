# Gözlemlenebilirlik Gereksinimleri — U2 Oda ve Lobi

U1'in gözlemlenebilirlik gereksinimleri (`../../u1-walking-skeleton/nfr-requirements/observability-requirements.md`, NFR13.1–NFR13.8) aynen geçerlidir:
- sağlık kontrolü,
- etkin oda, bağlantı ve hata sayıları,
- IP, nick ve sohbet metni içermeyen yapılandırılmış günlük.

Bu belge U2'nin ekledikleri içindir. Alt numaralar 20'den başlar.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR13 gözlemlenebilirlik, C-14).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 sağlık kontrolü, C6 olaylar: `settings.changed`, `rolePool.changed`, `moderator.transferred`, `room.closedToNew`).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/rules.md` (rules; BR14.2, BR14.4, BR14.6).
- U1 gözlemlenebilirlik gereksinimleri: `construction/u1-walking-skeleton/nfr-requirements/observability-requirements.md`.

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR13.20 | İç sağlık kontrolü iki sayaç ekler: o an bekleyen kişi sayısı (`waitingParticipants`) ve sunucu açıldığından beri uygulanan çıkarma yasağı sayısı (`kickBansApplied`) | Sağlık kontrolü testi alanları denetler | NFR13, BR13.2, BR14.2 |
| NFR13.21 | U2'nin olayları (`settings.changed`, `rolePool.changed`, `moderator.transferred`, `room.closedToNew`, `participant.waiting`) günlüğe yalnızca oda kodu, olay türü ve sayılarla yazılır. Nick, tarayıcı anahtarı, anahtar özeti ve IP yazılmaz | U1'in günlük tarama testi bu olaylarla genişletilir: nick, anahtar, özet ve IP biçimi bulunmaz | NFR13, C-14, BR14.6 |
| NFR13.22 | Reddedilen lobi komutları neden koduyla sayılır (U1 hata sayacı). `settings_out_of_range` ve `pool_invalid` hata sayılmaz, beklenen kullanıcı hatasıdır | Birim testi: bu iki ret hata sayacını artırmaz | NFR13 |
