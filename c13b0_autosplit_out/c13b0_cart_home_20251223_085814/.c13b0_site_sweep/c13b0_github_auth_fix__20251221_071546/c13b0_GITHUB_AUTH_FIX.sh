#!/data/data/com.termux/files/usr/bin/bash
set -e

echo "🧱🔐🧱 C13b0 GitHub Auth Fix (No Passwords)"

# 1) Force Git to use credential helper (not password)
git config --global --unset-all http.https://github.com/.extraheader 2>/dev/null || true
git config --global credential.helper store

# 2) Normalize GitHub URL usage
git config --global url."https://github.com/".insteadOf git@github.com:
git config --global url."https://github.com/".insteadOf ssh://git@github.com/

# 3) Check gh CLI
if ! command -v gh >/dev/null 2>&1; then
  echo "📦 Installing GitHub CLI..."
  pkg install -y gh
fi

# 4) Force GitHub CLI login (token-based)
echo
echo "➡️ GitHub will open a login flow."
echo "Choose: GitHub.com → HTTPS → Paste token OR browser login"
echo
gh auth login --hostname github.com --git-protocol https || true

# 5) Bind git to gh auth
gh auth setup-git

echo
echo "✅ GitHub auth fixed."
echo "Git will NEVER ask for a password again."
echo
echo "Test:"
echo "  git push"
