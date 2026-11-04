# Ölçek Gereksinimleri — U2 Oda ve Lobi

U1'in ölçek gereksinimleri (`../../u1-walking-skeleton/nfr-requirements/scalability-requirements.md`, NFR2.1–NFR2.6) aynen geçerlidir: tek sunucu, 50 oda, oda başına 26 oyuncu ve moderatör, yaklaşık 1.350 bağlantı. U2 bağlantı sayısını artırmaz, çünkü bekleyenler 26 sınırının içindedir. Bu belge yalnızca U2'nin yeni verilerinin büyümesini sınırlar. Alt numaralar 20'den başlar.

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements; NFR2 ölçek, FR2.4, A7, NFR3).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/entities.md` (entities; KickRecord, RolePool, RoomSettings) ve `rules.md` (rules; BR13.4, BR14.2, BR14.6).
- U1 ölçek gereksinimleri: `construction/u1-walking-skeleton/nfr-requirements/scalability-requirements.md`.

## Gereksinimler

| ID | Gereksinim | Ölçüt / doğrulama | Kaynak |
|---|---|---|---|
| NFR2.20 | Bekleyenler dahil oda başına en çok 26 oyuncu ve 1 moderatör bulunur. U1'in 1.350 bağlantı varsayımı değişmez | Kural testi: 26 kişi varken 27. kişi `room_full` alır; bekleyenler sayılır | NFR2, FR2.4, A7, BR13.4 |
| NFR2.21 | Oda başına çıkarma kaydı sayısı odada çıkarılan farklı tarayıcı sayısıyla sınırlıdır. Kayıtlar oda ile 24 saatte silinir. Bir kayıt 200 baytın altındadır; 50 odada 1.000 kayıt bile 1 MB'ı geçmez | Depo testi: süresi dolan odanın çıkarma kayıtları silinir | NFR2, NFR3, BR14.6 |
| NFR3.20 | U2 ücretli bir hizmet ya da yeni bir sunucu bileşeni eklemez; aylık maliyet sıfır kalır | tech-stack-decisions.md: yeni bağımlılık yok | NFR3, C-01 |
| NFR2.22 | Ayarlar ve rol havuzu oda kaydının içinde küçük bir değer olarak saklanır (her biri 1 KB'ın altında); ayrı tablo ya da oda başına artan veri yoktur | Depo testi ve göç denetimi | NFR2, entities.md RoomSettings, RolePool |
