#!/usr/bin/env bash
# Birleştirme kapısı (cicd-pipeline.md "Birleştirme Kapısı"): PR olmadığı için kapı bu betiktir.
# Yalnızca sahibin parçayı AI-DLC onay noktasında onaylamasından sonra çalıştırılır.
# Kullanım: scripts/merge-bolt.sh <bolt-slug>     (ör. b1-walking-skeleton)
# İlk başarısız denetimde hiçbir şey değiştirmeden çıkar ve nedeni yazar.
set -euo pipefail

SLUG="${1:?Kullanım: scripts/merge-bolt.sh <bolt-slug>}"
BRANCH="bolt/${SLUG}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail() {
  echo "Birleştirme yapılmadı: $*" >&2
  exit 1
}

# 1. Çalışma ağacı temiz; dal yerelde ve uzakta aynı commit'te
[[ -z "$(git status --porcelain)" ]] || fail "çalışma ağacı temiz değil"
git fetch --quiet origin
git rev-parse --verify --quiet "$BRANCH" >/dev/null || fail "yerel dal yok: $BRANCH"
git rev-parse --verify --quiet "origin/$BRANCH" >/dev/null || fail "uzak dal yok: origin/$BRANCH"
HEAD_SHA="$(git rev-parse "$BRANCH")"
[[ "$HEAD_SHA" == "$(git rev-parse "origin/$BRANCH")" ]] || fail "yerel ve uzak dal farklı commit'te"

# 2. Dal güncel: origin/main dalın başının atası olmalı
if ! git merge-base --is-ancestor origin/main "$BRANCH"; then
  echo "Dal main'in gerisinde; main üzerine yeniden kuruluyor ve gönderiliyor."
  git checkout --quiet "$BRANCH"
  git rebase origin/main
  git push --force-with-lease origin "$BRANCH"
  echo "CI'nin yeni baş commit için yeşil olmasını bekleyip betiği yeniden çalıştırın."
  exit 3
fi

# 3. Baş commit için tamamlanmış ve başarılı ci.yml çalıştırması
command -v gh >/dev/null || fail "gh komutu bulunamadı"
RUNS="$(gh run list --workflow ci.yml --branch "$BRANCH" --limit 30 --json headSha,status,conclusion \
  --jq ".[] | select(.headSha == \"$HEAD_SHA\") | \"\(.status) \(.conclusion)\"")"
grep -q '^completed success$' <<<"$RUNS" || fail "baş commit ($HEAD_SHA) için başarılı CI çalıştırması yok"

# 4. Squash: parçanın adını taşıyan tek commit
git checkout --quiet main
git pull --quiet --ff-only origin main
git merge --squash "$BRANCH"
git commit -m "$SLUG"
git push origin main

# 5. Geçici dal yerelde ve uzakta silinir
git branch -D "$BRANCH"
git push origin --delete "$BRANCH"
echo "Birleştirildi: $SLUG → main ($(git rev-parse --short HEAD))"
