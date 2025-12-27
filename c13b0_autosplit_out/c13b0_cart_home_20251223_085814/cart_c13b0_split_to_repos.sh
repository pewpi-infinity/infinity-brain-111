#!/data/data/com.termux/files/usr/bin/bash
set -e

SRC="$HOME/c13b0_items"
LOG="$HOME/.c13b0_logs/split_$(date +%s).log"

mkdir -p "$HOME/.c13b0_logs"
echo "🧱🧠🧱 SPLIT TO REPOS START" | tee "$LOG"

for ITEM in "$SRC"/*; do
  [ -d "$ITEM" ] || continue
  NAME="$(basename "$ITEM")"
  REPO="pewpi-infinity/$NAME"

  echo "🧱📦🧱 ITEM -> $NAME" | tee -a "$LOG"
  cd "$ITEM"

  rm -rf .git
  git init
  git branch -M main

  git add .
  git commit -m "🧱 $NAME initial commit"

  if gh repo view "$REPO" >/dev/null 2>&1; then
    echo "🧱⚠️🧱 REPO EXISTS, SKIP CREATE" | tee -a "$LOG"
  else
    gh repo create "$REPO" --public --source=. --remote=origin
  fi

  git push -u origin main
  echo "🧱🚀🧱 PUSHED $REPO" | tee -a "$LOG"

done

echo "🧱👑🧱 SPLIT COMPLETE" | tee -a "$LOG"
