#!/usr/bin/env bash
# Auto-wire firmware into mongoose.os safely

set -e

MONGOOSE="$HOME/mongoose.os"
CART_IMPORT="from carts.cart_firmware_repo_brain import brain_bp"
CART_REGISTER="app.register_blueprint(brain_bp)"

TARGET=$(grep -R -l "Flask(" "$MONGOOSE" | head -n 1)

if [ -z "$TARGET" ]; then
  echo "[!] No Flask app found in mongoose.os"
  exit 1
fi

echo "[∞] Wiring firmware into $TARGET"

if grep -q "cart_firmware_repo_brain" "$TARGET"; then
  echo "[∞] Firmware already wired"
  exit 0
fi

# Inject import near top
sed -i "1i $CART_IMPORT" "$TARGET"

# Inject registration after app creation
sed -i "/app *= *Flask/a $CART_REGISTER" "$TARGET"

cd "$MONGOOSE"
git add "$(basename "$TARGET")"
git commit -m "∞ auto-wire firmware repo brain"
git push origin main

echo "[∞] Firmware wired and pushed"
