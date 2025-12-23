#!/usr/bin/env bash

# Infinity Research Stream — colored, fast-moving, with simulated hashrate

terms=("token logic" "emoji pathfinding" "brick grid update" "semantic color anchors" "user empowerment provenance")
colors=("\033[31m" "\033[34m" "\033[33m" "\033[32m" "\033[35m")
reset="\033[0m"

hashrate_base=1000000 # starting simulated H/s

while true; do
  ts=$(date +'%Y-%m-%d %H:%M:%S')
  # Pick random term and color
  idx=$((RANDOM % ${#terms[@]}))
  term="${terms[$idx]}"
  color="${colors[$idx]}"

  # Simulate hashrate increment
  hashrate=$((hashrate_base + RANDOM % 500000))
  blockhash=$(echo $RANDOM | sha256sum | cut -c1-16)

  # Print colored line
  echo -e "${color}[∞] ${ts} :: ${term} :: block=${blockhash} :: hashrate=${hashrate} H/s${reset}"

  # Speed: adjust sleep for faster/slower stream
  sleep 0.2
done
