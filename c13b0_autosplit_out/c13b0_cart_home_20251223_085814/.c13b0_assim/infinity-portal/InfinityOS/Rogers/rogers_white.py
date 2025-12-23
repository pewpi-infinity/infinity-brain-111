# rogers_white.py
# Rogers AI server with clean white theme and optional API integration.
#
# Run:
#   pip install flask requests beautifulsoup4 lxml openai
#   python3 rogers_white.py
# Then open http://127.0.0.1:8080
#
# Features:
# - Clean white theme optimized for readability
# - Optional OpenAI API integration (set OPENAI_API_KEY environment variable)
# - Falls back to public endpoints if no API key provided
# - Enhanced AI responses with GPT integration when available

import json, re, time, html, os
from datetime import datetime
from urllib.parse import quote_plus

from flask import Flask, request, jsonify, make_response
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

UA = {"User-Agent": "InfinityRogers/1.0 (+local demo; contact: local@demo)"}

# Optional OpenAI integration
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
USE_OPENAI = bool(OPENAI_API_KEY)

if USE_OPENAI:
    try:
        from openai import OpenAI
        openai_client = OpenAI(api_key=OPENAI_API_KEY)
    except ImportError:
        USE_OPENAI = False
        print("OpenAI package not installed. Run: pip install openai")

def ddg_instant_answer(q: str):
    url = f"https://api.duckduckgo.com/?q={quote_plus(q)}&format=json&no_html=1&skip_disambig=1"
    try:
        r = requests.get(url, headers=UA, timeout=10)
        data = r.json()
        text = data.get("Answer") or data.get("AbstractText") or data.get("Definition") or ""
        source = "DuckDuckGo IA"
        link = data.get("AbstractURL") or f"https://duckduckgo.com/?q={quote_plus(q)}"
        if not text and data.get("RelatedTopics"):
            rt = data["RelatedTopics"][0]
            if isinstance(rt, dict):
                text = rt.get("Text", "") or ""
        return {"source": source, "url": link, "text": text.strip()}
    except Exception as e:
        return {"source": "DuckDuckGo IA", "url": url, "text": f"(error) {e}"}

def wikipedia_summary(q: str):
    search_url = f"https://en.wikipedia.org/w/rest.php/v1/search/title?q={quote_plus(q)}&limit=1"
    try:
        sr = requests.get(search_url, headers=UA, timeout=10)
        sdata = sr.json()
        if sdata.get("pages"):
            key = sdata["pages"][0].get("key")
            if key:
                sum_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote_plus(key)}"
                r = requests.get(sum_url, headers=UA, timeout=10)
                data = r.json()
                extract = data.get("extract", "")
                url = data.get("content_urls", {}).get("desktop", {}).get("page") or f"https://en.wikipedia.org/wiki/{quote_plus(key)}"
                return {"source": "Wikipedia", "url": url, "text": extract.strip()}
    except Exception as e:
        return {"source": "Wikipedia", "url": "https://en.wikipedia.org", "text": f"(error) {e}"}
    return {"source": "Wikipedia", "url": "https://en.wikipedia.org", "text": ""}

def wikidata_blurb(q: str):
    url = f"https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&limit=1&search={quote_plus(q)}"
    try:
        r = requests.get(url, headers=UA, timeout=10)
        data = r.json()
        if data.get("search"):
            item = data["search"][0]
            desc = item.get("description", "")
            title = item.get("label", "")
            item_id = item.get("id", "")
            link = f"https://www.wikidata.org/wiki/{item_id}" if item_id else "https://www.wikidata.org/"
            text = (title + " — " + desc).strip(" —")
            return {"source": "Wikidata", "url": link, "text": text}
    except Exception as e:
        return {"source": "Wikidata", "url": url, "text": f"(error) {e}"}
    return {"source": "Wikidata", "url": "https://www.wikidata.org", "text": ""}

def openai_answer(q: str, context: str = ""):
    """Get answer from OpenAI GPT if API key is available."""
    if not USE_OPENAI:
        return {"source": "OpenAI GPT", "url": "", "text": ""}
    
    try:
        prompt = q
        if context:
            prompt = f"Question: {q}\n\nContext from other sources:\n{context}\n\nProvide a concise answer:"
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are Rogers, a helpful AI assistant. Provide concise, accurate answers."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )
        
        text = response.choices[0].message.content.strip()
        return {"source": "OpenAI GPT", "url": "", "text": text}
    except Exception as e:
        return {"source": "OpenAI GPT", "url": "", "text": f"(error) {e}"}

SOURCES = [ddg_instant_answer, wikipedia_summary, wikidata_blurb]

def merge_summaries(chunks):
    seen = set()
    sentences = []
    for c in chunks:
        text = (c.get("text") or "").strip()
        if not text or "(error)" in text: 
            continue
        for s in re.split(r"(?<=[.!?])\s+", text):
            s = s.strip()
            if 3 <= len(s) <= 240 and s.lower() not in seen:
                seen.add(s.lower())
                sentences.append(s)
    return sentences[:8]

@app.route("/api/ask", methods=["POST"]) 
def api_ask():
    data = request.get_json(force=True, silent=True) or {}
    q = (data.get("question") or "").strip()
    mode = (data.get("mode") or "poll").lower()
    if not q:
        return jsonify({"error": "missing question"}), 400

    answers = []
    
    # Gather data from public sources
    if mode == "poll":
        for fn in SOURCES:
            answers.append(fn(q))
            time.sleep(0.1)
    else:  # chain
        carry = q
        for fn in SOURCES:
            ans = fn(carry)
            answers.append(ans)
            prev = (ans.get("text") or "").strip()
            if prev:
                carry = f"{q}. Prior answer: {prev[:300]}"
    
    # If OpenAI is available, use it to synthesize a better answer
    if USE_OPENAI:
        context = " ".join([a.get("text", "") for a in answers if a.get("text")])
        gpt_answer = openai_answer(q, context[:1000])
        if gpt_answer.get("text") and "(error)" not in gpt_answer.get("text"):
            answers.insert(0, gpt_answer)

    merged = merge_summaries(answers)
    return jsonify({
        "question": q,
        "mode": mode,
        "answers": answers,
        "summary": merged,
        "ai_enabled": USE_OPENAI,
        "ts": datetime.utcnow().isoformat() + "Z",
    })

@app.route("/") 
def index():
    api_status = "✓ OpenAI Enabled" if USE_OPENAI else "Public sources only"
    html_page = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Rogers AI • Infinity Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {{ background: linear-gradient(to bottom, #ffffff, #f8fafc); }}
    .glass {{ background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); }}
  </style>
</head>
<body class="min-h-screen flex flex-col text-neutral-900">
  <!-- Header -->
  <div class="sticky top-0 z-30 glass border-b border-neutral-200 shadow-md">
    <div class="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">R</div>
        <div>
          <div class="text-lg font-bold tracking-tight">Rogers AI</div>
          <div class="text-xs text-neutral-500">{api_status}</div>
        </div>
      </div>
      <div class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">{"AI Mode" if USE_OPENAI else "Free Mode"}</div>
    </div>
  </div>

  <!-- Main -->
  <div class="mx-auto max-w-3xl w-full flex-1 px-4 pt-6 pb-4">
    <div id="chat" class="h-[65vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg p-4 flex flex-col gap-3"></div>

    <!-- Composer -->
    <div class="mt-4 flex items-end gap-2">
      <div class="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-3 shadow-md">
        <textarea id="input" rows="2" placeholder="Ask Rogers anything..." class="w-full resize-none outline-none text-base placeholder:text-neutral-400"></textarea>
      </div>
      <button id="sendBtn" class="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl active:scale-95 transition-all">Send</button>
    </div>

    <!-- Controls -->
    <div class="mt-3 flex items-center gap-4 text-sm">
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="mode" value="poll" checked class="accent-blue-600"> 
        <span>Poll sources</span>
      </label>
      <label class="flex items-center gap-2 cursor-pointer">
        <input type="radio" name="mode" value="chain" class="accent-blue-600"> 
        <span>Chain mode</span>
      </label>
    </div>

    <!-- Info -->
    <div class="mt-6 rounded-xl border border-neutral-200 bg-white p-5 shadow-md">
      <div class="font-bold text-lg mb-2">🤖 {'Enhanced AI Mode' if USE_OPENAI else 'Free Mode - No API Keys'}</div>
      <ul class="list-disc pl-5 space-y-1 text-sm leading-relaxed">
        {'<li>OpenAI GPT integration active for enhanced responses</li>' if USE_OPENAI else '<li>Using public data sources only (DuckDuckGo, Wikipedia, Wikidata)</li>'}
        <li>Multiple sources aggregated for comprehensive answers</li>
        <li>Two modes: <strong>Poll</strong> (parallel) or <strong>Chain</strong> (sequential)</li>
        <li>Clean, fast, and {'AI-powered' if USE_OPENAI else 'privacy-focused'}</li>
        {'<li class="text-amber-600">To enable AI: set OPENAI_API_KEY environment variable</li>' if not USE_OPENAI else ''}
      </ul>
    </div>
  </div>

<script>
  const $ = (s) => document.querySelector(s);
  const chat = $("#chat");
  const input = $("#input");
  const sendBtn = $("#sendBtn");

  addBubble("assistant", "Hello! I'm Rogers, your AI assistant. {'I have enhanced AI capabilities enabled.' if USE_OPENAI else 'Running in free mode with public sources.'} Ask me anything!");

  function addBubble(role, text) {{
    const wrap = document.createElement("div");
    wrap.className = "flex " + (role === "user" ? "justify-end" : "justify-start");
    const b = document.createElement("div");
    b.className = "max-w-[85%] rounded-2xl px-4 py-3 shadow-md " + 
      (role === "user" 
        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white" 
        : "bg-gradient-to-r from-neutral-50 to-neutral-100 text-neutral-900 border border-neutral-200");
    b.style.wordBreak = "break-word";
    b.textContent = text;
    wrap.appendChild(b);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }}

  function getMode() {{
    const checked = document.querySelector("input[name='mode']:checked");
    return checked ? checked.value : "poll";
  }}

  async function ask(question) {{
    try {{
      const r = await fetch("/api/ask", {{
        method: "POST",
        headers: {{"Content-Type": "application/json"}},
        body: JSON.stringify({{question, mode: getMode()}})
      }});
      const data = await r.json();
      const parts = [];
      if (data.summary && data.summary.length) {{
        parts.push(data.summary.join(" "));
      }}
      if (data.answers && data.answers.length) {{
        const srcs = data.answers.filter(a => (a.text || "").trim().length > 0 && !a.text.includes("(error)")).map(a => `${{a.source}}`);
        if (srcs.length) {{
          parts.push("\\n\\nSources: " + srcs.join(" • "));
        }}
      }}
      addBubble("assistant", parts.join("\\n\\n") || "No results found. Try rephrasing your question.");
    }} catch(e) {{
      addBubble("assistant", "Network error. Please try again.");
    }}
  }}

  sendBtn.addEventListener("click", () => {{
    const q = input.value.trim();
    if (!q) return;
    addBubble("user", q);
    input.value = "";
    ask(q);
  }});

  input.addEventListener("keydown", (e) => {{
    if (e.key === "Enter" && !e.shiftKey) {{
      e.preventDefault();
      sendBtn.click();
    }}
  }});
</script>
</body>
</html>
"""
    return make_response(html_page)

if __name__ == "__main__":
    print(f"Rogers AI Server starting...")
    print(f"API Mode: {'OpenAI Enabled' if USE_OPENAI else 'Public Sources Only'}")
    print(f"Open http://127.0.0.1:8080")
    app.run(host="127.0.0.1", port=8080, debug=False)
