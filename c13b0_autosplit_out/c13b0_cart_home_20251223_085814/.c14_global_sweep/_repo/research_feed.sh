#!/usr/bin/env bash

# Colored research article feed
reset="\033[0m"
red="\033[31m"
blue="\033[34m"
yellow="\033[33m"
green="\033[32m"
purple="\033[35m"

articles=(
  "$red Nature: AI saving time & money in research — but at what cost?$reset"
  "$blue MIT News: Speak objects into existence with AI & robotics$reset"
  "$yellow SpringerLink: Explainable AI for diagnosing neurocognitive disorders$reset"
  "$green Scientific American: AI chatbots sway political persuasion$reset"
  "$purple arXiv: Thinking by Doing — efficient reasoning in LLMs$reset"
)

while true; do
  for a in "${articles[@]}"; do
    ts=$(date +'%Y-%m-%d %H:%M:%S')
    echo -e "[∞] $ts :: $a"
    sleep 1
  done
done
