#!/usr/bin/env python3
"""
A01 — Introduction to Electromagnetism (Educational)
High-level concepts only.
"""

CONTENT = {
    "overview": (
        "Electromagnetism describes how electric currents create magnetic fields "
        "and how those fields interact with materials."
    ),
    "key_ideas": [
        "Electric current can generate a magnetic field",
        "Magnetic fields exert forces without physical contact",
        "Field strength depends on current and geometry (conceptually)"
    ],
    "safety_note": (
        "This module is conceptual and does not describe construction, wiring, "
        "or operational steps."
    )
}

def main():
    for k, v in CONTENT.items():
        print(f"\n{k.upper()}:")
        if isinstance(v, list):
            for item in v:
                print(f" - {item}")
        else:
            print(v)

if __name__ == "__main__":
    main()
