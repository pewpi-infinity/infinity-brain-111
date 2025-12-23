#!/usr/bin/env bash
set -euo pipefail

mkdir -p research tokens links logs storage .pushqueue
touch logs/provenance.log
git init >/dev/null 2>&1 || true

echo "$(date -Iseconds) | SETUP | repo initialized, dirs ready" | tee -a logs/provenance.log
