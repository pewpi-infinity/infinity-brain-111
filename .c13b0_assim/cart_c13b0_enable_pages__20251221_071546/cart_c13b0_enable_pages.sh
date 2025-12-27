#!/data/data/com.termux/files/usr/bin/bash
set -e

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_sweep"

for DIR in "$WORK"/*; do
  [ -d "$DIR/.git" ] || continue
  NAME=$(basename "$DIR")

  echo "🚀 Enabling Pages for $NAME"
  gh api -X POST repos/$OWNER/$NAME/pages \
    -f source.branch=main \
    -f source.path=/ >/dev/null 2>&1 || true
done

echo "🚀 Pages enabled"
