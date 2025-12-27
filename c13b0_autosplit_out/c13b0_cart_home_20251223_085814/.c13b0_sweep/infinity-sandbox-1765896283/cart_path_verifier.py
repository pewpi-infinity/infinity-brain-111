#!/usr/bin/env python3
# CART-PATH-VERIFY — Infinity-OS Directory Verifier & Auto-Repair

import os

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

def main():
    print("[PATH-VERIFY] Checking Infinity-OS directories...\n")

    created = []
    exists = []

    for d in DIRS:
        if not os.path.exists(d):
            os.makedirs(d, exist_ok=True)
            created.append(d)
        else:
            exists.append(d)

    print("✔ Existing:")
    for e in exists:
        print("   •", e)

    print("\n✔ Created (auto-fixed):")
    if created:
        for c in created:
            print("   •", c)
    else:
        print("   • None — all paths already existed.")

    print("\n[PATH-VERIFY] Complete.\n")

if __name__ == "__main__":
    main()
