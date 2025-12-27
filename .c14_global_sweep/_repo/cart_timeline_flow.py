#!/usr/bin/env python3

from collections import Counter
import json
import sys

def flow(buckets):
    c = Counter()
    for v in buckets.values():
        c.update(v)
    return {
        "persistent": c.most_common(10),
        "unique": len(c)
    }

if __name__ == "__main__":
    buckets = json.loads(sys.stdin.read())
    print(flow(buckets))
