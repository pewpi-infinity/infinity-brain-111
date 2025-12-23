#!/usr/bin/env python3
"""
Cart 003: Computers Module
Infinity OS hardware + compute estimators.

Features:
- CPU FLOP/s estimate
- GPU compute estimate
- Memory bandwidth
- Storage IOPS + latency model
- Combined synthetic benchmark
- JSON artifact output
"""

import os, json, sys, math, time
from typing import Dict, Any

ROOT = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(ROOT, "logs", "computers_audit.jsonl")
OUT = os.path.join(ROOT, "artifacts")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.dirname(LOG), exist_ok=True)


def audit(entry: Dict[str, Any]):
    entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")


# ---------- CPU ----------
def cpu_flops(cores: int, freq_ghz: float, ops_per_cycle: int = 8) -> float:
    """Simple FLOPs = cores * freq * ops_per_cycle"""
    return cores * freq_ghz * 1e9 * ops_per_cycle


# ---------- GPU ----------
def gpu_compute(cu: int, freq_ghz: float, shaders_per_cu: int = 64) -> float:
    """Rough GPU TFLOPS estimate."""
    flops = cu * shaders_per_cu * freq_ghz * 1e9 * 2
    return flops / 1e12  # convert to TFLOPS


# ---------- Memory ----------
def memory_bandwidth(bus_width_bits: int, freq_mhz: float, ddr_multiplier: int = 2) -> float:
    """
    BW = (bus_width / 8) * freq * multiplier
    returns GB/s
    """
    return (bus_width_bits / 8) * freq_mhz * 1e6 * ddr_multiplier / 1e9


# ---------- Storage ----------
def storage_iops(rpm: int, queue_depth: int = 1) -> float:
    """Very rough model for HDD/SSD latency → IOPS."""
    rot_latency = 60 / rpm  # seconds per rotation
    iops = queue_depth / rot_latency
    return iops


# ---------- Synthetic Benchmark ----------
def synthetic_bench(cpu, gpu, mem, storage):
    """Weighted aggregate benchmark score."""
    return (cpu / 1e12) * 0.4 + gpu * 0.3 + (mem / 100) * 0.2 + (storage / 1000) * 0.1


def save_artifact(name: str, obj: Dict[str, Any]) -> str:
    path = os.path.join(OUT, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return path


def main():
    args = sys.argv[1:]

    if not args:
        # default demo bundle
        result = {
            "cpu_flops": cpu_flops(8, 3.5),
            "gpu_tflops": gpu_compute(20, 1.5),
            "memory_bw": memory_bandwidth(128, 1600),
            "storage_iops": storage_iops(7200),
        }
        result["synthetic_score"] = synthetic_bench(
            result["cpu_flops"],
            result["gpu_tflops"],
            result["memory_bw"],
            result["storage_iops"],
        )

        audit({"action": "bundle"})
        out = save_artifact("computers_bundle", result)
        print(json.dumps(result, indent=2))
        print("Saved:", out)
        return

    audit({"action": "cli", "args": args})
    print("No CLI implemented yet.")
    return


if __name__ == "__main__":
    main()
