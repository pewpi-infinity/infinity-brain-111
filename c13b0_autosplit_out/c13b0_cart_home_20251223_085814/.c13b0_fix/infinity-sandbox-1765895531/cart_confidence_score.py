#!/usr/bin/env python3

import json
import sys

def score(record):
    e = record.get("entropy") or record.get("meta", {}).get("audio_entropy", 0)
    # simple bounded normalization
    c = min(1.0, max(0.0, e / 3.0))
    return {
        "confidence": round(c, 6),
        "entropy": e
    }

if __name__ == "__main__":
    rec = json.loads(sys.argv[1])
    print(score(rec))
