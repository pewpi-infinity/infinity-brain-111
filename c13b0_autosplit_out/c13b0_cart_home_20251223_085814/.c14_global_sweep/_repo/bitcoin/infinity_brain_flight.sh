#!/bin/bash
source ./bitcoin/brain_colors.sh

log "$C_PURPLE" "∞ Infinity Bitcoin Forge — FLIGHT MODE"
log "$C_BLUE"   "mongoose.os verified"

while true; do
  log "$C_GREEN" "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "$C_GREEN" "[TICK] $(date +%H:%M:%S)"

  log "$C_YELLOW" "[CHECK] Repo state"
  python3 bitcoin/carts/cart009_repo_status.py || exit 1

  log "$C_YELLOW" "[RUN] Brain carts"
  ./bitcoin/run_bitcoin_forge.py

  log "$C_PURPLE" "[LINK] Tokens ↔ Research ↔ Octaves"

  log "$C_BLUE" "[DIFF] Pending changes"
  git status --short

  log "$C_BLUE" "[PUSH] Syncing brain state"
  git add bitcoin
  git commit -m "∞BTC flight tick $(date +%s)" >/dev/null 2>&1
  git push >/dev/null 2>&1 && log "$C_GREEN" "[PUSH] Success"

  # micro-pause only to keep terminal readable
  sleep 2
done
