#!/usr/bin/env python3

import uuid
from datetime import datetime

SESSION_ID = str(uuid.uuid4())

PORTS = {
    "main_stage": [],
    "side_panel": [],
    "overlay": [],
    "footer": []
}

PLATFORMS = {
    "youtube": "archive",
    "tiktok": "short",
    "x": "signal",
    "site": "spa"
}

STATE = {
    "session": SESSION_ID,
    "log": [],
    "signals": {}
}

def parse(cmd):
    parts = cmd.strip().split()
    return {
        "platforms": [p.replace("/", "") for p in parts if p.replace("/", "") in PLATFORMS],
        "push": "/push" in parts,
        "pull": "/pull" in parts
    }

def detect_media(text):
    needs = []
    t = text.lower()
    if any(k in t for k in ["trend", "growth", "%", "compare"]):
        needs.append("graph")
    if any(k in t for k in ["flow", "system", "process"]):
        needs.append("simulation")
    if len(t.split()) > 120:
        needs.append("video")
    return list(set(needs))

def mount(port, payload):
    if port not in PORTS:
        port = "main_stage"
    PORTS[port].append(payload)
    STATE["log"].append({
        "time": datetime.utcnow().isoformat(),
        "action": "mount",
        "port": port,
        "id": payload["id"]
    })

def pull(platform):
    STATE["signals"][platform] = {
        "time": datetime.utcnow().isoformat(),
        "status": "pulled"
    }

def push(platform, payload):
    STATE["log"].append({
        "time": datetime.utcnow().isoformat(),
        "action": "push",
        "platform": platform,
        "id": payload["id"]
    })

def execute(command, text):
    parsed = parse(command)
    media = detect_media(text)

    output = {
        "id": str(uuid.uuid4()),
        "text": text,
        "media": media,
        "time": datetime.utcnow().isoformat()
    }

    mount("main_stage", output)

    for m in media:
        mount("side_panel", {
            "id": str(uuid.uuid4()),
            "type": m,
            "source": output["id"]
        })

    if parsed["pull"]:
        for p in parsed["platforms"]:
            pull(p)

    if parsed["push"]:
        for p in parsed["platforms"]:
            push(p, output)

    return output

if __name__ == "__main__":
    cmd = "/youtube /push"
    txt = "System growth trend shows process flow over time."
    print(execute(cmd, txt))
