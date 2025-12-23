#!/usr/bin/env python3
"""
C13 — Life Safety Rules (Educational)
"""

RULES = [
    "Human life always takes priority over asset protection",
    "Occupants must be able to exit without special knowledge",
    "Locks must not create entrapment conditions",
    "Design assumes stress, panic, and low visibility"
]

def main():
    print("LIFE SAFETY PRINCIPLES:")
    for r in RULES:
        print(f"- {r}")

if __name__ == "__main__":
    main()
