#!/usr/bin/env python3

import subprocess
from datetime import datetime

OUTFILE = "audio_capture.wav"
DURATION = "5"

def record():
    subprocess.run([
        "arecord",
        "-d", DURATION,
        "-f", "cd",
        "-t", "wav",
        OUTFILE
    ], check=True)

    return {
        "file": OUTFILE,
        "duration": int(DURATION),
        "time": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    print(record())
