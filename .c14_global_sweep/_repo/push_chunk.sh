#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"
QUEUE=".pushqueue/queue.list"

[ -f "$QUEUE" ] || { echo "No queue found"; exit 1; }

git checkout -B "$BRANCH" >/dev/null 2>&1 || true

# Stage queued files
while IFS= read -r f; do
  git add "$f"
done < "$QUEUE"

# Always include logs and link index changes
git add logs/provenance.log links/**/INDEX.json 2>/dev/null || true

MSG="chunk:$(date -Iseconds) <=1MB"
git commit -m "$MSG" || echo "No changes to commit"

BYTES=$(awk '{sum+=length($0)+1} END{print sum}' "$QUEUE")
echo "$(date -Iseconds) | PUSH | branch=$BRANCH | bytes~$BYTES | msg=$MSG" | tee -a logs/provenance.log

git push -u origin "$BRANCH"

# Clear queue
: > "$QUEUE"
