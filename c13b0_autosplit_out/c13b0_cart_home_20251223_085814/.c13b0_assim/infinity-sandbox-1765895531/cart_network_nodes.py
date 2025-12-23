#!/usr/bin/env python3

import json
from datetime import datetime

NODES_FILE = "network_nodes.json"

def load():
    try:
        with open(NODES_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save(nodes):
    with open(NODES_FILE, "w") as f:
        json.dump(nodes, f, indent=2)

def register(node_id):
    nodes = load()
    if node_id not in nodes:
        nodes[node_id] = {
            "first_seen": datetime.utcnow().isoformat(),
            "events": 0,
            "trust": 0.0
        }
    nodes[node_id]["events"] += 1
    save(nodes)
    return nodes[node_id]

if __name__ == "__main__":
    import sys
    print(register(sys.argv[1]))
