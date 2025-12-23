#!/usr/bin/env python3
"""
cart019_theme_engine
Defines color theme system.
"""

import json

THEME = {
    "primary": "#1f2933",
    "secondary": "#3b82f6",
    "background": "#ffffff",
    "text": "#111827",
    "muted": "#6b7280"
}

def main():
    with open("theme.json", "w") as f:
        json.dump(THEME, f, indent=2)

    print("[✓] theme.json created")

if __name__ == "__main__":
    main()
