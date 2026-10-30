# Gulyabani–Köylü — Ürün Tanımı (AI-DLC Intent)

> Bu dosya AI-DLC Inception aşamasının girdisidir. Belirsiz kalan noktaları varsayım yapmadan bana soru olarak sor (bkz. Bölüm 17).
> Oyun, klasik Werewolf / Mafia / Vampir–Köylü türünden esinlenir. Karakter isimleri, kart metinleri ve görseller bu projeye özgüdür; piyasadaki hiçbir kutu oyununun (ör. NeoTroy "Gulyabani") isimleri, kart metinleri, görselleri veya tasarım dili kullanılmayacak.

## 1. Amaç
Arkadaş gruplarının tarayıcı üzerinden (çoğunlukla telefondan, aynı anda bir sesli/görüntülü toplantıdayken) oynayabileceği, Anadolu köyü ve Türk folkloru temalı bir sosyal çıkarım oyunu. Bir **moderatör** oyunu adım adım yönetir; sistem moderatöre o an ne yapması ve ne söylemesi gerektiğini gösterir, gizli bilgileri yalnızca hak eden oyunculara iletir.

**Hikâye:** Sisli bir Anadolu köyünde geceleri gulyabaniler dolaşmaya başlamıştır. Gündüz herkes sıradan bir köylüdür; ama bazıları gece gulyabaniye dönüşüp komşularını kaçırır. Köylüler her gün meydanda toplanıp aralarındaki gulyabaniyi bulmaya çalışır.

## 2. Kapsam
**v1:**
- Oda oluşturma / oda koduyla katılma, nick ile giriş (şifre yok)
- İnsan moderatör
- Rol havuzu (Bölüm 6) ve **oda kurucusunun rolleri aktif/pasif yapabilmesi** (Bölüm 5)
- Gece / gündüz döngüsü, gulyabani ortak kararı + gulyabani sohbeti
- Gündüz sohbeti, oylama, son söz, onay oylaması, infaz, kart açılışı
- Mezarlık (ölüler odası: izleme + kendi aralarında sohbet)
- Kazanma kontrolü, yeniden bağlanma
- **Rehber bölümü:** kartlar, kart özellikleri, nasıl oynanır (Bölüm 14)
- Kart tasarımları (Bölüm 13)
- Türkçe, mobil öncelikli arayüz

**v2:** Tılsım (güç) kartları (Bölüm 12), "Ağız Bağlama" varyantı, ek roller (Bölüm 6.4), otomatik (bot) moderatör, anonsları sesli okuma (TTS), oyun geçmişi/istatistik.

## 3. Terimler
- **Oda:** Tek bir oyun oturumu. 6 haneli kod ve paylaşılabilir link ile katılınır.
- **Oda kurucusu / Moderatör:** Odayı kuran kişi varsayılan moderatördür. Oyuncu sayılmaz, rol almaz, tüm bilgileri görür.
- **Oyuncu:** Rol alan katılımcı. Durumu: `yaşıyor` / `öldü`.
- **Taraflar:** Gulyabaniler, Köylüler ve Bağımsızlar (kendi kazanma koşulu olanlar).
- **Faz:** Lobi → Rol Dağıtımı → İlk Gece → (Gündüz ↔ Gece döngüsü) → Oyun Sonu.

## 4. Lobi ve Giriş
- Oda kurucusu lobide moderatörlüğü başka bir katılımcıya devredebilir.
- Katılımcı yalnızca nick girer. Nick oda içinde benzersiz olmalı (2–16 karakter).
- Lobide herkes katılımcı listesini ve odada **aktif olan rolleri** görür (kimde olacağını değil).
- Moderatör oyunculardan birini odadan çıkarabilir.
- 6–26 oyuncu (moderatör hariç). En iyi deneyim 8+ oyuncu; 6–7 oyuncuda lobide uyarı gösterilir.
- Moderatör ayarları (Bölüm 5, 9, 10, 12) lobide yapar ve "Oyunu Başlat" der.

## 5. Rol Seçimi ve Dağıtımı
### 5.1 Rolleri aktif / pasif yapma
- Lobide oda kurucusuna (moderatöre) **Rol Havuzu** paneli gösterilir: tüm roller kart küçük resmi, kısa açıklama ve bir **aç/kapa anahtarı** ile listelenir.
- **Gulyabani** ve **Köylü** her zaman aktiftir (kapatılamaz). Diğer tüm roller (Boşboğaz Gulyabani dahil) tek tek açılıp kapatılabilir.
- Sayılabilir roller için adet seçici bulunur (ör. gulyabani sayısı). **Ahbaplar** açılırsa her zaman 2 adet eklenir.
- **Hazır ön ayarlar:** *Acemi* (yalnızca Gulyabani + Köylü), *Klasik* (+ Bekçi, Ahbaplar), *Dolu Köy* (oyuncu sayısına uygun tüm roller). Ön ayar seçildikten sonra anahtarlarla tek tek değiştirilebilir.
- **Doğrulama:** Özel rollerin + gulyabanilerin toplamı oyuncu sayısını aşamaz; aşarsa "Başlat" pasif kalır ve neden gösterilir. Rol kombinasyonu dengesizse (ör. 6 kişide 3 gulyabani) uyarı gösterilir ama engellenmez.
- Kurucunun son rol ayarları tarayıcısında hatırlanır ve yeni odada varsayılan olarak gelir.
- Oyun başladıktan sonra rol havuzu değiştirilemez.

### 5.2 Önerilen gulyabani sayısı
| Oyuncu | Gulyabani (Boşboğaz dahil toplam) |
|---|---|
| 6–7 | 1 |
| 8–11 | 2 |
| 12–17 | 3 |
| 18–23 | 4 |
| 24–26 | 5 |

### 5.3 Dağıtım
- Aktif roller desteye konur, kalan herkes Köylü olur.
- Dağıtım sunucuda kriptografik olarak güvenli rastgelelikle yapılır.
- Her oyuncu kendi kartını görür. Gulyabaniler birbirini ilk gece tanır. Moderatör tüm eşleşmeyi görür.

## 6. Karakterler
Her karakterin bir **taraf rengi** vardır: Gulyabaniler **kızıl**, Köylüler **çivit mavisi**, Bağımsızlar **mor**.

### 6.1 Gulyabaniler
| Karakter | Yetenek / kural |
|---|---|
| **Gulyabani** | Her gece diğer gulyabanilerle ortak karar verip bir köylüyü kaçırır. Gündüz köylü gibi davranır ve oy kullanır. |
| **Boşboğaz Gulyabani** | Gulyabani ile aynı yeteneklere sahiptir, ama dili durmaz: her gündüz tartışmasında **gizli kelimeyi** en az bir kez söylemek zorundadır; söylemezse o gece başlarken kendisi ölür. Gizli kelime varsayılan olarak "gulyabani"dir; moderatör "her gün yeni kelime" ayarını açarsa sistem her sabah yalnızca Boşboğaz'a ve moderatöre yeni bir kelime gösterir (ör. "sis", "kuyu", "ayran"). Kelime gündüz sohbetinde yazılırsa moderatör ekranındaki onay kutusu otomatik işaretlenir; sesli söylendiyse moderatör işaretler. |

### 6.2 Köylüler
| Karakter | Yetenek / kural |
|---|---|
| **Köylü** | Özel gücü yoktur, oy kullanır. Gücü dikkatinde ve dilindedir. |
| **Bekçi** | Her gece fenerini alıp köyü dolaşır ve bir evi yoklar: seçtiği oyuncunun yatağında olup olmadığına bakarak **gulyabani olup olmadığını** öğrenir. Sonucu yalnızca kendisi ve moderatör görür. (Boşboğaz da "gulyabani" çıkar.) |
| **Ürkek** | Korkudan uyuyamaz. 2. geceden itibaren dilerse gulyabanilerin uyandığı adımda **"pencereden bak"** seçeneğini kullanır ve o gece gulyabanilerin kim olduğunu görür. Riskli: baktığında, ayarlanabilir bir olasılıkla (varsayılan %50) gulyabanilerin ekranına "Pencerede bir gölge var: <isim>" uyarısı düşer. |
| **Ahbaplar** (2 adet) | Çocukluktan beri ayrılmayan iki ahbap. İlk gece birbirini tanır ve ikisinin de köylü olduğunu bilir. Birbirlerinin isminin yanında "Ahbap" rozeti görünür. |
| **Celalli Damat** | Köye yeni gelmiş, sinirli ama beceriksiz bir damat. Gece kaçırılarak veya gündüz infaz edilerek ölürse, son öfkesiyle yaşayan bir kişiyi seçip yanında götürür (seçtiği kişi hangi taraftan olursa olsun). Seçim süresi varsayılan 30 sn; süre dolarsa kimseyi götürmez. |

### 6.3 Bağımsızlar
| Karakter | Yetenek / kural |
|---|---|
| **Dertli** | Dünyadan bezmiştir; tek tesellisi bu dertten kurtulmaktır. Ayarlanan dert süresi içinde (varsayılan: 2. gündüzün sonuna kadar) gece kaçırılır veya gündüz infaz edilirse **oyunu tek başına kazanır ve oyun biter**. Süre geçince derdi hafifler ve normal Köylü olarak devam eder. |
| **Görücü** | Köyün kadim çöpçatanı. İlk gece iki oyuncuyu (kendisi dahil olabilir) birbirine **sevdalı** eder. Kendisi sevdalılardan biri değilse sonra normal Köylü gibi oynar. |

**Sevdalılar kuralları:**
- Sevdalılar ilk gece birbirini tanır ama birbirinin rolünü görmez; isimlerinin yanında "Sevdalı" rozeti görünür.
- Sevdalılardan biri ölürse diğeri de dayanamayıp hemen ölür ve kartı açılır.
- Oyun sonunda ikisi de hayattaysa onlar da kazanır.
- Biri gulyabani, diğeri köylüyse ikisinin de amacı değişir: köyde sağ kalan son iki kişi olmak.

### 6.4 Ek roller (v2 — öneri, onayıma bağlı)
| Karakter | Taraf | Yetenek |
|---|---|---|
| **Ebe Nine** | Köylü | Her gece bir kişiyi (kendisi dahil) kollar; o kişi o gece kaçırılamaz. Aynı kişiyi üst üste iki gece kollayamaz. |
| **Muhtar** | Köylü | Kimliği oyun başında herkese açıklanır; oylamada oyu 2 sayılır. Ölürse muhtarlığı seçtiği bir kişiye devreder. |
| **Kahveci** | Köylü | Her sabah, gece kaç kişinin uyanıp bir şey yaptığını öğrenir (isim değil, sayı). |
Rol motoru, yeni rollerin veri olarak eklenebileceği şekilde tasarlanmalı.

## 7. Oyun Akışı (sunucudaki durum makinesi)
1. **Rol Dağıtımı** → herkes kartını görür, "Gördüm" der.
2. **İlk Gece** — moderatöre anons: "Köye sis çöktü, herkes evine çekilsin, gözler kapansın." Moderatör hariç herkes "Uyku" ekranına geçer. Sıra (yalnızca aktif rollerin adımları):
   1. Görücü uyanır → iki kişi seçer
   2. Sevdalılar uyanır → birbirini görür
   3. Ahbaplar uyanır → birbirini görür
   4. Gulyabaniler uyanır → birbirini tanır (Boşboğaz'ın kim olduğu moderatöre otomatik gösterilir)
   5. Bekçi uyanır → bir evi yoklar
   6. Gulyabaniler kurbanını seçer — **ayar:** "İlk gece kimse kaçırılmaz" (varsayılan açık)
3. **Sabah — Kara Haber:** Moderatöre anons metni ve gecenin sonucu gösterilir ("Dün gece köyde kara bir olay oldu: X kaçırıldı"). "Sonucu Açıkla" ile ölenin kartı herkesin ekranında açılır. Ardından tetiklenen etkiler sırayla işlenir: Celalli Damat'ın seçimi → sevdalı ölümü → Dertli kontrolü → kazanma kontrolü.
4. **Gündüz — Meydan Toplantısı:** herkesin ekranında geri sayım (varsayılan 4 dk). Süre dolunca moderatöre "Oylamaya geç" hatırlatması (otomatik geçiş yok; moderatör geçirir, süreyi uzatabilir).
5. **Oylama → Son söz → Onay oylaması → İnfaz** (Bölüm 10). Ardından 3. adımdaki etkiler ve kazanma kontrolü tekrar işlenir.
6. **Standart Gece** — Boşboğaz kontrolü (kutu boşsa ölür) → Bekçi → Gulyabaniler (+ 2. geceden itibaren Ürkek'in "pencereden bak" seçeneği). Sonra 3. adıma dön.

Her gece adımında moderatör ekranı: okunacak anons metni, beklenen işlem ve durumu, "Sonraki Adım" butonu. Pasif yapılan rollerin adımları hiç gösterilmez. Aktif olup oyuncusu ölmüş rollerin adımı ise okunur ve kısa bir beklemeden sonra atlanır (oyuncular sessizlikten kimin öldüğünü anlamasın diye). İlgili oyuncunun ekranında hedef seçimi açılır (yalnızca yaşayan oyuncular, moderatör hariç).

Tüm süreler sunucuda bitiş zaman damgası olarak tutulur; istemciler sayacı sunucu saatine göre çizer.

## 8. Ekranlar
**Moderatör ekranı:** Mevcut faz/adım, okunacak anons metni, beklenen işlem ve durumu, sonraki adım butonu, tüm oyuncular + rolleri + yaşam durumu + rozetler (sevdalı, ahbap, boşboğaz), gece olay günlüğü, gulyabani sohbetinin salt-okunur görünümü, Boşboğaz onay kutusu ve günün gizli kelimesi, Dertli süre göstergesi, süre uzat/duraklat.

**Oyuncu ekranı:** Kendi kartı (dokununca açılan/gizlenen), oyuncu listesi (kendi bildiği rozetlerle), faz bilgisi + geri sayım, sohbet, eylem alanı, her zaman erişilebilen **Rehber** butonu (Bölüm 14).

**Uyku ekranı:** Gece, sırası gelmeyen herkes için karanlık ekran (sisli köy silueti); bilgi sızdırmayan sabit görünüm.

**Mezarlık (ölüler odası):** Ölen oyuncu otomatik olarak buraya geçer.
- Oyunu canlı izler: fazlar, oylamalar, açılan kartlar; yaşayanların sohbetini okuyabilir ama yazamaz.
- "Mezarlık Sohbeti" kanalında diğer ölülerle yazışır; yaşayanlar bu kanalı göremez.
- Ölülerin tüm rolleri ve gece olaylarını görüp göremeyeceği lobide ayarlanır (varsayılan: açık — "hayalet modu").

**Oyuncu listesi:** Ölen oyuncu gri/pasif görünür, isminin altında açılmış rolü yazar.

## 9. Gulyabani Ortak Kararı
- Gece gulyabani adımında yalnızca yaşayan gulyabanilerin ekranında: yaşayan hedef listesi (moderatör ve gulyabaniler hariç) + aynı ekranda gulyabani sohbeti.
- Her gulyabani bir hedef işaretler; diğerleri kimin kimi işaretlediğini canlı görür.
- Tüm yaşayan gulyabaniler aynı hedefi işaretleyince "Kararı Onayla" aktif olur; onayla karar kilitlenir ve moderatöre iletilir.
- Süre sınırı (varsayılan 90 sn) dolarsa: çoğunluk varsa çoğunluğun hedefi; eşitlikte (ayar) eşitler arasında rastgele / kimse kaçırılmaz.
- **v2 "Ağız Bağlama" varyantı:** Kurbandan sonra gulyabaniler bir kişinin daha ağzını bağlar (kendilerinden biri de olabilir — blöf için). O kişi ertesi gündüz sohbete yazamaz, isminin yanında "Ağzı bağlı" rozeti çıkar; moderatöre "X bugün konuşamaz" hatırlatması gelir.

## 10. Gündüz Oylaması
1. **Oylama:** Yaşayan her oyuncu yaşayan bir oyuncuya oy verir (kendine hayır; "çekimser" ayar). Oylar canlı görünür mü → ayar (varsayılan: canlı).
2. **Sonuç:** En çok oyu alan "sanık" olur. Eşitlik kuralı (ayar):
   - **Köyün en genci:** Lobide moderatörün işaretlediği en genç oyuncunun oyu eşitlikte 2 sayılır.
   - **Yeniden oylama:** Sadece eşitler arasında tekrar oylanır; yine eşitse o gün infaz yok.
3. **Son söz:** Sanığa süre (varsayılan 30 sn) verilir; sohbette yalnızca sanık yazabilir.
4. **Onay oylaması:** Oylar korunarak oylama kısa süre (varsayılan 20 sn) yeniden açılır, oyuncular oyunu değiştirebilir.
   - Sanık hâlâ tek başına en çok oya sahipse → infaz.
   - Çoğunluk bozulursa → yeni sanıkla 3. adıma dön.
   - Bir günde en fazla 2 yeniden oylama; sonrasında o gün infaz yok.
5. **İnfaz:** Kişi oyundan çıkar, kartı herkesin ekranında açılır, Mezarlık'a geçer. Ardından Celalli Damat / sevdalı / Dertli / kazanma kontrolleri çalışır.

## 11. Kazanma Koşulları
Kontrol her ölümden sonra yapılır, şu sırayla:
1. **Dertli:** Dert süresi içinde öldüyse tek başına kazanır, oyun hemen biter.
2. **Karışık sevdalı çift** (biri gulyabani, biri köylü): Sağ kalan son iki kişi onlarsa ikisi kazanır.
3. **Köylüler:** Tüm gulyabaniler öldüyse kazanır.
4. **Gulyabaniler:** Tüm köylüler öldüyse kazanır. **Ayar — erken bitiş:** Yaşayan gulyabani sayısı yaşayan diğerlerinin sayısına eşit veya fazlaysa gulyabaniler kazanır (varsayılan açık).
5. **Sevdalılar:** Oyun kimin zaferiyle biterse bitsin, ikisi de hayattaysa onlar da kazananlar arasında gösterilir.

Oyun sonunda herkesin rolü, sevdalılar, ahbaplar ve gece olay günlüğü herkese açılır.

## 12. Tılsım Kartları (güç kartları) — v2
Moderatör lobide açar/kapatır ve **rollerde olduğu gibi her kartı tek tek aktif/pasif yapar**. Oyuncu sayısına göre uyarı verilir (ör. 6–7 kişide çift ölüm yaratabilecek kartlar önerilmez).

**Genel mekanik:**
- Her oyuncuya rol kartından ayrı olarak desteden 1 tılsım verilir; yalnızca sahibi görür, kullanana kadar gizlidir.
- Tılsım, kullanılabildiği fazlarda "Tılsımı Kullan" butonuyla oynanır; kullanılınca herkes görür.
- **Bir seferlik** (kum saati simgesi): Kullanılınca biter.
- **Kalıcı** (düğüm simgesi): Sahibinin önünde açık kalır; başkasına uygulananlarda hedef her gündüz yeniden seçilir, iki gün üst üste aynı kişiye uygulanamaz.

| Tılsım | Tür | Ne zaman | Etki |
|---|---|---|---|
| **Kara İhbar** | Bir seferlik | Gündüz | Gulyabani olduğundan emin olduğun iki kişiyi ihbar edersin. İkisi de gulyabaniyse köylüler kazanır; değilse sen ölürsün. |
| **Nazar** | Kalıcı | Gündüz | Hedefin karakter yetenekleri oyun boyunca söner (gulyabaniyse gece kaçırma kararına katılamaz); kendi tılsımını yine kullanabilir. |
| **Ant İçirme** | Bir seferlik | Gündüz | Hedefe bir evet/hayır sorusu sorarsın; doğru cevap vermek zorundadır, cevabı herkes görür. Rolle ilgili sorularda cevabı sistem verir, diğerlerinde moderatör doğrular. |
| **Muska** | Bir seferlik | Her an | Oynanmakta olan bir tılsımı durdurur veya kalıcı bir tılsımı iptal eder. |
| **Dilsiz Kuyu** | Kalıcı | Gündüz | Hedef o gündüz sohbete yazamaz. |
| **Sarımsak Örgüsü** | Bir seferlik | Gece başlamadan | O gece gulyabaniler seni kaçıramaz (seçerlerse kimse kaçırılmaz). |
| **Horoz Ötüşü** | Bir seferlik | Gece başlamadan | Sabah erken gelir: o gece gulyabaniler kimseyi kaçıramaz. Kimin oynadığı herkese açıktır. |
| **Muhtar Mührü** | Bir seferlik | Oylamada | O oylamada oyun 2 sayılır. |
| **Tellal** | Bir seferlik | Sanık olduğunda | Son söz süren ikiye katlanır ve onay oylaması zorunlu olarak sıfırdan yapılır. |
| **Kulak Misafiri** | Bir seferlik | Gece | O gece gulyabani sohbetinin son 3 mesajını isimsiz olarak görürsün. |

Kart motoru, yeni tılsımların veri olarak (ad, tür, hedef tipi, oynanabildiği fazlar, etki) eklenebileceği şekilde tasarlanmalı.

## 13. Kart Tasarımları
**Görsel dil (özgün, piyasadaki oyunlardan ayrışan):**
- **Üslup:** Anadolu baskı resmi / linol baskı hissi — kalın konturlar, düz renk alanları, hafif kâğıt dokusu. Çizgi film (cartoon) üslubu kullanılmaz.
- **Palet:** Gece çivit mavisi ve kömür siyahı zemin, gaz lambası kehribarı ışıklar, kart taraf rengi (kızıl / çivit / mor) çerçevede.
- **Çerçeve:** Kenarlarda taraf rengine boyanmış ince kilim motifi bordür; köşelerde göz/nazar, el, bereket gibi motiflerden taraf simgesi.
- **Kart yapısı (ön yüz):** Üstte karakter adı → ortada illüstrasyon → altta taraf etiketi ve simge → kısa yetenek metni (en fazla 2 satır) → italik tek satırlık atmosfer sözü.
- **Arka yüz:** Herkeste aynı: sisli köy silueti, dolunay, ortada kilim motifli madalyon.
- **Tılsım kartları:** Dikey değil kare format, el yapımı muska/tılsım görünümü; tür simgesi (kum saati / düğüm) sağ üstte.
- **Erişilebilirlik:** Taraf yalnızca renkle değil simgeyle de ayırt edilir (renk körlüğü). Metin kontrastı WCAG AA.

| Karakter | Taraf | İllüstrasyon tarifi | Atmosfer sözü |
|---|---|---|---|
| Gulyabani | Kızıl | Sis içinde, uzun keçe sakallı, ay ışığında parlayan gözlü iri bir gölge; kapının eşiğinde duruyor. | "Kapıyı çalan komşun mu, yoksa…" |
| Boşboğaz Gulyabani | Kızıl | Yarısı köylü yarısı gulyabani yüz; ağzından kelimeler duman gibi çıkıyor. | "Ağzımdan kaçtı vallahi." |
| Köylü | Çivit | Elinde orak, sırtında heybe, yüzünde endişe; arkada kerpiç evler. | "Bu köyde herkes birini tanır, kimse kimseyi bilmez." |
| Bekçi | Çivit | Elinde gaz lambası, sırtında kepenek; boş bir yatağa bakıyor. | "Yatağı boş olanın derdi büyük." |
| Ürkek | Çivit | Yorganın altından tek gözü görünen biri; pencerede bir siluet. | "Görmesem uyuyacaktım…" |
| Ahbaplar | Çivit | Sırt sırta durmuş iki genç; omuzlarında aynı desenli yemeni. | "Biz ikimiz yeteriz." |
| Celalli Damat | Çivit | Bıyıklı, damat kuşaklı, yumruğunu sıkmış ama ayakları birbirine dolanmış. | "Ölürsem yalnız gitmem!" |
| Dertli | Mor | Köy kahvesinin köşesinde, elinde bağlama, başı önde. | "Bu dert beni ya yer ya bitirir." |
| Görücü | Mor | Elinde kırmızı kurdele, iki pencere arasına ip geren yaşlı kadın. | "Kısmetse olur, olmazsa da olur." |

Kart görselleri v1'de SVG ikon + çerçeve + renk ile hazırlanabilir; tam illüstrasyonlar sonradan eklenebilecek şekilde görsel yolu veri dosyasında tutulur.

## 14. Rehber Bölümü (Kartlar ve Nasıl Oynanır)
Ana sayfadan, lobiden ve oyun içinden (alt menüde "Rehber" butonu, oyunu durdurmadan açılan katman olarak) erişilir. Üç sekmesi vardır:

**1. Kartlar**
- Tüm karakterlerin kart galerisi; taraf filtreleri (Gulyabaniler / Köylüler / Bağımsızlar / Tılsımlar).
- Karta dokununca detay: büyük görsel, taraf, tam yetenek açıklaması, ne zaman uyandığı, kazanma koşulu, kısa strateji ipucu (ör. Bekçi için "Sonuçlarını çok açık söylersen sıradaki kurban sen olursun").
- Oda içinde açıldığında üstte "**Bu odada aktif roller**" filtresi varsayılan seçilidir; pasif roller soluk gösterilir.
- Gizlilik: rehberde hiçbir zaman kimin hangi rolde olduğu gösterilmez.

**2. Nasıl Oynanır**
- 1 ekranlık özet: amaç, taraflar, gece/gündüz döngüsü, oylama, kazanma.
- Adım adım anlatım (resimli kısa adımlar): Odaya katıl → Kartına bak → Gece (uyu / sıran gelince seç) → Sabah haberi → Meydan toplantısı → Oylama → Son söz → İnfaz → Kazanan.
- Sık sorulanlar: "Rolümü söyleyebilir miyim?" (söyleyebilirsin ama kartını kimseye gösteremezsin; herkes istediği rolü iddia edebilir), "Öldüm, ne yapacağım?" (Mezarlık), "Sayfam kapandı?" (aynı linkten dön, rolün korunur).
- İlk kez katılan oyunculara lobide bir kez "Nasıl oynanır?" kartı otomatik gösterilir (kapatılabilir).

**3. Moderatör Rehberi**
- Moderatörün her fazda ne yapacağı, örnek anons metinleri, ayarların açıklamaları, sık hatalar (ör. "Anonsları herkes için aynı tonda oku, sesinin yönü ipucu vermesin").

Rehber içeriği (karakter ve tılsım açıklamaları) kart veri dosyasından üretilir; oyun motoru ile rehber aynı kaynağı kullanır, böylece kurallar ve açıklamalar tutarsız olmaz.

## 15. Teknik Gereksinimler
- **Sunucu yetkili (server-authoritative):** Tüm oyun durumu ve kurallar sunucuda. İstemciye yalnızca o kullanıcının görmeye hakkı olan veri gönderilir — başkalarının rolü, sevdalı/ahbap bilgisi, gece sonuçları, gizli kelime vb. hiçbir payload'da sızmamalı.
- **Oyun motoru** saf, test edilebilir bir modül olmalı (rol dağıtımı, rol havuzu doğrulaması, gece çözümü, ölüm tetikleme zinciri, oylama çözümü, kazanma kontrolü) ve altyapıdan bağımsız olmalı. Roller, tılsımlar ve rehber metinleri tek bir veri kaynağında tanımlanmalı.
- **Gerçek zamanlı iletişim:** WebSocket. Tercih: AWS serverless (API Gateway WebSocket API + Lambda + DynamoDB) veya AppSync; alternatifleri artı/eksileriyle öner.
- **Eşzamanlılık:** Aynı anda gelen oylar/seçimler için koşullu yazma veya sürüm kontrolü.
- **Yeniden bağlanma:** Sayfa yenilenince veya bağlantı kopunca oyuncu aynı rol ve durumla geri döner (oturum belirteci tarayıcıda saklanır).
- **Ön yüz:** Mobil öncelikli SPA, Türkçe arayüz, gece/gündüz temalı tasarım. Barındırma: S3 + CloudFront veya Amplify Hosting.
- **Altyapı kodu:** AWS CDK (TypeScript).
- **Ölçek ve maliyet:** Oda başına ≤26 oyuncu, aynı anda ~50 oda. Boştayken maliyet ~0 olmalı. Odalar 24 saat sonra otomatik silinir (TTL).
- **Gizlilik:** Kişisel veri toplanmaz; yalnızca nick. Sohbetler oda silinince silinir.

## 16. Kabul Kriterleri (örnek)
- Oda kurucusu Boşboğaz Gulyabani'yi pasif yaparsa destede Boşboğaz bulunmaz ve gece akışında Boşboğaz adımı gösterilmez.
- Gulyabani ve Köylü anahtarları kapatılamaz; Ahbaplar açılınca destede 2 Ahbap bulunur.
- Aktif roller + gulyabaniler oyuncu sayısını aşınca "Başlat" pasif olur ve neden yazar.
- Lobideki oyuncular aktif rollerin listesini görür; kimin hangi rolde olacağını göremez.
- Rehber'in Kartlar sekmesi oda içinde açıldığında yalnızca aktif roller vurgulanır.
- Bir köylünün tarayıcısına giden hiçbir mesajda başka oyuncunun rolü bulunmaz.
- Bekçinin sorgu sonucu yalnızca bekçiye ve moderatöre ulaşır; Boşboğaz sorgulandığında "gulyabani" döner.
- Sevdalılardan biri gece kaçırılınca diğeri de aynı sabah ölür ve iki kart da açılır.
- Celalli Damat infaz edilince bir kişiyi seçip götürebilir; seçilen kişi sevdalıysa onun sevdalısı da ölür.
- Dertli 2. gündüz sonuna kadar infaz edilirse "Dertli kazandı" ekranı herkeste görünür.
- Boşboğaz gizli kelimeyi söylemezse (kutu boş) gece başında ölür.
- Ürkek 1. gece "pencereden bak" seçeneğini göremez, 2. geceden itibaren görür.
- Gulyabaniler farklı hedef işaretlediğinde onay butonu pasif kalır.
- Onay oylamasında çoğunluk bozulursa yeniden oylama başlar; günde 2 yeniden oylamadan sonra infaz yapılmaz.
- Ölen oyuncu Mezarlık'a geçer, yaşayanların sohbetine yazamaz; yaşayanlar Mezarlık Sohbeti'ni göremez.
- Oyuncu sayfayı yenilediğinde rolünü ve oyun durumunu kaybetmez.
- Bot oyuncularla, farklı rol havuzu kombinasyonlarında tam bir oyunu baştan sona simüle eden otomatik uçtan uca test bulunur.

## 17. Açık Sorular (bana sor)
- Oyunun nihai adı: "Gulyabani–Köylü" mü, daha ayırt edici bir ad mı (ör. "Gulyabani Köyü", "Sisli Köy", "Gece Yarısı Köyü")?
- "İlk gece kimse kaçırılmaz" varsayılan açık kalsın mı?
- Eşitlikte varsayılan kural: "köyün en genci" mi, yeniden oylama mı?
- Oylar canlı mı görünsün, gizli mi?
- Ürkek'in fark edilme olasılığı ve uyarının ismi içerip içermeyeceği.
- Mezarlık "hayalet modu" varsayılan açık mı?
- Boşboğaz için "her gün yeni gizli kelime" varsayılan açık mı?
- v2 ek rolleri (Bölüm 6.4) ve tılsım listesi (Bölüm 12) onaylanacak.
