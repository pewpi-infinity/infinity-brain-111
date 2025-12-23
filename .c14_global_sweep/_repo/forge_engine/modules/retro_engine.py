from forge_engine.modules import *
import random

RETRO = [
    "NES Power-Up Vector",
    "Atari Pixel-Flux Beam",
    "SNES Mode-7 Warp",
    "Sega Genesis Harmonic Spin",
    "GameBoy Quantum Dot",
    "PlayStation DualShock Tensor Field"
]

def retro_power():
    return random.choice(RETRO)
