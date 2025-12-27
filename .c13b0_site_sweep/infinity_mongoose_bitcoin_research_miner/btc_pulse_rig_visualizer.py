#!/usr/bin/env python3
import time
import math
import random
from rich.console import Console
from rich.live import Live
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

console = Console()

def get_bitcoin_signals():
    # Placeholder signals (plug real data later)
    difficulty = random.uniform(6e13, 9e13)
    pool_pull = random.uniform(0.2, 1.0)
    efficiency = random.uniform(0.6, 1.0)
    return difficulty, pool_pull, efficiency

def render_frame(t):
    difficulty, pull, eff = get_bitcoin_signals()

    table = Table.grid(expand=True)
    table.add_column()
    table.add_column()

    # Geometry spinner
    spin = "◐◓◑◒"
    geom = spin[int(t) % len(spin)]

    # Color logic
    pull_color = "purple" if pull > 0.75 else "yellow" if pull > 0.5 else "green"
    eff_color = "cyan" if eff > 0.85 else "yellow"

    left = Text()
    left.append(f"\n {geom}  BITCOIN PULSE RIG\n", style="bold white")
    left.append(f"\n Difficulty:\n", style="white")
    left.append(f" {difficulty:,.0f}\n", style="bold cyan")

    left.append(f"\n Pool Pull:\n", style="white")
    left.append(f" {'█' * int(pull * 20)}\n", style=f"bold {pull_color}")

    left.append(f"\n Efficiency:\n", style="white")
    left.append(f" {'█' * int(eff * 20)}\n", style=f"bold {eff_color}")

    # Right logic / retarget brain
    decision = "HOLD"
    if pull > 0.75:
        decision = "🔥 BIG PULL — SCALE"
    elif pull > 0.5:
        decision = "⚡ RETARGET — HIT AGAIN"

    right = Panel.fit(
        Text(
            f"\n Decision Engine\n\n {decision}\n\n Time Slice: {t}\n",
            style="bold white"
        ),
        border_style="purple" if pull > 0.75 else "yellow"
    )

    table.add_row(left, right)
    return Panel(table, border_style="blue")

def main():
    t = 0
    with Live(render_frame(t), refresh_per_second=8, console=console) as live:
        while True:
            time.sleep(0.2)
            t += 1
            live.update(render_frame(t))

if __name__ == "__main__":
    main()
