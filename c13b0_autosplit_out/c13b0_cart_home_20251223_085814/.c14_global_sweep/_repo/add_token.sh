#!/usr/bin/env bash
set -euo pipefail

CHAIN="${1:?Chain number}"
TOKEN="${2:?Token number}"
REF_PAGE="${3:?Reference page path (research/...txt)}"
PRICE="${4:-"ask"}"
NOTE="${5:-""}"

OUTDIR="tokens/CHAIN-${CHAIN}"
OUT="${OUTDIR}/TOKEN-${TOKEN}.json"
mkdir -p "$OUTDIR"

jq -n \
  --arg chain "$CHAIN" \
  --arg token "$TOKEN" \
  --arg ref "$REF_PAGE" \
  --arg price "$PRICE" \
  --arg note "$NOTE" \
  '{
    chain: $chain,
    token: $token,
    ref_page: $ref,
    price: $price,
    note: $note,
    kind: "key-to-research",
    version: 1
  }' > "$OUT"

echo "$(date -Iseconds) | TOKEN | $OUT | bytes=$(wc -c < "$OUT") | ref=$REF_PAGE" | tee -a logs/provenance.log
printf "%s\n" "$OUT"
