#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "🧱🔑🧱 C13b0 ONE-SHOT PUSH FIX"
echo "Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Dir:  $(pwd)"
echo

# --------- 0) Find / confirm git repo ----------
if [ ! -d .git ]; then
  echo "❌ Not in a git repo (.git missing)."
  echo "➡️  Go into the repo folder FIRST, then rerun:"
  echo "    cd ~/PATH/TO/YOUR/REPO"
  echo "    bash c13b0_ONE_SHOT_PUSH_FIX.sh"
  echo
  echo "Quick hints (common locations):"
  echo "  ls -la ~ | sed -n '1,120p'"
  exit 1
fi

TOP=$(git rev-parse --show-toplevel 2>/dev/null || true)
echo "✅ Git repo detected"
echo "Top: $TOP"
echo

# --------- 1) Show current remote ----------
echo "📡 Current remotes:"
git remote -v || true
echo

# --------- 2) Ensure origin exists ----------
if ! git remote get-url origin >/dev/null 2>&1; then
  echo "⚠️  Remote 'origin' is missing."
  echo "Paste your GitHub repo HTTPS URL (example):"
  echo "  https://github.com/pewpi-infinity/REPO_NAME.git"
  echo
  read -r -p "Origin URL: " ORIGIN_URL
  if [ -z "${ORIGIN_URL}" ]; then
    echo "❌ No URL provided. Exiting."
    exit 1
  fi
  git remote add origin "$ORIGIN_URL"
  echo "✅ Set origin to: $ORIGIN_URL"
  echo
fi

ORIGIN_URL_NOW=$(git remote get-url origin)
echo "✅ Using origin: $ORIGIN_URL_NOW"
echo

# --------- 3) Lock down gitignore (protect secrets, DO NOT ignore carts) ----------
# (This prevents .git-credentials/.ssh/.bash_history/etc from ever being committed.)
if [ ! -f .gitignore ]; then
  touch .gitignore
fi

cat << 'GITIGNORE' > .gitignore
# --- NEVER COMMIT SECRETS / SYSTEM FILES ---
.bash_history
.bashrc
.profile
.git-credentials
.gitconfig
.ssh/
.termux/
.config/
.lesshst
.npmrc

# --- RUNTIME / STATE / EXPLOSIVE OUTPUT (SAFE TO IGNORE) ---
.c13b0*/
.c13b0_*/*
.c14*/
.infinity_*/
.infinity_pids/
.infinity_spine_state/

# --- LOGS / TEMP ---
*.log
last_push_log.txt
push_log.txt

# --- CACHE / BUILD ---
node_modules/
dist/
build/
storage/

# Note: carts (*.sh, *.py, *.cartridge, *.cart) are intentionally NOT ignored.
GITIGNORE

# --------- 4) Detect nested repos (common reason "nothing pushed") ----------
NESTED=$(find . -mindepth 2 -maxdepth 4 -name ".git" -type d 2>/dev/null | head -n 20 || true)
if [ -n "$NESTED" ]; then
  echo "⚠️  Nested repos detected (these do NOT push with the parent repo):"
  echo "$NESTED"
  echo
  echo "If your carts are inside one of those, cd into THAT repo and run this script there."
  echo
fi

# --------- 5) Stage ONLY the right stuff ----------
echo "🧹 Cleaning ignored junk (safe)..."
git clean -fdX >/dev/null 2>&1 || true

echo "➕ Staging carts + key docs..."
git add .gitignore >/dev/null 2>&1 || true
git add \
  *.cart *.cartridge \
  cart*.sh cart*.py \
  CART*.sh CART*.json \
  README.md INFINITY_REPO_INDEX.md \
  site/ \
  2>/dev/null || true

echo
echo "📌 Status (short):"
git status --short
echo

# --------- 6) Commit (if needed) ----------
TS=$(date -u +"%Y%m%dT%H%M%SZ")
if git diff --cached --quiet; then
  echo "ℹ️ Nothing staged to commit (either already committed, or files are elsewhere)."
else
  git commit -m "🧱🔑🧱 C13b0 one-shot push $TS" || true
fi

# --------- 7) Push + set upstream automatically ----------
BR=$(git branch --show-current 2>/dev/null || echo "main")
if [ -z "$BR" ]; then BR="main"; fi

echo
echo "🚀 Pushing branch: $BR"
# Try normal push first
if git push 2>/dev/null; then
  echo "✅ Push OK."
else
  echo "⚠️ Push needed upstream bind or remote has commits."
  echo "➡️ Trying: git push --set-upstream origin $BR"
  if git push --set-upstream origin "$BR"; then
    echo "✅ Upstream set + pushed."
  else
    echo
    echo "❌ Push still failed. Most common reasons:"
    echo "  1) Auth not set (GitHub password not allowed; needs token/gh auth)."
    echo "  2) Remote has new commits (need pull --rebase)."
    echo
    echo "Run these and paste output:"
    echo "  git remote -v"
    echo "  git status"
    echo "  git pull --rebase origin $BR"
    exit 2
  fi
fi

echo
echo "🔍 Verifying remote HEAD..."
git ls-remote --heads origin "$BR" | head -n 3 || true

echo
echo "🧱✅ DONE."
echo "If you still think 'nothing went to my repo', run:"
echo "  git log --oneline --decorate -10"
