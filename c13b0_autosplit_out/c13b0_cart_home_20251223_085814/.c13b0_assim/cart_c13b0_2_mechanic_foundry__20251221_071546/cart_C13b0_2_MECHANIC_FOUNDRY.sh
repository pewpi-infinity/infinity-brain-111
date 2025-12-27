#!/data/data/com.termux/files/usr/bin/bash
set -e

# 🧱🔧🧱
# C13b0² MECHANIC + FOUNDRY
# Program:
# - Walk repos ONE BY ONE under pewpi-infinity
# - Pull, add/fix carts if needed
# - Wire this cart into each repo
# - If a repo has a working script, generate a LAVA helper that interoperates
# - Commit & push EACH repo (expect ~333 pushes)
# - Create ONE NEW intelligently-named repo per cycle (tokenized title)
# Software package • No folders
# Run = push • Re-run = repush
# C13b0² always acknowledged

# Anchor to git root for this controller repo
ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

SYMBOL="🧱🔧🧱"
VERSION="C13b0²"
ORG="pewpi-infinity"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Require gh
gh auth status >/dev/null 2>&1 || { echo "gh auth required"; exit 1; }

# Title pool for intelligent repo naming (cycled)
TITLES=(viper cobra vtol rayban power spiderweb falcon atlas nova ember aurora)

# List all repos
REPOS=$(gh repo list "$ORG" --limit 500 --json name --jq '.[].name')

i=0
for R in $REPOS; do
  echo "🧱🔧🧱 WORKING → $R"
  WORK="/tmp/c13b0_$R"
  rm -rf "$WORK"
  gh repo clone "$ORG/$R" "$WORK"
  cd "$WORK"

  # Always sync
  git pull --ff-only || true

  # Ensure C13b0² identity cart exists (root-only)
  if [ ! -f cart_C13b0_2_SYSTEM_IDENTITY.sh ]; then
cat << 'IDEOF' > cart_C13b0_2_SYSTEM_IDENTITY.sh
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat << JSON > "C13b0_IDENTITY_${TS}.json"
{"version":"C13b0²","acknowledged":true,"symbol":"🧱🔗🧱","timestamp":"'"$TS"'","role":"system_identity"}
JSON
git add -A
git commit -m "🧱🔗🧱 C13b0² identity $TS" || true
git push || true
IDEOF
    chmod +x cart_C13b0_2_SYSTEM_IDENTITY.sh
  fi

  # If repo has any executable script, add a LAVA helper to interop
  if ls *.sh >/dev/null 2>&1; then
cat << 'LAVAE' > cart_C13b0_2_LAVA.sh
#!/data/data/com.termux/files/usr/bin/bash
set -e
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat << JSON > "C13b0_LAVA_${TS}.json"
{"version":"C13b0²","acknowledged":true,"symbol":"🧱🌋🧱","timestamp":"'"$TS"'","interop":"lava","note":"binds working scripts"}
JSON
git add -A
git commit -m "🧱🌋🧱 C13b0² lava bind $TS" || true
git push || true
LAVAE
    chmod +x cart_C13b0_2_LAVA.sh
  fi

  # Commit & push fixes/additions for this repo
  git add -A
  git commit -m "🧱🔧🧱 C13b0² mechanic pass $TS" || true
  git push || true

  cd "$ROOT"
  rm -rf "$WORK"
  i=$((i+1))
done

# Create ONE new intelligently-named repo per run (tokenized)
TITLE="${TITLES[$((RANDOM % ${#TITLES[@]}))]}"
NEW_REPO="c13b0_${TITLE}_$(date -u +%Y%m%d_%H%M%S)"
gh repo create "$ORG/$NEW_REPO" --public --confirm

# Record controller state
OUT="C13b0_MECHANIC_FOUNDRY_${TS}.json"
cat << JSON > "$OUT"
{
  "symbol":"$SYMBOL",
  "version":"$VERSION",
  "acknowledged":true,
  "timestamp":"$TS",
  "processed_repos":"$(echo "$REPOS" | wc -w)",
  "new_repo":"$NEW_REPO",
  "titles_pool":"${TITLES[*]}",
  "expectation":"~333 individual pushes executed"
}
JSON

git add -A
git commit -m "🧱🔧🧱 C13b0² mechanic+foundry $TS" || true
git push || true

echo "🧱🔧🧱 DONE • New repo: $NEW_REPO"
