#!/data/data/com.termux/files/usr/bin/bash
#
# 🧱🎨🧱 c13b0 — FULL AUTONOMOUS TOKEN → REPO CARTRIDGE
# One Repo Per Token | Deterministic | Non-Blocking | Termux Hardened
#

set -u   # do NOT exit on transient failures

REPO_OWNER="pewpi-infinity"
SYSTEM_TITLE="🧱Mario🧱c13b0🧱InfinityTrumpCoin🧱"
SLEEP_SECONDS=4
CRAWL_DIR="$HOME/.c13b0_audit_repos"

WORDS_A=(Viper Atlas Comet Ember Falcon Halo Ion Jade Kestrel Lotus)
WORDS_B=(Aurora Beacon Cipher Delta Echo Flux Glyph Horizon Ivory Juniper)
WORDS_C=(Mint Noble Oracle Prism Quartz Ripple Solace Titan Umbra)

EMOJIS=(🧱 🎨 👁️ 🧠 💰 🔷 🔶 🟨 🟦 🟩 🟥 ⭐ ⚡ 🪙 🌌 🌈 🧬 🔭 🛰️ 🪐 🧊 🔥 🌊 🌋 🌱 🌀 🧿 🎯 📡)

COLOR_ROUTES=(🟩 🟧 🟦 🟥 🟪 🟨 🩷)
COLOR_MEANINGS=(
  "engineering/tools"
  "ceo/decisions"
  "input needed"
  "routes worth more"
  "assimilation"
  "data extraction"
  "investigative"
)

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

crawl_and_audit() {
  command -v gh >/dev/null || return
  command -v jq >/dev/null || return
  mkdir -p "$CRAWL_DIR"
  gh repo list "$REPO_OWNER" --limit 50 --json name,url |
  jq -r '.[] | "\(.name) \(.url)"' |
  while read -r name url; do
    dir="$CRAWL_DIR/$name"
    if [ -d "$dir/.git" ]; then
      (cd "$dir" && git pull --ff-only) >/dev/null 2>&1 || true
    else
      git clone "$url" "$dir" >/dev/null 2>&1 || true
    fi
  done
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

  IDX_COLOR=$(printf "%s\n" "${COLOR_ROUTES[@]}" | grep -n "$COLOR" | cut -d: -f1)
  IDX_COLOR=$((IDX_COLOR-1))
  COLOR_MEANING="${COLOR_MEANINGS[$IDX_COLOR]}"

  REPO_NAME="${CORE}${A}${CORE}${B}${CORE}${C}${CORE}"
  RUN="$HOME/.c13b0_$STAMP"
  mkdir -p "$RUN"/{token,visualizer,research}

  gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1 || \
    gh repo create "$REPO_OWNER/$REPO_NAME" \
      --public --confirm \
      --description "c13b0 | $COLOR $COLOR_MEANING | $TOPIC" \
      --add-readme --disable-wiki --disable-issues >/dev/null 2>&1

  # WAIT UNTIL REPO EXISTS (FIX)
  until gh repo view "$REPO_OWNER/$REPO_NAME" >/dev/null 2>&1; do
    echo "⏳ waiting for GitHub to finish creating $REPO_NAME"
    sleep 2
  done

  cat > "$RUN/research/article.json" <<JSON
{"topic":"$TOPIC","time":"$STAMP","load":"$LOAD","net":"$NET"}
JSON

  HASH="$(sha256sum "$RUN/research/article.json" | awk '{print $1}')"
  VALUE=$(( ${#PREHASH} + NET ))

  cat > "$RUN/token/token.json" <<JSON
{"hash":"$HASH","value":"$VALUE","color":"$COLOR $COLOR_MEANING","repo":"$REPO_NAME"}
JSON

  cat > "$RUN/visualizer/dials.json" <<JSON
{"🟩":"$LOAD","🟦":"$NET","🟨":"$HASH","🩷":"$TOPIC"}
JSON

  (
    cd "$RUN"
    git init -b main >/dev/null
    git remote remove origin 2>/dev/null || true
    git remote add origin "https://github.com/$REPO_OWNER/$REPO_NAME.git"
    echo "# $REPO_NAME" > README.md
    git add .
    git commit -m "$CORE c13b0 token" >/dev/null || true
    for i in 1 2 3 4 5; do
      git push -u origin main --force && break
      sleep 2
    done
  )

  crawl_and_audit &

  echo "🧱 $REPO_NAME | 🧬 $TOPIC | 🎨 $COLOR $COLOR_MEANING | 🪙 $VALUE"
  sleep "$SLEEP_SECONDS"
done
