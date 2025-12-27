#!/data/data/com.termux/files/usr/bin/bash
set -e

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_sweep"
mkdir -p "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
hash(){ printf "%s" "$1" | sha256sum | awk '{print $1}'; }

echo "🧱 c13b0 v2 sweep @ $(now)"

gh repo list "$OWNER" --limit 500 --json name | jq -r '.[].name' > "$WORK/repos.txt"

while read -r NAME; do
  [ -z "$NAME" ] && continue
  DIR="$WORK/$NAME"
  URL="https://github.com/$OWNER/$NAME.git"

  echo "🧱 Sweeping $NAME"

  if [ -d "$DIR/.git" ]; then
    (cd "$DIR" && git pull --ff-only) >/dev/null 2>&1 || continue
  else
    git clone "$URL" "$DIR" >/dev/null 2>&1 || continue
  fi

  cd "$DIR"

  CODE=$(ls *.sh *.py *.js *.ts *.go *.rs 2>/dev/null | wc -l)
  README=0; [ -f README.md ] && README=1

  CLASS="empty"
  [ "$CODE" -gt 0 ] && CLASS="code"
  [ "$README" -eq 1 ] && CLASS="docs"
  [ "$CODE" -gt 0 ] && [ "$README" -eq 1 ] && CLASS="mixed"

  [ -f README.md ] || echo "# $NAME" > README.md

  cat <<MD >> README.md

---
## 🧱 c13b0 Research Sweep
**Class:** $CLASS  
**Timestamp:** $(now)

### 🟨 Extracted
- Files: $(ls | wc -l)
- Code blocks: $CODE

### 🩷 Investigative
What is missing, blocked, or undefined?

### 🟩 Engineering
Tools, scripts, or automation to add next.

### 🟥 High-Value Routes
Two next paths that increase leverage.

### 🟧 Decision
Immediate action.
MD

  cat <<MD > GOAL.md
# Repo Goal — $NAME

## Purpose
Role inside Infinity / Octave ecosystem.

## 30 Days
Minimal working artifact.

## 60 Days
Automation + cross-repo links.

## 90 Days
Release-ready or synthesis.
MD

  if [ ! -f TOKEN.md ]; then
    H=$(hash "$(cat README.md)")
    cat <<MD > TOKEN.md
# 🧱 c13b0 Token
ID: ${H:0:24}
Color: 🟨
Status: evolving
Issued: $(now)

Token reflects research + build depth.
MD
  fi

  git add README.md GOAL.md TOKEN.md
  git commit -m "🧱 c13b0 sweep v2 metadata" >/dev/null 2>&1 || true
  git push origin main >/dev/null 2>&1 || true

done < "$WORK/repos.txt"

echo "🧱 Sweep complete @ $(now)"
