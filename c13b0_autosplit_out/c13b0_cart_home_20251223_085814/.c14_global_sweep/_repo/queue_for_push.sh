#!/usr/bin/env bash
set -euo pipefail

PATHS=("$@")
QUEUE=".pushqueue/queue.list"
mkdir -p .pushqueue
: > "$QUEUE"

# Stage paths and build a push batch not exceeding ~1 MB
MAX=$((1024*1024))
ACC=0

for p in "${PATHS[@]}"; do
  [ -e "$p" ] || { echo "SKIP missing: $p"; continue; }
  s=$(wc -c < "$p")
  if [ $((ACC + s)) -gt $MAX ]; then
    echo "LIMIT reached: batch ~${ACC} bytes"
    break
  fi
  echo "$p" >> "$QUEUE"
  ACC=$((ACC + s))
done

echo "$(date -Iseconds) | QUEUE | files=$(wc -l < "$QUEUE") | bytes=$ACC" | tee -a logs/provenance.log
printf "%s\n" "$QUEUE"
