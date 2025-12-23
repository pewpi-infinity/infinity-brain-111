#!/usr/bin/env python3
"""
Optional paraphrase step (Hugging Face Inference API example).
Reads a JSONL catalog and writes a paraphrased JSONL.

Usage:
  export HUGGINGFACE_API_TOKEN="hf_xxx"   # optional; if not set the script copies input -> output
  python3 scripts/transform_paraphrase.py --in data/catalogs/gutenberg_catalog_YYYYMMDDHHMMSS.jsonl --out data/catalogs/gutenberg_catalog_paraphrased.jsonl
Notes:
 - This uses the HF Inference API. Replace the model or API call as needed for OpenAI or other providers.
 - Keep chunk sizes small (the script truncates to first N characters in the request).
"""
import argparse
import os
import json
import time
from pathlib import Path
import requests

HF_TOKEN = os.environ.get("HUGGINGFACE_API_TOKEN")
HF_MODEL = os.environ.get("HUGGINGFACE_MODEL", "google/flan-t5-small")  # default small model; change as desired
MAX_CHARS = int(os.environ.get("PARAPHRASE_MAX_CHARS", "2000"))
DELAY_SECONDS = float(os.environ.get("PARAPHRASE_DELAY", "0.5"))

def hf_paraphrase(text, max_retries=2):
    if not HF_TOKEN:
        raise RuntimeError("HUGGINGFACE_API_TOKEN not set")
    url = f"https://api-inference.huggingface.co/models/{HF_MODEL}"
    headers = {"Authorization": f"Bearer {HF_TOKEN}", "Accept": "application/json"}
    payload = {"inputs": f"Paraphrase the following text to be clearer and use higher-precision vocabulary:\n\n{text}"}
    for attempt in range(max_retries):
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        if r.status_code == 200:
            try:
                out = r.json()
                # handle model response as list/dict
                if isinstance(out, list) and len(out) > 0:
                    cand = out[0]
                    if isinstance(cand, dict):
                        # some models return {'generated_text': '...'}
                        return cand.get("generated_text") or cand.get("text") or json.dumps(cand)
                    return str(cand)
                elif isinstance(out, dict):
                    # fallback
                    return out.get("generated_text") or out.get("text") or json.dumps(out)
                else:
                    return str(out)
            except Exception as e:
                raise RuntimeError(f"Failed to parse HF response: {e}")
        else:
            # retry on server error
            if r.status_code in (429, 500, 502, 503, 504):
                time.sleep(1 + attempt * 2)
                continue
            raise RuntimeError(f"Hugging Face API error {r.status_code}: {r.text}")
    raise RuntimeError("Hugging Face paraphrase failed after retries")

def paraphrase_record_text(text):
    snippet = text[:MAX_CHARS]
    return hf_paraphrase(snippet)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--in", dest="infile", required=True)
    parser.add_argument("--out", dest="outfile", required=True)
    parser.add_argument("--sleep", type=float, default=DELAY_SECONDS, help="Delay between API calls (s)")
    args = parser.parse_args()
    inp = Path(args.infile)
    outp = Path(args.out)
    outp.parent.mkdir(parents=True, exist_ok=True)

    # If no HF token, copy input -> output (no-op)
    if not HF_TOKEN:
        print("HUGGINGFACE_API_TOKEN not set; copying input to output (no paraphrase).")
        with inp.open("r", encoding="utf-8") as fh_in, outp.open("w", encoding="utf-8") as fh_out:
            for line in fh_in:
                fh_out.write(line)
        print("Copied.")
        return

    with inp.open("r", encoding="utf-8") as fh_in, outp.open("w", encoding="utf-8") as fh_out:
        for i, line in enumerate(fh_in):
            try:
                rec = json.loads(line)
            except Exception:
                continue
            text = rec.get("text", "")
            if not text.strip():
                fh_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
                continue
            try:
                new_text = paraphrase_record_text(text)
                if new_text and isinstance(new_text, str) and len(new_text.strip()) > 0:
                    rec["text"] = new_text
                    rec.setdefault("metadata", {})["paraphrased"] = True
                else:
                    rec.setdefault("metadata", {})["paraphrase_error"] = "empty response"
            except Exception as e:
                rec.setdefault("metadata", {})["paraphrase_error"] = str(e)
            fh_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            if (i + 1) % 5 == 0:
                print(f"Processed {i+1} records...")
            time.sleep(args.sleep)
    print("Paraphrase complete:", outp)

if __name__ == "__main__":
    main()
