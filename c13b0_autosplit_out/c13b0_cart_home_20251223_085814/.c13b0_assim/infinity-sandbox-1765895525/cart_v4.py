#!/data/data/com.termux/files/usr/bin/python3
import os
import json

ZIP_DIR = "pewpi-infinity/z/zipcoins"

def load_zipcoins():
    """Load all zipcoin folders and validate their meta.json."""
    coins = []
    if not os.path.isdir(ZIP_DIR):
        print(f"[CROSSLINK ERROR] Missing ZIP_DIR: {ZIP_DIR}")
        return coins

    for name in sorted(os.listdir(ZIP_DIR)):
        path = os.path.join(ZIP_DIR, name)
        if not os.path.isdir(path) or not name.startswith("zip_coin_"):
            continue

        meta_path = os.path.join(path, "meta.json")
        if not os.path.isfile(meta_path):
            print(f"[CROSSLINK ERROR] No meta.json in {name}")
            continue

        try:
            with open(meta_path, "r", encoding="utf-8", errors="ignore") as f:
                meta = json.load(f)
        except Exception as e:
            print(f"[CROSSLINK ERROR] Could not read meta.json in {name}: {e}")
            continue

        # REQUIRED FIELDS
        if "coin_id" not in meta:
            print(f"[CROSSLINK ERROR] Bad meta.json in {name}: missing 'coin_id'")
            continue

        coins.append({
            "folder": name,
            "path": path,
            "id": meta["coin_id"]
        })

    return coins


def apply_crosslinks(coins):
    """Add next/prev navigation + HTML header/footer into compiled.html."""
    total = len(coins)
    if total == 0:
        print("[CROSSLINK] No valid zipcoins found.")
        return

    for i, coin in enumerate(coins):
        compiled_html_path = os.path.join(coin["path"], "compiled.html")
        if not os.path.isfile(compiled_html_path):
            print(f"[CROSSLINK WARNING] No compiled.html for {coin['id']}")
            continue

        try:
            with open(compiled_html_path, "r", encoding="utf-8", errors="ignore") as f:
                html = f.read()
        except:
            print(f"[CROSSLINK ERROR] Cannot read compiled.html for {coin['id']}")
            continue

        prev_coin = coins[i - 1]["id"] if i > 0 else None
        next_coin = coins[i + 1]["id"] if i < total - 1 else None

        nav_html = "<div style='margin-top:20px;'>"
        if prev_coin:
            nav_html += f"<a href='../{prev_coin}/compiled.html'>⬅ Previous</a> | "
        nav_html += f"<b>{coin['id']}</b>"
        if next_coin:
            nav_html += f" | <a href='../{next_coin}/compiled.html'>Next ➡</a>"
        nav_html += "</div>"

        html = html.replace("</body>", nav_html + "</body>")

        try:
            with open(compiled_html_path, "w", encoding="utf-8", errors="ignore") as f:
                f.write(html)
        except:
            print(f"[CROSSLINK ERROR] Cannot write compiled.html for {coin['id']}")
            continue

        print(f"[CROSSLINK] Linked {coin['id']}")

    print("[CROSSLINK] All zipcoins linked.")


def main():
    print("[CROSSLINK] Loading zipcoins...")
    coins = load_zipcoins()
    if not coins:
        print("[CROSSLINK] No zipcoins to link.")
        return

    apply_crosslinks(coins)


if __name__ == "__main__":
    main()
