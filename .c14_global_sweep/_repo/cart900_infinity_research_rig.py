#!/usr/bin/env python3
import hashlib, json, random, time, os
from datetime import datetime

OUTPUT_DIR = "infinity_tokens"
os.makedirs(OUTPUT_DIR, exist_ok=True)

TERMS = [
    # Periodic elements
    "Hydrogen", "Helium", "Carbon", "Oxygen", "Neon", "Silicon", "Iron", "Copper",
    "Gold", "Uranium", "Platinum", "Lithium", "Cobalt", "Nickel", "Titanium",

    # Electronic components
    "Diode", "Capacitor", "Resistor", "Transistor", "MOSFET", "IGBT",
    "Inductor", "Bridge Rectifier", "Op-Amp", "Clock crystal", "EEPROM",
    
    # Natural bio-capacitors / semiconductors
    "Neuronal Membrane Potential",
    "Mitochondrial Electron Pump",
    "Ionic Gradient Semiconductor",
    "Bio-capacitive Tissue Layer",
    "Photosynthetic Charge Carrier",
    "Protein Folding Resonance",
    "Cell Membrane RC Network"
]

COLORS = ["PURPLE", "GREEN", "YELLOW", "RED"]

def make_hash(text):
    return hashlib.sha256(text.encode()).hexdigest()

def write_token(term, idx):
    value = random.randint(1300, 5000)
    color = random.choice(COLORS)
    timestamp = datetime.utcnow().isoformat()

    payload = f"""
============================================================
∞ NEW INFINITY RESEARCH TOKEN
HASH: {make_hash(term + str(time.time()))}
VALUE: {value}
COLOR: {color}
---------------------------------------------------------
# ∞ Infinity Research Article — {term}

### Token #{idx}
### Infinity Value: {value}
### Color State: {color}
### Generated: {timestamp}
---

## Executive Summary
{term} is analyzed within the Infinity OS scientific index,
exploring its electrical behavior, quantum structure, and
economic–research usefulness within Infinity Bank systems.

## Main Scientific Findings
(Full research auto-generated and appended by downstream engines.)

============================================================
"""
    filename = f"{OUTPUT_DIR}/token_{idx:06d}_{term.replace(' ','_')}.txt"
    with open(filename, "w") as f:
        f.write(payload)

    print(f"[∞] Minted {filename}")

def main():
    print("=== ∞ Infinity Research Rig 900 Starting Up ===")
    idx = 5000

    while True:
        term = random.choice(TERMS)
        write_token(term, idx)
        idx += 1
        time.sleep(1)  # steady research mining pulse

if __name__ == "__main__":
    main()
