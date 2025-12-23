#!/usr/bin/env python3

import uuid
from datetime import datetime
import random

BRUNO_ID = "BRUNO-" + str(uuid.uuid4())[:8]

BRUNO_TONES = [
    "skeptical",
    "annoyed",
    "mocking",
    "probing",
    "dry"
]

def bruno_react(payload):
    tone = random.choice(BRUNO_TONES)
    text = payload.get("text", "")

    response = {
        "id": str(uuid.uuid4()),
        "actor": "Bruno",
        "tone": tone,
        "timestamp": datetime.utcnow().isoformat(),
        "response": generate_response(tone, text)
    }

    return response

def generate_response(tone, text):
    if tone == "skeptical":
        return "You sure that holds up when you strip the polish off it?"
    if tone == "annoyed":
        return "This is the part where people pretend this makes sense."
    if tone == "mocking":
        return "Bold claim. Weak spine."
    if tone == "probing":
        return "What breaks first if this is pushed hard?"
    if tone == "dry":
        return "Interesting. Not convinced."

    return "..."

def bruno_execute(payload):
    reaction = bruno_react(payload)
    print(reaction)
    return reaction

if __name__ == "__main__":
    sample = {
        "text": "System growth trend shows process flow over time."
    }
    bruno_execute(sample)
