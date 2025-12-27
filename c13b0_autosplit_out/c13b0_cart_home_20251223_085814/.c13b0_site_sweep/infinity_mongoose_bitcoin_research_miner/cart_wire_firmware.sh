#!/usr/bin/env bash
# Auto-wire firmware cart into mongoose.os app

set -e

MONGOOSE="$HOME/mongoose.os"
APP="$MONGOOSE/app.py"

if [ ! -f "$APP" ]; then
  echo "[!] app.py not found in mongoose.os"
  exit 1
fi

if ! grep -q "repo_brain" "$APP"; then
  echo "[∞] Wiring repo brain into mongoose.os"

  cat << 'PYEOF' >> "$APP"

# === Infinity Firmware Repo Brain ===
from carts.cart_firmware_repo_brain import brain_bp
app.register_blueprint(brain_bp)
# === END Firmware Repo Brain ===
PYEOF

  cd "$MONGOOSE"
  git add app.py
  git commit -m "∞ wire firmware: repo brain"
  git push origin main
else
  echo "[∞] Firmware already wired"
fi
