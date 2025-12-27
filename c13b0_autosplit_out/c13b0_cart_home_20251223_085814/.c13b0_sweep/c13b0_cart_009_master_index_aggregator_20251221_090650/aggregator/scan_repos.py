import subprocess, json, pathlib

ORG = "pewpi-infinity"
out = []

repos = subprocess.check_output(
    ["gh", "repo", "list", ORG, "--limit", "200", "--json", "name,url"],
    text=True
)
repos = json.loads(repos)

for r in repos:
    name = r["name"]
    if not name.startswith("c13b0_cart_"):
        continue

    out.append({
        "repo": name,
        "url": r["url"]
    })

pathlib.Path("output").mkdir(exist_ok=True)
pathlib.Path("output/repos.json").write_text(
    json.dumps(out, indent=2)
)

print(f"🧱 Found {len(out)} C13B0 carts")
