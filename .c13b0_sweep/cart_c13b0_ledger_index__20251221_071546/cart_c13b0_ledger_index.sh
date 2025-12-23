#!/data/data/com.termux/files/usr/bin/bash
set -e

mkdir -p ledger

echo "[" > ledger/index.json
FIRST=1

for f in ledger/*.md; do
  [ -f "$f" ] || continue
  TS=$(basename "$f" .md)
  [ "$FIRST" -eq 0 ] && echo "," >> ledger/index.json
  FIRST=0
  cat <<JSON >> ledger/index.json
  {
    "date": "$TS",
    "file": "$f"
  }
JSON
done

echo "]" >> ledger/index.json
