#!/usr/bin/env bash
# Elle geri alma (cicd-pipeline.md "Geri Alma"): sahibin onayıyla, sunucudaki bir önceki sürüm
# klasörüne aynı adımlarla dönülür; indirme gerekmez. İnceleme bulgusu: yeniden başlatmadan
# önce activeMatches 0 beklenir. Kullanım: scripts/rollback.sh [vX.Y.Z]
# (sürüm verilmezse çalışan sürümden bir önceki klasör seçilir)
set -euo pipefail

# shellcheck source=lib/release-common.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib/release-common.sh"
load_release_env

CURRENT_VERSION="$(remote "basename \"\$(readlink -f $CURRENT)\"")"
TARGET="${1:-}"
if [[ -z "$TARGET" ]]; then
  TARGET="$(remote "ls -1t $RELEASES | grep -v '^\\.' | grep -vx '$CURRENT_VERSION' | head -n 1" || true)"
fi
[[ -n "$TARGET" ]] || fail "dönülecek sürüm klasörü yok"
[[ "$TARGET" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail "geçersiz sürüm: $TARGET"
remote "test -d $RELEASES/$TARGET" || fail "sunucuda $TARGET klasörü yok; scripts/deploy.sh $TARGET kullanın"

say "Geri alma: $CURRENT_VERSION → $TARGET"
say "Oyun denetimi (activeMatches 0 bekleniyor)"
wait_for_no_games

say "Geçiş ve yeniden başlatma"
switch_to "$TARGET"

say "Sağlık bekleme ve yayın sonrası kontrol"
wait_internal_health "$TARGET" || fail "$TARGET iç sağlık kontrolünü geçemedi"
if ! external_check "$TARGET"; then
  inside_check "$TARGET" && { echo "UYARI: dış kontrol başarısız, iç kontrol geçti (sahibin ağı)."; exit 4; }
  fail "$TARGET yayın sonrası kontrolü geçemedi"
fi
echo "Geri alma tamam: $TARGET çalışıyor."
