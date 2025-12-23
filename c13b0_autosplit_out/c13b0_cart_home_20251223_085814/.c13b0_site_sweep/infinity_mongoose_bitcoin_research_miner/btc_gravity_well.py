#!/usr/bin/env python3
import random, time, math
from rich.console import Console
from rich.live import Live
from rich.text import Text

console = Console()

WIDTH = 60
HEIGHT = 20
CENTER = WIDTH // 2

def get_pressure():
    # Placeholder — wire real data later
    return random.uniform(0.3, 1.2)

def frame(pressure):
    t = Text()
    well_radius = int(pressure * 8)

    for y in range(HEIGHT):
        for x in range(WIDTH):
            dist = abs(x - CENTER)
            if dist < well_radius:
                t.append("●", style="purple")
            elif dist < well_radius + 2:
                t.append("•", style="yellow")
            else:
                t.append("·", style="green")
        t.append("\n")

    t.append(f"\nPressure: {pressure:.2f}", style="bold white")
    return t

def main():
    with Live(console=console, refresh_per_second=10) as live:
        while True:
            pressure = get_pressure()
            live.update(frame(pressure))
            time.sleep(0.15)

if __name__ == "__main__":
    main()
