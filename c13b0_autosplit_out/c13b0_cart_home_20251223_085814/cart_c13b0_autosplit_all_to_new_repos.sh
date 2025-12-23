#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ROOT="$HOME"
OUT="$HOME/c13b0_autosplit"
LOG="$HOME/.c13b0_logs/autosplit_$(date +%Y%m%d_%H%M%S).log"
ORG="pewpi-infinity"
SKIP_REPO="infinity-brain-111"

mkdir -p "$OUT" "$HOME/.c13b0_logs"

echo "🧱👑🧱 C13B0 AUTO-SPLIT START" | tee "$LOG"

# Find all git repos
find "$ROOT" -maxdepth 3 -type d -name ".git" | sed 's|/.git||' | while read -r SRC; do
  NAME="$(basename "$SRC")"

  if [ "$NAME" = "$SKIP_REPO" ]; then
    echo "🧱👰🧱 SKIP PIXIE_LOCK $NAME" | tee -a "$LOG"
    continue
  fi

  NEW_REPO="cart_${NAME}"
  DEST="$OUT/$NEW_REPO"

  echo "🧱📦🧱 SPLIT $NAME → $NEW_REPO" | tee -a "$LOG"

  rm -rf "$DEST"
  mkdir -p "$DEST"

  # Copy files, exclude .git
  rsync -a --exclude='.git' "$SRC"/ "$DEST"/

  cd "$DEST"

  git init >/dev/null
  git branch -M main

  git add .
  git commit -m "🧱 auto split from $NAME" >/dev/null

  # Create repo if missing
  if gh repo view "$ORG/$NEW_REPO" >/dev/null 2>&1; then
    echo "🧱⚠️🧱 REPO EXISTS $NEW_REPO" | tee -a "$LOG"
    git remote add origin "https://github.com/$ORG/$NEW_REPO.git"
  else
    gh repo create "$ORG/$NEW_REPO" --public --source=. --remote=origin >/dev/null
  fi

  git push -u origin main >/dev/null

  echo "🧱🚀🧱 PUSHED $NEW_REPO" | tee -a "$LOG"
done

echo "🧱🏰🧱 AUTO-SPLIT COMPLETE" | tee -a "$LOG"
echo "🧱📜🧱 LOG → $LOG"
