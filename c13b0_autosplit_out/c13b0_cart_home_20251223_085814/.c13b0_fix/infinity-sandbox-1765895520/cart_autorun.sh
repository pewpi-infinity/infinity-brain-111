#!/data/data/com.termux/files/usr/bin/bash
# CART-AUTORUN — Infinity-OS Auto-Start Script

cd ~/o 2>/dev/null || cd .

# Run directory + file verifier
python3 cart_path_verifier.py

# Run full bootstrap
python3 cart_startup_bootstrap.py

echo "[AUTORUN] Infinity-OS started successfully 💜"
