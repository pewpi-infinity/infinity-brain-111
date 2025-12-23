#!/usr/bin/env python3
"""
C16 — Accessibility Considerations (ADA Concepts)
"""

CONSIDERATIONS = [
    "Controls must be reachable without fine motor skills",
    "No excessive force required to exit",
    "Visual and tactile cues should be clear",
    "Systems must serve all users equally"
]

def main():
    print("ACCESSIBILITY CONSIDERATIONS:")
    for c in CONSIDERATIONS:
        print(f"- {c}")

if __name__ == "__main__":
    main()
