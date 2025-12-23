#!/usr/bin/env python3
import os, hashlib, datetime, random, json, subprocess, time

# =========[ SETTINGS ]=========
REPO = "/data/data/com.termux/files/home/mongoose.os"
TOK_DIR = f"{REPO}/infinity_tokens"
TERMS_FILE = f"{REPO}/research_terms.txt"
os.makedirs(TOK_DIR, exist_ok=True)

# =========[ COLORS ]=========
C = {
    "r": "\033[91m",
    "g": "\033[92m",
    "y": "\033[93m",
    "b": "\033[94m",
    "p": "\033[95m",
    "c": "\033[96m",
    "w": "\033[97m",
    "reset": "\033[0m"
}

# =========[ RANDOM COLOR PICKER ]=========
def rand_color():
    return random.choice([C["p"], C["b"], C["g"], C["y"], C["c"]])

# =========[ LOAD TERMS ]=========
def load_terms():
    if not os.path.exists(TERMS_FILE):
        return ["hydrogen", "frequency", "ionization", "singularity"]
    with open(TERMS_FILE) as f:
        return [t.strip() for t in f.readlines() if t.strip()]

# =========[ TOKEN MAKER ]=========
def make_token():
    terms = load_terms()
    four = random.sample(terms, min(4, len(terms)))

    token_num = random.randint(10_000_000, 99_999_999)
    token_val = random.randint(1000, 9_999_999)
    timestamp = datetime.datetime.now().isoformat()

    content = {
        "token_number": token_num,
        "value": token_val,
        "terms": four,
        "timestamp": timestamp
    }

    raw = json.dumps(content, indent=2)
    h = hashlib.sha256(raw.encode()).hexdigest()

    filename = f"{TOK_DIR}/token_{token_num}_{h[:12]}.txt"
    with open(filename, "w") as f:
        f.write(raw)

    return filename, token_num, token_val, four, h

# =========[ PUSHER ]=========
def push_file(path):
    try:
        subprocess.run(["git", "-C", REPO, "add", path], check=False)
        subprocess.run(["git", "-C", REPO, "commit", "-m", f"Add {os.path.basename(path)}"], check=False)
        subprocess.run(["git", "-C", REPO, "push"], check=False)
    except Exception as e:
        pass

# =========[ MINER LOOP ]=========
def mine():
    rate_count = 0
    start = time.time()

    while True:
        fn, num, val, terms, h = make_token()
        rate_count += 1

        elapsed = time.time() - start
        rate = rate_count / elapsed if elapsed > 0 else 0

        col = rand_color()

        print(f"{col}[∞ MONGOOSE MINER] Minted token {num}{C['reset']}")
        print(f"{C['g']}Value:{C['reset']} {val}")
        print(f"{C['y']}Hash:{C['reset']} {h[:16]}...")
        print(f"{C['c']}Rate:{C['reset']} {rate:.2f} tok/sec")
        print(f"{C['p']}Terms:{C['reset']} {terms}")
        print(f"{C['b']}File:{C['reset']} {fn}")
        print()

        push_file(fn)
        time.sleep(0.5)

mine()
