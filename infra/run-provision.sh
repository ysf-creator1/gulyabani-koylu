#!/usr/bin/env bash
# Sahibin bilgisayarından sunucu kurulumunu çalıştırır.
# Kullanım: infra/run-provision.sh [ssh-takma-adı] [alt-adres]
set -euo pipefail

SSH_HOST="${1:-oracle}"
GULYABANI_HOST="${2:-gulyabanikoyu.duckdns.org}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_VERSION="$(tr -d '[:space:]' < "${ROOT}/.nvmrc")"
REMOTE_DIR="/tmp/gulyabani-infra"

ssh "$SSH_HOST" "rm -rf ${REMOTE_DIR} && mkdir -p ${REMOTE_DIR}"
scp -q "${ROOT}"/infra/{provision.sh,Caddyfile,gulyabani.service,journald-gulyabani.conf,sshd-gulyabani.conf} \
  "${SSH_HOST}:${REMOTE_DIR}/"
ssh "$SSH_HOST" "sudo bash ${REMOTE_DIR}/provision.sh '${GULYABANI_HOST}' '${NODE_VERSION}'; rc=\$?; rm -rf ${REMOTE_DIR}; exit \$rc"
