#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "[∞] PUSH-ALL cart starting"
echo "[∞] Repo: $(pwd)"
echo

# Safety check
if [ ! -d .git ]; then
  echo "[✗] Not a git repository"
  exit 1
fi

# Doctor first
if [ -x ./cart_doctor.sh ]; then
  ./cart_doctor.sh
else
  echo "[!] cart_doctor.sh missing or not executable"
fi

echo
echo "[∞] Git status BEFORE:"
git status --short
echo

echo "[∞] Staging everything"
git add .
echo

echo "[∞] Git status AFTER add:"
git status --short
echo

# Commit only if needed
if git diff --cached --quiet; then
  echo "[∞] Nothing new to commit"
else
  MSG="[∞] Infinity auto-push $(date '+%Y-%m-%d %H:%M:%S')"
  git commit -m "$MSG"
fi

echo
echo "[∞] Pulling (rebase)"
git pull --rebase || {
  echo "[!] Rebase failed — resolve manually"
  exit 1
}

echo
echo "[∞] Pushing"
git push

echo
echo "[✓] PUSH-ALL complete"
