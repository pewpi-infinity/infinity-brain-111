#!/usr/bin/env bash
# Commits and pushes all Infinity repos

INDEX="$HOME/INFINITY_REPO_INDEX.md"

while read -r LINE; do
  [[ "$LINE" != -* ]] && continue
  REPO="${LINE#- }"
  PATH="$HOME/$REPO"

  [ ! -d "$PATH/.git" ] && continue

  cd "$PATH" || continue
  git add -A

  git commit --allow-empty -m "∞ system knowledge sync $(date -u)" >/dev/null 2>&1
  git push origin main >/dev/null 2>&1

  echo "[∞] Pushed $REPO"
done < "$INDEX"
