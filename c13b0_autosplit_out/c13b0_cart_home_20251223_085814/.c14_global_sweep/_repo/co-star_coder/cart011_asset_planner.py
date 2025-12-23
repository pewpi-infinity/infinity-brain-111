#!/usr/bin/env python3
"""
cart011_asset_planner
Plans assets per page.
"""

import json

def main():
    with open("site_map.json") as f:
        pages = json.load(f)

    assets = {}
    for page in pages:
        assets[page] = {
            "images": [f"{page}_hero.jpg"],
            "icons": ["arrow", "check"],
            "fonts": ["sans-serif"]
        }

    with open("assets.json", "w") as f:
        json.dump(assets, f, indent=2)

    print("[✓] assets.json created")

if __name__ == "__main__":
    main()
