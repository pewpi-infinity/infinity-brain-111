#!/usr/bin/env python3

import json
from datetime import datetime
from collections import defaultdict

LEDGER = "residual_ledger.jsonl"

def bucket(ts, granularity="minute"):
    dt = datetime.fromisoformat(ts)
    if granularity == "hour":
        return dt.strftime("%Y-%m-%d %H:00")
    return dt.strftime("%Y-%m-%d %H:%M")

def index(granularity="minute"):
    buckets = defaultdict(list)
    with open(LEDGER, "r") as f:
        for line in f:
            r = json.loads(line)
            key = bucket(r["time"], granularity)
            buckets[key].append(r.get("residual"))
    return dict(buckets)

if __name__ == "__main__":
    print(index())
