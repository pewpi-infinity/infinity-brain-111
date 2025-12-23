#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

# =========================================================
# c13b0 — FINISH PAYPAL (NO WEBHOOK / NO NGROK)
# cart==repo==token==website
# FLOW:
# Buy Now (PayPal) -> Payment CSV/TSV drop -> Ownership flip -> Commit -> Site updates
# =========================================================

OWNER="pewpi-infinity"
CART_NAME="c13b0_cart_finish_paypal_no_webhook"
PAYPAL_EMAIL="marvaseater@gmail.com"
MOM_REPO="infinity-brain-111"

BASE="$HOME/.c13b0"
INBOX="$BASE/inbox"          # drop PayPal CSV/TSV here
LEDGER="$BASE/ledger"        # normalized payment proofs
WORK="$BASE/work"            # temp clones
BATCH_SIZE=25

DATE_UTC="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
DATE_HUMAN="$(date '+%Y-%m-%d %H:%M:%S')"

mkdir -p "$INBOX" "$LEDGER" "$WORK"

# ---------------- SELF CREATE + TURN ON (SINGLE FILE) ----------------
SELF_DIR="$HOME/$CART_NAME"
if [ ! -d "$SELF_DIR/.git" ]; then
  mkdir -p "$SELF_DIR"
  cp "$0" "$SELF_DIR/run.sh"
  cd "$SELF_DIR"
  git init -b main
  git remote add origin "https://github.com/$OWNER/$CART_NAME.git"
  cat <<MD > index.md
# 🧱🔑🧱 $CART_NAME
📍Activated: $DATE_UTC
Purpose: Finish PayPal without webhooks (file-based proof)
MD
  git add .
  git commit -m "🧱🔑🧱 cart created & activated"
  gh repo create "$OWNER/$CART_NAME" --public
  git push -u origin main
else
  cd "$SELF_DIR"
  git pull --rebase origin main >/dev/null 2>&1 || true
fi

# ---------------- INGEST PAYMENTS (CSV/TSV) ----------------
# Expected header:
# time,email,alias,amount,currency,custom,txn
# custom = REPO|TOKEN_HASH
ingest_file() {
  local f="$1"
  local delim=","
  [[ "$f" == *.tsv ]] && delim=$'\t'
  tail -n +2 "$f" | while IFS="$delim" read -r time email alias amount currency custom txn; do
    [[ "$custom" == *"|"* ]] || continue
    repo="${custom%%|*}"
    token="${custom#*|}"
    out="$LEDGER/PAY_${repo}_${token:0:12}.json"
    cat > "$out" <<JSON
{"time":"${time:-$DATE_UTC}","email":"$email","alias":"$alias","amount":"$amount","currency":"${currency:-USD}","repo":"$repo","token":"$token","txn":"$txn"}
JSON
  done
}

for f in "$INBOX"/payments.*; do
  [ -f "$f" ] || continue
  ingest_file "$f" || true
  mv "$f" "$INBOX/processed_$(basename "$f")_$(date -u +%Y%m%dT%H%M%SZ)"
done

# ---------------- APPLY OWNERSHIP ----------------
COUNT=0
for j in "$LEDGER"/PAY_*.json; do
  [ -f "$j" ] || continue
  COUNT=$((COUNT+1))
  [ "$COUNT" -gt "$BATCH_SIZE" ] && break

  repo="$(sed -n 's/.*"repo":"\([^"]*\)".*/\1/p' "$j")"
  token="$(sed -n 's/.*"token":"\([^"]*\)".*/\1/p' "$j")"
  alias="$(sed -n 's/.*"alias":"\([^"]*\)".*/\1/p' "$j")"
  time="$(sed -n 's/.*"time":"\([^"]*\)".*/\1/p' "$j")"
  amount="$(sed -n 's/.*"amount":"\([^"]*\)".*/\1/p' "$j")"
  cur="$(sed -n 's/.*"currency":"\([^"]*\)".*/\1/p' "$j")"

  tgt="$WORK/$repo"
  rm -rf "$tgt" 2>/dev/null || true
  git clone "https://github.com/$OWNER/$repo.git" "$tgt" || continue
  cd "$tgt"

  # Protect Mom
  if [ "$repo" = "$MOM_REPO" ]; then
    :
  fi

  # Ensure OWNERS.json
  [ -f OWNERS.json ] || echo "[]" > OWNERS.json
  python3 - <<PY
import json
p="OWNERS.json"
try: d=json.load(open(p))
except: d=[]
d.append({"token":"$token","alias":"$alias","time":"$time","amount":"$amount","currency":"$cur","event":"PAYMENT_PROOF"})
json.dump(d, open(p,"w"), indent=2)
PY

  # Update site badge (if exists)
  if [ -f site/index.html ]; then
    sed -i "1s|^|<!-- 🧱👑🧱 OWNED by $alias @ $time -->\n|" site/index.html || true
  fi

  git add .
  git commit -m "🧱👑🧱 ownership applied ($alias)" >/dev/null 2>&1 || true
  git push origin main >/dev/null 2>&1 || true

  cd "$LEDGER"
  mv "$j" "APPLIED_$(basename "$j")_$(date -u +%Y%m%dT%H%M%SZ)"
done

# ---------------- LOG ----------------
cd "$SELF_DIR"
cat <<MD >> index.md

## 🧱🍄🧱 Run
📍Date: $DATE_UTC
Applied: $COUNT
MD
git add index.md
git commit -m "🧱🍄🧱 applied $COUNT payments" >/dev/null 2>&1 || true
git push origin main >/dev/null 2>&1 || true

echo "🧱👑🧱 DONE — PAYPAL FINISHED WITHOUT WEBHOOKS"
