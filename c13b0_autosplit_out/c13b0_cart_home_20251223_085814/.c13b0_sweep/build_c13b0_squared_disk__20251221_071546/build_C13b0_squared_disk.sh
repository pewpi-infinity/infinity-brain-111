#!/data/data/com.termux/files/usr/bin/bash
set -e

DISK="$HOME/C13b0_squared_disk"
BIN="$DISK/bin"
DOC="$DISK/docs"
STATE="$DISK/state"

mkdir -p "$BIN" "$DOC" "$STATE"

# ---------------- README ----------------
cat > "$DOC/README.md" <<'R'
# C13b0² — Cartridge Spine System

This is a self-contained software disk.

Run:
  ./bin/C13b0_squared.cartridge

Behavior:
- Auto-detects all git repos under ~/pewpi-infinity
- chmod +x carts
- runs carts
- commits + pushes every run
- no login prompts
- replayable like a cartridge

This folder is the software.
R

# ---------------- MANIFEST ----------------
cat > "$DISK/MANIFEST.txt" <<'M'
C13b0² Software Disk
Version: 2.0
Type: Cartridge-based spine
Autorun: bin/C13b0_squared.cartridge
Root: ~/pewpi-infinity
M

# ---------------- CARTRIDGE ----------------
cat > "$BIN/C13b0_squared.cartridge" <<'C13EOF'
#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

ORG_ROOT="$HOME/pewpi-infinity"
LOG="$ORG_ROOT/.c13b0_logs"
STATE="$ORG_ROOT/.c13b0_state"
DATE="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

mkdir -p "$LOG" "$STATE"

pkg install -y git coreutils findutils >/dev/null 2>&1 || true

echo "∞ C13b0² BOOT [$DATE]"
echo "ROOT: $ORG_ROOT"
echo "----------------------------------"

[[ -d "$ORG_ROOT" ]] || { echo "[ERR] pewpi-infinity not found"; exit 1; }

INDEX="$STATE/spine.index"
> "$INDEX"

if [[ -d "$ORG_ROOT/.git" ]]; then
  echo "." >> "$INDEX"
fi

find "$ORG_ROOT" -type d -name ".git" 2>/dev/null | while read -r g; do
  d="$(dirname "$g")"
  r="${d#$ORG_ROOT/}"
  [[ "$r" != "$d" ]] && echo "$r" >> "$INDEX"
done

sort -u "$INDEX" -o "$INDEX"
[[ -s "$INDEX" ]] || { echo "[ERR] No git repos found"; exit 1; }

while read -r REL; do
  [[ "$REL" == "." ]] && REPO="$ORG_ROOT" || REPO="$ORG_ROOT/$REL"
  NAME="$(basename "$REPO")"

  echo
  echo "▶ $NAME"
  cd "$REPO"

  rm -f .git/index.lock 2>/dev/null || true
  find . -type f \( -name "cart*.sh" -o -name "cart*.py" \) -exec chmod +x {} \; 2>/dev/null || true

  for c in $(find . -type f -name "cart*.sh" | sort); do
    "$c" >> "$LOG/$NAME.log" 2>&1 || true
  done

  git add -A
  if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    git commit -m "∞ C13b0² initial [$DATE]" >/dev/null 2>&1 || true
  elif [[ -n "$(git status --porcelain)" ]]; then
    git commit -m "∞ C13b0² update [$DATE]" >/dev/null 2>&1 || true
  fi

  git push origin HEAD >/dev/null 2>&1 || true
done < "$INDEX"

echo
echo "∞ C13b0² COMPLETE"
C13EOF

chmod +x "$BIN/C13b0_squared.cartridge"

# ---------------- INSTALLER ----------------
cat > "$DISK/install.sh" <<'I'
#!/data/data/com.termux/files/usr/bin/bash
set -e
chmod +x ./bin/C13b0_squared.cartridge
echo "Installed. Run: ./bin/C13b0_squared.cartridge"
I
chmod +x "$DISK/install.sh"

echo
echo "✅ C13b0² SOFTWARE DISK BUILT AT:"
echo "   $DISK"
echo
echo "To run:"
echo "  cd $DISK"
echo "  ./bin/C13b0_squared.cartridge"
