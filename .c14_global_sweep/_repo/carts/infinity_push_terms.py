#!/usr/bin/env python3
import os, sys

TERMS_FILE = "search_terms_master.txt"

# If the file doesn't exist, create it
if not os.path.exists(TERMS_FILE):
    open(TERMS_FILE, "w").close()

# Terms passed as arguments OR piped into stdin
incoming_terms = []

# Allow: python infinity_push_terms.py term1 term2 term3
if len(sys.argv) > 1:
    incoming_terms.extend(sys.argv[1:])

# Allow piped input:
# echo "helium frequency" | python infinity_push_terms.py
if not sys.stdin.isatty():
    for line in sys.stdin:
        line = line.strip()
        if line:
            incoming_terms.append(line)

# Deduplicate new terms in this run
incoming_terms = list(dict.fromkeys(incoming_terms))

if not incoming_terms:
    print("No terms provided.")
    sys.exit(0)

# Append to file WITHOUT deleting or overwriting anything
with open(TERMS_FILE, "a") as f:
    for term in incoming_terms:
        f.write(term + "\n")

# Git push
os.system(f"git add {TERMS_FILE}")
os.system(f"git commit -m 'Added search terms: {", ".join(incoming_terms)}'")
os.system("git push origin main")

print("✓ Terms added and pushed:")
for t in incoming_terms:
    print("  •", t)
