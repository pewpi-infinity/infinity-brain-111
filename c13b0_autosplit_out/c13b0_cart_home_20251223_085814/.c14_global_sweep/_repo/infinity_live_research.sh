#!/usr/bin/env bash
set -euo pipefail

# Infinity Live Research — colored terminal stream + minute-bundled Git pushes

# Config
CART_NAME="CART_LIVE_RESEARCH"
TARGET_BYTES=$((1024*1024))   # set to 0 to disable size padding
BRANCH="main"
REMOTE="origin"

# Dirs
mkdir -p inputs research logs

# Colors
RESET="\033[0m"
RED="\033[31m"; BLUE="\033[34m"; YELLOW="\033[33m"; GREEN="\033[32m"; PURPLE="\033[35m"
COLORS=("$RED" "$BLUE" "$YELLOW" "$GREEN" "$PURPLE")

log() {
  ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  echo "[$ts] [∞] ${CART_NAME}: $*" | tee -a logs/provenance.log
}

seed_inputs() {
  if [[ ! -f inputs/terms.txt ]]; then
    cat > inputs/terms.txt <<TXT
token logic
emoji pathfinding
brick grid update
semantic color anchors
user empowerment provenance
TXT
    log "Seeded inputs/terms.txt"
  fi
  if [[ ! -f inputs/pages.md ]]; then
    cat > inputs/pages.md <<MD
# Paste curated excerpts here (not fetched automatically)
- Emoji pathfinding improves orientation in grid interfaces.
- Provenance logs increase trust via visible timestamps and hashes.
MD
    log "Seeded inputs/pages.md"
  fi
}

# Read inputs into arrays for synthesis
load_inputs() {
  mapfile -t TERMS < inputs/terms.txt
  PAGES="$(sed 's/\r$//' inputs/pages.md)"
}

# Generate a single research line from inputs (no external fetch)
generate_line() {
  local t_idx=$((RANDOM % ${#TERMS[@]}))
  local term="${TERMS[$t_idx]}"
  local excerpt="$(echo "${PAGES}" | awk 'length>0' | sed -n $(( (RANDOM % 10) + 1 ))'p')"
  local ts="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
  # Synthesis heuristic: term + purpose + excerpt tie-in
  local line="(${ts}) ${term}: advancing user cognition via anchored semantics; evidence: ${excerpt:-curated source pending}."
  echo "${line}"
}

# Pad file to target bytes with transparent filler
pad_to_target() {
  local outfile="$1"
  [[ "${TARGET_BYTES}" -le 0 ]] && return
  local current_size
  current_size=$(wc -c < "${outfile}")
  if (( current_size >= TARGET_BYTES )); then
    return
  fi
  local missing=$(( TARGET_BYTES - current_size ))
  printf '\n{"filler":"START","note":"size pad for deterministic 1MB artifact"}\n' >> "${outfile}"
  local chunk='{"pad":"anchors terms pages provenance color"}\n'
  while (( missing > 0 )); do
    local bytes_to_write=${#chunk}
    if (( bytes_to_write > missing )); then
      printf '%s' "${chunk:0:missing}" >> "${outfile}"
      break
    else
      printf '%s' "${chunk}" >> "${outfile}"
      missing=$(( missing - bytes_to_write ))
    fi
  done
  printf '{"filler":"END"}\n' >> "${outfile}"
}

# Commit and push safely with rebase
commit_and_push() {
  git add -A
  git commit -m "∞ ${CART_NAME} bundle: $(date -u +'%Y-%m-%dT%H:%M:%SZ')" || true
  git pull --rebase "${REMOTE}" "${BRANCH}" || true
  git push "${REMOTE}" "${BRANCH}" || true
}

# Main loop: stream lines to terminal and accumulate into buffer
main() {
  seed_inputs
  load_inputs
  log "Start live research stream (colored) + minute bundling to research/"
  local buffer_file="research/current_buffer.txt"
  : > "${buffer_file}"

  # Track minute boundary
  while true; do
    # Generate and display a line
    local line
    line="$(generate_line)"
    local c_idx=$((RANDOM % ${#COLORS[@]}))
    local color="${COLORS[$c_idx]}"
    echo -e "${color}[∞] ${line}${RESET}"

    # Append to buffer
    echo "${line}" >> "${buffer_file}"

    # Check minute boundary for emission
    local now_s
    now_s=$(date +%s)
    # Emit every ~5 seconds to keep it fast; adjust to 60 for per-minute bundles
    if (( now_s % 60 == 0 )); then
      local ts_file
      ts_file="$(date -u +'%Y%m%d_%H%M%S')"
      local out="research/research_${ts_file}.txt"
      cp "${buffer_file}" "${out}"
      # Optional: also write JSON alongside text for SPA consumption
      local j="research/research_${ts_file}.json"
      {
        echo "{"
        echo "  \"module\": \"Infinity Cart Engine\","
        echo "  \"cart\": \"${CART_NAME}\","
        echo "  \"timestamp_utc\": \"$(date -u +'%Y-%m-%dT%H:%M:%SZ')\","
        echo "  \"color_logic\": {"
        echo "    \"token logic\": \"🟥 red\","
        echo "    \"emoji pathfinding\": \"🟦 blue\","
        echo "    \"brick grid update\": \"🟧 orange\","
        echo "    \"semantic color anchors\": \"🟨 yellow\","
        echo "    \"user empowerment provenance\": \"🟩 green\""
        echo "  },"
        echo "  \"text_lines\": ["
        sed 's/^/    "/; s/$/"/; s/"/\\"/g' "${buffer_file}" | paste -sd, -
        echo "  ]"
        echo "}"
      } > "${j}"

      # Size pad optional
      pad_to_target "${j}"

      # Log emission
      local bytes_txt
      bytes_txt=$(wc -c < "${out}")
      local bytes_json
      bytes_json=$(wc -c < "${j}")
      log "Emitted ${out} (${bytes_txt} bytes) and ${j} (${bytes_json} bytes)"

      # Clear buffer
      : > "${buffer_file}"

      # Commit and push
      commit_and_push
    fi

    # Stream speed: fast scrolling
    sleep 0.05
  done
}

main
