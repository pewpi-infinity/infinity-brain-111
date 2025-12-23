// 🧠 Osprey Logic Engine (Phase 3)
// Loads bots + provides basic rule processing hooks.

async function loadBots() {
  const res = await fetch('bots/manifest.json');
  const bots = await res.json();
  window.ospreyBots = bots;
  console.log("[🤖] Bots loaded:", bots.map(b=>b.name).join(', '));
  return bots;
}

function reason(context) {
  const msg = `[💬] Rogers reviewing context: ${context}`;
  console.log(msg);
  return msg;
}

window.OspreyLogic = { loadBots, reason };
