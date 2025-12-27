#!/usr/bin/env python3

import json
import sys

def changes(buckets):
    keys = sorted(buckets.keys())
    result = []
    prev = None
    for k in keys:
        count = len(buckets[k])
        if prev is not None:
            delta = count - prev
            if abs(delta) > 1:
                result.append({
                    "time": k,
                    "delta": delta
                })
        prev = count
    return result

if __name__ == "__main__":
    buckets = json.loads(sys.stdin.read())
    print(changes(buckets))
