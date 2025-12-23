#!/usr/bin/env python3

"""
Download a batch of Project Gutenberg plain-text books using the Gutendex API.

Usage examples:
  python scripts/gutenberg_downloader.py --out_dir data/gutenberg --limit 50
  python scripts/gutenberg_downloader.py --ids 1342,84 --out_dir data/gutenberg

Notes:
 - Uses gutendex (https://gutendex.com/) for metadata and plain text links.
 - Downloads only the plain text file for each book (utf-8 best-effort).
 - Produces files: <out_dir>/raw/<gutenberg_id>.txt and a metadata CSV.
"""

import argparse, os, requests, sys, time, csv
from pathlib import Path

GUTENDEX_API = "https://gutendex.com/books"

def fetch_books_page(page=1):
    r = requests.get(GUTENDEX_API, params={"page": page}, timeout=30)
    r.raise_for_status()
    return r.json()

def get_books(limit=None):
    books = []
    page = 1
    while True:
        data = fetch_books_page(page=page)
        books.extend(data.get("results", []))
        if limit and len(books) >= limit:
            return books[:limit]
        if not data.get("next"):
            break
        page += 1
        time.sleep(0.2)
    return books

def choose_plaintext_url(formats):
    for k in ("text/plain; charset=utf-8", "text/plain"):
        if k in formats:
            return formats[k]
    for k, v in formats.items():
        if k.startswith("text/plain"):
            return v
    return None

def download_book(book, out_dir: Path):
    book_id = book.get("id")
    formats = book.get("formats", {})
    txt_url = choose_plaintext_url(formats)
    if not txt_url:
        print(f"[skip] {book_id} no plaintext URL")
        return False
    try:
        r = requests.get(txt_url, timeout=60)
        r.raise_for_status()
        content = r.content
        try:
            text = content.decode("utf-8")
        except Exception:
            try:
                text = content.decode("latin-1")
            except Exception:
                print(f"[skip] {book_id} decode failed")
                return False
        out_path = out_dir / "raw" / f"{book_id}.txt"
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(text, encoding="utf-8", errors="ignore")
        return True
    except Exception as e:
        print(f"[error] download {book_id}: {e}")
        return False

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--out_dir", default="data/gutenberg", help="Output directory")
    parser.add_argument("--limit", type=int, default=20, help="Max number of books to download")
    parser.add_argument("--ids", help="Comma-separated Gutenberg IDs to download instead of browsing")
    parser.add_argument("--sleep", type=float, default=0.5, help="Seconds to wait between downloads")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    metadata_csv = out_dir / "metadata.csv"

    books = []
    if args.ids:
        for bid in args.ids.split(","):
            bid = bid.strip()
            r = requests.get(f"{GUTENDEX_API}/{bid}")
            if r.status_code == 200:
                books.append(r.json())
            else:
                print(f"[warn] id {bid} not found")
    else:
        books = get_books(limit=args.limit)

    rows = []
    for b in books:
        ok = download_book(b, out_dir)
        rows.append({
            "id": b.get("id"),
            "title": b.get("title"),
            "authors": ";".join([a.get("name","") for a in b.get("authors",[])]),
            "downloaded": "1" if ok else "0"
        })
        time.sleep(args.sleep)

    with metadata_csv.open("w", encoding="utf-8", newline="") as fh:
        w = csv.DictWriter(fh, fieldnames=["id","title","authors","downloaded"])
        w.writeheader()
        w.writerows(rows)
    print("Done. Metadata saved to", metadata_csv)

if __name__ == "__main__":
    main()