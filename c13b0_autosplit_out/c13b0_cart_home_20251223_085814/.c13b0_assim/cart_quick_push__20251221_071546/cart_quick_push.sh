#!/data/data/com.termux/files/usr/bin/bash
set -e

[ -d .git ] || { echo "NOT A GIT REPO"; exit 1; }

TS=$(date +%Y%m%d_%H%M%S)
OUT=run_$TS.txt
echo "RUN $TS" > "$OUT"

git add "$OUT" "$0"
git commit -m "run $TS" || true
git push
echo "OK"
