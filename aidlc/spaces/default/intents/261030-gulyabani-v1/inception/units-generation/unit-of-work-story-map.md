# Hikâye–Parça Eşlemesi — Gulyabani–Köylü (çalışma adı)

48 kullanıcı hikâyesinin her biri, onu yazan parçaya (birime) bağlandı. Bir satırda birden çok parça varsa, her parça o hikâyenin kendi payına düşen kısmını yazar ve hikâyenin kabul ölçütlerini kendi Fonksiyonel Tasarım'ında izler.

## Sources

- Kullanıcı hikâyeleri: `inception/user-stories/stories.md` (stories; US1.1–US13.5, [İskelet] etiketleri).
- Gereksinimler: `inception/requirements-analysis/requirements.md` (requirements).
- Yapı taşları: `inception/domain-design/components.md` (components).
- Mimari kararlar: `inception/domain-design/decisions.md` (decisions).
- Parçalar: `unit-of-work.md`, bağımlılıklar: `unit-of-work-dependency.md`.
- [Q1]: `units-generation-questions.md` — 8 parça (A), özet onayı: Looks correct.

## Eşleme

| Hikâye | Unit ID | Directory | Başlık |
|---|---|---|---|
| US1.1 | U1 | u1-walking-skeleton | Oda kurma |
| US1.2 | U1 | u1-walking-skeleton | Odaya katılma |
| US1.3 | U2 | u2-room-and-lobby | Oyun sürerken gelen kişinin beklemesi |
| US1.4 | U1 | u1-walking-skeleton | Lobi ve oyunu başlatma |
| US1.5 | U2 | u2-room-and-lobby | Oyun ayarları |
| US2.1 | U2 | u2-room-and-lobby | Rol havuzunu seçme |
| US2.2 | U1 | u1-walking-skeleton | Rol dağıtımı ve kartıma bakma |
| US3.1 | U1 | u1-walking-skeleton | Gece adımlarını yönetme |
| US3.2 | U1 | u1-walking-skeleton | Gece Uyku ekranı ve sıranın gelmesi |
| US3.3 | U1 | u1-walking-skeleton | Gulyabanilerin ortak kurban kararı |
| US4.1 | U1 | u1-walking-skeleton | Sabah kara haberi |
| US4.2 | U1; U3 | u1-walking-skeleton; u3-role-abilities | Ölüm sonrası etkilerin sırayla işlemesi |
| US5.1 | U1 | u1-walking-skeleton | Meydan toplantısı ve gündüz sohbeti |
| US5.2 | U1 | u1-walking-skeleton | Oy verme ve eşitlik |
| US5.3 | U1 | u1-walking-skeleton | Son söz, onay oylaması ve infaz |
| US5.4 | U1; U3 | u1-walking-skeleton; u3-role-abilities | Moderatör ekranı (gündüz ve genel görünüm) |
| US6.1 | U3 | u3-role-abilities | Boşboğaz Gulyabani'nin gizli kelimesi |
| US6.2 | U3 | u3-role-abilities | Bekçi'nin yoklaması |
| US6.3 | U3 | u3-role-abilities | Ürkek'in pencereden bakması |
| US6.4 | U3 | u3-role-abilities | Ahbapların birbirini tanıması |
| US6.5 | U3 | u3-role-abilities | Celalli Damat'ın yanında götürmesi |
| US6.6 | U3 | u3-role-abilities | Dertli'nin ölerek kazanması |
| US6.7 | U3 | u3-role-abilities | Görücü ve sevdalılar |
| US7.1 | U1; U3 | u1-walking-skeleton; u3-role-abilities | Kazananın belirlenmesi |
| US7.2 | U1; U2 | u1-walking-skeleton; u2-room-and-lobby | Oyun sonu ekranı ve yeni oyun |
| US7.3 | U7 | u7-records-feedback-report | Oyun sonu geri bildirimi |
| US8.1 | U4 | u4-graveyard-and-chat-safety | Mezarlıktan izleme ve Mezarlık Sohbeti |
| US8.2 | U4 | u4-graveyard-and-chat-safety | Hayalet modu |
| US9.1 | U1 | u1-walking-skeleton | Sayfa yenilenince ya da bağlantı kopunca oyuna dönme |
| US9.2 | U5 | u5-connection-resilience | Kopan oyuncunun sırası |
| US9.3 | U5 | u5-connection-resilience | Moderatörün bağlantısı koptuğunda |
| US9.4 | U5 | u5-connection-resilience | Sunucu yeniden başladığında oyunun sürmesi |
| US9.5 | U5 | u5-connection-resilience | Oyunu ikinci bir sekmede açma |
| US9.6 | U5 | u5-connection-resilience | Oturumu kaybolan oyuncunun moderatör onayıyla dönmesi |
| US10.1 | U4 | u4-graveyard-and-chat-safety | Sohbet kanalları ve kelime filtresi |
| US10.2 | U4; U7 | u4-graveyard-and-chat-safety; u7-records-feedback-report | Mesaj şikayeti |
| US10.3 | U3 | u3-role-abilities | Oyun sırasında oyuncu çıkarma |
| US11.1 | U6 | u6-guide-and-cards | Rehber'de kartları inceleme |
| US11.2 | U6 | u6-guide-and-cards | Nasıl oynanır ve Moderatör Rehberi |
| US11.3 | U6 | u6-guide-and-cards | Özgün kart tasarımları |
| US12.1 | U7 | u7-records-feedback-report | Olay kayıtları ve IP'nin saklanmaması |
| US12.2 | U7 | u7-records-feedback-report | Verilerin kendiliğinden silinmesi |
| US12.3 | U7 | u7-records-feedback-report | Sahibe rapor |
| US13.1 | U1; U8 | u1-walking-skeleton; u8-quality-and-load | Gizli bilginin sızmaması |
| US13.2 | U8 | u8-quality-and-load | Herkesin oynayabilmesi (erişilebilirlik) |
| US13.3 | U1; U8 | u1-walking-skeleton; u8-quality-and-load | Telefonda ve Türkçe kullanım |
| US13.4 | U1; U8 | u1-walking-skeleton; u8-quality-and-load | Akıcı ve eşzamanlı oyun |
| US13.5 | U1; U8 | u1-walking-skeleton; u8-quality-and-load | Hileye ve kötüye kullanıma karşı koruma |

## Birden Çok Parçaya Yayılan Hikâyeler

| Hikâye | Paylaşım |
|---|---|
| US4.2 | U1 yalnızca kazanma kontrolünü ve zincirin yapısını kurar (AC4.2.1'deki iskelet notu); U3 Celalli Damat, sevdalı ve Dertli adımlarını ekler (AC4.2.2, AC4.2.3). |
| US5.4 | U1 moderatör ekranını, oy görünümünü ve "kopuk" bilgisini kurar; U3 rozetleri (sevdalı, ahbap, boşboğaz), Boşboğaz onay kutusunu ve Dertli göstergesini ekler. |
| US7.1 | U1 Köylüler / Gulyabaniler kazanmasını ve erken bitişi yazar; U3 Dertli ve sevdalı kazanma koşullarını ekler. |
| US7.2 | U1 oyun sonu ekranını ve "Yeni oyun"u yazar; U2 bekleyenlerin lobiye alınmasını ve 22 saat kuralını ekler (AC7.2.2, AC7.2.3). |
| US10.2 | U4 şikayeti alır ve odada moderatöre işaretler; U7 kalıcı şikayet kaydını ve 1 ay / 1 yıl silmelerini yazar. |
| US13.1 | U1 iskeletteki bilgiler için gizli bilgi testini kurar; U8 görünürlük tablosunun tamamını her alıcı türü için sınar. Aradaki her parça kendi eklediği bilgiyi test eder. |
| US13.3 | U1 mobil öncelikli, Türkçe metin dosyalı yapıyı kurar; U8 tarayıcı listesini, desteklenmeyen tarayıcı uyarısını ve 320 piksel kontrolünü bütün ekranlarda denetler. |
| US13.4 | U1 sunucu saatine göre geri sayımı ve eşzamanlı oyunu kurar (AC13.4.2); U8 50 odalık yük testini yapar (AC13.4.1). |
| US13.5 | U1 sunucuda doğrulama, sırayla işleme ve yalnızca şifreli bağlantıyı kurar (AC13.5.1, AC13.5.3, AC13.5.4); U8 hız sınırlarını ekler (AC13.5.2). |

Erişilebilirlik (US13.2) yalnızca U8'e bağlıdır, ama her parça kendi ekranlarını WCAG 2.1 AA'ya göre yazar (`unit-of-work.md` Ortak Kurallar); U8 tamamını tarar ve elle denetler.

## Parça İçindeki Yapım Sırası

Her parçada oyun kuralı testleri önce yazılır (team-practices Testing Posture). Parça içindeki sıra:

- **U1:** oda kurma ve katılma (US1.1, US1.2) → lobi ve başlatma (US1.4) → rol dağıtımı (US2.2) → gece (US3.1–US3.3) → sabah ve zincir yapısı (US4.1, US4.2) → gündüz ve oylama (US5.1–US5.3) → kazanma ve oyun sonu (US7.1, US7.2) → moderatör ekranı (US5.4) → yeniden bağlanma (US9.1) → iskeletin gizli bilgi, zaman ve doğrulama payı (US13.1, US13.3, US13.4, US13.5) → bot oyunculu uçtan uca test.
- **U2:** rol havuzu ve 9 rol tanımı (US2.1) → ayarlar (US1.5) → bekleme ekranı ve 26 kişi sınırı (US1.3) → yeni oyunda bekleyenler ve 22 saat kuralı (US7.2).
- **U3:** ölüm zincirinin tamamı (US4.2) → Görücü ve sevdalılar (US6.7) → Ahbaplar (US6.4) → Bekçi (US6.2) → Boşboğaz (US6.1) → Ürkek (US6.3) → Celalli Damat (US6.5) → Dertli (US6.6) → kazanma koşullarının tamamı (US7.1) → moderatör ekranı eklemeleri (US5.4) → oyun sırasında çıkarma (US10.3).
- **U4:** mezarlık ve Mezarlık Sohbeti (US8.1) → hayalet modu (US8.2) → kanallar ve kelime filtresi (US10.1) → mesaj şikayeti (US10.2).
- **U5:** kopan oyuncunun sırası (US9.2) → ikinci sekme (US9.5) → sunucu yeniden başlatma (US9.4) → moderatörün bağlantısı koptuğunda (US9.3) → moderatör onayıyla dönme (US9.6).
- **U6:** kart görselleri (US11.3) → Kartlar sekmesi (US11.1) → Nasıl Oynanır ve Moderatör Rehberi (US11.2).
- **U7:** olay kayıtları (US12.1) → kalıcı şikayet kaydı (US10.2) → geri bildirim (US7.3) → otomatik silmeler (US12.2) → sahibe rapor (US12.3).
- **U8:** hız sınırları ve doğrulama (US13.5) → tam gizli bilgi testi (US13.1) → telefon ve tarayıcı denetimi (US13.3) → erişilebilirlik denetimi (US13.2) → yük testi (US13.4).

## Kapsama Kontrolü

- 48 hikâyenin hepsi en az bir parçaya atandı; atanmamış hikâye yok.
- Her parçanın en az bir satırı var: U1 (20 satır), U2 (4), U3 (11), U4 (4), U5 (5), U6 (3), U7 (5), U8 (5).
- İskelet etiketli 16 hikâyenin (US1.1, US1.2, US1.4, US2.2, US3.1–US3.3, US4.1, US4.2, US5.1–US5.4, US7.1, US7.2, US9.1) hepsi U1'e bağlı.
- v2 maddelerinin hiçbiri bir parçaya atanmadı (project.md Forbidden).
