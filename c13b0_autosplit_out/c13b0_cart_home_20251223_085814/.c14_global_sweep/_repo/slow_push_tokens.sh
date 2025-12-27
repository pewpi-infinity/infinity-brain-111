#!/data/data/com.termux/files/usr/bin/bash

# === CONFIG ===
REPO_DIR="/data/data/com.termux/files/home/mongoose.os"
TOKEN_DIR="$REPO_DIR/infinity_tokens"     # CHANGE if your tokens are in a different folder
BRANCH="main"                              # or master
INTERVAL=180                               # 3 minutes

cd "$REPO_DIR" || { echo "Repo not found"; exit 1; }

echo "[∞] Infinity slow-push started"
echo "[∞] Repo: $REPO_DIR"
echo "[∞] Token directory: $TOKEN_DIR"
echo

for file in "$TOKEN_DIR"/*; do
    [ -e "$file" ] || continue

    rel="${file#$REPO_DIR/}"

    if git status --short -- "$rel" | grep -q .; then
        echo "[∞] Adding $rel"
        git add "$rel"

        git commit -m "Token update: $(basename "$rel")" || {
            echo "[!] Commit failed, skipping"; continue;
        }

        echo "[⇡] Pushing $(basename "$rel")"
        git push origin "$BRANCH" || {
            echo "[X] Push failed — stopping"; exit 1;
        }

        echo "[✓] Pushed. Sleeping ${INTERVAL}s..."
        sleep "$INTERVAL"
    else
        echo "[·] $rel has no changes."
    fi
done

echo "[∞] All token files processed."
