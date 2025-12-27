#!/usr/bin/env python3

from collections import Counter
import sys
import json

def dedupe(residuals):
    hashes = [r.get("residual") for r in residuals if "residual" in r]
    counts = Counter(hashes)
    return {
        "unique": len(counts),
        "repeats": {k: v for k, v in counts.items() if v > 1}
    }

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    print(dedupe(data))
