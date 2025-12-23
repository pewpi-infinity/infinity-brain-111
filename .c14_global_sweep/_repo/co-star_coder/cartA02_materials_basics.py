#!/usr/bin/env python3
"""
A02 — Materials Basics (Educational)
"""

MATERIALS = {
    "ferromagnetic": ["iron", "steel", "nickel"],
    "non_magnetic": ["aluminum", "copper", "plastic"],
    "note": (
        "Material choice affects magnetic interaction. "
        "This module does not specify dimensions or fabrication."
    )
}

def main():
    print("MATERIAL CATEGORIES:")
    for k, v in MATERIALS.items():
        if isinstance(v, list):
            print(f"{k}: {', '.join(v)}")
        else:
            print(v)

if __name__ == "__main__":
    main()
