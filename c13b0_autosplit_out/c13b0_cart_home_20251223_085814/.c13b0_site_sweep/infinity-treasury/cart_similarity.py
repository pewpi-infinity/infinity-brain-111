#!/usr/bin/env python3
import json, sys
import numpy as np
from pathlib import Path

if len(sys.argv) != 3:
    print("Usage: cart_similarity.py vecA.json vecB.json")
    sys.exit(1)

def load_vec(p):
    return np.array(json.loads(Path(p).read_text())["vector"])

v1 = load_vec(sys.argv[1])
v2 = load_vec(sys.argv[2])

sim = float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
print(f"cosine_similarity={sim:.6f}")
