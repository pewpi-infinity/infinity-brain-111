#!/usr/bin/env python3

from collections import Counter
import json
import sys

def density(buckets):
    return {
        k: len(v)
        for k, v in buckets.items()
    }

if __name__ == "__main__":
    buckets = json.loads(sys.stdin.read())
    print(density(buckets))
