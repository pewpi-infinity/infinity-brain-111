#!/usr/bin/env bash
# Full mongoose.os brain install

set -e

./cart_push_to_mongoose.sh cart_firmware_repo_brain.py
./cart_wire_firmware.sh

echo "[∞] Brain installed. Restart mongoose.os."
