#!/usr/bin/env bash
set -euo pipefail
while true; do
  git add research/*.json logs/provenance.log inputs/*.*
  git commit -m "∞ Research 1MB cadence: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  git pull --rebase origin main || true
  git push origin main || true
  sleep 60
done
