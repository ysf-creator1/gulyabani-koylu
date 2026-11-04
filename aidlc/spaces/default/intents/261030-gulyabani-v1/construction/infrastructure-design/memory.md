<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-02T12:14:33Z — [unit u1-walking-skeleton] Sahibe yalnızca iki büyük karar soruldu (Oracle hesap türü, oyunun adresi); geri kalan her şey (bölge, makine boyutu, CI/CD, izleme araçları) benim varsayılanım. Sahibin kuralı (project.md Corrections) teknik olmayan sahibi az soruyla yormamayı istiyor; bu ikisi para ve oyuncuların gördüğü adres olduğu için sahibe ait.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-02T12:14:33Z — [unit u1-walking-skeleton] Oracle bulut kaynakları (VCN, makine, bütçe) Terraform yerine Türkçe konsol kılavuzuyla açılıyor; sunucunun içi tamamen betikle. Terraform sahibin bilgisayarında Oracle API anahtarı (sır) isterdi; birkaç kaynak bir kez açılıyor.
- 2026-11-02T12:14:33Z — [unit u1-walking-skeleton] Yayın CI'da değil sahibin bilgisayarından yapılıyor; SSH anahtarı GitHub Secrets'a konmuyor (depo/CI ele geçerse sunucuya ulaşılamasın). Ekip kuralı da otomatik yayın istemiyor.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-02T12:14:33Z — [unit u1-walking-skeleton] Sürüm paketi GitHub'ın ücretsiz ARM64 makinesinde node_modules dahil üretiliyor (depo açık); sunucuda npm/derleme yok ve denenen dosyalar yayınlananla aynı. Depo kapanırsa sunucuda npm ci yoluna dönülür.
- 2026-11-02T12:14:33Z — [unit u1-walking-skeleton] Yayın stratejisi recreate; mavi-yeşil tek yazarlı SQLite ve 512 MB bütçeyle çelişiyor, kanarya/kademeli tek makinede anlamsız.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-04T20:25:00Z — [unit u2-room-and-lobby] İnceleme (READY) bulguları, U2 Code Generation planına zorunlu madde olarak devredilir:
  - (1) Duman testinin bekleme denemesi: 3 bot oyunu başlatır, 4. bot bekler, sonra moderatör botu oyunu bitirmeden önce bütün botlar bağlantıyı keser ve deneme odası boşalınca 15 dk'da silinir. activeMatches'in sonraki yayını bekletmemesi için duman testi oyunu başlatmaz: yalnızca oyun sürüyormuş gibi davranan bir yol yok, bu yüzden bekleme denemesi canlıda değil uçtan uca testte yapılır; canlı duman testi U1'deki gibi kalır.
  - (2) Geri alma testi: release.yml'de v0.1.1 paketiyle 002 uygulanmış depoya yazma (INSERT) denemesi ya da check:migrations'a "NOT NULL sütun DEFAULT taşır" kuralı.
  - (3) deploy.sh'de göçten önce `VACUUM INTO` ile tek anlık kopya.
  - (4) kickBansApplied eşiği journalctl ile sayılır.
  - (5) ci.yml'de ayar denetimi ve göç testinin hangi işte çalışacağı; config.ts'te DEV_ALL_ROLES reddi.
  - NFR Design'dan: forgetParticipant çağrı noktaları (çıkarma, ayrılma, oda silme) ve bellek sızıntısı testi.
