#!/data/data/com.termux/files/usr/bin/bash

set -e

ORG="pewpi-infinity"
BASE="$HOME/infinity-treasury"
LOG="$BASE/.push.log"

echo "[∞] Unified Repo Builder Starting" | tee $LOG

cd "$BASE"

# Ensure git identity
git config --global user.name "Infinity"
git config --global user.email "watsonKris61@gmail.com"

# Loop through directories
for dir in */ ; do
  NAME="${dir%/}"

  # Skip junk
  [[ "$NAME" == ".git" ]] && continue
  [[ "$NAME" == "__pycache__" ]] && continue

  echo "[∞] Processing $NAME" | tee -a $LOG

  cd "$BASE/$NAME"

  # Init git if needed
  if [ ! -d ".git" ]; then
    git init
    git branch -M main
  fi

  # Create repo if missing
  if ! gh repo view "$ORG/$NAME" >/dev/null 2>&1; then
    echo "[∞] Creating repo $ORG/$NAME" | tee -a $LOG
    gh repo create "$ORG/$NAME" --public --confirm
  fi

  # Add remote if missing
  if ! git remote | grep -q origin; then
    git remote add origin "https://github.com/$ORG/$NAME.git"
  fi

  # Commit if changes exist
  git add .
  if git diff --cached --quiet; then
    echo "[∞] No changes in $NAME" | tee -a $LOG
  else
    git commit -m "∞ Unified push $(date)"
    git push -u origin main
    echo "[∞] Pushed $NAME" | tee -a $LOG
  fi

  cd "$BASE"
done

echo "[∞] Unified push complete" | tee -a $LOG
