#!/usr/bin/env python3
"""
cart001_intent_listener
Captures user intent and normalizes it.
"""

import sys
import json
from datetime import datetime

def capture_intent():
    if len(sys.argv) > 1:
        intent = " ".join(sys.argv[1:])
    else:
        intent = input("Describe what you want to build (e.g. 'I need a landing page'): ").strip()

    payload = {
        "intent_raw": intent,
        "captured_at": datetime.utcnow().isoformat() + "Z"
    }

    with open("intent.json", "w") as f:
        json.dump(payload, f, indent=2)

    print("[✓] Intent captured → intent.json")

if __name__ == "__main__":
    capture_intent()
