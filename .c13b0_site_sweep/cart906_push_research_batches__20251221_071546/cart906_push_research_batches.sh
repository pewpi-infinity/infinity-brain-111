#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "[cart906] Moving into ~/v ..."
cd "$HOME/v"

echo "[cart906] Current branch:"
BRANCH="$(git symbolic-ref --short HEAD 2>/dev/null || echo main)"
echo "  $BRANCH"

echo "[cart906] Verifying batch files exist..."
ls -lh batch_0000*.zip || echo "[cart906] Warning: batch_0000*.zip not all visible"

echo "[cart906] Staging research batches..."
git add batch_00002.zip batch_00003.zip batch_00004.zip 2>/dev/null || true

echo "[cart906] Committing (if there are changes)..."
git commit -m "Add Infinity research batches 00002–00004" || echo "[cart906] Nothing to commit (maybe already committed)."

echo "[cart906] Pushing to origin/$BRANCH ..."
git push origin "$BRANCH"

echo "[cart906] ✅ Done. Batches should now be in the GitHub repo for /v."
