#!/bin/bash

echo "[∞] Signed Export Push"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[!] Not a git repo"
  exit 1
fi

# find latest export dir
LATEST_EXPORT=$(ls -dt infinity_storage/exports/*/ 2>/dev/null | head -n 1)
if [ -z "$LATEST_EXPORT" ]; then
  echo "[!] No export directory found"
  exit 1
fi

echo "[∞] Latest export:"
echo "    $LATEST_EXPORT"

git status --short

read -p "[∞] Push signed export to GitHub? (y/n): " yn
case $yn in
  [Yy]* ) ;;
  * ) echo "[∞] Cancelled"; exit 0;;
esac

git add cart_INFINITY_SIGNED_EXPORT.py
git add "$LATEST_EXPORT"

git commit -m "Signed export bundle (manifest + sha256)" || {
  echo "[!] Nothing new to commit"
  exit 0
}

git push || {
  echo "[!] Push failed — export remains local"
  exit 0
}

echo "[∞] Signed export pushed successfully"
