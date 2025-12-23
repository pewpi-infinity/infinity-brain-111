#!/data/data/com.termux/files/usr/bin/bash

# --- CONFIG ---
REPO_DIR="/data/data/com.termux/files/home/mongoose.os"  
SOURCE_DIR="/data/data/com.termux/files/home/PUT_YOUR_FOLDER_HERE"  # <— Replace this
BRANCH="main"
INTERVAL=180  # 3 minutes

cd "$REPO_DIR" || { echo "Repo not found"; exit 1; }

echo "[∞] Slow-push engine online"
echo "[∞] Repo: $REPO_DIR"
echo "[∞] Source: $SOURCE_DIR"
echo

while true; do
    # Get the FIRST file waiting to be pushed
    file=$(find "$SOURCE_DIR" -type f -maxdepth 1 | head -n 1)

    if [ -z "$file" ]; then
        echo "[∞] No more files to push. Done."
        exit 0
    fi

    base=$(basename "$file")
    dest="$REPO_DIR/infinity_tokens/$base"

    echo "[∞] Preparing $base …"

    # Move into repo
    mv "$file" "$dest" || { echo "[X] Move failed"; exit 1; }

    # Add / commit
    git add "$dest"
    git commit -m "Token push: $base" || { echo "[!] Commit failed"; continue; }

    # Push
    echo "[⇡] Pushing $base …"
    if git push origin "$BRANCH"; then
        echo "[✓] Pushed $base. Sleeping ${INTERVAL}s…"
        sleep "$INTERVAL"
    else
        echo "[X] Push failed — leaving $base in repo so you don't lose it."
        exit 1
    fi

done
