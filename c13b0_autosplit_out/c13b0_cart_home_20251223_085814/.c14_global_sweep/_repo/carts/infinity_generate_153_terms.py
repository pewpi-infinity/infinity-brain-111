#!/usr/bin/env python3
import os, sys, random

OUTDIR = "generated_153_term_carts"
os.makedirs(OUTDIR, exist_ok=True)

# --- If no base word provided, stop ---
if len(sys.argv) < 2:
    print("Usage: python3 infinity_generate_153_terms.py <base_word>")
    sys.exit(0)

base = sys.argv[1].strip().lower()

mods = [
    "frequency", "phase shift", "density", "potential", "matrix", "operator",
    "equation", "stability", "instability", "lattice", "flux", "entropy",
    "invariant", "scalar", "vector", "tensor", "collapse", "resonance",
    "transition", "boundary", "critical point", "periodic", "aperiodic",
    "non linear", "linear", "chaotic", "non chaotic", "oscillation",
    "vibration", "harmonic", "superharmonic", "subharmonic",
    "dissipation", "emergence", "singularity", "continuum", "quantum",
    "relativistic", "fractal", "bifurcation", "mapping", "trajectory",
    "phase space", "chaos map", "order parameter", "scaling law",
    "logistic map", "soliton", "wavefront", "surface tension",
    "activation energy", "coherence", "superposition", "measurement",
    "system collapse", "macro scale", "micro scale", "nano scale",
    "astro scale", "cosmic", "stellar", "orbital", "planetary",
    "scripture", "parable", "wisdom", "harvest", "seed", "sower",
    "reaper", "eternal life", "creation", "light", "breath", "spirit",
    "law", "covenant", "prophecy", "judgment", "kingdom", "mountain",
    "river", "wind", "fire", "earth", "heaven", "cosmos", "mass",
    "time", "length", "force", "charge", "energy", "current",
    "voltage", "resistance", "capacitance", "inductance", "field",
    "wave", "particle", "interaction", "coupling", "feedback",
    "signal", "modulation", "carrier", "quantization", "fault line",
    "equilibrium", "nonequilibrium", "steady state", "phase lock",
    "drift", "momentum", "density well", "charge cloud", "ionization",
    "fusion", "fission", "radiation", "absorption", "scattering",
    "conduction", "convection", "radiative transfer", "event horizon",
    "threshold", "null space", "eigenstate", "eigenmode", "dispersion",
    "attenuation", "coefficient", "rotation", "translation"
]

# Expand into EXACTLY 153 terms
terms = []
while len(terms) < 153:
    term = f"{base} {random.choice(mods)}"
    if term not in terms:
        terms.append(term)

filename = f"{OUTDIR}/cart_{base}_153.txt"

with open(filename, "w") as f:
    for t in terms:
        f.write(t + "\n")

os.system(f"git add '{filename}'")
os.system(f"git commit -m 'Generated 153-term cart for {base}'")
os.system("git push origin main")

print(f"✓ Generated → {filename}")
