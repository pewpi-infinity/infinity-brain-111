#!/usr/bin/env bash

# Infinity Research Stream — full text readouts, colored, fast

reset="\033[0m"
red="\033[31m"
blue="\033[34m"
yellow="\033[33m"
green="\033[32m"
purple="\033[35m"

# Load your draft research text (replace with Infinity outputs)
input_file="research_draft.txt"

if [[ ! -f "$input_file" ]]; then
  echo "No research_draft.txt found. Create one with your Infinity text."
  exit 1
fi

while IFS= read -r line; do
  # Pick a random color for variety
  colors=("$red" "$blue" "$yellow" "$green" "$purple")
  idx=$((RANDOM % ${#colors[@]}))
  color="${colors[$idx]}"

  ts=$(date +'%Y-%m-%d %H:%M:%S')
  echo -e "${color}[∞] $ts :: $line${reset}"
  sleep 0.05  # speed of scroll (adjust for faster/slower)
done < "$input_file"
