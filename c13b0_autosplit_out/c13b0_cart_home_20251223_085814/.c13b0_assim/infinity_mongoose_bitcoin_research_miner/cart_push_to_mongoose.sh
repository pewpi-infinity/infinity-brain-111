#!/usr/bin/env bash
# Push a cart into mongoose.os and commit it

set -e

if [ $# -lt 1 ]; then
  echo "Usage: ./cart_push_to_mongoose.sh <cart_file>"
  exit 1
fi

CART="$1"
MONGOOSE="$HOME/mongoose.os"

if [ ! -d "$MONGOOSE/.git" ]; then
  echo "[!] mongoose.os repo not found at $MONGOOSE"
  exit 1
fi

if [ ! -f "$CART" ]; then
  echo "[!] Cart file not found: $CART"
  exit 1
fi

BASENAME=$(basename "$CART")

echo "[∞] Installing $BASENAME into mongoose.os"

cp "$CART" "$MONGOOSE/carts/$BASENAME"

cd "$MONGOOSE"

git add "carts/$BASENAME"
git commit -m "∞ firmware install: $BASENAME"
git push origin main

echo "[∞] Cart pushed and live in mongoose.os"
