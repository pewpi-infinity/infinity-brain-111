#!/usr/bin/env python3

import json
import csv
import sys

OUT = "export_timeline.csv"

def export(timeline):
    with open(OUT, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["time", "value"])
        for k in sorted(timeline.keys()):
            writer.writerow([k, timeline[k]])
    return {"file": OUT}

if __name__ == "__main__":
    timeline = json.loads(sys.stdin.read())
    print(export(timeline))
