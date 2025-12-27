#!/usr/bin/env bash
set -e

echo "[∞] Infinity environment setup starting..."

pkg update -y
pkg install -y python git clang libjpeg-turbo

python3 -m ensurepip --upgrade || true
pip install --upgrade pip

pip install pillow imagehash numpy flask torch torchvision clip-anytorch

echo "[∞] Setup complete."
echo "[∞] Run ./cart_doctor.sh to verify environment."
