#!/usr/bin/env python3

import sys
import json

def render(conf):
    lines = []
    for t in sorted(conf.keys()):
        bars = "#" * int(conf[t] * 20)
        lines.append(f"{t} | {bars}")
    return "\n".join(lines)

if __name__ == "__main__":
    conf = json.loads(sys.stdin.read())
    print(render(conf))
