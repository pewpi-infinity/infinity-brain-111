#!/data/data/com.termux/files/usr/bin/bash
# ─────────────────────────────────────────────
#  OSPREY 4.0 – Phase 4 Rule Engine & Entrainment Layer
# ─────────────────────────────────────────────
set -e
cd ~/osprey-4.0

echo "[🧠] Starting Phase-4 rule engine setup …"

mkdir -p rules

# ---- Core rule set ----
cat > rules/rules.json <<'EOF'
[
  {
    "id": "energy_surge",
    "when": { "office": "Energy & Infrastructure", "metric": "openTickets", "operator": ">", "value": 10 },
    "then": { "action": "notify", "target": "Vice President – Rogers AI", "message": "Energy department has over 10 open tickets" }
  },
  {
    "id": "education_growth",
    "when": { "office": "Education & Research", "metric": "projects", "operator": "length>", "value": 5 },
    "then": { "action": "praise", "target": "Education & Research", "message": "Great progress in education projects!" }
  }
]
EOF

# ---- JS engine ----
cat > rules/engine.js <<'EOF'
// ─────────────────────────────────────────────
// 🧠 OSPREY Rule Engine (Phase 4)
// Evaluates simple rules and creates feedback loops
// ─────────────────────────────────────────────

async function loadRules() {
  const res = await fetch('rules/rules.json');
  const data = await res.json();
  window.ospreyRules = data;
  console.log("[⚙️] Rules loaded:", data.length);
  return data;
}

function evaluateRule(rule, offices) {
  const office = offices.find(o => o.title === rule.when.office);
  if (!office) return false;

  const val = office.metrics?.[rule.when.metric];
  const op = rule.when.operator;
  const target = rule.when.value;

  switch (op) {
    case ">":  return val > target;
    case "<":  return val < target;
    case "length>": return Array.isArray(val) && val.length > target;
    default:   return false;
  }
}

function runEntrainmentCycle(offices) {
  if (!window.ospreyRules) return;
  window.ospreyRules.forEach(rule => {
    if (evaluateRule(rule, offices)) {
      console.log(`[🔁] Rule triggered (${rule.id}) → ${rule.then.message}`);
      // simple feedback action
      window.OspreyLogic?.reason(rule.then.message);
    }
  });
}

// expose
window.OspreyRules = { loadRules, runEntrainmentCycle };
EOF

# ---- Hook into index.html if not already present ----
grep -q "rules/engine.js" osprey_ui/index.html || \
echo '<script src="rules/engine.js"></script>' >> osprey_ui/index.html

# ---- Update README ----
echo -e "\n## Phase-4 Rule Engine $(date)\n- Added /rules folder for entrainment logic loops." >> README.md

git add .
git commit -m "Phase-4: add rules engine and entrainment layer"
git push origin main

echo "[✅] Phase-4 pushed to GitHub successfully!"
echo "Check → https://github.com/pewpi-infinity/osprey-4.0/tree/main/rules"

