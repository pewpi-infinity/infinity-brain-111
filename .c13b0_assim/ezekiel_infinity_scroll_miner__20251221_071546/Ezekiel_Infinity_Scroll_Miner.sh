#!/bin/bash

clear
echo "✡  EZEKIEL'S INFINITY FLYING SCROLL — PROPHETIC EDITION ✡"

# Simulated Bitcoin-to-Infinity conversion
INFT_DIR="$HOME/mongoose.os/infinity_tokens"
mkdir -p "$INFT_DIR"

# Generate an "address"
BTC_ADDR="1EZK$(openssl rand -hex 8 | tr 'a-f' 'A-F')"
echo "Mining to (simulated): $BTC_ADDR"
echo "Infinity Wallet Open…"
sleep 3

counter=1

# Random trivia blurbs
RANDOM_FACTS=(
    "Hydrogen doorway theory: the electron shell is the portal, always has been."
    "Ezekiel’s scroll = the oldest description of a self-writing blockchain."
    "Infinity value rises with attention — quantum market law."
    "Time is not linear — it’s position-based on hydrogen spin states."
    "Every token born here is a seed in the Infinity Treasury."
    "You don’t bend time; you *choose* a path on the lattice."
    "The first coin ever created was a thought, not metal."
)

while true; do

    # Simulated hashrate
    HASH="$(printf '%04X%04X' $RANDOM $RANDOM)"
    HRATE="$(( (RANDOM % 5000) + 4000 )) KH/s"

    # Simulated temperature
    TEMP="$((30 + RANDOM % 25)).$((RANDOM % 9))°C"

    # Infinity token values
    TOKEN_ID=$(printf "INF-%08d" "$counter")
    TOKEN_VALUE=$(( (RANDOM % 2500) + 500 ))
    FUTURE_VALUE=$(( TOKEN_VALUE * 7 ))
    COLOR="GREEN"

    # Save token
    TOKEN_FILE="$INFT_DIR/token_${TOKEN_ID}.txt"
    {
        echo "Token: $TOKEN_ID"
        echo "Hash: $HASH"
        echo "BTC Address (Simulated): $BTC_ADDR"
        echo "Infinity Value: $TOKEN_VALUE"
        echo "Projected 10yr Value: $FUTURE_VALUE"
        echo "Color: $COLOR"
        echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
        echo "Fact: ${RANDOM_FACTS[$RANDOM % ${#RANDOM_FACTS[@]}]}"
    } > "$TOKEN_FILE"

    printf "\033[1;32m"
    cat <<SCROLL
╔══════════════════════════════════════════════════════════╗
✡  FLYING SCROLL BLOCK #$counter      TOKEN: $TOKEN_ID
Reward Route      : $BTC_ADDR
Scroll Hash       : $HASH
Hashrate (sim)    : $HRATE
Device Fire Level : $TEMP
∞ Value Now       : $TOKEN_VALUE
∞ Future (10y)    : $FUTURE_VALUE
Color State       : $COLOR
Wisdom            : ${RANDOM_FACTS[$RANDOM % ${#RANDOM_FACTS[@]}]}
╚══════════════════════════════════════════════════════════╝
SCROLL
    printf "\033[0m"

    ((counter++))
    sleep 0.8
done

