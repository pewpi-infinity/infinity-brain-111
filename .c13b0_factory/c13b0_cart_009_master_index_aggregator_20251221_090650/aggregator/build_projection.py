import json, pathlib, datetime

repos = json.loads(pathlib.Path("output/repos.json").read_text())

lines = []
lines.append("## 🧱 C13B0 Ecosystem Index\n")
lines.append(
    "_This section is auto-generated. "
    "Each entry is a living brick in the ecosystem._\n"
)

for r in repos:
    lines.append(
        f"- **{r['repo']}** — "
        f"[repo]({r['url']})"
    )

out = pathlib.Path("output/ECOSYSTEM_INDEX.md")
out.write_text("\n".join(lines))

print("✅ Ecosystem projection index built")
