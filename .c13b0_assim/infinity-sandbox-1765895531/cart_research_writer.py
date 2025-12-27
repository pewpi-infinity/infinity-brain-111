#!/usr/bin/env python3
import os, json, datetime, random, re

TERMS_FILE = "research_terms.txt"
OUTPUT_DIR = "research_out"

os.makedirs(OUTPUT_DIR, exist_ok=True)

def make_token_header(topic):
    token_number = random.randint(1000, 9999)
    token_value = random.randint(2000, 6000)
    colors = ["PURPLE", "GREEN", "YELLOW", "RED", "BLUE"]
    token_color = random.choice(colors)
    dt = datetime.datetime.now().isoformat()

    return f"""
∞ Infinity Research Paper ∞
============================================
Token #: {token_number}
Token Value: {token_value}
Token Color: {token_color}
Token Date & Time: {dt} / 00:00
Topic: {topic}
============================================
"""

def generate_body(topic):
    text = ""
    for i in range(1, 41):
        text += (
            f"\n\n### SECTION {i}: {topic.upper()}\n"
            f"Deep multi-page technical expansion exploring {topic}, "
            f"hydrogen-electron doorway theory, frequency harmonics, "
            f"quantum lattice mechanics, portal physics, and energetic "
            f"resonance behavior.\n\n"
            f"Mathematical Model {i}:\n"
            f"ψ(x) = e^(-x²) * sin({i}πx)\n"
        )
    return text

def generate_links(topic):
    engines = [
        "https://arxiv.org/search/?query=",
        "https://www.nature.com/search?q=",
        "https://ocw.mit.edu/search/?q=",
        "https://dash.harvard.edu/server/api/search?q=",
        "https://ui.adsabs.harvard.edu/v1/search/query?q=",
        "https://research.ibm.com/search?q="
    ]
    out = "\n## Reference Index (40 Sources)\n"
    for i in range(40):
        base = random.choice(engines)
        out += f"{i+1}. {base}{topic.replace(' ', '+')}\n"
    return out

with open(TERMS_FILE, "r") as f:
    terms = [t.strip() for t in f.readlines() if t.strip()]

for topic in terms:

    # ---- SAFE FILENAME ----
    base = re.sub(r'[^A-Za-z0-9_-]+', '_', topic)[:80]

    # ---- FIND NEXT AVAILABLE NEW FILE ----
    index = 1
    while True:
        fname = f"{base}_{index:04d}.txt"
        fullpath = os.path.join(OUTPUT_DIR, fname)
        if not os.path.exists(fullpath):
            break
        index += 1

    # ---- WRITE NEW RESEARCH FILE ONLY ----
    header = make_token_header(topic)
    summary = f"\n## Executive Summary\nFull-depth investigation into: {topic}\n"
    body = generate_body(topic)
    links = generate_links(topic)

    with open(fullpath, "w") as f:
        f.write(header)
        f.write(summary)
        f.write("\n\n## Full Research\n")
        f.write(body)
        f.write("\n")
        f.write(links)

    print(f"[∞] Wrote NEW → {fullpath}")

