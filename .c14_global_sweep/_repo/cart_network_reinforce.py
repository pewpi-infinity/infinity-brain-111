#!/usr/bin/env python3

import json
from collections import Counter

GAIN = 0.2
CAP = 1.0

def reinforce(records):
    by_residual = Counter()
    for r in records:
        if "residual" in r and "node" in r:
            by_residual[(r["residual"], r["node"])] += 1

    trust = {}
    for (res, node), count in by_residual.items():
        score = min(CAP, count * GAIN)
        trust.setdefault(node, {})
        trust[node][res] = round(score, 6)

    return trust

if __name__ == "__main__":
    import sys
    records = json.loads(sys.stdin.read())
    print(reinforce(records))
