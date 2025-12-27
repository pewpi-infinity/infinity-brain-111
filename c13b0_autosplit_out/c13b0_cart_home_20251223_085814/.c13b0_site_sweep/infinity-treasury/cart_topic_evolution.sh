#!/usr/bin/env bash
set -euo pipefail

INDEX="$HOME/mongoose.os/infinity_tokens/INDEX.md"

if [ ! -f "$INDEX" ]; then
  echo "[∞] No INDEX.md found"
  exit 1
fi

echo "[∞] Topic evolution map:"
echo

awk -F'\\|' '
{
  for (i=1;i<=NF;i++) {
    if ($i ~ /topic_hash=/) {
      split($i,a,"=");
      hash=a[2]
    }
  }
  printf "%s | %s\n", hash, $0
}' "$INDEX" | sort
