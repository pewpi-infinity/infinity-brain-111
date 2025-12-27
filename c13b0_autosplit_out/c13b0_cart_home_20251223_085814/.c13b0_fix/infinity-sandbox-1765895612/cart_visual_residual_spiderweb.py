#!/usr/bin/env python3
"""
Residual Spiderweb Visualizer
Pure Python, stdlib only

Input: list of residual records
Output: ASCII spiderweb + JSON graph
"""

from collections import defaultdict
import json
import math
from datetime import datetime

def build_graph(residuals):
    nodes = {}
    edges = defaultdict(int)

    for r in residuals:
        h = r.get("residual") or r.get("hash")
        if not h:
            continue
        nodes[h] = nodes.get(h, 0) + 1

    keys = list(nodes.keys())
    for i in range(len(keys)):
        for j in range(i + 1, len(keys)):
            # simple proximity by prefix similarity
            a, b = keys[i], keys[j]
            weight = sum(1 for x, y in zip(a, b) if x == y)
            if weight > 4:
                edges[(a, b)] += weight

    return nodes, edges

def ascii_spiderweb(nodes, edges, max_width=60):
    if not nodes:
        return "[no nodes]"

    center = max(nodes, key=lambda k: nodes[k])
    lines = []
    lines.append(f"        ({center[:8]})")
    lines.append("             |")

    for (a, b), w in edges.items():
        if center in (a, b):
            other = b if a == center else a
            dashes = "-" * min(max_width, max(3, w))
            lines.append(f"({other[:8]}) {dashes}>")

    return "\n".join(lines)

def json_graph(nodes, edges):
    return {
        "time": datetime.utcnow().isoformat(),
        "nodes": [{"id": k, "weight": v} for k, v in nodes.items()],
        "edges": [
            {"from": a, "to": b, "weight": w}
            for (a, b), w in edges.items()
        ]
    }

if __name__ == "__main__":
    # Example input (replace with ledger reads later)
    example_residuals = [
        {"residual": "a1b2c3d4e5"},
        {"residual": "a1b2c3ffff"},
        {"residual": "a1b2c3d4e5"},
        {"residual": "9999aaaa00"},
    ]

    nodes, edges = build_graph(example_residuals)

    print("ASCII SPIDERWEB:\n")
    print(ascii_spiderweb(nodes, edges))

    print("\nJSON GRAPH:\n")
    print(json.dumps(json_graph(nodes, edges), indent=2))
