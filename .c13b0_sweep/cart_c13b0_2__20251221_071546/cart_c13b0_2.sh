#!/data/data/com.termux/files/usr/bin/bash
set -e

### =========================
### C13B0^2 — SPINE SCRAPER
### =========================

# --- CONFIG (edit if you want) ---
ORG="pewpi-infinity"
# This is where the cart pushes its generated outputs:
PUSH_REPO="mongoose.os"   # must already exist on GitHub under $ORG
REMOTE="https://github.com/${ORG}/${PUSH_REPO}.git"

# How many menu items to show
MENU_MAX=35

# Keywords to auto-rank carts into your “reusable” list
KEYWORDS="writer|mine|mining|token|mint|minter|forge|dashboard|stream|research|ledger|wallet|octave|vector|index"

# --- internal state (kept out of your way) ---
STATE_DIR="$HOME/.infinity_spine_state"
CACHE_DIR="$HOME/.infinity_repo_cache"
mkdir -p "$STATE_DIR" "$CACHE_DIR"

chmod +x "$0" 2>/dev/null || true

need() { command -v "$1" >/dev/null 2>&1; }

echo "=================================================="
echo "C13B0^2  |  Spine Scrape + Launcher + AutoPush"
echo "ORG:     $ORG"
echo "PUSH->   $REMOTE"
echo "=================================================="

# --- prerequisites ---
if ! need gh; then
  echo "[!] Missing: gh (GitHub CLI)"
  echo "    Install: pkg update && pkg install gh"
  exit 1
fi
if ! need git; then
  echo "[!] Missing: git"
  echo "    Install: pkg update && pkg install git"
  exit 1
fi
if ! need python3; then
  echo "[!] Missing: python"
  echo "    Install: pkg update && pkg install python"
  exit 1
fi

# --- ensure gh auth (fails loud) ---
if ! gh auth status >/dev/null 2>&1; then
  echo "[!] gh not authenticated."
  echo "    Run: gh auth login"
  exit 1
fi

TS="$(date +%Y%m%d_%H%M%S)"
RUNLOG="$STATE_DIR/run_${TS}.txt"
CATALOG="$STATE_DIR/spine_catalog.json"
LAUNCHER="$STATE_DIR/infinity_launcher.sh"
INDEX_MD="$STATE_DIR/INDEX.md"

echo "RUN=$TS" > "$RUNLOG"
echo "ORG=$ORG" >> "$RUNLOG"

# --- scrape repo list ---
echo "[*] Listing repos (limit 500)…"
REPOS="$(gh repo list "$ORG" --limit 500 --json name -q '.[].name' || true)"

if [ -z "${REPOS// }" ]; then
  echo "[!] No repos returned. Check org name or gh auth."
  exit 1
fi

# --- scrape carts from each repo via GitHub API tree ---
# We do not clone everything (fast). We only fetch file paths.
echo "[*] Scraping cart paths across repos…"
python3 - << 'PY' > "$CATALOG"
import json, os, re, subprocess, sys

ORG = os.environ.get("ORG","pewpi-infinity")
KEYWORDS = re.compile(os.environ.get("KEYWORDS",""), re.I)

repos = os.environ.get("REPOS","").split()
out = []
for r in repos:
    # Try main then master quickly
    carts = []
    for branch in ("main","master"):
        cmd = ["gh","api",f"repos/{ORG}/{r}/git/trees/{branch}?recursive=1","--jq",".tree[].path"]
        try:
            p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True, check=True)
            paths = [line.strip() for line in p.stdout.splitlines() if line.strip()]
            carts = [x for x in paths if re.search(r'(^|/)(cart_.*\.(sh|py))$', x)]
            if carts:
                break
        except subprocess.CalledProcessError:
            continue

    if not carts:
        continue

    # rank carts by keywords so “reusable” stuff floats to top
    ranked = sorted(carts, key=lambda s: (0 if KEYWORDS.search(s) else 1, len(s), s))
    out.append({
        "repo": r,
        "branch": "main",
        "carts": ranked[:250],
    })

print(json.dumps({"org": ORG, "generated": True, "items": out}, indent=2))
PY

# --- build an INDEX.md (human-readable) ---
echo "[*] Building INDEX.md…"
python3 - << 'PY' > "$INDEX_MD"
import json, os, re
CATALOG=os.environ["CATALOG"]
KEYWORDS=re.compile(os.environ.get("KEYWORDS",""), re.I)

data=json.load(open(CATALOG))
items=data["items"]
print("# Infinity Spine Catalog")
print()
print(f"- org: `{data['org']}`")
print()
print("## Repos with carts")
print()
for it in sorted(items, key=lambda x: x["repo"].lower()):
    repo=it["repo"]
    carts=it["carts"]
    hot=[c for c in carts if KEYWORDS.search(c)]
    print(f"### {repo}")
    if hot:
        print("- **hot**:")
        for c in hot[:20]:
            print(f"  - `{c}`")
    print("- carts:")
    for c in carts[:30]:
        print(f"  - `{c}`")
    print()
PY

# --- build a launcher that runs carts WITHOUT you living in folders ---
# launcher clones a repo shallow into ~/.infinity_repo_cache/<repo>, runs chosen cart, returns.
echo "[*] Generating launcher menu…"
python3 - << 'PY' > "$LAUNCHER"
import json, os, re, textwrap

CATALOG=os.environ["CATALOG"]
CACHE=os.environ["CACHE_DIR"]
ORG=os.environ.get("ORG","pewpi-infinity")
MAX=int(os.environ.get("MENU_MAX","35"))
KEYWORDS=re.compile(os.environ.get("KEYWORDS",""), re.I)

data=json.load(open(CATALOG))
choices=[]

for it in data["items"]:
    repo=it["repo"]
    for c in it["carts"]:
        # prefer keyword carts
        score = 0 if KEYWORDS.search(c) else 10
        choices.append((score, repo, c))

choices.sort(key=lambda x:(x[0], x[1].lower(), x[2].lower()))
choices=choices[:MAX]

print("#!/data/data/com.termux/files/usr/bin/bash")
print("set -e")
print("clear")
print('echo "=============================="')
print('echo " Infinity Launcher (Auto)"')
print('echo "=============================="')
print('echo')
for i,(score,repo,cart) in enumerate(choices, start=1):
    print(f'echo "{i}) {repo} :: {cart}"')
print('echo "0) Exit"')
print('echo')
print('read -p "Select option: " CHOICE')
print('case "$CHOICE" in')
for i,(score,repo,cart) in enumerate(choices, start=1):
    safe_repo=repo.replace('"','')
    safe_cart=cart.replace('"','')
    local_dir=f'{CACHE}/{safe_repo}'
    remote=f'https://github.com/{ORG}/{safe_repo}.git'
    print(f'  {i})')
    print(f'    echo "[launcher] {safe_repo} :: {safe_cart}"')
    print(f'    mkdir -p "{CACHE}"')
    print(f'    if [ ! -d "{local_dir}/.git" ]; then')
    print(f'      echo "[launcher] caching repo (shallow)..."')
    print(f'      git clone --depth 1 "{remote}" "{local_dir}" >/dev/null 2>&1 || true')
    print(f'    else')
    print(f'      (cd "{local_dir}" && git pull --rebase --autostash >/dev/null 2>&1 || true)')
    print(f'    fi')
    print(f'    if [ -f "{local_dir}/{safe_cart}" ]; then')
    print(f'      (cd "{local_dir}" && chmod +x "{safe_cart}" 2>/dev/null || true)')
    print(f'      (cd "{local_dir}" && bash "{safe_cart}")')
    print(f'    else')
    print(f'      echo "[launcher] missing file: {safe_cart}"')
    print(f'    fi')
    print(f'    ;;')
print('  0) exit 0 ;;')
print('  *) echo "invalid" ;;')
print('esac')
PY

chmod +x "$LAUNCHER"

# --- autopush the generated outputs to your push repo (safe sync) ---
echo "[*] AutoPush: committing generated outputs…"
cd "$STATE_DIR"
if [ ! -d .git ]; then
  git init >/dev/null
  git branch -M main
fi

git config --global credential.helper store
git remote remove origin 2>/dev/null || true
git remote add origin "$REMOTE"

# sync with remote (prevents fetch-first reject)
git fetch origin >/dev/null 2>&1 || true
git pull --rebase --autostash origin main >/dev/null 2>&1 || true

git add "$(basename "$RUNLOG")" "$(basename "$CATALOG")" "$(basename "$LAUNCHER")" "$(basename "$INDEX_MD")"
git commit -m "C13B0^2 spine scrape $TS" >/dev/null 2>&1 || true
git push origin main || {
  echo "[!] push failed. (Repo exists but may be protected or auth failed.)"
  echo "    Try: gh auth status"
  exit 1
}

echo "[OK] Generated + pushed:"
echo " - $CATALOG"
echo " - $INDEX_MD"
echo " - $LAUNCHER"
echo
echo "RUN LAUNCHER:"
echo "  $LAUNCHER"
echo "=================================================="
