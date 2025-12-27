#!/usr/bin/env python3

import json
import sys
from datetime import datetime

HALF_LIFE_MIN = 60  # minutes

def decay(confidence, then_iso):
    then = datetime.fromisoformat(then_iso)
    now = datetime.utcnow()
    minutes = (now - then).total_seconds() / 60.0
    factor = 0.5 ** (minutes / HALF_LIFE_MIN)
    return round(confidence * factor, 6)

if __name__ == "__main__":
    data = json.loads(sys.argv[1])
    print({
        "decayed_confidence": decay(
            data["confidence"],
            data["time"]
        )
    })
