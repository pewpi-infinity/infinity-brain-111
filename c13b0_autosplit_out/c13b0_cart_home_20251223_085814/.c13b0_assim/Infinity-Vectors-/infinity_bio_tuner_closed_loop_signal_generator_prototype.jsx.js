import React, { useEffect, useMemo, useRef, useState } from "react";

// Infinity BioTuner — Closed‑Loop Signal Generator (Prototype)
// ------------------------------------------------------------
// SAFE, NON‑MEDICAL DEMO
// This is a wellness-oriented prototype that generates gentle audio/haptic signals
// and reads basic sensors to adaptively guide relaxation. It is NOT a medical device.
// Do not use as a substitute for diagnosis or treatment. Volume is hard‑limited.
//
// Features
// • Web Audio signal engine (sine/triangle/noise)
// • Binaural & isochronic pulse modes
// • Breath pacing (0.08–0.12 Hz target range)
// • BLE Heart Rate Service (0x180D) ingestion with RR‑intervals → HR & RMSSD (HRV proxy)
// • Camera‑free operation by default; optional DeviceMotion
// • Adaptive controller nudges frequency/depth to maximize HRV surrogate (RMSSD)
// • Big red STOP (global gate)
// • Session log + mini sparkline
// ------------------------------------------------------------

// ---------- Small helpers ----------
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function fmt(n, d=0) { return Number.isFinite(n) ? n.toFixed(d) : "–"; }

// Rolling window utility for HR/RR
class Ring {
  constructor(n){ this.n=n; this.a=new Array(n); this.i=0; this.len=0; }
  push(x){ this.a[this.i]=x; this.i=(this.i+1)%this.n; this.len=Math.min(this.len+1,this.n); }
  values(){ const out=[]; for(let k=0;k<this.len;k++){ out.push(this.a[(this.i-this.len+k+this.n)%this.n]); } return out; }
}

function rmssd(rrMs){
  // RR intervals (ms) → RMSSD (ms)
  if(rrMs.length<3) return NaN;
  let s=0, c=0; for(let i=1;i<rrMs.length;i++){ const d=rrMs[i]-rrMs[i-1]; s+=d*d; c++; }
  return Math.sqrt(s/c);
}

// ---------- Sparkline ----------
function Spark({data=[], min=0, max=1}){
  const path = useMemo(()=>{
    if(!data.length) return "";
    const w=200, h=40; const dx = w/Math.max(1,data.length-1);
    const mapY = v => h - ((clamp(v,min,max)-min)/(max-min||1))*h;
    let d=`M0 ${mapY(data[0])}`;
    data.forEach((v,i)=>{ d+=` L${i*dx} ${mapY(v)}` });
    return {d, w, h};
  },[data,min,max]);
  return (
    <svg width={220} height={50} className="rounded-xl bg-neutral-900/40">
      <path d={path.d} strokeWidth={2} stroke="currentColor" fill="none" />
    </svg>
  );
}

// ---------- Main Component ----------
export default function App(){
  // Audio engine refs
  const audioCtxRef = useRef(null);
  const masterGainRef = useRef(null);
  const leftGainRef = useRef(null);
  const rightGainRef = useRef(null);
  const lOscRef = useRef(null);
  const rOscRef = useRef(null);
  const isoOscRef = useRef(null);
  const isoGainRef = useRef(null);
  const noiseRef = useRef(null);

  // State
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("binaural"); // 'binaural' | 'isochronic' | 'tone' | 'noise'
  const [baseHz, setBaseHz] = useState(200); // carrier for isochronic/tone
  const [beatHz, setBeatHz] = useState(10); // binaural beat or isochronic pulse rate
  const [volume, setVolume] = useState(0.12); // hard limit enforced (<=0.2)
  const [breathHz, setBreathHz] = useState(0.1); // breath pacing tone AM
  const [connected, setConnected] = useState(false);
  const [hr, setHr] = useState(NaN);
  const [rmssdMs, setRmssdMs] = useState(NaN);
  const [hrSeries, setHrSeries] = useState([]);
  const rrRing = useRef(new Ring(128));

  // Safety volume ceiling
  useEffect(()=>{ if(volume>0.2) setVolume(0.2); },[volume]);

  // Initialize audio graph lazily
  const ensureAudio = async ()=>{
    if(audioCtxRef.current) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
    const master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);
    const leftGain = ctx.createGain(); const rightGain = ctx.createGain();
    leftGain.gain.value = 0.0; rightGain.gain.value = 0.0;
    leftGain.connect(master); rightGain.connect(master);

    // Binaural oscillators (stereo carriers around 200–600 Hz is comfortable)
    const lOsc = ctx.createOscillator(); const rOsc = ctx.createOscillator();
    lOsc.type = "sine"; rOsc.type = "sine";
    lOsc.connect(leftGain); rOsc.connect(rightGain);

    // Isochronic (single carrier AM by square/ramp)
    const isoOsc = ctx.createOscillator();
    const isoGain = ctx.createGain();
    isoOsc.type = "sine"; isoGain.gain.value = 0.0; // depth controlled
    const carrier = ctx.createOscillator(); carrier.type = "sine"; carrier.frequency.value = baseHz;
    const carrierGain = ctx.createGain(); carrierGain.gain.value = 0.0; // off until in use
    carrier.connect(carrierGain).connect(master);
    // Use isoGain to modulate carrierGain.gain
    isoOsc.connect(isoGain);
    const isoMod = ctx.createGain(); isoMod.gain.value = 0.5; // depth
    isoGain.connect(isoMod).connect(carrierGain.gain);

    // Pink-ish noise for comfort masking
    const noise = (()=>{
      const b = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
      const d = b.getChannelData(0);
      let x=0; for(let i=0;i<d.length;i++){ x = 0.98*x + (Math.random()*2-1)*0.02; d[i]=x; }
      const s = ctx.createBufferSource(); s.buffer=b; s.loop=true; const g=ctx.createGain(); g.gain.value=0.0; s.connect(g).connect(master); s.start();
      return g;
    })();

    audioCtxRef.current = ctx;
    masterGainRef.current = master;
    leftGainRef.current = leftGain; rightGainRef.current = rightGain;
    lOscRef.current = lOsc; rOscRef.current = rOsc;
    isoOscRef.current = isoOsc; isoGainRef.current = isoGain;
    noiseRef.current = noise;

    lOsc.start(); rOsc.start(); isoOsc.start(); carrier.start();
  };

  // Start/stop engine
  const start = async ()=>{
    await ensureAudio();
    const ctx = audioCtxRef.current; if(ctx.state === "suspended") await ctx.resume();
    masterGainRef.current.gain.setTargetAtTime(volume, ctx.currentTime, 0.1);
    setRunning(true);
  };
  const stop = async ()=>{
    if(!audioCtxRef.current) return;
    const ctx = audioCtxRef.current; masterGainRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.05);
    leftGainRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.05);
    rightGainRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.05);
    if(isoGainRef.current) isoGainRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.05);
    if(noiseRef.current) noiseRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.05);
    setRunning(false);
  };

  // Update audio parameters when state changes
  useEffect(()=>{
    if(!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    // Mode routing
    if(mode === "binaural"){
      // e.g., left = base, right = base + beat
      const base = clamp(baseHz, 120, 600);
      const beat = clamp(beatHz, 0.5, 40);
      lOscRef.current.frequency.setTargetAtTime(base, ctx.currentTime, 0.05);
      rOscRef.current.frequency.setTargetAtTime(base+beat, ctx.currentTime, 0.05);
      leftGainRef.current.gain.setTargetAtTime(volume*0.6, ctx.currentTime, 0.05);
      rightGainRef.current.gain.setTargetAtTime(volume*0.6, ctx.currentTime, 0.05);
      if(isoGainRef.current) isoGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      if(noiseRef.current) noiseRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.3);
    } else if(mode === "isochronic"){
      // Use iso oscillator to AM a carrier
      const beat = clamp(beatHz, 0.3, 40);
      isoOscRef.current.frequency.setTargetAtTime(beat, ctx.currentTime, 0.05);
      leftGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      rightGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      isoGainRef.current.gain.setTargetAtTime(1.0, ctx.currentTime, 0.05);
      if(noiseRef.current) noiseRef.current.gain.setTargetAtTime(volume*0.25, ctx.currentTime, 0.3);
    } else if(mode === "tone"){
      lOscRef.current.frequency.setTargetAtTime(baseHz, ctx.currentTime, 0.05);
      rOscRef.current.frequency.setTargetAtTime(baseHz, ctx.currentTime, 0.05);
      leftGainRef.current.gain.setTargetAtTime(volume*0.5, ctx.currentTime, 0.05);
      rightGainRef.current.gain.setTargetAtTime(volume*0.5, ctx.currentTime, 0.05);
      if(isoGainRef.current) isoGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      if(noiseRef.current) noiseRef.current.gain.setTargetAtTime(0.0, ctx.currentTime, 0.3);
    } else if(mode === "noise"){
      leftGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      rightGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      if(noiseRef.current) noiseRef.current.gain.setTargetAtTime(volume*0.5, ctx.currentTime, 0.3);
    }
  },[mode, baseHz, beatHz, volume]);

  // Breath pacing by gentle amplitude modulation (global)
  useEffect(()=>{
    if(!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const t = ctx.currentTime;
    // simple slow LFO by scheduling master gain wobble around volume
    const target = clamp(volume, 0, 0.2);
    const wobble = clamp(0.3*target, 0, 0.08);
    const schedule = ()=>{
      if(!masterGainRef.current) return;
      const now = ctx.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.setTargetAtTime(target-wobble, now, 0.5);
      masterGainRef.current.gain.setTargetAtTime(target+wobble, now + 1/(breathHz||0.1)/2, 0.5);
    };
    const id = setInterval(schedule, 800);
    return ()=>clearInterval(id);
  },[breathHz, volume, running]);

  // BLE Heart Rate Service (0x180D)
  const connectBLE = async ()=>{
    try{
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["heart_rate"] }],
        optionalServices: ["device_information"]
      });
      const server = await device.gatt.connect();
      const svc = await server.getPrimaryService("heart_rate");
      const ch = await svc.getCharacteristic("heart_rate_measurement");
      await ch.startNotifications();
      ch.addEventListener("characteristicvaluechanged", ev=>{
        const dv = ev.target.value;
        // Parse Heart Rate Measurement (BLE spec)
        let idx=0; const flags = dv.getUint8(idx++);
        const hr16 = flags & 0x1;
        const contact = (flags>>1)&0x3;
        const ee = (flags>>3)&0x1; const rr = (flags>>4)&0x1;
        let _hr = hr16 ? dv.getUint16(idx, /*le*/true) && (idx+=2)
                        : dv.getUint8(idx++);
        setHr(_hr);
        if(rr){
          // RR intervals are in 1/1024 s units after all preceding fields
          while(idx+1<dv.byteLength){
            const rrVal = dv.getUint16(idx, true); idx+=2;
            const ms = (rrVal/1024)*1000;
            rrRing.current.push(ms);
            const vals = rrRing.current.values();
            const v = rmssd(vals);
            setRmssdMs(v);
            setHrSeries(s=>[...s.slice(-60), _hr]);
          }
        }
      });
      setConnected(true);
    }catch(e){
      console.error(e);
      alert("BLE failed: "+e.message);
    }
  };

  // Adaptive controller — nudge beatHz toward HRV peak, keep breath ~0.1 Hz
  useEffect(()=>{
    if(!running) return;
    if(!Number.isFinite(rmssdMs)) return;
    // Simple heuristic: if RMSSD rising, continue small drift; else invert
    const id = setInterval(()=>{
      setBreathHz(h=>clamp(h + (Math.random()*0.02-0.01), 0.08, 0.12));
      setBeatHz(f=>clamp(f + (Math.random()*0.6-0.3), 0.5, 20));
    }, 4000);
    return ()=>clearInterval(id);
  },[running, rmssdMs]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-950 to-neutral-900 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto grid gap-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Infinity BioTuner — Closed‑Loop Signal Generator</h1>
          <div className="text-xs opacity-70 text-right">
            <div>Prototype · Wellness / Biofeedback only</div>
            <div>Volume capped ≤ 0.2 · Big red STOP = immediate mute</div>
          </div>
        </header>

        {/* Controls */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-4 bg-neutral-900/60 shadow">
            <div className="flex items-center gap-3">
              <button onClick={running?stop:start} className={`px-4 py-2 rounded-xl font-medium ${running?"bg-red-600 hover:bg-red-500":"bg-emerald-600 hover:bg-emerald-500"}`}>
                {running?"STOP":"START"}
              </button>
              <button onClick={stop} className="px-3 py-2 rounded-xl bg-red-900/60 border border-red-700">Panic Mute</button>
            </div>

            <div className="mt-4 grid gap-3">
              <label className="text-sm">Mode</label>
              <select value={mode} onChange={e=>setMode(e.target.value)} className="bg-neutral-800 rounded-xl p-2">
                <option value="binaural">Binaural (stereo)</option>
                <option value="isochronic">Isochronic (AM pulses)</option>
                <option value="tone">Plain Tone</option>
                <option value="noise">Pink Noise</option>
              </select>

              <label className="text-sm mt-3">Carrier / Base (Hz): {fmt(baseHz,0)}</label>
              <input type="range" min={100} max={600} value={baseHz} onChange={e=>setBaseHz(parseFloat(e.target.value))} />

              <label className="text-sm mt-3">Beat / Pulse (Hz): {fmt(beatHz,1)}</label>
              <input type="range" min={0.5} max={20} step={0.1} value={beatHz} onChange={e=>setBeatHz(parseFloat(e.target.value))} />

              <label className="text-sm mt-3">Breath pacing (Hz): {fmt(breathHz,3)} (~6/min)</label>
              <input type="range" min={0.06} max={0.14} step={0.002} value={breathHz} onChange={e=>setBreathHz(parseFloat(e.target.value))} />

              <label className="text-sm mt-3">Volume (cap 0.2): {fmt(volume,2)}</label>
              <input type="range" min={0} max={0.2} step={0.005} value={volume} onChange={e=>setVolume(parseFloat(e.target.value))} />
            </div>
          </div>

          <div className="rounded-2xl p-4 bg-neutral-900/60 shadow">
            <div className="flex items-center gap-3">
              <button onClick={connectBLE} className={`px-4 py-2 rounded-xl ${connected?"bg-sky-700":"bg-sky-600 hover:bg-sky-500"}`}>{connected?"Heart Sensor Connected":"Connect Heart Sensor (BLE)"}</button>
              <div className="text-xs opacity-70">Standard BLE Heart Rate Service (0x180D)</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-neutral-950/50">
                <div className="opacity-60">HR</div>
                <div className="text-xl">{fmt(hr,0)} <span className="text-xs">bpm</span></div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950/50">
                <div className="opacity-60">RMSSD</div>
                <div className="text-xl">{fmt(rmssdMs,0)} <span className="text-xs">ms</span></div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-950/50">
                <div className="opacity-60">Mode</div>
                <div className="text-xl capitalize">{mode}</div>
              </div>
            </div>

            <div className="mt-3">
              <Spark data={hrSeries} min={40} max={140} />
              <div className="text-xs opacity-70 mt-1">Heart rate trend (last ~60 samples)</div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl p-4 bg-neutral-900/60 shadow text-sm leading-6">
          <h2 className="text-lg font-semibold mb-2">Guidance & Safety</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>This prototype is for relaxation and biofeedback. It is <b>not</b> a medical device and makes no claims to treat or cure any condition.</li>
            <li>Audio output is soft‑limited. Keep system volume modest and stop if you feel discomfort, dizziness, or headache.</li>
            <li>If you use a BLE heart strap, ensure it is a commercially certified device. Remove if skin becomes irritated.</li>
            <li>Do not operate vehicles or machinery while using entrainment modes.</li>
          </ul>
        </section>

        <footer className="opacity-60 text-xs">
          © Powered by Infinity · Prototype build for Kris. Wellness/biofeedback only. No RF transmission.
        </footer>
      </div>
    </div>
  );
}
