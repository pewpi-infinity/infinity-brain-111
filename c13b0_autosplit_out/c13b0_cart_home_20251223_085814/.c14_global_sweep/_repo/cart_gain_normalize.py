#!/usr/bin/env python3

from datetime import datetime
import uuid

CART_ID = str(uuid.uuid4())

def run(payload=None):
    return {
        "cart": __file__,
        "id": CART_ID,
        "time": datetime.utcnow().isoformat(),
        "payload": payload
    }

if __name__ == "__main__":
    print(run())
