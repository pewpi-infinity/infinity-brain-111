#!/usr/bin/env python3
import os, random, time, requests, datetime
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

TERMS_FILE = "search_terms_master.txt"
OUT = "infinity_research_txt"
os.makedirs(OUT, exist_ok=True)

COLORS = ["\033[95m", "\033[92m", "\033[93m", "\033[91m", "\033[94m"]
RESET = "\033[0m"
NAMES = ["PURPLE", "GREEN", "YELLOW", "RED", "BLUE"]

with open(TERMS_FILE) as f:
    terms = [t.strip() for t in f if t.strip()]

# Browser fingerprints to rotate (anti-block)
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0"
]

REFERERS = [
    "https://www.google.com/",
    "https://www.bing.com/",
    "https://duckduckgo.com/",
    "https://search.yahoo.com/",
    "https://en.wikipedia.org/wiki/Main_Page"
]

SELECTORS = [
    "a[href*='pdf']",
    ".gs_rt a",
    ".gs_or_ggsm a",
    "h3.gs_rt a",
    "h3 a[href]",
    ".docsum-title",
    ".cl-paper-title",
    ".cl-paper-row a",
    ".result-item-title a",
    "a[href*='/abs/']",
    "a[href*='article']",
]

SOURCES = [
    "https://arxiv.org/search/?query=",
    "https://scholar.google.com/scholar?q=",
    "https://pubmed.ncbi.nlm.nih.gov/?term=",
    "https://www.semanticscholar.org/search?q=",
]

# MAIN LOOP — Option A logic (NEVER retry)
while True:

    # Pick a query
    if random.random() < 0.5:
        query = random.choice(terms)
    else:
        query = " ".join(random.sample(terms, random.randint(2,4)))

    color_idx = random.randint(0,4)
    print(f"\n{NAMES[color_idx]} RESEARCHING → {COLORS[color_idx]}{query.upper()}{RESET}")

    # Prepare request headers
    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": random.choice(REFERERS)
    }

    random.shuffle(SOURCES)
    results = []

    # Try sources with NO retries — Option A
    for base in SOURCES:
        try:
            url = base + quote_plus(query)
            r = requests.get(url, headers=headers, timeout=15)
            if r.status_code != 200:
                continue

            soup = BeautifulSoup(r.text, "html.parser")

            # Collect matches
            for sel in SELECTORS:
                for item in soup.select(sel):
                    title = item.get_text(strip=True)
                    if not title or len(title) < 8:
                        continue

                    link = item.get("href", "")
                    fl = link

                    # Link correction
                    if fl.startswith("/") and "pubmed" in base:
                        fl = "https://pubmed.ncbi.nlm.nih.gov" + fl
                    if fl.startswith("/") and "arxiv" in base:
                        fl = "https://arxiv.org" + fl
                    if fl.startswith("/") and "scholar" in base:
                        fl = "https://scholar.google.com" + fl
                    if fl.startswith("/") and "semanticscholar" in base:
                        fl = "https://www.semanticscholar.org" + fl

                    if fl.startswith("#"):
                        continue

                    results.append((title, fl))
                    if len(results) >= 20:
                        break
                if len(results) >= 20:
                    break

        except Exception:
            continue

        # Option A: if this source fails, NO retry — just move to next
        if len(results) > 0:
            break

    # Option A fallback: if still zero, shrink query
    if not results:
        parts = query.split()
        if len(parts) > 1:
            query = random.choice(parts)
        else:
            query = random.choice(terms)

        print(f"  🔁 Fallback query → {query.upper()}")

        # ONE PASS ONLY — no retry looping
        headers["User-Agent"] = random.choice(USER_AGENTS)
        headers["Referer"]   = random.choice(REFERERS)

        for base in SOURCES:
            try:
                url = base + quote_plus(query)
                r = requests.get(url, headers=headers, timeout=15)
                if r.status_code != 200:
                    continue

                soup = BeautifulSoup(r.text, "html.parser")

                for sel in SELECTORS:
                    for item in soup.select(sel):
                        title = item.get_text(strip=True)
                        if not title or len(title) < 8:
                            continue

                        link = item.get("href", "")
                        fl = link

                        if fl.startswith("/") and "pubmed" in base:
                            fl = "https://pubmed.ncbi.nlm.nih.gov" + fl
                        if fl.startswith("/") and "arxiv" in base:
                            fl = "https://arxiv.org" + fl
                        if fl.startswith("/") and "scholar" in base:
                            fl = "https://scholar.google.com" + fl
                        if fl.startswith("/") and "semanticscholar" in base:
                            fl = "https://www.semanticscholar.org" + fl

                        if fl.startswith("#"):
                            continue

                        results.append((title, fl))
                        if len(results) >= 20:
                            break
                    if len(results) >= 20:
                        break
            except:
                continue

            if results:
                break

    # STILL empty? create placeholder to avoid loop
    if not results:
        results = [("NO RESULTS FOUND", "https://")]

    # Write file
    safe = "".join(c if c.isalnum() or c in " _-" else "_" for c in query)[:100]
    filename = f"{OUT}/{int(time.time())}_{safe}.txt"

    with open(filename, "w") as f:
        f.write(f"QUERY: {query.upper()}\n")
        f.write(f"COLOR: {NAMES[color_idx]}\n")
        f.write(f"TIME: {datetime.datetime.now().isoformat()}\n")
        f.write(f"PAPERS: {len(results)}\n")
        f.write("="*80 + "\n\n")

        for i, (title, link) in enumerate(results, 1):
            color = COLORS[i % 5]
            name = NAMES[i % 5]
            f.write(f"{color}PAPER {i:02d} • {name}{RESET}\n")
            f.write(f"TITLE → {title}\n")
            f.write(f"LINK  → {link}\n")
            f.write("-" * 80 + "\n\n")

    # Git push
    os.system(f"git add '{filename}'")
    os.system(f"git commit -m 'TXT research: ${query} (${len(results)} papers)'")
    os.system("git push origin main")

    print(f"{COLORS[color_idx]}SAVED & PUSHED → {filename}{RESET}")

    time.sleep(random.uniform(25, 55))

