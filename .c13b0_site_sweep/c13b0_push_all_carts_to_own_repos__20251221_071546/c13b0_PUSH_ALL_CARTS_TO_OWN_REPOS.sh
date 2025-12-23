#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

############################################
# C13B0 — PUSH EVERY CART TO OWN REPO
############################################

TS="$(date +%Y%m%d_%H%M%S)"
BASE_WORK=".c13b0_cart_push_work"

echo "🧱 C13B0 MASS CART PUSH START @ $TS"

command -v git >/dev/null || { echo "git missing"; exit 1; }
command -v gh  >/dev/null || { echo "gh missing"; exit 1; }

# ---- auto seal git identity ----
git config --global user.email >/dev/null 2>&1 || \
  git config --global user.email "c13b0@infinity.local"
git config --global user.name  >/dev/null 2>&1 || \
  git config --global user.name  "C13B0 Autonomous Cart"

rm -rf "$BASE_WORK"
mkdir -p "$BASE_WORK"

COUNT=0

for CART in *.sh; do
  [ -f "$CART" ] || continue

  CART_BASE="$(basename "$CART" .sh)"
  SAFE_NAME="$(echo "$CART_BASE" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_' '_')"
  REPO_NAME="${SAFE_NAME}_${TS}"

  echo "📦 CART  : $CART"
  echo "📁 REPO  : $REPO_NAME"

  WORKDIR="$BASE_WORK/$REPO_NAME"
  mkdir -p "$WORKDIR"
  cp "$CART" "$WORKDIR/"

  # ---- strip any embedded git ----
  find "$WORKDIR" -type d -name ".git" -prune -exec rm -rf {} +

  cd "$WORKDIR"

  git init
  git branch -M main
  git add -A
  git commit -m "🧱 C13B0 cart snapshot — $CART_BASE"

  gh repo create "$REPO_NAME" \
    --public \
    --source=. \
    --remote=origin \
    --push

  cd - >/dev/null
  rm -rf "$WORKDIR"

  COUNT=$((COUNT + 1))
  echo "✅ pushed $CART → $REPO_NAME"
  echo "--------------------------------"
done

rm -rf "$BASE_WORK"

echo "🧱 C13B0 COMPLETE"
echo "📊 Total carts pushed: $COUNT"
