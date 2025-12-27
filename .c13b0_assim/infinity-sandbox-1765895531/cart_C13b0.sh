#!/bin/bash
# C13b0 — Consistency / Override Card
# mongoose.os compatible
# additive only

C13B0_STATE_FILE="C13b0.state"

activate_c13b0() {
  echo "ACTIVE $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1" >> "$C13B0_STATE_FILE"
}

resolve_c13b0() {
  echo "RESOLVED $(date -u +"%Y-%m-%dT%H:%M:%SZ") $1" >> "$C13B0_STATE_FILE"
}

check_c13b0() {
  if [ -f "$C13B0_STATE_FILE" ]; then
    tail -n 1 "$C13B0_STATE_FILE"
  fi
}

case "$1" in
  activate)
    activate_c13b0 "$2"
    ;;
  resolve)
    resolve_c13b0 "$2"
    ;;
  status)
    check_c13b0
    ;;
  *)
    echo "usage: ./cart_C13b0.sh {activate|resolve|status} [note]"
    ;;
esac
