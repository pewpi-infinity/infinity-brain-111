#!/bin/bash

clear
echo "✡️  EZEKIEL’S INFINITY FLYING SCROLL — V3.1 ✡️"
sleep 1

# Paths
REPO="$HOME/mongoose.os"
TOKENS="$REPO/infinity_tokens"
mkdir -p "$TOKENS"

# Safe address generator for Termux
ADDR="1EZK$(head -c 8 /dev/urandom | xxd -p | tr 'a-f' 'A-F')"
echo "Binding Scroll Route → $ADDR"
sleep 1

# Color Tier Logic
color_state() {
    local v=$1
    if   (( v >= 2500 )); then echo "💜 PURPLE — Prime Tier"
    elif (( v >= 1800 )); then echo "💚 GREEN — Growth Tier"
    elif (( v >= 1200 )); then echo "💛 YELLOW — Seed Tier"
    else echo "❤️ RED — Embryo Tier"; fi
}

# Lore Generator
lore() {
    LORE_LIST=(
"Infinity tokens propagate value the same way hydrogen propagates frequency — by resonance, not force."
"Every block minted is a position in the lattice of time. You’re not moving forward; you’re stepping sideways."
"Zechariah’s scroll described a self-writing archive. Your scroll is the same thing — modernized."
"In the Infinity economy, observation stabilizes value. That’s quantum economics, not mysticism."
"Each token is a point on a cosmic number line. A coordinate with your imprint burned into the structure."
    )
    echo "${LORE_LIST[$RANDOM % ${#LORE_LIST[@]}]}"
}

# Real auto-push (with logs)
push_to_repo() {
    cd "$REPO"

    git add infinity_tokens/
    git commit -m "∞ Token $TOKEN_ID $(date -u +"%Y-%m-%dT%H:%M:%SZ")"

    echo "⏳ pushing…"
    git push 2>&1 | tee ~/last_push_log.txt

    echo "📄 push log → ~/last_push_log.txt"
}

counter=1

while true; do
    HASH="$(printf '%04X%04X' $RANDOM $RANDOM)"
    HRATE="$(( (RANDOM % 3500) + 4200 )) KH/s"
    TEMP="$((35 + RANDOM % 18)).$((RANDOM % 9))°C"

    BASE=$(( (RANDOM % 2000) + 800 ))
    FUTURE=$(( BASE * 6 ))
    COLOR=$(color_state "$BASE")

    TOKEN_ID=$(printf "INF-%08d" "$counter")
    FILE="$TOKENS/$TOKEN_ID.txt"

    # Build token
    {
        echo "Token: $TOKEN_ID"
        echo "Hash: $HASH"
        echo "Infinity Value: $BASE"
        echo "Projected 10y Value: $FUTURE"
        echo "Tier: $COLOR"
        echo "Route: $ADDR"
        echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        echo ""
        echo "Lore:"
        lore
    } > "$FILE"

    # Push to repo
    push_to_repo

    # Delete local copy to avoid clutter
    rm "$FILE"

    # Scroll output
    printf "\033[38;5;82m"
    cat <<SCROLL
╔══════════════════════════════════════════════════════════╗
  ✡️ FLYING SCROLL BLOCK #$counter     📜 $TOKEN_ID
  Route: $ADDR
  Hash:          $HASH
  Hashrate:      $HRATE
  Fire Level:    $TEMP
  ∞ Value:       $BASE
  ∞ Future:      $FUTURE
  Tier:          $COLOR
╠══════════════════════════════════════════════════════════╣
  $(lore)
╚══════════════════════════════════════════════════════════╝
SCROLL
    printf "\033[0m"

    ((counter++))
    sleep 1
done
