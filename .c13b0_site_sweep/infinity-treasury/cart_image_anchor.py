#!/usr/bin/env python3
from PIL import Image
import imagehash, hashlib, json, sys
from pathlib import Path

if len(sys.argv) != 2:
    print("Usage: cart_image_anchor.py <image_file>")
    sys.exit(1)

img_path = Path(sys.argv[1])
if not img_path.exists():
    print("Image not found")
    sys.exit(1)

img = Image.open(img_path)

out = {
    "file": img_path.name,
    "sha256": hashlib.sha256(img_path.read_bytes()).hexdigest(),
    "phash": str(imagehash.phash(img)),
    "ahash": str(imagehash.average_hash(img))
}

print(json.dumps(out, indent=2))
