# NFR Gereksinimleri Soruları — U1 Yürüyen İskelet

Bu aşamada hız, güvenlik, ölçek, dayanıklılık ve izleme hedefleri yazılır ve teknoloji seçilir. Hedeflerin çoğu gereksinim belgesinde (NFR1–NFR15) ve sözleşmelerde zaten sabit; sahibin kuralı gereği (project.md Corrections) küçük ayrıntıları ben seçtim. Sahibe yalnızca iki büyük karar soruluyor: programlama dili ve kalıcı depo. Bu iki seçim Teslim Planlaması'nda "ben öneririm, sahip onaylar" diye kaydedilmişti (external-dependency-map ISS-02).

## Q1. [Mimar] Oyun hangi programlama diliyle yazılsın?

Bağlam: Sunucu, tarayıcıdaki ekranlar ve bot oyunculu test aynı mesaj biçimlerini (sözleşmeler C1, C5) kullanır; sözleşme belgesi bu biçimlerin tek bir ortak tanım dosyasında tutulmasını istiyor. Geliştirme ve bakım tek kişilik ve yapay zekâ destekli (C-11).

- A. TypeScript — sunucuda Node.js, tarayıcıda aynı dil (önerilen: tek dil, ortak tanım dosyası doğrudan paylaşılır, yaygın ve ücretsiz araçlar)
- B. Go sunucu + TypeScript tarayıcı (sunucu daha az bellek kullanır ama iki dil olur, ortak tanımlar iki kez yazılır)
- C. Python sunucu + TypeScript tarayıcı (iki dil; canlı bağlantıda Node.js ve Go kadar yaygın değil)
- X. Other (please specify)

[Answer]: A

## Q2. [Mimar] Oyun verisi (odalar, oyunlar, sohbetler) nerede saklansın?

Bağlam: Kabul edilen her işlem önce kalıcı depoya yazılmalı; sunucu yeniden başlasa da hiçbir işlem kaybolmamalı (NFR5, ADR-004). Bütçe sıfır (C-01) ve tek sunucu var. Oda verisi zaten 24 saatte silinir.

- A. SQLite — sunucunun diskinde tek bir dosya, ayrı veritabanı programı yok (önerilen: ücretsiz, en sade kurulum; bir işlemin birden çok kaydı tek seferde ya hep ya hiç yazılır)
- B. PostgreSQL — aynı sunucuda ayrı bir veritabanı programı (daha güçlü ama kurulum, güncelleme ve bellek yükü getirir)
- C. Oracle'ın ücretsiz bulut veritabanı (Autonomous Database) — sunucunun dışında (ağ gecikmesi ekler, kullanılmazsa Oracle kapatabiliyor)
- X. Other (please specify)

[Answer]: A

## Consolidated Summary Confirmation

- Dil: TypeScript; sunucu Node.js üzerinde, ekranlar tarayıcıda aynı dille. Mesaj biçimleri tek ortak dosyada.
- Depo: SQLite; sunucunun diskinde tek dosya. Bir işlemin bütün kayıtları tek seferde yazılır, sonra kabul edilir.
- Benim seçtiğim küçük ayrıntılar: hedefler gereksinimlerdeki gibi (işlem 1 saniyede yansır, bağlantı 5 saniyede geri gelir, yeniden başlatmada 1 dakikada hazır, ayda %99 açık). Ekranlar için küçük bir yardımcı (Preact), testler için Vitest, erişilebilirlik taraması için axe.
- Güvenlik: yalnızca şifreli bağlantı; IP hiçbir yerde (sunucu önündeki programın günlükleri dahil) yazılmaz; sırlar yalnızca ortam değişkeninde; sağlık kontrolünün sayıları ayrı, yalnızca sunucu içinden açılan bir kapıdan verilir.
- Oda verisi 24 saatlik olduğu için ayrıca yedeklenmez.

Does this all look correct before I generate the artifact?

- Looks correct
- Request changes

[Answer]: Looks correct
