#!/usr/bin/env bash
# Push all carts and changes safely

set -e

if [ ! -d ".git" ]; then
  echo "[!] Not inside a git repo"
  exit 1
fi

TS=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

git add -A

if git diff --cached --quiet; then
  echo "[∞] No file changes — creating pulse commit"
  git commit --allow-empty -m "∞ pulse: sync @ $TS" || true
else
  git commit -m "∞ sync carts @ $TS"
fi

git push origin main || {
  echo "[!] Push failed — check auth or network"
  exit 1
}

echo "[∞] Push complete"
