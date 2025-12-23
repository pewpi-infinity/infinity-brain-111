// ─────────────────────────────────────────────
// 🧩 OSPREY 4.0 – Network Engine (Phase 2 Stub)
// Loads nodes and links and makes them available to the vector UI
// ─────────────────────────────────────────────

async function loadNetwork() {
  const [nodesRes, linksRes] = await Promise.all([
    fetch('network/nodes.json'),
    fetch('network/links.json')
  ]);
  const nodes = await nodesRes.json();
  const links = await linksRes.json();
  console.log("[🌐] Network loaded:", nodes.length, "nodes,", links.length, "links");
  window.ospreyNetwork = { nodes, links };
}
loadNetwork();
