#!/data/data/com.termux/files/usr/bin/bash
set -e

OWNER="pewpi-infinity"
PAYPAL_EMAIL="watsonkris61@gmail.com"
WORK="$HOME/.c13b0_index_paypal"
BATCH=10

mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }

echo "== c13b0 INDEX + PAYPAL + MARIO SWEEP START $(now) =="

gh repo list "$OWNER" \
  --limit 1000 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

COUNT=0

while read -r REPO; do
  [ -z "$REPO" ] && continue
  COUNT=$((COUNT+1))
  [ "$COUNT" -gt "$BATCH" ] && break

  echo "🧱 Processing $REPO"

  rm -rf "$WORK/$REPO" 2>/dev/null || true
  git clone "https://github.com/$OWNER/$REPO.git" "$WORK/$REPO" || continue
  cd "$WORK/$REPO"

  rm -f .git/*.lock 2>/dev/null || true
  mkdir -p token ledger

  # -------- metrics --------
  LEDGER_COUNT=$(ls ledger/*.md 2>/dev/null | wc -l)
  TOKEN_WORDS=$(wc -w token/TOKEN.md 2>/dev/null | awk '{print $1}')
  AGE=$(git log --reverse --format=%ad --date=short | head -n1 | cut -d- -f1)
  YEAR=$(date +%Y)
  AGE_YEARS=$((YEAR - AGE))
  HASH=$(sha256sum token/TOKEN.md 2>/dev/null | cut -c1-6 | tr 'a-f' '1-6')

  VALUE=$(echo "$LEDGER_COUNT $TOKEN_WORDS $AGE_YEARS $HASH" | \
    awk '{printf "%d", ($1*5)+($2*0.2)+($3*3)+($4%25)}')

  # -------- index handling --------
  if [ ! -f index.html ]; then
    echo "<!doctype html><html><head></head><body></body></html>" > index.html
  fi

  # -------- inject mario/paypal block --------
  sed -i '/<!-- C13B0_TOKEN_BLOCK -->/,$d' index.html

cat <<HTML >> index.html
<!-- C13B0_TOKEN_BLOCK -->
<style>
.c13b0{font-family:monospace;background:#0b0f14;color:#e6edf3;padding:16px}
.c13b0 .value{font-size:2em;color:#ffd700}
.c13b0 button{padding:12px;font-size:1em;width:100%;margin-top:8px}
</style>

<div class="c13b0">
  <h2>🧱🍄⭐ Token</h2>
  <div class="value">Value: $VALUE</div>
  <p>🧱 Base • 🍄 Growth • ⭐ Star Power</p>

  <h3>Support / Acquire</h3>
  <p>This token represents real work, research, and structure.</p>

  <a href="https://www.paypal.com/paypalme/$PAYPAL_EMAIL/$VALUE" target="_blank">
    <button>Pay \$${VALUE} via PayPal</button>
  </a>

  <p style="font-size:0.8em;">
    PayPal recipient: $PAYPAL_EMAIL<br/>
    Repo: $REPO<br/>
    Generated: $(now)
  </p>
</div>
HTML

  git add index.html
  git commit -m "c13b0 index: mario token + paypal value layer" || true
  git push || true

  gh api -X POST "repos/$OWNER/$REPO/pages" \
    -f source.branch=main \
    -f source.path=/ >/dev/null 2>&1 || true

  cd "$WORK"

done < repos.txt

echo "== c13b0 SWEEP COMPLETE $(now) =="
