#!/usr/bin/env python3

import json

def route(event, forks):
    res = event.get("residual")
    if res not in forks:
        return "main"

    for branch, info in forks[res]["branches"].items():
        if event.get("node") in info["nodes"]:
            return branch

    return "main"

if __name__ == "__main__":
    import sys
    event = json.loads(sys.argv[1])
    forks = json.loads(sys.stdin.read())
    print(route(event, forks))
