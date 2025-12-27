#!/bin/bash
echo "CART003 Eternal Research Engine → starting forever"

# Auto-install missing tools if they're not there (Termux friendly)
pkg install -y screen python zip 2>/dev/null || apt update && apt install -y screen python zip 2>/dev/null

while true; do
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] → Launching cart003_research_engine.py"
    python3 cart003_research_engine.py
    EXIT=$?
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] Script ended (code $EXIT) → restarting in 8 seconds..."
    sleep 8
done
