#!/usr/bin/env python3
# ∞ Cart 002 – Engineering Module (Repaired & Clean)

"""
Infinity Engineering Module
Provides:
- Structural: beam bending, deflection, buckling, torsion
- Fluids: hydrostatic pressure, Reynolds, Darcy–Weisbach
- Thermo: thermal expansion, conduction, convection, TEG estimate
- Electrical: ohm’s law, RC/LC values
- Solver: sweeps for engineering studies
- CLI for engineering calculators
- JSON artifacts + JSONL audit log
"""

import os, json, math, sys, time
from typing import Dict, Any, List

ROOT = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(ROOT, "data")
LOGS_DIR = os.path.join(ROOT, "logs")
OUT_DIR = os.path.join(ROOT, "artifacts")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(OUT_DIR, exist_ok=True)

AUDIT = os.path.join(LOGS_DIR, "engineering_audit.jsonl")

def audit(entry: Dict[str, Any]):
    entry = dict(entry)
    entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

# ===============================================================
#               UNIT CONVERSIONS
# ===============================================================

class Units:
    @staticmethod
    def mm_to_m(mm): return mm / 1000.0

    @staticmethod
    def cm2_to_m2(cm2): return cm2 / 10000.0

    @staticmethod
    def N_to_kN(N): return N / 1000.0

    @staticmethod
    def C_to_K(C): return C + 273.15


# ===============================================================
#               STRUCTURAL ENGG
# ===============================================================

def beam_bending_stress(M, c, I):
    return M * c / I

def beam_deflection_uniform_load(w, L, E, I):
    return (5 * w * L**4) / (384 * E * I)

def euler_buckling_load(E, I, K, L):
    return (math.pi**2 * E * I) / ((K * L)**2)

def shaft_torsion_theta(T, L, J, G):
    return (T * L) / (J * G)


# ===============================================================
#               FLUIDS
# ===============================================================

def hydrostatic_pressure(rho, h, g=9.81):
    return rho * g * h

def reynolds_number(rho, v, D, mu):
    return (rho * v * D) / mu

def darcy_head_loss(f, L, D, v, g=9.81):
    return f * (L / D) * (v**2) / (2 * g)


# ===============================================================
#               THERMO / HEAT
# ===============================================================

def thermal_expansion(L0, alpha, dT):
    return L0 * alpha * dT

def conduction_heat_flux(k, A, dT, dx):
    return k * A * dT / dx

def convection_heat_flux(h, A, dT):
    return h * A * dT

def teg_power_estimate(dT, seebeck, internal_R, load_R):
    V = seebeck * dT
    I = V / (internal_R + load_R)
    return (I**2) * load_R


# ===============================================================
#               ELECTRICAL
# ===============================================================

def ohms_law(V=None, I=None, R=None):
    if V is None: V = I * R
    if I is None: I = V / R
    if R is None: R = V / I
    return {"V": V, "I": I, "R": R}

def rc_time_constant(R, C):
    return R * C

def lc_resonant_freq(L, C):
    return 1 / (2 * math.pi * math.sqrt(L * C))


# ===============================================================
#               SOLVER / SWEEP
# ===============================================================

def sweep(func, param_name, values, fixed_kwargs):
    out = []
    for val in values:
        kw = dict(fixed_kwargs)
        kw[param_name] = val
        try:
            result = func(**kw)
        except Exception as e:
            result = f"error: {e}"
        out.append({"param": param_name, "value": val, "result": result})
    return out


# ===============================================================
#               ARTIFACT WRITER
# ===============================================================

def save_artifact(name, obj):
    path = os.path.join(OUT_DIR, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return path


# ===============================================================
#               DEMO BUNDLE
# ===============================================================

def example_bundle():
    E = 200e9
    I_beam = 8.1e-6
    L = 2.0
    w = 1500.0
    c = 0.05

    sigma = beam_bending_stress(w*L, c, I_beam)
    delta = beam_deflection_uniform_load(w, L, E, I_beam)
    buck = euler_buckling_load(E, I_beam, 1.0, L)

    rho = 998.0
    v = 1.5
    D = 0.05
    mu = 1e-3
    Re = reynolds_number(rho, v, D, mu)
    head = darcy_head_loss(0.02, 50.0, D, v)

    deltaL = thermal_expansion(1.0, 12e-6, 60)
    q_cond = conduction_heat_flux(205, 0.01, 40, 0.02)
    q_conv = convection_heat_flux(25, 0.01, 30)
    Pteg = teg_power_estimate(100, 0.2e-3, 2, 4)

    ohm = ohms_law(12.0, None, 6.0)
    tau = rc_time_constant(1000, 1e-6)
    flc = lc_resonant_freq(10e-3, 100e-9)

    return {
        "structural": {"beam_stress": sigma, "beam_deflection": delta, "buckling_load": buck},
        "fluids": {"Re": Re, "head_loss": head},
        "thermo": {"deltaL": deltaL, "q_cond": q_cond, "q_conv": q_conv, "P_teg": Pteg},
        "electrical": {"ohms": ohm, "tau_rc": tau, "f_lc": flc}
    }


# ===============================================================
#               MAIN EXECUTION
# ===============================================================

def main():
    args = sys.argv[1:]

    if not args:
        audit({"action": "bundle"})
        result = example_bundle()
        path = save_artifact("engineering_bundle", result)
        print(json.dumps(result, indent=2))
        print(f"Saved: {path}")
        return

    cmd = args[0]
    audit({"action": "cli", "cmd": cmd})

    try:
        if cmd == "beam":
            M, c, I = map(float, args[1:4])
            print(json.dumps({"sigma": beam_bending_stress(M, c, I)}, indent=2))

        elif cmd == "fluid":
            rho, h = map(float, args[1:3])
            print(json.dumps({"p": hydrostatic_pressure(rho, h)}, indent=2))

        elif cmd == "reynolds":
            rho, v, D, mu = map(float, args[1:5])
            print(json.dumps({"Re": reynolds_number(rho, v, D, mu)}, indent=2))

        elif cmd == "teg":
            dT, S, Rint, Rload = map(float, args[1:5])
            print(json.dumps({"P": teg_power_estimate(dT, S, Rint, Rload)}, indent=2))

        elif cmd == "sweep":
            vals = [20, 40, 60, 80, 100]
            fixed = {"seebeck": 0.2e-3, "internal_R": 2, "load_R": 4}
            rows = sweep(lambda dT, seebeck, internal_R, load_R: 
                         teg_power_estimate(dT, seebeck, internal_R, load_R),
                         "dT", vals, fixed)
            path = save_artifact("teg_sweep", {"rows": rows})
            print(f"Sweep saved: {path}")

        else:
            print("Unknown subcommand")

    except Exception as e:
        audit({"action": "error", "msg": str(e)})
        print("Error:", e)


if __name__ == "__main__":
    main()
