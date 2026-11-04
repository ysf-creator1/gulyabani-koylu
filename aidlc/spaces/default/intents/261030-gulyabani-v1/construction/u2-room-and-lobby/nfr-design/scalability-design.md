# Ölçek Tasarımı — U2 Oda ve Lobi

Bu belge NFR2.20–NFR2.22 ve NFR3.20'nin karşılanma biçimini yazar.

U1'in ölçek tasarımı (`../../u1-walking-skeleton/nfr-design/scalability-design.md`) aynen geçerlidir: tek süreç, oda başına sıra, tek yazar iş parçacığı, 50 oda ve 1.350 bağlantı hedefi.

## Sources

- NFR gereksinimleri: `construction/u2-room-and-lobby/nfr-requirements/scalability-requirements.md` (scalability-requirements).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/entities.md` (entities) ve `rules.md` (rules; BR13.4, BR14.2, BR14.6).
- Güvenlik tasarımı: `nfr-design/security-design.md` (200 kayıt sınırı, oda başına lobi sınırı).

## Tasarım

| Konu | Tasarım | Karşıladığı |
|---|---|---|
| Oda sınırı | `activePlayers` sayımı (moderatör hariç, `active` + `waiting`) giriş kararında ve devirde kullanılır; 26'da `room_full`. Bağlantı sayısı U1 varsayımını aşmaz. | NFR2.20 |
| Çıkarma kayıtları | Oda başına en çok 200 kayıt (security-design). Satır yaklaşık 120 bayttır: oda kodu, 64 haneli özet, iki sayı. Hesap, kodun üst sınırı olan `LIMITS.maxActiveRooms = 300` odaya göre yapılır: en kötü durumda 60.000 satır, diskte yaklaşık 7,2 MB. Kayıtlar oda kümesinde bellekte de tutulur; JS nesnesi olarak yaklaşık 3 katı, ~22 MB eder. Bu, sürecin 288 MB yığın sınırının %10'unun altındadır. Kayıtlar 24 saatte silinir. Gerçekçi kullanımda (50 oda, oda başına birkaç çıkarma) 100 KB'ı geçmez. | NFR2.21 (inceleme bulgusu: 300 oda üst sınırı) |
| Ayar ve havuz | `room_rooms` satırında iki JSON sütunu: var olan `settings_json` (U1) ve yeni `role_pool_json`. Her biri 1 KB'ın altındadır; ayrı tablo yoktur. | NFR2.22 |
| Maliyet | Yeni hizmet, süreç ya da bağımlılık yoktur. Aynı ücretsiz sunucu ve aynı depo dosyası kullanılır. | NFR3.20 |
