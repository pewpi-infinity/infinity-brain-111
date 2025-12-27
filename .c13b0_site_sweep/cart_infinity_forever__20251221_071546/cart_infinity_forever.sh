#!/usr/bin/env bash
set -u

HOME_DIR="$HOME"
LOG="$HOME_DIR/infinity_engine.log"
SLEEP_SECONDS=120

echo "[∞] Infinity Engine started $(date -u)" >> "$LOG"

is_valid_repo() {
  git -C "$1" rev-parse --is-inside-work-tree >/dev/null 2>&1 || return 1
  git -C "$1" rev-parse HEAD >/dev/null 2>&1 || return 1
  return 0
}

while true; do
  echo "[∞] Cycle start $(date -u)" >> "$LOG"

  for REPO in "$HOME_DIR"/infinity* "$HOME_DIR"/mongoose.os; do
    [ -d "$REPO" ] || continue
    if ! is_valid_repo "$REPO"; then
      echo "[∞] Skipping invalid repo: $(basename "$REPO")" >> "$LOG"
      continue
    fi

    NAME=$(basename "$REPO")
    FILE="$REPO/INFINITY_PULSE.md"
    TS=$(date -u +"%Y-%m-%d %H:%M:%S UTC")

    {
      echo "## Infinity Pulse"
      echo "- Repo: $NAME"
      echo "- Time: $TS"
      echo "- Status: active"
      echo "- Linked system: Infinity"
      echo
    } >> "$FILE"

    git -C "$REPO" add -A >> "$LOG" 2>&1 || true
    git -C "$REPO" commit --allow-empty -m "∞ pulse: $TS" >> "$LOG" 2>&1 || true
    git -C "$REPO" push origin main >> "$LOG" 2>&1 || true

    echo "[∞] Updated $NAME" >> "$LOG"
  done

  echo "[∞] Cycle complete, sleeping $SLEEP_SECONDS sec" >> "$LOG"
  sleep "$SLEEP_SECONDS"
done
