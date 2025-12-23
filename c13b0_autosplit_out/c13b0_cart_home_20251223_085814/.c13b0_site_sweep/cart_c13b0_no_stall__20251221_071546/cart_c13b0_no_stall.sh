#!/data/data/com.termux/files/usr/bin/bash
#
# 🧱🍄🧱 c13b0 — NON-STALLING MARIO CARTRIDGE
# Zero blocking • Queue-based GitHub • One paste
#

set -u

REPO_OWNER="pewpi-infinity"
SYSTEM_TITLE="🧱Mario🧱c13b0🧱InfinityTrumpCoin🧱"
SLEEP_SECONDS=4
QUEUE="$HOME/.c13b0_queue"

mkdir -p "$QUEUE"

WORDS_A=(Viper Atlas Comet Ember Falcon Halo Ion Jade Kestrel Lotus)
WORDS_B=(Aurora Beacon Cipher Delta Echo Flux Glyph Horizon Ivory Juniper)
WORDS_C=(Mint Noble Oracle Prism Quartz Ripple Solace Titan Umbra)

EMOJIS=(🧱 🍄 ⭐ 🔥 🪙 🌌 🧬 🧠 👁️ 🎯)
SEARCH_TERMS=(
  "quantum error correction"
  "room temperature superconductivity"
  "topological quantum computing"
  "fusion energy confinement"
  "high temperature superconductors"
  "neuromorphic computing hardware"
  "graphene heterostructures"
  "dark matter detection"
  "gravitational wave astronomy"
  "large language model alignment"
)

pick() {
  local -n arr=$1
  local hex=$2
  echo "${arr[$((16#$hex % ${#arr[@]}))]}"
}

############################
# BACKGROUND PUSH WORKER
############################
(
  while true; do
    for job in "$QUEUE"/*; do
      [ -d "$job/.git" ] || continue
      (
        cd "$job"
        git push -u origin main --force >/dev/null 2>&1 && rm -rf "$job"
      )
    done
    sleep 10
  done
) &

############################
# MAIN LOOP (CANNOT STALL)
############################
while true; do
  TIME="$(date -u +%s)"
  STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

  PREHASH="$(printf '%s|%s' "$SYSTEM_TITLE" "$TIME" | sha256sum | awk '{print $1}')"

  A="$(pick WORDS_A "${PREHASH:0:2}")"
  B="$(pick WORDS_B "${PREHASH:2:2}")"
  C="$(pick WORDS_C "${PREHASH:4:2}")"
  TOPIC="$(pick SEARCH_TERMS "${PREHASH:6:2}")"

  REPO_NAME="🧱${A}🧱${B}🧱${C}🧱"
  RUN="$QUEUE/$STAMP"
  mkdir -p "$RUN"

  echo "🧱 BLOCK SPAWNED → $REPO_NAME"
  echo "🍄 TOPIC → $TOPIC"

  cat > "$RUN/data.json" <<JSON
{"repo":"$REPO_NAME","topic":"$TOPIC","stamp":"$STAMP"}
JSON

  git init -b main "$RUN" >/dev/null
  (
    cd "$RUN"
    git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git" 2>/dev/null || true
    echo "# $REPO_NAME" > README.md
    git add .
    git commit -m "🧱 c13b0 block" >/dev/null || true
  )

  # repo creation is async and non-blocking
  gh repo create "$REPO_OWNER/$REPO_NAME" \
    --public --confirm \
    --add-readme \
    --disable-wiki --disable-issues >/dev/null 2>&1 &

  echo "⭐ QUEUED FOR PUSH"
  sleep "$SLEEP_SECONDS"
done
