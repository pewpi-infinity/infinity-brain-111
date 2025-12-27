#!/data/data/com.termux/files/usr/bin/bash
set -e

mkdir -p token

# Normalize case + location
if [ -f TOKEN.md ] && [ ! -f token/TOKEN.md ]; then
  mv TOKEN.md token/TOKEN.md
fi

if [ ! -f token/TOKEN.md ]; then
  cat <<MD > token/TOKEN.md
# 🧱 c13b0 Token
Status: initialized
MD
fi

# Machine-readable state
cat <<JSON > token/state.json
{
  "issued": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "anchor": "token/TOKEN.md",
  "ledger": "ledger/index.json"
}
JSON

# Stable pointer (index always reads this)
echo "TOKEN.md" > token/latest.txt
