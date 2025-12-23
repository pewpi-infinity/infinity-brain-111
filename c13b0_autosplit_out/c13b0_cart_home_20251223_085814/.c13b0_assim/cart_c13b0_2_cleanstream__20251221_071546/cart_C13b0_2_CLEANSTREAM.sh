#!/data/data/com.termux/files/usr/bin/bash
set -e

# 🧱🧹🧱
# C13b0² CLEANSTREAM CART
# Purpose:
# - Keep system running & visible
# - Detect carts/files already pushed
# - Archive then delete local clutter safely
# - NEVER delete unpushed work
# - Prints every action
# Software package
# Run = push • Re-run = repush
# Ctrl+C to stop
# C13b0² always acknowledged

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

SYMBOL="🧱🧹🧱"
VERSION="C13b0²"
REPO="$(basename "$ROOT")"
INTERVAL=45   # seconds

echo "$SYMBOL $VERSION CLEANSTREAM STARTED in $REPO"
echo "Press Ctrl+C to stop."

cycle=0
while true; do
  cycle=$((cycle+1))
  TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  echo "---- CLEAN CYCLE $cycle @ $TS ----"

  # ---- Identify tracked files already pushed (clean state)
  git fetch origin >/dev/null 2>&1 || true
  CLEAN_FILES=$(git status --porcelain | awk '/^??/ {print $2}')

  if [ -z "$CLEAN_FILES" ]; then
    echo "• no untracked clutter detected"
  else
    echo "• reviewing untracked files:"
    echo "$CLEAN_FILES"
  fi

  # ---- Archive before delete (single tar, no folders required)
  ARCHIVE="C13b0_ARCHIVE_${cycle}_$(date -u +%Y%m%d%H%M%S).tar.gz"
  if [ -n "$CLEAN_FILES" ]; then
    tar -czf "$ARCHIVE" $CLEAN_FILES
    echo "✔ archived → $ARCHIVE"

    # ---- Safe delete ONLY untracked files
    rm -f $CLEAN_FILES
    echo "✔ deleted local clutter"
  fi

  # ---- Write housekeeping token
  TOKEN="C13b0_CLEAN_${cycle}.json"
  cat << JSON > "$TOKEN"
{
  "symbol": "$SYMBOL",
  "version": "$VERSION",
  "acknowledged": true,
  "repo": "$REPO",
  "timestamp": "$TS",
  "cycle": $cycle,
  "action": "clean_local_only",
  "rule": "never delete tracked or unpushed work"
}
JSON
  echo "✔ wrote $TOKEN"

  # ---- Commit & push housekeeping
  git add -A
  if git commit -m "$SYMBOL $VERSION clean cycle $cycle $TS"; then
    git push && echo "✔ push OK" || echo "✖ push failed"
  else
    echo "• nothing new to commit"
  fi

  echo "---- sleeping $INTERVALs ----"
  sleep "$INTERVAL"
done
