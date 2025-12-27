#!/data/data/com.termux/files/usr/bin/bash
set -e

# =========================================================
# c13b0 RECOVERY + TOKEN SWEEP (DISK SAFE)
# FREES SPACE • BATCH MODE • AUTO RUN
# =========================================================

OWNER="pewpi-infinity"
WORK="$HOME/.c13b0_global_sweep"
BATCH_SIZE=10          # <-- critical: prevents disk exhaustion
mkdir -p "$WORK"
cd "$WORK"

now(){ date -u +%Y-%m-%dT%H:%M:%SZ; }
now_human(){ date "+%Y-%m-%d %H:%M:%S"; }

echo "== c13b0 RECOVERY START $(now) =="

# ---------------------------------------------------------
# CLEAN STALE LOCKS + CACHE (SAFE)
# ---------------------------------------------------------
find "$WORK" -name "*.lock" -type f -delete 2>/dev/null || true

# Remove old cloned repos but KEEP list
find "$WORK" -maxdepth 1 -mindepth 1 -type d ! -name ".git" -exec rm -rf {} + 2>/dev/null || true

echo "Cache cleaned."

# ---------------------------------------------------------
# FETCH REPO LIST (OLDEST FIRST)
# ---------------------------------------------------------
gh repo list "$OWNER" \
  --limit 500 \
  --json name,createdAt \
  --jq 'sort_by(.createdAt)[] | .name' > repos.txt

COUNT=0
TOKEN_NUMBER=100

# ---------------------------------------------------------
# BATCH TOKEN SWEEP
# ---------------------------------------------------------
while read -r REPO; do
  [ -z "$REPO" ] && continue
  COUNT=$((COUNT+1))
  [ "$COUNT" -gt "$BATCH_SIZE" ] && break

  echo
  echo "---- TOKEN BATCH: $REPO ----"

  git clone "https://github.com/$OWNER/$REPO.git" "$WORK/$REPO" || continue
  cd "$WORK/$REPO"

  rm -f .git/*.lock 2>/dev/null || true
  mkdir -p token

  TOKEN_FILE="token/TOKEN.md"

  grep -q "Token Number:" "$TOKEN_FILE" 2>/dev/null && {
    echo "Token already enriched."
    cd "$WORK"
    continue
  }

  TOKEN_NUMBER=$((TOKEN_NUMBER+1))
  VALUE="$((TOKEN_NUMBER % 50 + 10))"
  STAR_EXPIRE="$(date -d '+30 days' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date '+%Y-%m-%d %H:%M:%S')"

cat <<MD >> "$TOKEN_FILE"

---
## C13B0 Mario World Token

Token Number: $TOKEN_NUMBER
Token Value: $VALUE
Token Type: STAR MUSHROOM BRICK
Token DateTime: $(now_human)

Star Power:
- Activated: $(now_human)
- Expires: $STAR_EXPIRE
- Status: ACTIVE

Accumulation:
This token has merged 2 auxiliary research tokens.

Mario World Mapping:
- Bricks: structure
- Mushroom: growth
- Star: acceleration
- Flag: milestone

MD

  git add token/TOKEN.md
  git commit -m "c13b0 token enrichment (batch)" || true
  git push || true

  cd "$WORK"

done < repos.txt

echo
echo "== c13b0 RECOVERY BATCH COMPLETE $(now) =="
echo "Processed $COUNT repos safely."
