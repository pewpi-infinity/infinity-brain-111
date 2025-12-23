#!/usr/bin/env python3
import os, datetime, json

COLOR_MAP = {
    "YELLOW": "data",
    "PURPLE": "direct",
    "GREEN": "tools",
    "ORANGE": "business",
    "PINK": "investigation",
    "RED": "adjacent",
    "BLUE": "payment"
}

DAILY_LIMIT = 48
LOG_FILE = "link_click_log.json"

def load_log():
    if not os.path.exists(LOG_FILE):
        return {"date": "", "count": 0}
    return json.load(open(LOG_FILE))

def save_log(log):
    with open(LOG_FILE, "w") as f:
        json.dump(log, f)

def mint_token(source, topic, color):
    now = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = f"CLICK_TOKEN_{source}_{topic.replace(' ','_')}_{now}.txt"

    with open(filename, "w") as f:
        f.write(f"Source: {source}\n")
        f.write(f"Topic: {topic}\n")
        f.write(f"Color: {color}\n")
        f.write(f"Meaning: {COLOR_MAP[color]}\n")
        f.write(f"Birth: {now}\n")

    print(f"[∞] Minted: {filename}")

def click_link(source, topic, color):
    log = load_log()
    today = datetime.date.today().isoformat()

    if log["date"] != today:
        log["date"] = today
        log["count"] = 0

    if log["count"] >= DAILY_LIMIT:
        print("[∞] Daily token payout limit reached (48).")
        print("[∞] Token will be queued for next-day release.")
        return

    mint_token(source, topic, color)
    log["count"] += 1
    save_log(log)
