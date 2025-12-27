#!/data/data/com.termux/files/usr/bin/bash
set -e

STATE_DIR="$HOME/.infinity_spine_state"
CATALOG="$STATE_DIR/spine_catalog.json"
INDEX_MD="$STATE_DIR/INDEX.md"

# sanity check
[ -f "$CATALOG" ] || { echo "Missing $CATALOG"; exit 1; }

export CATALOG="$CATALOG"
export KEYWORDS="writer|mine|mining|token|mint|minter|forge|dashboard|stream|research|ledger|wallet|octave|vector|index"

python3 - << 'PY' > "$INDEX_MD"
import json, os, re

CATALOG=os.environ["CATALOG"]
KEYWORDS=re.compile(os.environ.get("KEYWORDS",""), re.I)

data=json.load(open(CATALOG))
items=data["items"]

print("# Infinity Spine Catalog")
print()
print(f"- org: `{data['org']}`")
print(f"- repos with carts: {len(items)}")
print()

for it in sorted(items, key=lambda x: x["repo"].lower()):
    repo=it["repo"]
    carts=it["carts"]
    hot=[c for c in carts if KEYWORDS.search(c)]
    print(f"## {repo}")
    if hot:
        print("**hot carts**:")
        for c in hot[:20]:
            print(f"- `{c}`")
    else:
        print("_no keyword-matched carts_")
    print()
PY

# autopush the fix
cd "$STATE_DIR"
[ -d .git ] || git init
git branch -M main

git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/pewpi-infinity/mongoose.os.git

git fetch origin || true
git pull --rebase --autostash origin main || true

git add INDEX.md
git commit -m "fix: regenerate INDEX.md with env wiring" || true
git push origin main

echo "OK: INDEX.md rebuilt and pushed"
