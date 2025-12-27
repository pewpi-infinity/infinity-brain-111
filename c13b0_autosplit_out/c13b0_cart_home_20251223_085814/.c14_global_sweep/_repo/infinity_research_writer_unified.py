#!/usr/bin/env python3
import os, json, random, time, subprocess, importlib

ROOT = os.path.dirname(os.path.abspath(__file__))
TERMS_FILE = os.path.join(ROOT, "search_terms_master.txt")
OUTPUT_DIR = os.path.join(ROOT, "infinity_research_output")
TOKEN_DIR = os.path.join(ROOT, "infinity_tokens")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TOKEN_DIR, exist_ok=True)

MODULES = [
    "cart008_government",
    "cart009_power",
    "cart027_robotics",
    "cart028_machines",
    "cart033_nature",
    "cart038_genetics",
    "cart039_dna_engine",
    "cart036_rf_generation",
    "cart030_superchemistry_fireproof",
]

def load_terms():
    if not os.path.exists(TERMS_FILE):
        return []
    with open(TERMS_FILE, "r", encoding="utf-8") as f:
        return [t.strip() for t in f if t.strip()]

def load_module(name):
    try:
        return importlib.import_module(name)
    except:
        return None

def build_research(term, mod_outputs):
    body = []
    body.append(f"# Infinity Research: {term}\n")
    body.append("## Tokenized Technical Research\n")
    body.append(f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
    body.append("------------------------------------------------------\n\n")

    # combine module outputs
    for mod_name, out in mod_outputs.items():
        body.append(f"### [{mod_name.replace('cart','module')}] Contribution:\n")
        body.append(out + "\n\n")

    body.append("\n## Integrated Analysis\n")
    body.append(f"Using cross-modules from {len(MODULES)} domains this research merges government systems, power systems, robotics, organic computing, chemical charge pathways, DNA logic, and RF-based signal generation into a single Infinity-OS knowledge structure.\n")

    return "\n".join(body)

def mint_token(term):
    token_id = random.randint(500000, 999999)
    name = term.replace(" ", "_")
    path = os.path.join(TOKEN_DIR, f"token_{token_id}_{name}.txt")
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")

    with open(path, "w") as f:
        f.write(f"Token #: {token_id}\n")
        f.write(f"Term: {term}\n")
        f.write(f"Value: auto\n")
        f.write(f"Color: RED\n")
        f.write(f"Date: {timestamp}\n")

    print(f"[∞] Minted {path}")
    return token_id

def git_push():
    print("\n∞ AUTO-PUSHING RESEARCH + TOKENS")
    subprocess.run("git add infinity_research_output/ infinity_tokens/", shell=True)
    msg = f"∞ Unified research writer push {time.strftime('%Y-%m-%d %H:%M:%S')}"
    subprocess.run(f'git commit -m "{msg}" || true', shell=True)
    subprocess.run("git push origin main || true", shell=True)

def main():
    terms = load_terms()
    if not terms:
        print("No terms found.")
        return

    term = random.choice(terms)
    print(f"\n∞ Running unified research writer for term: {term}\n")

    module_outputs = {}

    for m in MODULES:
        mod = load_module(m)
        if mod and hasattr(mod, "main"):
            try:
                out = mod.main(return_text=True)
                module_outputs[m] = out
            except:
                module_outputs[m] = "[error calling module]"
        else:
            module_outputs[m] = "[module missing or no main()]"

    # Research text
    research_text = build_research(term, module_outputs)
    out_path = os.path.join(OUTPUT_DIR, f"{int(time.time())}_{term.replace(' ','_')}.md")

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(research_text)

    print(f"[∞] Saved research → {out_path}")

    # Token generation
    mint_token(term)

    git_push()

if __name__ == "__main__":
    main()
