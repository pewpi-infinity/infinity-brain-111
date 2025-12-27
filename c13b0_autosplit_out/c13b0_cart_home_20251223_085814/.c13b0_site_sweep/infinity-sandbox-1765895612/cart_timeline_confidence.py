#!/usr/bin/env python3

import json
import sys
from datetime import datetime
from collections import defaultdict

HALF_LIFE_MIN = 60

def decay(c, minutes):
    return c * (0.5 ** (minutes / HALF_LIFE_MIN))

def timeline(records):
    out = defaultdict(float)
    now = datetime.utcnow()

    for r in records:
        c = r.get("confidence", 0)
        t = datetime.fromisoformat(r["time"])
        minutes = (now - t).total_seconds() / 60.0
        out[r["time"]] = round(decay(c, minutes), 6)

    return dict(out)

if __name__ == "__main__":
    records = json.loads(sys.stdin.read())
    print(timeline(records))
