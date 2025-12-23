#!/usr/bin/env python3

import hashlib
import json
import time
import uuid
from datetime import datetime

NODE_ID = "NODE-" + str(uuid.uuid4())[:8]

def snapshot(payload):
    snap = {
        "node": NODE_ID,
        "time": time.time(),
        "keys": sorted(payload.keys()) if isinstance(payload, dict) else [],
        "sizes": {k: len(str(payload[k])) for k in payload} if isinstance(payload, dict) else {}
    }
    return snap

def collapse(payload):
    snap = snapshot(payload)
    encoded = json.dumps(snap, sort_keys=True).encode()
    digest = hashlib.sha256(encoded).hexdigest()
    return {
        "state": "/÷",
        "hash": digest,
        "snapshot": snap
    }

def handshake(local_hash, remote_hash):
    link = {
        "local": local_hash,
        "remote": remote_hash,
        "node": NODE_ID,
        "time": datetime.utcnow().isoformat()
    }
    encoded = json.dumps(link, sort_keys=True).encode()
    return hashlib.sha256(encoded).hexdigest()

def sync(payload, remote_hash):
    local = collapse(payload)
    agreement = handshake(local["hash"], remote_hash)
    return {
        "node": NODE_ID,
        "local_hash": local["hash"],
        "remote_hash": remote_hash,
        "agreement": agreement,
        "time": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    sample_payload = {
        "text": "distributed residual state",
        "media": ["graph"],
        "ports": ["main_stage"]
    }

    remote_example_hash = "REMOTE_HASH_EXAMPLE"
    result = sync(sample_payload, remote_example_hash)
    print(result)
