#!/usr/bin/env python3
import os, time, random, datetime, subprocess

REPO   = "/data/data/com.termux/files/home/mongoose.os"
TOKENS = f"{REPO}/infinity_tokens"
os.makedirs(TOKENS, exist_ok=True)

# 1930s Dials & Gauges
DIALS = [
    "[◉---------]  12.4 kHz",
    "[--◉-------]  31.8 kHz",
    "[----◉-----]  62.9 kHz",
    "[------◉---] 108.2 kHz",
    "[--------◉-] 149.7 kHz",
    "[---------◉] 201.4 kHz",
]

METERS = [
    "▁▂▃▄▅▆▇█  Anode Voltage",
    "█▇▆▅▄▃▂▁  Field Frequency",
    "▂▅█▅▂     Flux Density",
    "▄█▄       Quantum Load",
    "█▆▄▂      Substrate Gain",
]

COL = [
    "\033[92m","\033[96m","\033[93m","\033[95m",
    "\033[94m","\033[91m","\033[38;5;208m","\033[38;5;51m"
]
RESET = "\033[0m"

RESEARCH = [
    {
        "vector":   "INF VECTORIZE: hydrogen-portal resonance mapping.",
        "substrate":"Substrate: oxide-copper cell under RF excitation.",
        "order":    "Order: nonlinear — emergent harmonics detected."
    },
    {
        "vector":   "INF VECTORIZE: electron spin coherence alignment.",
        "substrate":"Substrate: doped semiconductor ribbon.",
        "order":    "Order: mixed — linear in baseband, nonlinear in sidebands."
    },
    {
        "vector":   "INF VECTORIZE: sublimation of charge carriers.",
        "substrate":"Substrate: triode vacuum array under pulsed gating.",
        "order":    "Order: nonlinear — memory effects observed."
    },
    {
        "vector":   "INF VECTORIZE: vibrational hydrogen mode coupling.",
        "substrate":"Substrate: gas cell in standing-wave cavity.",
        "order":    "Order: nonlinear — frequency cascade detected."
    }
]

def fake_hashrate():
    return f"{round(random.uniform(480, 620), 2)} TH/s"

def fake_btc_reward():
    return f"{random.uniform(0.00000080, 0.00000350):.8f}"

def fake_inf_value():
    return f"{round(random.uniform(120, 950), 2)} INF"

def choose_research():
    return random.choice(RESEARCH)

def mint_token():
    token_id = f"INF-{random.randint(10000000,99999999)}"
    r = choose_research()

    content = f"""Token: {token_id}
Timestamp: {datetime.datetime.now(datetime.UTC).isoformat()}
Infinity Value: {fake_inf_value()}

{r["vector"]}
{r["substrate"]}
{r["order"]}

Purpose:
  This research run is a simulated quantum-routing experiment.
  Infinity OS uses these parameters for Octave-Quantum planning.
"""
    with open(f"{TOKENS}/{token_id}.txt","w") as f:
        f.write(content)

    return token_id, r

def push():
    subprocess.run(["git","add","infinity_tokens/"], cwd=REPO)
    subprocess.run(["git","commit","-m","∞ Research Reactor Block"], cwd=REPO)
    subprocess.run(["git","push","origin","main"], cwd=REPO)

BLOCK_DELAY = 1.5   
PUSH_EVERY  = 4    

count = 1

while True:
    color = random.choice(COL)
    dial  = random.choice(DIALS)
    meter = random.choice(METERS)

    token_id, r = mint_token()

    print(color + f"""
══════════════════════════════════════════════════════════
    📻 INFINITY RESEARCH REACTOR — MODEL 1937-A
──────────────────────────────────────────────────────────
  Block: {count}
  Dial:    {dial}
  Meter:   {meter}
──────────────────────────────────────────────────────────
  ⚡ Hashrate:            {fake_hashrate()}
  ₿ BTC (simulated):      {fake_btc_reward()}
  ∞ Infinity Value:        {fake_inf_value()}
──────────────────────────────────────────────────────────
  {r["vector"]}
  {r["substrate"]}
  {r["order"]}
──────────────────────────────────────────────────────────
  Token Minted → {token_id}
══════════════════════════════════════════════════════════
""" + RESET)

    if count % PUSH_EVERY == 0:
        print("💾 Syncing tokens → GitHub…")
        push()

    count += 1
    time.sleep(BLOCK_DELAY)
