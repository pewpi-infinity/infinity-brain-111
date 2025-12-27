#!/usr/bin/env python3

import json
import sys

ALPHA = 0.7  # reinforcement weight
BETA = 0.3   # decay weight

def balance(reinforced, decayed):
    blended = (ALPHA * reinforced) + (BETA * decayed)
    return round(min(1.0, max(0.0, blended)), 6)

if __name__ == "__main__":
    data = json.loads(sys.argv[1])
    print({
        "confidence_balanced": balance(
            data["confidence_reinforced"],
            data.get("decayed_confidence", 0.0)
        )
    })
