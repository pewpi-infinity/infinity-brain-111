#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

### 🧱 C13B0 CASTLE SWEEPER 🧱
### Brick-safe. Crown-aware. Pixie-protected.

ROOT="$HOME"
LOG_DIR="$HOME/.c13b0_logs"
TIMESTAMP="$(date -u +%Y%m%d_%H%M%S)"
RUN_LOG="$LOG_DIR/run_$TIMESTAMP.log"
MANIFEST="$LOG_DIR/manifest_$TIMESTAMP.txt"

PIXIE_LOCK="infinity-brain-111"

mkdir -p "$LOG_DIR"
echo "🧱👑🧱 C13B0 CASTLE SWEEPER START $TIMESTAMP" | tee "$RUN_LOG"

### Helpers
log() { echo "$1" | tee -a "$RUN_LOG"; }
backup_file() {
  local f="$1"
  [ -f "$f" ] || return
  cp "$f" "$f.bak_$TIMESTAMP"
  log "🧱📦🧱 BACKUP -> $f.bak_$TIMESTAMP"
}

add_header_if_missing() {
  local f="$1"
  local marker="$2"
  local content="$3"

  grep -q "$marker" "$f" && return

  backup_file "$f"
  printf "%s\n%s\n" "$content" "$(cat "$f")" > "$f.tmp"
  mv "$f.tmp" "$f"
  log "🧱➕🧱 HEADER ADDED -> $f"
}

### Discover repos
log "🧱🔍🧱 SCANNING FOR REPOS..."
find "$ROOT" -maxdepth 3 -type d -name ".git" | sed 's|/.git||' > "$MANIFEST"
TOTAL=$(wc -l < "$MANIFEST")
log "🧱📊🧱 FOUND $TOTAL REPOS"

### Sweep loop
COUNT=0
while read -r REPO; do
  COUNT=$((COUNT+1))
  NAME="$(basename "$REPO")"
  log ""
  log "🧱🏗️🧱 [$COUNT/$TOTAL] REPO -> $NAME"

  cd "$REPO" || continue

  if [ ! -d .git ]; then
    log "🧱⚠️🧱 NOT A GIT REPO, SKIP"
    continue
  fi

  if [ "$NAME" = "$PIXIE_LOCK" ]; then
    log "🧱👰🧱 PIXIE_LOCK ACTIVE — READ ONLY"
    continue
  fi

  INDEX="index.html"

  if [ ! -f "$INDEX" ]; then
    log "🧱🧱🧱 MISSING index.html — CREATING"
    cat << 'IDX' > "$INDEX"
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Pewpi Site</title>
</head>
<body>
<h1>Pewpi Site Initialized</h1>
</body>
</html>
IDX
  fi

  ### Required Pewpi hook
  add_header_if_missing "$INDEX" "pewpi-login" \
'<!-- pewpi-login -->
<script src="/pewpi-login.js"></script>'

  ### AC494 repair marker
  add_header_if_missing "$INDEX" "ac494" \
'<!-- ac494 -->
<meta name="pewpi" content="ac494"/>'

  ### Create pewpi-login.js if missing
  if [ ! -f "pewpi-login.js" ]; then
    cat << 'JS' > pewpi-login.js
// pewpi login placeholder
console.log("Pewpi login loaded");
JS
    log "🧱🔑🧱 CREATED pewpi-login.js"
  fi

  git add .
  if git diff --cached --quiet; then
    log "🧱✔️🧱 NO CHANGES NEEDED"
  else
    git commit -m "🧱 C13B0 castle sweep auto-fix $TIMESTAMP" || true
    git push || log "🧱⚠️🧱 PUSH FAILED (non-fatal)"
    log "🧱🚀🧱 COMMITTED & PUSHED"
  fi

done < "$MANIFEST"

log ""
log "🧱👑🧱 SWEEP COMPLETE — CASTLE STABLE"
log "🧱📜🧱 LOG: $RUN_LOG"
