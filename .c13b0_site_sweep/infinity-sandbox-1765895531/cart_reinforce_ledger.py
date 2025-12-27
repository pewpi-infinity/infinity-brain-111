#!/usr/bin/env python3

import json
from collections import Counter

LEDGER = "residual_ledger.jsonl"

def reinforce_all():
    records = []
    with open(LEDGER, "r") as f:
        for line in f:
            records.append(json.loads(line))

    counts = Counter(r.get("residual") for r in records if "residual" in r)

    out = []
    for r in records:
        res = r.get("residual")
        conf = r.get("confidence", 0.0)
        occ = counts.get(res, 1)
        boosted = min(1.0, conf + (occ - 1) * 0.15)
        out.append({
            "time": r["time"],
            "residual": res,
            "confidence_reinforced": round(boosted, 6),
            "occurrences": occ
        })
    return out

if __name__ == "__main__":
    print(reinforce_all())
