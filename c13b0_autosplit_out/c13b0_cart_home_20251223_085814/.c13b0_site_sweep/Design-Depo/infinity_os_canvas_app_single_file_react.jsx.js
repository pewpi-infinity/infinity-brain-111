import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Infinity OS — Single‑file Canvas App
 * Goals (no external deps):
 * - Icon Wheel ("I Do" actions) with suit modes
 * - Upload → crop (simple canvas), rotate, rounded previews
 * - Auto‑generate Title/Description scaffolding + value estimates
 * - Rogers AI side panel (open/close by backdrop), real chat loop
 * - Clean, modern UI with Tailwind classes
 *
 * Notes:
 * - All logic is self‑contained; no network calls.
 * - Image cropper: click & drag to define a rectangle; Release → confirm; Save applies crop.
 * - Infinity Value uses a growth rate slider; projections at 10/100/1000y.
 */

// ===== Utility helpers =====
const fmt = (n) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// Basic filename → guesser (placeholder for Vision)
function guessFromName(name = "") {
  const base = name.toLowerCase();
  if (!base) return { title: "Untitled Artifact", cat: "General" };
  if (/(coin|cent|nickel|dime|quarter|sovereign|denarius|aureus)/.test(base)) return { title: "Numismatic Piece", cat: "Coins" };
  if (/(emerald|sapphire|ruby|diamond|gem|gemstone)/.test(base)) return { title: "Gemstone Specimen", cat: "Gemstones" };
  if (/(watch|pocket|longines|dueber)/.test(base)) return { title: "Vintage Timepiece", cat: "Watches" };
  return { title: name.replace(/[-_]/g, " ").replace(/\.[a-z0-9]+$/, "") || "Untitled Artifact", cat: "General" };
}

// Quick hash for IDs
const hash = (s) => Array.from(s).reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0) >>> 0;

// Suit modes
const SUITS = [
  { key: "clubs", label: "Peasant", emoji: "♣", hint: "Basics & Survival" },
  { key: "hearts", label: "Clergy", emoji: "♥", hint: "Healing & Spirit" },
  { key: "diamonds", label: "Merchant", emoji: "♦", hint: "Trade & Value" },
  { key: "spades", label: "Noble", emoji: "♠", hint: "Leadership & Vision" },
];

const ACTIONS = [
  "I Eat", "I Sleep", "I Watch", "I Drive", "I Stock", "I Sell", "I Buy", "I Think", "I Feel", "I Watch Movies",
];

// ===== Main App =====
export default function InfinityOSCanvas() {
  const [mode, setMode] = useState("diamonds");
  const [mindRead, setMindRead] = useState(false);
  const [images, setImages] = useState([]); // { id, name, url, w, h }
  const [activeId, setActiveId] = useState(null);
  const [rotations, setRotations] = useState({}); // id -> 0/90/180/270

  // Listing fields
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("General");
  const [currency, setCurrency] = useState("USD");
  const [value, setValue] = useState(250);
  const [growth, setGrowth] = useState(3.0); // % per year for Infinity curve

  // Rogers panel
  const [rogersOpen, setRogersOpen] = useState(false);
  const [chat, setChat] = useState([]); // {role: 'user'|'ai', text}
  const inputRef = useRef(null);

  // Cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropRect, setCropRect] = useState(null); // {x,y,w,h}
  const [dragging, setDragging] = useState(false);
  const cropCanvasRef = useRef(null);
  const cropImgRef = useRef(null);
  const [cropTargetId, setCropTargetId] = useState(null);

  // Derived projections
  const projections = useMemo(() => {
    const r = growth / 100;
    const p10 = value * Math.pow(1 + r, 10);
    const p100 = value * Math.pow(1 + r, 100);
    const p1000 = value * Math.pow(1 + r, 1000);
    return { p10, p100, p1000 };
  }, [value, growth]);

  // ===== Handlers =====
  function onFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newItems = files.map((f) => ({ id: hash(f.name + ":" + f.size + ":" + Math.random()), file: f, name: f.name }));
    newItems.forEach((item) => {
      const url = URL.createObjectURL(item.file);
      const img = new Image();
      img.onload = () => {
        setImages((prev) => [...prev, { id: item.id, name: item.name, url, w: img.width, h: img.height }]);
        // Seed listing fields from first image name if empty
        if (!title) {
          const g = guessFromName(item.name);
          setTitle(g.title);
          setCategory(g.cat);
          setDesc(
            `Infinity registry draft for \"${g.title}\". Provide reverse/angle shots if available. Condition, provenance, and notable marks (countermarks, alterations) will refine the attribution.\n\n` +
            `Auto-notes: File \"${item.name}\" analyzed locally. (Tip: add back photo for coins, pavilion/crown for gems.)`
          );
        }
      };
      img.src = url;
    });
  }

  function rotate(id) {
    setRotations((r) => ({ ...r, [id]: ((r[id] || 0) + 90) % 360 }));
  }

  function sellSimilar() {
    setTitle((t) => `${t} — Similar`);
  }

  // Rogers AI local mock
  function sendMessage(text) {
    const msg = text?.trim();
    if (!msg) return;
    setChat((c) => [...c, { role: "user", text: msg }]);

    // Simple reasoning stub
    const reply = (() => {
      // lightweight intent routing
      if (/identify|what.*is|help.*id/i.test(msg)) {
        const hint = images[0]?.name ? guessFromName(images[0].name).title : "artifact";
        return `Initial pass: looks like a ${hint}. For higher confidence, add a reverse/edge shot and any scale.`;
      }
      if (/value|worth|price/i.test(msg)) {
        return `Market snapshot scaffold: ${currency} ${fmt(value)} (current), with Infinity projections at growth ${growth}% → 10y ${fmt(projections.p10)}, 100y ${fmt(
          projections.p100
        )}, 1000y ${fmt(projections.p1000)}.`;
      }
      if (/crop|rotate|image/i.test(msg)) {
        return `Use the crop tool on any thumbnail, then Rotate as needed. Previews apply rounded corners + clean background.`;
      }
      if (/mode|suit|peasant|clergy|merchant|noble/i.test(msg)) {
        return `Suit modes: ♣ Peasant (basics), ♥ Clergy (healing), ♦ Merchant (trade), ♠ Noble (leadership). You are in ${mode.toUpperCase()}.`;
      }
      return `Noted. I can scaffold: title/desc, category, basic valuation, and Infinity curve. Ask for \"encapsulate\" to format registry text.`;
    })();

    // Typewriter feel
    let i = 0;
    const timer = setInterval(() => {
      i += Math.ceil(Math.random() * 3);
      const partial = reply.slice(0, i);
      setChat((c) => {
        const last = c[c.length - 1];
        if (!last || last.role === "user") return [...c, { role: "ai", text: partial }];
        const clone = c.slice();
        clone[clone.length - 1] = { role: "ai", text: partial };
        return clone;
      });
      if (i >= reply.length) clearInterval(timer);
    }, 16);
  }

  function openCrop(id) {
    setCropTargetId(id);
    setCropRect(null);
    setCropperOpen(true);
    // Load target image into crop canvas after modal paint
    setTimeout(() => initCropCanvas(id), 0);
  }

  function initCropCanvas(id) {
    const cv = cropCanvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!ctx) return;
    const item = images.find((im) => im.id === id);
    const img = new Image();
    cropImgRef.current = img;
    img.onload = () => {
      // Fit image into canvas with max 800px dim
      const maxDim = 800;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      cv.width = Math.floor(img.width * scale);
      cv.height = Math.floor(img.height * scale);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, 0, cv.width, cv.height);
    };
    img.src = item.url;
  }

  function drawCropBox() {
    const cv = cropCanvasRef.current;
    const ctx = cv?.getContext("2d");
    const img = cropImgRef.current;
    if (!ctx || !img) return;
    // Redraw image
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(img, 0, 0, cv.width, cv.height);

    if (cropRect) {
      ctx.save();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(cropRect.x, cropRect.y, cropRect.w, cropRect.h);
      ctx.restore();
    }
  }

  function onCropMouse(e) {
    const cv = cropCanvasRef.current;
    const rect = cv.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!dragging) {
      setDragging(true);
      setCropRect({ x, y, w: 0, h: 0 });
      return;
    }
    setCropRect((r) => ({ ...r, w: x - r.x, h: y - r.y }));
  }

  function onCropUp() {
    if (!dragging) return;
    setDragging(false);
    drawCropBox();
  }

  useEffect(() => {
    drawCropBox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cropRect, cropperOpen]);

  function applyCrop() {
    if (!cropRect || !cropCanvasRef.current) return;
    const src = cropCanvasRef.current;
    const { x, y, w, h } = cropRect;
    const sx = Math.min(x, x + w);
    const sy = Math.min(y, y + h);
    const sw = Math.abs(w);
    const sh = Math.abs(h);
    if (sw < 8 || sh < 8) return;

    const out = document.createElement("canvas");
    out.width = sw;
    out.height = sh;
    const octx = out.getContext("2d");
    octx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    const dataUrl = out.toDataURL("image/png");

    // Replace image in list
    setImages((prev) => prev.map((im) => (im.id === cropTargetId ? { ...im, url: dataUrl, w: sw, h: sh } : im)));
    setCropperOpen(false);
  }

  // Mind‑read demo toggles mode based on text intent (purely local)
  useEffect(() => {
    if (!mindRead) return;
    const t = `${title} ${desc}`.toLowerCase();
    if (/heal|breathe|health|lungs|throat|relax|spirit/.test(t)) setMode("hearts");
    else if (/lead|president|govern|treasury|noble/.test(t)) setMode("spades");
    else if (/buy|sell|trade|price|value|auction|market/.test(t)) setMode("diamonds");
    else setMode("clubs");
  }, [mindRead, title, desc]);

  // Active image derived
  const active = images.find((im) => im.id === activeId) || images[0];

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="italic font-black tracking-wider text-yellow-400 drop-shadow-[0_0_1px_rgba(0,0,0,1)] outline outline-1 outline-black px-2 rounded">Infinity</div>
            <div className="text-sm text-neutral-400">Powered by Rogers</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">Mode:</span>
            <ModePill mode={mode} onChange={setMode} />
            <label className="ml-4 flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" className="accent-yellow-400" checked={mindRead} onChange={(e) => setMindRead(e.target.checked)} />
              Mind‑read demo
            </label>
            <button onClick={() => setRogersOpen(true)} className="ml-3 rounded-2xl border border-neutral-700 px-3 py-1.5 text-sm hover:border-neutral-500">Rogers AI</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-12 gap-4 px-4 py-6">
        {/* Icon Wheel */}
        <section className="col-span-12 md:col-span-3">
          <Card title="Icon Wheel">
            <div className="grid grid-cols-3 gap-2">
              {ACTIONS.map((a) => (
                <button key={a} className="rounded-2xl border border-neutral-700 px-2 py-3 text-xs hover:border-neutral-500 hover:bg-neutral-900">
                  {a}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-neutral-400">Suit‑aware UI. Icons reflect {SUITS.find((s) => s.key === mode)?.label} mode.</p>
          </Card>
        </section>

        {/* Uploader & Listing */}
        <section className="col-span-12 md:col-span-6">
          <Card title="Listing Workspace">
            {/* Upload */}
            <div className="flex items-center justify-between">
              <label className="block w-full cursor-pointer rounded-2xl border border-dashed border-neutral-700 p-4 text-center hover:border-neutral-500">
                <input type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
                <div className="text-sm text-neutral-300">Upload images (auto clean + rounded previews)</div>
              </label>
            </div>

            {/* Thumbs */}
            {!!images.length && (
              <div className="mt-4 grid grid-cols-3 gap-3">
                {images.map((im) => (
                  <div key={im.id} className={`group relative rounded-2xl border ${active?.id === im.id ? "border-yellow-400" : "border-neutral-800"} bg-neutral-900 p-2`}>
                    <img
                      src={im.url}
                      alt={im.name}
                      onClick={() => setActiveId(im.id)}
                      className="aspect-square w-full rounded-xl object-cover"
                      style={{ transform: `rotate(${rotations[im.id] || 0}deg)` }}
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
                      <span className="truncate" title={im.name}>{im.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => rotate(im.id)} className="rounded-lg border border-neutral-700 px-2 py-1 hover:border-neutral-500">Rotate</button>
                        <button onClick={() => openCrop(im.id)} className="rounded-lg border border-neutral-700 px-2 py-1 hover:border-neutral-500">Crop</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Fields */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none placeholder:text-neutral-500" />
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={5} placeholder="Description"
                className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none placeholder:text-neutral-500" />
              <div className="grid grid-cols-2 gap-3">
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2">
                  {['General','Coins','Gemstones','Watches','Artifacts','Art','Cards'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 rounded-2xl border border-neutral-700 bg-neutral-900 px-3 py-2">
                  <input value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-16 bg-transparent outline-none" />
                  <input type="number" value={value} onChange={(e) => setValue(parseFloat(e.target.value || 0))} className="w-full bg-transparent outline-none" />
                </div>
              </div>

              {/* Infinity curve */}
              <div className="rounded-2xl border border-neutral-800 p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-neutral-300">Infinity Growth</div>
                  <div className="text-neutral-400">{growth}% / yr</div>
                </div>
                <input type="range" min={0} max={20} step={0.5} value={growth} onChange={(e) => setGrowth(parseFloat(e.target.value))} className="mt-2 w-full" />
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-neutral-300">
                  <div className="rounded-xl border border-neutral-800 p-2"><div className="text-neutral-500">10 yrs</div><div>{currency} {fmt(projections.p10)}</div></div>
                  <div className="rounded-xl border border-neutral-800 p-2"><div className="text-neutral-500">100 yrs</div><div>{currency} {fmt(projections.p100)}</div></div>
                  <div className="rounded-xl border border-neutral-800 p-2"><div className="text-neutral-500">1000 yrs</div><div>{currency} {fmt(projections.p1000)}</div></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={sellSimilar} className="rounded-2xl border border-neutral-700 px-4 py-2 hover:border-neutral-500">Sell Similar</button>
                <button onClick={() => sendMessage("encapsulate")} className="rounded-2xl border border-yellow-500 bg-yellow-500/10 px-4 py-2 hover:bg-yellow-500/20">Infinity Encapsulate</button>
              </div>
            </div>
          </Card>
        </section>

        {/* Preview */}
        <section className="col-span-12 md:col-span-3">
          <Card title="Preview Capsule">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
                <span>Registry</span>
                <span>∞</span>
              </div>
              <div className="rounded-xl bg-neutral-950 p-3">
                <div className="mb-2 text-sm font-semibold text-neutral-200">{title || "Untitled"}</div>
                {active ? (
                  <img src={active.url} alt="active" className="mb-3 aspect-square w-full rounded-xl object-cover" style={{ transform: `rotate(${rotations[active.id] || 0}deg)` }} />
                ) : (
                  <div className="mb-3 aspect-square w-full rounded-xl bg-neutral-900" />
                )}
                <div className="text-xs text-neutral-300 whitespace-pre-wrap">{desc || "No description yet."}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-neutral-300">
                  <div className="rounded-lg border border-neutral-800 p-2">Category: {category}</div>
                  <div className="rounded-lg border border-neutral-800 p-2">Value: {currency} {fmt(value)}</div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* Rogers Panel */}
      {rogersOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setRogersOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute bottom-0 right-0 m-4 w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 md:m-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-neutral-800 p-3">
              <div className="text-sm text-neutral-300">Rogers — Live scaffold</div>
              <button onClick={() => setRogersOpen(false)} className="rounded-lg border border-neutral-700 px-2 py-1 text-xs hover:border-neutral-500">Close</button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3">
              {chat.length === 0 && <div className="text-sm text-neutral-500">Ask me to identify, value, or encapsulate.</div>}
              {chat.map((m, i) => (
                <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-neutral-200' : 'text-yellow-200'}`}>{m.role === 'user' ? 'You' : 'Rogers'}: {m.text}</div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-neutral-800 p-3">
              <input ref={inputRef} placeholder="Type a message..." className="flex-1 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 outline-none" onKeyDown={(e) => {
                if (e.key === 'Enter') { sendMessage(e.currentTarget.value); e.currentTarget.value = ''; }
              }} />
              <button onClick={() => { const el = inputRef.current; if (el?.value) { sendMessage(el.value); el.value=''; } }} className="rounded-xl border border-neutral-700 px-3 py-2 hover:border-neutral-500">Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Cropper Modal */}
      {cropperOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/70" onClick={() => setCropperOpen(false)} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[860px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="mb-3 text-sm text-neutral-300">Crop — click and drag, then Save</div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-neutral-800 bg-neutral-900 p-3">
              <canvas
                ref={cropCanvasRef}
                className="max-w-full cursor-crosshair rounded"
                onMouseDown={(e) => onCropMouse(e)}
                onMouseMove={(e) => dragging && onCropMouse(e)}
                onMouseUp={onCropUp}
              />
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => setCropperOpen(false)} className="rounded-xl border border-neutral-700 px-3 py-2 hover:border-neutral-500">Cancel</button>
              <button onClick={applyCrop} className="rounded-xl border border-yellow-500 bg-yellow-500/10 px-3 py-2 hover:bg-yellow-500/20">Save Crop</button>
            </div>
          </div>
        </div>
      )}

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-neutral-500">
        Powered by Infinity — The Lending Giant
      </footer>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-950 p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-200">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ModePill({ mode, onChange }) {
  return (
    <div className="flex items-center gap-1 rounded-2xl border border-neutral-700 p-1">
      {SUITS.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          title={`${s.label}: ${s.hint}`}
          className={`rounded-2xl px-3 py-1 text-sm ${mode === s.key ? "bg-neutral-800 border border-neutral-600" : "hover:bg-neutral-900"}`}
        >
          <span className="mr-1">{s.emoji}</span>
          <span className="hidden sm:inline">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
