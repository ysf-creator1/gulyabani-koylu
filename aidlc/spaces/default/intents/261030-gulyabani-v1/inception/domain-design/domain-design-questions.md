# Alan Tasarımı Soruları — Gulyabani–Köylü (çalışma adı)

Sahibin kuralı gereği (project.md Corrections) ayrıntılı ve teknik konuları ben tasarladım; burada yalnızca oyunun davranışını değiştiren büyük karar soruluyor. Benim seçtiğim varsayılanlar, cevaptan sonra kısa bir özette onayınıza sunulur.

## Q1. [Ürün] Moderatörlük teklifine kimse cevap vermezse ne olsun?

Ayrıntılı Taslaklar'da onayladığınız kurala göre moderatör 3 dakika dönmezse ölü oyunculara "Moderatör ol" teklifi gider (interaction-spec "Moderatör Kaybolursa"). Ama ölülerden hiçbiri "Evet" ya da "Hayır" demezse teklifin ne kadar açık kalacağı yazılmadı; inceleme bunu not etti (Ayrıntılı Taslaklar inceleme notu R-09): böyle kalırsa oyun 24 saate kadar donabilir.

A. Teklif 3 dakika açık kalır; kimse kabul etmezse herkes "Moderatör yok" ekranını görür ([Yeni oda kur] [Oyundan çık]). Oyun en fazla 6 dakika donar. (Önerilen: moderatör beklemesiyle aynı süre, akılda kalır.)
B. Teklif 1 dakika açık kalır; kimse kabul etmezse "Moderatör yok" ekranı gelir. Oyun en fazla 4 dakika donar.
C. Teklif, biri kabul edene ya da oda silinene kadar açık kalır (oyun 24 saate kadar donabilir).
X. Other (please specify)

[Answer]: A

## Benim Seçtiğim Varsayılanlar

Sahibin kuralı gereği (project.md Corrections) sormadan seçildi; aşağıdaki özet onayıyla kesinleşir.

- **Yapı taşları (12):** Oyun Kuralları (`GameRules`, internet ve ekran bilmeyen saf kural modülü, NFR12), Kart ve İçerik Kataloğu (`ContentCatalog`, roller, kart metinleri ve görselleri, Rehber metinleri, gizli kelime listesi; FR18.5), Oda Yönetimi (`RoomManager`), Oyun Akışı (`MatchFlow`, fazlar, sayaçlar, moderatör adımları, kopan oyuncu ve moderatör kaybolursa kuralı, her kabul edilen işlemin hemen kaydı), Görünüm Süzgeci (`VisibilityFilter`, her alıcıya yalnızca hakkı olanı hazırlar; NFR8), Bağlantı Kapısı (`ConnectionGateway`, oturum, yeniden bağlanma, ikinci sekme, yeniden katılma isteği, hız sınırları), Sohbet (`ChatService`), Kayıtlar (`EventRecorder`, IP saklamaz), Geri Bildirim (`FeedbackService`), Rapor (`OwnerReport`), Temizlik (`Housekeeping`, 24 saat ve 1 yıl/1 ay silmeleri), Web Arayüzü (`WebClient`, oyuncu, moderatör, mezarlık ve Rehber ekranları tek web uygulamasında), Bot Oyuncular (`BotPlayer`, uçtan uca test için).
- **Ölü oyuncu moderatör olunca:** Mezarlık Sohbeti'ne artık yazmaz, diğer moderatörler gibi yalnızca okur; oyun sonu ekranında ölü oyuncu olarak görünmeye devam eder.
- **Gereksinim belgesi:** FR14.5 (moderatör kaybolursa) ve FR2.3 (bekleyenleri çıkarma, art arda iki çıkarmada 30 dakika, "Yeni isteklere kapat") Ayrıntılı Taslaklar'daki düzeltmelerinize ve Q1 cevabına göre güncellenir.
- **Açık küçük notlar:** Ayrıntılı Taslaklar inceleme notları R-08 (M-13 örneğindeki "Sevdalılar: Ece ve Fırat") ve R-10 (M-02 son satırın ifadesi) Fonksiyonel Tasarım'da düzeltilir.
- **Bu aşamada seçilmeyenler:** programlama dili, veritabanı ve sunucu yazılımı (NFR ve altyapı aşamaları); yapı taşlarının tek program mı ayrı programlar mı olacağı (Units Generation).

## Consolidated Summary Confirmation

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
