#!/bin/bash
source ./bitcoin/brain_colors.sh

log "$C_PURPLE" "∞ Infinity Bitcoin Forge — LIVE BRAIN ONLINE"
log "$C_BLUE"   "Path: $(pwd)"
log "$C_BLUE"   "Using mongoose.os file-brain"

while true; do
  log "$C_GREEN" "[TICK] $(date)"

  log "$C_YELLOW" "[RUN] Brain cycle start"
  ./bitcoin/run_bitcoin_forge.py

  log "$C_PURPLE" "[MINT] Tokens & research updated"

  log "$C_BLUE" "[GIT] Syncing state"
  ./bitcoin/brain_autopush.sh

  log "$C_GREEN" "[SLEEP] Brain resting (10 min)"
  sleep 600
done
