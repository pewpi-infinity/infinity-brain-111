#!/usr/bin/env python3

import json
import sys

GAIN = 0.15   # reinforcement per recurrence
CAP = 1.0     # max confidence

def reinforce(record, occurrences):
    base = record.get("confidence", 0.0)
    boosted = min(CAP, base + (occurrences * GAIN))
    return {
        "confidence_reinforced": round(boosted, 6),
        "base_confidence": base,
        "occurrences": occurrences
    }

if __name__ == "__main__":
    record = json.loads(sys.argv[1])
    occ = int(sys.argv[2])
    print(reinforce(record, occ))
