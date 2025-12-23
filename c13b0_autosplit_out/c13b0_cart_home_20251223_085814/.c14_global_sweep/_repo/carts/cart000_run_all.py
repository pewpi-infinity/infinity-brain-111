#!/usr/bin/env python3
# ∞ cart000_run_all – sequential cart runner (Python3 only)

import os
import subprocess
import datetime

print("\n∞ cart000_run_all – Infinity Sequential Runner")
print("Started:", datetime.datetime.now().isoformat(), "\n")

# Load list of carts from actual directory (not guesses)
carts = [
    f for f in os.listdir(".")
    if f.startswith("cart") and f.endswith(".py") and f != "cart000_run_all.py"
]

# Sort lexicographically to preserve order:
# cart000 → cart001 → cart002 → … cart900 → cart901
carts.sort()

print(f"∞ Found {len(carts)} carts to run.")
for c in carts:
    print(f"\n--------------------------------------")
    print(f"∞ Running {c} …")
    try:
        subprocess.run(["python3", c], check=False)
    except Exception as e:
        print(f"⚠ Error running {c}: {e}")

print("\n∞ cart000_run_all COMPLETE.")
