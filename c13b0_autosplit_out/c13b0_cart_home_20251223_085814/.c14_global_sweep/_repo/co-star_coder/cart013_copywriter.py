#!/usr/bin/env python3
"""
cart013_copywriter
Generates page copy.
"""

import json

def write_copy(page, intent):
    return {
        "headline": f"{intent} — {page.title()}",
        "body": f"This page explains the {page} section of the project."
    }

def main():
    with open("project.json") as f:
        project = json.load(f)
    with open("site_map.json") as f:
        pages = json.load(f)

    copy = {}
    for page in pages:
        copy[page] = write_copy(page, project["intent"])

    with open("copy.json", "w") as f:
        json.dump(copy, f, indent=2)

    print("[✓] copy.json generated")

if __name__ == "__main__":
    main()
