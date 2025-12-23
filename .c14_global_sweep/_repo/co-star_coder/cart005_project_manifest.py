#!/usr/bin/env python3
"""
cart005_project_manifest
Generates project.json — the spine of co-star_coder.
"""

import json
from datetime import datetime

def main():
    with open("intent.json") as f:
        intent = json.load(f)

    project = {
        "name": "co-star-generated-site",
        "created_at": datetime.utcnow().isoformat() + "Z",
        "intent": intent["intent_raw"],
        "site_type": intent.get("site_type"),
        "scope": intent.get("scope"),
        "constraints": intent.get("constraints"),
        "status": "initialized"
    }

    with open("project.json", "w") as f:
        json.dump(project, f, indent=2)

    print("[✓] project.json created")

if __name__ == "__main__":
    main()
