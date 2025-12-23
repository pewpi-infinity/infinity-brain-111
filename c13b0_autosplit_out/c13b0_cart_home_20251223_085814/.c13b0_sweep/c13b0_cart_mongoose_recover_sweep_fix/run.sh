#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# =========================================================
# c13b0 — MONGOOSE RECOVER + SWEEP + FIX (FULL CART)
# cart == repo == token == website
# DISK SAFE • BATCH SAFE • AUTO CREATE • AUTO TURN ON
# =========================================================

OWNER="pewpi-infinity"
CART_NAME="c13b0_cart_mongoose_recover_sweep_fix"
PAYPAL_EMAIL="marvaseater@gmail.com"
MOM_REPO="infinity-brain-111"

WORK="$HOME/.c13b0_global_sweep"
BATCH_SIZE=10
DATE_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
DATE_HUMAN="$(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p "$WORK"

# ---------------------------------------------------------
# SELF CREATE + TURN ON (THIS CART BECOMES A REPO/TOKEN)
# ---------------------------------------------------------
SELF_DIR="$HOME/$CART_NAME"
if [ ! -d "$SELF_DIR/.git" ]; then
  mkdir -p "$SELF_DIR"
  cp "$0" "$SELF_DIR/run.sh"
  cd "$SELF_DIR"
  git init -b main
  git remote add origin "https://github.com/$OWNER/$CART_NAME.git"

  cat <<MD > index.md
# 🧱🔑🧱 $CART_NAME

🧱⚙️🧱 **System Cart**
- Built by: MONGOOSE
- Purpose: Recover + Sweep + Fix all c13b0 repos
- Disk safe • Batch safe

📍Activated: $DATE_UTC
🧱 Token Type: SYSTEM / RECOVERY
🧱🍄 Value: grows with each successful sweep
MD

  git add .
  git commit -m "🧱🔑🧱 cart created & activated"
  gh repo create "$OWNER/$CART_NAME" --public --confirm
  git push -u origin main
fi

# ---------------------------------------------------------
# CLEAN SAFE CACHE
# ---------------------------------------------------------
find "$WORK" -name "*.lock" -type f -delete 2>/dev/null || true
find "$WORK" -maxdepth 1 -mindepth 1 -type d -exec rm -rf {} + 2>/dev/null || true

# ---------------------------------------------------------
# FETCH REPO LIST (OLDEST FIRST)
# ---------------------------------------------------------
cd "$WORK"
gh repo list "$OWNER" \
  --limit 500 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

COUNT=0
TOKEN_SEQ=100

# ---------------------------------------------------------
# BATCH SWEEP
# ---------------------------------------------------------
while read -r REPO; do
  [ -z "$REPO" ] && continue
  COUNT=$((COUNT+1))
  [ "$COUNT" -gt "$BATCH_SIZE" ] && break

  echo "🧱🟦🧱 SWEEP → $REPO"

  git clone "https://github.com/$OWNER/$REPO.git" "$WORK/$REPO" || continue
  cd "$WORK/$REPO"

  rm -f .git/*.lock 2>/dev/null || true

  # --- Research bump (non-destructive) ---
  mkdir -p research
  cat <<MD >> research/DAILY_BUMP.md
## 🧱🍄🧱 Daily Research Bump
- 📍Date: $DATE_UTC
- 🐍 Mongoose sweep applied
MD

  # --- Token enrichment ---
  mkdir -p token
  TOKEN_FILE="token/TOKEN.md"
  if ! grep -q "C13B0 Mario World Token" "$TOKEN_FILE" 2>/dev/null; then
    TOKEN_SEQ=$((TOKEN_SEQ+1))
    VALUE="$((TOKEN_SEQ % 50 + 10))"
    cat <<MD >> "$TOKEN_FILE"
---
## C13B0 Mario World Token

Token Number: $TOKEN_SEQ
Token Value: $VALUE
Token Type: 🧱⭐🍄🧱
Token DateTime: $DATE_HUMAN

Mapping:
- 🧱 Bricks = structure
- 🍄 Mushroom = growth
- ⭐ Star = acceleration
MD
  fi

  # --- PayPal normalize (forms only) ---
  grep -RIl 'paypal\.com/cgi-bin/webscr' . 2>/dev/null | while read -r f; do
    sed -i "s/name=\"business\" value=\"[^\"]*\"/name=\"business\" value=\"$PAYPAL_EMAIL\"/g" "$f" || true
  done

  # --- Protect Mom’s index ---
  if [ "$REPO" = "$MOM_REPO" ]; then
    git restore --staged index.html 2>/dev/null || true
    git checkout -- index.html 2>/dev/null || true
  fi

  git add .
  git commit -m "🧱🍄🧱 mongoose sweep: research + token + paypal ($DATE_UTC)" >/dev/null 2>&1 || true
  git push origin main >/dev/null 2>&1 || true

  cd "$WORK"
done < repos.txt

# ---------------------------------------------------------
# LOG SELF VALUE BUMP
# ---------------------------------------------------------
cd "$SELF_DIR"
cat <<MD >> index.md

## 🧱🍄🧱 Sweep Event
- 📍Date: $DATE_UTC
- Repos processed: $COUNT
- Value increment: +$COUNT
MD
git add index.md
git commit -m "🧱🍄🧱 sweep complete (+$COUNT value)" >/dev/null 2>&1 || true
git push origin main >/dev/null 2>&1 || true

echo "🧱👑🧱 DONE — FULL CART EXECUTED"
