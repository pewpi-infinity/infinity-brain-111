#!/usr/bin/env python3
"""
Logged Octave shell wrapper + Semantic OS extensions (v2).
Runs an interactive Octave session with logging of all inputs and outputs,
and includes a semantic layer for terms, equations, music symbols, and language.

This extended script adds:
- Rich provenance logging with channels
- Equation registry and evaluators
- Octave Music Symbol OS: translate simple music notation into Octave commands (safe)
- Semantics and language layer: domain lexicon, intents, macros
- Session history, replay, export (JSON), and transcripts
- Config, help, glossary, and plugin hooks
- Serverless-friendly artifacts under ./artifacts and ./logs
"""

import sys
import os
import json
import subprocess
import datetime
import select
import time
import hashlib
import shutil
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

# -----------------------------------------------------------------------------
# Paths, artifacts, and provenance helpers
# -----------------------------------------------------------------------------

ROOT = Path(os.getcwd())
LOG_DIR = ROOT / "logs"
ART_DIR = ROOT / "artifacts"
DATA_DIR = ROOT / "data"
LOG_DIR.mkdir(exist_ok=True)
ART_DIR.mkdir(exist_ok=True)
DATA_DIR.mkdir(exist_ok=True)

STREAM_LOG = LOG_DIR / "txt.log"
AUDIT_LOG = LOG_DIR / "octave_semantic_audit.jsonl"
SESSION_LOG = DATA_DIR / "octave_sessions.json"
TRANSCRIPTS = DATA_DIR / "octave_transcripts.json"
CONFIG_PATH = DATA_DIR / "octave_semantic_config.json"

def now_iso() -> str:
    return datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S")

def format_timestamp() -> str:
    return datetime.datetime.now().strftime("[%Y-%m-%d %H:%M:%S]")

def write_jsonl(path: Path, obj: Dict[str, Any]) -> None:
    with open(path, "a", encoding="utf-8") as f:
        f.write(json.dumps(obj) + "\n")

def audit(entry: Dict[str, Any]) -> None:
    entry = dict(entry)
    entry["t"] = now_iso()
    write_jsonl(AUDIT_LOG, entry)

def artifact(name: str, obj: Dict[str, Any]) -> Path:
    p = ART_DIR / f"{name}.json"
    with open(p, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)
    return p

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------

DEFAULT_CONFIG = {
    "prompt": "octave> ",
    "octave_cmd": ["octave", "--interactive", "--quiet"],
    "transcript_limit": 1000,
    "channels": ["IN", "OUT", "SYS", "EVAL", "MUSIC", "MACRO", "SEM"],
    "sanitize_output": True,
    "banner_lines": [
        "Starting logged Octave shell...",
        "Type 'quit' or 'exit' to exit Octave.",
        "-" * 60
    ],
    "music": {
        "tempo_bpm": 120,
        "default_wave": "sin",
        "amplitude": 0.5,
        "sample_rate": 8000
    },
    "equations": {
        "precision": 10,
        "allow_assign": True
    },
    "macros": {
        "enabled": True
    }
}

def load_config() -> Dict[str, Any]:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                return {**DEFAULT_CONFIG, **cfg}
        except:
            return DEFAULT_CONFIG.copy()
    return DEFAULT_CONFIG.copy()

def save_config(cfg: Dict[str, Any]) -> None:
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=2)
    audit({"action": "config.save", "keys": list(cfg.keys())})

# -----------------------------------------------------------------------------
# Logging and transcript
# -----------------------------------------------------------------------------

def ensure_log_dir() -> Path:
    LOG_DIR.mkdir(exist_ok=True)
    return STREAM_LOG

def log_message(log_file: Path, direction: str, message: str) -> None:
    with open(log_file, 'a', encoding='utf-8') as f:
        timestamp = format_timestamp()
        f.write(f"{timestamp} [{direction}] {message}\n")

def append_transcript(role: str, content: str) -> None:
    data = {"transcripts": []}
    if TRANSCRIPTS.exists():
        try:
            with open(TRANSCRIPTS, "r", encoding="utf-8") as f:
                data = json.load(f)
        except:
            pass
    data.setdefault("transcripts", []).append({
        "role": role,
        "content": content,
        "t": now_iso()
    })
    with open(TRANSCRIPTS, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def export_transcript() -> Path:
    out = {"exported_at": now_iso()}
    if TRANSCRIPTS.exists():
        with open(TRANSCRIPTS, "r", encoding="utf-8") as f:
            out["data"] = json.load(f)
    return artifact(f"octave_transcript_{int(time.time())}", out)

# -----------------------------------------------------------------------------
# Session registry
# -----------------------------------------------------------------------------

def load_sessions() -> Dict[str, Any]:
    if SESSION_LOG.exists():
        try:
            with open(SESSION_LOG, "r", encoding="utf-8") as f:
                return json.load(f)
        except:
            pass
    return {"sessions": []}

def save_sessions(obj: Dict[str, Any]) -> None:
    with open(SESSION_LOG, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2)

def session_start(user: str = "guest") -> Dict[str, Any]:
    db = load_sessions()
    sess = {"user": user, "start": now_iso(), "end": None, "id": hashlib.sha1(f"{user}-{time.time()}".encode()).hexdigest()[:12]}
    db["sessions"].append(sess)
    save_sessions(db)
    audit({"action": "session.start", "user": user, "id": sess["id"]})
    return {"ok": True, "session": sess}

def session_end(user: str = "guest") -> Dict[str, Any]:
    db = load_sessions()
    ended = None
    for s in reversed(db["sessions"]):
        if s["user"] == user and s["end"] is None:
            s["end"] = now_iso()
            ended = s
            break
    save_sessions(db)
    audit({"action": "session.end", "user": user, "ok": bool(ended)})
    return {"ok": bool(ended), "session": ended}

# -----------------------------------------------------------------------------
# Equation registry and evaluator
# -----------------------------------------------------------------------------

class EquationLibrary:
    """
    Stores named equations and allows evaluation with safe variable substitution.
    """
    def __init__(self):
        self.store: Dict[str, str] = {}
        self.context: Dict[str, float] = {}

    def add(self, name: str, expr: str) -> Dict[str, Any]:
        self.store[name] = expr
        audit({"action": "equation.add", "name": name, "expr": expr})
        return {"ok": True, "name": name, "expr": expr}

    def set_var(self, key: str, value: float) -> Dict[str, Any]:
        self.context[key] = float(value)
        audit({"action": "equation.var.set", "key": key, "value": value})
        return {"ok": True, "key": key, "value": value}

    def eval(self, name_or_expr: str) -> Dict[str, Any]:
        expr = self.store.get(name_or_expr, name_or_expr)
        # VERY SIMPLE SAFE EVAL: allow + - * / ^ () and variable names [a-zA-Z_]
        # replace ^ with ** for Python
        expr_py = expr.replace("^", "**")
        # allow only variables from context and numbers/operators
        token_ok = re.compile(r"^[0-9\.\+\-\*\/\(\)\s\*\*a-zA-Z_]+$")
        if not token_ok.match(expr_py):
            audit({"action": "equation.eval.blocked", "expr": expr})
            return {"ok": False, "error": "unsafe expression"}
        # replace variables
        expr_bound = expr_py
        for k, v in self.context.items():
            expr_bound = re.sub(rf"\b{k}\b", str(v), expr_bound)
        try:
            val = eval(expr_bound, {"__builtins__": {}}, {})
            audit({"action": "equation.eval", "expr": expr, "value": val})
            return {"ok": True, "expr": expr, "value": val}
        except Exception as e:
            audit({"action": "equation.eval.error", "expr": expr, "error": str(e)})
            return {"ok": False, "error": str(e)}

# -----------------------------------------------------------------------------
# Octave Music Symbol OS
# -----------------------------------------------------------------------------

NOTE_FREQS = {
    # A4 = 440 reference
    "A4": 440.0, "B4": 493.88, "C4": 261.63, "D4": 293.66, "E4": 329.63, "F4": 349.23, "G4": 392.00,
    "A3": 220.0, "B3": 246.94, "C3": 130.81, "D3": 146.83, "E3": 164.81, "F3": 174.61, "G3": 196.00,
    "A5": 880.0, "B5": 987.77, "C5": 523.25, "D5": 587.33, "E5": 659.25, "F5": 698.46, "G5": 783.99
}

class MusicSymbolOS:
    """
    Translates simple music sequences into Octave commands (non-executed here),
    writes notation manifests and can generate sample arrays friendly to Octave.
    """
    def __init__(self, tempo_bpm: int = 120, amplitude: float = 0.5, sample_rate: int = 8000, wave: str = "sin"):
        self.tempo_bpm = tempo_bpm
        self.amplitude = amplitude
        self.sample_rate = sample_rate
        self.wave = wave

    def parse_sequence(self, seq: str) -> List[Tuple[str, float]]:
        """
        seq format: "C4:1,D4:0.5,E4:0.5,G4:2"
        durations are in beats; convert to seconds using tempo.
        """
        items = []
        for token in seq.split(","):
            token = token.strip()
            if not token: continue
            if ":" in token:
                note, dur_str = token.split(":")
                dur_beats = float(dur_str)
            else:
                note, dur_beats = token, 1.0
            freq = NOTE_FREQS.get(note.upper(), None)
            if freq is None:
                freq = 440.0  # default A4
            sec = (60.0 / self.tempo_bpm) * dur_beats
            items.append((note.upper(), sec))
        return items

    def generate_samples(self, seq: str) -> Dict[str, Any]:
        """
        Generate a small sample array (truncated) to be consumed by Octave with sin wave.
        We only compute values, do not execute Octave here.
        """
        items = self.parse_sequence(seq)
        samples = []
        for note, sec in items:
            freq = NOTE_FREQS.get(note, 440.0)
            n = max(1, int(sec * self.sample_rate))
            for i in range(min(n, 800)):  # truncate per note
                t = i / self.sample_rate
                if self.wave == "sin":
                    val = self.amplitude * (float(0.9999) * __import__("math").sin(2 * __import__("math").pi * freq * t))
                else:
                    val = self.amplitude * (2 * ((t * freq) % 1) - 1)  # naive saw
                samples.append(round(val, 6))
        return {
            "tempo_bpm": self.tempo_bpm,
            "amplitude": self.amplitude,
            "sample_rate": self.sample_rate,
            "wave": self.wave,
            "sequence": seq,
            "values_prefix": samples[:256]
        }

    def to_octave_commands(self, seq: str) -> List[str]:
        """
        Return a list of Octave command strings that could synthesize the sequence.
        (Not executed by this script; provided as a manifest for the user.)
        """
        cmds = [
            "% Auto-generated music commands",
            "fs = 8000;",  # sample rate default
            "A = 0.5;",    # amplitude
        ]
        items = self.parse_sequence(seq)
        idx = 1
        for note, sec in items:
            freq = NOTE_FREQS.get(note, 440.0)
            n = max(1, int(sec * self.sample_rate))
            cmds.append(f"t{idx} = linspace(0, {sec}, {n});")
            cmds.append(f"y{idx} = A * sin(2*pi*{freq}*t{idx});")
            idx += 1
        if items:
            parts = ",".join([f"y{i+1}" for i in range(len(items))])
            cmds.append(f"y = [{parts}];")
            cmds.append("sound(y, fs);")
        return cmds

# -----------------------------------------------------------------------------
# Semantics, lexicon, and macro engine
# -----------------------------------------------------------------------------

class Lexicon:
    """
    Domain lexicon of terms, intents, and simple semantic expansions.
    """
    def __init__(self):
        self.terms: Dict[str, Dict[str, Any]] = {
            "energy": {"desc": "Energy concepts", "tags": ["physics"]},
            "hydrogen": {"desc": "Hydrogen conceptual planning", "tags": ["energy"]},
            "music": {"desc": "Symbolic music OS", "tags": ["audio", "octave"]},
            "equation": {"desc": "Equation library and evaluation", "tags": ["math"]},
            "macro": {"desc": "Re-usable action expansions", "tags": ["workflow"]},
            "token": {"desc": "Token provenance awareness", "tags": ["economy", "repo"]}
        }

    def define(self, key: str, desc: str, tags: List[str]) -> Dict[str, Any]:
        self.terms[key] = {"desc": desc, "tags": tags}
        audit({"action": "lexicon.define", "key": key})
        return {"ok": True, "key": key}

    def info(self, key: str) -> Dict[str, Any]:
        return {"key": key, "data": self.terms.get(key, {"desc": "unknown", "tags": []})}

class MacroEngine:
    """
    Defines simple macros that expand into Octave or semantic actions.
    """
    def __init__(self):
        self.macros: Dict[str, Dict[str, Any]] = {
            "hello": {"type": "print", "content": "Hello from Octave Semantic OS!"},
            "energy_budget": {"type": "equation", "expr": "base * (1 + scale)"},
            "play_scale": {"type": "music", "seq": "C4:0.5,D4:0.5,E4:0.5,F4:0.5,G4:0.5,A4:0.5,B4:0.5,C5:1"}
        }

    def define(self, name: str, macro: Dict[str, Any]) -> Dict[str, Any]:
        self.macros[name] = macro
        audit({"action": "macro.define", "name": name})
        return {"ok": True, "name": name}

    def expand(self, name: str) -> Dict[str, Any]:
        m = self.macros.get(name)
        if not m:
            return {"ok": False, "error": "macro not found"}
        audit({"action": "macro.expand", "name": name})
        return {"ok": True, "macro": m}

# -----------------------------------------------------------------------------
# Helpers: sanitization, command detection, and dispatch
# -----------------------------------------------------------------------------

SAFE_OUT_PATTERNS = [
    re.compile(r".*warning.*", re.IGNORECASE),
    re.compile(r".*error.*", re.IGNORECASE)
]

def sanitize_output(line: str) -> str:
    # For now, we pass through; can redact certain paths or secrets if needed.
    return line

def is_semantic_command(cmd: str) -> bool:
    return cmd.strip().startswith(":")  # colon prefix indicates semantic OS command

def parse_semantic_command(cmd: str) -> Tuple[str, List[str]]:
    """
    :help
    :music C4:1,D4:1
    :eq add kinetic "0.5 * m * v^2"
    :eq set m 70
    :eq eval kinetic
    :macro expand play_scale
    :macro define my_hi {"type":"print","content":"hi"}
    :config show
    :config set tempo_bpm 140
    :transcript export
    """
    parts = cmd.strip()[1:].split()
    name = parts[0] if parts else ""
    args = parts[1:] if len(parts) > 1 else []
    return name, args

def pretty_print_system(msg: str) -> None:
    sys.stdout.write(msg + "\n")
    sys.stdout.flush()

# -----------------------------------------------------------------------------
# Core runner
# -----------------------------------------------------------------------------

class OctaveSemanticOS:
    def __init__(self, cfg: Dict[str, Any]):
        self.cfg = cfg
        self.equations = EquationLibrary()
        self.music = MusicSymbolOS(
            tempo_bpm=cfg["music"]["tempo_bpm"],
            amplitude=cfg["music"]["amplitude"],
            sample_rate=cfg["music"]["sample_rate"],
            wave=cfg["music"]["default_wave"]
        )
        self.lexicon = Lexicon()
        self.macros = MacroEngine()
        self.process: Optional[subprocess.Popen] = None
        self.log_file = ensure_log_dir()

    def banner(self) -> None:
        for line in self.cfg["banner_lines"]:
            pretty_print_system(line)

    def start_octave(self) -> bool:
        try:
            self.process = subprocess.Popen(
                self.cfg["octave_cmd"],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            time.sleep(0.5)
            audit({"action": "octave.start", "cmd": self.cfg["octave_cmd"]})
            return True
        except FileNotFoundError:
            pretty_print_system("\nError: Octave is not installed or not in PATH.")
            pretty_print_system("Please install GNU Octave to use this tool.")
            pretty_print_system("  Ubuntu/Debian: sudo apt-get install octave")
            pretty_print_system("  macOS: brew install octave")
            audit({"action": "octave.error", "type": "FileNotFoundError"})
            return False

    def stop_octave(self) -> None:
        if self.process and self.process.poll() is None:
            self.process.terminate()
            try:
                self.process.wait(timeout=2)
            except:
                pass
        audit({"action": "octave.stop"})

    def prompt(self) -> None:
        sys.stdout.write(self.cfg["prompt"])
        sys.stdout.flush()

    def read_octave_output(self) -> List[str]:
        lines = []
        time.sleep(0.2)
        while True:
            if self.process is None:
                break
            ready, _, _ = select.select([self.process.stdout], [], [], 0.1)
            if not ready:
                break
            line = self.process.stdout.readline()
            if not line:
                break
            out_line = sanitize_output(line) if self.cfg["sanitize_output"] else line
            sys.stdout.write(out_line)
            sys.stdout.flush()
            lines.append(out_line.rstrip("\n"))
        for line in lines:
            if line.strip():
                log_message(self.log_file, "OUT", line)
                append_transcript("octave", line)
        return lines

    # -----------------------------
    # Semantic command handlers
    # -----------------------------

    def cmd_help(self) -> None:
        text = """
Semantic OS commands:
  :help                         Show this help
  :config show                  Display current config
  :config set <key> <value>     Set a config value (e.g., tempo_bpm 140)
  :transcript export            Export session transcript to artifacts
  :eq add <name> "<expr>"       Add equation
  :eq set <var> <value>         Set variable for equations
  :eq eval <nameOrExpr>         Evaluate equation or raw expression
  :music samples "<seq>"        Generate samples for sequence (JSON artifact)
  :music cmds "<seq>"           Generate Octave commands for sequence (artifact)
  :macro expand <name>          Expand a macro
  :macro define <name> <json>   Define a macro from JSON
  :lex define <key> <desc> [tags,...]  Define a lexicon term
  :lex info <key>               Info about a lexicon term
        """.strip("\n")
        pretty_print_system(text)
        audit({"action": "semantic.help"})
        log_message(self.log_file, "SYS", "help shown")

    def cmd_config_show(self) -> None:
        pretty_print_system(json.dumps(self.cfg, indent=2))
        audit({"action": "config.show"})
        artifact(f"octave_config_{int(time.time())}", self.cfg)

    def cmd_config_set(self, key: str, value: str) -> None:
        # Only support simple nested keys: music.tempo_bpm
        if "." in key:
            root, child = key.split(".", 1)
            if root in self.cfg and isinstance(self.cfg[root], dict):
                # convert numeric if possible
                v: Any = value
                try:
                    if "." in value:
                        v = float(value)
                    else:
                        v = int(value)
                except:
       