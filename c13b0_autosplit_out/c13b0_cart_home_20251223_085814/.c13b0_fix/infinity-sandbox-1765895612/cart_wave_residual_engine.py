#!/usr/bin/env python3
"""
Wave Residual Engine
Pure Python, no external dependencies

This engine does NOT capture waves.
It analyzes STRUCTURE of provided sequences
to detect recurrence, entropy, and residual memory.
"""

from collections import Counter
from datetime import datetime
import math
import hashlib
import json
import sys

ENGINE_ID = "WRE-001"

# -------------------------
# CORE: DISCRETE ENTROPY
# -------------------------
def entropy(symbols):
    if not symbols:
        return 0.0
    counts = Counter(symbols)
    total = sum(counts.values())
    e = 0.0
    for c in counts.values():
        p = c / total
        e -= p * math.log2(p)
    return round(e, 6)

# -------------------------
# CORE: RECURRENCE
# -------------------------
def recurrence(symbols, top=10):
    counts = Counter(symbols)
    return counts.most_common(top)

# -------------------------
# CORE: TRANSITIONS
# -------------------------
def transitions(symbols):
    trans = Counter()
    for a, b in zip(symbols, symbols[1:]):
        trans[(a, b)] += 1
    return trans.most_common(10)

# -------------------------
# CORE: RESIDUAL HASH
# -------------------------
def residual_hash(data):
    blob = json.dumps(data, sort_keys=True).encode()
    return hashlib.sha256(blob).hexdigest()

# -------------------------
# ANALYZE ANY SEQUENCE
# -------------------------
def analyze(symbols, label="unknown"):
    ent = entropy(symbols)
    rec = recurrence(symbols)
    trans = transitions(symbols)

    payload = {
        "engine": ENGINE_ID,
        "label": label,
        "time": datetime.utcnow().isoformat(),
        "length": len(symbols),
        "entropy": ent,
        "recurrence": rec,
        "transitions": trans
    }

    payload["residual"] = residual_hash(payload)
    return payload

# -------------------------
# CLI ENTRY
# -------------------------
if __name__ == "__main__":
    # Example: manual sequence (finite, discrete)
    example = [10,10,12,10,15,12,10,15,15,10,12,10]

    result = analyze(example, label="example_sequence")
    print(json.dumps(result, indent=2))
