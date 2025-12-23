#!/usr/bin/env python3
"""
cart002_intent_classifier
Determines website type from intent.
"""

import json

SITE_TYPES = {
    "landing": ["landing", "promo", "marketing"],
    "blog": ["blog", "articles", "posts"],
    "portfolio": ["portfolio", "personal", "showcase"],
    "saas": ["saas", "app", "startup"],
    "docs": ["docs", "documentation"],
    "store": ["store", "shop", "ecommerce"]
}

def classify(intent):
    intent_l = intent.lower()
    for site_type, keywords in SITE_TYPES.items():
        if any(k in intent_l for k in keywords):
            return site_type
    return "generic"

def main():
    with open("intent.json") as f:
        data = json.load(f)

    site_type = classify(data["intent_raw"])
    data["site_type"] = site_type

    with open("intent.json", "w") as f:
        json.dump(data, f, indent=2)

    print(f"[✓] Classified site type → {site_type}")

if __name__ == "__main__":
    main()
