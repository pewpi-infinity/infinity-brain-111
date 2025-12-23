#!/data/data/com.termux/files/usr/bin/bash
set -e
PORT=8080
cd ~/InfinityOS/portal

# make sure there's something to show
[ -f index.html ] || printf '<!doctype html><title>Infinity Portal</title><h1 style="font-family:sans-serif">Infinity Portal is up.</h1>' > index.html

# kill any old server on this port
pkill -f "http.server $PORT" 2>/dev/null || true

# start a simple web server and open it
nohup python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
sleep 1
termux-open-url "http://127.0.0.1:$PORT"
echo
echo ">>> Portal is up at http://127.0.0.1:$PORT"
echo ">>> Leave Termux open; to stop it: pkill -f \"http.server $PORT\""
