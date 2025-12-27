#!/usr/bin/env python3

import hashlib
import json
import time
import uuid

QUANT_SESSION = str(uuid.uuid4())

def snapshot(payload):
    snap = {
        "session": QUANT_SESSION,
        "time": time.time(),
        "keys": sorted(payload.keys()) if isinstance(payload, dict) else [],
        "sizes": {k: len(str(payload[k])) for k in payload} if isinstance(payload, dict) else {}
    }
    return snap

def quantize(payload):
    snap = snapshot(payload)
    encoded = json.dumps(snap, sort_keys=True).encode()
    digest = hashlib.sha256(encoded).hexdigest()

    return {
        "state": "/÷",
        "hash": digest,
        "snapshot": snap
    }

def pull_request(hash_value, layers):
    req = {
        "hash": hash_value,
        "layers": layers,
        "time": time.time()
    }
    encoded = json.dumps(req, sort_keys=True).encode()
    return hashlib.sha256(encoded).hexdigest()

def run(payload):
    return quantize(payload)

if __name__ == "__main__":
    sample = {
        "text": "quantized residual state",
        "media": ["graph", "video"],
        "ports": ["main_stage", "side_panel"]
    }

    collapsed = run(sample)
    print(collapsed)

    response = pull_request(collapsed["hash"], ["media", "ports"])
    print({"pull_hash": response})
