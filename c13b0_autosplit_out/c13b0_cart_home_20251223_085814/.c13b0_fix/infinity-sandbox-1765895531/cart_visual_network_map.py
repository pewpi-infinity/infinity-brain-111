#!/usr/bin/env python3

import json
import uuid
from datetime import datetime

VISUAL_ID = "VISUAL-" + str(uuid.uuid4())[:8]

def build_node(node_id, local_hash, remote_hash, agreement):
    return {
        "node": node_id,
        "local": local_hash,
        "remote": remote_hash,
        "agreement": agreement
    }

def build_visual(network_states):
    return {
        "visual_id": VISUAL_ID,
        "time": datetime.utcnow().isoformat(),
        "layout": "spiderweb",
        "state": "/÷",
        "nodes": network_states
    }

def render(payload):
    return json.dumps(payload, indent=2)

if __name__ == "__main__":
    sample_nodes = [
        build_node("NODE-A1", "hashA", "hashB", "agree1"),
        build_node("NODE-B2", "hashB", "hashC", "agree2"),
        build_node("NODE-C3", "hashC", "hashA", "agree3")
    ]

    visual = build_visual(sample_nodes)
    print(render(visual))
