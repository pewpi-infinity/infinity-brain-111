#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

PORTAL_DIR="$HOME/infinity_portal"
MODULES_DIR="$HOME/infinity_modules"
VENV_DIR="$PORTAL_DIR/venv"
LOGDIR="$PORTAL_DIR/logs"
APP_MAIN="$PORTAL_DIR/app.py"
REQUIREMENTS="$PORTAL_DIR/requirements.txt"

mkdir -p "$MODULES_DIR" "$PORTAL_DIR" "$LOGDIR"

echo "1) Copying modules (if any) from $MODULES_DIR -> $PORTAL_DIR"
cp -r "$MODULES_DIR"/* "$PORTAL_DIR"/ 2>/dev/null || true

# create venv if missing
if [ ! -d "$VENV_DIR" ]; then
  echo "2) Creating Python venv..."
  python3 -m venv "$VENV_DIR"
fi

echo "3) Activating venv..."
# shellcheck disable=SC1090
source "$VENV_DIR/bin/activate"

echo "4) Upgrading pip/setuptools/wheel inside venv (safe)..."
python -m pip install --upgrade pip setuptools wheel

echo "5) Installing lightweight core packages (to avoid heavy builds)..."
pip install --upgrade flask gunicorn requests itsdangerous jinja2 markupsafe werkzeug click || true

# install openai client without bringing in heavy deps
if ! python -c "import openai" 2>/dev/null; then
  echo "6) Installing openai client (no deps to avoid pulling large packages)..."
  pip install --no-deps openai || true
fi

# If a requirements.txt exists, try prefer-binary (reduces source builds)
if [ -f "$REQUIREMENTS" ]; then
  echo "7) requirements.txt found — attempting binary-friendly install (may still skip heavy builds)"
  pip install --prefer-binary -r "$REQUIREMENTS" || echo "requirements install had issues; continuing."
fi

echo "8) Creating simple control scripts (pee-kill, pee-run) inside $PORTAL_DIR"
cat > "$PORTAL_DIR/pee-kill" <<PK
#!/bin/sh
# stop any running portal process using app.py
pkill -f "python3 .*app.py" || true
PK
chmod +x "$PORTAL_DIR/pee-kill"

cat > "$PORTAL_DIR/pee-run" <<PR
#!/bin/sh
# start the portal main app in background; logs -> portal_nohup.log
nohup python3 "$APP_MAIN" &>"$LOGDIR/portal_nohup.log" &
disown
PR
chmod +x "$PORTAL_DIR/pee-run"

# warn if app.py missing
if [ ! -f "$APP_MAIN" ]; then
  echo "WARNING: $APP_MAIN not found. Create your app.py in $PORTAL_DIR (or update APP_MAIN inside the script)."
fi

echo "9) Restarting portal (using pee-kill / pee-run if present)..."
if [ -x "$PORTAL_DIR/pee-kill" ] && [ -x "$PORTAL_DIR/pee-run" ]; then
  "$PORTAL_DIR/pee-kill"
  sleep 1
  "$PORTAL_DIR/pee-run"
else
  pkill -f "$APP_MAIN" || true
  nohup python3 "$APP_MAIN" &>"$LOGDIR/portal_nohup.log" &
fi

echo "Deploy finished. Tail logs with: tail -n 200 $LOGDIR/portal_nohup.log"

# create delta inject helper: zip modules and POST to /inject
cat > "$PORTAL_DIR/delta_inject.sh" <<DEL
#!/bin/sh
MODULES_DIR="\$HOME/infinity_modules"
ZIPFILE="/tmp/delta_modules.zip"
INJECT_URL="http://127.0.0.1:8080/inject"

cd "\$MODULES_DIR" || { echo "modules dir missing: \$MODULES_DIR"; exit 1; }
rm -f "\$ZIPFILE"
zip -r "\$ZIPFILE" . || { echo "zip failed"; exit 1; }
echo "Posting \$ZIPFILE to \$INJECT_URL"
curl -F "file=@\$ZIPFILE" "\$INJECT_URL" -sS --fail || { echo "inject post failed"; exit 1; }
echo "Posted OK"
DEL
chmod +x "$PORTAL_DIR/delta_inject.sh"

echo
echo "ALL DONE."
echo " - Deploy log: $LOGDIR/portal_nohup.log"
echo " - To upload current modules to /inject endpoint run: sh $PORTAL_DIR/delta_inject.sh"
