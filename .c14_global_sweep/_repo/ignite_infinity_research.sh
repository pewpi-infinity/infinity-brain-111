#!/usr/bin/env bash

###############################################################################
# ∞ IGNITION SCRIPT — Infinity Research Engine
# This turns on every cart, scraper, writer, token generator, and auto-pusher.
# No deletions. No resets. Only forward movement + new research output.
###############################################################################

echo ""
echo "==============================================================="
echo "      ∞  Infinity OS — Research Ignition Engine Started"
echo "==============================================================="
echo ""

REPO="$HOME/mongoose.os"

cd "$REPO" || exit 1

echo "[💜] LOADING carts…"
RUN_CARTS=(
    "cart101_physics_research.py"
    "cart102_ai_research.py"
    "cart103_energy_research.py"
    "cart104_academic_research.py"
    "cart105_materials_research.py"
    "cart_scrape_hydrogen_sources.py"
    "cart900_infinity_research_rig.py"
    "cart901_autopush_research_rig.py"
)

echo "[💙] Running main scrapers…"
python3 cart_scrape_hydrogen_sources.py

echo "[💚] Loading additional carts…"
for cart in "${RUN_CARTS[@]}"; do
    if [ -f "$cart" ]; then
        echo "   → Running $cart"
        python3 "$cart"
    else
        echo "   [SKIP] Missing: $cart"
    fi
done

echo "[💛] Running primary Infinity Writers…"
WRITERS=(
    "infinity_research.py"
    "infinity_research_fulltext.py"
    "infinity_hydra_writer.py"
)

for writer in "${WRITERS[@]}"; do
    if [ -f "$writer" ]; then
        echo "   → Writing research via $writer"
        python3 "$writer"
    else
        echo "   [SKIP] Missing: $writer"
    fi
done

echo ""
echo "[💜] Staging all new research outputs…"
git add -A

echo ""
echo "[💜] Committing…"
git commit -m "∞ Ignition run — Research generation $(date '+%Y-%m-%d %H:%M')" || echo "[⚠️] No changes to commit."

echo ""
echo "[💜] Pushing to GitHub…"
git push origin main || git push origin master

echo ""
echo "==============================================================="
echo "          ∞  Infinity Research Ignition Complete"
echo "==============================================================="
echo ""
