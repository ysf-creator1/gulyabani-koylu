#!/usr/bin/env bash
# Gulyabani – Köylü: sunucu kurulum betiği (Oracle Ubuntu 24.04 aarch64).
# Tekrar tekrar çalıştırılabilir (idempotent). Sunucuda kök yetkisiyle, infra/ klasörünün
# bir kopyasından çalışır. Sahibin bilgisayarından kullanım:
#   infra/run-provision.sh            (ssh "oracle" takma adıyla kopyalar ve çalıştırır)
# Doğrudan kullanım (sunucuda):
#   sudo bash provision.sh <alt-adres> <node-sürümü>
# Oyun hizmetini ETKİNLEŞTİRMEZ ve BAŞLATMAZ: ilk yayında yayın betiği yapar
# (henüz /opt/gulyabani/current yokken başlatılırsa hizmet çökme döngüsüne girer).
set -euo pipefail

HOST="${1:?alt adres gerekli, ör. gulyabanikoyu.duckdns.org}"
NODE_VERSION="${2:?Node.js sürümü gerekli, ör. 24.22.2}"
NODE_VERSION="${NODE_VERSION#v}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Bu betik kök yetkisiyle çalışmalı (sudo)." >&2
  exit 1
fi
if [[ "$(uname -m)" != "aarch64" ]]; then
  echo "Beklenen işlemci aarch64, bulunan: $(uname -m)" >&2
  exit 1
fi

say() { printf '\n==> %s\n' "$*"; }
export DEBIAN_FRONTEND=noninteractive

say "Paketler"
apt-get update -q
apt-get install -y -q curl ca-certificates gnupg debian-keyring debian-archive-keyring \
  apt-transport-https xz-utils sqlite3 iptables-persistent netfilter-persistent \
  unattended-upgrades needrestart chrony

say "Caddy deposu ve Caddy"
if [[ ! -f /usr/share/keyrings/caddy-stable-archive-keyring.gpg ]]; then
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/gpg.key \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
fi
if [[ ! -f /etc/apt/sources.list.d/caddy-stable.list ]]; then
  curl -fsSL https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt \
    -o /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -q
fi
apt-get install -y -q caddy

say "Node.js v${NODE_VERSION} (resmî ARM64 paketi, SHA-256 doğrulamalı)"
NODE_DIR="/opt/node/v${NODE_VERSION}"
if [[ ! -x "${NODE_DIR}/bin/node" ]]; then
  TMP="$(mktemp -d)"
  trap 'rm -rf "$TMP"' EXIT
  TARBALL="node-v${NODE_VERSION}-linux-arm64.tar.xz"
  BASE="https://nodejs.org/dist/v${NODE_VERSION}"
  curl -fsSL "${BASE}/${TARBALL}" -o "${TMP}/${TARBALL}"
  curl -fsSL "${BASE}/SHASUMS256.txt" -o "${TMP}/SHASUMS256.txt"
  (cd "$TMP" && grep " ${TARBALL}\$" SHASUMS256.txt | sha256sum -c -)
  mkdir -p "$NODE_DIR"
  tar -xJf "${TMP}/${TARBALL}" -C "$NODE_DIR" --strip-components=1 --no-same-owner
  chown -R root:root "$NODE_DIR"
fi
for bin in node npm npx; do
  ln -sfn "${NODE_DIR}/bin/${bin}" "/usr/local/bin/${bin}"
done
/usr/local/bin/node --version

say "Oyun kullanıcısı ve klasörler"
if ! id gulyabani >/dev/null 2>&1; then
  useradd --system --no-create-home --home-dir /nonexistent --shell /usr/sbin/nologin gulyabani
fi
install -d -o root -g root -m 755 /opt/gulyabani /opt/gulyabani/releases
install -d -o root -g root -m 755 /etc/gulyabani
# Veri klasörü /var/lib/gulyabani'yi systemd (StateDirectory) 700 izinle açar.

say "Ayar dosyaları (/etc/gulyabani)"
umask 077
cat > /etc/gulyabani/gulyabani.env.new <<EOF
PUBLIC_ORIGIN=https://${HOST}
PORT_PUBLIC=8080
PORT_INTERNAL=8081
DATA_DIR=/var/lib/gulyabani
NODE_ENV=production
EOF
install -o root -g root -m 600 /etc/gulyabani/gulyabani.env.new /etc/gulyabani/gulyabani.env
rm -f /etc/gulyabani/gulyabani.env.new
if [[ ! -f /etc/gulyabani/version.env ]]; then
  # Yayın betiği gerçek sürümü yazar
  printf 'APP_VERSION=none\n' > /etc/gulyabani/version.env
fi
chmod 644 /etc/gulyabani/version.env
if [[ -f /etc/gulyabani/secrets.env ]]; then
  chown root:root /etc/gulyabani/secrets.env
  chmod 600 /etc/gulyabani/secrets.env
fi
umask 022

say "Oyun hizmet birimi (etkinleştirilmeden)"
install -o root -g root -m 644 "${HERE}/gulyabani.service" /etc/systemd/system/gulyabani.service

say "Caddy ayarı"
install -d -o root -g root -m 755 /etc/systemd/system/caddy.service.d
cat > /etc/systemd/system/caddy.service.d/gulyabani.conf <<EOF
[Service]
Environment=GULYABANI_HOST=${HOST}
EOF
GULYABANI_HOST="$HOST" caddy validate --adapter caddyfile --config "${HERE}/Caddyfile"
install -o root -g root -m 644 "${HERE}/Caddyfile" /etc/caddy/Caddyfile

say "Sistem günlüğü (7 gün / 200 MB)"
install -d -o root -g root -m 755 /etc/systemd/journald.conf.d
install -o root -g root -m 644 "${HERE}/journald-gulyabani.conf" /etc/systemd/journald.conf.d/gulyabani.conf
systemctl restart systemd-journald

say "Güvenlik güncellemeleri (kendiliğinden yeniden başlatma yok)"
cat > /etc/apt/apt.conf.d/52gulyabani <<'EOF'
Unattended-Upgrade::Automatic-Reboot "false";
EOF
install -d -o root -g root -m 755 /etc/needrestart/conf.d
cat > /etc/needrestart/conf.d/gulyabani.conf <<'EOF'
# Oyun ortasında hizmetler kendiliğinden yeniden başlatılmasın
$nrconf{override_rc}{qr(^gulyabani\.service$)} = 0;
$nrconf{override_rc}{qr(^caddy\.service$)} = 0;
EOF
systemctl enable --now unattended-upgrades >/dev/null

say "SSH (yalnızca anahtar)"
install -o root -g root -m 644 "${HERE}/sshd-gulyabani.conf" /etc/ssh/sshd_config.d/10-gulyabani.conf
sshd -t
systemctl reload ssh

say "Makinenin güvenlik duvarı: 80 ve 443"
for port in 80 443; do
  if ! iptables -C INPUT -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT 2>/dev/null; then
    # Oracle kalıbındaki REJECT kuralının önüne ekle
    reject_line="$(iptables -L INPUT --line-numbers -n | awk '$2=="REJECT"{print $1; exit}')"
    if [[ -n "$reject_line" ]]; then
      iptables -I INPUT "$reject_line" -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT
    else
      iptables -A INPUT -p tcp -m state --state NEW -m tcp --dport "$port" -j ACCEPT
    fi
  fi
done
netfilter-persistent save >/dev/null

say "Hizmetleri yenile"
systemctl daemon-reload
systemctl enable caddy >/dev/null
systemctl restart caddy

say "Kurulum tamam"
echo "Node.js: $(/usr/local/bin/node --version)  Caddy: $(caddy version | cut -d' ' -f1)"
echo "Oyun hizmeti ilk yayında etkinleştirilecek (henüz kurulu sürüm yok)."
