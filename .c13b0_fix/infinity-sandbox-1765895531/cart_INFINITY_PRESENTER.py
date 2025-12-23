#!/usr/bin/env python3
import json
import datetime
from pathlib import Path

BASE = Path("infinity_storage")
INDEX = BASE / "index"
OUTPUT = BASE / "output"
OUTPUT.mkdir(parents=True, exist_ok=True)

THREAD_FILE = INDEX / "reasoning_thread.json"
EXPR_SEL_FILE = INDEX / "expression_selection.json"
EXPR_CAT_FILE = INDEX / "expression_catalog.json"
GOV_FILE = INDEX / "governance_state.json"

OUT_TEXT = OUTPUT / "presented_output.txt"
OUT_JSON = OUTPUT / "presented_output.json"

NOW = datetime.datetime.utcnow().isoformat()

def load(p):
    if p.exists():
        with open(p) as f:
            return json.load(f)
    return {}

thread = load(THREAD_FILE)
expr_sel = load(EXPR_SEL_FILE)
expr_cat = load(EXPR_CAT_FILE)
gov = load(GOV_FILE)

expr_hash = expr_sel.get("expression_hash")
expr_def = expr_cat.get(expr_hash, {}).get("definition", {})

# -----------------------------
# Build presentation (structured)
# -----------------------------
presentation = {
    "generated": NOW,
    "objective": thread.get("objective"),
    "expression": expr_def.get("name"),
    "tone": expr_def.get("tone"),
    "purpose": expr_def.get("purpose"),
    "labels": ["simulation", "beta"],
    "reasoning": {
        "premises": thread.get("premises", []),
        "constraints": thread.get("constraints", []),
        "logic_steps": thread.get("logic_steps", []),
        "provisional_conclusion": thread.get("provisional_conclusion", {}),
        "confidence": thread.get("confidence", {})
    },
    "governance": {
        "enforced": True,
        "rules_version": gov.get("rules", {}).get("version", "unknown")
    }
}

# -----------------------------
# Render human-readable output
# -----------------------------
lines = []
lines.append("∞ INFINITY SYSTEM — PRESENTED OUTPUT")
lines.append(f"Generated: {NOW}")
lines.append("")
lines.append(f"OBJECTIVE:")
lines.append(f"  {presentation['objective']}")
lines.append("")
lines.append(f"EXPRESSION MODE:")
lines.append(f"  Tone: {presentation['tone']}")
lines.append(f"  Purpose: {presentation['purpose']}")
lines.append("")
lines.append("REASONING THREAD:")
lines.append("  Premises:")
for p in presentation["reasoning"]["premises"]:
    lines.append(f"   - {p}")

lines.append("  Constraints:")
for c in presentation["reasoning"]["constraints"]:
    lines.append(f"   - {c}")

lines.append("  Logic Steps:")
for s in presentation["reasoning"]["logic_steps"]:
    lines.append(f"   {s['step']}. {s['type']} — {s['description']}")

lines.append("")
lines.append("PROVISIONAL CONCLUSION:")
lines.append(f"  {presentation['reasoning']['provisional_conclusion'].get('statement')}")
lines.append(f"  Status: {presentation['reasoning']['provisional_conclusion'].get('status')}")

lines.append("")
lines.append("CONFIDENCE:")
lines.append(f"  Level: {presentation['reasoning']['confidence'].get('level')}")
lines.append(f"  Notes: {presentation['reasoning']['confidence'].get('notes')}")

lines.append("")
lines.append("LABELS:")
for l in presentation["labels"]:
    lines.append(f"  [{l.upper()}]")

text_output = "\n".join(lines)

# -----------------------------
# Write outputs
# -----------------------------
with open(OUT_TEXT, "w") as f:
    f.write(text_output)

with open(OUT_JSON, "w") as f:
    json.dump(presentation, f, indent=2)

print("\n[∞] Presentation complete")
print(f"[∞] Output (text): {OUT_TEXT}")
print(f"[∞] Output (json): {OUT_JSON}\n")
