#!/usr/bin/env python3
"""
C14 — Power Loss Behavior (Conceptual)
"""

CONTENT = [
    "Systems must define safe behavior during outages",
    "Fail-safe design releases control during power loss",
    "Backup power supports safety, not confinement"
]

def main():
    print("POWER LOSS BEHAVIOR:")
    for c in CONTENT:
        print(f"- {c}")

if __name__ == "__main__":
    main()
