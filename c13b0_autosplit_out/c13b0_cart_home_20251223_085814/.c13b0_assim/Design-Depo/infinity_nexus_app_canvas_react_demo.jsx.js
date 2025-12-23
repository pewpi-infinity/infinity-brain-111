import React, { useMemo, useState } from "react";

// =====================================================
// Infinity Nexus – App Canvas (Safe Mode)
// -----------------------------------------------------
// Purpose: Render reliably with ZERO external UI libs.
// - No shadcn/ui, no framer-motion, no recharts, no icons
// - Pure React + Tailwind classes + basic HTML elements
// - Same core features: FlowGraph, AI Patterns, Dashboard,
//   and Infinity Treasury simulation with a simple SVG chart
// =====================================================

// Utility: simple id
const uid = () => Math.random().toString(36).slice(2, 9);

// ---- MiniGraph (circular layout) ---------------------
function useCircleLayout(nodes) {
  return useMemo(() => {
    const R = 120;
    const cx = 160;
    const cy = 140;
    const n = Math.max(1, nodes.length);
    return nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      return { id: node.id, x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
    });
  }, [nodes]);
}

function MiniGraph({ nodes, edges }) {
  const layout = useCircleLayout(nodes);
  const pos = Object.fromEntries(layout.map((p) => [p.id, p]));
  return (
    <svg viewBox="0 0 320 280" className="w-full h-[280px] rounded-xl border border-white/10 bg-white/70 text-slate-800">
      {edges.map((e) => (
        <line key={e.id} x1={pos[e.from]?.x ?? 0} y1={pos[e.from]?.y ?? 0} x2={pos[e.to]?.x ?? 0} y2={pos[e.to]?.y ?? 0} stroke="currentColor" strokeOpacity="0.35" strokeWidth="2" />
      ))}
      {layout.map((p) => (
        <g key={p.id} transform={`translate(${p.x - 18}, ${p.y - 18})`}>
          <circle cx={18} cy={18} r={18} className="fill-slate-900" />
          <text x={18} y={22} className="text-[10px] fill-white font-medium" textAnchor="middle">
            {nodes.find((n) => n.id === p.id)?.label || ""}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---- Tiny SVG Line Chart (no libs) ------------------
function LineChartMini({ data, keys }) {
  // data: [{iter, key1, key2, ...}]
  const width = 520, height = 200, pad = 28;
  const iters = data.map(d => d.iter);
  const minX = Math.min(1, ...iters);
  const maxX = Math.max(1, ...iters);
  const vals = keys.flatMap(k => data.map(d => d[k] ?? 0));
  const minY = Math.min(...(vals.length ? vals : [0]));
  const maxY = Math.max(...(vals.length ? vals : [1]));
  const x = (v) => pad + (maxX === minX ? 0 : ((v - minX) / (maxX - minX)) * (width - 2 * pad));
  const y = (v) => height - pad - (maxY === minY ? 0 : ((v - minY) / (maxY - minY)) * (height - 2 * pad));

  const colors = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"]; // default palette

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[200px] rounded-xl border border-white/10 bg-white/10">
      {/* Axes */}
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="white" strokeOpacity="0.25" />
      <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="white" strokeOpacity="0.25" />

      {keys.map((k, idx) => {
        const path = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(d.iter)},${y(d[k] ?? 0)}`).join(" ");
        return <path key={k} d={path} fill="none" stroke={colors[idx % colors.length]} strokeWidth="2" />;
      })}

      {/* Legend */}
      {keys.map((k, idx) => (
        <g key={k} transform={`translate(${pad + idx * 120}, 8)`}>
          <rect width="12" height="12" rx="2" ry="2" fill={colors[idx % colors.length]} />
          <text x="16" y="11" className="text-[10px] fill-white/80">{k}</text>
        </g>
      ))}
    </svg>
  );
}

export default function AppCanvas() {
  // ---------- FlowGraph ----------
  const [nodes, setNodes] = useState([
    { id: uid(), label: "wallet" },
    { id: uid(), label: "exchange" },
  ]);
  const [edges, setEdges] = useState([{ id: uid(), from: nodes[0]?.id, to: nodes[1]?.id }]);

  // ---------- Infinity AI Patterns ----------
  const [patterns, setPatterns] = useState([
    { key: "buy", action: "execute_trade" },
    { key: "observe", action: "collect_metrics" },
  ]);

  // ---------- Adaptive Dashboard ----------
  const [context, setContext] = useState("trading");
  const [views, setViews] = useState(["positions", "sentiment", "ai-logs"]);
  const [compact, setCompact] = useState(false);

  // Form helpers
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [edgeFrom, setEdgeFrom] = useState(nodes[0]?.id || "");
  const [edgeTo, setEdgeTo] = useState(nodes[1]?.id || "");
  const [patKey, setPatKey] = useState("");
  const [patAction, setPatAction] = useState("");
  const [newView, setNewView] = useState("");

  // ---------- Economy (Treasury) ----------
  const [wallets, setWallets] = useState({
    treasury: { owner: "Infinity Treasury", balance: 1_000_000 },
    you: { owner: "Kris Watson", balance: 0 },
    watson: { owner: "Watson AI", balance: 0 },
    gemini: { owner: "Gemini AI", balance: 0 },
  });
  const [ledger, setLedger] = useState([]); // newest first
  const [series, setSeries] = useState([]); // [{iter, ...balances}]
  const [iters, setIters] = useState(0);

  function transfer(t, from, to, amt) {
    t[from].balance -= amt;
    t[to].balance += amt;
    return `${t[from].owner} → ${t[to].owner}: ${amt} ∞`;
  }

  function stepSimulation() {
    const t = JSON.parse(JSON.stringify(wallets));
    const tx = [];
    tx.push(transfer(t, "treasury", "you", 100));
    tx.push(transfer(t, "you", "watson", 50));
    tx.push(transfer(t, "watson", "gemini", 25));
    tx.push(transfer(t, "gemini", "you", 25));

    const k = iters + 1;
    setIters(k);
    setWallets(t);
    setLedger([{ iter: k, tx }, ...ledger].slice(0, 50));
    setSeries([
      ...series,
      {
        iter: k,
        Treasury: t.treasury.balance,
        "Kris Watson": t.you.balance,
        "Watson AI": t.watson.balance,
        "Gemini AI": t.gemini.balance,
      },
    ]);
  }

  function runNTimes(n = 10) {
    // run synchronously to keep UI simple
    for (let i = 0; i < n; i++) stepSimulation();
  }

  function resetSimulation() {
    setWallets({
      treasury: { owner: "Infinity Treasury", balance: 1_000_000 },
      you: { owner: "Kris Watson", balance: 0 },
      watson: { owner: "Watson AI", balance: 0 },
      gemini: { owner: "Gemini AI", balance: 0 },
    });
    setLedger([]);
    setSeries([]);
    setIters(0);
  }

  // Export JSON (computed lazily on click)
  function exportJSON() {
    const payload = {
      flowGraph: { nodes, edges },
      infinityAI: { patterns },
      adaptiveDashboard: { context, views, compact },
      economy: { wallets, series },
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "infinity-nexus-state.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---- CRUD helpers ---------------------------------
  function addNode() {
    const label = newNodeLabel.trim();
    if (!label) return;
    const n = { id: uid(), label };
    const next = [...nodes, n];
    setNodes(next);
    if (next.length === 1) setEdgeFrom(n.id);
    setNewNodeLabel("");
  }

  function addEdge() {
    if (!edgeFrom || !edgeTo || edgeFrom === edgeTo) return;
    setEdges([...edges, { id: uid(), from: edgeFrom, to: edgeTo }]);
  }

  function deleteNode(id) {
    setNodes(nodes.filter((n) => n.id !== id));
    setEdges(edges.filter((e) => e.from !== id && e.to !== id));
  }

  function deleteEdge(id) {
    setEdges(edges.filter((e) => e.id !== id));
  }

  function addPattern() {
    const k = patKey.trim();
    const a = patAction.trim();
    if (!k || !a) return;
    setPatterns([...patterns, { key: k, action: a }]);
    setPatKey("");
    setPatAction("");
  }

  function removePattern(i) {
    setPatterns(patterns.filter((_, idx) => idx !== i));
  }

  function addView() {
    const v = newView.trim();
    if (!v) return;
    setViews([...views, v]);
    setNewView("");
  }

  function removeView(i) {
    setViews(views.filter((_, idx) => idx !== i));
  }

  return (
    <div className={`min-h-screen w-full ${compact ? "p-2" : "p-6"} bg-gradient-to-br from-slate-900 via-slate-800 to-black`}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Infinity Nexus – Safe Mode</h1>
            <p className="text-white/70 text-sm md:text-base">No external UI libs. If this loads, the issue was import-related.</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-white/80 text-sm flex items-center gap-2">
              <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compact
            </label>
            <button onClick={exportJSON} className="rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm hover:bg-white/20">Export JSON</button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FLOWGRAPH */}
          <div className="lg:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold mb-3">FlowGraph</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MiniGraph nodes={nodes} edges={edges} />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-white/80 text-sm">Add Node</div>
                    <div className="flex gap-2 mt-2">
                      <input className="flex-1 rounded-md bg-white/90 px-2 py-2 text-sm" placeholder="label (e.g., oracle)" value={newNodeLabel} onChange={(e) => setNewNodeLabel(e.target.value)} />
                      <button onClick={addNode} className="rounded-md px-3 bg-white/10 border border-white/20 text-white text-sm">Add</button>
                    </div>
                  </div>
                  <div>
                    <div className="text-white/80 text-sm">Add Edge</div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <select className="col-span-1 rounded-md bg-white/90 p-2 text-sm" value={edgeFrom} onChange={(e) => setEdgeFrom(e.target.value)}>
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                      <div className="grid place-items-center text-white/70">→</div>
                      <select className="col-span-1 rounded-md bg-white/90 p-2 text-sm" value={edgeTo} onChange={(e) => setEdgeTo(e.target.value)}>
                        {nodes.map((n) => (
                          <option key={n.id} value={n.id}>{n.label}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={addEdge} className="mt-2 rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm">Add Edge</button>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-white/80 text-sm mb-2">Nodes</div>
                <ul className="space-y-2">
                  {nodes.map((n) => (
                    <li key={n.id} className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2">
                      <span className="text-white/90 text-sm">{n.label}</span>
                      <button onClick={() => deleteNode(n.id)} className="text-white/70 text-xs hover:underline">Remove</button>
                    </li>
                  ))}
                </ul>
                <div className="text-white/80 text-sm mt-4 mb-2">Edges</div>
                <ul className="space-y-2">
                  {edges.map((e) => (
                    <li key={e.id} className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2">
                      <span className="text-white/90 text-sm">{nodes.find(n=>n.id===e.from)?.label} → {nodes.find(n=>n.id===e.to)?.label}</span>
                      <button onClick={() => deleteEdge(e.id)} className="text-white/70 text-xs hover:underline">Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* AI PATTERNS */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold mb-3">Infinity AI – Patterns</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-white/80 text-sm">Pattern Key</div>
                <input className="w-full rounded-md bg-white/90 px-2 py-2 text-sm" placeholder="e.g., buy" value={patKey} onChange={(e) => setPatKey(e.target.value)} />
              </div>
              <div>
                <div className="text-white/80 text-sm">Action</div>
                <input className="w-full rounded-md bg-white/90 px-2 py-2 text-sm" placeholder="e.g., execute_trade" value={patAction} onChange={(e) => setPatAction(e.target.value)} />
              </div>
            </div>
            <button onClick={addPattern} className="mt-2 rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm">Add Pattern</button>
            <ul className="space-y-2 mt-2">
              {patterns.map((p, i) => (
                <li key={`${p.key}-${i}`} className="flex items-center justify-between rounded-md bg-white/10 px-3 py-2">
                  <span className="text-white/90 text-sm">{p.key} → {p.action}</span>
                  <button onClick={() => removePattern(i)} className="text-white/70 text-xs hover:underline">Remove</button>
                </li>
              ))}
            </ul>
          </div>

          {/* DASHBOARD */}
          <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold mb-3">Adaptive Dashboard</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid grid-cols-1 lg:grid-cols-3 gap-4">
                {views.map((v, i) => (
                  <div key={`${v}-${i}`} className="rounded-xl border border-white/10 bg-white/10 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{v}</span>
                      <button onClick={() => removeView(i)} className="text-white/70 text-xs hover:underline">Remove</button>
                    </div>
                    <div className="mt-2 text-white/70 text-sm">
                      {v === "positions" && <div>Wallet ↔ Exchange positions snapshot.</div>}
                      {v === "sentiment" && <div>AI-derived market sentiment heatline.</div>}
                      {v === "ai-logs" && <div>Recent pattern triggers and inferences.</div>}
                      {v !== "positions" && v !== "sentiment" && v !== "ai-logs" && <div>Custom panel: {v}</div>}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-white/80 text-sm">Context</div>
                <input className="w-full rounded-md bg白/90 px-2 py-2 text-sm" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g., trading, research, creator" />
                <div className="text-white/80 text-sm mt-3">Add View</div>
                <div className="flex gap-2 mt-2">
                  <input className="flex-1 rounded-md bg-white/90 px-2 py-2 text-sm" placeholder="e.g., liquidity" value={newView} onChange={(e) => setNewView(e.target.value)} />
                  <button onClick={addView} className="rounded-md px-3 bg-white/10 border border-white/20 text-white text-sm">Add</button>
                </div>
                <div className="mt-3 text-white/80 text-sm">Notes</div>
                <textarea className="w-full min-h-[92px] rounded-md bg-white/90 p-2 text-sm" placeholder="Optional dashboard notes or runbook..." />
              </div>
            </div>
          </div>

          {/* ECONOMY / TREASURY */}
          <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold mb-3">Infinity Treasury – Economy Loop</div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={stepSimulation} className="rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm">Step</button>
                  <button onClick={() => runNTimes(10)} className="rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm">Run ×10</button>
                  <button onClick={resetSimulation} className="rounded-md px-3 py-2 bg-white/10 border border-white/20 text-white text-sm">Reset</button>
                </div>
                <div className="mt-3 rounded-xl border border-white/10 bg-white/10 p-3 text-white/90 text-sm space-y-1">
                  <div className="flex justify-between"><span>Treasury</span><span>{wallets.treasury.balance.toLocaleString()} ∞</span></div>
                  <div className="flex justify-between"><span>Kris Watson</span><span>{wallets.you.balance.toLocaleString()} ∞</span></div>
                  <div className="flex justify-between"><span>Watson AI</span><span>{wallets.watson.balance.toLocaleString()} ∞</span></div>
                  <div className="flex justify-between"><span>Gemini AI</span><span>{wallets.gemini.balance.toLocaleString()} ∞</span></div>
                  <div className="flex justify-between pt-2 border-t border-white/10"><span>Iterations</span><span>{iters}</span></div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <LineChartMini data={series} keys={["Kris Watson", "Watson AI", "Gemini AI", "Treasury"]} />
              </div>
              <div className="lg:col-span-3">
                <div className="text-white/80 text-sm">Recent Transactions</div>
                <div className="mt-2 grid md:grid-cols-2 gap-3">
                  {ledger.length === 0 && (
                    <div className="text-white/60 text-sm">No transactions yet. Click <em>Step</em> to start the loop.</div>
                  )}
                  {ledger.map((row) => (
                    <div key={row.iter} className="rounded-xl border border-white/10 bg-white/10 p-3">
                      <div className="text-white/90 font-medium">Iteration {row.iter}</div>
                      <ul className="text-white/70 text-sm mt-1 list-disc pl-5">
                        {row.tx.map((t, i) => (<li key={i}>{t}</li>))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CHECKLIST */}
          <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-white font-semibold mb-3">Launch Checklist</div>
            <ol className="list-decimal pl-6 text-white/80 space-y-2 text-sm">
              <li>Define nodes (wallet, exchange, oracle, vault) and connect edges.</li>
              <li>Map AI patterns (buy, observe, hedge) to concrete actions.</li>
              <li>Choose dashboard context and compose views.</li>
              <li>Export JSON to archive config or feed a backend.</li>
              <li>Wire a real bridge (ethers/web3) for on-chain sync.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
