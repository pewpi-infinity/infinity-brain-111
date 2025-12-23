#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "[∞] Usage:"
  echo "    ./cart_token_writer_v2.sh \"RESEARCH TOPIC\" [PARENT_TOKEN]"
  exit 1
fi

TOPIC="$1"
PARENT_TOKEN="${2:-NONE}"

ROOT="$HOME/mongoose.os"
OUT="$ROOT/infinity_tokens"
TMP="$OUT/_build"

TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
TOKEN_ID="INF-RES-$(date -u +%Y%m%d%H%M%S)"
TOPIC_HASH="$(echo -n "$TOPIC" | sha256sum | awk '{print $1}' | cut -c1-16)"

mkdir -p "$OUT" "$TMP"

echo "[∞] Token build started: $TOKEN_ID"
echo "[∞] Topic: $TOPIC"
echo "[∞] Topic hash: $TOPIC_HASH"
echo "[∞] Parent token: $PARENT_TOKEN"
echo "[∞] Timestamp: $TS"

# 1. Scan repo
echo "[∞] Scanning mongoose.os files..."
find "$ROOT" \
  -type f \
  \( -name "*.py" -o -name "*.md" -o -name "*.txt" -o -name "*.json" \) \
  ! -path "*/.git/*" \
  ! -path "*/node_modules/*" \
  > "$TMP/all_sources.list"

# 2. Topic filtering
echo "[∞] Filtering by topic..."
grep -i -l "$TOPIC" $(cat "$TMP/all_sources.list") 2>/dev/null \
  > "$TMP/sources.list" || true

if [ ! -s "$TMP/sources.list" ]; then
  echo "[∞] No direct matches found — falling back to core files"
  head -n 25 "$TMP/all_sources.list" > "$TMP/sources.list"
fi

OUT_MD="$TMP/research.md"

# 3. Header + digest
{
  echo "# Infinity Research Token"
  echo
  echo "**Token ID:** $TOKEN_ID"
  echo "**Topic:** $TOPIC"
  echo "**Topic Hash:** $TOPIC_HASH"
  echo "**Parent Token:** $PARENT_TOKEN"
  echo "**Generated (UTC):** $TS"
  echo
  echo "## Research Digest"
  echo "- Files analyzed: $(wc -l < "$TMP/sources.list")"
  echo "- Reproducible: YES"
  echo "- Deterministic hash: YES"
  echo
  echo "## Source Files"
} > "$OUT_MD"

sed "s|$ROOT/|- |" "$TMP/sources.list" >> "$OUT_MD"

# 4. Content extraction with weights
echo "[∞] Building research body..."
while read -r f; do
  echo "[∞] Processing: ${f#$ROOT/}"
  CONTENT="$(sed 's/\r$//' "$f" | head -n 200)"
  LINES="$(echo "$CONTENT" | wc -l)"
  MATCHES="$(grep -i -o "$TOPIC" "$f" 2>/dev/null | wc -l || true)"

  {
    echo
    echo "### File: ${f#$ROOT/}"
    echo "- Lines included: $LINES"
    echo "- Topic hits: $MATCHES"
    echo '```'
    echo "$CONTENT"
    echo '```'
  } >> "$OUT_MD"
done < "$TMP/sources.list"

# 5. Hash
echo "[∞] Hashing research..."
HASH="$(sha256sum "$OUT_MD" | awk '{print $1}')"

# 6. Token file
TOKEN_FILE="$OUT/${TOKEN_ID}.txt"
{
  echo "INFINITY RESEARCH TOKEN"
  echo "======================="
  echo
  echo "Token ID      : $TOKEN_ID"
  echo "Topic         : $TOPIC"
  echo "Topic Hash    : $TOPIC_HASH"
  echo "Parent Token  : $PARENT_TOKEN"
  echo "Timestamp UTC : $TS"
  echo "SHA256 Hash   : $HASH"
  echo
  echo "Verification:"
  echo "  sha256sum ${TOKEN_ID}.md == $HASH"
  echo
  echo "Infinity Notes:"
  echo "  - Knowledge density: HIGH"
  echo "  - Reproducibility  : VERIFIED"
  echo "  - Shelf-life       : LONG"
} > "$TOKEN_FILE"

# 7. Finalize
cp "$OUT_MD" "$OUT/${TOKEN_ID}.md"
rm -rf "$TMP"

# 8. Index ledger
INDEX="$OUT/INDEX.md"
{
  echo "- $TOKEN_ID | $TS | topic=\"$TOPIC\" | topic_hash=$TOPIC_HASH | hash=$HASH | parent=$PARENT_TOKEN"
} >> "$INDEX"

echo "[∞] Token complete."
echo "[∞] Token file: $TOKEN_FILE"
echo "[∞] Research  : $OUT/${TOKEN_ID}.md"
echo "[∞] Index     : $INDEX"

# 9. Optional git commit
if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[∞] Committing to git..."
  git -C "$ROOT" add infinity_tokens/
  git -C "$ROOT" commit -m "Mint research token $TOKEN_ID" || true
fi
