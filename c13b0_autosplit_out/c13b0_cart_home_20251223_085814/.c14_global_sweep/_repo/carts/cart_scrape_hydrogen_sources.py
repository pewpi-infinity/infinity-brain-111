#!/usr/bin/env python3
import os, requests, datetime, json

OUTDIR = "scraped_sources"
os.makedirs(OUTDIR, exist_ok=True)

SOURCES = {
    "NASA": [
        "https://www.nasa.gov/search/?q=hydrogen",
        "https://www.nasa.gov/hydrogen/"
    ],
    "TESLA": [
        "https://www.tesla.com/search?query=hydrogen"
    ],
    "MIT": [
        "https://news.mit.edu/search?text=hydrogen"
    ],
    "HARVARD": [
        "https://news.harvard.edu/?s=hydrogen"
    ],
    "IBM_RESEARCH": [
        "https://research.ibm.com/search?query=hydrogen"
    ],
    "NATURE": [
        "https://www.nature.com/search?q=hydrogen"
    ],
    "CERN": [
        "https://home.cern/search/site/hydrogen"
    ],
    "DOE": [
        "https://www.energy.gov/search?search_api_fulltext=hydrogen"
    ],
    "ARXIV": [
        "https://export.arxiv.org/api/query?search_query=all:hydrogen&start=0&max_results=50"
    ]
}

def fetch(url):
    try:
        r = requests.get(url, timeout=10)
        return r.text[:250000]  # limit 250kb
    except:
        return "ERROR FETCHING"

def main():
    ts = datetime.datetime.now().isoformat()
    full_index = {}

    for site, urls in SOURCES.items():
        site_file = os.path.join(OUTDIR, f"{site}_hydrogen_raw_{ts}.txt")
        site_data = []

        for u in urls:
            txt = fetch(u)
            site_data.append({"url": u, "content": txt})

        with open(site_file, "w", encoding="utf-8") as f:
            for entry in site_data:
                f.write(f"\n\nURL: {entry['url']}\n\n")
                f.write(entry["content"])
                f.write("\n" + ("-"*80) + "\n")

        full_index[site] = site_file

    index_file = os.path.join(OUTDIR, f"hydrogen_index_{ts}.json")
    with open(index_file, "w") as f:
        json.dump(full_index, f, indent=2)

    print("[∞] Hydra Scraper Complete")
    print("[∞] Index saved:", index_file)

if __name__ == "__main__":
    main()
