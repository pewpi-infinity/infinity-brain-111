#!/data/data/com.termux/files/usr/bin/bash
set -e

# =========================================================
# c13b0³ STAGE 3 GLOBAL SWEEP
# MARIO TOKEN EVOLUTION • ALL REPOS • PAGES ON
# ONE PASTE • AUTO RUN • TERMUX SAFE
# =========================================================

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_stage3_sweep"
mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
human(){ date "+%Y-%m-%d %H:%M:%S"; }

echo "== c13b0³ STAGE 3 SWEEP START $(now) =="

# ---------------------------------------------------------
# Repo list (oldest first)
# ---------------------------------------------------------
gh repo list "$OWNER" \
  --limit 1000 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

TOKEN_SEQ=100

while read -r REPO; do
  [ -z "$REPO" ] && continue
  echo
  echo "🧱 Sweeping $REPO"

  rm -rf "$WORK/$REPO" 2>/dev/null || true
  git clone "https://github.com/$OWNER/$REPO.git" "$WORK/$REPO" || continue
  cd "$WORK/$REPO"

  rm -f .git/*.lock 2>/dev/null || true
  mkdir -p token

  TOKEN="token/TOKEN.md"

  # -----------------------------------------------------
  # Determine token stage
  # -----------------------------------------------------
  STAGE="🧱"
  grep -q "🍄🟩" "$TOKEN" 2>/dev/null && STAGE="🍄🟩"
  grep -q "⭐✨⭐" "$TOKEN" 2>/dev/null && STAGE="⭐✨⭐"
  grep -q "⭐" "$TOKEN" 2>/dev/null && STAGE="⭐"
  grep -q "🍄" "$TOKEN" 2>/dev/null && STAGE="🍄"

  NEXT_STAGE="$STAGE"
  case "$STAGE" in
    "🧱") NEXT_STAGE="🍄" ;;
    "🍄") NEXT_STAGE="🍄🟩" ;;
    "🍄🟩") NEXT_STAGE="⭐" ;;
    "⭐") NEXT_STAGE="⭐✨⭐" ;;
    *) NEXT_STAGE="$STAGE" ;;
  esac

  if [ ! -f "$TOKEN" ]; then
    TOKEN_SEQ=$((TOKEN_SEQ+1))
    NEXT_STAGE="🧱"
cat <<MD > "$TOKEN"
# C13B0 TOKEN

Token Number: $TOKEN_SEQ 🧱🧱🧱
Token Value: $((TOKEN_SEQ % 50 + 10)) 🧱🧱🧱
Token Type: 🧱
Token DateTime: $(human)

Stage: 🧱🟫🧱
Status: Brick initialized (puzzle unopened)

MD
  else
cat <<MD >> "$TOKEN"

---
Stage Update @ $(human)
Previous Stage: $STAGE
Current Stage: $NEXT_STAGE

Mario Logic:
- 🧱 base structure
- 🍄 growth
- 🍄🟩 1-UP (Free Guy revival)
- ⭐ star power
- ⭐✨⭐ multi-star (set aggregation)

Star Power Note:
If ⭐ present, power expires after 30 days unless renewed.

MD
  fi

  # -----------------------------------------------------
  # Ensure index exists
  # -----------------------------------------------------
  if [ ! -f index.html ]; then
cat <<HTML > index.html
<!doctype html>
<html>
<head>
<meta name=viewport content="width=device-width,initial-scale=1">
<title>$REPO</title>
<style>
body{background:#0b0f14;color:#e6edf3;font-family:monospace;padding:12px}
.panel{border:1px solid #30363d;padding:12px;margin:12px 0}
</style>
</head>
<body>
<h1>$REPO</h1>
<div class=panel>
<h2>Token</h2>
<pre id=token></pre>
</div>
<script>
fetch("token/TOKEN.md").then(r=>r.text()).then(t=>token.textContent=t);
</script>
</body>
</html>
HTML
  fi

  # -----------------------------------------------------
  # Commit & push
  # -----------------------------------------------------
  git add token/TOKEN.md index.html
  git commit -m "c13b0³ stage3 token evolution $NEXT_STAGE" || true
  git push || true

  # -----------------------------------------------------
  # Turn GitHub Pages ON (every time)
  # -----------------------------------------------------
  gh api -X POST "repos/$OWNER/$REPO/pages" \
    -f source.branch=main \
    -f source.path=/ >/dev/null 2>&1 || true

  cd "$WORK"

done < repos.txt

echo
echo "== c13b0³ STAGE 3 SWEEP COMPLETE $(now) =="
