#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# ==========================================
# 🧱 c13b0 — ONE CART → ONE REPO (AUTHORITATIVE)
# ==========================================
# Rules enforced:
#  - ONE repo per cart
#  - Repo name derives from cart filename
#  - Extra index file is isolated and pushed correctly
#  - No auto loops, no recursion, no garbage
#
# Requirements:
#  - GITHUB_TOKEN env var set
#  - GITHUB_USER env var set (default: pewpi-infinity)
# ==========================================

say(){ printf "%s\n" "$*"; }

# ---------- sanity ----------
[ -d .git ] || { say "❌ Not in a git repo"; exit 1; }

GITHUB_USER="${GITHUB_USER:-pewpi-infinity}"
GITHUB_TOKEN="${GITHUB_TOKEN:-}"

[ -n "$GITHUB_TOKEN" ] || {
  say "❌ GITHUB_TOKEN not set"
  exit 1
}

# ---------- identify cart ----------
# cart = the executable c13b0/cart script in this directory
CART_FILE="$(ls -1 | grep -E '^(cart|c13b0).*\.sh$' | head -n 1 || true)"

[ -n "$CART_FILE" ] || {
  say "❌ No cart script found in directory"
  exit 1
}

CART_NAME="${CART_FILE%.sh}"
SAFE_NAME="$(echo "$CART_NAME" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_' '-')"

TS="$(date +%Y%m%d_%H%M%S)"
REPO_NAME="${SAFE_NAME}_${TS}"

say "🧱 CART      : $CART_FILE"
say "🧱 REPO NAME : $REPO_NAME"

# ---------- handle the extra index file ----------
# Any non-root index file that blocks push gets isolated
INDEX_STASH=".c13b0_index_stash"
mkdir -p "$INDEX_STASH"

for IDX in $(git status --porcelain | awk '{print $2}' | grep -i 'index'); do
  say "📦 isolating index file: $IDX"
  mkdir -p "$INDEX_STASH/$(dirname "$IDX")"
  mv "$IDX" "$INDEX_STASH/$IDX"
done

# ---------- commit cart contents ----------
git add -A
git commit -m "🧱 c13b0 cart commit $CART_NAME $TS" >/dev/null 2>&1 || true

# ---------- create repo ----------
API_RESP="$(curl -sS -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"private\":false,\"auto_init\":false}")"

echo "$API_RESP" | grep -q '"full_name"' || {
  say "❌ Repo creation failed"
  echo "$API_RESP"
  exit 1
}

REMOTE_URL="https://github.com/${GITHUB_USER}/${REPO_NAME}.git"

# ---------- push cart repo ----------
git branch -M main
git remote remove origin >/dev/null 2>&1 || true
git remote add origin "$REMOTE_URL"
git push -u origin main

# ---------- push index stash separately (proper place) ----------
if [ -n "$(ls -A "$INDEX_STASH" 2>/dev/null)" ]; then
  say "📤 pushing isolated index files to index repo"

  INDEX_REPO="${SAFE_NAME}_index_${TS}"

  curl -sS -X POST \
    -H "Authorization: token $GITHUB_TOKEN" \
    -H "Accept: application/vnd.github+json" \
    https://api.github.com/user/repos \
    -d "{\"name\":\"$INDEX_REPO\",\"private\":false,\"auto_init\":false}" >/dev/null

  git init .c13b0_index_repo
  cd .c13b0_index_repo
  cp -r "../$INDEX_STASH/." .
  git add -A
  git commit -m "🧱 index files for $CART_NAME"
  git branch -M main
  git remote add origin "https://github.com/${GITHUB_USER}/${INDEX_REPO}.git"
  git push -u origin main
  cd ..
fi

say "✅ DONE"
say "✅ Cart pushed to: https://github.com/${GITHUB_USER}/${REPO_NAME}"
[ -d .c13b0_index_repo ] && say "✅ Index pushed separately"

