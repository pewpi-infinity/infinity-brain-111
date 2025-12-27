#!/usr/bin/env python3
import os, random, time, requests, datetime, re
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
    ".docsum-title",
    "h3 a[href]",
    "a[href*='abs']",
    "a[href*='article']",
    ".cl-paper-row a",
]

SOURCES = [
    "https://arxiv.org/search/?query=",
    "https://pubmed.ncbi.nlm.nih.gov/?term=",
    "https://scholar.google.com/scholar?q=",
    "https://www.semanticscholar.org/search?q=",
]

def normalize_link(link, base):
    """Convert relative to full URLs."""
    if not link:
        return None
    if link.startswith("#"):
        return None
    if link.startswith("/") and "pubmed" in base:
        return "https://pubmed.ncbi.nlm.nih.gov" + link
    if link.startswith("/") and "arxiv" in base:
        return "https://arxiv.org" + link
    if link.startswith("/") and "scholar" in base:
        return "https://scholar.google.com" + link
    if link.startswith("/") and "semanticscholar" in base:
        return "https://www.semanticscholar.org" + link
    return link

def extract_full_text(url):
    """Downloads article page and extracts abstract + intro when available."""
    try:
        headers = {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": random.choice(REFERERS)
        }
        r = requests.get(url, headers=headers, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, "html.parser")

        text_blocks = []

        # PubMed Abstract
        abs_block = soup.select_one(".abstract, #abstract, .abstract-content")
        if abs_block:
            text_blocks.append("ABSTRACT:\n" + abs_block.get_text("\n", strip=True))

        # arXiv abstract
        arxiv_abs = soup.select_one("blockquote.abstract")
        if arxiv_abs:
            t = arxiv_abs.get_text("\n", strip=True)
            t = re.sub(r"^Abstract:\s*", "", t)
            text_blocks.append("ABSTRACT:\n" + t)

        # Intro paragraphs (generic)
        intros = soup.select("p")
        intro_text = "\n".join([p.get_text(" ", strip=True) for p in intros[:5]])
        if intro_text:
            text_blocks.append("INTRODUCTION:\n" + intro_text)

        final_text = "\n\n".join(text_blocks).strip()
        return final_text if final_text else None

    except Exception:
        return None

while True:

    # Build query
    if random.random() < 0.5:
        query = random.choice(terms)
    else:
        query = " ".join(random.sample(terms, random.randint(2,4)))

    color_idx = random.randint(0,4)
    print(f"\n{NAMES[color_idx]} → {COLORS[color_idx]}{query.upper()}{RESET}")

    headers = {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": random.choice(REFERERS)
    }

    results = []
    random.shuffle(SOURCES)

    # OPTION A — never retry
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

                    link = normalize_link(item.get("href", ""), base)
                    if not link:
                        continue

                    # FULL TEXT EXTRACTION HERE
                    full_text = extract_full_text(link)

                    results.append((title, link, full_text))
                    if len(results) >= 10:
                        break
                if len(results) >= 10:
                    break
        except:
            continue

        if results:
            break

    # Fallback if empty
    if not results:
        results = [("NO RESULTS", "https://", "NO TEXT FOUND")]

    # Write the research file
    safe = "".join(c if c.isalnum() or c in " _-" else "_" for c in query)[:100]
    filename = f"{OUT}/{int(time.time())}_{safe}.txt"

    with open(filename, "w") as f:
        f.write(f"QUERY: {query.upper()}\n")
        f.write(f"COLOR: {NAMES[color_idx]}\n")
        f.write(f"TIME: {datetime.datetime.now().isoformat()}\n")
        f.write(f"PAPERS: {len(results)}\n")
        f.write("="*80 + "\n\n")

        for i, (title, link, full_text) in enumerate(results, 1):
            color = COLORS[i % 5]
            name = NAMES[i % 5]
            f.write(f"{color}PAPER {i:02d} • {name}{RESET}\n")
            f.write(f"TITLE → {title}\n")
            f.write(f"LINK  → {link}\n\n")

            if full_text:
                f.write(full_text + "\n\n")
            else:
                f.write("NO FULL TEXT AVAILABLE\n\n")

            f.write("-" * 80 + "\n\n")

    # Push to git
    os.system(f"git add '{filename}'")
    os.system(f"git commit -m 'FULL RESEARCH: ${query} (${len(results)} papers)'")
    os.system("git push origin main")

    print(f"{COLORS[color_idx]}SAVED FULL RESEARCH → {filename}{RESET}")

    time.sleep(random.uniform(25, 55))

