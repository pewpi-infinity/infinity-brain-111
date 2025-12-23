#!/data/data/com.termux/files/usr/bin/bash
set -e

OWNER="pewpi-infinity"
PAYPAL_EMAIL="watsonkris61@gmail.com"

# Disk-safe: clone one repo, patch, push, delete clone.
WORK="$HOME/.c14_sweep"
CHECKPOINT="$WORK/.checkpoint"
mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
human(){ date "+%Y-%m-%d %H:%M:%S"; }

echo "== c14 SWEEP START $(now) =="

# Oldest first, stable order.
gh repo list "$OWNER" --limit 2000 --json name,createdAt --jq 'sort_by(.createdAt)[] | .name' > repos.txt

START=0
[ -f "$CHECKPOINT" ] && START=$(cat "$CHECKPOINT" 2>/dev/null || echo 0)

i=0
while read -r REPO; do
  [ -z "$REPO" ] && continue
  i=$((i+1))
  [ "$i" -le "$START" ] && continue

  echo
  echo "🧱 c14: [$i] $REPO"

  # fresh clone each time (prevents running out of space)
  rm -rf "$WORK/_repo" 2>/dev/null || true
  git clone --depth 1 "https://github.com/$OWNER/$REPO.git" "$WORK/_repo" >/dev/null 2>&1 || {
    echo "⚠️ clone failed: $REPO"
    echo "$i" > "$CHECKPOINT"
    continue
  }

  cd "$WORK/_repo"
  rm -f .git/*.lock 2>/dev/null || true
  mkdir -p token ledger

  # Ensure token exists (minimal if missing)
  if [ ! -f token/TOKEN.md ]; then
cat <<MD > token/TOKEN.md
# C14 TOKEN 🧱🍄⭐

Token Number: $i 🧱🧱🧱
Token Value: 0 🧱🧱🧱
Token Type: 🧱🍄⭐
Token DateTime: $(human)

MD
  fi

  # ----- Compute VALUE from real repo metrics -----
  LEDGER_COUNT=$(ls ledger/*.md 2>/dev/null | wc -l | tr -d ' ')
  FILE_COUNT=$(find . -maxdepth 2 -type f 2>/dev/null | wc -l | tr -d ' ')
  TOKEN_WORDS=$(wc -w token/TOKEN.md 2>/dev/null | awk '{print $1}' | tr -d ' ')
  HASHHEX=$(sha256sum token/TOKEN.md 2>/dev/null | awk '{print $1}' | cut -c1-8)
  HASHMOD=$(( 0x${HASHHEX} % 25 ))

  # repo age factor (years)
  FIRST_YEAR=$(git log --reverse --format=%ad --date=short 2>/dev/null | head -n1 | cut -d- -f1)
  CUR_YEAR=$(date +%Y)
  AGE_YEARS=0
  if [ -n "$FIRST_YEAR" ] 2>/dev/null; then
    AGE_YEARS=$((CUR_YEAR - FIRST_YEAR))
    [ "$AGE_YEARS" -lt 0 ] && AGE_YEARS=0
  fi

  # Value formula (transparent, stable)
  # V = L*5 + F*0.2 + W*0.2 + AGE*3 + (hash%25)
  VALUE=$(echo "$LEDGER_COUNT $FILE_COUNT $TOKEN_WORDS $AGE_YEARS $HASHMOD" | \
    awk '{printf "%d", ($1*5)+($2*0.2)+($3*0.2)+($4*3)+$5 }')

  # Append pricing note to token (append-only)
cat <<MD >> token/TOKEN.md

---
C14 Pricing Update 🧱🍄⭐
Timestamp: $(human)

Metrics:
- Ledger entries (L): $LEDGER_COUNT
- File count (F): $FILE_COUNT
- Token words (W): $TOKEN_WORDS
- Age years (A): $AGE_YEARS
- Hash mod 25 (H): $HASHMOD

Token Value: $VALUE 🧱🧱🧱
Token Type: 🧱🍄⭐

MD

  # ----- Patch/ensure index.html WITHOUT destroying existing UI -----
  if [ ! -f index.html ]; then
cat <<HTML > index.html
<!doctype html><html><head><meta name=viewport content="width=device-width,initial-scale=1"></head><body>
<h1>$REPO</h1>
</body></html>
HTML
  fi

  # Remove old injected panel if present (safe)
  awk '
    BEGIN{skip=0}
    /<!-- C14_MARIO_TOKEN_PANEL_START -->/{skip=1}
    /<!-- C14_MARIO_TOKEN_PANEL_END -->/{skip=0; next}
    skip==0{print}
  ' index.html > .index.tmp && mv .index.tmp index.html

  # Inject panel right after <body...> tag if found, else at top of file
  PANEL="$(cat <<'HTMLP'
<!-- C14_MARIO_TOKEN_PANEL_START -->
<style>
.c14wrap{font-family:monospace;background:#0b0f14;color:#e6edf3;padding:14px}
.c14card{border:1px solid #30363d;border-radius:12px;padding:14px;margin:10px 0}
.c14value{font-size:2.2em;text-align:center;color:#ffd700;line-height:1.1}
.c14row{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
.c14pill{border:1px solid #30363d;border-radius:999px;padding:6px 10px}
.c14btn{display:block;width:100%;padding:14px;border-radius:12px;border:1px solid #30363d;background:#111827;color:#e6edf3;font-size:1em}
.c14note{opacity:.85;font-size:.85em;margin-top:8px}
</style>
<div class="c14wrap">
  <div class="c14card">
    <div class="c14row">
      <div class="c14pill">🧱</div>
      <div class="c14pill">🍄</div>
      <div class="c14pill">⭐</div>
    </div>
    <div class="c14value">Token Value: __C14_VALUE__</div>
    <div class="c14note">Repo: __C14_REPO__ • Updated: __C14_TIME__</div>
  </div>

  <div class="c14card">
    <div class="c14note">Pay via PayPal (email receiver). Amount is set to token value.</div>
    <form action="https://www.paypal.com/cgi-bin/webscr" method="get" target="_blank">
      <input type="hidden" name="cmd" value="_xclick">
      <input type="hidden" name="business" value="__C14_PAYPAL__">
      <input type="hidden" name="item_name" value="__C14_REPO__ Token 🧱🍄⭐">
      <input type="hidden" name="amount" value="__C14_VALUE__">
      <input type="hidden" name="currency_code" value="USD">
      <button class="c14btn" type="submit">Pay $__C14_VALUE__ via PayPal</button>
    </form>
  </div>

  <div class="c14card">
    <div class="c14note">
      Mario economy: 🧱 base • 🍄 growth • ⭐ acceleration<br>
      (This panel is additive and does not replace your existing UI.)
    </div>
  </div>
</div>
<!-- C14_MARIO_TOKEN_PANEL_END -->
HTMLP
)"
  PANEL="${PANEL/__C14_VALUE__/$VALUE}"
  PANEL="${PANEL/__C14_REPO__/$REPO}"
  PANEL="${PANEL/__C14_TIME__/$(human)}"
  PANEL="${PANEL/__C14_PAYPAL__/$PAYPAL_EMAIL}"

  if grep -qi "<body" index.html; then
    # inject after first <body...> line
    awk -v panel="$PANEL" '
      BEGIN{done=0}
      {
        print
        if(done==0 && tolower($0) ~ /<body[^>]*>/){
          print panel
          done=1
        }
      }
    ' index.html > .index.tmp && mv .index.tmp index.html
  else
    printf "%s\n%s\n" "$PANEL" "$(cat index.html)" > .index.tmp && mv .index.tmp index.html
  fi

  # ----- Commit & push -----
  git add token/TOKEN.md index.html
  git commit -m "c14: token value + mario panel + paypal + phone-first" >/dev/null 2>&1 || true
  git push >/dev/null 2>&1 || true

  # ----- Pages ON (every run, ignore if already enabled) -----
  gh api -X POST "repos/$OWNER/$REPO/pages" -f source.branch=main -f source.path=/ >/dev/null 2>&1 || true

  # checkpoint and move on
  echo "$i" > "$CHECKPOINT"
  cd "$WORK"
done < repos.txt

echo
echo "== c14 SWEEP COMPLETE $(now) =="
