#!/usr/bin/env python3

import subprocess
from datetime import datetime

OUTFILE = "light_frame.jpg"

def capture():
    subprocess.run([
        "ffmpeg",
        "-y",
        "-f", "video4linux2",
        "-i", "/dev/video0",
        "-frames:v", "1",
        OUTFILE
    ], check=True)

    return {
        "file": OUTFILE,
        "time": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    print(capture())
