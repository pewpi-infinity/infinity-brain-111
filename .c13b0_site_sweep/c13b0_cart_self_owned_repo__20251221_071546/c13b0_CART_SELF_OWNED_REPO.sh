#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

############################################
# C13B0 — SELF OWNED CART (CLEAN + IDENTITY)
############################################

TS="$(date +%Y%m%d_%H%M%S)"
CART_NAME="c13b0_CART_SELF_OWNED_REPO"
SAFE_NAME="c13b0_cart_self_owned_repo"
REPO_NAME="${SAFE_NAME}_${TS}"

INDEX_HOLD=".c13b0_index_hold"
WORKDIR=".c13b0_index_repo"

echo "🧱 C13B0 START"
echo "📦 CART : $CART_NAME"
echo "📁 REPO : $REPO_NAME"

# ---- tools ----
command -v git >/dev/null || { echo "git missing"; exit 1; }
command -v gh  >/dev/null || { echo "gh missing"; exit 1; }

# ---- auto-seal git identity (ONCE) ----
if ! git config --global user.email >/dev/null 2>&1; then
  git config --global user.email "c13b0@infinity.local"
fi

if ! git config --global user.name >/dev/null 2>&1; then
  git config --global user.name "C13B0 Autonomous Cart"
fi

# ---- nothing to push ----
[ -d "$INDEX_HOLD" ] || {
  echo "ℹ️ index hold missing — nothing to push"
  exit 0
}

[ "$(ls -A "$INDEX_HOLD" 2>/dev/null)" ] || {
  echo "ℹ️ index hold empty — nothing to push"
  exit 0
}

# ---- hard reset workspace ----
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"
cd "$WORKDIR"

# ---- copy payload ----
cp -r "../$INDEX_HOLD/." .

# ---- CRITICAL: strip embedded git repos ----
find . -type d -name ".git" -prune -exec rm -rf {} +

# ---- init clean repo ----
git init
git branch -M main
git add -A
git commit -m "🧱 C13B0 index snapshot — $CART_NAME"

# ---- create + push ----
gh repo create "$REPO_NAME" \
  --public \
  --source=. \
  --remote=origin \
  --push

cd ..
rm -rf "$WORKDIR"

echo "✅ C13B0 COMPLETE"
echo "✅ Cart repo pushed: $REPO_NAME"
echo "🧹 Identity sealed · embedded repos removed"
