#!/usr/bin/env bash
# Yayın ve geri alma betiklerinin ortak işlevleri (cicd-pipeline.md "Yayın", "Geri Alma").
# Sunucu adresi depoya girmeyen yerel .deploy.env dosyasındadır (sır değildir):
#   DEPLOY_SSH_HOST=oracle                         (ssh takma adı ya da kullanıcı@adres)
#   DEPLOY_PUBLIC_HOST=gulyabanikoyu.duckdns.org   (oyunun dış alt adresi)
# Bu dosya `source` ile yüklenir; kendi başına çalıştırılmaz.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RELEASES=/opt/gulyabani/releases
CURRENT=/opt/gulyabani/current
INTERNAL_HEALTH=http://127.0.0.1:8081/healthz
WAIT_GAMES_MINUTES="${WAIT_GAMES_MINUTES:-30}"

say() { printf '\n==> %s\n' "$*"; }
fail() {
  echo "HATA: $*" >&2
  exit 1
}

load_release_env() {
  [[ -f "$ROOT/.deploy.env" ]] || fail ".deploy.env bulunamadı (DEPLOY_SSH_HOST, DEPLOY_PUBLIC_HOST)"
  # shellcheck disable=SC1091
  source "$ROOT/.deploy.env"
  : "${DEPLOY_SSH_HOST:?DEPLOY_SSH_HOST tanımlı değil}"
  : "${DEPLOY_PUBLIC_HOST:?DEPLOY_PUBLIC_HOST tanımlı değil}"
}

remote() {
  ssh -o BatchMode=yes "$DEPLOY_SSH_HOST" "$@"
}

# İç /healthz'teki etkin oyun sayısı; program yanıt vermiyorsa "none".
active_matches() {
  local body
  body="$(remote "curl -fs --max-time 3 $INTERNAL_HEALTH" 2>/dev/null || true)"
  if [[ -z "$body" ]]; then
    echo none
    return
  fi
  grep -o '"activeMatches":[0-9]*' <<<"$body" | cut -d: -f2
}

# activeMatches 0 olana kadar dakikada bir bekler (en fazla WAIT_GAMES_MINUTES dakika).
# Program yanıt vermiyorsa korunacak oyun yoktur, devam edilir.
wait_for_no_games() {
  local minute count
  for ((minute = 0; minute <= WAIT_GAMES_MINUTES; minute++)); do
    count="$(active_matches)"
    if [[ "$count" == none || "$count" == 0 ]]; then
      return 0
    fi
    echo "Süren oyun var ($count); 1 dakika bekleniyor ($minute/$WAIT_GAMES_MINUTES)."
    sleep 60
  done
  fail "oyun sürüyor, işlem yapılmadı"
}

# Sürüm klasörüne geçiş: version.env ve current bağı tek adımda değişir, hizmet yeniden başlar.
switch_to() {
  local version="$1"
  remote "sudo bash -s" <<EOF
set -euo pipefail
printf 'APP_VERSION=%s\n' '$version' > /etc/gulyabani/version.env.new
chmod 644 /etc/gulyabani/version.env.new
mv -f /etc/gulyabani/version.env.new /etc/gulyabani/version.env
ln -sfn '$RELEASES/$version' '$CURRENT.new'
mv -T '$CURRENT.new' '$CURRENT'
systemctl enable gulyabani >/dev/null 2>&1
systemctl restart gulyabani
EOF
}

# İç /healthz en fazla 60 saniyede 200 ve beklenen sürümü döndürmeli (NFR5.2).
wait_internal_health() {
  local version="$1" i
  for ((i = 0; i < 60; i++)); do
    if remote "curl -fs --max-time 2 $INTERNAL_HEALTH" 2>/dev/null | grep -q "\"version\":\"$version\""; then
      return 0
    fi
    sleep 1
  done
  return 1
}

# Yayın sonrası kontrol (sahibin bilgisayarından, internet üzerinden; team.md Deployment).
external_check() {
  local version="$1" host="https://$DEPLOY_PUBLIC_HOST"
  curl -fs --max-time 10 "$host/healthz" | grep -q "\"version\":\"$version\"" || return 1
  curl -fsI --max-time 10 "$host/" | grep -qi '^content-security-policy:' || return 1
  [[ "$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "http://$DEPLOY_PUBLIC_HOST/")" == 308 ]] || return 1
  (cd "$ROOT" && node scripts/smoke.ts --origin "$host") || return 1
}

# Aynı kontrol sunucunun kendi içinden (Caddy üzerinden, yerel adresle). İnceleme bulgusu R-03:
# dış kontrol yalnızca sahibin ağı yüzünden başarısız olabilir.
inside_check() {
  local version="$1"
  remote "curl -fs --max-time 5 --resolve $DEPLOY_PUBLIC_HOST:443:127.0.0.1 https://$DEPLOY_PUBLIC_HOST/healthz" 2>/dev/null \
    | grep -q "\"version\":\"$version\""
}

# Çalışan sürüm + önceki 2 sürüm tutulur, eskileri silinir.
prune_releases() {
  remote "sudo bash -s" <<EOF
set -euo pipefail
keep="\$(basename "\$(readlink -f '$CURRENT')")"
ls -1t '$RELEASES' | grep -v '^\.' | grep -v "^\$keep\$" | tail -n +3 | while read -r old; do
  rm -rf "$RELEASES/\$old"
done
EOF
}
