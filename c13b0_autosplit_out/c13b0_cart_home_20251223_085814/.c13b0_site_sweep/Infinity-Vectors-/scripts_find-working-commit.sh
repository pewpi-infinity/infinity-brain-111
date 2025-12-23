#!/usr/bin/env bash
# find-working-commit.sh
# Usage: ./scripts/find-working-commit.sh [max_commits] [build_cmd] [check_path]
# Example: ./scripts/find-working-commit.sh 40 "npm ci && npm run build" "dist/index.html"
set -euo pipefail

MAX_COMMITS=${1:-50}
BUILD_CMD=${2:-"npm ci && npm run build"}
CHECK_PATH=${3:-"dist/index.html"}

ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TIMESTAMP=$(date -u +"%Y%m%d-%H%M%S")
BACKUP_BRANCH="backup-before-restore-${TIMESTAMP}"

trap 'echo "Restoring original branch ${ORIG_BRANCH}"; git checkout -f "${ORIG_BRANCH}" >/dev/null 2>&1 || true' EXIT

echo "Creating backup branch: ${BACKUP_BRANCH} from ${ORIG_BRANCH}"
git checkout -b "${BACKUP_BRANCH}"

COMMITS=$(git rev-list --max-count="${MAX_COMMITS}" HEAD)

echo "Testing up to ${MAX_COMMITS} commits for a successful build..."
for SHA in ${COMMITS}; do
  echo "==== Testing commit ${SHA} ===="
  git checkout --force "${SHA}"
  # Try the build in a subshell so temporary changes don't persist
  if bash -lc "${BUILD_CMD}" >/dev/null 2>&1; then
    if [ -e "${CHECK_PATH}" ]; then
      RESTORE_BRANCH="restore/from-${SHA}-${TIMESTAMP}"
      echo "Found working commit ${SHA}. Creating branch ${RESTORE_BRANCH} from ${SHA}."
      git checkout -b "${RESTORE_BRANCH}" "${SHA}"
      echo "Branch ${RESTORE_BRANCH} created locally."
      echo "If you want to push it: git push -u origin ${RESTORE_BRANCH}"
      exit 0
    else
      echo "Build succeeded but ${CHECK_PATH} not found. Continuing search..."
    fi
  else
    echo "Build failed at commit ${SHA}."
  fi
done

echo "No working commit found in the last ${MAX_COMMITS} commits."
exit 1