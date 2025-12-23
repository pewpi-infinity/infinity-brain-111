#!/usr/bin/env python3

import subprocess
import os
from datetime import datetime

STAMP = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
DIR = f"export_snapshot_{STAMP}"

def run(cmd):
    subprocess.run(cmd, shell=True, check=True)

def export():
    os.makedirs(DIR, exist_ok=True)

    run(f"./cart_export_ledger_json.py && mv export_ledger.json {DIR}/")
    run(f"./cart_export_confidence_json.py < export_confidence.json 2>/dev/null || true")
    run(f"./cart_export_graph_json.py < export_graph.json 2>/dev/null || true")

    return {"snapshot": DIR}

if __name__ == "__main__":
    print(export())
