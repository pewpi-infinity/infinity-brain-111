#!/usr/bin/env python3

import json
import sys

OUT = "export_graph.json"

def export(graph):
    with open(OUT, "w") as f:
        json.dump(graph, f, indent=2)
    return {"file": OUT}

if __name__ == "__main__":
    graph = json.loads(sys.stdin.read())
    print(export(graph))
