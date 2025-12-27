#!/usr/bin/env bash
# Simple pipeline runner for local tests.
# Usage: bash scripts/run_pipeline.sh --limit 5 --paraphrase
set -euo pipefail
LIMIT=5
PARAPHRASE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --limit) LIMIT="$2"; shift 2;;
    --paraphrase) PARAPHRASE=1; shift;;
    *) shift;;
  esac
done

echo "Running pipeline: downloader -> ingest -> (optional) paraphrase"
python3 scripts/gutenberg_downloader.py --out_dir data/gutenberg --limit "${LIMIT}"
python3 scripts/gutenberg_ingest.py --raw_dir data/gutenberg/raw --out_dir data/catalogs --chunk
# find latest catalog
LATEST=$(ls -1t data/catalogs/gutenberg_catalog_*.jsonl 2>/dev/null | head -n1 || true)
if [[ -z "$LATEST" ]]; then
  echo "No catalog found to paraphrase."
  exit 0
fi
echo "Latest catalog: $LATEST"
if [[ $PARAPHRASE -eq 1 ]]; then
  OUT="${LATEST%.jsonl}_paraphrased.jsonl"
  echo "Paraphrasing to $OUT"
  python3 scripts/transform_paraphrase.py --in "$LATEST" --out "$OUT"
  echo "Paraphrase complete: $OUT"
fi
echo "Pipeline finished."
