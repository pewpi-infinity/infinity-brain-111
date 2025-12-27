#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱📍🧱 C13B0 ABSOLUTE PUSH — START"

# must be in a git repo
git rev-parse --is-inside-work-tree >/dev/null

# stage EVERYTHING, including ignored files
git add -A -f

# commit if there is anything to commit
git diff --cached --quiet || git commit -m "C13B0 absolute push $(date -u +%Y%m%dT%H%M%SZ)"

# align with remote (no editor, no merge commits)
git pull --rebase origin main

# push and bind upstream if needed
git push --set-upstream origin main

echo "🧱📍🧱 C13B0 ABSOLUTE PUSH — DONE"
