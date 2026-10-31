# Kullanıcı Hikâyeleri Soruları — Gulyabani–Köylü (çalışma adı)

Bu sorular iki işe yarar: hikâyelerin nasıl düzenleneceğini seçmek (kişiler, gruplama, büyüklük, öncelik) ve gereksinim incelemesinde açık kalan oyun kurallarını karara bağlamak (inceleme notları R-01…R-04). Her sorunun başında, kararın kime ait olduğu yazılıdır; herkes her soruyu cevaplayabilir.

## Hikâye planı (taslak)

- **Kişiler (personas):** Q1'e göre belirlenecek. Her hikâye tanımlı bir kişiye dayanır.
- **Hikâye biçimi:** "Bir [kişi] olarak [istek] istiyorum, böylece [fayda]." Her hikâye INVEST ölçütlerine (bağımsız, konuşulabilir, değerli, tahmin edilebilir, küçük, test edilebilir) uyar ve kalıcı bir `US{grup}.{sıra}` kimliği alır.
- **Kabul ölçütleri:** Türkçe Gherkin (**Diyelim ki / Eğer ki / O zaman / Ve**), her hikâyede 3–6 ölçüt, her biri `AC{grup}.{sıra}.{n}` kimliğiyle; en az bir hatalı/uç durum içerir.
- **Öncelik:** MoSCoW (Must / Should / Could / Won't); kesin yayın sınırı Teslimat Planlaması'nda belirlenir. Q4'e göre işaretlenecek.
- **Gruplama ve büyüklük:** Q2 ve Q3'e göre.
- **İzlenebilirlik:** her işlevsel ve işlevsel olmayan gereksinim (FR, NFR) en az bir hikâyeye bağlanır ya da gerekçesiyle sonraki bir aşamaya bırakılır.

## Q1. [Ürün sahibi] Hikâyelerin kişileri

Hikâyeler "kim için" sorusuyla yazılır. Kaba taslaklarda dört kişi vardı: moderatör, oyuncu, ölü oyuncu (mezarlıkta) ve oyunun sahibi (rapor üretir, ekranı yok). İlk kez gelen ya da oyun sürerken linkle gelen kişi ayrı ihtiyaçlara sahip olabilir.

A. Dört kişi: Moderatör, Oyuncu, Ölü oyuncu, Sahip (kaba taslaklardaki gibi)
B. Altı kişi: A'dakiler + "İlk kez gelen oyuncu" (oyunu bilmiyor) ve "Sonradan gelen kişi" (oyun sürerken linkle geldi, bekliyor)
C. İki kişi: Moderatör ve Oyuncu; ölü oyuncu ve sahip hikâyeleri bu ikisinin içinde yazılır
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q2. [Ürün sahibi] Hikâyelerin gruplanması

Hikâyeler gruplara ayrılır; gruplar okuma kolaylığı ve sonraki aşamada parçalara bölme için önemlidir.

A. Oyunun akışına göre: oda ve lobi → kart → gece → sabah → gündüz ve oylama → oyun sonu; roller, mezarlık, sohbet güvenliği, bağlantı, rehber, kayıtlar ayrı gruplarda
B. Kişiye göre: önce moderatörün hikâyeleri, sonra oyuncunun, sonra ölü oyuncunun, sonra sahibin
C. Gereksinim gruplarına birebir göre: FR1'den FR21'e kadar her gereksinim grubu bir hikâye grubu
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q3. [Ürün sahibi] Hikâyelerin büyüklüğü

Küçük hikâyeler daha kolay test edilir ve parçalara bölünür ama sayıları artar; büyük hikâyelerde kabul ölçütü sayısı artar.

A. Küçük: her rol yeteneği ve her önemli kural ayrı hikâye (yaklaşık 55–65 hikâye)
B. Orta: birbirine bağlı kurallar tek hikâyede (ör. Görücü ile Sevdalılar bir hikâye; oylama ile eşitlik bir hikâye) (yaklaşık 40–45 hikâye)
C. Büyük: her ekran ya da oyun bölümü bir hikâye (yaklaşık 20–25 hikâye, her birinde çok sayıda kabul ölçütü)
X. Other (please specify)

[Answer]: B (sahip kararı bana bıraktı)

## Q4. [Ürün sahibi] Önceliklendirme

v1 tek seferde yayınlanacak (kapsam belgesi) ve önce yalnızca Gulyabani ve Köylü rolleriyle en basit tam oyunu kuran yürüyen iskelet yapılacak (ekip çalışma biçimi). Öncelik, sonraki aşamada parçaların sırasını belirlerken kullanılır.

A. Tüm v1 hikâyeleri "Must Have"; yürüyen iskelete giren hikâyeler ayrıca "İskelet" etiketiyle işaretlenir
B. Gerçek MoSCoW ayrımı: oyunun çekirdeği "Must Have"; rehber, rapor, geri bildirim gibi oyunu oynamaya şart olmayanlar "Should Have"; iskelet etiketi de olsun
C. Tüm v1 hikâyeleri "Must Have", iskelet etiketi olmasın (iskelet sonraki aşamada ayrıca seçilir)
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q5. [Oyun tasarımcısı] Ölüm zincirinin sonunda kimse yaşamıyorsa kim kazanır? (inceleme notu R-01)

Nadir ama mümkün bir durum: ör. son iki kişiden biri Celalli Damat, diğeri sevdalılardan biri; Celalli Damat infaz edilip son kişiyi götürür ve kimse kalmaz. Şu anki kazanma sırası (FR11.1) "tüm gulyabaniler öldüyse Köylüler kazanır" kuralını önce denediği için bu durumda Köylüler kazanmış sayılıyor; bu niyet edilen sonuç mu?

A. Şu anki sıra geçerli: tüm gulyabaniler de öldüğü için Köylüler kazanır
B. Kimse kazanmaz: "Köyde kimse kalmadı — berabere" ekranı gösterilir
C. Gulyabaniler kazanır: köy boşaldı
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q6. [Oyun tasarımcısı] Oturum bilgisi kaybolan oyuncu nasıl geri döner? (inceleme notu R-02)

Oyuncunun oturum belirteci tarayıcıda saklanıyor (FR14.1). Oyuncu uygulama içi tarayıcıdan (ör. WhatsApp'ın içinden) başka tarayıcıya geçerse, gizli sekme kullanırsa ya da site verisini silerse belirteç kaybolur ve şu an geri dönüş yolu yok; hesap ya da şifre de yok.

A. Oyuncu aynı oda koduyla ve aynı nick'le girer; moderatör ekranında "Ali yeniden katılmak istiyor" onayı çıkar; moderatör onaylarsa oyuncu aynı rol ve durumla döner
B. Geri dönüş yolu olmasın; oyuncu kopuk sayılır ve moderatör isterse onu oyundan çıkarır (FR14.4)
C. Oyuncuya oyun başında 4 haneli kişisel bir dönüş kodu gösterilir; oda kodu + nick + bu kodla geri döner (moderatör onayı gerekmez)
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q7. [Oyun tasarımcısı] Son söz sırasında moderatör gündüz sohbetine yazabilir mi? (inceleme notu R-03)

Gereksinimlerde iki kural çakışıyor: son söz süresinde gündüz sohbetine "yalnızca sanık yazar" (FR9.3), ama moderatör gündüz sohbetine her zaman yazabilir (FR13.3).

A. Evet: moderatör son sözde de yazabilir (oyunu yönetmek, uyarı yapmak için); oyuncular yazamaz
B. Hayır: son sözde gündüz sohbetine yalnızca sanık yazar, moderatör de bekler
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Q8. [Oyun tasarımcısı] Eşitlik yüzünden yapılan yeniden oylama günlük sınıra sayılır mı? (inceleme notu R-04)

Bir günde en fazla 2 yeniden oylama yapılabilir (FR9.4). Yeniden oylama iki nedenle olur: oylamada eşitlik çıkınca (FR9.2, "Yeniden oylama" kuralı) ve onay oylamasında çoğunluk bozulunca (FR9.4). Eşitlik nedeniyle yapılanın bu sınıra sayılıp sayılmadığı yazmıyor.

A. Sayılır: hangi nedenle olursa olsun bir günde toplam en fazla 2 yeniden oylama; sonrasında o gün infaz yok
B. Sayılmaz: sınır yalnızca onay oylamasında çoğunluk bozulunca yapılan yeniden oylamalar için; eşitlik yeniden oylaması ayrıca en fazla 1 kez yapılır (zaten "yine eşitse infaz yok")
X. Other (please specify)

[Answer]: A (sahip kararı bana bıraktı)

## Sorulmadan yazılacak varsayımlar

Aşağıdakiler makul varsayılan olarak hikâyelere yazılacak; onay kapısında düzeltebilirsiniz.

- **R-05 — "Gördüm"e hiç basılmazsa:** moderatörün "Sonraki Adım" düğmesi herkes "Gördüm" demeden de etkindir; moderatör kimin henüz basmadığını görür ve isterse bekler. Oyun bir oyuncu yüzünden kilitlenmez.
- **R-06 — Gulyabani adet seçicisi:** en az 1'dir; 0'a indirilemez (oyunun bir gulyabanisi olmalı).
- **R-07 — KVKK bilgilendirmesi:** şikayet edilen mesaj metninin 1 ay saklandığını da söyler (sohbetlerin 24 saatte silinmesi kuralının istisnası).

## Consolidated Summary Confirmation

Sahip ayrıntılı soruları bana bıraktı (mesaj 5c862c8d); önerilen cevaplar seçildi:

- Dört kişi: Moderatör, Oyuncu, Ölü oyuncu, Sahip. İlk kez gelen ve sonradan gelen kişinin ihtiyaçları Oyuncu hikâyelerinde yazılır.
- Hikâyeler oyunun akışına göre gruplanır; roller, mezarlık, sohbet, bağlantı, rehber, kayıtlar ayrı gruplarda.
- Orta büyüklük: yaklaşık 40–45 hikâye.
- Tüm v1 hikâyeleri Must Have; yürüyen iskelete girenler "İskelet" etiketiyle işaretlenir.
- Ölüm zincirinin sonunda kimse yaşamıyorsa mevcut sıra geçerli: Köylüler kazanır.
- Oturum bilgisi kaybolan oyuncu aynı oda kodu ve nick'le girer, moderatör onaylarsa aynı rol ve durumla döner.
- Moderatör son sözde de gündüz sohbetine yazabilir; oyuncular yazamaz.
- Eşitlik yeniden oylaması da günlük 2 yeniden oylama sınırına sayılır.
- Varsayımlar: "Gördüm"e basılmasa da moderatör ilerleyebilir; gulyabani sayısı en az 1; KVKK metni 1 aylık şikayet saklamayı söyler.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
