#!/usr/bin/env python3
# Infinity Hydrogen Research Writer — Full Stack
# EN/JP | Equation-weighted tokens | Charts | Expansion | Git push

import os, json, math, hashlib, subprocess, sys
from datetime import datetime
from collections import Counter, defaultdict

# ---------------- CONFIG ----------------
BASE_DIR = os.getcwd()
OUT_ART = os.path.join(BASE_DIR, "research_hydrogen")
OUT_TOK = os.path.join(BASE_DIR, "infinity_tokens")
OUT_CH = os.path.join(BASE_DIR, "charts")
DICT_FILE = os.path.join(BASE_DIR, "hydrogen_dictionary.json")

AUTO_GIT_PUSH = True
AUTHOR = "Infinity OS"
START_INDEX = 1

os.makedirs(OUT_ART, exist_ok=True)
os.makedirs(OUT_TOK, exist_ok=True)
os.makedirs(OUT_CH, exist_ok=True)

# ---------------- CORE TERMS (seed) ----------------
# (term, equation)
SEED_TERMS = [
 ("Hydrogen", r"E=mc^2"),
 ("Gas", r"PV=nRT"),
 ("Proton", r"^1_1H"),
 ("Electron", r"E_n=-13.6/n^2\,eV"),
 ("Deuterium", r"D+T\to^4He+n+17.6\,MeV"),
 ("Tritium", r"^3_1H"),
 ("Fusion", r"4^1H\to^4He+26.7\,MeV"),
 ("Atom", r"\hat{H}\psi=E\psi"),
 ("Molecule", r"H_2\to2H"),
 ("Bond", r"2H_2+O_2\to2H_2O"),
]

# ---------------- DICTIONARY (expansion) ----------------
DEFAULT_DICT = {
 "hydrogen": ["fusion","electrolysis","spectroscopy","fuel cell","plasma"],
 "fusion": ["tunneling","coulomb barrier","q-value","neutrino"],
 "electrolysis": ["gibbs free energy","nernst equation","overpotential","pem"],
 "spectroscopy": ["rydberg","balmer","lyman","hyperfine 21cm"],
 "fuel cell": ["efficiency","entropy","catalysis","platinum"],
}

if not os.path.exists(DICT_FILE):
    with open(DICT_FILE,"w",encoding="utf-8") as f:
        json.dump(DEFAULT_DICT,f,indent=2,ensure_ascii=False)

with open(DICT_FILE,"r",encoding="utf-8") as f:
    DICT = json.load(f)

# ---------------- UTIL ----------------
def sha(s): return hashlib.sha256(s.encode("utf-8")).hexdigest()
def now(): return datetime.utcnow().isoformat()

def ensure_matplotlib():
    try:
        import matplotlib.pyplot as plt
        return True
    except Exception:
        return False

HAS_MPL = ensure_matplotlib()

def plot_value(idx, value):
    path = os.path.join(OUT_CH, f"value_{str(idx).zfill(3)}.png")
    if HAS_MPL:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(4,3))
        plt.bar(["Token Value"], [value])
        plt.title(f"Infinity Token Value #{idx}")
        plt.tight_layout()
        plt.savefig(path)
        plt.close()
    else:
        with open(path.replace(".png",".txt"),"w") as f:
            f.write(f"[Chart] Token #{idx} Value = {value}\n")
    return path

def expand_terms(base_terms, rounds=1):
    expanded = list(base_terms)
    for _ in range(rounds):
        for t,_ in list(expanded):
            key = t.lower()
            for nxt in DICT.get(key,[]):
                expanded.append((nxt.title(), r"\text{Derived}"))
    return expanded

# ---------------- BUILD PIPELINE ----------------
def main():
    # Expand beyond 100 if dictionary allows
    terms = expand_terms(SEED_TERMS, rounds=6)
    if len(terms) < 100:
        while len(terms) < 100:
            terms.append((f"Hydrogen Concept {len(terms)+1}", r"\text{Composite}"))

    eq_counter = Counter()
    minted = []

    for i,(term,eq) in enumerate(terms[:100], start=START_INDEX):
        eq_counter[eq] += 1
        reuse_weight = eq_counter[eq] - 1
        base_value = 1000 + i*7
        value = base_value + reuse_weight*25

        chart_path = plot_value(i, value)

        # ---------- Article EN ----------
        en = f"""# ∞ Hydrogen Research {i}
## Term: {term}

**Equation**
$$ {eq} $$

**Explanation (EN)**
This node analyzes **{term}** within hydrogen science. Equation reuse across the corpus
adds structural weight to the knowledge lattice. Reuse count: **{reuse_weight}**.

**Energy & Systems**
Hydrogen links quantum structure to macroscopic energy systems, from atomic orbitals
to fusion and electrochemical conversion.

**Infinity Note**
Token value increases when equations recur across independent domains.
"""

        # ---------- Article JP ----------
        jp = f"""
---

## 日本語解説

**用語:** {term}

**数式**
$$ {eq} $$

**説明（JP）**
この研究ノードは水素科学における **{term}** を解析します。
同一の数式が再利用されるほど、知識ネットワークの価値は増大します。
再利用回数: **{reuse_weight}**。

**エネルギーと体系**
水素は量子構造から核融合、電気化学エネルギー変換までを結びます。
"""

        article = en + jp + f"\n---\nGenerated: {now()} UTC\n"
        art_name = f"INF_HYDROGEN_{str(i).zfill(3)}.md"
        with open(os.path.join(OUT_ART, art_name),"w",encoding="utf-8") as f:
            f.write(article)

        token = {
            "token_number": i,
            "term": term,
            "equation": eq,
            "reuse_weight": reuse_weight,
            "final_value": value,
            "chart": chart_path,
            "created_utc": now(),
            "author": AUTHOR,
        }
        token["hash"] = sha(json.dumps(token,sort_keys=True))
        tok_name = f"INF_TOKEN_{str(i).zfill(3)}_{token['hash'][:8]}.json"
        with open(os.path.join(OUT_TOK, tok_name),"w",encoding="utf-8") as f:
            json.dump(token,f,indent=2,ensure_ascii=False)

        minted.append((art_name, tok_name))
        print(f"[∞] {art_name} | Token value={value}")

    # ---------------- GIT PUSH ----------------
    if AUTO_GIT_PUSH and os.path.exists(os.path.join(BASE_DIR,".git")):
        try:
            subprocess.run(["git","add","."], check=True)
            subprocess.run(["git","commit","-m","Infinity: Hydrogen EN/JP research + tokens"], check=False)
            subprocess.run(["git","push"], check=False)
            print("[∞] Git push complete")
        except Exception as e:
            print("[!] Git push skipped:", e)

    print("\n[∞] Complete: 100 articles, tokens, charts, EN/JP.\n")

if __name__ == "__main__":
    main()
