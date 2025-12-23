#!/usr/bin/env python3

import json
import hashlib
from datetime import datetime
import sys

def fuse(a, b):
    blob = {
        "audio": a,
        "light": b,
        "time": datetime.utcnow().isoformat()
    }
    h = hashlib.sha256(json.dumps(blob, sort_keys=True).encode()).hexdigest()
    return {
        "state": "/÷",
        "residual": h,
        "meta": {
            "audio_entropy": a.get("entropy"),
            "light_entropy": b.get("entropy")
        }
    }

if __name__ == "__main__":
    a = json.loads(sys.argv[1])
    b = json.loads(sys.argv[2])
    print(fuse(a, b))
