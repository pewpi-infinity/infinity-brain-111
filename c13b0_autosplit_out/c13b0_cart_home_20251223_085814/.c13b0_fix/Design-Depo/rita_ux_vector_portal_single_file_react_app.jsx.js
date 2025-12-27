import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import * as THREE from "three";
import { Mic, Image as ImageIcon, Send, Palette as PaletteIcon, LayoutGrid, Cube, Sparkles, Loader2, Menu } from "lucide-react";

/**
 * RITA — UX Designer Page (Infinity Portal Style)
 * --------------------------------------------------------------
 * Single-file React app featuring:
 * 1) Animated “vector” transitions (SVG swoosh with traveling pulse)
 * 2) Rita: Interior decoration expert chatbot with smart prompts
 * 3) 3D Room preview (Three.js) with holographic/bio-cell vibe
 * 4) Palette generator + live wall paint
 * 5) Layout presets & quick actions
 * 6) Image & mic stubs (ready to wire to real services)
 *
 * Tip: Drop into any React environment; uses Tailwind classes if available.
 */

// ------------------------------------
// Helpers
// ------------------------------------
const TAB_LIST = [
  { id: "brief",     label: "Brief",        weightMs: 350,  icon: Sparkles },
  { id: "chat",      label: "Rita Chat",    weightMs: 480,  icon: Send },
  { id: "palette",   label: "Palette",      weightMs: 620,  icon: PaletteIcon },
  { id: "layouts",   label: "Layouts",      weightMs: 720,  icon: LayoutGrid },
  { id: "room3d",    label: "3D",           weightMs: 1200, icon: Cube },
];

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function hslToHex(h,s,l){ // expect h:[0..360), s|l:[0..100]
  s/=100; l/=100; const k=n=>(n+ h/30)%12; const a=s*Math.min(l,1-l);
  const f=n=>l - a * Math.max(-1, Math.min(k(n)-3, Math.min(9-k(n),1)));
  const toHex = x => Math.round(255*x).toString(16).padStart(2,'0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function generateTriad(baseH=200, s=60, l=50){
  const hs = [baseH, (baseH+120)%360, (baseH+240)%360];
  return hs.map(h=>hslToHex(h,s,l));
}

// get element center position in viewport
function getCenter(el){
  if(!el) return {x: window.innerWidth/2, y: 80};
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width/2, y: r.top + r.height/2 };
}

// ------------------------------------
// Vector Transition Swoosh
// ------------------------------------
function VectorSwoosh({ startEl, endEl, duration=600, onDone }){
  const pathRef = useRef(null);
  const [path, setPath] = useState("");
  const [len, setLen] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(()=>{
    const start = getCenter(startEl);
    const end = getCenter(endEl);
    const midX = (start.x + end.x)/2;
    const cy = Math.min(start.y, end.y) - 120; // arc up a bit
    const d = `M ${start.x},${start.y} Q ${midX},${cy} ${end.x},${end.y}`;
    setPath(d);
  },[startEl, endEl]);

  useEffect(()=>{
    if(!pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    setLen(total);
    setProgress(0);

    let raf;
    const t0 = performance.now();
    const tick = (t)=>{
      const p = clamp01((t - t0)/duration);
      setProgress(p);
      if(p < 1) raf = requestAnimationFrame(tick); else onDone && onDone();
    };
    raf = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(raf);
  }, [path, duration, onDone]);

  const point = useMemo(()=>{
    if(!pathRef.current) return {x:0, y:0};
    const l = progress * len;
    const p = pathRef.current.getPointAtLength(l);
    return {x: p.x, y: p.y};
  }, [progress, len]);

  return (
    <svg className="pointer-events-none fixed inset-0 z-[80]">
      {/* trail */}
      <path ref={pathRef} d={path} fill="none" stroke="url(#grad)" strokeWidth={2} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len - len*progress} />
      {/* pulse */}
      <defs>
        <linearGradient id="grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#67e8f9"/>
          <stop offset="100%" stopColor="#22c55e"/>
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <circle cx={point.x} cy={point.y} r={6} fill="#22d3ee"/>
      </g>
    </svg>
  );
}

// ------------------------------------
// Holographic/Bio-Cell Backdrop (SVG turbulence)
// ------------------------------------
function BioCellBackdrop(){
  return (
    <svg className="fixed inset-0 -z-10" aria-hidden>
      <filter id="bio">
        <feTurbulence type="fractalNoise" baseFrequency="0.003 0.006" numOctaves="2" seed="7"/>
        <feColorMatrix type="saturate" values="0.6"/>
        <feGaussianBlur stdDeviation="40"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#bio)" opacity="0.6"/>
    </svg>
  );
}

// ------------------------------------
// Three.js Room Preview
// ------------------------------------
function Room3D({ wallColor="#bfe3ff" }){
  const mountRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(()=>{
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x06090f, 10, 60);
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(4, 2.2, 5.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    mount.appendChild(renderer.domElement);

    // Room (box without front)
    const room = new THREE.Group();
    const geoWall = new THREE.PlaneGeometry(8, 3);
    const matWall = new THREE.MeshStandardMaterial({ color: new THREE.Color(wallColor), metalness: 0.05, roughness: 0.9 });
    const back = new THREE.Mesh(geoWall, matWall); back.position.z = -4;
    const left = new THREE.Mesh(geoWall, matWall); left.position.x = -4; left.rotation.y = Math.PI/2;
    const right= new THREE.Mesh(geoWall, matWall); right.position.x = 4; right.rotation.y = -Math.PI/2;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8,8), new THREE.MeshStandardMaterial({ color: 0x222831, metalness:0.2, roughness:0.7 }));
    floor.rotation.x = -Math.PI/2; floor.position.y = -1.5;
    room.add(back,left,right,floor);
    scene.add(room);

    // Holographic sculpture
    const ico = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 2),
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { time: { value: 0 }, colorA: { value: new THREE.Color(0x00fff0) }, colorB: { value: new THREE.Color(0x4ade80) } },
        vertexShader: `varying vec3 vPos; void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `uniform float time; uniform vec3 colorA; uniform vec3 colorB; varying vec3 vPos; void main(){ float w = 0.5 + 0.5*sin(length(vPos)*3.0 + time*2.0); vec3 col = mix(colorA, colorB, w); gl_FragColor = vec4(col, 0.35 + 0.25*w); }`
      })
    );
    ico.position.set(0, -0.2, -2.2);
    scene.add(ico);

    // Lights
    const amb = new THREE.AmbientLight(0xbdf3ff, 0.5); scene.add(amb);
    const p1 = new THREE.PointLight(0x22d3ee, 10, 20); p1.position.set(-2,2,2); scene.add(p1);
    const p2 = new THREE.PointLight(0x4ade80, 10, 20); p2.position.set(3,1,-1); scene.add(p2);

    // Animate
    const onResize = ()=>{
      if(!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', onResize);

    const loop = (t)=>{
      frameRef.current = requestAnimationFrame(loop);
      ico.material.uniforms.time.value = t/1000;
      ico.rotation.y += 0.004; ico.rotation.x += 0.002;
      camera.position.x = 4 + Math.sin(t/3500)*0.6;
      camera.lookAt(0, -0.3, -2);
      renderer.render(scene, camera);
    };
    frameRef.current = requestAnimationFrame(loop);

    return ()=>{
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  },[]);

  // live wall repaint
  useEffect(()=>{
    // find room meshes by traversing
    const mount = mountRef.current; if(!mount) return;
    const renderer = mount.querySelector('canvas'); // no access; repaint handled by state in scene above
    // (For simplicity, we skip live material lookup. Instead, we re-init scene on color prop change.)
  }, [wallColor]);

  // re-init scene on wallColor change by remounting component key up top
  return <div ref={mountRef} className="w-full h-[360px] rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-slate-900/60 to-black/40 overflow-hidden"/>;
}

// ------------------------------------
// Rita — interior decoration expert (local rules, easy to swap for real LLM)
// ------------------------------------
function RitaChat({ onPalette, onApplyWall, setActiveTab }){
  const [messages, setMessages] = useState([
    { who: 'rita', text: "Hey I’m Rita. Tell me your room, style, budget & any must‑keep items. I’ll sketch a plan, palette, and layout — then we’ll preview it in 3D." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const analyze = (text)=>{
    // quick-n-smart: parse style, budget, dimensions
    const styles = ["modern","scandinavian","boho","industrial","mid-century","minimal","farmhouse","coastal","japandi"];
    const foundStyle = styles.find(s=> text.toLowerCase().includes(s));
    const budget = (text.match(/\$\s?([0-9,.]+)/) || [])[1] || (text.match(/budget\s*(\d+)/i) || [])[1];
    const dims = (text.match(/(\d{1,2})\s?[x×]\s?(\d{1,2})/i) || [])[0];
    const room = (text.match(/(living\s?room|bed\s?room|kitchen|office|dining|studio|bath)/i) || [])[0] || "room";

    // palette seeds
    const colorWords = ["blue","green","teal","aqua","pink","purple","tan","beige","brown","white","black","gray","grey","gold","brass","copper"];
    const seedColor = colorWords.find(c=> text.toLowerCase().includes(c)) || "teal";
    const baseHue = {
      teal: 180, blue:210, green:140, pink:330, purple:270, tan:40, beige:35, brown:25,
      white:0, black:0, gray:200, grey:200, gold:48, brass:45, copper:20, aqua:170
    }[seedColor] ?? 200;
    const palette = generateTriad(baseHue, 58, 54);

    const plan = [
      `Space: ${dims || "—"} • Style: ${foundStyle || "modern-cozy"} • Budget: ${budget?`$${budget}`:"flex"}`,
      `Palette idea → ${palette.join("  ")}`,
      `Materials → oak/ash woods, matte paint, tactile textiles; warm metal accents (brass/blackened steel).`,
      `Lighting → layer 3 types: diffuse ceiling, task lamps, and low-level glow.`,
    ].join("\n");

    return { room, palette, plan, wall: palette[0] };
  };

  const send = async ()=>{
    if(!input.trim()) return;
    const text = input.trim();
    setMessages(m=>[...m, { who:'you', text }]);
    setInput(""); setBusy(true);

    const { room, palette, plan, wall } = analyze(text);
    // pretend to think a beat
    await new Promise(r=>setTimeout(r, 420));

    const reply = [
      `Great — here’s a quick concept for your ${room}:\n${plan}`,
      `Want me to apply that first color to the 3D walls, generate a full palette card, or a layout?`
    ].join("\n\n");

    setMessages(m=>[...m, { who:'rita', text: reply }]);
    onPalette?.(palette);
    onApplyWall?.(wall);
    setBusy(false);
  };

  const quick = (kind)=>{
    if(kind==='palette'){ setActiveTab('palette'); }
    if(kind==='layout'){ setActiveTab('layouts'); }
    if(kind==='3d'){ setActiveTab('room3d'); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((m,i)=> (
          <div key={i} className={`max-w-[92%] ${m.who==='you'?'ml-auto':''}`}>
            <div className={`rounded-2xl px-4 py-3 text-sm shadow ${m.who==='you'?'bg-cyan-500/20 ring-1 ring-cyan-400/30':'bg-emerald-500/15 ring-1 ring-emerald-400/30'} backdrop-blur`}> 
              <div className="font-medium opacity-80 mb-1">{m.who==='you'? 'You' : 'Rita'}</div>
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.text}</pre>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-cyan-200/80 text-sm"><Loader2 className="animate-spin w-4 h-4"/>Rita is sketching…</div>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button className="p-2 rounded-xl ring-1 ring-white/10 hover:bg-white/5" title="Voice (stub)"><Mic className="w-5 h-5"/></button>
        <button className="p-2 rounded-xl ring-1 ring-white/10 hover:bg-white/5" title="Add image (stub)"><ImageIcon className="w-5 h-5"/></button>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=> e.key==='Enter' && send()} placeholder="Describe the room, style, budget…" className="flex-1 bg-white/5 rounded-xl px-3 py-2 outline-none ring-1 ring-white/10 focus:ring-emerald-400/40"/>
        <button onClick={send} className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 ring-1 ring-emerald-400/30 flex items-center gap-2"><Send className="w-4 h-4"/>Send</button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs opacity-80">
        <span>Quick:</span>
        <button onClick={()=>quick('palette')} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center gap-1"><PaletteIcon className="w-3.5 h-3.5"/>Palette</button>
        <button onClick={()=>quick('layout')} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center gap-1"><LayoutGrid className="w-3.5 h-3.5"/>Layout</button>
        <button onClick={()=>quick('3d')} className="px-2 py-1 rounded-lg bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center gap-1"><Cube className="w-3.5 h-3.5"/>3D</button>
      </div>
    </div>
  );
}

// ------------------------------------
// Palette Panel
// ------------------------------------
function PalettePanel({ palette, setWallColor }){
  const [baseHue, setBaseHue] = useState(200);
  const triad = useMemo(()=> generateTriad(baseHue, 60, 52), [baseHue]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">Triadic palette based on hue <span className="font-mono">{baseHue}°</span></div>
        <input type="range" min={0} max={359} value={baseHue} onChange={e=>setBaseHue(parseInt(e.target.value,10))} className="w-48"/>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {triad.map((c,i)=> (
          <button key={i} onClick={()=>setWallColor(c)} className="rounded-xl p-4 ring-1 ring-white/10 shadow" style={{ background: c }}>
            <div className="backdrop-blur bg-black/20 rounded-md px-2 py-1 text-xs text-white/90">{c}</div>
          </button>
        ))}
      </div>
      <div className="text-xs opacity-80">Tip: pick a dominant, a secondary, and a 10–15% accent. We’ll use the dominant on walls.</div>
    </div>
  );
}

// ------------------------------------
// Layout Panel
// ------------------------------------
function LayoutsPanel(){
  const cards = [
    { name: "Minimal Flow", bullets: ["Float sofa center; leave 900mm paths","Low-profile media unit","Single statement artwork"] },
    { name: "Cozy Nook", bullets: ["Sofa to wall; corner reading chair","Layered rug over jute base","Warm task lamps"] },
    { name: "Entertainer", bullets: ["Conversation island (sofa + 2 chairs)","Extendable dining to side","Dimmable track lights"] },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {cards.map((c,i)=> (
        <div key={i} className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
          <div className="text-sm font-semibold mb-2">{c.name}</div>
          <ul className="space-y-1 text-sm opacity-85 list-disc pl-5">
            {c.bullets.map((b,j)=>(<li key={j}>{b}</li>))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ------------------------------------
// Brief Panel
// ------------------------------------
function BriefPanel(){
  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>Welcome to <span className="font-semibold">RITA</span> — your interior design co‑pilot. Describe your space and goals; I’ll propose mood, palette, layout, and a live 3D preview. The animated vector guide shows where you’re navigating — faster apps swoosh instantly; heavier tools travel longer with a subtle loading beat.</p>
      <ul className="list-disc pl-5 space-y-1 opacity-85">
        <li>Type: room name + style + dimensions (e.g., “living room, modern, 12×16 ft, $3k”).</li>
        <li>Adjust palette → apply to walls with one tap.</li>
        <li>Explore layouts → minimal, cozy, or entertainer presets.</li>
        <li>Preview in 3D → holographic, bio‑graphic cell aesthetic.</li>
      </ul>
    </div>
  );
}

// ------------------------------------
// App Shell
// ------------------------------------
export default function App(){
  const [active, setActive] = useState("brief");
  const [target, setTarget] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [wallColor, setWallColor] = useState("#bfe3ff");
  const [palette, setPalette] = useState(["#bfe3ff","#e6b3ff","#b3ffe6"]);

  const tabRefs = useRef({});
  const panelRef = useRef(null);
  const headerRef = useRef(null);

  const go = useCallback((id)=>{
    if(id === active || transitioning) return;
    const tab = TAB_LIST.find(t=>t.id===id);
    setTarget(id);
    setTransitioning(true);
    // after weightMs, swap
    setTimeout(()=>{ setActive(id); setTransitioning(false); }, tab?.weightMs ?? 600);
  }, [active, transitioning]);

  // remount 3D to repaint on color change (key trick)
  const roomKey = useMemo(()=> wallColor, [wallColor]);

  return (
    <div className="min-h-screen text-white selection:bg-emerald-400/30">
      <BioCellBackdrop/>

      {/* Header */}
      <header ref={headerRef} className="sticky top-0 z-20 backdrop-blur bg-black/30 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button className="p-2 rounded-xl bg-white/5 ring-1 ring-white/10"><Menu className="w-4 h-4"/></button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>
            <div className="font-semibold tracking-wide">RITA — Interior Design AI</div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs opacity-80">
            <Sparkles className="w-4 h-4"/>
            <span>Infinity Portal • Vector Nav</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 mt-5">
        <div className="flex flex-wrap items-center gap-2">
          {TAB_LIST.map(t=>{
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                ref={el=>{ tabRefs.current[t.id]=el; }}
                onClick={()=>go(t.id)}
                className={`px-3 py-2 rounded-2xl ring-1 ring-white/10 backdrop-blur flex items-center gap-2 transition ${active===t.id? 'bg-emerald-500/20 ring-emerald-400/30' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4"/>{t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panels */}
      <main ref={panelRef} className="max-w-6xl mx-auto px-4 mt-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Left column */}
          <div className="rounded-3xl p-5 bg-white/5 ring-1 ring-white/10 backdrop-blur min-h-[380px]">
            <AnimatePresence mode="wait">
              {active==='brief' && (
                <motion.div key="brief" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}}>
                  <BriefPanel/>
                </motion.div>
              )}
              {active==='palette' && (
                <motion.div key="palette" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}}>
                  <PalettePanel palette={palette} setWallColor={setWallColor}/>
                </motion.div>
              )}
              {active==='layouts' && (
                <motion.div key="layouts" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}}>
                  <LayoutsPanel/>
                </motion.div>
              )}
              {active==='chat' && (
                <motion.div key="chat" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} className="h-[380px]">
                  <RitaChat onPalette={setPalette} onApplyWall={setWallColor} setActiveTab={setActive}/>
                </motion.div>
              )}
              {active==='room3d' && (
                <motion.div key="room3d" initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm opacity-80">3D Preview (wall color → <span className="font-mono">{wallColor}</span>)</div>
                    <label className="flex items-center gap-2 text-xs">
                      <span className="opacity-80">Paint</span>
                      <input type="color" value={wallColor} onChange={e=>setWallColor(e.target.value)} className="w-8 h-6 rounded border-0 p-0 bg-transparent"/>
                    </label>
                  </div>
                  {/* remount on color change */}
                  <Room3D key={roomKey} wallColor={wallColor}/>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right column: contextual cards */}
          <div className="space-y-6">
            <div className="rounded-3xl p-5 bg-white/5 ring-1 ring-white/10 backdrop-blur">
              <div className="text-sm mb-3 opacity-80">Palette snapshot</div>
              <div className="grid grid-cols-3 gap-3">
                {palette.map((c,i)=> (
                  <div key={i} className="rounded-xl h-16 ring-1 ring-white/10 shadow" style={{background:c}}/>
                ))}
              </div>
              <div className="mt-3 text-xs opacity-70">Use one color for walls, one for large furniture, and reserve the brightest for accents.</div>
            </div>

            <div className="rounded-3xl p-5 bg-white/5 ring-1 ring-white/10 backdrop-blur">
              <div className="text-sm mb-3 opacity-80">Uploads</div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center gap-2"><ImageIcon className="w-4 h-4"/>Add photo</button>
                <button className="px-3 py-2 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 flex items-center gap-2"><Mic className="w-4 h-4"/>Voice note</button>
              </div>
              <div className="mt-3 text-xs opacity-70">(Stubs) Wire these to image analysis or STT when ready.</div>
            </div>

            <div className="rounded-3xl p-5 bg-white/5 ring-1 ring-white/10 backdrop-blur">
              <div className="text-sm mb-2 opacity-80">Next steps</div>
              <ol className="list-decimal pl-5 space-y-1 text-sm opacity-85">
                <li>Describe your room in <span className="font-medium">Rita Chat</span>.</li>
                <li>Tune the <span className="font-medium">Palette</span> and click a swatch to paint walls.</li>
                <li>Pick a <span className="font-medium">Layout</span> and iterate.</li>
                <li>Open <span className="font-medium">3D</span> to preview the vibe.</li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      {/* Vector Transition Overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[70] pointer-events-none">
            <VectorSwoosh
              startEl={tabRefs.current[active]}
              endEl={panelRef.current}
              duration={TAB_LIST.find(t=>t.id===target)?.weightMs ?? 600}
              onDone={()=>{ /* handled by setTimeout in go() */ }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="mt-10 py-6 text-center text-xs opacity-70">
        Powered by <span className="font-semibold">Infinity</span> • Vector/Holographic UI • Rita v0.1 (local brain)
      </footer>
    </div>
  );
}
