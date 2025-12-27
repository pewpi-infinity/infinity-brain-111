#!/usr/bin/env python3

import math
from collections import Counter
from datetime import datetime

def shannon_entropy(items):
    if not items:
        return 0.0
    counts = Counter(items)
    total = sum(counts.values())
    entropy = 0.0
    for c in counts.values():
        p = c / total
        entropy -= p * math.log2(p)
    return entropy

def weight_snapshot(snapshot):
    keys = snapshot.get("keys", [])
    sizes = snapshot.get("sizes", {})
    values = list(sizes.values())

    key_entropy = shannon_entropy(keys)
    size_entropy = shannon_entropy(values)

    weight = round((key_entropy + size_entropy), 6)

    return {
        "time": datetime.utcnow().isoformat(),
        "entropy": weight,
        "key_entropy": key_entropy,
        "size_entropy": size_entropy
    }

def run(quant_state):
    snap = quant_state.get("snapshot", {})
    return weight_snapshot(snap)

if __name__ == "__main__":
    sample = {
        "snapshot": {
            "keys": ["text", "media", "ports"],
            "sizes": {"text": 120, "media": 2, "ports": 1}
        }
    }
    print(run(sample))
