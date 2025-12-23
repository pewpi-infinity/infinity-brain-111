#!/usr/bin/env python3

import sys
import json

THRESHOLD = 1.0

def gate(record):
    e = record.get("entropy") or record.get("meta", {}).get("audio_entropy", 0)
    return {
        "accept": e >= THRESHOLD,
        "entropy": e,
        "threshold": THRESHOLD
    }

if __name__ == "__main__":
    rec = json.loads(sys.argv[1])
    print(gate(rec))
