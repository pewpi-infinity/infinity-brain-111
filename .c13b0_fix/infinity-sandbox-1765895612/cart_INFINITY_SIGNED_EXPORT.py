#!/usr/bin/env python3
import hashlib
import json
import datetime
from pathlib import Path

EXPORTS = Path("infinity_storage/exports")

# -----------------------------
# Find latest export directory
# -----------------------------
export_dirs = sorted(
    [d for d in EXPORTS.iterdir() if d.is_dir()],
    key=lambda p: p.stat().st_mtime,
    reverse=True
)

if not export_dirs:
    print("[!] No exports found. Run Cart 16 first.")
    exit(1)

export_dir = export_dirs[0]
now = datetime.datetime.utcnow().isoformat()

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

# -----------------------------
# Build manifest
# -----------------------------
files = []
for f in export_dir.iterdir():
    if f.is_file():
        files.append({
            "file": f.name,
            "sha256": sha256_file(f),
            "bytes": f.stat().st_size
        })

manifest = {
    "generated": now,
    "export_dir": export_dir.name,
    "file_count": len(files),
    "files": files
}

manifest_path = export_dir / "export_manifest.json"
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)

# -----------------------------
# Write checksum file
# -----------------------------
checksum_path = export_dir / "export_manifest.sha256"
with open(checksum_path, "w") as f:
    f.write(sha256_file(manifest_path) + "  export_manifest.json\n")

print("\n[∞] Signed export complete")
print(f"[∞] Export: {export_dir}")
print(f"[∞] Manifest: {manifest_path}")
print(f"[∞] Checksum: {checksum_path}\n")
