```markdown
# Restore tools for GPT-Vector-Design

These helper scripts are intended to safely diagnose and recover a previously-working commit/build.

Important safety notes
- Always run these locally first. The scripts will create a backup branch before attempting any changes.
- The find-working-commit script will checkout historical commits — ensure you have no uncommitted work or stash it.

Quick steps
1. Create a local backup branch and stop the script if anything looks wrong:
   ./scripts/find-working-commit.sh 50 "npm ci && npm run build" "dist/index.html"

2. Run scanner to see missing referenced files:
   python3 scripts/repo-scan.py --root .

3. If a working commit is found, inspect the created branch (restore/from-<sha>-<ts>), review, then push:
   git push -u origin restore/from-<sha>-<ts>

4. Once reviewed, create a PR from the restore branch to main.

Recommended Node & Python
- Node: 18.x LTS (e.g. 18.20)
- Python: 3.10+ (3.11 recommended)

CI suggestion
- Add a workflow that runs repo-scan.py and `npm ci && npm run build` on PRs to catch regressions early.

Rollback plan
- If the restore branch introduces issues, revert the merge or checkout the backup branch:
  git checkout backup-before-restore-<timestamp>
```