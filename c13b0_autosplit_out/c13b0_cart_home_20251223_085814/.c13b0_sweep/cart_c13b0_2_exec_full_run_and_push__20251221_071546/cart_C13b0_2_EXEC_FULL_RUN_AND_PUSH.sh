#!/data/data/com.termux/files/usr/bin/bash
# 🧱🔑🧱 C13b0² EXECUTIVE ORDER — FULL PICTURE
# RESET → SCAN → DECIDE → NEW REPO → PUSH → EXIT

set -Eeuo pipefail

############################################
# EXECUTIVE RESET (MANDATORY)
############################################
cd ~

############################################
# CONFIG
############################################
ORG="pewpi-infinity"
BASE="$HOME/o"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUTREPO="C13b0_WIRING_EXEC_$TS"
OUTDIR="$HOME/$OUTREPO"

############################################
# HARD REQUIREMENTS
############################################
command -v git >/dev/null || exit 1
command -v gh >/dev/null || exit 1
gh auth status >/dev/null || exit 1

mkdir -p "$BASE"

############################################
# CREATE OUTPUT REPO
############################################
mkdir -p "$OUTDIR"
cd "$OUTDIR"
git init -q
gh repo create "$ORG/$OUTREPO" --public --source=. --remote=origin -y

############################################
# GET ALL REPOS (300+)
############################################
gh repo list "$ORG" --limit 1000 --json name --jq '.[].name' > repos.txt

############################################
# ENSURE LOCAL COPIES
############################################
while read -r R; do
  if [ ! -d "$BASE/$R/.git" ]; then
    git clone "https://github.com/$ORG/$R.git" "$BASE/$R" >/dev/null 2>&1 || true
  fi
done < repos.txt

############################################
# C13b0² CENSUS + DECISION ENGINE
############################################
REPORT="C13b0_REPO_DECISIONS.json"
echo "[" > "$REPORT"
FIRST=true

while read -r R; do
  REPO="$BASE/$R"
  [ -d "$REPO/.git" ] || continue
  cd "$REPO"

  FILES=$(find . -type f ! -path "./.git/*" | wc -l | tr -d ' ')
  CARTS=$(ls cart_*.sh 2>/dev/null | wc -l | tr -d ' ')
  PY=$(find . -name "*.py" | wc -l | tr -d ' ')
  SH=$(find . -name "*.sh" | wc -l | tr -d ' ')
  CRLF=$(grep -Rq $'\r' . && echo true || echo false)

  REPAIR=false
  [ "$CARTS" -eq 0 ] && REPAIR=true
  [ "$CRLF" = true ] && REPAIR=true

  ROLE="unknown"
  [[ "$R" =~ os|brain|engine ]] && ROLE="core"
  [[ "$R" =~ token|ledger|treasury ]] && ROLE="economic"
  [[ "$R" =~ ui|portal|site ]] && ROLE="interface"
  [[ "$R" =~ research|quantum|hydrogen ]] && ROLE="research"

  ACTION="wire"
  [ "$REPAIR" = true ] && ACTION="repair"
  [ "$FILES" -lt 10 ] && ACTION="add"

  cd "$OUTDIR"

  [ "$FIRST" = false ] && echo "," >> "$REPORT"
  FIRST=false

  cat << JSON >> "$REPORT"
  {
    "repo": "$R",
    "files": $FILES,
    "carts": $CARTS,
    "py": $PY,
    "sh": $SH,
    "role": "$ROLE",
    "repair": $REPAIR,
    "action": "$ACTION"
  }
JSON

done < repos.txt

echo "]" >> "$REPORT"

############################################
# FINAL PUSH
############################################
cd "$OUTDIR"
git add .
git commit -m "🧱🔑🧱 C13b0² executive repo wiring decision $TS" -q
git push -u origin main -q

echo "🧱🔑🧱 DONE → https://github.com/$ORG/$OUTREPO"
