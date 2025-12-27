#!/usr/bin/env python3
import time, random, datetime, subprocess, os

REPO = "/data/data/com.termux/files/home/mongoose.os"
TOKENS = f"{REPO}/infinity_tokens"
os.makedirs(TOKENS, exist_ok=True)

# ⚡ MASSIVE COLOR WAVE SET
COLORS = [
    "\033[31m","\033[32m","\033[33m","\033[34m","\033[35m","\033[36m",
    "\033[91m","\033[92m","\033[93m","\033[94m","\033[95m","\033[96m",
    "\033[37m","\033[97m","\033[90m","\033[38;5;51m","\033[38;5;93m",
    "\033[38;5;118m","\033[38;5;208m","\033[38;5;198m"
]
RESET="\033[0m"

LORE = [
    "Hydrogen gateway shimmering…",
    "Infinity Mesh humming softly…",
    "Retro Pixel Flux vibrating…",
    "NASA quantum drift oscillating…",
    "Mongoose Engine waking the lattice…",
    "Neutrino pulse phasing matter…",
    "IBM resonance stabilizing time thread…",
    "Octave-OS harmonic chord aligned…"
]

# ⚡ SPEED CONTROL
SCROLL_SPEED = 0.5   # faster movement (change to 0.3 for turbo)
PUSH_DELAY   = 10    # push every 10 blocks for safety

def mint_token():
    token_id = f"INF-{random.randint(10000000,99999999)}"
    path = f"{TOKENS}/{token_id}.txt"
    content = f"""Token: {token_id}
Timestamp: {datetime.datetime.now(datetime.UTC).isoformat()}
Lore: {random.choice(LORE)}
"""

    with open(path,"w") as f:
        f.write(content)

    return token_id

def push():
    subprocess.run(["git","add","infinity_tokens/"], cwd=REPO)
    subprocess.run(["git","commit","-m","∞ Scroll Miner"], cwd=REPO)
    subprocess.run(["git","push","origin","main"], cwd=REPO)

counter = 1
while True:
    color = random.choice(COLORS)
    lore  = random.choice(LORE)
    token = mint_token()

    print(color + f"""
╔══════════════════════════════════════════════════════╗
 🔱 INFINITY BLOCK #{counter}
 🔗 Token: {token}
 💫 Motion: COLOR-WAVE ACTIVE
 📜 Lore: {lore}
 🕒 Time: {datetime.datetime.now().strftime('%H:%M:%S')}
╚══════════════════════════════════════════════════════╝
""" + RESET)

    if counter % PUSH_DELAY == 0:
        print("💾 Slow Push Active → GitHub Syncing…")
        push()

    counter += 1
    time.sleep(SCROLL_SPEED)
