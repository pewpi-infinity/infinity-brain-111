#!/usr/bin/env python3

import json
from datetime import datetime

HALF_LIFE_MIN = 120

def decay(trust, last_seen):
    now = datetime.utcnow()
    minutes = (now - datetime.fromisoformat(last_seen)).total_seconds() / 60
    factor = 0.5 ** (minutes / HALF_LIFE_MIN)
    return round(trust * factor, 6)

if __name__ == "__main__":
    import sys
    node = json.loads(sys.argv[1])
    print({
        "trust_decayed": decay(node["trust"], node["first_seen"])
    })
