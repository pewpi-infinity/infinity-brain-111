#!/data/data/com.termux/files/usr/bin/bash

REPO="$HOME/mongoose.os"
SCRIPT="cart102_termux_research_writer.py"
LOGDIR="$REPO/logs"
mkdir -p "$LOGDIR"

cd "$REPO"

echo "[∞] Infinity Research Loop — ONLINE"
echo "[∞] Logging to $LOGDIR/runloop.log"

while true; do
    echo "[∞] Cycle $(date -Iseconds)" >> "$LOGDIR/runloop.log"

    # Skip if git is locked
    if [ -f ".git/index.lock" ]; then
        echo "[∞] Git locked — skipping run" >> "$LOGDIR/runloop.log"
        sleep 15
        continue
    fi

    # Run the research writer
    python3 "$SCRIPT" >> "$LOGDIR/runloop.log" 2>&1

    # Add new files
    git add . >> "$LOGDIR/runloop.log" 2>&1
    git commit -m "[∞] AutoPush: $(date -Iseconds)" \
        >> "$LOGDIR/runloop.log" 2>&1

    # Push (skip errors)
    git pull --rebase >> "$LOGDIR/runloop.log" 2>&1
    git push origin main >> "$LOGDIR/runloop.log" 2>&1

    # Delay between cycles (edit to your speed)
    sleep 45
done
