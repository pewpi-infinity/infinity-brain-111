#!/usr/bin/env python3
"""
cart012_accessibility_enforcer
Defines accessibility rules.
"""

import json

RULES = {
    "aria_landmarks": True,
    "min_contrast_ratio": 4.5,
    "alt_text_required": True,
    "keyboard_navigation": True
}

def main():
    with open("a11y.json", "w") as f:
        json.dump(RULES, f, indent=2)

    print("[✓] a11y.json enforced")

if __name__ == "__main__":
    main()
