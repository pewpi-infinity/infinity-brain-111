#!/bin/bash

# -----------------------------
# Infinity Scheduler / Watchdog
# -----------------------------

INTERVAL_SECONDS=1800   # 30 minutes (adjust as needed)
LOCK_FILE="infinity_storage/logs/scheduler.lock"
LOG_FILE="infinity_storage/logs/scheduler.log"

mkdir -p infinity_storage/logs

echo "[∞] Infinity Scheduler starting"
echo "[∞] Interval: ${INTERVAL_SECONDS}s"

while true; do
  TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  if [ -f "$LOCK_FILE" ]; then
    echo "[$TIMESTAMP] Lock present — skipping run" >> "$LOG_FILE"
    sleep "$INTERVAL_SECONDS"
    continue
  fi

  echo "[$TIMESTAMP] Starting pipeline run" >> "$LOG_FILE"
  touch "$LOCK_FILE"

  ./cart_INFINITY_PIPELINE_ORCHESTRATOR.py >> "$LOG_FILE" 2>&1
  PIPE_STATUS=$?

  rm -f "$LOCK_FILE"

  if [ $PIPE_STATUS -ne 0 ]; then
    echo "[$TIMESTAMP] Pipeline error — check logs" >> "$LOG_FILE"
  else
    echo "[$TIMESTAMP] Pipeline completed successfully" >> "$LOG_FILE"
  fi

  sleep "$INTERVAL_SECONDS"
done
