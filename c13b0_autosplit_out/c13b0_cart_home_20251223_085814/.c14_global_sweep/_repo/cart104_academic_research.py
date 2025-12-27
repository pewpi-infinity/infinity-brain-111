#!/usr/bin/env python3
import os, datetime, random, subprocess, textwrap, requests

CART_ID = "CART104"
CATEGORY = "academic_papers_journals"
SITES_FILE = "sites_cart104_academic.txt"
SCRAPE_DIR = "scraped_cart104_academic"
OUT_DIR = "tokens_cart104_academic"

TERMS = [
    "hydrogen",
    "hydrogen frequency",
    "hydrogen ionization",
    "hydrogen singularity",
    "hydrogen portal",
    "hydrogen resonance",
    "plasma hydrogen",
    "hydrogen superconductors",
    "quantum hydrogen",
    "hydrogen electron doorway"
]

os.makedirs(SCRAPE_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

STARTER_SITES = [
    "https://arxiv.org",
    "https://www.nature.com",
    "https://www.science.org",
    "https://www.cell.com",
    "https://pubmed.ncbi.nlm.nih.gov",
    "https://link.springer.com",
    "https://ieeexplore.ieee.org",
    "https://dash.harvard.edu",
    "https://ocw.mit.edu",
    "https://www.sciencedirect.com"
]

def ensure_sites_file():
    if not os.path.exists(SITES_FILE):
        with open(SITES_FILE, "w") as f:
            for s in STARTER_SITES:
                f.write(s + "\n")

def color(msg, c="37"):
    return f"\033[{c}m{msg}\033[0m"

def fetch(url, term):
    try:
        if "?" in url:
            full = url + "&q=" + term.replace(" ", "+")
        else:
            full = url + "?q=" + term.replace(" ", "+")
        r = requests.get(full, timeout=12)
        return full, r.text[:300000]
    except Exception as e:
        return url, f"ERROR FETCHING {url} term={term} :: {e}"

def assign_color(value):
    if value < 1000: return "GREEN"
    if value < 5000: return "PURPLE"
    if value < 20000: return "BLUE"
    return "RED"

def run_git_push():
    try:
        subprocess.run(["git", "add", "."], check=False)
        subprocess.run(["git", "commit", "-m", f"∞ {CART_ID} token research update"], check=False)
        subprocess.run(["git", "push"], check=False)
        print(color("[∞] Git push attempted", "32"))
    except Exception as e:
        print(color(f"[∞] Git push error: {e}", "31"))

def main():
    ensure_sites_file()
    with open(SITES_FILE, "r") as f:
        sites = [x.strip() for x in f.readlines() if x.strip()]

    print(color(f"[{CART_ID}] Sites loaded: {len(sites)}", "36"))
    ts = datetime.datetime.now().isoformat()

    for term in TERMS:
        term_safe = term.replace(" ", "_")
        term_files = []
        print(color(f"[{CART_ID}] Scraping term: {term}", "35"))
        for i, base in enumerate(sites):
            full_url, txt = fetch(base, term)
            fname = os.path.join(SCRAPE_DIR, f"{term_safe}__{i:04d}.txt")
            with open(fname, "w", encoding="utf-8", errors="ignore") as f:
                f.write(f"URL: {full_url}\n\n")
                f.write(txt)
            term_files.append(fname)

        token_value = 0
        raw_agg = []
        for path in term_files:
            with open(path, "r", errors="ignore") as f:
                t = f.read()
            token_value += len(t)
            token_value += t.count("http")
            raw_agg.append(f"\n\n===== {os.path.basename(path)} =====\n" + t)

        token_color = assign_color(token_value)
        token_num = random.randint(100000, 999999)
        token_file = os.path.join(OUT_DIR, f"∞_{CART_ID}_Token_{token_num}_{term_safe}.md")

        header = textwrap.dedent(f"""
        # ∞ Infinity Research Paper
        ## Cart: {CART_ID} / Category: {CATEGORY}
        ## Token #: {token_num}
        ## Token Value: {token_value}
        ## Token Color: {token_color}
        ## Generated: {ts}

        ---
        ## Search Term
        {term}

        ---
        ## Infinity Token Narrative
        Here the OS walks academic paper space: arXiv, Nature, Science,
        Springer, PubMed, Harvard, MIT. It treats them as ore, not as law.
        The substrate is captured below so Infinity research can verify and
        overbuild.

        ---
        ## Jump-to Raw Files
        """).lstrip()

        with open(token_file, "w", encoding="utf-8") as f:
            f.write(header)
            for p in term_files:
                f.write(f"- {os.path.basename(p)}\n")
            f.write("\n\n---\n\n")
            f.write("## Raw Substrate (All Scraped Content)\n")
            f.write("".join(raw_agg))

        print(color(f"[{CART_ID}] Wrote token: {token_file}", "32"))

    run_git_push()
    print(color(f"[{CART_ID}] Complete", "34"))

if __name__ == "__main__":
    main()
