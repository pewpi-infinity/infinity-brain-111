#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/mongoose.os

echo "[∞] Adding new Infinity Research Papers..."
git add infinity_papers/*.md 2>/dev/null || true

if git diff --cached --quiet; then
    echo "[∞] No new papers to deploy."
    exit 0
fi

COMMIT_MSG="[∞] Deploy Infinity Research Papers $(date -Iseconds)"
echo "[∞] Committing with message: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

echo "[∞] Pushing to origin/main..."
git push origin main

echo "[∞] Deploy complete."
