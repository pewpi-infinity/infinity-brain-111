#!/usr/bin/env python3
"""
Infinity Portal SPA Server
Single Page Application with Google OAuth, Rogers AI, and animated transitions
Run: python3 spa_server.py
Then open: http://127.0.0.1:8080
"""

import json, re, time, os
from datetime import datetime
from urllib.parse import quote_plus
from flask import Flask, request, jsonify, make_response, session
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

UA = {"User-Agent": "InfinityRogers/1.0 (+Infinity Portal SPA)"}

# Google OAuth Configuration
GOOGLE_CLIENT_ID = "16937806382-leqbaginj3igrhei58nsab7tb4hsb435.apps.googleusercontent.com"
GOOGLE_API_KEY = "AIzaSyDWKRhBjFEt752zC86X0aQOvRQHxM5XPlc"

# OpenAI Configuration
OPENAI_API_KEY = "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"

# Rogers AI Functions
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

SOURCES = [ddg_instant_answer, wikipedia_summary, wikidata_blurb]

def merge_summaries(chunks):
    seen = set()
    sentences = []
    for c in chunks:
        text = (c.get("text") or "").strip()
        if not text: 
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

    merged = merge_summaries(answers)
    return jsonify({
        "question": q,
        "mode": mode,
        "answers": answers,
        "summary": merged,
        "ts": datetime.utcnow().isoformat() + "Z",
    })

@app.route("/") 
def index():
    # Single Page Application HTML
    html_page = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
<title>Infinity Portal — SPA with Google Auth</title>
<script src="https://accounts.google.com/gsi/client" async defer></script>
<style>
:root{
  --blue-1:#003087;
  --blue-2:#0b5fd7;
  --bg:#ffffff;
  --muted:#657080;
  --radius:12px;
  --panel:#f8fafc;
  font-family:system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
html,body{height:100%;margin:0;background:var(--bg);color:#051426; -webkit-font-smoothing:antialiased;}
.app{max-width:1200px;margin:0 auto;padding:14px;min-height:100vh;}
header{display:flex;align-items:center;justify-content:space-between;padding:12px 6px;background:linear-gradient(0deg,#ffffff,#fbfdff);border-radius:10px;box-shadow:0 6px 18px rgba(3,24,62,0.04);border:1px solid rgba(3,24,62,0.03);margin-bottom:18px;}
.logoText{font-weight:700;color:var(--blue-1);font-size:18px}
.sub{font-size:12px;color:var(--muted)}
.controls{display:flex;gap:10px;align-items:center}
.iconBtn{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:transparent;border:1px solid rgba(3,24,62,0.06);cursor:pointer;transition:all .2s}
.iconBtn:hover{background:rgba(11,95,215,0.04)}
.menuIcon{font-size:22px;color:var(--blue-1)}

/* Stage area */
.stage{position:relative;min-height:68vh;border-radius:14px;overflow:hidden;border:1px solid rgba(3,24,62,0.03);background:linear-gradient(180deg,#f7fbff, #eef6ff)}
#hydroCanvas{position:absolute;inset:0;width:100%;height:100%;z-index:0}

/* Vector animation overlay */
.vector-overlay{position:fixed;inset:0;pointer-events:none;z-index:99999;display:none}
.vector-overlay.active{display:block}
.vector-line{position:absolute;height:3px;background:linear-gradient(90deg, transparent, var(--blue-2), transparent);transform-origin:left;opacity:0}
.vector-particle{position:absolute;width:8px;height:8px;background:var(--blue-2);border-radius:50%;box-shadow:0 0 20px var(--blue-2);opacity:0}

/* Content area - SPA panels */
.content-area{position:relative;z-index:1;padding:20px;min-height:60vh}
.spa-panel{display:none;animation:fadeIn 0.3s ease-out}
.spa-panel.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)}}

/* Navigation */
.nav-grid{display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:16px;margin-bottom:20px}
.nav-card{background:white;border:1px solid rgba(3,24,62,0.06);border-radius:12px;padding:20px;cursor:pointer;transition:all .2s;box-shadow:0 4px 12px rgba(11,95,215,0.04)}
.nav-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(11,95,215,0.12)}
.nav-card.active{border-color:var(--blue-2);background:rgba(11,95,215,0.02)}
.nav-title{font-weight:700;color:var(--blue-1);font-size:16px;margin-bottom:4px}
.nav-desc{font-size:13px;color:var(--muted)}

/* Token display */
.token-chip{background:rgba(11,95,215,0.06);padding:8px 14px;border-radius:999px;color:var(--blue-1);font-weight:700;font-size:14px}

/* Rogers chat */
.chat-container{background:white;border-radius:12px;padding:16px;border:1px solid rgba(3,24,62,0.06);max-height:400px;overflow-y:auto}
.chat-msg{padding:10px 12px;border-radius:12px;margin:8px 0;max-width:85%}
.chat-user{background:#e8f0ff;margin-left:auto}
.chat-bot{background:#f2f5f9}
.chat-input-bar{display:flex;gap:8px;margin-top:12px}
.chat-input-bar input{flex:1;padding:10px;border-radius:10px;border:1px solid rgba(3,24,62,0.06);font-size:15px}
.chat-input-bar button{background:var(--blue-1);color:white;border:0;padding:10px 20px;border-radius:10px;cursor:pointer;font-weight:600}

/* Auth section */
.auth-section{text-align:center;padding:40px 20px}
.auth-card{background:white;border-radius:16px;padding:40px;max-width:400px;margin:0 auto;box-shadow:0 10px 40px rgba(3,24,62,0.08)}
.user-info{display:flex;align-items:center;gap:10px}
.user-avatar{width:32px;height:32px;border-radius:50%}

/* Utilities */
.primary-btn{background:var(--blue-1);color:white;border:0;padding:12px 24px;border-radius:10px;cursor:pointer;font-weight:600;transition:all .2s}
.primary-btn:hover{background:var(--blue-2);transform:translateY(-1px)}
.small{font-size:13px;color:var(--muted)}

@media (max-width:600px){
  .nav-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>
<div class="app">
  <header>
    <div style="display:flex;gap:12px;align-items:center">
      <div>
        <div class="logoText">INFINITY PORTAL</div>
        <div class="sub">Single Page • All Tools • Google Auth</div>
      </div>
    </div>
    <div class="controls">
      <div class="token-chip">🪶 <span id="tokenCount">0</span> Tokens</div>
      <div id="userSection" class="user-info" style="display:none">
        <img id="userAvatar" class="user-avatar" src="" alt="User">
        <span id="userName" class="small"></span>
      </div>
      <div id="g_id_onload"
           data-client_id="16937806382-leqbaginj3igrhei58nsab7tb4hsb435.apps.googleusercontent.com"
           data-callback="handleCredentialResponse"
           data-auto_prompt="false"
           data-context="signin">
      </div>
      <div class="g_id_signin" 
           data-type="standard" 
           data-size="medium" 
           data-theme="outline"
           data-text="signin_with"
           data-shape="rectangular"
           data-logo_alignment="left">
      </div>
    </div>
  </header>

  <!-- Vector animation overlay -->
  <div class="vector-overlay" id="vectorOverlay">
    <svg id="vectorSvg" width="100%" height="100%" style="position:absolute;inset:0">
      <line id="vectorLine" x1="0" y1="0" x2="0" y2="0" stroke="url(#grad)" stroke-width="3" opacity="0"/>
      <circle id="vectorParticle" cx="0" cy="0" r="6" fill="#0b5fd7" opacity="0"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:transparent;stop-opacity:0" />
          <stop offset="50%" style="stop-color:#0b5fd7;stop-opacity:1" />
          <stop offset="100%" style="stop-color:transparent;stop-opacity:0" />
        </linearGradient>
      </defs>
    </svg>
  </div>

  <div class="stage">
    <canvas id="hydroCanvas"></canvas>
    
    <div class="content-area">
      <!-- Auth Panel (shown when not authenticated) -->
      <div class="spa-panel active" id="panel-auth">
        <div class="auth-section">
          <div class="auth-card">
            <h2 style="color:var(--blue-1);margin-top:0">Welcome to Infinity Portal</h2>
            <p class="small">Sign in with Google to access all features</p>
            <div style="margin:30px 0;display:flex;justify-content:center">
              <div id="g_id_signin2" 
                   class="g_id_signin" 
                   data-type="standard" 
                   data-size="large" 
                   data-theme="filled_blue" 
                   data-text="signin_with" 
                   data-shape="rectangular"
                   data-logo_alignment="left">
              </div>
            </div>
            <p class="small">🔒 Secure authentication • 🪶 Earn Infinity tokens • 🤖 Access Rogers AI</p>
          </div>
        </div>
      </div>

      <!-- Home Panel -->
      <div class="spa-panel" id="panel-home">
        <div class="nav-grid">
          <div class="nav-card" onclick="navigateTo('portal')">
            <div class="nav-title">🏠 Portal</div>
            <div class="nav-desc">Daily tools: Calculator, Alarm, Notes</div>
          </div>
          <div class="nav-card" onclick="navigateTo('market')">
            <div class="nav-title">🛒 Marketplace</div>
            <div class="nav-desc">Token-only commerce & listings</div>
          </div>
          <div class="nav-card" onclick="navigateTo('social')">
            <div class="nav-title">👥 Social</div>
            <div class="nav-desc">Community & local connections</div>
          </div>
          <div class="nav-card" onclick="navigateTo('rogers')">
            <div class="nav-title">🤖 Rogers AI</div>
            <div class="nav-desc">AI assistant with web intelligence</div>
          </div>
          <div class="nav-card" onclick="navigateTo('paypal')">
            <div class="nav-title">💰 PayPal Bridge</div>
            <div class="nav-desc">Convert currency to Infinity tokens</div>
          </div>
          <div class="nav-card" onclick="navigateTo('archive')">
            <div class="nav-title">📚 Archive</div>
            <div class="nav-desc">Historical data & records</div>
          </div>
        </div>
      </div>

      <!-- Portal Panel -->
      <div class="spa-panel" id="panel-portal">
        <h2 style="color:var(--blue-1)">🏠 Portal — Daily Tools</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px">
          <div style="background:white;padding:20px;border-radius:12px;border:1px solid rgba(3,24,62,0.06)">
            <h3>Calculator</h3>
            <input id="calcInput" placeholder="2+2" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px">
            <button class="primary-btn" onclick="calculate()">Compute</button>
            <div id="calcOutput" class="small" style="margin-top:10px"></div>
          </div>
          <div style="background:white;padding:20px;border-radius:12px;border:1px solid rgba(3,24,62,0.06)">
            <h3>Alarm</h3>
            <input id="alarmInput" placeholder="HH:MM" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px">
            <button class="primary-btn" onclick="setAlarm()">Set Alarm</button>
            <div id="alarmOutput" class="small" style="margin-top:10px"></div>
          </div>
        </div>
      </div>

      <!-- Marketplace Panel -->
      <div class="spa-panel" id="panel-market">
        <h2 style="color:var(--blue-1)">🛒 Marketplace — Token Commerce</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div style="background:white;padding:20px;border-radius:12px;border:1px solid rgba(3,24,62,0.06);max-width:600px">
          <h3>Create Listing</h3>
          <input id="listTitle" placeholder="Item title" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px">
          <textarea id="listDesc" placeholder="Description" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px;min-height:80px"></textarea>
          <input id="listPrice" placeholder="Price in tokens" type="number" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px">
          <button class="primary-btn" onclick="createListing()">Create Listing</button>
          <div id="listOutput" class="small" style="margin-top:10px"></div>
        </div>
      </div>

      <!-- Social Panel -->
      <div class="spa-panel" id="panel-social">
        <h2 style="color:var(--blue-1)">👥 Social — Community</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div style="background:white;padding:20px;border-radius:12px;border:1px solid rgba(3,24,62,0.06);max-width:600px">
          <h3>Join Local Chat</h3>
          <input id="zipInput" placeholder="ZIP or postal code" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ccc;margin-bottom:10px">
          <button class="primary-btn" onclick="joinLocal()">Join Chat</button>
          <div id="socialOutput" class="small" style="margin-top:10px"></div>
        </div>
      </div>

      <!-- Rogers AI Panel -->
      <div class="spa-panel" id="panel-rogers">
        <h2 style="color:var(--blue-1)">🤖 Rogers AI — Web Intelligence</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div class="chat-container" id="chatMessages"></div>
        <div class="chat-input-bar">
          <input id="chatInput" placeholder="Ask Rogers anything..." onkeypress="if(event.key==='Enter')sendMessage()">
          <button onclick="sendMessage()">Send</button>
        </div>
      </div>

      <!-- PayPal Bridge Panel -->
      <div class="spa-panel" id="panel-paypal">
        <h2 style="color:var(--blue-1)">💰 PayPal Bridge — Currency to Tokens</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div style="background:white;padding:30px;border-radius:12px;border:1px solid rgba(3,24,62,0.06);max-width:600px">
          <h3>Convert USD to Infinity Tokens</h3>
          <p class="small">Infinity collects and banks traditional currency, distributing tokens as the new standard</p>
          <input id="usdAmount" placeholder="Amount in USD" type="number" style="width:100%;padding:12px;border-radius:8px;border:1px solid #ccc;margin:16px 0">
          <div style="background:#f8fafc;padding:16px;border-radius:8px;margin-bottom:16px">
            <div class="small">Conversion Rate: $1 USD = 100 Infinity Tokens</div>
            <div style="font-size:24px;font-weight:700;color:var(--blue-1);margin-top:8px">
              You'll receive: <span id="tokenPreview">0</span> 🪶
            </div>
          </div>
          <button class="primary-btn" onclick="convertCurrency()" style="width:100%">Convert via PayPal</button>
          <div id="paypalOutput" class="small" style="margin-top:10px"></div>
        </div>
      </div>

      <!-- Archive Panel -->
      <div class="spa-panel" id="panel-archive">
        <h2 style="color:var(--blue-1)">📚 Archive — Historical Records</h2>
        <button onclick="navigateTo('home')" class="small" style="margin-bottom:20px;background:transparent;border:1px solid #ccc;padding:8px 16px;border-radius:8px;cursor:pointer">← Back to Home</button>
        <div style="background:white;padding:20px;border-radius:12px;border:1px solid rgba(3,24,62,0.06)">
          <p class="small">Historical currency collection and token distribution records</p>
          <div id="archiveData" style="margin-top:16px">
            <div style="padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:8px">
              <strong>Total Currency Collected:</strong> Coming soon
            </div>
            <div style="padding:12px;background:#f8fafc;border-radius:8px;margin-bottom:8px">
              <strong>Tokens Distributed:</strong> Coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
const STORAGE = window.localStorage || {};
let currentUser = null;
let tokens = parseInt(STORAGE.getItem('infinity_tokens') || '0');
document.getElementById('tokenCount').textContent = tokens;

// Google Sign-In Callback
function handleCredentialResponse(response) {
  console.log('Google Sign-In response received:', response);
  try {
    const token = response.credential;
    const payload = parseJwt(token);
    console.log('Parsed JWT payload:', payload);
    currentUser = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    STORAGE.setItem('infinity_user', JSON.stringify(currentUser));
    updateUIForAuth();
    
    // Award tokens for signing in
    tokens += 10;
    STORAGE.setItem('infinity_tokens', tokens);
    document.getElementById('tokenCount').textContent = tokens;
    
    navigateTo('home');
  } catch(e) {
    console.error('Error handling credential:', e);
    alert('Sign-in error: ' + e.message);
  }
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(window.atob(base64));
}

function updateUIForAuth() {
  if (currentUser) {
    document.getElementById('userSection').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userAvatar').src = currentUser.picture;
    
    // Hide the g_id_onload div to prevent auto-prompt
    const gOnload = document.getElementById('g_id_onload');
    if (gOnload) {
      gOnload.style.display = 'none';
    }
    
    console.log('UI updated for authenticated user:', currentUser.name);
  }
}

// Check for existing session
const savedUser = STORAGE.getItem('infinity_user');
if (savedUser) {
  try {
    currentUser = JSON.parse(savedUser);
    console.log('Restored user session:', currentUser);
    updateUIForAuth();
    navigateTo('home');
  } catch(e) {
    console.error('Error restoring session:', e);
    STORAGE.removeItem('infinity_user');
  }
}

// Log when Google Sign-In library loads
window.onload = function() {
  console.log('Page loaded. Google Sign-In library should be ready.');
  console.log('Client ID configured: 16937806382-leqbaginj3igrhei58nsab7tb4hsb435.apps.googleusercontent.com');
};

// Vector Animation System
function animateVector(fromEl, toPanel, callback) {
  const overlay = document.getElementById('vectorOverlay');
  const line = document.getElementById('vectorLine');
  const particle = document.getElementById('vectorParticle');
  
  const startRect = fromEl ? fromEl.getBoundingClientRect() : {
    left: window.innerWidth / 2,
    top: window.innerHeight / 2
  };
  
  const endX = Math.random() * window.innerWidth;
  const endY = Math.random() * window.innerHeight;
  
  overlay.classList.add('active');
  
  // Animate line
  line.setAttribute('x1', startRect.left);
  line.setAttribute('y1', startRect.top);
  line.setAttribute('x2', endX);
  line.setAttribute('y2', endY);
  line.style.opacity = '1';
  
  // Animate particle
  particle.setAttribute('cx', startRect.left);
  particle.setAttribute('cy', startRect.top);
  particle.style.opacity = '1';
  
  const duration = 400;
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    
    const currentX = startRect.left + (endX - startRect.left) * eased;
    const currentY = startRect.top + (endY - startRect.top) * eased;
    
    particle.setAttribute('cx', currentX);
    particle.setAttribute('cy', currentY);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      line.style.opacity = '0';
      particle.style.opacity = '0';
      setTimeout(() => {
        overlay.classList.remove('active');
        if (callback) callback();
      }, 100);
    }
  }
  
  requestAnimationFrame(animate);
}

// SPA Navigation
function navigateTo(panelName, event) {
  const fromEl = event ? event.target : null;
  
  // Add token for navigation
  tokens += 1;
  STORAGE.setItem('infinity_tokens', tokens);
  document.getElementById('tokenCount').textContent = tokens;
  
  // Animate vector transition
  animateVector(fromEl, panelName, () => {
    // Hide all panels
    document.querySelectorAll('.spa-panel').forEach(p => p.classList.remove('active'));
    
    // Show target panel
    const targetPanel = document.getElementById('panel-' + panelName);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
    
    // Update navigation highlighting
    document.querySelectorAll('.nav-card').forEach(c => c.classList.remove('active'));
  });
}

// Hydrogen Cloud Canvas
const canvas = document.getElementById('hydroCanvas');
const ctx = canvas.getContext('2d');
let w, h, particles = [];

function resizeCanvas() {
  w = canvas.width = canvas.offsetWidth;
  h = canvas.height = canvas.offsetHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function initParticles() {
  particles = [];
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.2
    });
  }
}

initParticles();

function draw() {
  ctx.clearRect(0, 0, w, h);
  const g = ctx.createRadialGradient(w * 0.5, h * 0.3, 80, w * 0.5, h * 0.3, Math.max(w, h));
  g.addColorStop(0, 'rgba(240,248,255,0.35)');
  g.addColorStop(1, 'rgba(232,242,255,0.08)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = w;
    if (p.x > w) p.x = 0;
    if (p.y < 0) p.y = h;
    if (p.y > h) p.y = 0;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(11,95,215,' + p.alpha + ')';
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

draw();

// Tool Functions
function calculate() {
  const input = document.getElementById('calcInput').value;
  try {
    const safe = input.replace(/[^0-9+\\-*/(). %]/g, '');
    const result = Function('"use strict";return (' + safe + ')')();
    document.getElementById('calcOutput').textContent = 'Result: ' + result;
  } catch(e) {
    document.getElementById('calcOutput').textContent = 'Error in expression';
  }
}

function setAlarm() {
  const time = document.getElementById('alarmInput').value;
  if (!/^\\d{1,2}:\\d{2}$/.test(time)) {
    document.getElementById('alarmOutput').textContent = 'Use format HH:MM';
    return;
  }
  document.getElementById('alarmOutput').textContent = 'Alarm set for ' + time;
}

function createListing() {
  const title = document.getElementById('listTitle').value;
  const desc = document.getElementById('listDesc').value;
  const price = document.getElementById('listPrice').value;
  if (!title || !price) {
    document.getElementById('listOutput').textContent = 'Title and price required';
    return;
  }
  const listings = JSON.parse(STORAGE.getItem('infinity_listings') || '[]');
  listings.push({title, desc, price, when: Date.now()});
  STORAGE.setItem('infinity_listings', JSON.stringify(listings));
  document.getElementById('listOutput').textContent = 'Listed! (' + listings.length + ' total)';
}

function joinLocal() {
  const zip = document.getElementById('zipInput').value;
  if (!zip) {
    document.getElementById('socialOutput').textContent = 'ZIP required';
    return;
  }
  document.getElementById('socialOutput').textContent = 'Joined local chat for ' + zip;
}

// Rogers AI Chat
function addChatMessage(role, text) {
  const container = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg chat-' + role;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const question = input.value.trim();
  if (!question) return;
  
  addChatMessage('user', question);
  input.value = '';
  
  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question, mode: 'poll'})
    });
    const data = await response.json();
    
    if (data.summary && data.summary.length) {
      addChatMessage('bot', data.summary.join(' '));
    } else {
      addChatMessage('bot', 'No results found. Try rephrasing.');
    }
    
    if (data.answers && data.answers.length) {
      const sources = data.answers.filter(a => a.text && !a.text.includes('(error)')).map(a => a.source).join(' • ');
      if (sources) {
        addChatMessage('bot', 'Sources: ' + sources);
      }
    }
  } catch(e) {
    addChatMessage('bot', 'Error connecting to Rogers AI');
  }
}

// PayPal Bridge
document.getElementById('usdAmount')?.addEventListener('input', function() {
  const usd = parseFloat(this.value) || 0;
  const tokenAmount = Math.floor(usd * 100);
  document.getElementById('tokenPreview').textContent = tokenAmount;
});

function convertCurrency() {
  const usd = parseFloat(document.getElementById('usdAmount').value) || 0;
  if (usd <= 0) {
    document.getElementById('paypalOutput').textContent = 'Enter a valid amount';
    return;
  }
  const tokenAmount = Math.floor(usd * 100);
  tokens += tokenAmount;
  STORAGE.setItem('infinity_tokens', tokens);
  document.getElementById('tokenCount').textContent = tokens;
  document.getElementById('paypalOutput').textContent = '✅ Converted $' + usd + ' to ' + tokenAmount + ' tokens!';
}

// Initialize Rogers chat with welcome message
if (document.getElementById('chatMessages')) {
  addChatMessage('bot', 'Hi! I\\'m Rogers, your AI assistant. Ask me anything and I\\'ll search the web for answers.');
}
</script>
</body>
</html>
"""
    return make_response(html_page)

if __name__ == "__main__":
    print("🚀 Infinity Portal SPA Server starting...")
    print("📍 Open: http://127.0.0.1:8080")
    print("🔐 Google OAuth enabled")
    print("🤖 Rogers AI backend ready")
    app.run(host="0.0.0.0", port=8080, debug=False)
