#!/usr/bin/env python3
"""
cart004_user_constraints
Collects optional user constraints.
"""

import json

DEFAULTS = {
    "color_preference": "neutral",
    "tone": "professional",
    "framework": "vanilla",
    "accessibility": True
}

def main():
    with open("intent.json") as f:
        data = json.load(f)

    constraints = DEFAULTS.copy()
    data["constraints"] = constraints

    with open("intent.json", "w") as f:
        json.dump(data, f, indent=2)

    print("[✓] User constraints applied (defaults)")

if __name__ == "__main__":
    main()
