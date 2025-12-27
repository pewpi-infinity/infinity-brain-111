#!/usr/bin/env bash
# Find unpushed and untracked carts in current repo

set -e

if [ ! -d ".git" ]; then
  echo "[!] Not inside a git repo"
  exit 1
fi

echo
echo "==== [∞] UNTRACKED CART FILES ===="
git status --porcelain | grep '^??' || echo "None"

echo
echo "==== [∞] MODIFIED (NOT COMMITTED) ===="
git status --porcelain | grep '^[ M]' || echo "None"

echo
echo "==== [∞] COMMITS NOT PUSHED ===="
git status -sb | grep '\[ahead' || echo "None"

echo
echo "==== [∞] DONE ===="
