#!/usr/bin/env python3
"""
cart020_typography_engine
Defines typography system.
"""

import json

TYPOGRAPHY = {
    "font_primary": "Inter",
    "font_secondary": "system-ui",
    "scale": {
        "h1": "2.25rem",
        "h2": "1.75rem",
        "h3": "1.375rem",
        "body": "1rem",
        "small": "0.875rem"
    }
}

def main():
    with open("typography.json", "w") as f:
        json.dump(TYPOGRAPHY, f, indent=2)

    print("[✓] typography.json created")

if __name__ == "__main__":
    main()
