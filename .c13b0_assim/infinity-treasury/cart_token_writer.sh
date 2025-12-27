#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "[∞] Usage: ./cart_token_writer.sh \"RESEARCH TOPIC\""
  exit 1
fi

TOPIC="$1"
ROOT="$HOME/mongoose.os"
OUT="$ROOT/infinity_tokens"
TMP="$OUT/_build"
TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
TOKEN_ID="INF-RES-$(date -u +%Y%m%d%H%M%S)"

mkdir -p "$OUT" "$TMP"

echo "[∞] Token build started: $TOKEN_ID"
echo "[∞] Topic: $TOPIC"
echo "[∞] Timestamp: $TS"

# 1. Collect candidate files
echo "[∞] Scanning mongoose.os files..."
find "$ROOT" \
  -type f \
  \( -name "*.py" -o -name "*.md" -o -name "*.txt" -o -name "*.json" \) \
  ! -path "*/.git/*" \
  ! -path "*/node_modules/*" \
  > "$TMP/all_sources.list"

# 2. Filter by topic relevance (lightweight grep)
echo "[∞] Filtering by topic..."
grep -i -l "$TOPIC" $(cat "$TMP/all_sources.list") 2>/dev/null \
  > "$TMP/sources.list" || true

if [ ! -s "$TMP/sources.list" ]; then
  echo "[∞] No direct matches found — falling back to core files"
  head -n 25 "$TMP/all_sources.list" > "$TMP/sources.list"
fi

# 3. Build research body incrementally
echo "[∞] Building research body..."
OUT_MD="$TMP/research.md"

{
  echo "# Infinity Research Token"
  echo
  echo "**Topic:** $TOPIC"
  echo "**Token ID:** $TOKEN_ID"
  echo "**Generated:** $TS"
  echo
  echo "## Source Files"
} > "$OUT_MD"

while read -r f; do
  echo "[∞] Processing: ${f#$ROOT/}"
  {
    echo
    echo "### File: ${f#$ROOT/}"
    echo '```'
    sed 's/\r$//' "$f" | head -n 200
    echo '```'
  } >> "$OUT_MD"
done < "$TMP/sources.list"

# 4. Hash the research
echo "[∞] Hashing token..."
HASH="$(sha256sum "$OUT_MD" | awk '{print $1}')"

# 5. Emit token file
TOKEN_FILE="$OUT/${TOKEN_ID}.txt"
{
  echo "INFINITY RESEARCH TOKEN"
  echo "======================="
  echo
  echo "Token ID : $TOKEN_ID"
  echo "Topic    : $TOPIC"
  echo "Timestamp: $TS"
  echo "Hash     : $HASH"
  echo
  echo "Verification:"
  echo "sha256sum ${TOKEN_ID}.md == $HASH"
} > "$TOKEN_FILE"

# 6. Finalize
cp "$OUT_MD" "$OUT/${TOKEN_ID}.md"
rm -rf "$TMP"

echo "[∞] Token complete."
echo "[∞] Token file: $TOKEN_FILE"
echo "[∞] Research  : $OUT/${TOKEN_ID}.md"
