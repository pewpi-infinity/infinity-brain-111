#!/usr/bin/env bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "[∞] Usage: ./cart_token_compare.sh TOKEN_A.md TOKEN_B.md"
  exit 1
fi

A="$1"
B="$2"

echo "[∞] Comparing tokens:"
echo "  A: $A"
echo "  B: $B"
echo

echo "=== Topic & Metadata ==="
grep -E "Topic:|Topic Hash:|Parent Token:" "$A" || true
echo "---"
grep -E "Topic:|Topic Hash:|Parent Token:" "$B" || true
echo

echo "=== File Overlap ==="
grep "^### File:" "$A" | sed 's/### File: //' | sort > /tmp/a.files
grep "^### File:" "$B" | sed 's/### File: //' | sort > /tmp/b.files
comm -12 /tmp/a.files /tmp/b.files || echo "(none)"
echo

echo "=== Diff Summary (trimmed) ==="
diff -u <(sed -n '1,200p' "$A") <(sed -n '1,200p' "$B") || true
