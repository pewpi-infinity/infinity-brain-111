#!/usr/bin/env bash
set -e

LOCKFILE=".infinity_push_lock"

echo "∞ [GATE] Starting commit/push cycle at $(date)"

# If another push is happening, bail out safely
if [ -f "$LOCKFILE" ]; then
    echo "∞ [GATE] Another push is in progress (lockfile present). Skipping."
    exit 0
fi

touch "$LOCKFILE"

echo "∞ [GATE] Staging all changes (git add -A)…"
git add -A

# Check if anything actually changed
if git diff --cached --quiet; then
    echo "∞ [GATE] No NEW changes to commit."
    echo "∞ [GATE] Still pushing to origin/main so you SEE it work…"
    git push origin main || true
    rm -f "$LOCKFILE"
    echo "∞ [GATE] Done (no new commit, push attempted)."
    exit 0
fi

COMMIT_MSG="∞ Infinity sync $(date '+%Y-%m-%d %H:%M:%S')"
echo "∞ [GATE] Committing with message:"
echo "          $COMMIT_MSG"

git commit -m "$COMMIT_MSG"

echo "∞ [GATE] Pushing to origin/main…"
git push origin main

rm -f "$LOCKFILE"
echo "∞ [GATE] ✅ Done. Repo synced clean."
