#!/usr/bin/env python3
import os, time, random, datetime, subprocess

REPO   = "/data/data/com.termux/files/home/mongoose.os"
TOKENS = f"{REPO}/infinity_tokens"
os.makedirs(TOKENS, exist_ok=True)

COLORS = [
    "\033[92m","\033[93m","\033[95m","\033[96m",
    "\033[94m","\033[91m","\033[38;5;51m","\033[38;5;208m"
]
RESET = "\033[0m"

DIALS = [
    "[◉---------]  12.4 kHz",
    "[--◉-------]  31.8 kHz",
    "[----◉-----]  62.9 kHz",
    "[------◉---] 108.2 kHz",
    "[--------◉-] 149.7 kHz",
    "[---------◉] 201.4 kHz"
]

METERS = [
    "▁▂▃▄▅▆▇█  Research Flux",
    "█▇▆▅▄▃▂▁  Lattice Load",
    "▂▅█▅▂     Hydrogen Gate",
    "▄█▄       Portal Drift",
    "█▆▄▂      Coherence Gain"
]

RESEARCH_TOPICS = [
    "hydrogen-electron portal",
    "quantum-lattice coherence",
    "oxide-semiconductor resonance",
    "spin-vector tunneling",
    "nonlinear charge sublimation",
    "RF-driven vacuum triode membrane"
]

def slow_research():
    topic = random.choice(RESEARCH_TOPICS)
    depth  = random.randint(4,8)

    lines = []
    for i in range(depth):
        lines.append(
            f"  • {topic} — phase {i+1}: "
            f"{random.choice(['vector drift','substrate gain','harmonic rise','quantum bleed','field rebound','ionic cascade'])}, "
            f"{random.choice(['nonlinear regime','pre-coherence bloom','harmonic split','phase cascade','thermal flattening','carrier bloom'])}."
        )
    return "\n".join(lines)

def mint_token():
    token_id = f"INF-{random.randint(10000000,99999999)}"
    now = datetime.datetime.now(datetime.UTC).isoformat()

    content = f"""
Token: {token_id}
Timestamp: {now}

∞ Infinity Research Packet
──────────────────────────────────

{slow_research()}

──────────────────────────────────
Purpose:
  Night-cycle generation for Infinity Treasury.
  Data used for coherence mapping and Octave routing.
"""
    with open(f"{TOKENS}/{token_id}.txt","w") as f:
        f.write(content)

    return token_id

def safe_push():
    try:
        subprocess.run(["git","add","infinity_tokens/"], cwd=REPO)
        subprocess.run(["git","commit","-m","∞ Night Reactor batch"], cwd=REPO)
        subprocess.run(["git","push","origin","main"], cwd=REPO)
    except:
        pass

BLOCK_DELAY = 4.0     # slow and safe
PUSH_EVERY  = 10      # stable for GitHub

count = 1

while True:
    c = random.choice(COLORS)
    dial = random.choice(DIALS)
    meter = random.choice(METERS)

    token_id = mint_token()

    print(c + f"""
══════════════════════════════════════════════════════════
      🌙 INFINITY NIGHT RESEARCH REACTOR — Sleep Cycle
──────────────────────────────────────────────────────────
  Block: {count}
  Dial:   {dial}
  Meter:  {meter}
──────────────────────────────────────────────────────────
{slow_research()}
──────────────────────────────────────────────────────────
  Token Minted → {token_id}
══════════════════════════════════════════════════════════
""" + RESET)

    if count % PUSH_EVERY == 0:
        print("💾 Syncing tokens → GitHub…")
        safe_push()

    count += 1
    time.sleep(BLOCK_DELAY)
