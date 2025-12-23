#!/usr/bin/env python3
"""
cart007_site_map_builder
Generates site_map.json
"""

import json

def build_site_map(site_type, pages):
    base = ["home"]
    if pages >= 3:
        base += ["about", "contact"]
    if site_type in ("saas", "store"):
        base += ["features", "pricing"]
    if site_type == "blog":
        base += ["blog"]
    return base[:pages]

def main():
    with open("project.json") as f:
        project = json.load(f)

    pages = project["scope"]["pages"]
    site_type = project["site_type"]

    site_map = build_site_map(site_type, pages)

    with open("site_map.json", "w") as f:
        json.dump(site_map, f, indent=2)

    print("[✓] site_map.json created:", site_map)

if __name__ == "__main__":
    main()
