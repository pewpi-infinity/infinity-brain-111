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
