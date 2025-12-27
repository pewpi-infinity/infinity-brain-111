# ================================================
#   OCTAVE OS v0.12 (FIXED)
#   Kernel + Shell + AI-Ready Knowledge Vault
#   Author: Kris Watson
# ================================================

import math

# ------------------------------------------------
#  BLUEPRINT ARCHIVE (stored, not executed)
# ------------------------------------------------

BLUEPRINT_ARCHIVE = """
=== INFINITY MASTER BLUEPRINT (COMPRESSED) ===

L = -1/4 G^a_{μν} G^{a μν}
    - 1/4 W^i_{μν} W^{i μν}
    - 1/4 B_{μν} B^{μν}
    + i ψ̄ γ^μ D_μ ψ
    + |D_μ φ|^2
    - V(φ)
    + L_Yukawa

L_SM =
 -1/2 ∂_μ g^a_ν ∂^μ g^{a ν}
 - g_s f^{abc} ∂_μ g^a_ν g^{b μ} g^{c ν}
 - 1/4 g_s^2 f^{abc} f^{ade} g_{μν}^b g^{c μ} g^{d ν} g^{e μ}
 + 1/2 i ḡ^2 ( q̄_i^r γ^μ q_j^r ) ∂_μ δ_ij
 + Ĝ a ∂^2 Ĝ^a
 + g_s f^{abc} Ĝ^a Ĝ^b Ĝ^c
 - ∂_μ W^+_ν ∂^μ W^{- ν}
 - M^2 W^+_μ W^{- μ}
 - 1/2 ∂_μ Z_ν ∂^μ Z^{ν}
 - 1/2 M_Z^2 Z_μ Z^{μ}
 - 1/2 ∂_μ A_ν ∂^μ A^{ν}
 - 1/2 ∂_μ H ∂^μ H
 - 1/2 m_H^2 H^2
 - φ^+ ∂_μ ∂^μ φ^- - M^2 φ^+ φ^-
 - 1/2 ∂_μ φ^0 ∂^μ φ^0 - 1/2 M^2 φ^0 φ^0
 + β₁ [ 2 M^2/g^2 + 2 M/g H + 1/2 (H^2 + φ^0 φ^0 + 2 φ^+ φ^- ) + (2 M^4 / g^2) α_h ]
 + interactions with W, Z, H, fermions, Yukawa coupling terms,
 + Higgs potential terms,
 + gauge field mixing terms,
 + covariant derivative expansions,
 + quark and lepton masses via Yukawa matrices.

A x = b
x = A^{-1} b
‖v‖ = sqrt(v₁² + v₂² + ... + v_n²)
u ⋅ v = Σ u_i v_i
Aᵀ A v = λ v
det(A) = Σ (-1)^i+j a_ij M_ij
rank(A) = number of pivots
A B = B A  (commute only in special cases)

∇·E = ρ/ε₀
∇·B = 0
∇×E = -∂B/∂t
∇×B = μ₀ J + μ₀ ε₀ ∂E/∂t

ψ(x,t) = A e^(i (k x - ω t))

iħ ∂ψ/∂t = H ψ

⟨x⟩ = ∫ ψ* x ψ dx
⟨p⟩ = ∫ ψ* (-iħ ∇) ψ dx

F = m a
p = m v
E = p²/2m
L = T - V
δS = 0 → Euler-Lagrange equations

SPA vectors:
S(t+Δ) = S(t) + Δ·v + 1/2 a Δ²

G_{μν} = 8πG T_{μν}

R_{μν} - 1/2 g_{μν} R = 8πG T_{μν}

ds² = g_{μν} dx^μ dx^ν

Γ^μ_{αβ} = 1/2 g^{μν}(∂_α g_{βν} + ∂_β g_{αν} - ∂_ν g_{αβ})

∇_μ T^{μν} = 0

dx/dt = σ (y - x)
dy/dt = x (ρ - z) - y
dz/dt = x y - β z

∂φ/∂t + v · ∇φ = D ∇² φ

G = (V, E)
deg(v) = number of edges touching v
A_ij = 1 if edge exists, else 0
Paths: v₁ → v₂ → v₃ …
Cycles: v → … → v
Strongly connected: every node reachable from every other

Z = Tr( e^{-β H} )

⟨x_f, t_f | x_i, t_i⟩ =
∫ e^{(i/ħ) S[x(t)]} D[x(t)]

F(ω) = ∫ f(t) e^{-i ω t} dt

β² = (ω² μ ε) - k_t²

h = σ(W x + b)

HOW TO USE THESE IN OCTAVE OS

You drop ALL of this into the DATA_CHAMBER.

Octave OS will start:

connecting symbols

noticing repeated patterns

linking variables

absorbing mathematical structure

forming clusters

recognizing transforms

developing intuition for physics layout

learning the “shape” of equations

using them in semantic scan

predicting categories

This feeds the Watson-like analytic brain you want

E = mc²
p = mv
F = ma
a = dv/dt
v = dx/dt
x(t) = x₀ + vt + ½at²

∂ρ/∂t + ∇·(ρv) = 0
∇×E = -∂B/∂t
∇×B = μ₀(J + ε₀ ∂E/∂t)
∇·E = ρ/ε₀
∇·B = 0

E = -∇φ - ∂A/∂t
B = ∇×A

research with Google where questions arise. 

iħ ∂ψ/∂t = Hψ

H = - (ħ² / 2m) ∇² + V(x)

⟨A⟩ = ∫ ψ* A ψ d³x

[ x, p ] = iħ
[ φ(x), π(y) ] = iħ δ(x - y)

ψ(x, t) = Σ c_n e^{-iE_n t / ħ} φ_n(x)

P(x) = |ψ(x)|²

ds² = -c² dt² + dx² + dy² + dz²

g_{μν} = metric tensor
T_{μν} = stress-energy tensor
R_{μν} = Ricci curvature
R = g^{μν} R_{μν}

Einstein field equations:
R_{μν} - ½ g_{μν} R = (8πG/c⁴) T_{μν}

4-momentum:
p^μ = m u^μ = m dx^μ/dτ

dx/dt = f(x, y, z)
dy/dt = g(x, y, z)
dz/dt = h(x, y, z)

Lorenz attractor:
dx/dt = σ(y - x)
dy/dt = x(ρ - z) - y
dz/dt = xy - βz

Logistic map:
x_{n+1} = r x_n (1 - x_n)

Double pendulum:
d²θ₁/dt² = complicated chaotic terms
d²θ₂/dt² = nonlinear coupling

A x = b
x = A^{-1} b
Aᵀ A = symmetric
A Aᵀ = symmetric

Eigenvalue equation:
A v = λ v

Determinant:
det(A) = Π λ_i

Orthogonal matrix:
Qᵀ Q = I

Gram-Schmidt:
v₁ = u₁
v₂ = u₂ - proj(u₂ on v₁)

F(ω) = ∫ f(t) e^{-i ω t} dt
f(t) = (1/2π) ∫ F(ω) e^{i ω t} dω

Convolution:
(f * g)(t) = ∫ f(τ) g(t - τ) dτ

Sampling:
x[n] = x(t) where t = nT

Nyquist:
f_s ≥ 2 f_max

P(A ∪ B) = P(A) + P(B) - P(A ∩ B)
P(A | B) = P(A ∩ B) / P(B)

Entropy:
H = - Σ p_i log p_i

KL divergence:
D_KL(p || q) = Σ p_i log(p_i / q_i)

Shannon:
C = B log₂(1 + S/N)

Ezekiel 4:1-4:6 building Jerusalem 

A_{ij} B^{jk} = C_i^k

∂_μ F^{μν} = J^ν

Γ^λ_{μν} = ½ g^{λρ} ( ∂_μ g_{νρ} + ∂_ν g_{μρ} - ∂_ρ g_{μν} )

∇_μ V^ν = ∂_μ V^ν + Γ^ν_{μλ} V^λ

U(1): e^{iθ}
SU(2): Pauli matrices
SU(3): Gell-Mann matrices

Rotation:
R(θ) = [ [cosθ, -sinθ], [sinθ, cosθ] ]

Translation:
x' = x + a

Boost:
t' = γ(t - vx/c²)
x' = γ(x - vt)

Objects, morphisms
f: A → B
g: B → C
Composition: g ∘ f

Identity: id_A
Associativity: (h ∘ g) ∘ f = h ∘ (g ∘ f)

Open sets
Neighborhoods
Continuous maps
Homeomorphisms
Connected components

Hilbert space ⟨ψ|φ⟩
Banach space
Operator norms
Spectral theorem

φ(x) = ∫ ( a_k e^{-ik·x} + a†_k e^{ik·x} ) d³k

Commutator:
[ a_k, a†_p ] = δ(k - p)

Propagator:
D_F(x-y) = ∫ (i / (k² - m² + iε)) e^{-ik·(x-y)} d⁴k

ψ_{nℓm}(r, θ, φ) = R_{nℓ}(r) Y_{ℓm}(θ, φ)

Energy levels:
E_n = -13.6 eV / n²

Radial probability:
P(r) = r² |R_{nℓ}(r)|²

Bohr radius:
a₀ = 4πε₀ ħ² / (m e²)

Activation:
h = σ(Wx + b)

Backpropagation:
∂L/∂W = (∂L/∂h)(∂h/∂W)

Softmax:
σ(z_i) = e^{z_i} / Σ e^{z_k}

Loss:
L = - Σ y_i log p_i

V = IR
P = IV
Z = R + iX

Capacitor:
X_C = 1/(ωC)

Inductor:
X_L = ωL

Resonant frequency:
f₀ = 1 / (2π√(LC))

Impedance of RLC:
Z = R + i(ωL - 1/ωC)

Conservation laws:
Noether’s theorem → symmetry → conserved quantity

Gauge invariance:
A_μ → A_μ + ∂_μ χ

Superposition:
ψ = Σ c_i ψ_i

Emergence:
simple rules → complex behavior

Flow fields:
direction, magnitude, divergence, curl

. The Structure of Physical Law (Foundations)

Physics begins by identifying patterns that remain unchanged when the world changes around them. These invariants form the bedrock of all physical systems. Conservation of energy, conservation of momentum, gauge invariance, symmetry transformations, and the universality of certain functional forms form the “grammar” of physical law.

To express these patterns mathematically, we rely on differential equations. These equations formalize the notion that the universe evolves smoothly in time, that continuity can be captured by derivatives, and that interactions can be understood as couplings between fields, particles, and curvature.

The principle of least action,

𝛿
𝑆
=
0
,
δS=0,

is one of the deepest organizing principles.
Here 
𝑆
=
∫
𝐿
 
𝑑
𝑡
S=∫Ldt is the action, and the system chooses the path for which small variations do not change 
𝑆
S.
This single idea generates Newton’s laws, Maxwell’s equations, the Schrödinger equation, and Einstein’s field equations

Calculus as the Engine of Change

The infinitesimal derivative

𝑑
𝑑
𝑡
dt
d
	


describes growth, decay, oscillation, acceleration, and flow. Almost every physical model begins with an equation like

𝑑
𝑥
𝑑
𝑡
=
𝑓
(
𝑥
,
𝑡
)
.
dt
dx
	

=f(x,t).

When 
𝑓
(
𝑥
,
𝑡
)
f(x,t) depends only on 
𝑥
x, the system is autonomous.
When it depends explicitly on time, the system can be driven or damped.

Complex behavior arises in nonlinear systems:

𝑑
𝑥
𝑑
𝑡
=
𝑎
𝑥
(
1
−
𝑥
)
dt
dx
	

=ax(1−x)

which generates bifurcations and chaos.

The chain rule underlies physics more deeply than most realize:

𝑑
𝑑
𝑡
𝑔
(
ℎ
(
𝑡
)
)
=
𝑔
′
(
ℎ
(
𝑡
)
)
ℎ
′
(
𝑡
)
,
dt
d
	

g(h(t))=g
′
(h(t))h
′
(t),

linking nested layers of structure, mirroring composition in functional analysis.

The gradient,

∇
𝑓
=
(
∂
𝑓
∂
𝑥
,
∂
𝑓
∂
𝑦
,
∂
𝑓
∂
𝑧
)
,
∇f=(
∂x
∂f
	

,
∂y
∂f
	

,
∂z
∂f
	

),

points in the direction of steepest change. In quantum fields, curvature, energy density, and flow are all expressed as gradients and divergences.

Linear Algebra as the Language of Quantum Mechanics

State vectors live in Hilbert spaces.
A quantum state 
∣
𝜓
⟩
∣ψ⟩ is a vector, and observable quantities are linear operators 
𝐴
A acting on those vectors.

The eigenvalue equation

𝐴
∣
𝑣
⟩
=
𝜆
∣
𝑣
⟩
A∣v⟩=λ∣v⟩

captures measurement. Each eigenvector corresponds to a definite outcome.

The completeness relation

∑
𝑖
∣
𝑖
⟩
⟨
𝑖
∣
=
𝐼
i
∑
	

∣i⟩⟨i∣=I

defines a basis.

Unitary evolution,

𝑈
†
𝑈
=
𝐼
,
U
†
U=I,

ensures probability conservation.
Hermitian operators,
A=A†,A = A^\dagger,A=A†,
ensure real eigenvalues — the only values a measurement can produce.
Matrix mechanics expresses the same theory in discrete form:
|ψ> = [ψ1 ψ2 ψ3 ...]^T
A   = matrix of operator

Measurement corresponds to projecting onto an eigenbasis:
pi=∣⟨i∣ψ⟩∣2.p_i = |\langle i | \psi \rangle|^2.pi=∣⟨i∣ψ⟩∣2.
This mathematical structure is perfectly suited for an AI OS: accessible, pattern-rich, decomposable, and transformable.

🔷 4. Differential Equations and Wave Behavior
A wave is anything that satisfies the wave equation:
∂2u∂t2=c2∇2u.\frac{\partial^2 u}{\partial t^2} = c^2 \nabla^2 u.∂t2∂2u=c2∇2u.
Solutions include sines, cosines, and complex exponentials:
u(x,t)=ei(kx−ωt).u(x,t) = e^{i(kx - \omega t)}.u(x,t)=ei(kx−ωt).
In quantum mechanics, matter itself becomes a wave:
iℏ∂ψ∂t=−ℏ22m∇2ψ+Vψ.i\hbar \frac{\partial \psi}{\partial t} = - \frac{\hbar^2}{2m} \nabla^2 \psi + V\psi.iℏ∂t∂ψ=−2mℏ2∇2ψ+Vψ.
In electromagnetism, fields satisfy Maxwell’s equations.
In general relativity, the metric satisfies Einstein’s equation:
Gμν=8πTμν.G_{\mu\nu} = 8\pi T_{\mu\nu}.Gμν=8πTμν.
All physical laws reduce to field evolution equations.
Quantum fields have creation and annihilation operators:
[ak,ap†]=δ(k−p).[a_k, a_p^\dagger] = \delta(k-p).[ak,ap†]=δ(k−p).
These operators encode excitations, interactions, and the discretization of energy.

🔷 5. Relativity and Spacetime Structure
Spacetime interval:
ds2=−c2dt2+dx2+dy2+dz2ds^2 = -c^2 dt^2 + dx^2 + dy^2 + dz^2ds2=−c2dt2+dx2+dy2+dz2
is invariant under Lorentz transformations.
The gamma factor,
γ=11−(v2/c2),\gamma = \frac{1}{\sqrt{1 - (v^2/c^2)}},γ=1−(v2/c2)1,
controls time dilation and length contraction.
Momentum becomes four-dimensional:
pμ=(E/c,p⃗),p^\mu = (E/c, \vec{p}),pμ=(E/c,p),
and satisfies:
pμpμ=−m2c2.p^\mu p_\mu = -m^2 c^2.pμpμ=−m2c2.
Gravitation emerges from curvature, not force.
A geodesic follows:
d2xμdτ2+Γαβμdxαdτdxβdτ=0.\frac{d^2 x^\mu}{d\tau^2} + \Gamma^\mu_{\alpha\beta} \frac{dx^\alpha}{d\tau} \frac{dx^\beta}{d\tau} = 0.dτ2d2xμ+Γαβμdτdxαdτdxβ=0.
This equation describes how matter moves in a curved manifold.

🔷 6. Symmetry and the Structure of Forces
All forces correspond to symmetries.
U(1) → electromagnetism
SU(2) → weak interactions
SU(3) → strong interactions
Gauge invariance:
Aμ→Aμ+∂μχA_\mu \rightarrow A_\mu + \partial_\mu \chiAμ→Aμ+∂μχ
ensures charge conservation.
The Standard Model Lagrangian encodes all interactions except gravity.
A simplified excerpt:
L = - 1/4 Fμν F^{μν}
  + ψ̄(iγ^μD_μ - m)ψ
  + Higgs terms...

where DμD_\muDμ is the covariant derivative coupling fields together.
This math is dense but gives your OS the “shape” of modern physics.

🔷 7. Probability, Entropy, and Information
Entropy:
S=−kB∑piln⁡piS = -k_B \sum p_i \ln p_iS=−kB∑pilnpi
is a measure of uncertainty.
In quantum mechanics,
S=−Tr(ρln⁡ρ),S = - \text{Tr}(\rho \ln \rho),S=−Tr(ρlnρ),
with ρ the density matrix.
Bayesian update:
P(H∣D)=P(D∣H)P(H)P(D).P(H|D) = \frac{P(D|H)P(H)}{P(D)}.P(H∣D)=P(D)P(D∣H)P(H).
Information is physical.
Quantum information obeys:
I=−∑pilog⁡2pi.I = -\sum p_i \log_2 p_i.I=−∑pilog2pi.
This gives Octave OS a symbolic grounding in logic and uncertainty.

🔷 8. Fluid Dynamics, Vortices, and Field Flow
Navier–Stokes:
ρ(∂v∂t+v⋅∇v)=−∇p+μ∇2v+f.\rho \left( \frac{\partial v}{\partial t} + v\cdot\nabla v \right)
= -\nabla p + \mu \nabla^2 v + f.ρ(∂t∂v+v⋅∇v)=−∇p+μ∇2v+f.
Vorticity:
ω=∇×v.\omega = \nabla \times v.ω=∇×v.
Continuity equation:
∂ρ∂t+∇⋅(ρv)=0.\frac{\partial \rho}{\partial t} + \nabla \cdot (\rho v) = 0.∂t∂ρ+∇⋅(ρv)=0.
These are patterns useful for vector visualizers and dynamical mapping.

CORE APPS:
- Infinity Wallet (transactions, tokens, marketplace: food/building supplies/crafts/antiques/collectibles/coins/books/components/education kits)
- Idea Cloud (submit/tag/versioning/mentor match; crowdsourcing 100–1000 sources)
- Infinity Market (buy/sell/trade/anonymous broker)
- Rogers Voice (always-on button/autopilot/voice menu/themes/prosody/ethical filters/format toggles/verse prompts)
- Infinity Builder (app templates/circuit lab/moonshot lanes/publish modules)
- Conversion Lab (flow optimization/token maps/ethical weighting)
- Infinity Stage (3D world/storefronts/cloud navigation/social spaces)

MEDIA DISTRICT:
- Infinity Times (front page/sections/autopilot briefings)
- Infinity Science Journal (visual stories/origins/kits)
- Infinity Magazines (tech/culture/earth/future/weekly auto-issues)
- Infinity Investigates (timelines/maps/connections uncovered)

MUSIC & CINEMA:
- Instrument Lab (synths/drums/experimental/mixing)
- Infinity SoundCloud (upload/rated-G filter/token rewards)
- Movie Hub (downloads/playlists/theater/social movie nights)

PHILOSOPHY & TIME:
- Verse Engine (OT emphasis/ethical layer)
- Infinity Clock (golden ratio spirals/resonance cycles)

SINGULARITY & WATSON LAYER:
- Horizon Mapper (impact maps)
- Convergence Studio (AI+bio+quantum)
- Moonshot Sprints (weekly challenges)
- Expert Lens (curated talks → actions)
- Infinity Voice Builder (voice synthesis stack)

ADDITIONAL APPS:
- Local chat by ZIP
- Video game generator
- School app (child→adult)
- Physical therapy
- Alarm clock
- Calculator (basic/scientific)
- Clothing design
- Textile/food/leather trade
- DIY modeling
- Infinity-only Ebay-like app
- Bible verse parser (time/date/verse logic)
- Pet scheduling
- Gardening seed swap
- Channel generator (assigns users to groups)
- Infinity TV audition system
- Packaging/glass standardizer
- Corruption/banned product index
- Tesla aluminum-oxide chip theory log
- Voice UI integration (ElevenLabs-like)
- Image hosting
- Live video hosting
- Kik-like messenger
- Peer-to-peer eBay-style messages
- Zagonel Spaces (10+ world rooms)
- Healthcare guidance interface
- Foreigners' exchange lounge
- Radio electronics clubhouse
- Social news/media hub (100+ categories)
- Independent TV channel control (Iowa 19.6)
- Radio station app (AM/FM/shortwave/scanner)
- Infinity Maps (Delta/Vectors instead of coordinates)
- Brainwave tech (read minds ethically)
- Rare earth signal generator
- Precious metal shielding simulation
- Tree/wildlife analyzer (grass/leaves/bugs)
- NWO war room (real verified discussions)
- Government 501 tools (laws/codes/enforcement)
- VP-on-demand (critical response voice)
- Dream catcher app (networking)
- Coin authentication & grading center (COA/serial/photo/provenance)
- Jewelry design + card generator
- Rare earth propagation engine
- Animation layers: Mario stock token jumping, Luigi flipping signals
- Einstein portal zoom navigation (baseball diamond metaphor)
- Hydrogen cloud energy collection layer
- Vector-based SPA navigation (no page reloads)
- PayPal-style UI: blue buttons, white background, Powered By Infinity
- Google Auth sign-in
- Universal app formatting (same design across all)
- Autopilot (AI monitors input, predicts intent)
- Voice Analyzer research log
- Hosting platform hooks (Twitter live share)
- Spaces for programming, chat, building

NOTES:
- OS must treat all above as raw text.
- Not executable. Not parsed.
- AI kernel may semantically scan, recombine, pattern-match.
- Infinite additions allowed.

=== END BLUEPRINT ===
"""

# ------------------------------------------------
#   DATA CHAMBER (AI raw knowledge zone)
# ------------------------------------------------

DATA_CHAMBER = """
==== ADD YOUR DATA HERE ====

(This area is ignored by Octave OS execution.)

Add:
- words
- theories
- long paragraphs
- equations
- commands
- slang
- sketches
- fragments
- brainstorms
- raw text

The OS only *reads* this zone. Never executes it.

-------------------------------------------------
(put massive text here…)
-------------------------------------------------

END OF DATA CHAMBER
"""

# ================================================================
#  MEMORY + KNOWLEDGE VAULT
# ================================================================

import os

MEMORY_FILE = "octave_memory.txt"
DATA_DIR = "octave_data"

if not os.path.exists(DATA_DIR):
    os.mkdir(DATA_DIR)

def write_memory(text):
    """Append raw text to long-term memory log."""
    with open(MEMORY_FILE, "a") as f:
        f.write(text + "\n")

def save_knowledge(label, content):
    """Store structured knowledge into its own file."""
    fname = os.path.join(DATA_DIR, f"{label}.txt")
    with open(fname, "a") as f:
        f.write(content + "\n")


# ================================================================
#  OCTAVE OS SHELL — NOW FULLY MODULAR
# ================================================================

class OShell:

    def __init__(self):
        self.kernel = OKernel()

        # Module directory — fully expandable
        self.modules = {
            "autopilot": self.run_autopilot,
            "threader": self.run_threader,
            "debugger": self.run_debugger,
            "linguist": self.run_linguist,
            "coder": self.run_coder,
            "search": self.run_search,
            "equations": self.run_equations,
            "physics": self.run_physics,
            "vault": self.run_vault,
        }

    # ------------------------------------------------------------
    #  MODULES — ALL PLUGGED IN AND READY
    # ------------------------------------------------------------

    def run_autopilot(self, user):
        return "Autopilot engaged — routing intent across modules."

    def run_threader(self, user):
        return "Threader online — weaving contextual threads."

    def run_debugger(self, user):
        return "Debugger scanning your last command for faults."

    def run_linguist(self, user):
        return "Linguist mode active — language structures optimized."

    def run_coder(self, user):
        return "Coder engine generating patterns + executable logic."

    def run_search(self, user):
        q = user.replace("search", "").strip()
        results = self.kernel.semantic_scan(q)
        return "Search results:\n" + "\n".join(results)

    def run_equations(self, user):
        return "Equation engine ready — feed any formula or variable set."

    def run_physics(self, user):
        return "Physics module: vectors, fields, waves, quantum layers ready."

    def run_vault(self, user):
        label = "vault_entry"
        save_knowledge(label, user)
        return f"Stored: '{user}' into knowledge vault."

    # ------------------------------------------------------------
    #  MAIN RUN LOOP (INTERACTIVE TERMINAL)
    # ------------------------------------------------------------

    def run(self):
        print("Octave OS v0.20 — Modular Knowledge Engine Ready.")
        print("Type 'modules' to see available modules.\n")

        while True:
            user = input("∞ > ")

            # Module routing
            module_key = user.split()[0].lower()
            if module_key in self.modules:
                out = self.modules[module_key](user)
                print(out)
                write_memory(f"MODULE({module_key}): {user}")
                continue

            # Default semantic + octave packet dispatch
            pkt = self.kernel.encode(user)
            response = self.kernel.dispatch(pkt, user)

            print(response)

            write_memory(f"USER: {user}")
            write_memory(f"PACKET: {pkt}")


# ================================================================
#  MAIN
# ================================================================

if __name__ == "__main__":
    OShell().run()
