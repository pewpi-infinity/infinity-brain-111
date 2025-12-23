#!/data/data/com.termux/files/usr/bin/bash

echo "🔧 [PUSH] Starting Infinity-OS push to mongoose.os…"

REPO="https://github.com/pewpi-infinity/mongoose.os.git"
BRANCH="main"
COMMIT_MSG="🧠 Infinity-OS full bootstrap push — all systems online"

# Step 1: Configure Git
git config --global user.name "Infinity Cart Engine"
git config --global user.email "engine@infinity-os.local"

# Step 2: Initialize repo if needed
if [ ! -d ".git" ]; then
  git init
  git remote add origin $REPO
fi

# Step 3: Add all verified paths
git add site/
git add cart801_terminal_engine.py
git add cart804_feed_generator.py
git add cart805_wallet_engine.py
git add *.json
git add *.md
git add *.txt

# Step 4: Commit with loud message
git commit -m "$COMMIT_MSG"

# Step 5: Push to GitHub
git push origin $BRANCH

echo "✅ [PUSH] Infinity-OS pushed to mongoose.os successfully."
