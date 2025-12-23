#!/usr/bin/env python3
import os, datetime, json, random

SCRAPED_DIR = "scraped_sources"
OUTDIR = "research_tokens"
os.makedirs(OUTDIR, exist_ok=True)

def assign_color(value):
    if value < 500: return "GREEN"
    if value < 2000: return "PURPLE"
    if value < 8000: return "BLUE"
    return "RED"

def load_sources():
    files = []
    for f in os.listdir(SCRAPED_DIR):
        if f.endswith(".txt"):
            files.append(os.path.join(SCRAPED_DIR, f))
    return files

def extract_links_count():
    total = 0
    for f in os.listdir(SCRAPED_DIR):
        path = os.path.join(SCRAPED_DIR, f)
        if os.path.isfile(path):
            with open(path, "r", errors="ignore") as x:
                txt = x.read()
                total += txt.count("http")
    return total

def main():
    ts = datetime.datetime.now().isoformat()
    token_num = random.randint(100000, 999999)
    token_value = extract_links_count() + random.randint(100,1000)
    token_color = assign_color(token_value)

    sources = load_sources()
    jump_links = "\n".join([f"- {os.path.basename(x)}" for x in sources])

    content = []
    for s in sources:
        with open(s, "r", errors="ignore") as f:
            content.append(f"\n\n===== RAW DATA: {s} =====\n" + f.read())

    research_file = os.path.join(OUTDIR, f"∞_Token_{token_num}_hydrogen.md")

    with open(research_file, "w", encoding="utf-8") as f:
        f.write(f"# ∞ Infinity Research Paper\n")
        f.write(f"## Token #{token_num}\n")
        f.write(f"## Token Value: {token_value}\n")
        f.write(f"## Token Color: {token_color}\n")
        f.write(f"## Generated: {ts}\n")
        f.write("---\n\n")
        f.write("## Jump-To Source Files\n")
        f.write(jump_links)
        f.write("\n\n---\n\n")
        f.write("## Full Aggregated Raw Research\n")
        f.write("\n".join(content))
        f.write("\n\n---\n\n")
        f.write("## Infinity Synthesis (40-page research narrative)\n\n")
        f.write("<<AI-GENERATED FULL RESEARCH WILL BE WRITTEN HERE BY CHATGPT>>\n")

    print("[∞] Wrote Infinity Token Research →", research_file)

if __name__ == "__main__":
    main()
