from forge_engine.modules import *
import random

COLORS = [
    "🔮 PURPLE",
    "💚 GREEN",
    "💛 GOLD",
    "❤️ RED",
    "🔵 BLUE",
    "🟣 VIOLET",
    "🟠 ORANGE",
    "🟡 URANIUM",
    "⚪ STEEL",
    "🟤 BRONZE",
    "🌈 SPECTRUM"
]

def cycle_color():
    return random.choice(COLORS)
