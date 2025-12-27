#!/usr/bin/env bash
# Push all Infinity repos automatically

BASE="$HOME"

for D in "$BASE"/infinity*; do
  if [ -d "$D/.git" ]; then
    echo
    echo "[∞] Processing repo: $(basename "$D")"
    cd "$D" || continue

    git add -A
    if git diff --cached --quiet; then
      git commit --allow-empty -m "∞ pulse: auto-sync" || true
    else
      git commit -m "∞ auto-sync carts"
    fi

    git push origin main || echo "[!] Push failed for $D"
  fi
done

echo
echo "[∞] All repos processed"
