#!/usr/bin/env bash
set -euo pipefail

# Infinity — live colored research text + continuous GitHub pushes (no JSON)

REMOTE="origin"
BRANCH="main"
CART="CART_INFINITY_LIVE"
OUTDIR="research"
LOGDIR="logs"
mkdir -p "${OUTDIR}" "${LOGDIR}"

# Colors
RESET="\033[0m"
RED="\033[31m"; BLUE="\033[34m"; YELLOW="\033[33m"; GREEN="\033[32m"; PURPLE="\033[35m"
COLORS=("$RED" "$BLUE" "$YELLOW" "$GREEN" "$PURPLE")

# Inputs
TERMS_FILE="inputs/terms.txt"
PAGES_FILE="inputs/pages.md"
mkdir -p inputs
[[ -f "$TERMS_FILE" ]] || cat > "$TERMS_FILE" <<TXT
semantic color anchors
emoji pathfinding
brick grid update
user empowerment provenance
token logic
TXT
[[ -f "$PAGES_FILE" ]] || cat > "$PAGES_FILE" <<MD
# Paste curated research excerpts below
- Color anchors create cognitive landmarks for non-programmers.
- Emoji pathfinding improves orientation in grid UIs.
- Provenance logs (timestamps + hashes) build trust.
MD

mapfile -t TERMS < "$TERMS_FILE"
PAGES="$(sed 's/\r$//' "$PAGES_FILE")"

log() {
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "[$ts] [∞] ${CART}: $*" | tee -a "${LOGDIR}/provenance.log"
}

generate_paragraph() {
  local t="${TERMS[$((RANDOM % ${#TERMS[@]}))]}"
  local ex="$(echo "${PAGES}" | awk 'length>0' | sed -n $(( (RANDOM % 12) + 1 ))'p')"
  local ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  cat <<TXT
${t} — ${ts}
Infinity research draft: ${t} is operationalized as a user-facing scaffold that converts ambiguity into action.
${ex:-(curated excerpt pending)}
Design: map ${t} to visible anchors; log interactions; expose hashes for auditability.
Impact: reduce friction; increase trust; enable non-programmers to orchestrate complex flows.
TXT
}

# Emit bundles quickly (every N seconds)
EMIT_INTERVAL=10   # seconds
STREAM_DELAY=0.03  # terminal scroll speed

last_emit=$(date +%s)
buffer="${OUTDIR}/buffer_live.txt"
: > "$buffer"

log "Start live text stream + continuous push (no JSON artifacts)"
while true; do
  para="$(generate_paragraph)"
  color="${COLORS[$((RANDOM % ${#COLORS[@]}))]}"
  while IFS= read -r line; do
    echo -e "${color}[∞] ${line}${RESET}"
    echo "${line}" >> "$buffer"
    sleep "${STREAM_DELAY}"
  done <<< "$para"
  echo "" >> "$buffer"

  now=$(date +%s)
  if (( now - last_emit >= EMIT_INTERVAL )); then
    ts_file="$(date -u +'%Y%m%d_%H%M%S')"
    out_txt="${OUTDIR}/infinity_${ts_file}.txt"
    cp "$buffer" "$out_txt"
    : > "$buffer"
    bytes=$(wc -c < "$out_txt")
    log "Emitted ${out_txt} (${bytes} bytes); pushing…"

    # Push cycle
    git add -A
    git commit -m "∞ ${CART} text bundle ${ts_file}" || true
    git pull --rebase "${REMOTE}" "${BRANCH}" || true
    git push "${REMOTE}" "${BRANCH}" || true

    last_emit=$now
  fi
done
