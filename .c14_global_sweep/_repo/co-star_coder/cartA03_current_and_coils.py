#!/usr/bin/env python3
"""
A03 — Current and Coils (Conceptual)
"""

CONTENT = {
    "concepts": [
        "Electric current flowing through a coil produces a magnetic field",
        "More turns generally increase field strength (conceptual)",
        "Resistance and heat are important safety considerations"
    ],
    "boundary": (
        "No instructions for winding, powering, or assembling coils are included."
    )
}

def main():
    for item in CONTENT["concepts"]:
        print(f"- {item}")
    print("\nBoundary:", CONTENT["boundary"])

if __name__ == "__main__":
    main()
