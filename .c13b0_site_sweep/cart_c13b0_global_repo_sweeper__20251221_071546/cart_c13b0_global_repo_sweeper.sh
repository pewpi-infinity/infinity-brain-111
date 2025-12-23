#!/data/data/com.termux/files/usr/bin/bash
#
# c13b0 — GLOBAL REPO SWEEPER (HTTPS SAFE)
# NO SSH • NO PROMPTS • NO STALLS
#

set -e

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_sweep"
mkdir -p "$WORK"

now() { date -u +%Y-%m-%dT%H:%M:%SZ; }
hash() { printf "%s" "$1" | sha256sum | awk '{print $1}'; }

# rotate index styles per run
STYLES=("octave-terminal" "octave-grid" "octave-cards" "octave-dark")
STYLE="${STYLES[$RANDOM % ${#STYLES[@]}]}"

echo "🧱 c13b0 sweeper started @ $(now)"
echo "🧱 Using HTTPS (non-interactive)"

# Pull repo list using gh (already authenticated)
gh repo list "$OWNER" --limit 500 --json name | jq -r '.[].name' > "$WORK/repos.txt"

while read -r NAME; do
  [ -z "$NAME" ] && continue

  DIR="$WORK/$NAME"
  URL="https://github.com/$OWNER/$NAME.git"

  echo "🧱 Processing $NAME"

  if [ -d "$DIR/.git" ]; then
    ( cd "$DIR" && git pull --ff-only ) >/dev/null 2>&1 || continue
  else
    git clone "$URL" "$DIR" >/dev/null 2>&1 || continue
  fi

  cd "$DIR"

  HAS_CODE=$(ls *.sh *.py *.js *.ts *.go *.rs 2>/dev/null | wc -l)
  HAS_README=0
  [ -f README.md ] && HAS_README=1

  CLASS="empty"
  [ "$HAS_CODE" -gt 0 ] && CLASS="code"
  [ "$HAS_README" -eq 1 ] && CLASS="docs"
  [ "$HAS_CODE" -gt 0 ] && [ "$HAS_README" -eq 1 ] && CLASS="mixed"

  [ -f README.md ] || echo "# $NAME" > README.md

cat <<MD >> README.md

---

## 🧱 Research Notes ($CLASS)
**Timestamp:** $(now)

### 🟨 Extracted Data
- Repo files: $(ls | wc -l)
- Code present: $HAS_CODE

### 🩷 Investigative
What is missing, blocked, or undefined in this repository.

### 🟩 Engineering / Tools
What scripts, modules, or tooling would advance this repo fastest.

### 🟥 Routes Worth More
Two concrete next build paths with reasoning.

### 🟧 Decisions
Immediate next step and why it matters.

MD

cat <<MD > GOAL.md
# Repo Goal — $NAME

## Purpose
Define the role of this repository inside Infinity / Octave.

## 30 Days
- Stabilize structure
- Minimal working artifact

## 60 Days
- Expand depth or automation
- Cross-link with related repos

## 90 Days
- Synthesis or release-ready state
MD

if [ ! -f TOKEN.md ]; then
  H="$(hash "$(cat README.md)")"
cat <<MD > TOKEN.md
# 📍 c13b0 Token

## 🧱🧱🧱 ID
🧱🧱🧱 ${H:0:24}

## 🧱🧱🧱 Value
🧱🧱🧱 bricked until jump-to graph resolves

## Color
🟨

## Date & Time
$(now)

## 📍 research writer/token generating 📍
Token derived from repository evolution and research depth.
MD
fi

cat <<HTML > index.html
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>$NAME — Octave</title>
<style>
body{font-family:monospace;background:#0b0f14;color:#e6edf3;padding:20px}
.box{border:1px solid #30363d;padding:16px}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}
.card{border:1px solid #444;padding:12px}
</style>
</head>
<body>
<div class="box">
<h1>Octave :: $NAME</h1>
<p>Design style: $STYLE</p>
<div class="grid">
  <div class="card">🧱 Research</div>
  <div class="card">⭐ Acceleration</div>
  <div class="card">🍄 Growth</div>
  <div class="card">❤️ Memory</div>
</div>
</div>
</body>
</html>
HTML

  git add README.md GOAL.md TOKEN.md index.html
  git commit -m "c13b0 sweep: research, goal, token, index" >/dev/null 2>&1 || true
  git push origin main >/dev/null 2>&1 || true

  echo "✅ SWEPT → $NAME ($CLASS)"

done < "$WORK/repos.txt"

echo "🧱 c13b0 sweeper completed @ $(now)"
