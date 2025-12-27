#!/usr/bin/env python3
import os

CART_DIR = "search_term_carts"
os.makedirs(CART_DIR, exist_ok=True)

# 153-term categories:
CATEGORIES = {
    "equations": [
        "linear equation", "nonlinear equation", "differential equation",
        "second order", "fourier transform", "laplace transform",
        "hamiltonian", "eigenvalue", "eigenvector", "entropy",
        "boundary condition", "chaotic differential", "stability equation",
        "navier stokes", "schrodinger form", "perturbation", "stochastic form",
        "scalar operator", "vector operator", "tensor operator",
        "gradient", "divergence", "curl", "flux", "phase equation",
        "potential well", "harmonic oscillator", "quantum ladder",
        "spectral line", "lorentzian", "gaussian profile",
        "dispersion equation", "wave equation", "mass-energy equation",
        "lattice equation", "discrete map", "green’s function"
    ],

    "linear": [
        "linear stability", "linear feedback", "linear dynamic system",
        "linear frequency", "linear phase shift", "superposition principle",
        "linear drift", "linear response", "linear elasticity",
        "linear operator", "linear algebra", "linear circuit",
        "linear resonance", "linear density", "linear motion",
        "linear charge flow", "linear optics", "linear collapse"
    ],

    "nonlinear": [
        "nonlinear resonance", "nonlinear optics", "nonlinear drift",
        "bifurcation point", "logistic growth", "saddle-node",
        "pitchfork bifurcation", "duffing oscillator", "nonlinear circuit",
        "nonlinear elasticity", "nonlinear density", "soliton formation",
        "nonlinear refractive index", "chaos onset", "power law scaling",
        "nonlinear stability", "lyapunov boundary"
    ],

    "chaotic": [
        "chaos map", "lorenz attractor", "strange attractor", "chaotic drift",
        "chaotic bifurcation", "chaotic orbit", "edge of chaos",
        "period doubling", "topological entropy", "sensitive dependence",
        "chaotic manifold", "boundary chaos", "chaotic wave collapse",
        "chaotic diffusion", "mixing operator", "logistic chaos",
        "chaotic phase transition"
    ],

    "nonchaotic": [
        "fixed point", "stable orbit", "non chaotic regime",
        "ordered state", "harmonic mode", "equilibrium phase",
        "zero-entropy state", "periodic orbit", "predictable system",
        "linear invariant", "steady-state solution", "reversible state",
        "non-chaotic manifold", "smooth trajectory", "bounded dynamic"
    ],

    "bible": [
        "genesis seed", "exodus pattern", "leviticus order",
        "numbers census", "deuteronomy cycle", "psalm wave",
        "parable", "prophecy", "harvest", "sower", "reaper",
        "eternal life", "wisdom", "kingdom", "light", "covenant",
        "breath", "spirit", "law", "mountain", "desert", "rain",
        "dew", "river", "fire", "wind", "promise", "journey"
    ],

    "measurements": [
        "angstrom", "nanometer", "micron", "millimeter", "centimeter",
        "meter", "kilometer", "gram", "kilogram", "kelvin", "tesla",
        "gauss", "pascal", "watt", "joule", "ampere", "volt",
        "ohm", "henry", "farad", "mole", "candela"
    ],

    "scales": [
        "macro scale", "micro scale", "nano scale", "quantum scale",
        "astronomical scale", "atomic scale", "molecular scale",
        "stellar scale", "galactic scale", "supercluster scale"
    ],

    "systems": [
        "solar system", "feedback system", "control system",
        "quantum system", "gravitational system", "fluid system",
        "thermal system", "closed system", "open system",
        "harmonic system", "barycentric system", "electromagnetic system"
    ],

    "planets": [
        "mercury", "venus", "earth", "mars", "jupiter", "saturn",
        "uranus", "neptune", "pluto", "moon", "io", "europa", "ganymede",
        "callisto", "titan", "triton"
    ],

    "macro": [
        "supercluster", "galaxy", "nebula", "void", "cosmic filament",
        "stellar nursery", "accretion disk", "event horizon",
        "massive halo", "dark matter region"
    ],

    "micro": [
        "electron potential", "photon drift", "quark confinement",
        "neutrino oscillation", "proton spin", "meson exchange",
        "baryon density", "fermion cluster", "boson exchange"
    ],
}

# Guarantee each category has EXACTLY 153 terms
for name, base_terms in CATEGORIES.items():
    while len(base_terms) < 153:
        base_terms.append(f"{name}_auto_{len(base_terms)+1}")

    filename = f"{CART_DIR}/cart_{name}.txt"
    with open(filename, "w") as f:
        for term in base_terms[:153]:
            f.write(term + "\n")

    os.system(f"git add '{filename}'")
    os.system(f"git commit -m 'Added 153-term cart: {name}'")

os.system("git push origin main")

print("✓ All 153-term carts generated and pushed.")
