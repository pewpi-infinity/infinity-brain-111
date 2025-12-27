#!/data/data/com.termux/files/usr/bin/bash
# C13b0² STABLE EXEC CART
# Scan → Adjust → Wire → Commit → Push
# Zero stdout noise. All logs to files.

set -euo pipefail

############################################
# RESET
############################################
cd ~

############################################
# PATHS
############################################
BASE="$HOME/o"
LOGROOT="$HOME/C13b0_logs"
SPINE="$HOME/C13b0_spine"
mkdir -p "$LOGROOT" "$SPINE"

RUNLOG="$LOGROOT/run_$(date +%Y%m%d_%H%M%S).log"

exec >"$RUNLOG" 2>&1

############################################
# PREFLIGHT
############################################
command -v git >/dev/null || exit 0
[ -d "$BASE" ] || exit 0

############################################
# SHARED SPINE (ONCE)
############################################
cat << 'SPINEEOF' > "$SPINE/spine.sh"
#!/usr/bin/env bash
# C13b0 shared spine
export C13B0_MODE=active
export C13B0_ROOT="$HOME/o"
SPINEEOF
chmod +x "$SPINE/spine.sh"

############################################
# WALK REPOS
############################################
find "$BASE" -mindepth 1 -maxdepth 1 -type d | while read -r REPO; do
  [ -d "$REPO/.git" ] || continue
  cd "$REPO" || continue

  REPOLOG="$LOGROOT/$(basename "$REPO").log"
  exec >>"$REPOLOG" 2>&1

  ##########################################
  # CLASSIFY
  ##########################################
  FILES=$(find . -type f ! -path "./.git/*" | wc -l || echo 0)
  CARTS=$(ls cart_*.sh 2>/dev/null | wc -l || echo 0)

  ##########################################
  # REPAIR: ensure carts executable
  ##########################################
  find . -name "cart_*.sh" -exec chmod +x {} \; || true

  ##########################################
  # ADD: missing local runner
  ##########################################
  if [ "$CARTS" -eq 0 ]; then
    cat << 'EOF2' > cart_local_run.sh
#!/usr/bin/env bash
source "$HOME/C13b0_spine/spine.sh"
echo "C13b0 local run: $(basename "$(pwd)")"
EOF2
    chmod +x cart_local_run.sh
  fi

  ##########################################
  # WIRE: link to spine if not present
  ##########################################
  if ! grep -q "C13b0_spine" ./*.sh 2>/dev/null; then
    for f in cart_*.sh; do
      [ -f "$f" ] || continue
      sed -i '1s|^|source "$HOME/C13b0_spine/spine.sh"\n|' "$f"
    done
  fi

  ##########################################
  # COMMIT & PUSH (SAFE)
  ##########################################
  git add . || true
  git commit -m "C13b0² stabilize + wire" || true
  git push || true

done

exit 0
