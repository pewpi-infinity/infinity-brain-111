#!/usr/bin/env python3
import os, random, datetime, subprocess

REPO = "/data/data/com.termux/files/home/mongoose.os"
TOKENS = f"{REPO}/infinity_tokens"
os.makedirs(TOKENS, exist_ok=True)

COLORS = [
    "🔮 PURPLE","💚 GREEN","💛 GOLD","❤️ RED","🔵 BLUE",
    "🟣 VIOLET","🟠 ORANGE","🟡 URANIUM","⚪ STEEL","🟤 BRONZE"
]

RETRO = [
    "NES Vector","Atari Pulse","SNES Warp","Genesis Spin",
    "PlayStation Mode","GameBoy Dot"
]

NASA = [
    "Neutrino Drift","Quantum Membrane","Ion Flux","Solar Harmonic"
]

IBM = [
    "Watson Cognitive Mesh","IBM Lattice Resonance",
    "Neural Pattern Node","Quantum Insight Vector"
]

def mint(ebay=None):
    token = f"INF-{random.randint(10000000,99999999)}"
    color = random.choice(COLORS)
    retro = random.choice(RETRO)
    nasa  = random.choice(NASA)
    ibm   = random.choice(IBM)

    ebay_meta = ebay if ebay else "None"

    content = f"""
Token: {token}
Color: {color}
Retro Engine: {retro}
NASA Vector: {nasa}
IBM Insight: {ibm}
eBay Meta: {ebay_meta}
Timestamp: {datetime.datetime.utcnow().isoformat()}
"""

    with open(f"{TOKENS}/{token}.txt","w") as f:
        f.write(content)

    print("Minted:", token)
    return token

def push():
    subprocess.run(["git","add","infinity_tokens/"], cwd=REPO)
    subprocess.run(["git","commit","-m","∞ Token"], cwd=REPO)
    subprocess.run(["git","push","origin","main"], cwd=REPO)

if __name__ == "__main__":
    import sys
    ebay = sys.argv[1] if len(sys.argv) > 1 else None
    mint(ebay)
    push()
