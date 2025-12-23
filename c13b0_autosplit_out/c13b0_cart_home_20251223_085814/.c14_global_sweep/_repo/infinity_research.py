#!/usr/bin/env python3
import os, json, datetime, random, time, requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

SEARCH_TERMS_FILE = "search_terms_master.txt"
OUTPUT_DIR = "infinity_research_output"
os.makedirs(OUTPUT_DIR, exist_ok=True)

COLORS = ["PURPLE", "GREEN", "YELLOW", "RED", "BLUE"]
HEADERS = {"User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"}
SEARCH_SOURCES = [
    "https://scholar.google.com/scholar?q=",
    "https://arxiv.org/search/?query=",
    "https://pubmed.ncbi.nlm.nih.gov/?term=",
    "https://www.semanticscholar.org/search?q=",
]

def make_token(topic): 
    return {"token_number": random.randint(1000,999999), "value": random.randint(100,5000), 
            "color": random.choice(COLORS), "generated": datetime.datetime.now().isoformat(), "topic": topic}

def fetch_real_articles(query):
    articles = []
    for base in random.sample(SEARCH_SOURCES, len(SEARCH_SOURCES)):
        time.sleep(random.uniform(4,8))
        try:
            r = requests.get(base + quote_plus(query), headers=HEADERS, timeout=15)
            if r.status_code != 200: continue
            soup = BeautifulSoup(r.text, "html.parser")
            results = soup.select("div.gs_r, li.arxiv-result, article, div.result")[:10]
            for res in results:
                title = res.select_one("h3, .title, h1, .search-result-title")
                if not title: continue
                link = title.find("a")
                if not link: continue
                articles.append({
                    "title": title.get_text(strip=True),
                    "url": link.get("href") if link else None,
                    "source": base.split("/")[2]
                })
            if articles: break  # stop early if we got real results
        except: continue
    return articles

# MAIN INFINITE LOOP
with open(SEARCH_TERMS_FILE) as f:
    terms = [t.strip() for t in f if t.strip()]

while True:
    query = random.choice(terms) if random.random() < 0.5 else " ".join(random.sample(terms, random.randint(2,4)))
    print(f"\nSearching: {query}")
    articles = fetch_real_articles(query)
    
    if len(articles) > 0:  # ONLY SAVE IF WE ACTUALLY GOT REAL RESEARCH
        token = make_token(query)
        data = {"header": token, "articles": articles}
        safe = "".join(c if c.isalnum() else "_" for c in query)[:100]
        path = f"{OUTPUT_DIR}/{token['token_number']}_{safe}.json"
        with open(path, "w") as f:
            json.dump(data, f, indent=2)
        print(f"SAVED {len(articles)} real articles → {path}")
        
        # Auto-commit every real file
        os.system("git add " + path)
        os.system(f'git commit -m "∞ Real research: {query} ({len(articles)} papers)"')
        os.system("git push origin main &")
    else:
        print("No real results this time – trying again...")
    
    time.sleep(random.uniform(15,40))
