#!/data/data/com.termux/files/usr/bin/bash
set -e
mkdir -p ~/InfinityOS/Logs ~/InfinityPortal ~/bin
export PATH="$HOME/bin:$PATH"

# Copy bin scripts to ~/bin
REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$REPO_DIR/bin/pee-kill" ~/bin/
cp "$REPO_DIR/bin/pee-run" ~/bin/
chmod +x ~/bin/pee-kill
chmod +x ~/bin/pee-run

# Copy portal and chat to ~/InfinityPortal
cp "$REPO_DIR/portal.py" ~/InfinityPortal/
cp "$REPO_DIR/chat.py" ~/InfinityPortal/

echo "[∞] Setup complete. Scripts installed to ~/bin and ~/InfinityPortal"
echo "[∞] To start: pee-run"
echo "[∞] To stop: pee-kill"
