#!/usr/bin/env bash
# Sunucuya yayın (cicd-pipeline.md "Yayın" adım 1–10): sahibin bilgisayarından, sahibin SSH
# anahtarıyla çalışır; yalnızca sahip o sürümün yayınını açıkça onayladıktan sonra.
# Kullanım: scripts/deploy.sh vX.Y.Z [--reinstall]
#   --reinstall: sunucuda aynı sürüm klasörü varsa yeniden yükler (bilerek istenirse).
set -euo pipefail

# shellcheck source=lib/release-common.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/release-common.sh"
load_release_env

VERSION="${1:-}"
REINSTALL="${2:-}"
[[ "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "kullanım: scripts/deploy.sh vX.Y.Z [--reinstall]"
[[ -z "$REINSTALL" || "$REINSTALL" == --reinstall ]] || fail "bilinmeyen seçenek: $REINSTALL"
# Çalışan sürümün klasörü yeniden yazılmaz (inceleme bulgusu): önce başka bir sürüme geçilmelidir.
if [[ "$REINSTALL" == --reinstall ]]; then
  RUNNING="$(remote "if [ -L $CURRENT ]; then basename \"\$(readlink -f $CURRENT)\"; fi")"
  [[ "$RUNNING" != "$VERSION" ]] || fail "$VERSION şu an çalışıyor; çalışan sürüm yeniden yüklenmez"
fi
BUNDLE="gulyabani-${VERSION}-linux-arm64"
REMOTE_TMP="/tmp/gulyabani-upload-${VERSION}"

# 1. İndirme ve doğrulama: uymazsa hiçbir şey değişmez.
say "1/10 Paket indiriliyor ve SHA-256 denetleniyor ($VERSION)"
# Sunucuda aynı anda tek yayın ya da geri alma: kilit klasörü bütün yayın boyunca tutulur
# (inceleme bulgusu; mkdir tek adımda ya oluşturur ya başarısız olur).
LOCK=/run/gulyabani-release.lock
remote "sudo mkdir $LOCK" 2>/dev/null || fail "sunucuda başka bir yayın sürüyor ($LOCK); bitmesini bekleyin"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/gulyabani-release.XXXXXX")"
cleanup_work() {
  remote "sudo rmdir $LOCK" 2>/dev/null || true
  [[ -n "${WORK:-}" && -d "$WORK" ]] && find "$WORK" -mindepth 1 -delete && rmdir "$WORK"
}
trap cleanup_work EXIT
gh release download "$VERSION" --dir "$WORK" --pattern "${BUNDLE}.tar.gz" --pattern "${BUNDLE}.tar.gz.sha256" \
  || fail "GitHub Release $VERSION indirilemedi"
(cd "$WORK" && shasum -a 256 -c "${BUNDLE}.tar.gz.sha256") || fail "SHA-256 uyuşmuyor; yayın yapılmadı"

# 2. Oyun denetimi.
say "2/10 Süren oyun denetimi (activeMatches 0 bekleniyor)"
wait_for_no_games

# 3. Yükleme: geçici klasöre açılır, tek adımda releases/vX.Y.Z adına taşınır (root:root, salt okunur).
say "3/10 Paket sunucuya yükleniyor"
remote "mkdir -p $REMOTE_TMP && chmod 700 $REMOTE_TMP"
scp -q -o BatchMode=yes "$WORK/${BUNDLE}.tar.gz" "$WORK/${BUNDLE}.tar.gz.sha256" "$DEPLOY_SSH_HOST:$REMOTE_TMP/" \
  || fail "paket sunucuya kopyalanamadı"
remote "sudo bash -s" <<EOF || fail "sunucuda yükleme başarısız"
set -euo pipefail
cd '$REMOTE_TMP'
sha256sum -c '${BUNDLE}.tar.gz.sha256'
if [[ -d '$RELEASES/$VERSION' && '$REINSTALL' != '--reinstall' ]]; then
  echo "Sunucuda $VERSION klasörü zaten var; yeniden yüklenmedi."
else
  STAGE='$RELEASES/.incoming-$VERSION'
  rm -rf "\$STAGE"
  mkdir -p "\$STAGE"
  tar -C "\$STAGE" -xzf '${BUNDLE}.tar.gz' --strip-components=1 --no-same-owner
  grep -qx '$VERSION' "\$STAGE/VERSION"
  chown -R root:root "\$STAGE"
  chmod -R u=rwX,go=rX "\$STAGE"
  chmod -R a-w "\$STAGE"
  if [[ -d '$RELEASES/$VERSION' ]]; then
    chmod -R u+w '$RELEASES/$VERSION'
    rm -rf '$RELEASES/$VERSION'
  fi
  chmod u+w "\$STAGE"
  mv -T "\$STAGE" '$RELEASES/$VERSION'
  chmod a-w '$RELEASES/$VERSION'
fi
rm -f '${BUNDLE}.tar.gz' '${BUNDLE}.tar.gz.sha256'
cd /
rmdir '$REMOTE_TMP'
EOF

# 4. Ayar denetimi: oyun kullanıcısıyla ve hizmetin ortam dosyalarıyla; başarısızsa çalışan sürüme dokunulmaz.
say "4/10 Yeni sürümün ayar denetimi (--check-config)"
remote "sudo systemd-run --quiet --wait --pipe --collect \
  -p User=gulyabani -p Group=gulyabani -p UMask=0077 \
  -p StateDirectory=gulyabani -p StateDirectoryMode=0700 \
  -p WorkingDirectory=$RELEASES/$VERSION \
  -p EnvironmentFile=/etc/gulyabani/gulyabani.env -p EnvironmentFile=-/etc/gulyabani/secrets.env \
  --setenv=APP_VERSION=$VERSION \
  /usr/local/bin/node dist/server/main.js --check-config" || fail "$VERSION ayar denetimini geçemedi; çalışan sürüm değişmedi"

# 5. Önceki sürümün kaydı (ilk kurulumda boş).
PREV="$(remote "if [ -L $CURRENT ]; then basename \"\$(readlink -f $CURRENT)\"; fi")"
say "5/10 Önceki sürüm: ${PREV:-yok (ilk kurulum)}"

# 6. Son oyun denetimi: bağ değişmeden hemen önce; 0 değilse yeniden beklenir.
say "6/10 Son oyun denetimi"
count="$(active_matches)"
if [[ "$count" != none && "$count" != 0 ]]; then
  wait_for_no_games
fi

# 7. Geçiş (ilk yayında hizmeti etkinleştirir).
say "7/10 Geçiş ve yeniden başlatma"
START="$(date +%s)"
switch_to "$VERSION"

# Otomatik geri alma: önceki sürüm varsa ona dönülür ve 8–9. adımlar onun için yeniden
# çalışır (inceleme bulgusu); önceki sürüm yoksa hizmet durdurulur.
auto_rollback() {
  local reason="$1"
  if [[ -n "$PREV" && "$PREV" != "$VERSION" ]]; then
    say "Otomatik geri alma: $VERSION → $PREV ($reason)"
    switch_to "$PREV"
    wait_internal_health "$PREV" || fail "geri alma sonrası $PREV de sağlıklı değil; elle bakılmalı"
    if ! external_check "$PREV" && ! inside_check "$PREV"; then
      fail "geri alma sonrası $PREV yayın sonrası kontrolü de geçemedi; elle bakılmalı"
    fi
    fail "$VERSION yayınlanamadı ($reason); $PREV yeniden çalışıyor ve kontrolden geçti"
  fi
  remote "sudo systemctl stop gulyabani" || true
  fail "$VERSION yayınlanamadı ($reason); önceki sürüm olmadığı için hizmet durduruldu"
}

# 8. Sağlık bekleme (NFR5.2).
say "8/10 Sağlık bekleme (en fazla 60 sn)"
wait_internal_health "$VERSION" || auto_rollback "iç sağlık kontrolü geçmedi"
DOWNTIME=$(($(date +%s) - START))

# 9. Yayın sonrası kontrol (internet üzerinden). Dış kontrol başarısız, iç kontrol başarılıysa
# sorun büyük olasılıkla sahibin ağındadır: geri alınmaz, uyarı verilir (inceleme bulgusu R-03).
say "9/10 Yayın sonrası kontrol (https://$DEPLOY_PUBLIC_HOST)"
if ! external_check "$VERSION"; then
  if inside_check "$VERSION"; then
    echo "UYARI: dış kontrol başarısız, sunucu içinden kontrol geçti (sahibin ağı olabilir). Geri alınmadı."
    prune_releases
    exit 4
  fi
  auto_rollback "yayın sonrası kontrol geçmedi"
fi

# 10. Sonuç: çalışan + önceki 2 sürüm tutulur.
say "10/10 Eski sürüm klasörleri temizleniyor"
prune_releases
echo
echo "Yayın tamam: $VERSION çalışıyor (önceki: ${PREV:-yok}, kesinti yaklaşık ${DOWNTIME} sn)."
echo "Kontroller: iç sağlık, dış sağlık, CSP başlığı, http→https yönlendirme, duman testi geçti."
