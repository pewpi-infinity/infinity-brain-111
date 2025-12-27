#!/usr/bin/env bash
# Injects evolving knowledge into each repo

INDEX="$HOME/INFINITY_REPO_INDEX.md"

while read -r LINE; do
  [[ "$LINE" != -* ]] && continue
  REPO="${LINE#- }"
  PATH="$HOME/$REPO"

  [ ! -d "$PATH/.git" ] && continue

  FILE="$PATH/INFINITY_KNOWLEDGE.md"
  echo "## Knowledge Pulse $(date -u)" >> "$FILE"
  echo "- Repo: $REPO" >> "$FILE"
  echo "- Connected to Infinity system" >> "$FILE"
  echo "- Last sync reinforces shared ontology" >> "$FILE"
  echo >> "$FILE"

done < "$INDEX"

echo "[∞] Knowledge injected into repos"
