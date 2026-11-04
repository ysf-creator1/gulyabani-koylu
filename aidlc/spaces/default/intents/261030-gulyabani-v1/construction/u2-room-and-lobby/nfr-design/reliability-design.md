# Dayanıklılık Tasarımı — U2 Oda ve Lobi

Bu belge NFR4.20, NFR5.20, NFR5.21 ve NFR6.20'nin karşılanma biçimini yazar.

U1'in dayanıklılık tasarımı (`../../u1-walking-skeleton/nfr-design/reliability-design.md`) aynen geçerlidir:
- kabulden önce yazma;
- `synchronous=FULL`;
- açılışta depodan geri yükleme;
- yeniden bağlanma ve sürüm el sıkışması.

## Sources

- NFR gereksinimleri: `construction/u2-room-and-lobby/nfr-requirements/reliability-requirements.md` (reliability-requirements).
- Fonksiyonel tasarım: `construction/u2-room-and-lobby/functional-design/functional-spec.md` (functional-spec; B1, B8) ve `rules.md` (rules; BR13.2, BR18.3).
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C9 "yalnızca ekleme").
- U1 kodu: `src/server/store/migrations/001_init.sql`, `scripts/check-migrations.ts`.

## Tasarım

| Konu | Tasarım | Karşıladığı |
|---|---|---|
| Bekleyenin dönüşü | Bekleyenin oturumu U1 oturumu gibi bağlanır (`bindSession`). Yeniden bağlanınca `hello` aynı katılımcıyı bulur; görünüm `me.kind` neyse onu gösterir. "Yeni oyun" araya girdiyse `active`'tir ve lobi gelir. | NFR4.20 |
| Kalıcılık | 17 ayar var olan `settings_json` sütununda; havuz `role_pool_json`'da; kapatma anahtarı, en genç işareti ve devir (`moderator_participant_id`) `room_rooms` satırında; bekleme durumu ve anahtar özeti `room_participants` satırında; çıkarma kayıtları `room_kick_records`'ta tutulur. Hepsi komutun oda sürümü +1 yazımıyla aynı işlemde (transaction) yazılır. Açılışta oda kümesi bu tablolardan kurulur. | NFR5.20 |
| Göç | **Ayarlar için yeni sütun yoktur:** `room_rooms.settings_json` U1'de (`001_init.sql`) zaten var ve U1'in 10 ayarını taşıyor. U2'nin 7 yeni ayarı aynı JSON'a eklenir. Okurken eksik anahtar varsayılanla doldurulur; böylece v0.1.x odaları göç olmadan açılır.<br>Yeni dosya `002_u2_room_lobby.sql` yalnızca U1'de olmayanları ekler:<br>• `ALTER TABLE room_rooms ADD COLUMN role_pool_json TEXT NOT NULL DEFAULT '{}'`;<br>• `ALTER TABLE room_rooms ADD COLUMN closed_to_new INTEGER NOT NULL DEFAULT 0`;<br>• `ALTER TABLE room_rooms ADD COLUMN youngest_participant_id TEXT`;<br>• `ALTER TABLE room_participants ADD COLUMN browser_key_hash TEXT`;<br>• `CREATE TABLE IF NOT EXISTS room_kick_records(...)`.<br>`role_pool_json = '{}'` okunurken varsayılan havuza çevrilir. `status` sütunu metindir; `waiting` değeri göç gerektirmez. Göç testi v0.1.1 ile kurulmuş bir depo dosyasına 002'yi uygular ve odayı okur. | NFR5.21 (inceleme bulgusu: settings_json zaten var) |
| Göç denetimi | `npm run check:migrations` U1'deki gibi yalnızca ekleme ifadelerine izin verir. v0.1.1 ile oluşturulmuş bir depo dosyası testte açılıp okunur. | NFR5.21 |
| Hizmet sürekliliği | Yeni süreç ya da dış bağımlılık yoktur. Yayın U1 betiğiyle yapılır; süren oyun varsa beklenir. | NFR6.20 |
