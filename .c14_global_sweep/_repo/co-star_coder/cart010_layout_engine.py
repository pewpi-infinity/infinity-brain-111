#!/usr/bin/env python3
"""
cart010_layout_engine
Assigns layout structure per page.
"""

import json

DEFAULT_LAYOUT = ["header", "hero", "section", "footer"]

def main():
    with open("site_map.json") as f:
        pages = json.load(f)

    layouts = {}
    for page in pages:
        if page == "home":
            layouts[page] = DEFAULT_LAYOUT
        else:
            layouts[page] = ["header", "section", "footer"]

    with open("layouts.json", "w") as f:
        json.dump(layouts, f, indent=2)

    print("[✓] layouts.json generated")

if __name__ == "__main__":
    main()
