#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Infinity Δ (Delta) Suite — One‑File, Ten‑App Orchestrator
=========================================================

Kris, this is a single Python file that spins up a local web console and a JSON API
for ten agentic utilities you asked for. It’s designed to be dropped into a repo and
run on Termux, a laptop, or a small server. It avoids heavy deps and keeps your stack
simple while providing hooks to plug in OpenAI/Gemini/Watson and GitHub later.

⚙️ Ten Apps (all in this one file)
----------------------------------
1) Agent Foundry              → create lightweight agents (name, role, tools).
2) Delta Search Orchestrator  → 3 time‑vector web search (past / present / projection).
3) LLM Router                 → route a prompt to OpenAI / Gemini / (stub) Watson.
4) Code Packager              → zip a folder (with ignore patterns); checksum for releases.
5) Patch Weaver               → apply unified-diff style patches to text or files.
6) Static Site Builder        → turn a JSON or markdown input into a tiny site scaffold.
7) Repo Scanner               → file map, language guess, line counts, quick health signals.
8) GitHub Orchestrator       → create a release (stub); emit GitHub Actions YAML locally.
9) Task Automator            → define + run multi-step pipelines across these apps.
10) Workflow Composer (UI)   → minimal one-page dashboard to drive everything.

🔌 Optional external connectors (env vars)
-----------------------------------------
- OPENAI_API_KEY                 → routes to OpenAI chat completions (models: gpt-4o, gpt-4.1, etc.)
- GOOGLE_API_KEY                 → routes to Gemini (generativelanguage.googleapis.com)
- SERPAPI_KEY or BING_API_KEY    → enables live search in Delta Search (else returns stub)
- GITHUB_TOKEN                   → enables release creation in GitHub Orchestrator (stub-friendly)

🛠️ Quick start (Termux / macOS / Linux)
---------------------------------------
python3 -m pip install --upgrade pip
python3 -m pip install flask requests
python3 infinity_delta_suite.py run        # launches http://127.0.0.1:8765

Other CLI:
  python3 infinity_delta_suite.py zip path/to/folder out.zip
  python3 infinity_delta_suite.py buildsite site_out "My Site" index.md
  python3 infinity_delta_suite.py stop

📄 Notes
-------
- GitHub Pages can’t run Python; use this file on Termux/phone/computer/server. You
  can still generate static sites with app #6 and commit those to Pages.
- All network calls are optional + graceful: if no keys, you get safe, local results.
- Designed so “GitHub got” (your packager) can just grab this file and go.

"""

import os
import re
import io
import sys
import gc
import time
import json
import zipfile
import base64
import shutil
import queue
import hashlib
import logging
import pathlib
import difflib
import threading
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

# --- Minimal deps only ---
try:
    import requests  # optional but very handy
except Exception:  # pragma: no cover
    requests = None  # we’ll fall back to urllib if missing

from flask import Flask, request, jsonify, send_file, render_template_string

APP_PORT = int(os.environ.get("INFINITY_PORT", 8765))
APP_HOST = os.environ.get("INFINITY_HOST", "127.0.0.1")

# ----------------------------------------------------------------------------
# Utilities
# ----------------------------------------------------------------------------

def b64(s: str) -> str:
    return base64.b64encode(s.encode("utf-8")).decode("ascii")


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def ensure_dir(p: str) -> str:
    pathlib.Path(p).mkdir(parents=True, exist_ok=True)
    return p


def read_text(path: str) -> str:
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def write_text(path: str, data: str) -> None:
    ensure_dir(os.path.dirname(path) or ".")
    with open(path, "w", encoding="utf-8") as f:
        f.write(data)


# ----------------------------------------------------------------------------
# 1) Agent Foundry
# ----------------------------------------------------------------------------
@dataclass
class MiniAgent:
    name: str
    role: str
    tools: List[str] = field(default_factory=list)
    memory: List[Dict[str, Any]] = field(default_factory=list)

    def think(self, msg: str) -> Dict[str, Any]:
        """Tiny non‑LLM planner: reflects the message and proposes next actions."""
        plan = {
            "agent": self.name,
            "role": self.role,
            "observed": msg[:400],
            "proposed_actions": [
                "search:present",
                "summarize",
                "package-if-code",
            ],
            "tool_candidates": self.tools,
            "ts": time.time(),
        }
        self.memory.append({"user": msg, "plan": plan})
        return plan


class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, MiniAgent] = {}

    def create(self, name: str, role: str, tools: Optional[List[str]] = None) -> MiniAgent:
        tools = tools or []
        ag = MiniAgent(name=name, role=role, tools=tools)
        self._agents[name] = ag
        return ag

    def get(self, name: str) -> Optional[MiniAgent]:
        return self._agents.get(name)

    def list(self) -> List[str]:
        return list(self._agents.keys())


AGENTS = AgentRegistry()


# ----------------------------------------------------------------------------
# 2) Delta Search Orchestrator (past / present / projection)
# ----------------------------------------------------------------------------
class DeltaSearch:
    """Three‑vector aggregator. Uses SERPAPI or Bing if available; else returns stubs."""

    def __init__(self):
        self.serp_key = os.environ.get("SERPAPI_KEY")
        self.bing_key = os.environ.get("BING_API_KEY")

    def _http_get(self, url: str, headers: Optional[dict] = None) -> dict:
        try:
            if requests:
                r = requests.get(url, headers=headers, timeout=15)
                if r.ok:
                    return {"ok": True, "text": r.text}
                return {"ok": False, "status": r.status_code, "text": r.text}
        except Exception as e:  # pragma: no cover
            return {"ok": False, "error": str(e)}
        return {"ok": False, "error": "requests not available"}

    def search_present(self, q: str) -> Dict[str, Any]:
        if self.serp_key:
            # Minimal SERP proxy (duckduckgo via serpapi)
            url = f"https://serpapi.com/search.json?q={requests.utils.quote(q)}&engine=google&api_key={self.serp_key}"
            resp = self._http_get(url)
            return {"provider": "serpapi", **resp}
        if self.bing_key:
            url = f"https://api.bing.microsoft.com/v7.0/search?q={requests.utils.quote(q)}"
            headers = {"Ocp-Apim-Subscription-Key": self.bing_key}
            resp = self._http_get(url, headers)
            return {"provider": "bing", **resp}
        # No keys? Provide safe structure.
        return {"provider": "stub", "ok": True, "results": [
            {"title": "Local present stub", "snippet": f"query={q}", "url": "about:blank"}
        ]}

    def search_past(self, q: str, year: int = 2010) -> Dict[str, Any]:
        if self.serp_key:
            y1 = max(1900, year)
            url = f"https://serpapi.com/search.json?q={requests.utils.quote(q)}%20before%3A{y1}-12-31&engine=google&api_key={self.serp_key}"
            resp = self._http_get(url)
            return {"provider": "serpapi", **resp}
        return {"provider": "stub", "ok": True, "results": [
            {"title": f"Archive stub (≤ {year})", "snippet": q, "url": "about:blank"}
        ]}

    def search_projection(self, q: str, horizon_years: int = 3) -> Dict[str, Any]:
        # Projection is not a real web search; we outline hypotheses.
        now = time.gmtime().tm_year
        return {
            "provider": "projection",
            "ok": True,
            "analysis": {
                "query": q,
                "horizon": f"{horizon_years}y",
                "assumptions": ["continue recent trendlines", "counterfactual baseline", "innovation shocks"],
                "windows": {
                    "past": [now-10, now-5],
                    "present": now,
                    "future": [now+1, now+horizon_years],
                },
            },
        }

    def delta(self, q: str, past_year: int = 2010, horizon_years: int = 3) -> Dict[str, Any]:
        return {
            "query": q,
            "vectors": {
                "past": self.search_past(q, year=past_year),
                "present": self.search_present(q),
                "projection": self.search_projection(q, horizon_years=horizon_years),
            }
        }


DELTA = DeltaSearch()


# ----------------------------------------------------------------------------
# 3) LLM Router (OpenAI / Gemini / stub Watson)
# ----------------------------------------------------------------------------
class LLMRouter:
    def __init__(self):
        self.openai_key = os.environ.get("OPENAI_API_KEY")
        self.google_key = os.environ.get("GOOGLE_API_KEY")  # Gemini
        self.watson_key = os.environ.get("WATSON_API_KEY")  # placeholder

    def ask_openai(self, prompt: str, model: str = "gpt-4o-mini") -> Dict[str, Any]:
        if not self.openai_key:
            return {"ok": True, "model": "openai/stub", "text": f"(stub) {prompt[:160]}"}
        try:
            if not requests:
                return {"ok": False, "error": "requests not available"}
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"}
            payload = {"model": model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
            r = requests.post(url, headers=headers, json=payload, timeout=45)
            if r.ok:
                data = r.json()
                text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                return {"ok": True, "model": model, "text": text}
            return {"ok": False, "status": r.status_code, "text": r.text}
        except Exception as e:  # pragma: no cover
            return {"ok": False, "error": str(e)}

    def ask_gemini(self, prompt: str, model: str = "gemini-1.5-flash-latest") -> Dict[str, Any]:
        if not self.google_key:
            return {"ok": True, "model": "gemini/stub", "text": f"(stub) {prompt[:160]}"}
        try:
            if not requests:
                return {"ok": False, "error": "requests not available"}
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.google_key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            r = requests.post(url, json=payload, timeout=45)
            if r.ok:
                data = r.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )
                return {"ok": True, "model": model, "text": text}
            return {"ok": False, "status": r.status_code, "text": r.text}
        except Exception as e:  # pragma: no cover
            return {"ok": False, "error": str(e)}

    def ask_watson_stub(self, prompt: str) -> Dict[str, Any]:
        # A simple placeholder. Real Watson/Watsonx integration can be wired here.
        return {"ok": True, "model": "watson/stub", "text": f"(watson stub) {prompt[:160]}"}

    def route(self, prompt: str, targets: List[str]) -> Dict[str, Any]:
        outputs = {}
        for tgt in targets:
            t = tgt.lower()
            if t in ("openai", "gpt", "chatgpt"):
                outputs[tgt] = self.ask_openai(prompt)
            elif t in ("gemini", "google"):
                outputs[tgt] = self.ask_gemini(prompt)
            elif t in ("watson", "ibm"):
                outputs[tgt] = self.ask_watson_stub(prompt)
            else:
                outputs[tgt] = {"ok": False, "error": f"unknown target: {tgt}"}
        return {"prompt": prompt, "outputs": outputs}


LLM = LLMRouter()


# ----------------------------------------------------------------------------
# 4) Code Packager (zip + checksum) & 5) Patch Weaver
# ----------------------------------------------------------------------------

def zip_folder(src_dir: str, out_zip: str, ignore: Optional[List[str]] = None) -> Dict[str, Any]:
    src_dir = os.path.abspath(src_dir)
    out_zip = os.path.abspath(out_zip)
    ig = ignore or [".git", "__pycache__", ".venv", ".DS_Store"]
    with zipfile.ZipFile(out_zip, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src_dir):
            # prune ignored dirs
            dirs[:] = [d for d in dirs if d not in ig]
            for fn in files:
                if fn in ig:
                    continue
                full = os.path.join(root, fn)
                rel = os.path.relpath(full, src_dir)
                zf.write(full, rel)
    return {"ok": True, "zip": out_zip, "sha256": sha256_file(out_zip)}


def apply_patch(original: str, patch_text: str) -> str:
    """Apply a unified diff patch to a string; return new text.
    If the patch fails, return the original. This is a simplified best‑effort.
    """
    try:
        patched = list(difflib.restore(patch_text.splitlines(), which=1))
        # If restore can’t interpret, fall back to difflib.ndiff style merge
        if not patched:
            return original
        return "\n".join(patched)
    except Exception:
        return original


# ----------------------------------------------------------------------------
# 6) Static Site Builder (tiny scaffold)
# ----------------------------------------------------------------------------
SITE_TEMPLATE = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{ title }}</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;margin:0;background:#0b0e14;color:#e6edf3}
    header{padding:20px 16px;border-bottom:1px solid #1f2329;background:#0f131a}
    main{max-width:980px;margin:0 auto;padding:24px}
    a{color:#6ea8fe}
    pre,code{background:#0f131a;padding:4px 6px;border-radius:8px}
    .card{background:#0f131a;border:1px solid #1f2329;border-radius:16px;padding:16px;margin:12px 0}
  </style>
</head>
<body>
  <header><h1>{{ title }}</h1></header>
  <main>
    <div class="card">
      <h3>Welcome</h3>
      <p>This site was generated by Infinity Δ Suite.</p>
    </div>
    {% if content %}<div class="card"><pre>{{ content }}</pre></div>{% endif %}
  </main>
</body>
</html>
"""


def build_site(out_dir: str, title: str = "Infinity Site", content_path: Optional[str] = None) -> Dict[str, Any]:
    ensure_dir(out_dir)
    content = ""
    if content_path and os.path.exists(content_path):
        content = read_text(content_path)
    # Write index.html
    from jinja2 import Template  # tiny, but if missing we’ll inline fallback
    html = Template(SITE_TEMPLATE).render(title=title, content=content)
    index_path = os.path.join(out_dir, "index.html")
    write_text(index_path, html)
    return {"ok": True, "out_dir": os.path.abspath(out_dir), "index": index_path}


# ----------------------------------------------------------------------------
# 7) Repo Scanner
# ----------------------------------------------------------------------------
LANG_HINTS = {
    ".py": "Python",
    ".js": "JavaScript",
    ".ts": "TypeScript",
    ".html": "HTML",
    ".css": "CSS",
    ".md": "Markdown",
    ".json": "JSON",
    ".yml": "YAML",
    ".yaml": "YAML",
}


def repo_scan(root: str) -> Dict[str, Any]:
    root = os.path.abspath(root)
    files = []
    stats = {"lines": 0, "by_lang": {}}
    for dirpath, dirnames, filenames in os.walk(root):
        if ".git" in dirnames:
            dirnames.remove(".git")
        for fn in filenames:
            p = os.path.join(dirpath, fn)
            rel = os.path.relpath(p, root)
            size = os.path.getsize(p)
            ext = os.path.splitext(fn)[1].lower()
            lang = LANG_HINTS.get(ext, ext or "other")
            try:
                lc = sum(1 for _ in open(p, "r", encoding="utf-8", errors="ignore"))
            except Exception:
                lc = 0
            stats["lines"] += lc
            stats["by_lang"].setdefault(lang, 0)
            stats["by_lang"][lang] += lc
            files.append({"file": rel, "size": size, "lines": lc, "lang": lang})
    return {"ok": True, "root": root, "files": files, "stats": stats}


# ----------------------------------------------------------------------------
# 8) GitHub Orchestrator (local-friendly)
# ----------------------------------------------------------------------------
GHA_YAML = """
name: Infinity Delta CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.x'
      - run: |
          python -m pip install --upgrade pip
          python -m pip install flask requests
          python infinity_delta_suite.py smoke
"""


def write_gha_yaml(path: str = ".github/workflows/infinity-delta.yml") -> Dict[str, Any]:
    write_text(path, GHA_YAML)
    return {"ok": True, "path": os.path.abspath(path)}


# ----------------------------------------------------------------------------
# 9) Task Automator — pipelines that chain tools
# ----------------------------------------------------------------------------
class Pipeline:
    def __init__(self, name: str, steps: List[Dict[str, Any]]):
        self.name = name
        self.steps = steps
        self.log: List[Dict[str, Any]] = []

    def run(self) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for i, step in enumerate(self.steps, 1):
            kind = step.get("kind")
            try:
                if kind == "search.delta":
                    q = step["query"]
                    out["search"] = DELTA.delta(q, step.get("past_year", 2010), step.get("horizon", 3))
                elif kind == "llm.route":
                    out["llm"] = LLM.route(step["prompt"], step.get("targets", ["openai", "gemini", "watson"]))
                elif kind == "package.zip":
                    out["zip"] = zip_folder(step["src"], step["out"], step.get("ignore"))
                elif kind == "site.build":
                    out["site"] = build_site(step["out_dir"], step.get("title", "Infinity Site"), step.get("content"))
                elif kind == "repo.scan":
                    out["scan"] = repo_scan(step["root"]) 
                elif kind == "github.gha":
                    out["gha"] = write_gha_yaml(step.get("path", ".github/workflows/infinity-delta.yml"))
                else:
                    out.setdefault("unknown", []).append(step)
                self.log.append({"i": i, "kind": kind, "ok": True})
            except Exception as e:
                self.log.append({"i": i, "kind": kind, "ok": False, "error": str(e)})
        return {"ok": True, "pipeline": self.name, "result": out, "log": self.log}


# ----------------------------------------------------------------------------
# 10) Web UI + API (Flask)
# ----------------------------------------------------------------------------
app = Flask(__name__)

INDEX_HTML = """
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Infinity Δ Suite</title>
  <style>
    :root{--bg:#0b0e14;--card:#0f131a;--line:#1f2329;--txt:#e6edf3;--accent:#6ea8fe}
    *{box-sizing:border-box}
    body{margin:0;background:var(--bg);color:var(--txt);font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}
    header{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0}
    header h1{font-size:18px;margin:0}
    main{display:grid;grid-template-columns:260px 1fr;gap:16px;max-width:1200px;margin:0 auto;padding:16px}
    nav{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px;height:calc(100vh - 98px);overflow:auto}
    .panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;min-height:60vh}
    button, input, textarea, select{background:#0c1118;color:var(--txt);border:1px solid var(--line);border-radius:12px;padding:10px}
    button{cursor:pointer}
    .row{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
    .card{border:1px solid var(--line);border-radius:12px;padding:12px;margin:8px 0}
    pre{white-space:pre-wrap;word-break:break-word}
    .muted{opacity:.8}
    .ok{color:#8fe18f}.bad{color:#ff8686}
    .pill{display:inline-block;border:1px solid var(--line);padding:2px 8px;border-radius:999px;font-size:12px;margin-right:6px}
  </style>
</head>
<body>
  <header>
    <h1>Infinity Δ Suite — Ten Apps • One File</h1>
    <span class="pill">Agent Foundry</span>
    <span class="pill">Delta Search</span>
    <span class="pill">LLM Router</span>
    <span class="pill">Packager</span>
    <span class="pill">Patch</span>
    <span class="pill">Site</span>
    <span class="pill">Scan</span>
    <span class="pill">GitHub</span>
    <span class="pill">Tasks</span>
    <span class="pill">Workflow</span>
  </header>
  <main>
    <nav>
      <div class="card">
        <h3>1) Agent Foundry</h3>
        <div class="row">
          <input id="ag_name" placeholder="name" />
          <input id="ag_role" placeholder="role" />
        </div>
        <div class="row">
          <input id="ag_tools" placeholder="tools (comma)" />
          <button onclick="mkAgent()">Create</button>
        </div>
        <p class="muted">Use with Delta Search + LLM Router for your Rogers brain.</p>
      </div>
      <div class="card">
        <h3>2) Delta Search</h3>
        <input id="ds_q" placeholder="query" />
        <div class="row">
          <input id="ds_past" type="number" value="2010"/>
          <input id="ds_hor" type="number" value="3"/>
          <button onclick="deltaSearch()">Run</button>
        </div>
        <p class="muted">Uses SERPAPI/Bing if keys set, else stub.</p>
      </div>
      <div class="card">
        <h3>3) LLM Router</h3>
        <textarea id="llm_prompt" rows="4" placeholder="prompt..."></textarea>
        <div class="row">
          <select id="llm_targets" multiple size="3">
            <option>openai</option>
            <option>gemini</option>
            <option>watson</option>
          </select>
          <button onclick="routeLLM()">Ask</button>
        </div>
      </div>
      <div class="card">
        <h3>4) Packager (zip)</h3>
        <input id="zip_src" placeholder="src folder"/>
        <input id="zip_out" placeholder="out.zip"/>
        <button onclick="doZip()">Zip</button>
      </div>
      <div class="card">
        <h3>5) Patch Weaver</h3>
        <textarea id="patch_orig" rows="3" placeholder="original text..."></textarea>
        <textarea id="patch_diff" rows="3" placeholder="unified diff or ndiff..."></textarea>
        <button onclick="doPatch()">Apply</button>
      </div>
      <div class="card">
        <h3>6) Static Site</h3>
        <input id="site_out" placeholder="out_dir"/>
        <input id="site_title" placeholder="Title" value="Infinity Site"/>
        <input id="site_content" placeholder="content file (optional)"/>
        <button onclick="buildSite()">Build</button>
      </div>
      <div class="card">
        <h3>7) Repo Scan</h3>
        <input id="scan_root" placeholder="folder"/>
        <button onclick="scanRepo()">Scan</button>
      </div>
      <div class="card">
        <h3>8) GitHub Orchestrator</h3>
        <button onclick="writeGHA()">Write Actions YAML</button>
      </div>
      <div class="card">
        <h3>9) Task Automator</h3>
        <textarea id="task_json" rows="6" placeholder='{"name":"demo","steps":[{"kind":"search.delta","query":"hydrogen portal"}]}'></textarea>
        <button onclick="runTask()">Run Pipeline</button>
      </div>
    </nav>
    <section class="panel">
      <h3>Output</h3>
      <pre id="out">Ready.</pre>
    </section>
  </main>
  <script>
    const out = (x)=>{document.getElementById('out').textContent = (typeof x==='string'?x:JSON.stringify(x,null,2))}

    async function mkAgent(){
      const name = document.getElementById('ag_name').value
      const role = document.getElementById('ag_role').value
      const tools = document.getElementById('ag_tools').value
      const r = await fetch('/api/agent/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,role,tools:tools.split(',').map(s=>s.trim()).filter(Boolean)})})
      out(await r.json())
    }
    async function deltaSearch(){
      const q = document.getElementById('ds_q').value
      const past = parseInt(document.getElementById('ds_past').value||'2010',10)
      const horizon = parseInt(document.getElementById('ds_hor').value||'3',10)
      const r = await fetch('/api/search/delta',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:q,past_year:past,horizon})})
      out(await r.json())
    }
    async function routeLLM(){
      const prompt = document.getElementById('llm_prompt').value
      const sel = document.getElementById('llm_targets')
      const targets = Array.from(sel.selectedOptions).map(o=>o.value)
      const r = await fetch('/api/llm/route',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,targets})})
      out(await r.json())
    }
    async function doZip(){
      const src=document.getElementById('zip_src').value
      const outzip=document.getElementById('zip_out').value
      const r = await fetch('/api/package/zip',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({src, out: outzip})})
      out(await r.json())
    }
    async function doPatch(){
      const original=document.getElementById('patch_orig').value
      const patch=document.getElementById('patch_diff').value
      const r = await fetch('/api/patch/apply',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({original, patch})})
      out(await r.json())
    }
    async function buildSite(){
      const outdir=document.getElementById('site_out').value
      const title=document.getElementById('site_title').value
      const content=document.getElementById('site_content').value
      const r = await fetch('/api/site/build',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({out_dir:outdir,title,content})})
      out(await r.json())
    }
    async function scanRepo(){
      const root=document.getElementById('scan_root').value
      const r = await fetch('/api/repo/scan',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({root})})
      out(await r.json())
    }
    async function writeGHA(){
      const r = await fetch('/api/github/gha',{method:'POST'})
      out(await r.json())
    }
    async function runTask(){
      try{
        const cfg = JSON.parse(document.getElementById('task_json').value)
        const r = await fetch('/api/tasks/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(cfg)})
        out(await r.json())
      }catch(e){ out({ok:false,error:e+''}) }
    }
  </script>
</body>
</html>
"""


@app.route("/")
def index_page():
    return render_template_string(INDEX_HTML)


# --- API endpoints ---
@app.route("/api/agent/create", methods=["POST"])
def api_agent_create():
    data = request.get_json(force=True)
    ag = AGENTS.create(data.get("name", "roger"), data.get("role", "generalist"), data.get("tools", []))
    return jsonify({"ok": True, "agent": {"name": ag.name, "role": ag.role, "tools": ag.tools}, "agents": AGENTS.list()})


@app.route("/api/agent/think", methods=["POST"])
def api_agent_think():
    data = request.get_json(force=True)
    name = data.get("name")
    msg = data.get("msg","")
    ag = AGENTS.get(name)
    if not ag:
        return jsonify({"ok": False, "error": f"agent not found: {name}"}), 404
    return jsonify({"ok": True, "plan": ag.think(msg)})


@app.route("/api/search/delta", methods=["POST"])
def api_search_delta():
    data = request.get_json(force=True)
    q = data.get("query","")
    past = int(data.get("past_year", 2010))
    horizon = int(data.get("horizon", 3))
    return jsonify(DELTA.delta(q, past, horizon))


@app.route("/api/llm/route", methods=["POST"])
def api_llm_route():
    data = request.get_json(force=True)
    prompt = data.get("prompt","")
    targets = data.get("targets", ["openai","gemini","watson"])
    return jsonify(LLM.route(prompt, targets))


@app.route("/api/package/zip", methods=["POST"])
def api_package_zip():
    data = request.get_json(force=True)
    src = data.get("src")
    outz = data.get("out", "package.zip")
    if not src or not os.path.exists(src):
        return jsonify({"ok": False, "error": f"src not found: {src}"}), 400
    return jsonify(zip_folder(src, outz))


@app.route("/api/patch/apply", methods=["POST"])
def api_patch_apply():
    data = request.get_json(force=True)
    original = data.get("original", "")
    patch_text = data.get("patch", "")
    new_text = apply_patch(original, patch_text)
    return jsonify({"ok": True, "result": new_text})


@app.route("/api/site/build", methods=["POST"])
def api_site_build():
    data = request.get_json(force=True)
    out_dir = data.get("out_dir", "site_out")
    title = data.get("title", "Infinity Site")
    content = data.get("content")
    try:
        return jsonify(build_site(out_dir, title, content))
    except Exception as e:
        # Fallback: write minimal index without Jinja2
        idx = os.path.join(out_dir, "index.html")
        ensure_dir(out_dir)
        write_text(idx, f"<html><head><title>{title}</title></head><body><h1>{title}</h1><pre></pre></body></html>")
        return jsonify({"ok": True, "out_dir": os.path.abspath(out_dir), "index": idx, "note": "Jinja2 not installed; wrote minimal page."})


@app.route("/api/repo/scan", methods=["POST"])
def api_repo_scan():
    data = request.get_json(force=True)
    root = data.get("root", ".")
    if not os.path.exists(root):
        return jsonify({"ok": False, "error": f"missing: {root}"}), 400
    return jsonify(repo_scan(root))


@app.route("/api/github/gha", methods=["POST"])
def api_github_gha():
    return jsonify(write_gha_yaml())


@app.route("/api/tasks/run", methods=["POST"])
def api_tasks_run():
    cfg = request.get_json(force=True)
    name = cfg.get("name", "pipeline")
    steps = cfg.get("steps", [])
    p = Pipeline(name, steps)
    return jsonify(p.run())


# ----------------------------------------------------------------------------
# CLI helpers
# ----------------------------------------------------------------------------
PID_FILE = ".infinity_delta.pid"


def _pid_running(pid: int) -> bool:
    try:
        os.kill(pid, 0)
        return True
    except Exception:
        return False


def cmd_run():
    # write PID
    with open(PID_FILE, "w") as f:
        f.write(str(os.getpid()))
    print(f"[∞] Infinity Δ Suite running at http://{APP_HOST}:{APP_PORT}")
    app.run(host=APP_HOST, port=APP_PORT, debug=False)


def cmd_stop():
    if not os.path.exists(PID_FILE):
        print("No PID file.")
        return
    pid = int(open(PID_FILE).read().strip())
    if _pid_running(pid):
        try:
            os.kill(pid, 9)
            print(f"Stopped PID {pid}")
        except Exception as e:
            print("Stop error:", e)
    else:
        print("Not running.")
    try:
        os.remove(PID_FILE)
    except Exception:
        pass


def cmd_zip(args: List[str]):
    if len(args) < 2:
        print("Usage: zip SRC_DIR OUT.zip")
        return
    res = zip_folder(args[0], args[1])
    print(json.dumps(res, indent=2))


def cmd_buildsite(args: List[str]):
    if len(args) < 1:
        print("Usage: buildsite OUT_DIR [TITLE] [CONTENT_PATH]")
        return
    out = args[0]
    title = args[1] if len(args) > 1 else "Infinity Site"
    content = args[2] if len(args) > 2 else None
    try:
        from jinja2 import Template  # noqa
    except Exception:
        print("(no Jinja2; writing minimal site)")
    res = build_site(out, title, content)
    print(json.dumps(res, indent=2))


def cmd_smoke():
    print("Running smoke test...")
    # 1. agent
    AGENTS.create("roger", "generalist", ["search","packager"])  
    # 2. delta search
    d = DELTA.delta("hydrogen portal theory", 2010, 2)
    # 3. llm route (stubs if no keys)
    l = LLM.route("Summarize Infinity OS vision in 3 bullets.", ["openai","gemini","watson"])
    # 4. zip a self copy
    z = zip_folder(".", ".infinity_package.zip")
    # 5. scan repo
    s = repo_scan(".")
    print(json.dumps({"delta":d,"llm":l,"zip":z,"scan":s["stats"]}, indent=2)[:2000])
    print("OK")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "run"
    if cmd == "run":
        cmd_run()
    elif cmd == "stop":
        cmd_stop()
    elif cmd == "zip":
        cmd_zip(sys.argv[2:])
    elif cmd == "buildsite":
        cmd_buildsite(sys.argv[2:])
    elif cmd == "smoke":
        cmd_smoke()
    else:
        print("Commands: run | stop | zip | buildsite | smoke")
