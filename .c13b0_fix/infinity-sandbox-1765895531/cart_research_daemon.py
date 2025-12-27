#!/usr/bin/env python3
import os, time, random, datetime, re, subprocess

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
    for i in range(1, 21):  # 20 sections each loop = lighter + fast
        text += (
            f"\n\n### SECTION {i}: {topic.upper()}\n"
            f"Expanded multi-page analysis covering {topic}, quantum resonance, "
            f"hydrogen-electron doorway physics, energy bands, tunnel theory.\n\n"
            f"Model {i}:\nψ(x) = e^(-x²) * sin({i}πx)\n"
        )
    return text

def generate_links(topic):
    bases = [
        "https://arxiv.org/search/?query=",
        "https://www.nature.com/search?q=",
        "https://ocw.mit.edu/search/?q=",
        "https://dash.harvard.edu/server/api/search?q=",
        "https://ui.adsabs.harvard.edu/v1/search/query?q=",
        "https://research.ibm.com/search?q="
    ]
    out = "\n## Reference Index (40 Sources)\n"
    for i in range(40):
        out += f"{i+1}. {random.choice(bases)}{topic.replace(' ', '+')}\n"
    return out

def sanitize(topic):
    safe = re.sub(r'[^A-Za-z0-9_-]+', '_', topic)
    return safe[:80]

def git_push():
    try:
        subprocess.run(["git", "add", "-A"], check=True)
        subprocess.run(["git", "commit", "-m", "daemon update"], check=False)
        subprocess.run(["git", "push"], check=False)
        print("[∞] Auto-pushed.")
    except Exception as e:
        print("[∞] Git push skipped:", e)

print("[∞] Research Daemon Active — running forever.")
print("[∞] Add new terms to research_terms.txt any time.")

while True:
    try:
        if os.path.exists(TERMS_FILE):
            with open(TERMS_FILE, "r") as f:
                terms = [t.strip() for t in f.readlines() if t.strip()]
        else:
            terms = []

        for topic in terms:
            fname = sanitize(topic) + ".txt"
            fullpath = os.path.join(OUTPUT_DIR, fname)

            if not os.path.exists(fullpath):
                print(f"[∞] Generating → {topic}")
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

                print(f"[∞] Wrote → {fullpath}")

        git_push()
        time.sleep(10)

    except KeyboardInterrupt:
        print("\n[∞] Daemon stopped by user.")
        break
