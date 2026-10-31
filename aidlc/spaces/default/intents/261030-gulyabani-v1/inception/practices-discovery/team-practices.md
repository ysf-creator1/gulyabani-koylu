# Ekip Çalışma Biçimi — Gulyabani–Köylü

## Way of Working

- Tek ana dalla (`main`) çalışırız (trunk-based). Ayrı `develop` dalı ya da uzun ömürlü sürüm dalı açmayız.
- Yapım aşamasındaki her parça (Bolt), `main`'den açılan kendi geçici dalında yazılır. Parça onaylanınca `main`'e **squash** ile, parçanın adını taşıyan **tek bir commit** olarak eklenir; geçici dal sonra silinir. Taban dal `main`, hedef dal `main`'dir. (practices-discovery Q1)
- Pull request (PR) açmayız; inceleme ve onay, AI-DLC onay kapılarında sahibin açık onayıyla yapılır. İkinci bir inceleyici yoktur.
- AI-DLC onaylarından sonraki belge commit'leri, bugüne kadar olduğu gibi bulunduğumuz dala (`main`) atılır ve GitHub'a push edilir.
- Sürümleri ayrı dallarla değil, `main` üzerindeki sürüm etiketleriyle (ör. `v1.0.0`) işaretleriz.

## Walking Skeleton

- **Tutum: AÇIK.** Bu projede her zaman önce yürüyen iskeleti (walking skeleton) yaparız: parçaların birbirine bağlandığını kanıtlayan, baştan sona çalışan en küçük sürüm. (practices-discovery Q4; `mvp` kapsamı `skeleton: on`)
- İskeletin içeriği: yalnızca Gulyabani ve Köylü rolleriyle en basit tam oyun — oda kurma, odaya katılma, rol dağıtımı, gece/gündüz turu, oylama ve oyun sonu. Diğer roller ve özellikler iskelet onaylandıktan sonra eklenir.
- İskelet baştan, ücretsiz Oracle sunucusunda dış adreste çalışır; telefonlar hem Wi-Fi hem mobil veriyle bağlanarak dener. (practices-discovery Q5, Q10)
- **Doğrulama:** iskelet iki yolla kanıtlanır ve sahibinin iskelet onayı olmadan sonraki parçalara geçilmez:
  1. Bot oyuncuların tam bir oyunu baştan sona otomatik oynadığı uçtan uca test (sahibin onaylayacağı Construction doğrulama komutu bunu çalıştırır).
  2. Gerçek telefonlarda yeniden bağlanma denemesi (başka uygulamaya geçip dönme, ekran kilidi sonrası dönme, mobil veri). Bu deneme elle yapılır, sonucu sahibin onayıyla kaydedilir.
- İskelet onaylandıktan sonra, sonraki parçaların tek tek onaylanıp onaylanmayacağı (`gated`) ya da otomatik devam edileceği (`autonomous`) sahibine bir kez sorulur. Plan onayı, özet onayı, doğrulama komutu seçimi ve hatalar her durumda sahibin onayında kalır.

## Testing Posture

- **Methodology**: custom
- **Methodology evidence**: Sahip karma bir test sırası seçti (practices-discovery Q7 = A): oyun kuralları (roller, gece/gündüz akışı, oylama, kazanma koşulları) net ve kural tabanlı olduğu için önce test yazılır; ekranlar ve diğer katmanlarda önce kod yazılır. İki farklı sıra bir arada olduğu için yöntem `custom` olarak kaydedildi.
- **Ordering**: Oyun kuralı mantığında önce testler yazılıp çalıştırılır ve başarısız olduğu görülür, ardından kural kodu yazılarak testler geçirilir; ekranlar ve diğer tüm katmanlarda önce o katmanın kodu yazılır, hemen ardından o katmanın testleri yazılıp çalıştırılır.
- **Kapsam alt sınırı:** tüm kodda satır kapsamı en az %80, oyun kuralı kodunda en az %90. (practices-discovery Q8 = B; org.md'deki `mvp` %80 tabanından daha sıkı)
- **Birleştirme engeli:** testlerden biri başarısızsa ya da kapsam bu sınırların altındaysa parça `main`'e eklenmez. Testler ve kapsam ölçümü birleştirmeden önce CI'da çalışır; sınırlar bir adımı geçirmek için gevşetilmez.
- **Uçtan uca test:** bot oyuncuların tam bir oyunu baştan sona oynadığı otomatik test v1'de vardır; iskeletle başlar ve her yeni rol ya da özellikle genişletilir.
- **Test stratejisi:** `Standard` — birim testleri (oyun kuralları, rol yetenekleri, oylama), entegrasyon testleri (sunucu–tarayıcı iletişimi, yeniden bağlanma) ve bot oyunculu uçtan uca test.
- **Projeye özgü testler:** yeniden bağlanma; gizli bilginin yalnızca hak eden oyuncuya gitmesi (C-07); odaların ve sohbetlerin 24 saat sonra silinmesi ve IP adresinin saklanmaması (C-14, C-15) otomatik testle sınanır. Erişilebilirlik (WCAG 2.1 AA) için CI'da otomatik erişilebilirlik taraması çalışır; ekran okuyucu ve klavye denemesi elle yapılır.

## Deployment

- **Tek ücretsiz sunucu:** sıfır bütçe (C-01) nedeniyle yalnızca bir ücretsiz sunucumuz vardır (Oracle Cloud Always Free). Ayrı bir deneme (staging) ortamı yoktur; bu, org.md'deki "birleştirmede deneme ortamına yayın" varsayılanından ekip olarak bilinçli seçtiğimiz bir sapmadır. (practices-discovery Q2 = A)
- **Oracle hesabı yapım aşamasının en başında kurulur**, çünkü ilk çalışan sürüm (yürüyen iskelet) baştan bu sunucuda dış adreste çalışır. (practices-discovery Q5 = B, Q10 = A)
- **v1 yayınına kadar:** sunucuda henüz canlı oyun olmadığından, bu tek sunucu deneme için kullanılır; iskelet ve erken sürümler orada çalıştırılır, telefonlar mobil veriyle de dener. (Q10 = A)
- **v1 yayınından sonra:** sunucu yalnızca canlı oyundur. Yeni parçalar önce bilgisayarda ve otomatik testlerle (bot oyunculu uçtan uca test dahil) denenir; canlı sunucu deneme için kullanılmaz. (Q2 = A, Q10 = A)
- **Canlıya çıkış elle onaylıdır:** `main`'e birleştirme canlıya otomatik yayın yapmaz. Canlıya çıkış yalnızca sahibin açık onayıyla ve `main` üzerinde bir sürüm etiketiyle (ör. `v1.0.0`, semver) yapılır. org.md'deki "teknik lider + ürün sahibi" onayının yerini, tek onaylayan olarak sahip alır. (practices-discovery Q3 = A)
- **Geri alma:** her yayının bir önceki sürüme dönüş yolu vardır; sorun çıkarsa bir önceki sürüm etiketi yeniden yayınlanır. Yayından sonra kısa bir sağlık kontrolü yapılır (ana sayfa açılıyor, oda kurulabiliyor, bir oyuncu katılabiliyor); kontrol başarısızsa önceki sürüme dönülür. (Q3 = A; operation.md korkulukları)
- **Not:** ortam kurulumu, dağıtım ve izleme aşamaları çalışma planına daha sonra eklenecektir (C-13, ISS-03); ayrıntılı yayın betikleri o aşamalarda yazılır.

## Code Style

- Biçimlendirici ve denetleyici (linter) ayarları depo kökündeki yapılandırma dosyalarında tutulur; CI'da birleştirmeden önce çalışır, hata birleştirmeyi durdurur. (org.md varsayılanı)
- Programlama dili sonraki aşamalarda seçilir (ISS-02); seçilen dilin yerleşik ya da yaygın biçimlendirici ve denetleyicisi kullanılır (ör. TypeScript seçilirse Prettier + ESLint). Adlandırma dilin alışılmış biçimini izler.
- **Kod içi adlar** (değişken, fonksiyon, sınıf, dosya adları) İngilizcedir; **kod yorumları** Türkçedir. (practices-discovery Q6 = A)
- **Oyuncuya görünen tüm metinler** Türkçedir ve koddan ayrı bir metin (strings) dosyasında tutulur; kod içine gömülmez. (Q6 = A; C-09)
