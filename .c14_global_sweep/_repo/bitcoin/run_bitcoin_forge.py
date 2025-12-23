#!/usr/bin/env python3
import os, subprocess, time

CART_DIR = "bitcoin/carts"

print("[∞BTC] Infinity Bitcoin Forge — brain cycle start")

for cart in sorted(os.listdir(CART_DIR)):
    if cart.endswith(".py"):
        print(f"[RUN] {cart}")
        subprocess.run(["python3", os.path.join(CART_DIR, cart)], check=True)

print("[∞BTC] Brain cycle complete")
