# Kişiler (Personas) — Gulyabani–Köylü (çalışma adı)

Hikâyelerdeki "Bir [kişi] olarak" kısmında bu dört kişi kullanılır. Kişiler, gereksinim belgesindeki kullanıcılardan (`inception/requirements-analysis/requirements.md`, Niyet Analizi → Kullanıcılar) ve kaba taslaklardaki kişilerden (user-flow Kişiler) alındı. Ekip çalışma biçimi (`inception/practices-discovery/team-practices.md`) gereği hikâyeler yürüyen iskeleti ayrıca işaretler. [Q1]

## Sources

- Gereksinimler: `inception/requirements-analysis/requirements.md` (Niyet Analizi, FR1–FR21, NFR8 görünürlük tablosu).
- Ekip çalışma biçimi: `inception/practices-discovery/team-practices.md`.
- [Q1]–[Q8]: `user-stories-questions.md` (sahip ayrıntılı kararları bana bıraktı; özet onayı: Looks correct).

## P1 — Moderatör ("Selin, oyunu kuran arkadaş")

- **Rolü:** Odayı kurar, rol almaz, her şeyi görür, oyunu yönetir (anonsları okur, adımları ilerletir, süreyi uzatır/duraklatır, gerekirse oyuncu çıkarır).
- **Amaçları:** Ne okuyacağını ve ne yapacağını her an ekranda görmek; oyunu kural hatası olmadan akıtmak; arkadaşlarının iyi vakit geçirmesi.
- **Zorlandığı noktalar:** Kartla oynanan oyunda gizli bilgiyi kâğıtla takip etmek zor; kimin uyandığını, kimin öldüğünü karıştırmak; kopan oyuncular yüzünden oyunun durması.
- **Teknik rahatlık:** Orta. **Cihaz:** telefon ya da bilgisayar. **Sıklık:** haftada birkaç akşam.

## P2 — Oyuncu ("Emre, toplantıdan katılan arkadaş")

- **Rolü:** Linkle ya da kodla katılır, kartına bakar, gece sırası gelince seçim yapar, gündüz tartışır ve oy verir. Oyunu ilk kez oynayan da, oyun sürerken gelip bekleyen de bu kişinin hâlleridir.
- **Amaçları:** Hesap açmadan hızla katılmak; kartını kimseye göstermeden görmek; sırası geldiğinde ne yapacağını anlamak; telefonda başka uygulamaya geçip döndüğünde kaldığı yerden devam etmek.
- **Zorlandığı noktalar:** Kuralları bilmemek; telefonda ekranın kapanması ya da bağlantının kopması; gece sırasını kaçırmak.
- **Teknik rahatlık:** Düşük–orta. **Cihaz:** çoğunlukla telefon (aynı anda görüntülü toplantı açık). **Sıklık:** arkadaş grubu toplandıkça.

## P3 — Ölü oyuncu ("Deniz, ilk gece kaçırılan")

- **Rolü:** Oyundan elenmiş ama odada kalan oyuncu; mezarlıktan oyunu izler, Mezarlık Sohbeti'nde diğer ölülerle yazışır.
- **Amaçları:** Elendikten sonra sıkılmamak; oyunun nasıl gittiğini görmek; yaşayanlara ipucu vermeden eğlenmek.
- **Zorlandığı noktalar:** Erken elenince oyunun dışında kalmak; yanlışlıkla yaşayanlara bilgi sızdırma riski.
- **Teknik rahatlık:** Düşük–orta. **Cihaz:** telefon. **Sıklık:** her oyunda birkaç kişi.

## P4 — Sahip ("Projenin sahibi")

- **Rolü:** Oyunu yayınlayan ve bakımını yapan kişi; ekranı yoktur, sunucuda komutla rapor üretir.
- **Amaçları:** Oyunun başarı ölçütlerini (oyun sayısı, sorunsuz oyun, memnuniyet, şikayet) görmek; kişisel veriyi yasaya uygun ve az tutmak; aylık maliyeti sıfırda tutmak.
- **Zorlandığı noktalar:** Tek kişi olarak her şeyi izlemek; şikayetleri takip etmek.
- **Teknik rahatlık:** Orta (AI destekli). **Cihaz:** bilgisayar. **Sıklık:** ayda birkaç kez rapor.

## Kişiler arası ilişkiler ve öncelik

| Sıra | Kişi | Neden |
|---|---|---|
| 1 | P2 Oyuncu | Oyunu oynayanların çoğu; gizlilik ve yeniden bağlanma en çok onu etkiler |
| 2 | P1 Moderatör | Oyun onun ekranı olmadan akmaz; her odada bir tane |
| 3 | P3 Ölü oyuncu | Oyuncunun elendikten sonraki hâli; ayrı görme hakları var |
| 4 | P4 Sahip | Oyun sırasında yok; rapor, kayıt ve veri saklama hikâyeleri |

- Moderatör ile oyuncu arasında bilgi akışı tek yönlüdür: moderatör her şeyi görür, oyuncu yalnızca hakkı olanı (requirements NFR8).
- Oyuncu ölünce Ölü oyuncu olur; aynı kişi bir oyunda iki kişinin hikâyelerini yaşar.
- Sahip, oyunculara ve moderatöre görünmez; onların ürettiği kayıtları okur.
