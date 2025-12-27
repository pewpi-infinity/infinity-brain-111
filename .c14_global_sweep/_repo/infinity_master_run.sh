#!/usr/bin/env bash
set -e

echo ""
echo "∞ INFINITY MASTER ENGINE – FULL SYSTEM RUN 2.0"
echo "------------------------------------------------"
echo "Started at: $(date)"
echo ""

LOG_DIR="logs"
mkdir -p "$LOG_DIR"

MASTER_LOG="$LOG_DIR/infinity_master_$(date '+%Y%m%d_%H%M%S').log"
touch "$MASTER_LOG"

log() {
    echo -e "$1" | tee -a "$MASTER_LOG"
}

log "∞ Logging to: $MASTER_LOG"
log ""

################################################################################
# SECTION 1: RUN CORE CARTS (000–041)
################################################################################

log "∞ SECTION 1: Core Carts (cart000–cart041)"

CORE_CARTS=(
cart000_orchestrator.py
cart000_run_all.py
cart001A_infinity_runcommands.py
cart002_engineering.py
cart003_computers.py
cart004_nuances.py
cart005_code.py
cart006_python.py
cart007_tokens.py
cart008_government.py
cart009_power.py
cart010_components.py
cart011_speakeasy.py
cart012_solutes.py
cart013_mercury_aluminum_growth.py
cart014_mercury_vapor_power.py
cart015_compression_hydrogen_engine.py
cart016_hot_cold_TEG.py
cart017_spiderweb_engine.py
cart018_zip_hashing.py
cart019_token_generation.py
cart020_unzip_install_strategy.py
cart021_token_tiers.py
cart022_bank_grade_tokens.py
cart023_idea_merger.py
cart024_quantum_transport.py
cart025_ai_watcher_login.py
cart026_aluminum_oxide_devices.py
cart027_robotics.py
cart028_machines.py
cart029_crystal_truths.py
cart030_superchemistry_fireproof.py
cart031_exoskeleton.py
cart032_ecosystem.py
cart033_nature.py
cart034_drones.py
cart035_signal_trace.py
cart036_rf_generation.py
cart037_mice_brainmapping.py
cart038_genetics.py
cart039_dna_engine.py
cart040_gas_shell_code.py
cart041_hydrogen_expansion.py
)

for cart in "${CORE_CARTS[@]}"; do
    if [[ -f "$cart" ]]; then
        log "--------------------------------------------"
        log "∞ Running: $cart"
        python3 "$cart" >> "$MASTER_LOG" 2>&1 || log "⚠ Error in $cart (continuing)"
    else
        log "⚠ Missing cart: $cart"
    fi
done

################################################################################
# SECTION 2: RESEARCH SCRAPERS
################################################################################

log ""
log "∞ SECTION 2: Research Scrapers"

SCRAPERS=(
cart101_physics_research.py
cart102_ai_research.py
cart103_energy_research.py
cart104_academic_research.py
cart105_materials_research.py
cart_scrape_hydrogen_sources.py
)

for cart in "${SCRAPERS[@]}"; do
    if [[ -f "$cart" ]]; then
        log "∞ Scraper: $cart"
        python3 "$cart" >> "$MASTER_LOG" 2>&1 || log "⚠ Scraper error: $cart"
    else
        log "⚠ Missing scraper: $cart"
    fi
done

################################################################################
# SECTION 3: WRITERS
################################################################################

log ""
log "∞ SECTION 3: Research Writers"

WRITERS=(
cart_research_writer.py
cart_write_infinity_research.py
cart_research_daemon.py
)

for writer in "${WRITERS[@]}"; do
    if [[ -f "$writer" ]]; then
        log "∞ Writer: $writer"
        python3 "$writer" >> "$MASTER_LOG" 2>&1 || log "⚠ Writer error: $writer"
    else
        log "⚠ Missing writer: $writer"
    fi
done

################################################################################
# SECTION 4: RIGS
################################################################################

log ""
log "∞ SECTION 4: Infinity Research Rigs"

RIGS=(
cart900_infinity_research_rig.py
cart901_autopush_research_rig.py
)

for rig in "${RIGS[@]}"; do
    if [[ -f "$rig" ]]; then
        log "∞ Rig: $rig"
        python3 "$rig" >> "$MASTER_LOG" 2>&1 || log "⚠ Rig error: $rig"
    else
        log "⚠ Missing rig: $rig"
    fi
done

################################################################################
# FINAL STEP – PUSH
################################################################################

log ""
log "∞ FINAL STEP: Pushing to GitHub…"

./commit_gatekeeper.sh | tee -a "$MASTER_LOG"

log ""
log "∞ DONE – Infinity Master Engine Complete."
log "Finished: $(date)"

