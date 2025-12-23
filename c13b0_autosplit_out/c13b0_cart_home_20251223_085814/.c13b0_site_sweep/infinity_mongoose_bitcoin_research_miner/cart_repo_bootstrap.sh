#!/bin/sh
set -e

# Ensure gh is installed
if ! command -v gh >/dev/null 2>&1; then
  echo "❌ GitHub CLI (gh) not installed"
  echo "Install with: pkg install gh"
  exit 1
fi

# Ensure user is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "🔐 GitHub login required"
  gh auth login
fi

# Get GitHub username safely
GH_USER="$(gh api user --jq .login)"
if [ -z "$GH_USER" ]; then
  echo "❌ Could not determine GitHub username"
  exit 1
fi

echo "📦 Enter new repository name:"
read REPO

if [ -z "$REPO" ]; then
  echo "❌ Repo name cannot be empty"
  exit 1
fi

echo "🚀 Creating repo '$REPO' under user '$GH_USER'"

# Create repo (new syntax, no deprecated flags)
gh repo create "$GH_USER/$REPO" --public || {
  echo "❌ Repo creation failed"
  exit 1
}

# Prepare local folder
mkdir -p "$REPO"
cd "$REPO"

git init
git branch -M main

cat << README > README.md
# $REPO

Created with Infinity visual cart system.

This repository contains a live Bitcoin visualization.
README

git add README.md
git commit -m "Initial commit"

git remote add origin "https://github.com/$GH_USER/$REPO.git"
git push -u origin main

echo "✅ Repo successfully created and pushed"
echo "🌐 https://github.com/$GH_USER/$REPO"
