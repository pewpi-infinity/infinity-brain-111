#!/usr/bin/env bash
set -euo pipefail

# ===== Infinity Research Runner (mongoose.os) =====
# Big script: auto-import carts, skip failures, quarantine broken carts, stub replacements, loud logs.

REPO_ROOT="${REPO_ROOT:-$(pwd)}"
CARTS_DIR="${CARTS_DIR:-$REPO_ROOT/carts}"
QUARANTINE_DIR="${QUARANTINE_DIR:-$REPO_ROOT/carts_quarantine}"
CONFIG_DIR="${CONFIG_DIR:-$REPO_ROOT/config}"
TERMS_DIR="${TERMS_DIR:-$REPO_ROOT/terms}"
SITES_DIR="${SITES_DIR:-$REPO_ROOT/websites}"
LOGS_DIR="${LOGS_DIR:-$REPO_ROOT/logs}"
PROV_DIR="${PROV_DIR:-$REPO_ROOT/.provenance}"
ARTIFACTS_DIR="${ARTIFACTS_DIR:-$REPO_ROOT/artifacts}"
IMPORT_SCAN_ROOT="${IMPORT_SCAN_ROOT:-$REPO_ROOT}"

TOKEN_NUMBER="${TOKEN_NUMBER:-1054}"
TOKEN_VALUE="${TOKEN_VALUE:-2593}"
TOKEN_COLOR="${TOKEN_COLOR:-RED}"
TOKEN_DATETIME="${TOKEN_DATETIME:-2025-12-05 22:33:45}"

echo "==[Infinity-OS Research Runner]=="
echo "Repo Root:        $REPO_ROOT"
echo "Carts Directory:  $CARTS_DIR"
echo "Quarantine Dir:   $QUARANTINE_DIR"
echo "Config Directory: $CONFIG_DIR"
echo "Terms Directory:  $TERMS_DIR"
echo "Sites Directory:  $SITES_DIR"
echo "Logs Directory:   $LOGS_DIR"
echo "Provenance Dir:   $PROV_DIR"
echo "Artifacts Dir:    $ARTIFACTS_DIR"
echo "Import Scan Root: $IMPORT_SCAN_ROOT"
echo "Token: Number=$TOKEN_NUMBER Value=$TOKEN_VALUE Color=$TOKEN_COLOR DateTime=$TOKEN_DATETIME"
echo "================================================="

# Ensure directories exist
mkdir -p "$LOGS_DIR" "$PROV_DIR" "$ARTIFACTS_DIR" "$CONFIG_DIR" "$CARTS_DIR" "$QUARANTINE_DIR"

# Git lock cleanup (non-fatal)
if [ -f "$REPO_ROOT/.git/index.lock" ]; then
  echo "[CLEAN] Removing stale git index.lock"
  rm -f "$REPO_ROOT/.git/index.lock" || true
fi

# Auto-import carts from repo into carts/
echo "[IMPORT] Scanning for .js/.py carts under $IMPORT_SCAN_ROOT"
find "$IMPORT_SCAN_ROOT" -type f \( -name '*.js' -o -name '*.py' \) \
  ! -path "$CARTS_DIR/*" \
  ! -path "$QUARANTINE_DIR/*" \
  -exec bash -c 'src="$1"; base=$(basename "$src"); dst="'$CARTS_DIR'/$base"; cp -f "$src" "$dst"; echo "[IMPORTED] $src -> $dst"' _ {} \;

# Print inventory
echo "-- Inventory --"
JS_COUNT=$(find "$CARTS_DIR" -maxdepth 1 -type f -name '*.js' | wc -l | tr -d ' ')
PY_COUNT=$(find "$CARTS_DIR" -maxdepth 1 -type f -name '*.py' | wc -l | tr -d ' ')
echo "JS carts:   $JS_COUNT"
echo "Py carts:   $PY_COUNT"
echo "----------------"

# Create default config
cat > "$CONFIG_DIR/default.json" <<JSON
{
  "repoRoot": "$REPO_ROOT",
  "dirs": {
    "carts": "$CARTS_DIR",
    "terms": "$TERMS_DIR",
    "sites": "$SITES_DIR",
    "logs": "$LOGS_DIR",
    "provenance": "$PROV_DIR",
    "artifacts": "$ARTIFACTS_DIR",
    "quarantine": "$QUARANTINE_DIR"
  },
  "token": {
    "number": "$TOKEN_NUMBER",
    "value": "$TOKEN_VALUE",
    "color": "$TOKEN_COLOR",
    "datetime": "$TOKEN_DATETIME"
  },
  "execution": {
    "failFast": false,
    "maxConcurrency": 1,
    "env": {},
    "skipOnError": true,
    "autoQuarantine": true,
    "autoStubOnQuarantine": true
  }
}
JSON
echo "[INIT] Wrote $CONFIG_DIR/default.json"

# Node check
if ! command -v node >/dev/null 2>&1; then
  echo "[ERROR] Node.js is required. Please install Node >= 18."
  exit 1
fi

echo "[RUN] Launching runner.js ..."
node "$REPO_ROOT/runner.js" --config "$CONFIG_DIR/default.json"

status=$?
if [ "$status" -eq 0 ]; then
  echo "[DONE] Research completed."
  echo "Artifact: $ARTIFACTS_DIR/research.md"
else
  echo "[FAIL] Runner exited with status $status"
fi
