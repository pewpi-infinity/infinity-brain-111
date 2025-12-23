#!/bin/bash
set -e

echo "[∞] Infinity Git Push (Full Stage)"

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[!] Not inside a git repository"
  exit 1
fi

# Optional: governance enforcement if present
if [ -x "./cart_INFINITY_GOVERNANCE_ENFORCER.py" ]; then
  echo "[∞] Running governance enforcement..."
  ./cart_INFINITY_GOVERNANCE_ENFORCER.py || {
    echo "[!] Governance blocked the push"
    exit 1
  }
fi

echo "[∞] Git status BEFORE add:"
git status --short

echo "[∞] Staging EVERYTHING (git add .)"
git add .

echo "[∞] Git status AFTER add:"
git status --short

# If nothing staged, exit clean
if git diff --cached --quiet; then
  echo "[∞] Nothing new to commit"
  exit 0
fi

read -p "[∞] Commit message: " MSG
if [ -z "$MSG" ]; then
  MSG="Infinity update $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
fi

git commit -m "$MSG"

echo "[∞] Pushing to origin..."
git push || {
  echo "[!] Push failed (repo may reject large files)"
  echo "[!] Files remain committed locally"
  exit 1
}

echo "[∞] Push successful"
