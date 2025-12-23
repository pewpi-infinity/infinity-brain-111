#!/usr/bin/env python3

import json
import sys

OUT = "export_confidence.json"

def export(conf):
    with open(OUT, "w") as f:
        json.dump(conf, f, indent=2)
    return {"file": OUT}

if __name__ == "__main__":
    conf = json.loads(sys.stdin.read())
    print(export(conf))
