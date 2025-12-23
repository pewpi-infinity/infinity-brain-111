#!/usr/bin/env python3
"""
cart014_headline_generator
Creates H1–H3 structure.
"""

import json

def main():
    with open("copy.json") as f:
        copy = json.load(f)

    headlines = {}
    for page, content in copy.items():
        headlines[page] = {
            "h1": content["headline"],
            "h2": f"About {page}",
            "h3": "Details"
        }

    with open("headlines.json", "w") as f:
        json.dump(headlines, f, indent=2)

    print("[✓] headlines.json generated")

if __name__ == "__main__":
    main()
