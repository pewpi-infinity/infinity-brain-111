#!/usr/bin/env python3
# ∞ Infinity Orchestrator – Core System Bootstrap

import os, json, time, datetime, random

# -------------------------------------------------------------------
#  CONFIG + ENVIRONMENT BOOTSTRAP
# -------------------------------------------------------------------

ROOT = os.getcwd()

DIRS = [
    "infinity_research_output",
    "research_cache",
    "research_tmp",
    "logs",
    "token_logs",
    "scraped_sites",
]

for d in DIRS:
    os.makedirs(d, exist_ok=True)

def log(msg):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[∞ ORCH] {ts} – {msg}")

log("Bootstrapping Infinity Orchestrator…")
log(f"Working directory: {ROOT}")

# -------------------------------------------------------------------
#   LOAD MASTER TERMS (if exists)
# -------------------------------------------------------------------

TERMS_FILE = "search_terms_master.txt"
MASTER_TERMS = []

if os.path.exists(TERMS_FILE):
    with open(TERMS_FILE) as f:
        MASTER_TERMS = [x.strip() for x in f.readlines() if x.strip()]
    log(f"Loaded {len(MASTER_TERMS)} master search terms.")
else:
    log("No master terms file found. Continuing without it.")

# -------------------------------------------------------------------
#   LOAD SITE LISTS (if exists)
# -------------------------------------------------------------------

SITES_FILE = "site_list_master.txt"
SITES = []

if os.path.exists(SITES_FILE):
    with open(SITES_FILE) as f:
        SITES = [x.strip() for x in f.readlines() if x.strip()]
    log(f"Loaded {len(SITES)} research sites.")
else:
    log("No site list found. Scrapers will use built-in defaults.")

# -------------------------------------------------------------------
#   PROVIDE SHARED UTILITY FUNCTIONS
# -------------------------------------------------------------------

def make_token_header(term="hydrogen"):
    """Shared function used by all token generators."""
    return {
        "token_id": random.randint(1,999999),
        "term": term,
        "generated": datetime.datetime.now().isoformat(),
        "color": random.choice(["GREEN","PURPLE","YELLOW","RED"])
    }

def write_json(path, data):
    """Safe JSON writer used by all carts."""
    with open(path, "w") as f:
        json.dump(data, f, indent=4)

def load_json(path):
    if not os.path.exists(path): return None
    with open(path) as f:
        return json.load(f)

log("Shared utility functions loaded.")

# -------------------------------------------------------------------
#  FINAL ORCHESTRATION STARTUP STATE
# -------------------------------------------------------------------

STATE = {
    "boot_time": datetime.datetime.now().isoformat(),
    "terms": MASTER_TERMS,
    "sites": SITES,
    "root": ROOT,
}

write_json("research_cache/orchestrator_state.json", STATE)

log("Orchestrator state written.")
log("Orchestrator ready. Handing control to master runner.")
