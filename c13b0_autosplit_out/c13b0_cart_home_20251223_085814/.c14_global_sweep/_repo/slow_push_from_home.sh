#!/data/data/com.termux/files/usr/bin/bash

REPO_DIR="/data/data/com.termux/files/home/mongoose.os"
DEST_DIR="$REPO_DIR/infinity_tokens"
SOURCE_DIR="/data/data/com.termux/files/home"
BRANCH="main"
INTERVAL=180

cd "$REPO_DIR" || { echo "Repo not found"; exit 1; }

echo "[∞] HOME slow-push online"
echo "[∞] Repo: $REPO_DIR"
echo "[∞] Source: $SOURCE_DIR"
echo "[∞] Destination: $DEST_DIR"
echo

while true; do
    # Grab ONLY text files sitting directly in home folder
    file=$(find "$SOURCE_DIR" -maxdepth 1 -type f -name "*.txt" \
        ! -path "$REPO_DIR/*" | head -n 1)

    if [ -z "$file" ]; then
        echo "[∞] No more home .txt tokens to push."
        exit 0
    fi

    base=$(basename "$file")
    dest="$DEST_DIR/$base"

    echo "[∞] Moving $base → repo"
    mv "$file" "$dest" || { echo "[X] Move failed"; exit 1; }

    git add "$dest"
    git commit -m "Token push: $base" || { echo "[!] Commit failed"; continue; }

    echo "[⇡] Pushing $base …"
    if git push origin "$BRANCH"; then
        echo "[✓] Pushed $base — sleeping ${INTERVAL}s"
        sleep "$INTERVAL"
    else
        echo "[X] Push failed. $base is in repo so you don’t lose it."
        exit 1
    fi
done
