#!/usr/bin/env python3
import os, json, datetime, random, hashlib, time, subprocess

# --------- CONFIG ---------
REPO       = "/data/data/com.termux/files/home/mongoose.os"
TERMS_FILE = f"{REPO}/research_terms.txt"
TMX_FILE   = f"{REPO}/cart250_topic_matrix.json"

# --------- COLORS ---------
C = {
    "p":"\033[95m", "b":"\033[94m", "g":"\033[92m",
    "y":"\033[93m", "c":"\033[96m", "r":"\033[91m",
    "w":"\033[97m", "reset":"\033[0m"
}

# --------- DATA LOADERS ---------
def load_terms():
    if not os.path.exists(TERMS_FILE):
        # Default fallback terms if file missing
        return ["ATP", "proton tunneling", "ion channel", "electron transport"]
    with open(TERMS_FILE, "r", encoding="utf-8") as f:
        return [t.strip() for t in f.readlines() if t.strip()]

def load_topics():
    """Optional: pull in cart250 topic matrix if present."""
    if not os.path.exists(TMX_FILE):
        return []
    try:
        with open(TMX_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # Expecting a list of dicts, but we stay tolerant
            if isinstance(data, list):
                return data
            return []
    except Exception:
        return []

# --------- RESEARCH WRITER (REAL CONTENT) ---------
def build_quantum_bio_research(terms, topics):
    """
    Generates REAL research-style content about quantum biology +
    metabolic token valuation. No junk filler.
    """
    term_str = ", ".join(terms)

    summary = (
        f"This Infinity research file models metabolism as a tokenized quantum "
        f"process. Each ingest event (e.g. a drink of electrolyte fluid) is "
        f"treated as a sequence of quantum biological events: proton tunneling, "
        f"electron transfer, ATP synthesis, ion-channel signaling, and entropy "
        f"dissipation. The active term focus of this run is: {term_str}."
    )

    # Fold topic-matrix content in if available
    topic_blocks = []
    if topics:
        picks = random.sample(topics, min(3, len(topics)))
        for t in picks:
            title = t.get("title", "Untitled Topic")
            summary_t = t.get("summary", "").strip()
            topic_blocks.append(
                f"### Topic Node: {title}\n"
                f"{summary_t or 'No summary text recorded for this node.'}\n\n"
            )

    section1 = (
        "## 1. Metabolic Token Timeline\n"
        "Inside the body, a calorie is not just a scalar number; it is a timeline "
        "of quantum events. When a fluid containing glucose, ions, and cofactors "
        "enters circulation, it is broken into molecular packets. Each packet "
        "participates in:\n\n"
        "1. Membrane transport and partitioning between compartments.\n"
        "2. Enzymatic binding and unbinding cycles.\n"
        "3. Proton transfers along hydrogen-bond networks.\n"
        "4. Electron tunneling through redox chains.\n"
        "5. Formation and hydrolysis of ATP.\n\n"
        "We can define a **metabolic token** as the informational record of one "
        "complete traversal through this sequence. Mario-style, each brick is a "
        "reaction barrier, each coin is an ATP molecule, each flame is an entropy "
        "event, and each ghost is a lost opportunity where energy leaked instead "
        "of being captured."
    )

    section2 = (
        "## 2. Proton Tunneling and ATP Synthase\n"
        "ATP synthase behaves like a nanoscale rotary engine embedded in the "
        "mitochondrial membrane. Protons do not simply roll down a gradient in "
        "a classical way; they tunnel through discrete binding sites in the Fo "
        "subunit. Under physiological conditions, experimental and modelling work "
        "shows that barrier heights fluctuate due to protein motion and local "
        "electrostatics. When the barrier temporarily narrows, tunneling becomes "
        "orders of magnitude more probable.\n\n"
        "We can approximate the tunneling probability using a one-dimensional "
        "WKB-like expression:\n\n"
        "    T(E) ≈ exp( -2 ∫ sqrt(2m(V(x) - E))/ħ dx )\n\n"
        "Biologically, the exact potential landscape is messy, but the key point "
        "is that small structural changes in the protein can convert what looks "
        "like a blocked classical path into a viable quantum shortcut. Each "
        "successful tunneling event that contributes to rotor motion can be "
        "counted as a **proton-tunneling microtoken**."
    )

    section3 = (
        "## 3. Electron Transport and Signal Tokens\n"
        "The electron transport chain (ETC) is another quantum element in the "
        "metabolic pipeline. Electrons move between cofactors through a mixture "
        "of hopping, tunneling, and thermally assisted transitions. The geometry "
        "of cofactors and the protein scaffold sets up distances where pure "
        "classical hopping would be too slow, but quantum tunneling keeps charge "
        "flow workable on biological timescales.\n\n"
        "In parallel, voltage-gated ion channels in neurons create **signal tokens**. "
        "Each opening and closing event encodes a decision about whether a cell "
        "will fire, propagate a signal, or remain silent. The stochastic noise in "
        "these channels is not entirely random; it can be shaped by quantum-level "
        "fluctuations in the gating machinery, giving a small but measurable "
        "correction to classical conductance models."
    )

    section4 = (
        "## 4. Quantum Metabolic Token Valuation\n"
        "To translate biology into an Infinity-style economic language, we define "
        "a value function that tracks how much *useful* energy a token delivered:\n\n"
        "    V_∞ = (T_p · A) + (E_et · C) + (S_ion · γ) − L_entropy\n\n"
        "where:\n"
        "- T_p is the count of effective proton-tunneling events feeding ATP synthase.\n"
        "- A is the ATP yield per tunneling sequence.\n"
        "- E_et is the effective electron-transfer success count in ETC complexes.\n"
        "- C is a coherence factor representing how ordered the energy flow was.\n"
        "- S_ion is the number of productive ion-channel signaling events.\n"
        "- γ captures organism-level efficiency (hormonal state, temperature, rest).\n"
        "- L_entropy is a loss term representing wasted heat, leakage, and damage.\n\n"
        "In the Mario Excite metaphor: coins collected minus flames hit, weighted by "
        "how elegantly the player navigated the level."
    )

    section5 = (
        "## 5. System-Level Implications\n"
        "When we log each metabolic token over time, we obtain a high-dimensional "
        "record of how an organism handles resources. Two drinks with the same "
        "label calories can generate very different Infinity values depending on "
        "timing, mitochondrial health, and the configuration of quantum pathways.\n\n"
        "This makes it natural to design a **Quantum Health Ledger** where each "
        "ingest event is registered, evaluated, and scored as a token. The Infinity "
        "OS can then reason about trends: which behaviors consistently raise V_∞, "
        "which environments raise L_entropy, and which interventions improve the "
        "ratio between captured energy and wasted dissipation.\n"
    )

    topics_section = ""
    if topic_blocks:
        topics_section = (
            "## Annex: Linked Topic Nodes from cart250\n\n" +
            "".join(topic_blocks)
        )

    glossary = (
        "## Glossary (local to this file)\n"
        "- Metabolic token: The informational trace of one complete sequence of "
        "breakdown → quantum processing → ATP generation → usage.\n"
        "- Microtoken: A sub-event, such as a single proton-tunneling step or "
        "a single ion-channel gating event.\n"
        "- V_∞: Infinity value assigned to a token, measuring net useful energy.\n"
        "- Mario Excite map: Visual metaphor where bricks are reaction barriers, "
        "coins are ATP molecules, ghosts are lost opportunities, and flames are "
        "irreversible entropy spikes.\n"
    )

    full_body = (
        section1 + "\n\n" +
        section2 + "\n\n" +
        section3 + "\n\n" +
        section4 + "\n\n" +
        section5 + "\n\n" +
        topics_section + "\n\n" +
        glossary
    )

    return summary, full_body

# --------- TOKEN & FILE CREATOR ---------
def write_token_file(summary, body, terms):
    token_number = random.randint(10_000_000, 99_999_999)
    value        = random.randint(50_000, 9_000_000)
    timestamp    = datetime.datetime.now().isoformat()

    header = (
        "# ∞ Quantum Biology Research — Infinity OS\n"
        f"### Token #{token_number}\n"
        f"### Infinity Value: {value}\n"
        f"### Domain: Quantum Metabolic Token Engine\n"
        f"### Generated: {timestamp}\n"
        f"### Terms: {', '.join(terms)}\n"
        "---\n\n"
    )

    content = header + "## Executive Summary\n" + summary + "\n\n" + body + "\n"
    h = hashlib.sha256(content.encode("utf-8")).hexdigest()

    # Scatter: unique folder in repo root for each token
    token_dir = os.path.join(REPO, f"token_{token_number}")
    os.makedirs(token_dir, exist_ok=True)

    filename = os.path.join(token_dir, f"research_QBIO_{h[:10]}.md")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

    return filename, token_number, value, h

# --------- GIT PUSH ---------
def git_push(path):
    try:
        subprocess.run(["git", "-C", REPO, "add", path], check=False)
        subprocess.run(
            ["git", "-C", REPO, "commit", "-m", f"Add quantum bio token {os.path.basename(path)}"],
            check=False
        )
        subprocess.run(["git", "-C", REPO, "push"], check=False)
    except Exception:
        # We never crash the writer on git errors
        pass

# --------- MAIN LOOP ---------
def main_loop():
    start_time = time.time()
    count = 0

    while True:
        terms_all = load_terms()
        if len(terms_all) >= 4:
            terms = random.sample(terms_all, 4)
        else:
            terms = terms_all or ["ATP", "mitochondria", "tunneling", "signal"]

        topics = load_topics()
        summary, body = build_quantum_bio_research(terms, topics)
        path, token_number, value, h = write_token_file(summary, body, terms)

        count += 1
        elapsed = time.time() - start_time
        rate = count / elapsed if elapsed > 0 else 0.0

        print(f"{C['p']}[∞] Quantum Bio Token {token_number}{C['reset']}")
        print(f"{C['g']}  Value:{C['reset']} {value}")
        print(f"{C['y']}  Hash:{C['reset']} {h[:16]}...")
        print(f"{C['c']}  Hashrate:{C['reset']} {rate:.3f} tok/sec")
        print(f"{C['b']}  Terms:{C['reset']} {terms}")
        print(f"{C['w']}  File:{C['reset']}  {path}\n")

        git_push(path)
        time.sleep(1)

if __name__ == "__main__":
    main_loop()
