#!/bin/bash

echo "[∞] Infinity Web Push"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[!] Not a git repository"
  exit 1
fi

git status --short

read -p "[∞] Push artifact + index to GitHub? (y/n): " yn
case $yn in
  [Yy]* ) ;;
  * ) echo "[∞] Cancelled"; exit 0;;
esac

git add cart_INFINITY_ARTIFACT_WEB.py
git add infinity_storage/index
git add infinity_storage/web

git commit -m "Infinity+ artifact web (read-only index)" || {
  echo "[!] Nothing new to commit"
  exit 0
}

git push || {
  echo "[!] Push failed — files remain local"
  echo "[!] Manual upload still possible"
  exit 0
}

echo "[∞] Web artifact pushed successfully"
