import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Infinity Shortwave – All‑in‑one old‑time front + in‑app DIGITAL TUNER (no external page)
 *
 * Runtime‑safe JavaScript version (no TypeScript syntax) + bug fixes:
 *  • Removed TS type params from useState/refs that caused build/runtime errors.
 *  • Added missing `fine` state referenced by the dial handler.
 *  • Guarded AudioContext start; keep context and suspend instead of closing.
 *  • Works entirely in‑app with WebAudio DSP (AM/USB/LSB/CW demo‑grade).
 *  • DEMO mode synthesizes shortwave‑like signals so you can test instantly.
 *  • Optional WebSocket IQ input (48 kHz Float32 interleaved I/Q) for real RF.
 */

export default function InfinityShortwave() {
  // ==== UI STATE ====
  const [mode, setMode] = useState("AM");            // "AM" | "USB" | "LSB" | "CW"
  const [freqKHz, setFreqKHz] = useState(9700);      // tuned frequency (kHz)
  const [centerHz, setCenterHz] = useState(11000000); // SDR center (Hz)
  const [iqUrl, setIqUrl] = useState("");           // wss://your-sdr.example/iq
  const [useDemo, setUseDemo] = useState(true);      // DEMO on by default
  const [connected, setConnected] = useState(false);
  const [sMeter, setSMeter] = useState(0);
  const [fine, setFine] = useState(0);               // dial motion hint (for magic eye)

  // Rotary dial range 3–30 MHz
  const MIN_KHZ = 3000, MAX_KHZ = 30000;

  // Bands (for quick jump)
  const bands = [
    { name: "120m", range: [2300, 2495] },
    { name: "90m", range: [3200, 3400] },
    { name: "75m", range: [3900, 4050] },
    { name: "60m", range: [4750, 5060] },
    { name: "49m", range: [5900, 6200] },
    { name: "41m", range: [7200, 7450] },
    { name: "31m", range: [9400, 9900] },
    { name: "25m", range: [11600, 12100] },
    { name: "22m", range: [13570, 13870] },
    { name: "19m", range: [15100, 15830] },
    { name: "16m", range: [17480, 17900] },
    { name: "13m", range: [21450, 21850] },
  ];

  // MAGIC‑EYE heuristic: stronger near band centers and when S‑meter rises
  const eyeTension = useMemo(() => {
    const bandScores = bands.map((b) => {
      const [lo, hi] = b.range; const center = (lo + hi) / 2; const w = (hi - lo) / 2;
      const norm = Math.min(1, Math.abs(freqKHz - center) / w);
      return 1 - norm; // 1 at band center, 0 outside
    });
    const affinity = Math.max(...bandScores);
    const meter = Math.min(1, sMeter / 9); // S0..S9 → 0..1
    const motionPenalty = Math.min(1, Math.abs(fine) / 50);
    return Math.max(0, affinity * 0.6 + meter * 0.4 - motionPenalty * 0.3);
  }, [freqKHz, sMeter, fine]);

  // ===== DSP ENGINE (WebAudio) =====
  const audioCtxRef = useRef(null);            // AudioContext
  const scriptRef = useRef(null);              // ScriptProcessorNode
  const wsRef = useRef(null);                  // WebSocket

  // IQ ring buffer (approx 2 seconds of interleaved I/Q)
  const RING = useRef(new Float32Array(48_000 * 2 * 2));
  const ringWrite = useRef(0);
  const ringRead = useRef(0);
  const sampleRate = 48000; // IQ fs

  // Local NCO (numerically controlled oscillator) for mixing
  const ncoPhase = useRef(0);
  const TWO_PI = Math.PI * 2;

  // DEMO generator (fake band: carriers + fading + noise)
  const demoTick = useRef(0);

  function ensureAudioContext() {
    if (!audioCtxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AC();
    }
    if (audioCtxRef.current.state === "suspended") {
      // Resume on user gesture paths (button/dial interactions trigger this indirectly)
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }

  function startAudio() {
    const ctx = ensureAudioContext();
    if (scriptRef.current) return; // already running
    const node = ctx.createScriptProcessor(2048, 0, 1);
    node.onaudioprocess = (ev) => {
      const out = ev.outputBuffer.getChannelData(0);
      for (let i = 0; i < out.length; i++) {
        let I = 0, Q = 0;
        const haveData = ringRead.current !== ringWrite.current;
        if (haveData) {
          I = RING.current[ringRead.current];
          Q = RING.current[(ringRead.current + 1) % RING.current.length];
          ringRead.current = (ringRead.current + 2) % RING.current.length;
        } else if (useDemo) {
          // Simple demo: two AM carriers in the 31m band, plus noise + slow fading
          const t = demoTick.current / sampleRate;
          const f1 = 9_730_000; // RRI demo tone
          const f2 = 9_490_000; // WBCQ demo tone
          const df = (freqKHz * 1000 - 9_550_000) * 0.1; // tuning offset influence
          const c1 = Math.sin(TWO_PI * (f1 + df) * t);
          const c2 = Math.sin(TWO_PI * (f2 + df) * t);
          const m1 = 0.4 + 0.3 * Math.sin(TWO_PI * 440 * t);
          const m2 = 0.4 + 0.3 * Math.sin(TWO_PI * 600 * t);
          const n = (Math.random() - 0.5) * 0.15;
          I = (c1 * m1 + c2 * m2) * 0.3 + n;
          Q = (c1 * 0.3 - c2 * 0.3) * 0.3 + n * 0.5;
          demoTick.current++;
        }

        // Mix to audio baseband based on tuning offset from center
        const tuneHz = freqKHz * 1000 - centerHz; // desired shift
        const phaseInc = TWO_PI * (tuneHz / sampleRate);
        ncoPhase.current += phaseInc; if (ncoPhase.current > TWO_PI) ncoPhase.current -= TWO_PI;
        const cs = Math.cos(ncoPhase.current), sn = Math.sin(ncoPhase.current);
        const Ibb = I * cs + Q * sn; // complex mix
        const Qbb = -I * sn + Q * cs;

        // Envelope / simple demods
        let audio = 0;
        if (mode === "AM") {
          const env = Math.sqrt(Ibb * Ibb + Qbb * Qbb);
          audio = env - 0.3; // remove DC (quick‑and‑dirty)
        } else if (mode === "USB") {
          audio = Ibb; // crude SSB (no proper filter)
        } else if (mode === "LSB") {
          audio = -Ibb;
        } else if (mode === "CW") {
          audio = Ibb * 0.5;
        }

        // Simple 1‑pole lowpass for audio smoothing
        const alpha = 0.15;
        const prev = startAudio._lp || 0;
        const y = prev + alpha * (audio - prev);
        startAudio._lp = y;
        out[i] = y * 0.9;

        // S‑meter (very rough), update once per callback
        if (i === 0) {
          const s = 20 * Math.log10(1e-6 + Math.sqrt(Ibb * Ibb + Qbb * Qbb));
          setSMeter((prevS) => prevS * 0.9 + Math.max(0, (s + 60) / 12) * 0.1); // normalize to ~0..9
        }
      }
    };
    node.connect(ctx.destination);
    scriptRef.current = node;
  }

  function stopAudio() {
    if (scriptRef.current) { scriptRef.current.disconnect(); scriptRef.current = null; }
    if (audioCtxRef.current) audioCtxRef.current.suspend().catch(() => {});
  }

  function connectWS() {
    disconnectWS();
    try {
      const ws = new WebSocket(iqUrl);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => { setConnected(true); startAudio(); };
      ws.onclose = () => { setConnected(false); };
      ws.onerror = () => { setConnected(false); };
      ws.onmessage = (ev) => {
        if (typeof ev.data === "string") {
          // Optional control JSON from server
          try {
            const msg = JSON.parse(ev.data);
            if (msg.type === "center_hz" && Number.isFinite(msg.hz)) setCenterHz(msg.hz | 0);
          } catch {}
          return;
        }
        const buf = new Float32Array(ev.data);
        for (let i = 0; i < buf.length; i++) {
          RING.current[ringWrite.current] = buf[i];
          ringWrite.current = (ringWrite.current + 1) % RING.current.length;
        }
      };
      wsRef.current = ws;
    } catch (e) {
      console.error(e);
      setConnected(false);
    }
  }

  function disconnectWS() {
    if (wsRef.current) { try { wsRef.current.close(); } catch {} }
    wsRef.current = null;
  }

  useEffect(() => { return () => { disconnectWS(); stopAudio(); }; }, []);

  // ===== DIAL =====
  const dialRef = useRef(null);
  const [dialAngle, setDialAngle] = useState(angleForFreq(freqKHz));
  function angleForFreq(khz) { const a0=-135,a1=135; const t=(khz-MIN_KHZ)/(MAX_KHZ-MIN_KHZ); return a0 + t*(a1-a0); }
  function freqForAngle(a){ const a0=-135,a1=135; const t=(a-a0)/(a1-a0); return Math.round(MIN_KHZ + t*(MAX_KHZ-MIN_KHZ)); }
  useEffect(()=>{ setDialAngle(angleForFreq(freqKHz)); },[freqKHz]);

  function onDialPointer(e) {
    const el = dialRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const x = e.clientX - cx, y = e.clientY - cy;
    const ang = Math.atan2(y, x) * 180/Math.PI + 90;
    const clamped = Math.max(-135, Math.min(135, ang));
    setDialAngle(clamped);
    const newKHz = freqForAngle(clamped);
    setFine(newKHz - freqKHz);
    setFreqKHz(newKHz);
  }

  return (
    <div className="min-h-screen w-full bg-neutral-900 text-neutral-100 flex flex-col items-center py-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Infinity Shortwave</h1>
        <p className="text-neutral-400 text-sm">Vintage tuner · Magic eye · In‑App DSP (Beta)</p>
      </div>

      <div className="w-[100%] max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radio face */}
        <div className="rounded-3xl p-4 md:p-6 shadow-2xl border border-black/30 bg-[radial-gradient(ellipse_at_top_left,rgba(50,30,10,.7),rgba(22,14,8,.95))] relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 mb-4 z-10 relative">
            <select className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-sm" value={mode} onChange={(e)=>setMode(e.target.value)}>
              {["AM","USB","LSB","CW"].map(m=> <option key={m} value={m}>{m}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">Center</span>
              <input className="bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-xs w-28" value={centerHz} onChange={(e)=>{ const v = parseInt(e.target.value, 10); if (Number.isFinite(v)) setCenterHz(v); }} />
              <span className="text-xs opacity-70">Hz</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs opacity-70">IQ WebSocket</span>
              <input className="bg-black/50 border border-white/10 rounded-xl px-2 py-1 text-xs w-64" placeholder="wss://your-sdr.example/iq" value={iqUrl} onChange={(e)=>setIqUrl(e.target.value)} />
              <button onClick={()=>{ setUseDemo(false); connectWS(); }} className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs">Connect</button>
              <button onClick={()=>{ disconnectWS(); setConnected(false); setUseDemo(true); startAudio(); }} className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-xl text-xs">Demo</button>
            </div>
            <div className="ml-auto text-xs opacity-80">{connected?"LIVE IQ" : useDemo?"DEMO" : "IDLE"} • S≈{sMeter.toFixed(1)}</div>
          </div>

          {/* Dial + Magic Eye */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Dial */}
            <div className="flex flex-col items-center">
              <div className="text-sm opacity-80 mb-1">{(freqKHz/1000).toFixed(3)} MHz · {mode}</div>
              <div
                ref={dialRef}
                onPointerDown={(e)=>{ e.currentTarget.setPointerCapture(e.pointerId); onDialPointer(e); }}
                onPointerMove={(e)=>{ if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) onDialPointer(e); }}
                onPointerUp={(e)=>{ try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {} setFine(0); }}
                className="relative select-none"
                style={{ width: 260, height: 260 }}
              >
                <div className="absolute inset-0 rounded-full border-4 border-black/50 shadow-inner" style={{
                  background: "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.08), rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.6) 100%)",
                }} />
                {[...Array(37)].map((_, i) => { const ang = -135 + (270/36)*i; const thick = i%6===0; return (
                  <div key={i} className="absolute left-1/2 top-1/2 origin-[0_0]" style={{transform:`rotate(${ang}deg) translateY(-110px)`, width:2, height:thick?18:10, background:"linear-gradient(to bottom, rgba(255,255,255,.8), rgba(255,255,255,0))"}} /> );})}
                {[3,6,9,12,15,18,21,24,27,30].map((mhz,i)=>{ const ang=-135+(270*(mhz-3))/27; const r=90; return (
                  <div key={i} className="absolute text-xs font-medium text-white/80" style={{left:130 + r*Math.sin(ang*Math.PI/180)-10, top:130 - r*Math.cos(ang*Math.PI/180)-8}}>{mhz}</div>
                );})}
                <div className="absolute left-1/2 top-1/2 origin-bottom pointer-events-none" style={{width:6, height:110, transform:`rotate(${dialAngle}deg) translate(-50%, -100%)`, transformOrigin:"50% 100%", background:"linear-gradient(to top, #f5f5f5, #bbb)", borderRadius:3, boxShadow:"0 0 8px rgba(255,255,255,0.45)"}} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 justify-center">
                {bands.map((b)=>(
                  <button key={b.name} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs" onClick={()=> setFreqKHz(Math.round((b.range[0]+b.range[1])/2))}>{b.name}</button>
                ))}
              </div>
            </div>

            {/* Magic Eye + nudges */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-48 h-24 rounded-b-[2rem] rounded-t-[2rem] bg-black/70 border border-emerald-300/20 shadow-inner flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{
                  background: `radial-gradient(ellipse at center, rgba(0,255,140,0.9) 0%, rgba(0,255,140,0.75) ${Math.max(0, 55 - eyeTension*45)}%, rgba(0,0,0,0.95) ${Math.max(0, 56 - eyeTension*45)}%)`,
                  filter: "blur(0.6px)",
                }} />
                <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 12px rgba(0,255,140,0.35)" }} />
                <div className="absolute bottom-1 text-[10px] tracking-wide text-emerald-300/80">MAGIC EYE</div>
              </div>
              <div className="flex items-center gap-2">
                {[-5, -1, +1, +5].map(step => (
                  <button key={step} className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20" onClick={()=> setFreqKHz((f)=> Math.min(MAX_KHZ, Math.max(MIN_KHZ, f + step)))}>{step>0?`+${step}`:step} kHz</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spectrum / status panel (placeholder for future FFT) */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-black/30 bg-black/60 p-4 text-sm">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <div className="font-medium">In‑App Digital Tuner (Beta)</div>
            <div className="opacity-70">Center: {centerHz.toLocaleString()} Hz • Tune: {(freqKHz*1000).toLocaleString()} Hz</div>
          </div>
          <div className="rounded-xl border border-white/10 p-3 bg-black/30">
            <p className="opacity-80 mb-2">Feed it an IQ WebSocket (48 kHz Float32 interleaved). No permissions needed.</p>
            <ul className="list-disc ml-5 space-y-1 opacity-80">
              <li>Click <span className="font-medium">Demo</span> to hear the built‑in synthetic stations and noise.</li>
              <li>When you have a backend (rtl‑tcp → Node proxy → WebSocket), paste the <span className="font-medium">wss://</span> URL and press <span className="font-medium">Connect</span>.</li>
              <li>We do fine tuning in software; your server can keep a fixed center or accept center commands.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl w-full mt-4 text-[13px] text-neutral-300">
        <div className="rounded-2xl border border-white/10 p-4 bg-black/40">
          <div className="font-semibold mb-1">Backend recipe (quick)</div>
          <ol className="list-decimal ml-5 space-y-1 opacity-80">
            <li>Run an RTL‑SDR/SoapySDR on a small server (Raspberry Pi OK). Sample at <code>48 kHz</code> complex IQ.</li>
            <li>Wrap the IQ in a tiny Node.js WebSocket server that streams Float32 interleaved I/Q frames.</li>
            <li>(Optional) Accept <code>{`{"type":"set_center_hz","hz":11000000}`}</code> control messages to retune the dongle.</li>
            <li>Serve via <code>wss://</code> (HTTPS cert) to avoid mixed content prompts. Point this app at that URL.</li>
          </ol>
        </div>
        <div className="opacity-70 mt-2">Powered by Infinity • In‑browser DSP prototype. Next steps: proper SSB filters, AGC, FFT spectrum, and recording.</div>
      </div>
    </div>
  );
}
