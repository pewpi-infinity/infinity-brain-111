#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱📍🧱 C13B0 MINIMAL PUSH — START"

# 1) Ensure we are in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "❌ Not inside a git repository."
  exit 1
fi

# 2) Clear index ONLY (no file deletion)
git reset --mixed >/dev/null

# 3) Stash tracked + untracked ONCE (no ignore scan)
git stash push -u -m "c13b0_hold" >/dev/null || true

# 4) Pull remote history cleanly
git pull --rebase origin main

# 5) Push local branch
git push --set-upstream origin main

# 6) Restore files
git stash pop >/dev/null || true

echo "🧱📍🧱 C13B0 MINIMAL PUSH — DONE"
