# Project-Level Rules

> Project-specific specialisation and corrections. Loaded after `org.md` and
> `team.md` as strict-additive guidance; contradictions with broader policy
> are rejected. Populated by practices-discovery and the self-learning loop.
>
> Use sparingly: most teams don't need a project layer. Reach for it
> only when this specific project needs stable, durable guidance beyond the
> team practice (for example, package-specific release checks or an additional
> regression suite for a legacy component).

## Way of Working

<!-- Project-specific specialisation. Example: -->
<!-- This monorepo requires package-scoped branch names and a package owner -->
<!-- review in addition to the team's normal merge policy. -->

## Walking Skeleton

<!-- Project-specific specialisation. Example: -->
<!-- The walking skeleton must exercise the legacy service adapter as well -->
<!-- as the new service boundary. -->

## Testing Posture

<!-- Project-specific specialisation. -->

## Guard Policy

<!-- Project-specific. Mode: strict, relaxed, or off. Strict here holds for every intent, whatever one person asks in chat; relaxed or off here applies to every intent whose policy came from its scope, unless the person sets another; changing this line changes it. A section under the retired Change Control heading, written by an earlier release, is still read. -->

## Deployment

<!-- Project-specific specialisation. -->

## Code Style

<!-- Project-specific specialisation. -->

## Tech Stack

<!-- Technology choices locked for this project. -->

## Decided

<!-- Decisions made in earlier stages that should not be re-asked. -->
<!-- Format: DECIDED: [decision] (Stage [slug], [date]) -->

## Scope Overrides

<!-- Custom scope rules for this project. -->

## Forbidden

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: NEVER [behavior] (affirmed [date]) -->
<!-- Example: NEVER throw exceptions across service layer boundaries (affirmed 2026-05-17) -->

- NEVER oyuncuların IP adresini saklama (kayıtlarda, veritabanında veya log dosyalarında). (kaynak: constraint-register C-14, scope-document Kapsam Dışı; onay: practices-discovery Q9) (affirmed 2026-10-31)

- NEVER şifre, API anahtarı veya başka bir sırrı koda ya da depoya (GitHub) yaz. (kaynak: phases/construction.md Security; onay: practices-discovery Q9) (affirmed 2026-10-31)

- NEVER kutu oyununun isim, metin ve görsellerini kullan; kartlar ve metinler özgün olsun ("Gulyabani" adı kullanılabilir). (kaynak: constraint-register C-18; onay: practices-discovery Q9) (affirmed 2026-10-31)

- NEVER v2 listesindeki özellikleri (tılsım kartları, "Ağız Bağlama", Ebe Nine/Muhtar/Kahveci, bot moderatör, sesli anons, oyuncu istatistik ekranları) v1'e ekle. (kaynak: constraint-register C-05, scope-document Kapsam Dışı; onay: practices-discovery Q9) (affirmed 2026-10-31)

- NEVER ücretsiz kullanım hakkı olmayan, sabit aylık ücret isteyen bir hizmeti sahibinin açık onayı olmadan kullan. (kaynak: constraint-register C-01; onay: practices-discovery Q9) (affirmed 2026-10-31)

## Mandated

<!-- Populated by practices-discovery affirmation gate. -->
<!-- Format: ALWAYS [behavior] (affirmed [date]) -->
<!-- Example: ALWAYS use Result<T,E> for fallible operations in service layer (affirmed 2026-05-17) -->

- ALWAYS aylık işletme maliyetini sıfır hedefinde tut; yalnızca ücretsiz kullanım haklarını kullan, ücretsiz sınır aşılırsa yalnızca ayda birkaç dolarlık aşımı kabul et. (kaynak: constraint-register C-01, C-02; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS odaları ve sohbetleri oluşturulmalarından 24 saat sonra otomatik olarak sil. (kaynak: constraint-register C-15, intent-statement; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS kayıtları ve geri bildirimleri 1 yıl sakla, süresi dolanı otomatik sil. (kaynak: constraint-register C-15; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS ana sayfada ve odaya girişte kısa KVKK gizlilik bilgilendirmesini göster. (kaynak: constraint-register C-16; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS oyun durumunu sunucuda yönet ve gizli bilgiyi yalnızca hak eden oyuncuya gönder. (kaynak: constraint-register C-07; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS arayüzü WCAG 2.1 AA'nın tamamına uygun yap (kontrast, renk körlüğü için simge, büyük dokunma alanları, klavyeyle oynama, ekran okuyucu). (kaynak: wireframes Genel İlkeler, rough-mockups Q6; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS kullanıcıya görünen metinleri Türkçe yaz ve arayüzü mobil öncelikli tasarla. (kaynak: constraint-register C-09; onay: practices-discovery Q9) (affirmed 2026-10-31)

- ALWAYS sırları (şifre, anahtar, erişim bilgisi) ortam değişkeninde veya bir sır yöneticisinde tut. (kaynak: phases/construction.md Security; onay: practices-discovery Q9) (affirmed 2026-10-31)

## Corrections

<!-- Project-specific corrections from human feedback. -->
<!-- Format: NEVER/ALWAYS [behavior] (learned [date]) -->
- ALWAYS ayrıntılı ve küçük konuları sahibe sormadan kendin tasarla, makul varsayılanları seç; sahibe yalnızca büyük kararları sor, ardından kısa ve sade bir özet göster ki sahip onaylasın ya da düzeltme notu yazsın (sahip teknik değil; çok metin ve soru onu yoruyor). (learned 2026-10-31) <!-- cid:261030-gulyabani-v1:user-stories:22c0b0ca5e496f1209cb35c06f4fafa46529ed491914564f70b941ed9e3d5d09 -->
- ALWAYS görünümle ilgili kararlarda (renk, tarz, ekran görünüşü) onayı resim (görsel örnek) göstererek iste. (learned 2026-10-31) <!-- cid:261030-gulyabani-v1:refined-mockups:4999aeaf764235e712fc904d7462f67986cd2a55f8126599244cff0a9c2a3472 -->
