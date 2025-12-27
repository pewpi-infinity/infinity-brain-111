#!/usr/bin/env python3
"""
Ingest raw Gutenberg texts into JSONL catalog.

- Reads files from data/gutenberg/raw/*.txt
- Optionally chunk long texts
- Optionally run a transform/paraphrase step (disabled by default)
- Writes catalog JSONL to data/catalogs/gutenberg_catalog_<timestamp>.jsonl
"""
import argparse, json, os, hashlib, time
from pathlib import Path
from datetime import datetime

def sha1(s: str):
    import hashlib
    return hashlib.sha1(s.encode("utf-8")).hexdigest()

def normalize_whitespace(text: str) -> str:
    import re
    text = re.sub(r'\r\n?', '\n', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

def chunk_text(text: str, max_words=1200, overlap=100):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        chunk_words = words[start:start+max_words]
        chunks.append(" ".join(chunk_words))
        start += max_words - overlap
    return chunks

# lightweight transform: synonym substitution using WordNet (NLTK) - optional
def light_transform(text: str) -> str:
    try:
        from nltk.corpus import wordnet as wn
    except Exception:
        return text
    import random, re
    tokens = re.findall(r"\w+|\W+", text)
    out = []
    for t in tokens:
        if t.isalpha() and random.random() < 0.04:  # 4% chance replace with synonym
            syns = wn.synsets(t.lower())
            if syns:
                lemmas = [l.name().replace("_"," ") for s in syns for l in s.lemmas()]
                if lemmas:
                    out.append(lemmas[0])
                    continue
        out.append(t)
    return "".join(out)

def write_record(fh, rec):
    fh.write(json.dumps(rec, ensure_ascii=False) + "\n")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--raw_dir", default="data/gutenberg/raw")
    parser.add_argument("--out_dir", default="data/catalogs")
    parser.add_argument("--chunk", action="store_true", help="Chunk long books")
    parser.add_argument("--transform", action="store_true", help="Enable light transform/paraphrase")
    parser.add_argument("--max_words", type=int, default=1200)
    args = parser.parse_args()

    raw_dir = Path(args.raw_dir)
    out_dir = Path(args.out_dir); out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(raw_dir.glob("*.txt"))
    timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
    out_path = out_dir / f"gutenberg_catalog_{timestamp}.jsonl"

    seen = set()
    with out_path.open("w", encoding="utf-8") as fh:
        for p in files:
            txt = p.read_text(encoding="utf-8", errors="ignore")
            txt = normalize_whitespace(txt)
            if args.chunk:
                chunks = chunk_text(txt, max_words=args.max_words)
            else:
                chunks = [txt]
            for i, c in enumerate(chunks):
                rec_text = light_transform(c) if args.transform else c
                key = sha1(rec_text[:1000])
                if key in seen:
                    continue
                seen.add(key)
                rec = {
                    "id": sha1(p.name + str(i)),
                    "source": "gutenberg",
                    "title": p.stem,
                    "author": "",
                    "language": "en",
                    "license": "Public Domain (Project Gutenberg)",
                    "text": rec_text,
                    "token_count": len(rec_text.split()),
                    "metadata": {"file_path": str(p), "chunk_index": i}
                }
                write_record(fh, rec)
    print("Wrote catalog:", out_path)

if __name__ == "__main__":
    main()