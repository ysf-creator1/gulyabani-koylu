# Niyet Beyanı — Gulyabani–Köylü (çalışma adı)

## Talep

İstenen iş, `gulyabani-koylu-intent.md` dosyasında tarif edilen oyunun sıfırdan geliştirilmesidir; yalnızca v1 kapsamı ele alınır, v2 maddeleri kapsam dışıdır. [desc]

Oyunun nihai adı henüz kararlaştırılmadı; şimdilik "Gulyabani–Köylü" çalışma adı kullanılır. [Q9]

### v1 özeti

v1 şunları içerir: oda kurma ve oda koduyla katılma (yalnızca nick, şifre yok); bir insan moderatör; rol havuzu ve rollerin aç/kapa yapılması (Gulyabani, Boşboğaz Gulyabani, Köylü, Bekçi, Ürkek, Ahbaplar, Celalli Damat, Dertli, Görücü); gece/gündüz döngüsü ve gulyabani ortak kararı; gündüz sohbeti, oylama, son söz, onay oylaması, infaz ve kart açılışı; mezarlık; kazanma kontrolü; yeniden bağlanma; rehber bölümü; kart tasarımları; Türkçe, mobil öncelikli arayüz. [Q14]

Oyun en fazla 26 oyuncu ile oynanır. [Q14] En az 3 oyuncu ve bir moderatörle başlatılabilir; 6 oyuncunun altında lobide uyarı gösterilir. [Q15]

v1'e ek olarak kayıtlar, geri bildirim, saklama ve raporlar da girer: [Q11] [Q17] [Q18]

- Kayıtlar: giriş ve çıkışlar, oyuncu nick'leri, oyunda yapılan işlemler, tespit edilen kopmalar, ne zaman ve nereden (cihaz türü, tarayıcı, ülke) bilgileri sunucuda kaydedilir; IP adresi saklanmaz. Sistemi yormadan, ileride analiz için mümkün olduğunca fazla bilgi toplanır. [Q11] [Q12] [Q16]
- Geri bildirim: kopmalarda oyun ekranında bir geri bildirim butonu; oyun sonunda simgelerle memnuniyet geri bildirimi ve altında isteğe bağlı açıklama; isteyen oyuncu öneri veya şikayet girebilir. Bunların hepsi kaydedilir. [Q11]
- Saklama: kayıtlar ve geri bildirimler 1 yıl saklanır; odalar ve sohbetler bundan bağımsız olarak 24 saat sonra silinir. [Q17]
- Raporlar: kayıtlardan basit bir rapor (oyun sayısı, oyun süreleri, kopma sayısı, memnuniyet ortalaması). [Q18]

## Problem Tanımı

Arkadaş grupları uzaktayken (görüntülü toplantıda) bu tür sosyal çıkarım oyunlarını oynamakta zorlanıyor: kart dağıtmak, gizli bilgiyi yalnızca hak eden oyuncuya iletmek ve moderatörlük yapmak elle zor. [Q1]

## Hedef Kitle

Türkçe konuşan genel oyuncu kitlesi; oyunun linkini bulan herkes oynayabilir. [Q2]

İlk aşamada oyunu sahibi ve onu test edecek bir arkadaş grubu deneyecek. [Q5]

## Başarı Ölçütleri

| Ölçüt | Hedef | Kaynak |
|---|---|---|
| Güvenilirlik | En az 6 oyunculu bir oyun, hiçbir oyuncu kopmadan ve sorun yaşanmadan sonuna kadar oynanır | [Q3] [Q11] |
| İlk ay kullanımı | Yayından sonraki ilk ay içinde en az 5 tam oyun oynanır | [Q3] |
| Geri bildirim | Yayından sonraki ilk ay içinde hiç şikayet girdisi gelmez | [Q19] |

İlk ay kullanımında sayılan oyunlar: kim oynarsa oynasın, en az 3 oyuncu ve bir moderatörle normal şekilde sonuna kadar oynanan oyunlar sayılır; test amacıyla açılıp yarıda bırakılan oyunlar sayılmaz. [Q13] [Q15]

Sayım ve ölçüm, sunucuda tutulan kayıtlar ve geri bildirimler üzerinden yapılır. [Q12] [Q18]

"Yayın", oyunun herkese açık bir internet adresine çıkması demektir ve bu çalışmanın içinde yapılır. [Q10]

## Girişimin Tetikleyicisi

Proje iki amaçla şimdi başlatılıyor: oyunu arkadaşlarla oynamak (hobi projesi) ve AI-DLC yöntemini gerçek bir proje üzerinde öğrenip denemek. [Q4]

## Initial Scope Signal

- Çalışma planı (workflow-selected): `mvp` [scope]
- v1'in dışında kalanlar yalnızca intent dosyasındaki v2 listesidir: tılsım kartları, "Ağız Bağlama" varyantı, ek roller (Ebe Nine, Muhtar, Kahveci), otomatik (bot) moderatör, anonsların sesli okunması ve oyun geçmişi/istatistik. [Q8]
- Oyunun herkese açık bir adreste yayınlanması v1 kapsamındadır ve bu çalışma içinde yapılır. [Q10]

## Açık Konular ve İzlenecek Maddeler

- Açık konu: Oyunun nihai adı henüz kararlaştırılmadı. [Q9]
- Açık konu: Bulut sağlayıcısı ve teknoloji seçimi; zamanı gelince değerlendirilip seçilecek, AWS zorunlu değil. [Q10]
- İzlenecek madde: Yayın aşamaları çalışma planına sonradan eklenecek. [Q10]

## Assumptions & Open Questions

None.
