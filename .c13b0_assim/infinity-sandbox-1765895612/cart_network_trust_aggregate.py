#!/usr/bin/env python3

import json

def aggregate(trust_map):
    out = {}
    for node, res_map in trust_map.items():
        values = list(res_map.values())
        out[node] = round(sum(values) / len(values), 6) if values else 0.0
    return out

if __name__ == "__main__":
    import sys
    trust = json.loads(sys.stdin.read())
    print(aggregate(trust))
