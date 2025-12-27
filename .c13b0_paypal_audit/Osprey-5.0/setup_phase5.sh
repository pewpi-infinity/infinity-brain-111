#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 5 Infinity Deck & Quantum Vector Layer
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🃏] Starting Phase 5 Infinity Deck setup…"

mkdir -p deck

# ---- 52-card Infinity deck ----
cat > deck/deck.json <<'EOF'
[
  {"suit":"Clubs","rank":"Ace","meaning":"Initiation / Energy / Infrastructure"},
  {"suit":"Clubs","rank":"2","meaning":"Dual power / Exchange"},
  {"suit":"Clubs","rank":"3","meaning":"Growth / Momentum"},
  {"suit":"Clubs","rank":"4","meaning":"Foundation / Stability"},
  {"suit":"Clubs","rank":"5","meaning":"Challenge / Reconstruction"},
  {"suit":"Clubs","rank":"6","meaning":"Cooperation / Networks"},
  {"suit":"Clubs","rank":"7","meaning":"Innovation / Experiment"},
  {"suit":"Clubs","rank":"8","meaning":"Structure / Engineering"},
  {"suit":"Clubs","rank":"9","meaning":"Fulfillment / Legacy"},
  {"suit":"Clubs","rank":"10","meaning":"Completion / Infrastructure Peak"},
  {"suit":"Clubs","rank":"Jack","meaning":"Apprentice / New Builder"},
  {"suit":"Clubs","rank":"Queen","meaning":"Planner / Architect"},
  {"suit":"Clubs","rank":"King","meaning":"Master Builder"},
  {"suit":"Hearts","rank":"Ace","meaning":"Emotion / Health Impulse"},
  {"suit":"Hearts","rank":"2","meaning":"Connection / Union"},
  {"suit":"Hearts","rank":"3","meaning":"Celebration / Growth"},
  {"suit":"Hearts","rank":"4","meaning":"Home / Care"},
  {"suit":"Hearts","rank":"5","meaning":"Conflict / Healing"},
  {"suit":"Hearts","rank":"6","meaning":"Harmony / Recovery"},
  {"suit":"Hearts","rank":"7","meaning":"Vision / Dream"},
  {"suit":"Hearts","rank":"8","meaning":"Transition / Renewal"},
  {"suit":"Hearts","rank":"9","meaning":"Satisfaction / Health Success"},
  {"suit":"Hearts","rank":"10","meaning":"Completion / Community Care"},
  {"suit":"Hearts","rank":"Jack","meaning":"Messenger of Health"},
  {"suit":"Hearts","rank":"Queen","meaning":"Healer / Nurturer"},
  {"suit":"Hearts","rank":"King","meaning":"Director of Well-Being"},
  {"suit":"Diamonds","rank":"Ace","meaning":"Wealth / Resources Origin"},
  {"suit":"Diamonds","rank":"2","meaning":"Trade / Exchange"},
  {"suit":"Diamonds","rank":"3","meaning":"Skill / Craft"},
  {"suit":"Diamonds","rank":"4","meaning":"Stability / Savings"},
  {"suit":"Diamonds","rank":"5","meaning":"Adjustment / Market Shift"},
  {"suit":"Diamonds","rank":"6","meaning":"Balance / Value Flow"},
  {"suit":"Diamonds","rank":"7","meaning":"Long-Term Investment"},
  {"suit":"Diamonds","rank":"8","meaning":"Work / Production"},
  {"suit":"Diamonds","rank":"9","meaning":"Gain / Prosperity"},
  {"suit":"Diamonds","rank":"10","meaning":"Completion / Financial Peak"},
  {"suit":"Diamonds","rank":"Jack","meaning":"Trader / Messenger of Value"},
  {"suit":"Diamonds","rank":"Queen","meaning":"Investor / Strategist"},
  {"suit":"Diamonds","rank":"King","meaning":"Merchant Leader"},
  {"suit":"Spades","rank":"Ace","meaning":"Authority / Leadership Seed"},
  {"suit":"Spades","rank":"2","meaning":"Decision / Dual Path"},
  {"suit":"Spades","rank":"3","meaning":"Strategy / Plan"},
  {"suit":"Spades","rank":"4","meaning":"Law / Structure"},
  {"suit":"Spades","rank":"5","meaning":"Conflict Resolution"},
  {"suit":"Spades","rank":"6","meaning":"Transition / Victory"},
  {"suit":"Spades","rank":"7","meaning":"Analysis / Wisdom"},
  {"suit":"Spades","rank":"8","meaning":"Restriction / Discipline"},
  {"suit":"Spades","rank":"9","meaning":"Challenge / Testing"},
  {"suit":"Spades","rank":"10","meaning":"Completion / Crown of Leadership"},
  {"suit":"Spades","rank":"Jack","meaning":"Envoy / Advisor"},
  {"suit":"Spades","rank":"Queen","meaning":"Judge / Mediator"},
  {"suit":"Spades","rank":"King","meaning":"Sovereign Decision"}
]
EOF

# ---- JS engine for card retrieval ----
cat > deck/quantum_engine.js <<'EOF'
// 🔮 OSPREY Quantum Vector Layer (Phase 5)
async function loadDeck(){
  const res=await fetch('deck/deck.json');
  const deck=await res.json();
  window.ospreyDeck=deck;
  console.log(`[🃏] Infinity Deck loaded (${deck.length} cards)`);
  return deck;
}

function drawRandomCard(){
  if(!window.ospreyDeck) return null;
  const card=window.ospreyDeck[Math.floor(Math.random()*window.ospreyDeck.length)];
  console.log(`[✨] Drawn: ${card.rank} of ${card.suit} – ${card.meaning}`);
  return card;
}

window.OspreyQuantum={loadDeck,drawRandomCard};
EOF

# ---- Hook into index.html ----
grep -q "deck/quantum_engine.js" osprey_ui/index.html || \
echo '<script src="deck/quantum_engine.js"></script>' >> osprey_ui/index.html

# ---- Update README ----
echo -e "\n## Phase-5 Infinity Deck $(date)\n- Added /deck folder and quantum vector engine." >> README.md

git add .
git commit -m "Phase-5: add Infinity Deck and Quantum Vector Layer"
git push origin main

echo "[✅] Phase-5 pushed successfully!"
echo "Check → https://github.com/pewpi-infinity/osprey-4.0/tree/main/deck"

