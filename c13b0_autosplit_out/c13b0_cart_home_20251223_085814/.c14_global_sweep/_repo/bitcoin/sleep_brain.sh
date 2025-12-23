#!/bin/bash
while true; do
  echo "[∞] Brain tick $(date)"
  ./bitcoin/run_bitcoin_forge.py
  ./bitcoin/brain_autopush.sh
  sleep 1800
done
