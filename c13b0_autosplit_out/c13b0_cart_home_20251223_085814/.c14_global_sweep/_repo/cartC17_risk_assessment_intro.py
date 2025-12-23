#!/usr/bin/env python3
"""
C17 — Risk Assessment Introduction
"""

STEPS = [
    "Identify hazards",
    "Estimate likelihood",
    "Evaluate severity",
    "Apply mitigations",
    "Review regularly"
]

def main():
    print("RISK ASSESSMENT STEPS:")
    for s in STEPS:
        print(f"- {s}")

if __name__ == "__main__":
    main()
