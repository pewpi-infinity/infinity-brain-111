#!/usr/bin/env bash
# Discovers all Infinity repos and writes a shared index

BASE="$HOME"
OUT="$BASE/INFINITY_REPO_INDEX.md"

echo "# Infinity Repo Index" > "$OUT"
echo "Generated: $(date -u)" >> "$OUT"
echo >> "$OUT"

for D in "$BASE"/*; do
  if [ -d "$D/.git" ]; then
    NAME=$(basename "$D")
    echo "- $NAME" >> "$OUT"
  fi
done

echo "[∞] Repo index written to $OUT"
