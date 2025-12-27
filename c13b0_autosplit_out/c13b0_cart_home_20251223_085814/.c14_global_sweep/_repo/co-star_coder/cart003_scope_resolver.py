#!/usr/bin/env python3
"""
cart003_scope_resolver
Resolves project scope based on intent & type.
"""

import json

def resolve_scope(site_type, intent):
    if "one page" in intent or "single" in intent:
        return {"pages": 1, "complexity": "low"}
    if site_type in ("blog", "docs"):
        return {"pages": 5, "complexity": "medium"}
    if site_type in ("saas", "store"):
        return {"pages": 7, "complexity": "high"}
    return {"pages": 3, "complexity": "low"}

def main():
    with open("intent.json") as f:
        data = json.load(f)

    scope = resolve_scope(data.get("site_type", ""), data["intent_raw"])
    data["scope"] = scope

    with open("intent.json", "w") as f:
        json.dump(data, f, indent=2)

    print(f"[✓] Scope resolved → {scope}")

if __name__ == "__main__":
    main()
