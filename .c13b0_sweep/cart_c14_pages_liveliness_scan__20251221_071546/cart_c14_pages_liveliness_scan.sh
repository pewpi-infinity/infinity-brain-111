#!/data/data/com.termux/files/usr/bin/bash

GITHUB_OWNER="pewpi-infinity"
WORK="$HOME/.c14_pages_scan"
OUT_MD="$WORK/lively_pages.md"
OUT_JSON="$WORK/lively_pages.json"

mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

echo "== c14 PAGES LIVENESS SCAN START $(now) =="

gh repo list "$GITHUB_OWNER" \
  --limit 2000 \
  --json name,updatedAt \
  --jq '.[] | .name + "|" + .updatedAt' > repos.txt

echo "# 🧱 Lively Infinity Pages" > "$OUT_MD"
echo "_Generated $(now)_" >> "$OUT_MD"
echo >> "$OUT_MD"

echo "[" > "$OUT_JSON"
FIRST=1

while IFS="|" read -r REPO UPDATED; do
  URL="https://${GITHUB_OWNER}.github.io/${REPO}/"

  HTML=$(curl -L -m 8 -s "$URL")
  [ -z "$HTML" ] && continue

  SCORE=0

  # core checks
  echo "$HTML" | grep -qi "C14_TOKEN_PANEL" && SCORE=$((SCORE+5))
  echo "$HTML" | grep -qi "Token Value" && SCORE=$((SCORE+3))
  echo "$HTML" | grep -qi "🧱" && SCORE=$((SCORE+2))
  echo "$HTML" | grep -qi "<script" && SCORE=$((SCORE+1))
  echo "$HTML" | grep -qi "<img" && SCORE=$((SCORE+1))
  echo "$HTML" | grep -qi "quantum\|vector\|portal\|token" && SCORE=$((SCORE+2))

  SIZE=$(echo "$HTML" | wc -c)
  [ "$SIZE" -gt 3000 ] && SCORE=$((SCORE+2))

  [ "$SCORE" -lt 4 ] && continue

  echo "## $REPO" >> "$OUT_MD"
  echo "- 🔗 $URL" >> "$OUT_MD"
  echo "- ⭐ Score: $SCORE" >> "$OUT_MD"
  echo "- 🕒 Updated: $UPDATED" >> "$OUT_MD"
  echo >> "$OUT_MD"

  if [ "$FIRST" -eq 0 ]; then echo "," >> "$OUT_JSON"; fi
  FIRST=0

  cat <<JSON >> "$OUT_JSON"
  {
    "repo": "$REPO",
    "url": "$URL",
    "score": $SCORE,
    "updated": "$UPDATED"
  }
JSON

done < repos.txt

echo "]" >> "$OUT_JSON"

echo "== c14 PAGES LIVENESS SCAN COMPLETE $(now) =="
echo "Report:"
echo "  - $OUT_MD"
echo "  - $OUT_JSON"
