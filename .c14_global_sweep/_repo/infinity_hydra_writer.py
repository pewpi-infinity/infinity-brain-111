#!/usr/bin/env python3
import os, random, time, requests, datetime
from urllib.parse import quote_plus
from bs4 import BeautifulSoup

# === YOUR EXACT COLOR ORDER ===
PURPLE = "\033[95m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
BLUE   = "\033[94m"
RESET  = "\033[0m"

COLOR_NAMES = ["PURPLE", "GREEN", "YELLOW", "RED", "BLUE"]
COLOR_CODES = [PURPLE, GREEN, YELLOW, RED, BLUE]

# === INPUT SOURCE ===
TERMS_FILE = "search_terms_master.txt"
OUTPUT_DIR = "hydra_research_out"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# === LOAD TERMS ===
with open(TERMS_FILE, "r") as f:
    terms = [t.strip() for t in f if t.strip()]

# === SOURCES (Strong, Reliable) ===
SOURCES = {
    "arxiv":  "https://arxiv.org/search/?query=",
    "pubmed": "https://pubmed.ncbi.nlm.nih.gov/?term=",
    "scholar":"https://scholar.google.com/scholar?q=",
    "semantic":"https://www.semanticscholar.org/search?q="
}

HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
}

# === HYDRA RESEARCH ENGINE ===
def hydra_extract(query):
    results = []
    keys = list(SOURCES.keys())
    random.shuffle(keys)

    for src in keys:
        try:
            url = SOURCES[src] + quote_plus(query)
            r = requests.get(url, headers=HEADERS, timeout=15)
            if r.status_code != 200:
                continue

            soup = BeautifulSoup(r.text, "html.parser")
            links = soup.select("a[href]")

            for a in links[:40]:
                title = a.get_text(strip=True)
                href  = a.get("href")

                if not title or len(title) < 7:
                    continue

                if not href.startswith("http"):
                    if "arxiv" in src:
                        href = "https://arxiv.org" + href
                    elif "pubmed" in src:
                        href = "https://pubmed.ncbi.nlm.nih.gov" + href
                    elif "scholar" in src:
                        href = "https://scholar.google.com" + href
                    elif "semantic" in src:
                        href = "https://www.semanticscholar.org" + href

                results.append((title, href))
        except:
            continue

    return results[:49]  # === EXACTLY YOUR 49-CITATION SPEC ===


# === MAIN LOOP ===
while True:
    # Build spiderweb query
    root = random.choice(terms)
    if random.random() < 0.4:
        query = root
    else:
        query = " ".join(random.sample(terms, random.randint(2,4)))

    idx = random.randint(0,4)
    cname = COLOR_NAMES[idx]
    ccode = COLOR_CODES[idx]

    print(f"\n{cname} SEARCH → {ccode}{query.upper()}{RESET}")

    data = hydra_extract(query)

    if not data:
        print(f"{RED}NO RESULTS — MOVING ON{RESET}")
        continue

    # === WRITE OUTPUT ===
    safe = "".join(ch if ch.isalnum() or ch in " _-" else "_" for ch in query)
    fname = f"{OUTPUT_DIR}/{int(time.time())}_{safe}.txt"

    with open(fname, "w") as f:
        f.write(f"QUERY: {query}\n")
        f.write(f"COLOR: {cname}\n")
        f.write(f"TIME: {datetime.datetime.now().isoformat()}\n")
        f.write("===============================================================\n\n")
        for i, (title, link) in enumerate(data, 1):
            ci = COLOR_CODES[i % 5]
            cn = COLOR_NAMES[i % 5]
            f.write(f"{cn} • {title}\n{link}\n\n")

    # === GIT PUSH ===
    os.system(f"git add '{fname}'")
    os.system(f"git commit -m 'Hydra research: {query}'")
    os.system("git push origin main")

    print(f"{GREEN}✓ HYDRA SAVED → {fname}{RESET}")
    time.sleep(random.uniform(15, 30))
