#!/usr/bin/env python3
# CART-BOOTSTRAP-STARTUP — Infinity-OS Startup Bootstrap
# Runs at launch to ensure the system is ready.

import os, json, time, subprocess

# -----------------------------
# Required core directories
# -----------------------------
DIRS = [
    "site",
    "site/js",
    "site/css",
    "site/assets",
    "site/data",
    "site/tokens",
    "site/ledger",
    "site/users",
    "site/feed",
    "site/modules",
    "site/styles",
    "site/interface",
    "site/gateway",
    "site/ipfs_cache",
    "site/capsules"
]

def ensure_dirs():
    print("\n[BOOTSTRAP] Checking directories...")
    for d in DIRS:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
            print("   • Created:", d)
        else:
            print("   • Exists:", d)

# -----------------------------
# File Initializers
# -----------------------------

def ensure_file(path, default):
    if not os.path.exists(path):
        with open(path,"w") as f:
            json.dump(default,f,indent=4)
        print("   • Created:", path)
    else:
        print("   • Exists:", path)

def initialize_files():
    print("\n[BOOTSTRAP] Initializing core JSON files...")

    ensure_file("CART804_FEED_BUFFER.json", {"tiles":[]})
    ensure_file("CART805_WALLET.json", {"balance":0,"history":[]})
    ensure_file("CART803_TOKENS.json", {"tokens":{}})
    ensure_file("CART653_WRITER_MODE.json", {"writer_enabled":False})
    ensure_file("WORLD_TOKEN_LEDGER.json", {"count":0,"history":[]})
    ensure_file("PEWPI_USER_CAPSULE.json", {
        "encrypted": True,
        "user": None,
        "capsule": None
    })

# -----------------------------
# Warmup modules (optional)
# -----------------------------

def warmup_modules():
    print("\n[BOOTSTRAP] Warming up core engines...")

    modules = [
        "cart801_terminal_engine.py",
        "cart804_feed_generator.py",
        "cart805_wallet_engine.py"
    ]

    for m in modules:
        if os.path.exists(m):
            print("   • Running", m)
            subprocess.call(["python3", m])
        else:
            print("   • Missing:", m)

# -----------------------------
# Startup Summary
# -----------------------------

def summary():
    print("\n[BOOTSTRAP] Infinity-OS Startup Complete.")
    print("[BOOTSTRAP] All systems online.\n")

# -----------------------------
# Execute Startup
# -----------------------------
if __name__ == "__main__":
    print("\n=== Infinity-OS Startup Bootstrap ===")
    ensure_dirs()
    initialize_files()
    warmup_modules()
    summary()
