#!/usr/bin/env python3

import subprocess
import json

def run(cmd):
    return subprocess.check_output(cmd, shell=True, text=True)

if __name__ == "__main__":
    # example placeholders; swap with your real calls
    audio = json.loads(run("./cart_wrap_audio.py audio.wav"))
    light = json.loads(run("./cart_wrap_light.py frame.pgm"))
    fused = json.loads(run(f"./cart_cross_fuse.py '{json.dumps(audio)}' '{json.dumps(light)}'"))
    print(run(f"./cart_ledger_append.py '{json.dumps(fused)}'"))
