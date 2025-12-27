#!/usr/bin/env bash
set -euo pipefail

CHAIN="${1:?Chain number}"
FROM="${2:?From path}"
TO="${3:?To path}"

OUTDIR="links/CHAIN-${CHAIN}"
INDEX="${OUTDIR}/INDEX.json"
mkdir -p "$OUTDIR"

# Initialize index if absent
if [ ! -f "$INDEX" ]; then
  printf "%s\n" '{"chain":"","links":[]}' > "$INDEX"
  tmp=$(mktemp)
  jq --arg chain "$CHAIN" '.chain = $chain' "$INDEX" > "$tmp" && mv "$tmp" "$INDEX"
fi

tmp=$(mktemp)
jq --arg from "$FROM" --arg to "$TO" \
  '.links += [{from:$from,to:$to,timestamp: (now|todate)}]' "$INDEX" > "$tmp" && mv "$tmp" "$INDEX"

echo "$(date -Iseconds) | LINK | CHAIN-${CHAIN} | from=$FROM | to=$TO" | tee -a logs/provenance.log
printf "%s\n" "$INDEX"
