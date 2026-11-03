# NFR Tasarımı — U1 Yürüyen İskelet — Sorular

Bu aşama, NFR Gereksinimleri'nde yazılan hız, güvenlik, ölçek, dayanıklılık ve izleme hedeflerinin nasıl karşılanacağını tasarlar. Hedefler, teknoloji (TypeScript, SQLite) ve sınırlar önceki aşamalarda sahibin onayıyla sabitlendi (`nfr-requirements/nfr-requirements-questions.md`, Looks correct). Sahibin kuralı gereği (project.md Corrections) bu aşamada sahibe ayrı soru sorulmadı; teknik ayrıntıları ben seçtim ve aşağıdaki kısa özetle onaya sunuyorum.

## Consolidated Summary Confirmation

- **Hız:** Her oda kendi sırasında işlenir, odalar birbirini beklemez. Aynı anda hazır olan bütün odaların kayıtları tek seferde diske yazılır; disk yazımı oyunu duraklatmasın diye ayrı bir yardımcı iş parçacığında yapılır. Oylama gibi art arda gelen işlemlerde ekranlar en fazla 50 milisaniyede bir güncellenir.
- **Güvenlik:** Dışarıya yalnızca şifreleme yapan ön program (Caddy) açıktır; oyun programı sunucunun içinde dinler. Gelen her mesaj, sunucu ile tarayıcının paylaştığı tek kural dosyasıyla denetlenir. Başka siteden açılan bağlantı reddedilir. Nick ve sohbet her zaman düz metin olarak gösterilir. Oyuncuların IP adresi hiçbir yerde okunmaz ve yazılmaz. Sağlık kontrolünün sayıları yalnızca sunucunun içindeki ayrı bir kapıdan verilir.
- **Kötüye kullanım sınırları:** Daha önce onaylanan sınırlar (mesaj, oda kodu denemesi, oda kurma, bağlantı sayısı) bellekte tutulan sayaçlarla uygulanır; IP kullanılmaz.
- **Dayanıklılık:** Her işlem önce diske yazılır, sonra kabul edilir. Program çökerse 5 saniye içinde kendiliğinden yeniden başlar ve süren oyunlar kaldığı yerden devam eder. Telefonun bağlantısı koparsa 1, 2 ve 4 saniye sonra, ardından 4 saniyede bir yeniden denenir. Bozuk bir veri dosyası silinmez, kenara alınır ve 24 saat sonra silinir.
- **Ölçek:** Her şey tek ücretsiz sunucuda çalışır. Yük artarsa ücretsiz hak içinde daha büyük bir makineye geçilir.
- **İzleme:** Program her önemli olayı tek satırlık bir kayıt olarak yazar; kayıtlarda IP, nick, sohbet metni ya da rol bilgisi bulunmaz. Uyarı eşikleri hazırlanır; uyarıların size nasıl ulaşacağı izleme aşamasında kurulur.
- **Küçük hizalamalar:** Önceki incelemeden kalan iki küçük not (depo dosyası sayısının tek yerde "tek dosya" yazması, bir satırın sırası) ve kural metinlerindeki birkaç küçük düzeltme bu tasarımda listelenir ve kod yazılırken yapılır.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
