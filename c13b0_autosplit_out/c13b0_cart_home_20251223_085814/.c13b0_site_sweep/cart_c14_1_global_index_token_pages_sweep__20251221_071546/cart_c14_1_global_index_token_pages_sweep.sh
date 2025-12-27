#!/data/data/com.termux/files/usr/bin/bash

OWNER="pewpi-infinity"
PAYPAL_EMAIL="watsonkris61@gmail.com"

WORK="$HOME/.c14_1_sweep"
CHECKPOINT="$WORK/.checkpoint"
LOG="$WORK/failures.log"

mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
human(){ date "+%Y-%m-%d %H:%M:%S"; }

echo "== c14.1 SWEEP START $(now) =="

gh repo list "$OWNER" \
  --limit 2000 \
  --json name,createdAt,isPrivate,isArchived \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

START=0
[ -f "$CHECKPOINT" ] && START=$(cat "$CHECKPOINT")

i=0
while read -r REPO; do
  i=$((i+1))
  [ "$i" -le "$START" ] && continue

  echo
  echo "🧱 c14.1 [$i] $REPO"

  rm -rf "$WORK/_repo" 2>/dev/null

  # Try gh clone first (handles auth better)
  if ! gh repo clone "$OWNER/$REPO" "$WORK/_repo" -- --depth 1 >/dev/null 2>&1; then
    # Fallback to HTTPS
    if ! git clone --depth 1 "https://github.com/$OWNER/$REPO.git" "$WORK/_repo" >/dev/null 2>&1; then
      echo "⚠️ clone failed: $REPO" | tee -a "$LOG"
      echo "$i" > "$CHECKPOINT"
      continue
    fi
  fi

  cd "$WORK/_repo" || { echo "$i" > "$CHECKPOINT"; continue; }

  rm -f .git/*.lock 2>/dev/null
  mkdir -p token ledger

  # Ensure token exists
  if [ ! -f token/TOKEN.md ]; then
cat <<MD > token/TOKEN.md
# C14 TOKEN 🧱🍄⭐
Token Number: $i 🧱🧱🧱
Token Value: 0 🧱🧱🧱
Token Type: 🧱🍄⭐
Token DateTime: $(human)
MD
  fi

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

  # Ensure index
  [ -f index.html ] || echo "<!doctype html><html><body></body></html>" > index.html

  # Remove old panel
  awk '
    /<!-- C14_MARIO_PANEL_START -->/{skip=1}
    /<!-- C14_MARIO_PANEL_END -->/{skip=0;next}
    !skip{print}
  ' index.html > .tmp && mv .tmp index.html

cat <<HTML >> index.html
<!-- C14_MARIO_PANEL_START -->
<div style="font-family:monospace;background:#0b0f14;color:#e6edf3;padding:14px;margin:14px 0">
  <div style="font-size:2.2em;color:#ffd700;text-align:center">
    🧱🍄⭐ Token Value: $VALUE
  </div>
  <p style="text-align:center">🧱 Base • 🍄 Growth • ⭐ Star Power</p>
  <form action="https://www.paypal.com/cgi-bin/webscr" method="get" target="_blank">
    <input type="hidden" name="cmd" value="_xclick">
    <input type="hidden" name="business" value="$PAYPAL_EMAIL">
    <input type="hidden" name="item_name" value="$REPO Token">
    <input type="hidden" name="amount" value="$VALUE">
    <input type="hidden" name="currency_code" value="USD">
    <button style="width:100%;padding:14px">Pay $$VALUE via PayPal</button>
  </form>
</div>
<!-- C14_MARIO_PANEL_END -->
HTML

  git add index.html token/TOKEN.md
  git commit -m "c14.1 mario token value + paypal" >/dev/null 2>&1 || true
  git push >/dev/null 2>&1 || true

  gh api -X POST "repos/$OWNER/$REPO/pages" \
    -f source.branch=main -f source.path=/ >/dev/null 2>&1 || true

  echo "$i" > "$CHECKPOINT"
  cd "$WORK"

done < repos.txt

echo
echo "== c14.1 SWEEP COMPLETE $(now) =="
echo "Clone failures logged in $LOG"
