#!/bin/bash

# -----------------------------
# Infinity Controlled Git Push
# -----------------------------

PUSH_INTERVAL=3600   # seconds between pushes (1 hour)
LOCK_FILE="infinity_storage/logs/push.lock"
LOG_FILE="infinity_storage/logs/push.log"
STATE_FILE="infinity_storage/logs/last_push.time"

SAFE_PATHS=(
  "cart_"
  "infinity_storage/index"
  "infinity_storage/web"
)

mkdir -p infinity_storage/logs

timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

log() {
  echo "[$(timestamp)] $1" >> "$LOG_FILE"
}

# --- lock check ---
if [ -f "$LOCK_FILE" ]; then
  log "Push skipped — lock present"
  exit 0
fi

touch "$LOCK_FILE"

# --- interval check ---
NOW_EPOCH=$(date +%s)
LAST_EPOCH=0

if [ -f "$STATE_FILE" ]; then
  LAST_EPOCH=$(cat "$STATE_FILE")
fi

DELTA=$((NOW_EPOCH - LAST_EPOCH))
if [ "$DELTA" -lt "$PUSH_INTERVAL" ]; then
  log "Push skipped — interval not reached (${DELTA}s)"
  rm -f "$LOCK_FILE"
  exit 0
fi

# --- git repo check ---
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log "Not a git repo — aborting"
  rm -f "$LOCK_FILE"
  exit 1
fi

# --- stage safe paths only ---
log "Staging safe paths"
git reset >/dev/null 2>&1

for path in "${SAFE_PATHS[@]}"; do
  git add "$path"* 2>/dev/null
done

# --- check if anything staged ---
if git diff --cached --quiet; then
  log "Nothing to commit"
  rm -f "$LOCK_FILE"
  exit 0
fi

# --- commit ---
COMMIT_MSG="Infinity+ auto-push (indexes + artifact)"
git commit -m "$COMMIT_MSG" >> "$LOG_FILE" 2>&1 || {
  log "Commit failed"
  rm -f "$LOCK_FILE"
  exit 1
}

# --- push ---
log "Attempting git push"
git push >> "$LOG_FILE" 2>&1

if [ $? -ne 0 ]; then
  log "Push failed — will retry later"
  rm -f "$LOCK_FILE"
  exit 0
fi

# --- success ---
echo "$NOW_EPOCH" > "$STATE_FILE"
log "Push successful"

rm -f "$LOCK_FILE"
exit 0
