#!/data/data/com.termux/files/usr/bin/bash
#
# c13b0 — TOKEN PRICER
# Evaluate research → set Buy It Now price → push
#

set -e

BASE="$HOME/.c13b0_matrix"
OWNER="pewpi-infinity"
PAYPAL_EMAIL="watsonkris611@gmail.com"

# pricing constants (adjust later if desired)
BASE_PRICE=3.00          # USD
PER_100_WORDS=0.50       # USD
PAIR_MULTIPLIER=1.25     # A+B research premium
SIGNAL_BONUS=1.00        # BTC signal present
COLOR_SECTION_BONUS=0.50 # per color section found
MAX_PRICE=49.00

for DIR in "$BASE"/*; do
  [ -d "$DIR" ] || continue
  cd "$DIR"

  REPO="$(basename "$DIR")"
  README="README.md"
  INDEX="index.html"
  TOKEN="TOKEN.md"

  [ -f "$README" ] || continue

  # --- metrics ---
  WORDS=$(wc -w < "$README")
  WORD_BONUS=$(echo "scale=2; ($WORDS/100)*$PER_100_WORDS" | bc)

  PAIR=0
  echo "$REPO" | grep -q "_" && PAIR=1

  SIGNAL=0
  grep -qi "Bitcoin Network Signals" "$README" && SIGNAL=1

  COLOR_COUNT=$(grep -Eo "🟩|🟧|🟦|🟥|🟪|🟨|🩷" "$README" | wc -l)
  COLOR_BONUS=$(echo "scale=2; $COLOR_COUNT*$COLOR_SECTION_BONUS" | bc)

  PRICE=$(echo "scale=2; $BASE_PRICE + $WORD_BONUS + $COLOR_BONUS" | bc)

  [ "$SIGNAL" -eq 1 ] && PRICE=$(echo "scale=2; $PRICE + $SIGNAL_BONUS" | bc)
  [ "$PAIR" -eq 1 ] && PRICE=$(echo "scale=2; $PRICE * $PAIR_MULTIPLIER" | bc)

  # clamp price
  GT=$(echo "$PRICE > $MAX_PRICE" | bc)
  [ "$GT" -eq 1 ] && PRICE="$MAX_PRICE"

  PRICE=$(printf "%.2f" "$PRICE")

  # --- update TOKEN.md ---
  if [ -f "$TOKEN" ]; then
    sed -i "/## 🧱🧱🧱 Value/,+4d" "$TOKEN"
  fi

cat <<MD >> "$TOKEN"
## 🧱🧱🧱 Value
USD \$${PRICE}

**Pricing basis**
- Words: $WORDS
- Color sections: $COLOR_COUNT
- Pair research: $PAIR
- Bitcoin signals: $SIGNAL

Priced by c13b0 deterministic research valuation.
MD

  # --- update index.html PayPal amount ---
  if [ -f "$INDEX" ]; then
    sed -i "s/name=\"amount\" value=\"[^\"]*\"/name=\"amount\" value=\"$PRICE\"/" "$INDEX"
  fi

  git add "$TOKEN" "$INDEX"
  git commit -m "c13b0 pricing: set Buy It Now \$${PRICE}" >/dev/null 2>&1 || true
  git push origin main --force >/dev/null 2>&1

  echo "💰 PRICED → $REPO at \$${PRICE}"
done
