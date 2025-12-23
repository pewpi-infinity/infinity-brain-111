#!/data/data/com.termux/files/usr/bin/bash
# 🧱🎟️🧱 C13b0² EXEC — EXISTING REPOS ONLY
# No home repo • Tokenized actions • Mongoose firmware • Silent run

set -euo pipefail

############################################
# EXEC RESET
############################################
cd ~

############################################
# PATHS (EXISTING ONLY)
############################################
BASE="$HOME/o"                 # folder containing the 334 repos
LOGROOT="$HOME/.c13b0_logs"    # hidden logs, no stdout
mkdir -p "$LOGROOT"
RUNLOG="$LOGROOT/run_$(date +%Y%m%d_%H%M%S).log"
exec >"$RUNLOG" 2>&1

############################################
# PREFLIGHT (SILENT)
############################################
command -v git >/dev/null || exit 0
[ -d "$BASE" ] || exit 0

############################################
# LOCATE MONGOOSE (SOURCE OF INTELLIGENCE)
############################################
MONGOOSE=""
for d in "$BASE"/*; do
  [ -d "$d/.git" ] || continue
  if [ -d "$d/mongoose" ] || [ -f "$d/mongoose_api.py" ] || grep -qi "mongoose" -R "$d" 2>/dev/null; then
    MONGOOSE="$d"
    break
  fi
done
[ -n "$MONGOOSE" ] || exit 0

############################################
# LOAD MONGOOSE FIRMWARE (IF PRESENT)
############################################
if [ -f "$MONGOOSE/firmware.sh" ]; then
  # shellcheck disable=SC1090
  source "$MONGOOSE/firmware.sh"
fi

############################################
# WALK EXISTING REPOS
############################################
find "$BASE" -mindepth 1 -maxdepth 1 -type d | while read -r REPO; do
  [ -d "$REPO/.git" ] || continue
  cd "$REPO" || continue

  REPOLOG="$LOGROOT/$(basename "$REPO").log"
  exec >>"$REPOLOG" 2>&1

  ##########################################
  # SCAN
  ##########################################
  FILES=$(find . -type f ! -path "./.git/*" | wc -l || echo 0)
  CARTS=$(ls cart_*.sh 2>/dev/null | wc -l || echo 0)

  ##########################################
  # DECIDE (NO LIBERTIES)
  ##########################################
  ACTION="wire"
  [ "$FILES" -lt 10 ] && ACTION="add"
  [ "$CARTS" -eq 0 ] && ACTION="repair"

  ##########################################
  # TOKEN / TICKET (WRITE-ONLY, NO CHARGE)
  ##########################################
  mkdir -p .c13b0/tickets
  TID="$(date -u +%Y%m%dT%H%M%SZ)_$RANDOM"
  cat << JSON > ".c13b0/tickets/$TID.json"
{
  "ticket": "C13b0",
  "repo": "$(basename "$REPO")",
  "action": "$ACTION",
  "issuer": "system",
  "charge": 0,
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

  ##########################################
  # APPLY (STRICTLY ALLOWED)
  ##########################################
  case "$ACTION" in
    repair)
      find . -name "cart_*.sh" -exec chmod +x {} \; || true
      ;;
    add)
      cat << 'ADD' > cart_local_build.sh
#!/usr/bin/env bash
# C13b0 local build (mongoose-informed)
echo "C13b0 build: $(basename "$(pwd)")"
ADD
      chmod +x cart_local_build.sh
      ;;
    wire)
      # wire to mongoose firmware ONLY if present
      if [ -f "$MONGOOSE/firmware.sh" ]; then
        for f in cart_*.sh; do
          [ -f "$f" ] || continue
          grep -q "mongoose/firmware.sh" "$f" || \
            sed -i '1s|^|source "'"$MONGOOSE"'/firmware.sh"\n|' "$f"
        done
      fi
      ;;
  esac

  ##########################################
  # COMMIT + PUSH (SILENT)
  ##########################################
  git add . || true
  git commit -m "🧱🎟️🧱 C13b0 $ACTION (tokenized)" >/dev/null 2>&1 || true
  git push >/dev/null 2>&1 || true

done

exit 0
