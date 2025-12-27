#!/usr/bin/env python3

import math
from collections import Counter

def entropy(symbols):
    counts = Counter(symbols)
    total = sum(counts.values())
    e = 0.0
    for c in counts.values():
        p = c / total
        e -= p * math.log2(p)
    return round(e, 6)

def run(windows):
    return {
        "entropy": entropy(windows),
        "symbols": len(set(windows))
    }

if __name__ == "__main__":
    print(run([10,10,12,10,15,12,10,15,15]))
