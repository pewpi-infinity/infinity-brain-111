#!/usr/bin/env python3

import sys
import json

def render(density):
    lines = []
    for t in sorted(density.keys()):
        bars = "#" * density[t]
        lines.append(f"{t} | {bars}")
    return "\n".join(lines)

if __name__ == "__main__":
    density = json.loads(sys.stdin.read())
    print(render(density))
