#!/usr/bin/env bash
set -u

HOME_DIR="$HOME"
LOG_DIR="$HOME_DIR/.infinity_logs"
PID_DIR="$HOME_DIR/.infinity_pids"
mkdir -p "$LOG_DIR" "$PID_DIR"

start_bg () {
  local name="$1"; shift
  local cmd="$*"
  local pidfile="$PID_DIR/$name.pid"
  local logfile="$LOG_DIR/$name.log"

  if [ -f "$pidfile" ] && kill -0 "$(cat "$pidfile")" 2>/dev/null; then
    echo "[∞] $name already running (pid $(cat "$pidfile"))"
    return 0
  fi

  echo "[∞] starting $name..."
  nohup bash -lc "$cmd" >> "$logfile" 2>&1 &
  echo $! > "$pidfile"
  echo "[∞] $name started (pid $!)"
}

echo "[∞] Restarting Infinity stack..."

# 1) Continuous repo mover (hardened)
if [ -f "$HOME_DIR/cart_infinity_forever.sh" ]; then
  start_bg "repo_forever" "$HOME_DIR/cart_infinity_forever.sh"
else
  echo "[!] Missing: ~/cart_infinity_forever.sh (install it, then rerun this cart)"
fi

# 2) Research stream (optional - only if you have it)
if [ -f "$HOME_DIR/infinity-scripts/stream.py" ]; then
  start_bg "research_stream" "cd $HOME_DIR/infinity-scripts && python3 stream.py"
fi

# 3) Token stream (optional - look for common names)
if [ -f "$HOME_DIR/infinity_mongoose_bitcoin_research_miner/token_stream.py" ]; then
  start_bg "token_stream" "cd $HOME_DIR/infinity_mongoose_bitcoin_research_miner && python3 token_stream.py"
fi

# 4) Dashboard (Termux dials)
start_bg "dashboard" "python3 $HOME_DIR/cart_infinity_dashboard.py"

echo
echo "[∞] Stack status:"
for p in "$PID_DIR"/*.pid 2>/dev/null; do
  name="$(basename "$p" .pid)"
  pid="$(cat "$p" 2>/dev/null || true)"
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    echo "  ✓ $name (pid $pid)"
  else
    echo "  ✗ $name (stopped)"
  fi
done

echo
echo "[∞] Logs: $LOG_DIR"
echo "[∞] To watch dashboard log: tail -f $LOG_DIR/dashboard.log"
