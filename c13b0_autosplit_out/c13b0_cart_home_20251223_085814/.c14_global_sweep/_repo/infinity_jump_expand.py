#!/usr/bin/env python3
import datetime, os

# -------------------------------------
# COLOR PROTOCOL (your OS rules)
# -------------------------------------
COLOR_MAP = {
    "data": "YELLOW",
    "direct": "PURPLE",
    "tools": "GREEN",
    "business": "ORANGE",
    "investigation": "PINK",
    "adjacent": "RED",
    "payment": "BLUE"
}

# -------------------------------------
# SUBTOPIC EXPANSIONS PER SOURCE
# -------------------------------------
EXPANSIONS = {
    "NASA": [
        ("Hydrogen Lattice",      "direct"),
        ("Hydrogen Vectors",      "direct"),
        ("Hydrogen Wind Models",  "data"),
        ("Atomic Lift Ratios",    "investigation"),
        ("Helium Transformations","adjacent")
    ],
    "Tesla": [
        ("Hydrogen Coils",        "tools"),
        ("Magnetic Hydrogen",     "investigation"),
        ("Spectral Hydrogen",     "direct"),
    ],
    "ITT": [
        ("Hydrogen Pressure Cells", "tools"),
        ("Ion Drift Hydrogen",      "investigation"),
    ],
    "IBM": [
        ("Quantum Hydrogen Gate",   "direct"),
        ("Spectral Routing",        "direct"),
        ("Proton Wave Functions",   "investigation")
    ]
}

# -------------------------------------
# TOKEN WRITER
# -------------------------------------
def write_token(source, topic, color):
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"JUMP_TOKEN_{source}_{topic.replace(' ','_')}_{now}.txt"

    with open(filename, "w") as f:
        f.write(f"Token Source: {source}\n")
        f.write(f"Topic: {topic}\n")
        f.write(f"Token Color: {color}\n")
        f.write(f"Birth: {now}\n")

    print(f"[∞] Spawned token: {filename}")

# -------------------------------------
# MAIN JUMP EXPAND FUNCTION
# -------------------------------------
def expand_jump_to(source):
    print(f"\n[∞] Expanding Jump-To: {source}\n")

    if source not in EXPANSIONS:
        print("[!] No expansions found.")
        return

    for topic, color_key in EXPANSIONS[source]:
        color = COLOR_MAP[color_key]
        write_token(source, topic, color)

