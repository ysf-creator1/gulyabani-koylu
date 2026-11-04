# İzleme Tasarımı — U2 Oda ve Lobi

U1'in izleme düzeni (`../../u1-walking-skeleton/infrastructure-design/monitoring-design.md`) aynen geçerlidir:
- iç `/healthz` (127.0.0.1:8081);
- dış `/healthz`;
- journald günlükleri (7 gün, 200 MB);
- yayın sonrası kontrol.

Ücretli bir izleme hizmeti yoktur (NFR3). Bu belge U2'nin eklediklerini yazar.

## Sources

- NFR tasarımı: `construction/u2-room-and-lobby/nfr-design/observability-design.md` (observability-design; NFR13.20–NFR13.22), `security-design.md` (lobi hız sınırı, günlük süzgeci).
- U1 izleme tasarımı: `construction/u1-walking-skeleton/infrastructure-design/monitoring-design.md`.
- Sözleşmeler: `inception/contract-design/contract-summary.md` (contract-summary; C2 sağlık kontrolü).

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| `waitingParticipants` | İç `/healthz` | Bilgi amaçlı; eşik yok | Kaç kişinin süren oyunu beklediğini gösterir (NFR13.20) |
| `kickBansApplied` | İç `/healthz` | Bir günde 20'den fazlası incelenir | Çıkarma yasağının kötüye kullanıldığını ya da bir odada sorun olduğunu gösterir (NFR13.20) |
| `errorCount` (U1) | İç `/healthz` | U1 eşiği aynen | U2 retleri sayılmaz; yalnızca `internal_error` (NFR13.22) |
| `rate_limited` retleri | `command.rejected` günlük satırları (`reasonCode`) | Bir saatte bir odadan 50'den fazla | Hatalı istemci ya da kötü niyetli moderatör (security-design) |

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Göç başarısız | Açılışta göç hatası → süreç açılmaz → yayın betiğinin iç sağlık beklemesi 60 sn'de geçmez | P1 | Yayın betiği otomatik geri alır; sahibe sohbette bildirilir (U1 akışı) |
| Günlükte yasak alan | Günlük tarama testi (CI) nick, anahtar, özet ya da IP bulur | P1 (birleştirme engeli) | CI kırmızı; parça `main`'e eklenmez |

Ücretli uyarı hizmeti olmadığı için canlı uyarılar U1'deki gibi yayın sonrası kontrol ve sahibin elle bakmasıyla sınırlıdır. U8'de yeniden değerlendirilir.

## SLIs / SLOs

| SLI | SLO target | Measurement window |
|---|---|---|
| Lobi komutu işleme süresi (sunucu içi) | %95 ≤ 150 ms (U1 bütçesi) | Uçtan uca test çalıştırması |
| Hizmet erişilebilirliği | %99 (U1, NFR6) | 30 gün kayan pencere |

## Logs & Tracing

- U2'nin 6 yeni günlük satırı U1'in journald düzeninde toplanır:
  - `lobby.settings_changed`, `lobby.role_pool_changed`, `lobby.moderator_transferred`, `lobby.closed_to_new`;
  - `room.waiting_joined`, `room.kick_ban_applied`.
- Satırlar yalnızca `roomCode`, `command`, `commandId` ve `count` alanlarını taşır.
- Dağıtık izleme yoktur: tek süreç vardır, `commandId` bir komutu günlükte izlemeye yeter.
- Ayrı bir pano yoktur: iç `/healthz` çıktısı sahibin bilgisayarından `ssh oracle curl -s 127.0.0.1:8081/healthz` ile okunur.
