# cart024_quantum_transport.py
"""
Cart 024: Quantum Transport (digital-to-physical bridge)
Models quantum transport using tight-binding Green's functions and Landauer conductance,
then maps the digital parameters to physical interpretations so device tuning is grounded.

Purpose in Infinity:
- Provide a safe, computational “quantum rides” researcher: explore transport digitally first
- Connect device parameters to physical adjustments (length, disorder, contacts, temperature)
- Produce artifacts you can index in the SPA and feed into engineering/components carts

Core concepts:
- Tight-binding Hamiltonian for a 1D device region
- Self-energies for left/right leads (contact quality via Γ)
- Transmission T(E) from Green’s function: T(E) = Tr[Γ_L G^r Γ_R G^a]
- Landauer conductance: G = (2e^2/h) * T(E_F)
- Current under small bias: I ≈ G * V (linear response), or finite-bias integral with Fermi weights

Artifacts:
- JSON files under artifacts/ with spectra, conductance, and I–V estimates
- JSONL audit logs under logs/

CLI:
  python cart024_quantum_transport.py spectrum --N 50 --t -1.0 --eps 0.0 --gammaL 0.5 --gammaR 0.5 --Emin -3 --Emax 3 --steps 200 --eta 1e-3
  python cart024_quantum_transport.py conductance --N 50 --t -1.0 --eps 0.0 --gammaL 0.5 --gammaR 0.5 --Ef 0.0 --eta 1e-3
  python cart024_quantum_transport.py iv --N 50 --t -1.0 --eps 0.0 --gammaL 0.5 --gammaR 0.5 --Ef 0.0 --Vmin -0.1 --Vmax 0.1 --steps 21 --eta 1e-3
  python cart024_quantum_transport.py sweep --param gammaL --vals 0.1,0.2,0.5,1.0 --N 50 --t -1.0 --eps 0.0 --gammaR 0.5 --Ef 0.0
"""

import sys, os, json, time, math
from typing import Dict, Any, List, Tuple

# ---------- Paths ----------
ROOT = os.path.dirname(os.path.abspath(__file__))
LOGS = os.path.join(ROOT, "logs")
ART = os.path.join(ROOT, "artifacts")
os.makedirs(LOGS, exist_ok=True)
os.makedirs(ART, exist_ok=True)
AUDIT = os.path.join(LOGS, "quantum_transport_audit.jsonl")

# ---------- Constants (SI-like where needed, normalized otherwise) ----------
E_CHARGE = 1.602176634e-19  # C
H_PLANCK = 6.62607015e-34   # J*s
HBAR = H_PLANCK / (2.0 * math.pi)
G0 = 2.0 * (E_CHARGE**2) / H_PLANCK  # Quantum of conductance (≈ 7.748e-5 S)

def audit(entry: Dict[str, Any]) -> None:
    entry = dict(entry)
    entry["t"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    with open(AUDIT, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

def save_artifact(name: str, obj: Dict[str, Any]) -> str:
    path = os.path.join(ART, f"{name}.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return path

# ---------- Linear algebra helpers (small N: pure Python) ----------
def zeros(n: int) -> List[List[complex]]:
    return [[0.0+0.0j for _ in range(n)] for _ in range(n)]

def eye(n: int) -> List[List[complex]]:
    M = zeros(n)
    for i in range(n):
        M[i][i] = 1.0+0.0j
    return M

def mat_add(A, B):
    n = len(A)
    return [[A[i][j] + B[i][j] for j in range(n)] for i in range(n)]

def mat_sub(A, B):
    n = len(A)
    return [[A[i][j] - B[i][j] for j in range(n)] for i in range(n)]

def mat_mul(A, B):
    n = len(A)
    C = zeros(n)
    for i in range(n):
        for k in range(n):
            aik = A[i][k]
            if aik != 0:
                for j in range(n):
                    C[i][j] += aik * B[k][j]
    return C

def mat_dag(A):
    n = len(A)
    return [[A[j][i].conjugate() for j in range(n)] for i in range(n)]

def mat_trace(A) -> complex:
    return sum(A[i][i] for i in range(len(A)))

def mat_scalar_add(A, s: complex):
    n = len(A)
    return [[A[i][j] + (s if i == j else 0.0) for j in range(n)] for i in range(n)]

def mat_scalar_mul(A, s: complex):
    n = len(A)
    return [[A[i][j] * s for j in range(n)] for i in range(n)]

def inv_gauss_jordan(A: List[List[complex]]) -> List[List[complex]]:
    n = len(A)
    # Augment with identity
    aug = [row[:] + eye(n)[i] for i, row in enumerate(A)]
    # Row operations
    for col in range(n):
        # Pivot
        pivot = col
        for r in range(col, n):
            if abs(aug[r][col]) > abs(aug[pivot][col]):
                pivot = r
        if abs(aug[pivot][col]) == 0:
            raise ValueError("Singular matrix")
        aug[col], aug[pivot] = aug[pivot], aug[col]
        # Normalize
        pivval = aug[col][col]
        for c in range(2*n):
            aug[col][c] /= pivval
        # Eliminate
        for r in range(n):
            if r != col:
                factor = aug[r][col]
                for c in range(2*n):
                    aug[r][c] -= factor * aug[col][c]
    # Extract inverse
    inv = [row[n:] for row in aug]
    return inv

# ---------- Tight-binding device region ----------
def h_device(N: int, t: float, eps: float, disorder: float = 0.0) -> List[List[complex]]:
    """
    Build the device Hamiltonian:
    - N: number of sites (length)
    - t: nearest-neighbor hopping (energy units)
    - eps: onsite energy baseline
    - disorder: random onsite variation amplitude (simulates impurities)
    Physical mapping:
      N → length; increasing N increases scattering and path length
      t → band dispersion; |t| relates to material bandwidth/overlap
      eps → alignment; shifts device band relative to Fermi level
      disorder → material quality; higher means more inhomogeneity
    """
    import random
    H = zeros(N)
    for i in range(N):
        d = (random.uniform(-disorder, disorder) if disorder > 0 else 0.0)
        H[i][i] = complex(eps + d, 0.0)
    for i in range(N-1):
        H[i][i+1] = complex(t, 0.0)
        H[i+1][i] = complex(t, 0.0)
    return H

# ---------- Lead self-energies (wide-band approximation) ----------
def self_energy(N: int, gammaL: float, gammaR: float) -> Tuple[List[List[complex]], List[List[complex]]]:
    """
    Γ encodes contact quality:
    - gammaL, gammaR: coupling strengths (broaden device edge states)
    Physical mapping:
      Higher gamma → better contact (lower interface resistance), up to saturation.
      Asymmetry (gammaL != gammaR) can limit transmission even if device is clean.
    """
    SigmaL = zeros(N)
    SigmaR = zeros(N)
    SigmaL[0][0] = complex(0.0, -gammaL/2.0)
    SigmaR[N-1][N-1] = complex(0.0, -gammaR/2.0)
    return SigmaL, SigmaR

def gamma_from_sigma(Sigma):
    # Γ = i(Σ - Σ†)
    return mat_scalar_mul(mat_sub(Sigma, mat_dag(Sigma)), 1j)

# ---------- Green's function and transmission ----------
def greens_function(E: float, H, SigmaL, SigmaR, eta: float) -> List[List[complex]]:
    """
    G^r(E) = [ (E + iη)I - H - Σ_L - Σ_R ]^{-1}
    η (small positive) represents temperature/broadening.
    Physical mapping:
      η → thermal/environmental decoherence; higher spreads resonances and reduces peak T(E).
    """
    N = len(H)
    M = mat_scalar_add(eye(N), complex(E, eta))
    M = mat_sub(M, H)
    M = mat_sub(M, SigmaL)
    M = mat_sub(M, SigmaR)
    return inv_gauss_jordan(M)

def transmission(E: float, H, SigmaL, SigmaR, eta: float) -> float:
    Gr = greens_function(E, H, SigmaL, SigmaR, eta)
    Ga = mat_dag(Gr)
    GammaL = gamma_from_sigma(SigmaL)
    GammaR = gamma_from_sigma(SigmaR)
    # T(E) = Tr[Γ_L G^r Γ_R G^a]
    A = mat_mul(GammaL, Gr)
    B = mat_mul(GammaR, Ga)
    Tmat = mat_mul(A, B)
    T = mat_trace(Tmat)
    return float(T.real)

# ---------- Conductance and I–V ----------
def conductance_at_ef(EF: float, H, SigmaL, SigmaR, eta: float) -> float:
    """
    G = G0 * T(EF)
    """
    Tef = transmission(EF, H, SigmaL, SigmaR, eta)
    return G0 * Tef

def iv_linear(EF: float, H, SigmaL, SigmaR, eta: float, Vlist: List[float]) -> List[Dict[str, float]]:
    """
    Linear-response I ≈ G(EF) * V for small biases.
    Physical mapping:
      EF alignment (via eps) impacts conductance; contact asymmetry limits I.
    """
    G = conductance_at_ef(EF, H, SigmaL, SigmaR, eta)
    return [{"V": v, "I_A": G * v} for v in Vlist]

# ---------- Spectrum ----------
def spectrum(Emin: float, Emax: float, steps: int, H, SigmaL, SigmaR, eta: float) -> List[Dict[str, float]]:
    Es = [Emin + i*(Emax - Emin)/(steps - 1) for i in range(steps)]
    rows = [{"E": round(E,6), "T": max(0.0, transmission(E, H, SigmaL, SigmaR, eta))} for E in Es]
    return rows

# ---------- Sensitivity sweep ----------
def sweep_param(param: str, values: List[float], base: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Sweeps a parameter and reports conductance at EF.
    Parameters include: N, t, eps, disorder, gammaL, gammaR, eta, EF
    """
    out = []
    for v in values:
        cfg = dict(base)
        cfg[param] = v
        H = h_device(cfg["N"], cfg["t"], cfg["eps"], cfg.get("disorder", 0.0))
        SL, SR = self_energy(cfg["N"], cfg["gammaL"], cfg["gammaR"])
        G = conductance_at_ef(cfg["EF"], H, SL, SR, cfg["eta"])
        out.append({"param": param, "value": v, "G_Siemens": G})
    return out

# ---------- Digital-to-physical annotation ----------
def annotate_physical(cfg: Dict[str, Any]) -> Dict[str, str]:
    return {
        "length_sites": f"{cfg['N']} (increase → longer device, more scattering)",
        "hopping_t": f"{cfg['t']} (bandwidth/overlap; |t| larger → wider band)",
        "onsite_eps": f"{cfg['eps']} (alignment to EF; shift bands to tune resonances)",
        "disorder": f"{cfg.get('disorder',0.0)} (material quality; higher → more inhomogeneity)",
        "gammaL": f"{cfg['gammaL']} (left contact quality; higher → better coupling)",
        "gammaR": f"{cfg['gammaR']} (right contact quality; symmetry matters)",
        "eta": f"{cfg['eta']} (thermal/environment broadening; higher → broader peaks)",
        "EF": f"{cfg['EF']} (Fermi level; choose near band center for maximal transmission)"
    }

# ---------- CLI ----------
def parse_args(args: List[str]) -> Dict[str, Any]:
    kv = {"N": 50, "t": -1.0, "eps": 0.0, "disorder": 0.0, "gammaL": 0.5, "gammaR": 0.5, "eta": 1e-3, "EF": 0.0,
          "Emin": -3.0, "Emax": 3.0, "steps": 201, "Vmin": -0.1, "Vmax": 0.1, "Vsteps": 21}
    i = 0
    while i < len(args):
        a = args[i]
        if a.startswith("--") and i+1 < len(args):
            key = a[2:]
            val = args[i+1]
            try:
                kv[key] = float(val) if key not in ("N","steps","Vsteps") else int(val)
            except:
                kv[key] = val
            i += 2
        else:
            i += 1
    return kv

def cmd_spectrum(kv):
    H = h_device(int(kv["N"]), float(kv["t"]), float(kv["eps"]), float(kv.get("disorder", 0.0)))
    SL, SR = self_energy(int(kv["N"]), float(kv["gammaL"]), float(kv["gammaR"]))
    rows = spectrum(float(kv["Emin"]), float(kv["Emax"]), int(kv["steps"]), H, SL, SR, float(kv["eta"]))
    art = {"cfg": kv, "physical": annotate_physical(kv), "rows": rows}
    path = save_artifact(f"qt_spectrum_{int(time.time())}", art)
    audit({"action": "spectrum", "count": len(rows)})
    print(json.dumps({"ok": True, "path": path, "points": len(rows)}, indent=2))

def cmd_conductance(kv):
    H = h_device(int(kv["N"]), float(kv["t"]), float(kv["eps"]), float(kv.get("disorder", 0.0)))
    SL, SR = self_energy(int(kv["N"]), float(kv["gammaL"]), float(kv["gammaR"]))
    G = conductance_at_ef(float(kv["EF"]), H, SL, SR, float(kv["eta"]))
    art = {"cfg": kv, "physical": annotate_physical(kv), "G_Siemens": G}
    path = save_artifact(f"qt_conductance_{int(time.time())}", art)
    audit({"action": "conductance", "G": G})
    print(json.dumps({"ok": True, "path": path, "G_Siemens": G}, indent=2))

def cmd_iv(kv):
    Vlist = [kv["Vmin"] + i*(kv["Vmax"] - kv["Vmin"])/(int(kv["Vsteps"]) - 1) for i in range(int(kv["Vsteps"]))]
    H = h_device(int(kv["N"]), float(kv["t"]), float(kv["eps"]), float(kv.get("disorder", 0.0)))
    SL, SR = self_energy(int(kv["N"]), float(kv["gammaL"]), float(kv["gammaR"]))
    rows = iv_linear(float(kv["EF"]), H, SL, SR, float(kv["eta"]), Vlist)
    art = {"cfg": kv, "physical": annotate_physical(kv), "rows": rows}
    path = save_artifact(f"qt_iv_{int(time.time())}", art)
    audit({"action": "iv", "points": len(rows)})
    print(json.dumps({"ok": True, "path": path, "points": len(rows)}, indent=2))

def cmd_sweep(args, kv):
    # parse --param and --vals
    param = None; vals = []
    for i, a in enumerate(args):
        if a == "--param" and i+1 < len(args): param = args[i+1]
        if a == "--vals" and i+1 < len(args): vals = [float(x) for x in args[i+1].split(",")]
    if not param or not vals:
        print(json.dumps({"error": "Provide --param and --vals"}, indent=2)); return
    base = {k: float(v) if k not in ("N","steps","Vsteps") else int(v) for k,v in kv.items()}
    rows = sweep_param(param, vals, base)
    art = {"base": base, "param": param, "rows": rows, "physical": annotate_physical(base)}
    path = save_artifact(f"qt_sweep_{param}_{int(time.time())}", art)
    audit({"action": "sweep", "param": param, "count": len(rows)})
    print(json.dumps({"ok": True, "path": path, "points": len(rows)}, indent=2))

def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: spectrum [...] | conductance [...] | iv [...] | sweep --param X --vals v1,v2,... [...]")
        print("Core params: --N --t --eps --disorder --gammaL --gammaR --eta --Ef")
        return
    cmd = args[0]
    kv = parse_args(args[1:])
    if cmd == "spectrum":
        cmd_spectrum(kv); return
    if cmd == "conductance":
        cmd_conductance(kv); return
    if cmd == "iv":
        cmd_iv(kv); return
    if cmd == "sweep":
        cmd_sweep(args[1:], kv); return
    print("Unknown command.")

if __name__ == "__main__":
    main()