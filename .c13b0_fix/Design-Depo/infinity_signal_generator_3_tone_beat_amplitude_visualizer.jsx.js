import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";

// ===== Infinity Signal Generator (no external UI libs) =====
// 3 tones with: Frequency modes (Chord / Single / Two), Beat speeds (1x/2x/4x),
// Amplitude modes (Flat / Pulse / Ramp), per‑tone waveform scopes, and a master scope.
// "Heaviness" adds subtle saturation + low‑pass + compression.
// Built with plain HTML controls to avoid dependency errors.

function WaveCanvas({ analyser, strokeWidth = 2 }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    let raf;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas || !analyser) { raf = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext("2d");
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      const values = analyser.getValue();
      const len = values.length, mid = h/2;
      for (let i=0;i<len;i++){
        const x = (i/(len-1))*w;
        const y = mid + values[i]*(h/2-4);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, strokeWidth]);
  return <canvas ref={canvasRef} width={640} height={140} style={{width:"100%",height:140,border:"1px solid #e5e7eb",borderRadius:8}}/>;
}

function Toggle({ name, value, setValue, options }){
  return (
    <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
      {options.map(o => (
        <label key={o.value} style={{display:"inline-flex",alignItems:"center",gap:6,background:value===o.value?"#0ea5e9":"#f1f5f9",color:value===o.value?"white":"#0f172a",padding:"6px 10px",borderRadius:8,cursor:"pointer"}}>
          <input type="radio" name={name} value={o.value} checked={value===o.value} onChange={()=>setValue(o.value)} style={{display:"none"}}/>
          {o.label}
        </label>
      ))}
    </div>
  );
}

export default function InfinitySignalGenerator(){
  // ===== UI State =====
  const [powered, setPowered] = useState(false);
  const [frequencyMode, setFrequencyMode] = useState("chord"); // chord | single | two
  const [beatMode, setBeatMode] = useState("x1"); // x1 | x2 | x4
  const [ampMode, setAmpMode] = useState("flat"); // flat | pulse | ramp
  const [heaviness, setHeaviness] = useState(0.2); // 0..1
  const [bpm, setBpm] = useState(90);
  const [baseFreq, setBaseFreq] = useState(220);
  const [freqs, setFreqs] = useState([220, 275, 330]);
  const [amps, setAmps] = useState([0.6, 0.5, 0.5]);
  const [waves, setWaves] = useState(["sine","sine","sine"]);
  const [mutes, setMutes] = useState([false,false,false]);

  // ===== Audio Graph =====
  const nodes = useMemo(() => {
    // Master chain
    const analyserMix = new Tone.Analyser("waveform", 1024);
    const drive = new Tone.Distortion(0); // set by heaviness
    const filter = new Tone.Filter(200, "lowpass");
    const comp = new Tone.Compressor(-10, 3);
    drive.connect(filter); filter.connect(comp); comp.connect(analyserMix); analyserMix.connect(Tone.Destination);

    // Per‑tone chain + modulators
    const toneNodes = [0,1,2].map(() => {
      const osc = new Tone.Oscillator(220, "sine");
      const gain = new Tone.Gain(0);
      const analyser = new Tone.Analyser("waveform", 1024);

      // Mod path: userLevel * lfo -> gain.gain
      const userLevel = new Tone.Signal(0); // 0..1
      const lfo = new Tone.LFO({ frequency: 1, min: 1, max: 1, type: "sine" }); // default flat
      lfo.start();
      const mult = new Tone.Multiply();
      userLevel.connect(mult, 0, 0);
      lfo.connect(mult, 0, 1);
      mult.connect(gain.gain);

      osc.connect(gain);
      gain.connect(analyser);
      gain.connect(drive);
      return { osc, gain, analyser, userLevel, lfo };
    });

    return { analyserMix, drive, filter, comp, toneNodes };
  }, []);

  // Power
  const togglePower = async () => {
    if (!powered) {
      await Tone.start();
      nodes.toneNodes.forEach(({osc}) => osc.start());
      setPowered(true);
    } else {
      nodes.toneNodes.forEach(({osc}) => osc.stop());
      setPowered(false);
    }
  };

  // Heaviness -> saturation + darker filter
  useEffect(() => {
    nodes.drive.set({ distortion: Math.min(0.8, heaviness * 0.6) });
    nodes.filter.set({ frequency: 200 + (1 - heaviness) * 4000, Q: 0.8 });
  }, [heaviness, nodes]);

  // Frequency layout by mode
  useEffect(() => {
    let next;
    if (frequencyMode === "single") next = [baseFreq, baseFreq, baseFreq];
    else if (frequencyMode === "two") next = [baseFreq, baseFreq*1.5, baseFreq];
    else next = [baseFreq, baseFreq * Math.pow(2, 4/12), baseFreq * Math.pow(2, 7/12)]; // major triad
    setFreqs(next);
  }, [frequencyMode, baseFreq]);

  // Apply per‑tone params
  useEffect(() => { nodes.toneNodes.forEach(({osc}, i)=> osc.frequency.rampTo(freqs[i], 0.05)); }, [freqs, nodes]);
  useEffect(() => { nodes.toneNodes.forEach(({osc}, i)=> (osc.type = waves[i])); }, [waves, nodes]);
  useEffect(() => { nodes.toneNodes.forEach(({userLevel}, i)=> userLevel.rampTo(mutes[i]?0:amps[i], 0.03)); }, [amps, mutes, nodes]);

  // Beat mapping
  const beatRate = beatMode === "x2" ? 2 : beatMode === "x4" ? 4 : 1;
  useEffect(() => {
    const baseHz = (bpm/60) * 0.5 * beatRate; // one pulse every 2 quarter‑notes * multiplier
    nodes.toneNodes.forEach(({lfo}, i) => {
      lfo.frequency.rampTo(baseHz * (i+1), 0.05);
      if (ampMode === "flat") { lfo.min = 1; lfo.max = 1; lfo.type = "sine"; }
      else if (ampMode === "pulse") { lfo.min = 0.15 + 0.1*i; lfo.max = 1; lfo.type = "sine"; }
      else { lfo.min = 0; lfo.max = 1; lfo.type = "sawtooth"; }
    });
  }, [ampMode, beatRate, bpm, nodes]);

  // Cleanup on unmount
  useEffect(() => () => { try { nodes.toneNodes.forEach(({osc}) => osc.stop()); } catch {} }, [nodes]);

  // ===== UI Helpers =====
  const toneRows = [0,1,2].map(i => (
    <div key={i} style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,background:"white"}}>
      <div style={{display:"grid",gridTemplateColumns:"140px 1fr",gap:12,alignItems:"center"}}>
        <div>Frequency (Hz)</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="range" min={40} max={2000} step={1} value={freqs[i]} onChange={e=>{
            const v=Number(e.target.value); setFreqs(arr=>{const n=[...arr]; n[i]=v; return n;});
          }} style={{width:"100%"}}/>
          <div style={{width:60,textAlign:"right"}}>{Math.round(freqs[i])}</div>
        </div>
        <div>Amplitude</div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="range" min={0} max={1} step={0.01} value={amps[i]} onChange={e=>{
            const v=Number(e.target.value); setAmps(arr=>{const n=[...arr]; n[i]=v; return n;});
          }} style={{width:"100%"}}/>
          <div style={{width:60,textAlign:"right"}}>{amps[i].toFixed(2)}</div>
        </div>
        <div>Wave</div>
        <div>
          <select value={waves[i]} onChange={e=>{
            const v=e.target.value; setWaves(arr=>{const n=[...arr]; n[i]=v; return n;});
          }}>
            <option value="sine">Sine</option>
            <option value="square">Square</option>
            <option value="sawtooth">Saw</option>
            <option value="triangle">Triangle</option>
          </select>
          <label style={{marginLeft:12}}>
            <input type="checkbox" checked={mutes[i]} onChange={e=>{
              const v=e.target.checked; setMutes(arr=>{const n=[...arr]; n[i]=v; return n;});
            }} /> Mute
          </label>
        </div>
      </div>
      <div style={{marginTop:10}}>
        <WaveCanvas analyser={nodes.toneNodes[i].analyser} />
      </div>
    </div>
  ));

  return (
    <div style={{minHeight:"100vh",padding:16,background:"linear-gradient(#f8fafc,#eef2f7)"}}>
      <div style={{maxWidth:1000,margin:"0 auto",display:"grid",gap:16}}>
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h1 style={{fontSize:24,margin:0}}>Infinity Signal Generator</h1>
          <button onClick={togglePower} style={{padding:"8px 14px",borderRadius:12,border:"1px solid #cbd5e1",background: powered?"#ef4444":"#10b981", color:"white"}}>
            {powered?"Stop":"Start"}
          </button>
        </div>

        {/* Global Controls */}
        <div style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,background:"white"}}>
          <h2 style={{fontSize:16,margin:"0 0 10px"}}>Global Controls</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:16}}>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Frequency Mode</div>
              <Toggle name="freqMode" value={frequencyMode} setValue={setFrequencyMode} options={[
                {value:"chord",label:"Chord"},
                {value:"single",label:"Single"},
                {value:"two",label:"2 tones"},
              ]}/>
            </div>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Beat Speed</div>
              <Toggle name="beatMode" value={beatMode} setValue={setBeatMode} options={[
                {value:"x1",label:"1×"},
                {value:"x2",label:"2×"},
                {value:"x4",label:"4×"},
              ]}/>
            </div>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Amplitude Mode</div>
              <Toggle name="ampMode" value={ampMode} setValue={setAmpMode} options={[
                {value:"flat",label:"Flat"},
                {value:"pulse",label:"Pulse"},
                {value:"ramp",label:"Ramp"},
              ]}/>
            </div>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Heaviness</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="range" min={0} max={1} step={0.01} value={heaviness} onChange={e=>setHeaviness(Number(e.target.value))} style={{width:"100%"}}/>
                <div style={{width:36,textAlign:"right"}}>{heaviness.toFixed(2)}</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Root / Base Frequency</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="range" min={40} max={1000} step={1} value={baseFreq} onChange={e=>setBaseFreq(Number(e.target.value))} style={{width:"100%"}}/>
                <div style={{width:70,textAlign:"right"}}>{Math.round(baseFreq)} Hz</div>
              </div>
            </div>
            <div>
              <div style={{fontSize:12,marginBottom:6,color:"#475569"}}>Tempo</div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <input type="range" min={40} max={200} step={1} value={bpm} onChange={e=>setBpm(Number(e.target.value))} style={{width:"100%"}}/>
                <div style={{width:50,textAlign:"right"}}>{Math.round(bpm)} BPM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tone Strips */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(1,minmax(0,1fr))",gap:12}}>
          {toneRows}
        </div>

        {/* Master Scope */}
        <div style={{border:"1px solid #e5e7eb",borderRadius:12,padding:12,background:"white"}}>
          <div style={{fontSize:14,marginBottom:8}}>Master Mix</div>
          <WaveCanvas analyser={nodes.analyserMix} strokeWidth={3}/>
        </div>

        <div style={{fontSize:12,color:"#64748b"}}>
          Tip: Tap <b>Start</b> to enable audio on mobile. Choose Frequency Mode (Chord / Single / 2 tones), Beat (1×/2×/4×), and Amplitude (Flat / Pulse / Ramp). Adjust each tone’s freq, amplitude, wave, and mute. Heaviness adds weight.
        </div>
      </div>
    </div>
  );
}
