#!/bin/bash
cd "$(dirname "$0")/.."

git add bitcoin/ledger bitcoin/research
git commit -m "∞BTC: brain cycle $(date +%s)" >/dev/null 2>&1
git push >/dev/null 2>&1

echo "[GIT] Brain state pushed"
