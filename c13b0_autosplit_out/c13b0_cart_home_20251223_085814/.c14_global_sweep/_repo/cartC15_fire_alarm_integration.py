#!/usr/bin/env python3
"""
C15 — Fire Alarm Integration (High-Level)
"""

CONTENT = {
    "purpose": "Ensure immediate release during fire conditions",
    "priority": "Fire systems override access control",
    "design_goal": "Enable rapid, unimpeded egress"
}

def main():
    for k, v in CONTENT.items():
        print(f"{k}: {v}")

if __name__ == "__main__":
    main()
