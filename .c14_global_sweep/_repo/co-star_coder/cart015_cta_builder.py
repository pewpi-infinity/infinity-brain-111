#!/usr/bin/env python3
"""
cart015_cta_builder
Builds calls-to-action.
"""

import json

def main():
    with open("site_map.json") as f:
        pages = json.load(f)

    ctas = {}
    for page in pages:
        ctas[page] = {
            "primary": "Get Started",
            "secondary": "Learn More"
        }

    with open("ctas.json", "w") as f:
        json.dump(ctas, f, indent=2)

    print("[✓] ctas.json generated")

if __name__ == "__main__":
    main()
