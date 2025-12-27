#!/usr/bin/env python3
"""
cart008_route_generator
Creates routes.json
"""

import json

def main():
    with open("site_map.json") as f:
        pages = json.load(f)

    routes = {}
    for page in pages:
        routes[page] = "/" if page == "home" else f"/{page}"

    with open("routes.json", "w") as f:
        json.dump(routes, f, indent=2)

    print("[✓] routes.json generated")

if __name__ == "__main__":
    main()
