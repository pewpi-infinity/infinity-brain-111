#!/data/data/com.termux/files/usr/bin/bash
#
# 🧱🍄🧱 c13b0 — MARIO-STABLE AUTONOMOUS CARTRIDGE
# One Repo Per Token | Mario-Encoded Output | Termux Safe
#

set -u

REPO_OWNER="pewpi-infinity"
SYSTEM_TITLE="🧱Mario🧱c13b0🧱InfinityTrumpCoin🧱"
SLEEP_SECONDS=4

WORDS_A=(Viper Atlas Comet Ember Falcon Halo Ion Jade Kestrel Lotus)
WORDS_B=(Aurora Beacon Cipher Delta Echo Flux Glyph Horizon Ivory Juniper)
WORDS_C=(Mint Noble Oracle Prism Quartz Ripple Solace Titan Umbra)

EMOJIS=(🧱 🍄 ⭐ 🔥 🪙 🌌 🧬 🧠 👁️ 🎯)
COLOR_ROUTES=(🟩 🟧 🟦 🟥 🟪 🟨 🩷)
COLOR_MEANINGS=("ENG" "CEO" "INPUT" "ROUTES" "ASSIM" "DATA" "INVEST")

SEARCH_TERMS=(
  "quantum error correction"
  "room temperature superconductivity"
  "topological quantum computing"
  "fusion energy confinement"
  "inertial confinement fusion"
  "high temperature superconductors"
  "programmable gene editing CRISPR"
  "base editing gene therapy"
  "prime editing genome engineering"
  "epigenetic reprogramming longevity"
  "senolytic therapies aging"
  "climate tipping points modeling"
  "carbon capture direct air"
  "artificial photosynthesis catalysts"
  "solid state battery technology"
  "sodium ion battery research"
  "lithium sulfur battery cathodes"
  "perovskite solar cells stability"
  "photonic neural networks"
  "neuromorphic computing hardware"
  "spintronics magnetic memory"
  "2D materials graphene heterostructures"
  "metamaterials negative index optics"
  "programmable matter robotics"
  "soft robotics bioinspired locomotion"
  "swarm robotics coordination"
  "brain computer interface noninvasive"
  "high resolution connectomics"
  "protein folding prediction"
  "de novo protein design"
  "molecular dynamics drug discovery"
  "synthetic biology minimal cells"
  "origin of life protocells"
  "gravitational wave astronomy"
  "dark matter direct detection"
  "fast radio burst origin"
  "exoplanet atmosphere biosignatures"
  "large language model alignment"
  "reinforcement learning for science"
  "autonomous lab robotics"
  "quantum sensing precision metrology"
  "time crystal experimental realizations"
  "holographic duality quantum gravity"
  "axion dark matter search"
  "high energy cosmic rays"
  "ultrafast laser spectroscopy"
  "spin glass optimization"
  "topological photonics waveguides"
  "bioprinting tissues organs"
  "brain organoid modeling cognition"
)

pick() {
  local -n arr=$1
  local hex=$2
  echo "${arr[$((16#$hex % ${#arr[@]}))]}"
}

while true; do
  LOAD="$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | tr -d ' ' || echo 0)"
  NET="$(wc -l /proc/net/dev 2>/dev/null | awk '{print $1}' || echo 0)"
  TIME="$(date -u +%s)"
  STAMP="$(date -u +%Y%m%dT%H%M%SZ)"

  PREHASH="$(printf '%s|%s|%s|%s' "$SYSTEM_TITLE" "$LOAD" "$NET" "$TIME" | sha256sum | awk '{print $1}')"

  CORE="$(pick EMOJIS "${PREHASH:0:2}")"
  A="$(pick WORDS_A "${PREHASH:2:2}")"
  B="$(pick WORDS_B "${PREHASH:4:2}")"
  C="$(pick WORDS_C "${PREHASH:6:2}")"
  TOPIC="$(pick SEARCH_TERMS "${PREHASH:8:2}")"
  COLOR="$(pick COLOR_ROUTES "${PREHASH:10:2}")"

  REPO_NAME="🧱${A}🧱${B}🧱${C}🧱"
  RUN="$HOME/.c13b0_$STAMP"
  mkdir -p "$RUN"/{token,visualizer,research}

  gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1 || \
  gh repo create "$REPO_OWNER/$REPO_NAME" \
    --public --confirm \
    --description "🧱 c13b0 | $TOPIC" \
    --add-readme --disable-wiki --disable-issues >/dev/null 2>&1

  # silent consistency wait (NO MESSAGE)
  until gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1; do sleep 1; done

  echo "🧱🧱🧱 BLOCK SPAWNED: $REPO_NAME"

  cat > "$RUN/research/article.json" <<JSON
{"topic":"$TOPIC","stamp":"$STAMP","load":"$LOAD","net":"$NET"}
JSON

  HASH="$(sha256sum "$RUN/research/article.json" | awk '{print $1}')"
  VALUE=$(( ${#PREHASH} + NET ))

  cat > "$RUN/token/token.json" <<JSON
{"🪙":"$HASH","💰":"$VALUE","🎨":"$COLOR","🧱":"$REPO_NAME"}
JSON

  (
    cd "$RUN"
    git init -b main >/dev/null
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git"
    echo "# $REPO_NAME" > README.md
    git add .
    git commit -m "🧱 c13b0 block" >/dev/null || true
    git push -u origin main --force >/dev/null 2>&1
  )

  echo "🍄 POWER-UP | 🧬 $TOPIC | 💰 $VALUE"
  echo "⭐ NEXT BLOCK IN $SLEEP_SECONDS"
  sleep "$SLEEP_SECONDS"
done
