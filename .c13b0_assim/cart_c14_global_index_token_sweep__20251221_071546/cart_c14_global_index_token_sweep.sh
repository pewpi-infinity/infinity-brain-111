#!/data/data/com.termux/files/usr/bin/bash

# ==================================================
# c14 — GLOBAL INDEX + TOKEN SWEEP
# Identity-safe, resumable, non-fatal
# ==================================================

# -------- SOURCE CONTROL IDENTITY (NO PAYMENTS) ----
GITHUB_OWNER="pewpi-infinity"
GITHUB_CONTACT_EMAIL="marvaseater@gmail.com"

# -------- EXTERNAL SETTLEMENT (NOT GITHUB) ---------
SETTLEMENT_PROVIDER="paypal"
SETTLEMENT_PAYEE_EMAIL="watsonkris61@gmail.com"

# -------- WORK DIR --------------------------------
WORK="$HOME/.c14_global_sweep"
CHECKPOINT="$WORK/.checkpoint"
FAILLOG="$WORK/clone_failures.log"

mkdir -p "$WORK"
cd "$WORK"

now()   { date -u +%Y-%m-%dT%H:%M:%SZ; }
human() { date "+%Y-%m-%d %H:%M:%S"; }

echo "== c14 SWEEP START $(now) =="

# --------------------------------------------------
# Fetch repos oldest -> newest
# --------------------------------------------------
gh repo list "$GITHUB_OWNER" \
  --limit 2000 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

START=0
[ -f "$CHECKPOINT" ] && START=$(cat "$CHECKPOINT")

INDEX=0

while read -r REPO; do
  INDEX=$((INDEX+1))
  [ "$INDEX" -le "$START" ] && continue

  echo
  echo "🧱 c14 [$INDEX] $REPO"

  rm -rf "$WORK/_repo" 2>/dev/null

  # --- clone (gh first, https fallback) ---
  if ! gh repo clone "$GITHUB_OWNER/$REPO" "$WORK/_repo" -- --depth 1 >/dev/null 2>&1; then
    if ! git clone --depth 1 "https://github.com/$GITHUB_OWNER/$REPO.git" "$WORK/_repo" >/dev/null 2>&1; then
      echo "clone failed: $REPO" >> "$FAILLOG"
      echo "$INDEX" > "$CHECKPOINT"
      continue
    fi
  fi

  cd "$WORK/_repo" || { echo "$INDEX" > "$CHECKPOINT"; continue; }

  rm -f .git/*.lock 2>/dev/null
  mkdir -p token ledger

  # ------------------------------------------------
  # Ensure TOKEN
  # ------------------------------------------------
  if [ ! -f token/TOKEN.md ]; then
cat <<MD > token/TOKEN.md
# C14 TOKEN 🧱🍄⭐

Token Number: $INDEX 🧱🧱🧱
Token Value: 0 🧱🧱🧱
Token Type: 🧱🍄⭐
Token DateTime: $(human)

Issued by Infinity / Octave system.
Settlement handled externally via PayPal.
MD
  fi

  # ------------------------------------------------
  # Compute value (deterministic, repeatable)
  # ------------------------------------------------
  LEDGER_COUNT=$(ls ledger/*.md 2>/dev/null | wc -l)
  FILE_COUNT=$(find . -maxdepth 2 -type f | wc -l)
  WORDS=$(wc -w token/TOKEN.md | awk '{print $1}')
  HASH=$(sha256sum token/TOKEN.md | cut -c1-6)
  HASHMOD=$((0x$HASH % 25))

  FIRST_YEAR=$(git log --reverse --format=%ad --date=short | head -n1 | cut -d- -f1)
  YEAR=$(date +%Y)
  AGE=$((YEAR - FIRST_YEAR))
  [ "$AGE" -lt 0 ] && AGE=0

  VALUE=$((LEDGER_COUNT*5 + FILE_COUNT/5 + WORDS/5 + AGE*3 + HASHMOD))

  # ------------------------------------------------
  # Ensure index
  # ------------------------------------------------
  [ -f index.html ] || echo "<!doctype html><html><body></body></html>" > index.html

  # Strip old panel
  awk '
    /<!-- C14_TOKEN_PANEL_START -->/{skip=1}
    /<!-- C14_TOKEN_PANEL_END -->/{skip=0;next}
    !skip{print}
  ' index.html > .tmp && mv .tmp index.html

cat <<HTML >> index.html
<!-- C14_TOKEN_PANEL_START -->
<div style="font-family:monospace;background:#0b0f14;color:#e6edf3;padding:16px;margin:16px 0">
  <div style="font-size:2.4em;color:#ffd700;text-align:center">
    🧱🍄⭐ Token Value: $VALUE
  </div>

  <p style="text-align:center">
    🧱 Base &nbsp; 🍄 Growth &nbsp; ⭐ Star Power
  </p>

  <form action="https://www.paypal.com/cgi-bin/webscr" method="get" target="_blank">
    <input type="hidden" name="cmd" value="_xclick">
    <input type="hidden" name="business" value="$SETTLEMENT_PAYEE_EMAIL">
    <input type="hidden" name="item_name" value="$REPO Token">
    <input type="hidden" name="amount" value="$VALUE">
    <input type="hidden" name="currency_code" value="USD">
    <button style="width:100%;padding:14px;font-size:1em">
      Pay \$${VALUE} via PayPal
    </button>
  </form>

  <p style="font-size:0.75em;text-align:center;margin-top:10px">
    Repository owner: $GITHUB_OWNER<br/>
    Contact: $GITHUB_CONTACT_EMAIL<br/>
    Settlement handled externally via PayPal
  </p>
</div>
<!-- C14_TOKEN_PANEL_END -->
HTML

  git add index.html token/TOKEN.md
  git commit -m "c14: index token panel + value + settlement separation" >/dev/null 2>&1 || true
  git push >/dev/null 2>&1 || true

  # Enable Pages (safe if already on)
  gh api -X POST "repos/$GITHUB_OWNER/$REPO/pages" \
    -f source.branch=main \
    -f source.path=/ >/dev/null 2>&1 || true

  echo "$INDEX" > "$CHECKPOINT"
  cd "$WORK"

done < repos.txt

echo
echo "== c14 SWEEP COMPLETE $(now) =="
echo "Clone failures (if any): $FAILLOG"
