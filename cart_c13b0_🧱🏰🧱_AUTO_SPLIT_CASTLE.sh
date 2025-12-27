#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

### 🧱👑🧱 C13B0 AUTO SPLIT CASTLE — Bash Only
### One brick = one new repo. No protected branch collisions. No cheesy overwrites.
### PIXIE_LOCK respected. Mario emojis preserved.

ROOT="${HOME}"
ORG="pewpi-infinity"
PIXIE_LOCK="infinity-brain-111"
MAXDEPTH="3"
BIG_MB="50"   # anything bigger gets routed to artifacts (kept out of git)

OUT="${HOME}/c13b0_autosplit_out"
LOG_DIR="${HOME}/.c13b0_logs"
TS="$(date -u +%Y%m%d_%H%M%S)"
LOG="${LOG_DIR}/castle_autosplit_${TS}.log"
MANIFEST="${LOG_DIR}/manifest_${TS}.txt"

mkdir -p "${OUT}" "${LOG_DIR}"

log(){ echo "$1" | tee -a "${LOG}"; }

log "🧱👑🧱 C13B0 CASTLE AUTO-SPLIT START  ${TS}"
log "🧱📍🧱 ROOT=${ROOT}"
log "🧱🏷️🧱 ORG=${ORG}"
log "🧱👰🧱 PIXIE_LOCK=${PIXIE_LOCK}"
log "🧱📦🧱 OUT=${OUT}"
log "🧱📜🧱 LOG=${LOG}"

# ---- PREFLIGHT (prevents your “line 32 stall” type failures) ----
command -v git >/dev/null 2>&1 || { log "🧱❌🧱 git not found"; exit 1; }
command -v rsync >/dev/null 2>&1 || { log "🧱❌🧱 rsync not found (pkg install rsync)"; exit 1; }
command -v gh >/dev/null 2>&1 || { log "🧱❌🧱 gh not found (pkg install gh)"; exit 1; }

# Ensure GH auth is live (no prompts mid-run)
if ! gh auth status >/dev/null 2>&1; then
  log "🧱❌🧱 GitHub CLI not authenticated."
  log "🧱🟦🧱 Fix with: gh auth login  (choose web/device login)"
  exit 1
fi

# Ensure git identity exists (commit gate)
GNAME="$(git config --global user.name || true)"
GEMAIL="$(git config --global user.email || true)"
if [ -z "${GNAME}" ] || [ -z "${GEMAIL}" ]; then
  log "🧱❌🧱 Git identity missing (user.name / user.email)."
  log "🧱🟦🧱 Fix with:"
  log "git config --global user.name \"pewpi-infinity\""
  log "git config --global user.email \"marvaseater@gmail.com\""
  exit 1
fi

# Speed: avoid interactive host key prompts
mkdir -p "${HOME}/.ssh"
touch "${HOME}/.ssh/known_hosts" || true

# ---- FIND REPOS ----
log "🧱🔍🧱 Scanning for repos (maxdepth=${MAXDEPTH})..."
find "${ROOT}" -maxdepth "${MAXDEPTH}" -type d -name ".git" 2>/dev/null | sed 's|/.git||' > "${MANIFEST}"
TOTAL="$(wc -l < "${MANIFEST}" | tr -d ' ')"
log "🧱📊🧱 Found ${TOTAL} repos"

# ---- TOKEN PRINT (simple, deterministic) ----
TOKEN_ID="🧱🎟️🧱 C13B0_CASTLE_${TS}"
log "${TOKEN_ID}"

# ---- MAIN LOOP ----
N=0
while read -r SRC; do
  [ -d "${SRC}" ] || continue
  N=$((N+1))
  NAME="$(basename "${SRC}")"

  log ""
  log "🧱🏗️🧱 [${N}/${TOTAL}] SOURCE=${NAME}"

  if [ "${NAME}" = "${PIXIE_LOCK}" ]; then
    log "🧱👰🧱 PIXIE_LOCK — skipping ${NAME} (read-only by rule)"
    continue
  fi

  # New repo name per item
  NEW_REPO="c13b0_cart_${NAME}_${TS}"
  DEST="${OUT}/${NEW_REPO}"

  log "🧱📦🧱 DEST=${DEST}"
  rm -rf "${DEST}"
  mkdir -p "${DEST}"

  # Copy payload without .git
  log "🧱🧱🧱 Copying files (excluding .git)…"
  rsync -a --exclude='.git' "${SRC}/" "${DEST}/" >>"${LOG}" 2>&1 || { log "🧱❌🧱 rsync failed for ${NAME}"; continue; }

  cd "${DEST}"

  # Big file guard: move > BIG_MB to artifacts (kept out of git)
  ART="C13B0_ARTIFACTS"
  mkdir -p "${ART}"
  BIG_FOUND="0"
  while IFS= read -r -d '' F; do
    BIG_FOUND="1"
    BN="$(basename "$F")"
    log "🧱⚠️🧱 BIG FILE ROUTED (${BIG_MB}MB+): ${F}"
    mkdir -p "${ART}"
    mv "$F" "${ART}/${BN}" || true
    echo "${ART}/${BN}" >> .gitignore
  done < <(find . -type f -size +"${BIG_MB}"M -print0 2>/dev/null)

  if [ "${BIG_FOUND}" = "1" ]; then
    sort -u .gitignore -o .gitignore
    log "🧱🧱🧱 Big files moved to ${ART}/ and ignored (prevents rule/size rejects)."
  fi

  # Initialize fresh git
  rm -rf .git
  git init >>"${LOG}" 2>&1
  git branch -M main >>"${LOG}" 2>&1

  # Add minimal README token stamp (so every repo has a brick marker)
  if [ ! -f README.md ]; then
    cat <<R > README.md
# ${NEW_REPO}

${TOKEN_ID}

🧱 Brick repo created from: ${NAME}  
🧱 Timestamp (UTC): ${TS}  
R
  else
    printf "\n\n%s\n" "${TOKEN_ID}" >> README.md
  fi

  git add -A >>"${LOG}" 2>&1

  if git diff --cached --quiet; then
    log "🧱⚠️🧱 EMPTY PAYLOAD — nothing to commit, skipping ${NEW_REPO}"
    continue
  fi

  git commit -m "🧱 ${NEW_REPO} (auto split)" >>"${LOG}" 2>&1 || { log "🧱❌🧱 commit failed ${NEW_REPO}"; continue; }

  # Create repo (or reuse if exists)
  if gh repo view "${ORG}/${NEW_REPO}" >/dev/null 2>&1; then
    log "🧱⚠️🧱 Repo exists: ${ORG}/${NEW_REPO} (will push)"
    git remote add origin "https://github.com/${ORG}/${NEW_REPO}.git" >>"${LOG}" 2>&1 || true
  else
    log "🧱➕🧱 Creating repo: ${ORG}/${NEW_REPO}"
    if ! gh repo create "${ORG}/${NEW_REPO}" --public --source=. --remote=origin >>"${LOG}" 2>&1; then
      log "🧱❌🧱 repo create failed ${NEW_REPO} — skipping"
      continue
    fi
  fi

  # Push and report truthfully
  log "🧱🚀🧱 Pushing ${ORG}/${NEW_REPO}…"
  if git push -u origin main >>"${LOG}" 2>&1; then
    log "🧱⭐🧱 PUSH OK → ${ORG}/${NEW_REPO}"
  else
    log "🧱⚠️🧱 PUSH FAILED → ${ORG}/${NEW_REPO} (see log)"
  fi

done < "${MANIFEST}"

log ""
log "🧱👑🧱 C13B0 CASTLE AUTO-SPLIT COMPLETE"
log "🧱📜🧱 LOG FILE: ${LOG}"
log "🧱🎟️🧱 TOKEN: ${TOKEN_ID}"

