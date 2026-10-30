# Kısıt Kaydı — Gulyabani–Köylü (çalışma adı)

Sonraki aşamalarda yapılacak her seçimin uyması gereken kısıtlar. Kısıtlar onaylanan niyet beyanından (intent-statement) ve bu aşamanın cevaplarından gelir.

## Sources

- [desc] Initial description: "gulyabani-koylu-intent.md dosyasındaki oyunu sıfırdan geliştir. Sadece v1 kapsamı; v2 maddeleri kapsam dışı."
- [scope] Workflow-selected scope: `mvp`.
- [Q1]–[Q10]: `feasibility-questions.md` içindeki cevaplar.
- Onaylanan niyet beyanı: `ideation/intent-capture/intent-statement.md` (intent-statement).

## Bütçe ve Zaman

| ID | Kısıt | Kaynak | Etkisi |
|---|---|---|---|
| C-01 | Aylık işletme maliyeti hedefi sıfır; yalnızca ücretsiz kullanım hakları kullanılır | [Q1] | Barındırma seçimini ücretsiz haklarla sınırlar |
| C-02 | Kredi kartıyla hesap açılabilir; ücretsiz sınır aşılırsa ayda birkaç dolarlık aşım kabul edilir | [Q10] | Kart isteyen sağlayıcılar elenmez |
| C-03 | Sabit yayın tarihi yok; oyun hazır olunca yayınlanır | [Q2] | Kapsam, tarihe sığdırmak için kısılmaz |
| C-04 | Önce ücretsiz alt adres kullanılır; kendi alan adı sonra alınabilir | [Q9] | Adres değişikliği ileride mümkün olmalı |

## Teknik

| ID | Kısıt | Kaynak | Etkisi |
|---|---|---|---|
| C-05 | Yalnızca v1 kapsamı; v2 maddeleri kapsam dışı | [desc] | Tılsım kartları, bot moderatör vb. yapılmaz |
| C-06 | En fazla 26 oyuncu; en az 3 oyuncu ve bir moderatör | intent-statement | Oda kapasitesi ve başlatma kuralı |
| C-07 | Oyun durumunu sunucu yönetir; gizli bilgi yalnızca hak eden oyuncuya gider | [desc] | Sürekli çalışan bir sunucu gerekir |
| C-08 | Aynı anda yaklaşık 50 oda; boşta maliyet yaklaşık sıfır | [desc] | Ücretsiz kapasite bu yüke göre doğrulanmalı |
| C-09 | Katılım karışık: bilgisayar + telefon ya da tek telefon; arayüz mobil öncelikli ve Türkçe | [Q6], intent-statement | Kopmaya dayanıklılık ve yeniden bağlanma şart |
| C-10 | Barındırma adayları Oracle Cloud ve Azure'un ücretsiz hakları; AWS zorunlu değil; kesin seçim sonraki aşamalarda | [Q7], intent-statement | Google Cloud ve AWS yalnızca karşılaştırma notu |

## Organizasyonel

| ID | Kısıt | Kaynak | Etkisi |
|---|---|---|---|
| C-11 | Geliştirme ve bakım tek kişide, sınırlı yazılım bilgisiyle ve AI yardımıyla | [Q7] | En sade ve az bakım isteyen çözüm seçilir |
| C-12 | Hazırda bulut hesabı ve alan adı yok | [Q8] | Hesap açma işi plana girer |
| C-13 | Yayın, bu çalışmanın içinde yapılır; yayın aşamaları plana sonradan eklenecek | intent-statement | Plan güncellemesi gerekir |

## Mevzuat ve Kullanım Kuralları

| ID | Kısıt | Kaynak | Etkisi |
|---|---|---|---|
| C-14 | IP adresi saklanmaz | intent-statement | Kayıt içeriği sınırlanır |
| C-15 | Kayıtlar ve geri bildirimler 1 yıl, odalar ve sohbetler 24 saat saklanır | intent-statement | Otomatik silme gerekir |
| C-16 | Ana sayfada ve odaya girişte kısa gizlilik bilgilendirmesi (KVKK) gösterilir | [Q3] | Metin hazırlanmalı; hukuki görüş değildir |
| C-17 | Sohbette: moderatör oyuncuyu çıkarabilir, kelime filtresi olur, oyuncu mesaj şikayet edebilir; şikayet kayıtlara düşer | [Q4] | Üç önlem birlikte v1'e girer |
| C-18 | Oyunun adı "Gulyabani" içerebilir; kutu oyununun isim, metin ve görselleri kullanılmaz | [Q5], [desc] | Kart ve metinler özgün olmalı |

## Assumptions & Open Questions

None.
