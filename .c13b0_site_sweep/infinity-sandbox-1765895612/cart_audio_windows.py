#!/usr/bin/env python3

import wave
import struct

def windows(filename, window_size=1024):
    with wave.open(filename, "rb") as wf:
        frames = wf.readframes(wf.getnframes())
        samples = struct.unpack("<" + "h" * (len(frames)//2), frames)

    buckets = []
    for i in range(0, len(samples), window_size):
        window = samples[i:i+window_size]
        if not window:
            continue
        avg = sum(abs(s) for s in window) // len(window)
        buckets.append(avg)

    return {
        "windows": buckets,
        "count": len(buckets)
    }

if __name__ == "__main__":
    print(windows("audio_capture.wav"))
