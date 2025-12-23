#!/bin/bash

echo "[∞] Infinity Safe Push"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[!] Not a git repo. Exiting."
  exit 1
fi

git status --short

read -p "[∞] Continue with add/commit? (y/n): " yn
case $yn in
  [Yy]* ) ;;
  * ) echo "[∞] Cancelled"; exit 0;;
esac

git add infinity_storage || exit 1
git add cart_INFINITY_PLUS_INDEX_BUILDER.py || true
git add cart_INFINITY_PLUS_RESEARCH.py || true

git commit -m "Infinity+ pipeline: research + index actuator" || {
  echo "[!] Nothing to commit"
  exit 0
}

echo "[∞] Attempting push..."
git push || {
  echo "[!] Push failed — files are safe locally"
  echo "[!] You can manually upload if needed"
  exit 0
}

echo "[∞] Push complete"
