#!/usr/bin/env python3
"""
cart018_multilingual_ready
Marks content as translation-ready.
"""

import json

def main():
    languages = ["en"]

    with open("languages.json", "w") as f:
        json.dump({"supported": languages}, f, indent=2)

    print("[✓] languages.json created (translation-ready)")

if __name__ == "__main__":
    main()
