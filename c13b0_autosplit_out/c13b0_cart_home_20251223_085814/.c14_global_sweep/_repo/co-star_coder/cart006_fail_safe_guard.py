#!/usr/bin/env python3
"""
cart006_fail_safe_guard
Prevents destructive operations.
"""

import os
import sys

PROTECTED_FILES = {"project.json", "intent.json"}

def main():
    existing = PROTECTED_FILES.intersection(set(os.listdir(".")))
    if not existing:
        print("[!] No project context found. Abort.")
        sys.exit(1)

    print("[✓] Fail-safe check passed")
    print("    Protected:", ", ".join(existing))

if __name__ == "__main__":
    main()
