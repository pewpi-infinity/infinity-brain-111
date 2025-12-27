#!/usr/bin/env python3
"""
cart009_component_registry
Registers reusable UI components.
"""

import json

COMPONENTS = {
    "header": ["logo", "nav"],
    "footer": ["links", "copyright"],
    "hero": ["headline", "cta"],
    "section": ["title", "content"],
    "form": ["input", "submit"]
}

def main():
    with open("components.json", "w") as f:
        json.dump(COMPONENTS, f, indent=2)

    print("[✓] components.json registered")

if __name__ == "__main__":
    main()
