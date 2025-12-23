#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱 SAFE PUSH START"

git add \
  *.cart \
  *.cartridge \
  cart*.sh \
  cart*.py \
  CART*.sh \
  CART*.json \
  README.md \
  INFINITY_REPO_INDEX.md \
  site/ || true

if git diff --cached --quiet; then
  echo "Nothing to commit."
  exit 0
fi

TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
git commit -m "auto: safe push $TS"
git push

echo "🧱 SAFE PUSH DONE"
