#!/usr/bin/env python3
"""
Light Wrapper (Pure Python, stdlib only)

Accepts:
- PGM (P2 text grayscale)
- CSV / TXT numeric grids

Reduces light to finite symbols
Feeds Wave Residual Engine
"""

import sys
from cart_wave_residual_engine import analyze

# -------------------------
# CONFIG
# -------------------------
GRID_STEP = 8        # spatial bucketing
INTENSITY_STEP = 16  # quantization

# -------------------------
# LOAD PGM (P2)
# -------------------------
def load_pgm(filename):
    with open(filename, "r") as f:
        lines = [l for l in f.readlines() if not l.startswith("#")]

    assert lines[0].strip() == "P2", "Only P2 PGM supported"

    width, height = map(int, lines[1].split())
    maxval = int(lines[2])

    pixels = []
    for line in lines[3:]:
        pixels.extend(int(v) for v in line.split())

    return width, height, pixels

# -------------------------
# GRID → SYMBOLS
# -------------------------
def pixels_to_symbols(w, h, pixels):
    symbols = []
    for y in range(0, h, GRID_STEP):
        for x in range(0, w, GRID_STEP):
            block = []
            for dy in range(GRID_STEP):
                for dx in range(GRID_STEP):
                    ix = (y + dy) * w + (x + dx)
                    if ix < len(pixels):
                        block.append(pixels[ix])
            if block:
                avg = sum(block) // len(block)
                symbols.append(avg // INTENSITY_STEP)
    return symbols

# -------------------------
# MAIN
# -------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: ./cart_wrap_light.py <image.pgm>")
        sys.exit(1)

    fname = sys.argv[1]
    w, h, pixels = load_pgm(fname)
    symbols = pixels_to_symbols(w, h, pixels)

    result = analyze(
        symbols,
        label=f"light:{fname}"
    )

    print(result)
