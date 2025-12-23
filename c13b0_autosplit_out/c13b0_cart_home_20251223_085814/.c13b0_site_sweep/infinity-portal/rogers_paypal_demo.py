
# rogers_paypal_demo.py
# Single-file demo server for Rogers AI (PayPal-styled) with no-key web aggregation.
#
# Run (Termux or any Python 3):
#   pip install flask requests beautifulsoup4 lxml
#   python3 rogers_paypal_demo.py
# Then open http://127.0.0.1:8080
#
# Notes:
# - No API keys. Uses public endpoints: DuckDuckGo Instant Answer, Wikipedia REST, Wikidata.
# - Two modes:
#     * poll  : ask all sources independently and merge
#     * chain : feed previous answer as context to the next source (telephone-style)
# - This is a lightweight demo for local testing. Respect each site's robots/ToS.
# - Not for heavy scraping or commercial use without permission.

import json, re, time, html
from datetime import datetime
from urllib.parse import quote_plus

from flask import Flask, request, jsonify, make_response
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

UA = {"User-Agent": "InfinityRogers/1.0 (+local demo; contact: local@demo)"}

def ddg_instant_answer(q: str):
    url = f"https://api.duckduckgo.com/?q={quote_plus(q)}&format=json&no_html=1&skip_disambig=1"
    try:
        r = requests.get(url, headers=UA, timeout=10)
        data = r.json()
        text = data.get("Answer") or data.get("AbstractText") or data.get("Definition") or ""
        source = "DuckDuckGo IA"
        link = data.get("AbstractURL") or f"https://duckduckgo.com/?q={quote_plus(q)}"
        if not text and data.get("RelatedTopics"):
            # Grab the first related topic snippet if present
            rt = data["RelatedTopics"][0]
            if isinstance(rt, dict):
                text = rt.get("Text", "") or ""
        return {"source": source, "url": link, "text": text.strip()}
    except Exception as e:
        return {"source": "DuckDuckGo IA", "url": url, "text": f"(error) {e}"}

def wikipedia_summary(q: str):
    # First search for a likely title
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

def ddg_snippets(q: str):
    # HTML results page (lightweight). We only take the first snippet.
    url = f"https://duckduckgo.com/html/?q={quote_plus(q)}"
    try:
        r = requests.get(url, headers=UA, timeout=10)
        soup = BeautifulSoup(r.text, "lxml")
        a = soup.select_one("a.result__a")
        snippet = ""
        if a:
            parent = a.find_parent("div", class_="result__body")
            if parent:
                sn = parent.select_one(".result__snippet")
                snippet = sn.get_text(" ", strip=True) if sn else ""
        return {"source": "DuckDuckGo Web", "url": url, "text": snippet}
    except Exception as e:
        return {"source": "DuckDuckGo Web", "url": url, "text": f\"(error) {e}\"}

SOURCES = [ddg_instant_answer, wikipedia_summary, wikidata_blurb, ddg_snippets]

def merge_summaries(chunks):
    # Very simple dedupe + trim. No LLMs.
    seen = set()
    sentences = []
    for c in chunks:
        text = (c.get("text") or "").strip()
        if not text: 
            continue
        # split into sentences
        for s in re.split(r"(?<=[.!?])\\s+", text):
            s = s.strip()
            if 3 <= len(s) <= 240 and s.lower() not in seen:
                seen.add(s.lower())
                sentences.append(s)
    # Return up to ~8 distinct sentences
    return sentences[:8]

@app.route(\"/api/ask\", methods=[\"POST\"]) 
def api_ask():
    data = request.get_json(force=True, silent=True) or {}
    q = (data.get(\"question\") or \"\").strip()
    mode = (data.get(\"mode\") or \"poll\").lower()
    if not q:
        return jsonify({\"error\": \"missing question\"}), 400

    answers = []
    if mode == \"poll\":
        for fn in SOURCES:
            answers.append(fn(q))
            time.sleep(0.1)  # be polite
    else:  # chain
        carry = q
        for fn in SOURCES:
            ans = fn(carry)
            answers.append(ans)
            prev = (ans.get(\"text\") or \"\").strip()
            if prev:
                carry = f\"{q}. Prior answer: {prev[:300]}\"

    merged = merge_summaries(answers)
    return jsonify({
        \"question\": q,
        \"mode\": mode,
        \"answers\": answers,
        \"summary\": merged,
        \"ts\": datetime.utcnow().isoformat() + \"Z\",
    })

@app.route(\"/\") 
def index():
    html_page = f\"\"\"\
<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"utf-8\"/>
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
  <title>Powered by INFINITY • Rogers AI (PayPal Demo)</title>
  <script src=\"https://cdn.tailwindcss.com\"></script>
  <style>
    body {{ background: #fafafa; }}
  </style>
</head>
<body class=\"min-h-screen flex flex-col text-neutral-900\">
  <!-- Header -->
  <div class=\"sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200\">
    <div class=\"mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3\">
      <div class=\"flex items-center gap-2\">
        <span class=\"inline-block h-3 w-3 rounded-full\" style=\"background: radial-gradient(circle at 30% 30%, #60a5fa, #2563eb);\"></span>
        <div class=\"text-[15px] font-semibold tracking-tight\">
          Powered by <span class=\"uppercase\">INFINITY</span> • Rogers AI
        </div>
        <span class=\"ml-2 italic font-semibold text-[14px] text-amber-600/90 border border-amber-400/60 rounded px-1.5 py-0.5\">
          PayPal
        </span>
      </div>
      <div class=\"flex items-center gap-2\">
        <button id=\"signinBtn\" class=\"hidden sm:inline-flex items-center rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-neutral-50\">
          Sign in <span class=\"mx-1\">with</span> Google
        </button>
        <div class=\"flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm\">
          🪶 <span id=\"feathers\">0</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div class=\"mx-auto max-w-2xl w-full flex-1 px-4 pt-3 pb-2\">
    <div id=\"chat\" class=\"h-[62vh] sm:h-[66vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 flex flex-col gap-3\"></div>

    <!-- Composer -->
    <div class=\"mt-3 flex items-end gap-2\">
      <div class=\"flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-2 shadow-inner\">
        <textarea id=\"input\" rows=\"2\" placeholder=\"Talk to me, Kris — fast, on-page answers with sources.\" class=\"w-full resize-none outline-none text-[15px] placeholder:text-neutral-400\"></textarea>
      </div>
      <button id=\"sendBtn\" class=\"rounded-2xl bg-blue-600 text-white font-semibold px-4 py-2 shadow hover:bg-blue-700 active:translate-y-px\">Send</button>
      <button id=\"nameBtn\" class=\"rounded-2xl border border-neutral-300 bg-white font-semibold px-3 py-2 shadow hover:bg-neutral-50\">Set name</button>
    </div>

    <!-- Controls -->
    <div class=\"mt-2 flex items-center gap-3 text-[14px]\">
      <label class=\"flex items-center gap-2\"><input type=\"radio\" name=\"mode\" value=\"poll\" checked> Poll many</label>
      <label class=\"flex items-center gap-2\"><input type=\"radio\" name=\"mode\" value=\"chain\"> Chain (telephone)</label>
    </div>

    <!-- Token explainer -->
    <div class=\"mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-[15px] leading-6\">
      <div class=\"font-extrabold text-[17px] flex items-center gap-2\">
        🪶 Infinity Tokens — <span class=\"font-semibold\">Your on-site currency (no USD).</span>
      </div>
      <ul class=\"list-disc pl-5 mt-2 space-y-1\">
        <li>You earn tokens each time you chat; bigger ideas earn a few extra.</li>
        <li>Tokens are used for marketplace perks and AI utilities inside Infinity.</li>
        <li><span class=\"font-semibold\">Watson • Gemini • ChatGPT</span> are filtered by Infinity Rogers and summarized here.</li>
        <li class=\"font-semibold\">No API keys required.</li>
      </ul>
    </div>

    <div class=\"mx-auto text-center text-[13px] text-neutral-500 mt-3\">
      Watson • Gemini • ChatGPT — filtered by Infinity Rogers. No USD — tokens only.
    </div>
  </div>

<script>
  const $ = (s) => document.querySelector(s);
  const chat = $("#chat");
  const input = $("#input");
  const sendBtn = $("#sendBtn");
  const nameBtn = $("#nameBtn");
  const feathersEl = $("#feathers");

  let name = localStorage.getItem("rogers_name") || "Kris";
  let feathers = parseInt(localStorage.getItem("infinity_tokens") || "0");

  feathersEl.textContent = feathers;

  // Intro bubble
  addBubble("assistant", `Hi ${name} — Infinity tokens are active. Every message earns a 🪶. Rogers routes across external AIs and the open web, then summarizes here.`);

  function addBubble(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "flex " + (role === "user" ? "justify-end" : "justify-start");
    const b = document.createElement("div");
    b.className = "max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow " + (role === "user" ? "bg-blue-600 text-white" : "bg-blue-50 text-neutral-900 border border-blue-100");
    b.style.wordBreak = "break-word";
    b.textContent = text;
    wrap.appendChild(b);
    chat.appendChild(wrap);
    chat.scrollTop = chat.scrollHeight;
  }

  function getMode() {
    const checked = document.querySelector("input[name='mode']:checked");
    return checked ? checked.value : "poll";
  }

  async function ask(question) {
    feathers += 1;
    feathersEl.textContent = feathers;
    localStorage.setItem("infinity_tokens", feathers.toString());

    try {
      const r = await fetch("/api/ask", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({question, mode: getMode()})
      });
      const data = await r.json();
      const parts = [];
      if (data.summary && data.summary.length) {
        parts.push(data.summary.join(" "));
      }
      if (data.answers && data.answers.length) {
        const srcs = data.answers.filter(a => (a.text || "").trim().length > 0).map(a => `${a.source}`);
        if (srcs.length) {
          parts.push("\\nSources: " + srcs.join(" • "));
        }
      }
      addBubble("assistant", parts.join("\\n\\n") || "No clean text found. Try rephrasing.");
    } catch(e) {
      addBubble("assistant", "Network error.");
    }
  }

  sendBtn.addEventListener("click", () => {
    const q = input.value.trim();
    if (!q) return;
    addBubble("user", q);
    input.value = "";
    ask(q);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click();
    }
  });

  nameBtn.addEventListener("click", () => {
    const n = prompt("What should I call you?", name) || name;
    name = n;
    localStorage.setItem("rogers_name", name);
    addBubble("assistant", `Nice to meet you, ${name}.`);
  });
</script>
</body>
</html>
\"\"\"
    return make_response(html_page)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8080, debug=False)
