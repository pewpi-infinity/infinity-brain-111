#!/bin/bash
C_RESET="\033[0m"
C_PURPLE="\033[35m"
C_GREEN="\033[32m"
C_BLUE="\033[34m"
C_YELLOW="\033[33m"
C_RED="\033[31m"

log() {
  echo -e "${1}${2}${C_RESET}"
}
