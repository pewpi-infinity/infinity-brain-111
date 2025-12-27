import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Cpu, ActivitySquare, Waves, Gauge, Mic, Settings2, BookOpen,
  Wrench, Play, Pause, Disc3, SignalHigh, MessageSquare, Brain, Radio
} from "lucide-react";

/**
 * Infinity Radio Lab RPG + Studio (One-File React App)
 * ---------------------------------------------------
 * Goals:
 *  - Realistic radio-repair RPG (vacuum tube era) with signal tracing tasks
 *  - Built-in Docs (oscilloscope, VOM, tracer, tube pins, alignment, safety)
 *  - In-browser recording studio: step sequencer (drum machine), synth, mixer
 *  - Live oscilloscope on master bus; tone generators; mic input; FX (delay, reverb)
 *  - Rogers Autopilot (local hint engine + chat log) – no external keys required
 *  - Smooth vector-ish transitions using Framer Motion
 *  - Single-file React component; Tailwind + shadcn/ui for modern UI
 */

// ---------- Small UI Helpers ----------
const SectionTitle = ({ icon: Icon, title, right }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2 text-xl font-semibold">
      {Icon ? <Icon className="w-5 h-5" /> : null}
      <span>{title}</span>
    </div>
    <div className="flex items-center gap-2">{right}</div>
  </div>
);

const Row = ({ children, className = "" }) => (
  <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>
);

// ---------- Audio Engine ----------
function useAudioEngine() {
  const ctxRef = useRef(null as (AudioContext | null));
  const masterGainRef = useRef(null as (GainNode | null));
  const analyserRef = useRef(null as (AnalyserNode | null));
  const delayRef = useRef(null as (DelayNode | null));
  const feedbackRef = useRef(null as (GainNode | null));
  const reverbRef = useRef(null as (ConvolverNode | null));
  const reverbWetRef = useRef(null as (GainNode | null));
  const dryRef = useRef(null as (GainNode | null));
  const mixRef = useRef({ delay: 0.2, feedback: 0.3, reverb: 0.25, master: 0.8 });

  const ensure = async () => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: "interactive" });
      ctxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.value = mixRef.current.master;

      const dry = ctx.createGain();
      dry.gain.value = 1.0;
      dryRef.current = dry;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;

      const delay = ctx.createDelay(1.0);
      delay.delayTime.value = mixRef.current.delay;
      delayRef.current = delay;

      const feedback = ctx.createGain();
      feedback.gain.value = mixRef.current.feedback;
      feedbackRef.current = feedback;
      delay.connect(feedback).connect(delay); // feedback loop

      const reverb = ctx.createConvolver();
      reverbRef.current = reverb;
      reverb.buffer = makeImpulseResponse(ctx, 2.6, 2.5); // algorithmic IR

      const reverbWet = ctx.createGain();
      reverbWet.gain.value = mixRef.current.reverb;
      reverbWetRef.current = reverbWet;

      // Routing: sources -> [dry || delay || reverb] -> master -> analyser -> dest
      const merger = ctx.createGain();
      merger.gain.value = 1.0;

      merger.connect(dry);
      merger.connect(delay);
      merger.connect(reverb);

      delay.connect(reverbWet);

      const post = ctx.createGain();
      dry.connect(post);
      reverbWet.connect(post);

      post.connect(master);
      master.connect(analyser);
      analyser.connect(ctx.destination);

      masterGainRef.current = master;
      (ctx as any)._router = { merger, post };
    }
    return ctxRef.current;
  };

  const getRouter = () => (ctxRef.current as any)?._router as { merger: GainNode, post: GainNode };

  const connectSourceToBus = (node: AudioNode) => {
    const router = getRouter();
    if (router) node.connect(router.merger);
  };

  const setMix = (key: keyof typeof mixRef.current, val: number) => {
    mixRef.current[key] = val;
    if (key === "delay" && delayRef.current) delayRef.current.delayTime.value = val;
    if (key === "feedback" && feedbackRef.current) feedbackRef.current.gain.value = val;
    if (key === "reverb" && reverbWetRef.current) reverbWetRef.current.gain.value = val;
    if (key === "master" && masterGainRef.current) masterGainRef.current.gain.value = val;
  };

  return {
    ensure,
    ctxRef,
    analyserRef,
    connectSourceToBus,
    setMix,
    mixRef,
  };
}

function makeImpulseResponse(ctx: AudioContext, duration = 2.0, decay = 2.0) {
  const rate = ctx.sampleRate;
  const len = rate * duration;
  const impulse = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return impulse;
}

// ---------- Oscilloscope Canvas ----------
function Oscilloscope({ analyser, height = 160 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!analyser) return;
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx2d = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    let raf = 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      const w = canvas.width;
      const h = canvas.height;
      ctx2d!.fillStyle = "#0b1220";
      ctx2d!.fillRect(0, 0, w, h);
      ctx2d!.lineWidth = 2;
      ctx2d!.strokeStyle = "#5eead4";
      ctx2d!.beginPath();
      const slice = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0; // ~0..2
        const y = (v * h) / 2;
        if (i === 0) ctx2d!.moveTo(x, y);
        else ctx2d!.lineTo(x, y);
        x += slice;
      }
      ctx2d!.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return (
    <canvas ref={canvasRef} width={900} height={height} className="w-full rounded-xl shadow-inner border border-cyan-800/40 bg-slate-900" />
  );
}

// ---------- Drum Synth + Sequencer ----------
const STEPS = 16;
const TRACKS = [
  { key: "kick", label: "Kick" },
  { key: "snare", label: "Snare" },
  { key: "hat", label: "Hat" },
  { key: "tone", label: "Tone" },
];

function DrumMachine({ engine }) {
  const [playing, setPlaying] = useState(false);
  const [bpm, setBpm] = useState(100);
  const [seq, setSeq] = useState(() => {
    const base = {} as Record<string, boolean[]>;
    for (const t of TRACKS) base[t.key] = Array(STEPS).fill(false);
    base.kick[0] = base.kick[8] = true;
    base.snare[4] = base.snare[12] = true;
    for (let i = 2; i < STEPS; i += 4) base.hat[i] = true;
    return base;
  });
  const [currentStep, setCurrentStep] = useState(0);

  // Sound generators
  const triggerKick = (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    engine.connectSourceToBus(gain);
    osc.start();
    osc.stop(ctx.currentTime + 0.26);
  };

  const triggerSnare = (ctx) => {
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "highpass"; filter.frequency.value = 1500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.8, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    noise.connect(filter).connect(gain);
    engine.connectSourceToBus(gain);
    noise.start();
    noise.stop(ctx.currentTime + 0.21);
  };

  const triggerHat = (ctx) => {
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
    const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer;
    const filter = ctx.createBiquadFilter(); filter.type = "highpass"; filter.frequency.value = 6000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    noise.connect(filter).connect(gain);
    engine.connectSourceToBus(gain);
    noise.start(); noise.stop(ctx.currentTime + 0.051);
  };

  const triggerTone = (ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 440; // A4
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    engine.connectSourceToBus(gain);
    osc.start(); osc.stop(ctx.currentTime + 0.26);
  };

  const tickRef = useRef<number | null>(null);

  const scheduler = async () => {
    const ctx = await engine.ensure();
    const spb = 60 / bpm / 4; // 16th notes
    let step = 0;
    function loop() {
      setCurrentStep(step);
      if (seq.kick[step]) triggerKick(ctx);
      if (seq.snare[step]) triggerSnare(ctx);
      if (seq.hat[step]) triggerHat(ctx);
      if (seq.tone[step]) triggerTone(ctx);
      step = (step + 1) % STEPS;
      tickRef.current = window.setTimeout(loop, spb * 1000);
    }
    loop();
  };

  useEffect(() => {
    if (playing) scheduler();
    else if (tickRef.current) { window.clearTimeout(tickRef.current); tickRef.current = null; }
    return () => { if (tickRef.current) window.clearTimeout(tickRef.current); };
  }, [playing, bpm, seq]);

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2"><Disc3 className="w-5 h-5"/> Drum Machine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row>
          <Button onClick={() => setPlaying(p => !p)} variant="secondary" className="gap-2">
            {playing ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
            {playing ? "Stop" : "Play"}
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm uppercase tracking-wider text-slate-300">BPM</span>
            <input type="range" min={60} max={180} value={bpm} onChange={e=>setBpm(Number(e.target.value))} />
            <Badge variant="outline">{bpm}</Badge>
          </div>
        </Row>
        <div className="overflow-x-auto">
          <table className="w-full text-slate-200 select-none">
            <tbody>
              {TRACKS.map((t, rIdx) => (
                <tr key={t.key} className="hover:bg-slate-800/50">
                  <td className="pr-2 py-1 w-24 text-right text-xs uppercase text-slate-400">{t.label}</td>
                  {Array.from({ length: STEPS }).map((_, i) => {
                    const on = seq[t.key][i];
                    const isNow = i === currentStep;
                    return (
                      <td key={i}>
                        <div
                          onClick={() => setSeq(prev => ({ ...prev, [t.key]: prev[t.key].map((b, idx) => idx === i ? !b : b) }))}
                          className={`m-1 h-6 w-6 rounded-md border ${on ? "bg-cyan-400/80 border-cyan-300" : "bg-slate-800 border-slate-700"} ${isNow ? "ring-2 ring-fuchsia-400" : ""}`}
                          title={`${t.label} step ${i+1}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Synth + Tone Generators ----------
function ToneGenerators({ engine }) {
  const [freq, setFreq] = useState(440);
  const oscRef = useRef<OscillatorNode | null>(null);

  const start = async () => {
    const ctx = await engine.ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    osc.connect(gain); engine.connectSourceToBus(gain);
    osc.start();
    oscRef.current = osc;
  };
  const stop = () => { if (oscRef.current) { oscRef.current.stop(); oscRef.current.disconnect(); oscRef.current = null; } };

  useEffect(() => { if (oscRef.current) oscRef.current.frequency.value = freq; }, [freq]);

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Waves className="w-5 h-5"/> Tone Generators</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <Row>
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs uppercase text-slate-400">Freq</span>
            <input type="range" min={55} max={2000} value={freq} onChange={e=>setFreq(Number(e.target.value))} className="w-full" />
            <Badge variant="outline">{Math.round(freq)} Hz</Badge>
          </div>
          <Button variant="secondary" onClick={start}><Play className="w-4 h-4 mr-1"/>Start</Button>
          <Button variant="ghost" onClick={stop}><Pause className="w-4 h-4 mr-1"/>Stop</Button>
        </Row>
        <Row>
          <FXMixer engine={engine}/>
        </Row>
      </CardContent>
    </Card>
  )
}

function FXMixer({ engine }) {
  const [delay, setDelay] = useState(engine.mixRef.current.delay);
  const [fb, setFb] = useState(engine.mixRef.current.feedback);
  const [rev, setRev] = useState(engine.mixRef.current.reverb);
  const [master, setMaster] = useState(engine.mixRef.current.master);

  useEffect(() => { engine.setMix("delay", delay); }, [delay]);
  useEffect(() => { engine.setMix("feedback", fb); }, [fb]);
  useEffect(() => { engine.setMix("reverb", rev); }, [rev]);
  useEffect(() => { engine.setMix("master", master); }, [master]);

  const Knob = ({ label, value, set, min=0, max=1, step=0.01 }) => (
    <div className="flex flex-col items-start">
      <span className="text-xs uppercase text-slate-400 mb-1">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))} />
      <Badge variant="outline" className="mt-1">{Number(value).toFixed(2)}</Badge>
    </div>
  );

  return (
    <Card className="bg-slate-950/50 border-slate-800">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Settings2 className="w-4 h-4"/> Master FX / Levels</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Knob label="Delay" value={delay} set={setDelay} max={0.9} />
        <Knob label="Feedback" value={fb} set={setFb} max={0.95} />
        <Knob label="Reverb" value={rev} set={setRev} max={1} />
        <Knob label="Master" value={master} set={setMaster} max={1.5} />
      </CardContent>
    </Card>
  );
}

// ---------- Microphone In ----------
function MicInput({ engine }) {
  const [enabled, setEnabled] = useState(false);
  const srcRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const toggle = async () => {
    if (enabled) {
      if (srcRef.current) { srcRef.current.disconnect(); srcRef.current = null; }
      setEnabled(false);
      return;
    }
    const ctx = await engine.ensure();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const src = ctx.createMediaStreamSource(stream);
      srcRef.current = src; engine.connectSourceToBus(src);
      setEnabled(true);
    } catch (e) {
      alert("Mic permission denied or unsupported.");
    }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Mic className="w-5 h-5"/> Microphone</CardTitle></CardHeader>
      <CardContent>
        <Row>
          <Button onClick={toggle} variant={enabled?"destructive":"secondary"} className="gap-2">
            <Mic className="w-4 h-4"/> {enabled?"Disable":"Enable"}
          </Button>
          <p className="text-xs text-slate-400">Route your mic into the mixer/FX. Watch it on the scope.</p>
        </Row>
      </CardContent>
    </Card>
  );
}

// ---------- RPG: Tube Radio Repair ----------
const NODES = [
  { id: "ant", label: "Antenna", dc: 0, ac: "RF noise", good: true },
  { id: "rf", label: "RF Amp (V1)", dc: 120, ac: "RF carrier", good: true },
  { id: "mixer", label: "Mixer", dc: 110, ac: "IF 455kHz", good: true },
  { id: "if", label: "IF Amp", dc: 100, ac: "IF amplified", good: true },
  { id: "det", label: "Detector", dc: 2, ac: "Audio envelope", good: true },
  { id: "pre", label: "Audio Pre (V2)", dc: 160, ac: "Audio small", good: true },
  { id: "pwr", label: "Power Amp (V3)", dc: 250, ac: "Audio big", good: true },
  { id: "spk", label: "Speaker", dc: 0, ac: "Sound", good: true },
];

function RadioRPG({ engine, autopilot }) {
  const [nodes, setNodes] = useState(NODES);
  const [fault, setFault] = useState(null as string | null);
  const [selected, setSelected] = useState("ant");
  const [probe, setProbe] = useState<"scope"|"vm"|"tracer">("scope");
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Random fault on mount
    const candidates = ["rf","mixer","if","det","pre","pwr"];
    const f = candidates[Math.floor(Math.random()*candidates.length)];
    setFault(f);
    autopilot.push(`A fault was injected in stage: ${f}. Diagnose with tools.`);
  }, []);

  const expectedReadout = (node) => {
    const broken = node.id === fault;
    if (probe === "vm") return `${broken? (node.dc*0.1).toFixed(1) : node.dc} VDC`;
    if (probe === "scope") return broken? "Flat / low-level hash" : node.ac;
    if (probe === "tracer") return broken? "Tone disappears here" : "Tone passes";
    return "";
  };

  const injectTone = async (nodeId: string) => {
    const ctx = await engine.ensure();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 1000;
    gain.gain.value = 0.08;
    osc.connect(gain); engine.connectSourceToBus(gain);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  };

  const markDiagnosis = (id: string) => {
    if (!fault) return;
    if (id === fault) { setScore(s => s+100); autopilot.push("Correct! Fault stage identified."); }
    else { setScore(s => Math.max(0, s-10)); autopilot.push("Not quite. Keep tracing forward from a good stage."); }
  };

  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5"/> Radio Repair RPG</CardTitle>
      </CardHeader>
      <CardContent>
        <Row className="justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-400">Tool</span>
            <select className="bg-slate-800 border border-slate-700 rounded px-2 py-1" value={probe} onChange={e=>setProbe(e.target.value as any)}>
              <option value="scope">Oscilloscope</option>
              <option value="vm">Volt Meter</option>
              <option value="tracer">Signal Tracer (1kHz)</option>
            </select>
          </div>
          <Badge variant="outline">Score: {score}</Badge>
        </Row>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SectionTitle icon={Radio} title="Signal Path" />
            <div className="relative p-4 rounded-xl bg-slate-950/50 border border-slate-800">
              <div className="flex flex-col gap-3">
                {nodes.map((n, idx) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${selected===n.id?"bg-fuchsia-400":"bg-cyan-400"}`}></div>
                    <button
                      onClick={()=> setSelected(n.id)}
                      className={`text-left px-3 py-2 rounded-md border ${selected===n.id?"border-fuchsia-400 bg-fuchsia-400/10":"border-slate-700 bg-slate-800/60"}`}
                    >
                      <div className="font-semibold">{idx+1}. {n.label}</div>
                      <div className="text-xs text-slate-300">Readout: {expectedReadout(n)}</div>
                    </button>
                    <div className="ml-auto flex items-center gap-2">
                      <Button size="sm" variant="secondary" onClick={()=>injectTone(n.id)}>Probe</Button>
                      <Button size="sm" variant="ghost" onClick={()=>markDiagnosis(n.id)}>Mark Fault</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionTitle icon={ActivitySquare} title="Live Master Scope" />
            <Oscilloscope analyser={engine.analyserRef.current} height={220} />
            <div className="text-xs text-slate-400 mt-2">Use the tool selector, click a stage, and compare expected readouts. Inject tone and listen; where the tone vanishes, the fault likely sits downstream.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------- Meters Panel (simple live RMS from analyser) ----------
function MetersPanel({ engine }) {
  const [rms, setRms] = useState(0);
  useEffect(() => {
    const an = engine.analyserRef.current; if (!an) return;
    const data = new Uint8Array(an.fftSize);
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      an.getByteTimeDomainData(data);
      let acc = 0; for (let i=0;i<data.length;i++){const v=(data[i]-128)/128; acc+=v*v;}
      setRms(Math.sqrt(acc/data.length));
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [engine.analyserRef.current]);
  const pseudoVolts = (rms*5).toFixed(2);
  const pseudoAmps = (rms*0.2).toFixed(3);
  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Gauge className="w-5 h-5"/> Virtual Meters</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="text-xs text-slate-400">RMS</div>
            <div className="text-2xl font-bold">{rms.toFixed(3)}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="text-xs text-slate-400">Volt (pseudo)</div>
            <div className="text-2xl font-bold">{pseudoVolts} V</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="text-xs text-slate-400">Amp (pseudo)</div>
            <div className="text-2xl font-bold">{pseudoAmps} A</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800">
            <div className="text-xs text-slate-400">Scope FFT Size</div>
            <div className="text-2xl font-bold">2048</div>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-2">These are educational approximations from the master bus. For real gear, use proper probes, scaling, and isolation transformers.</div>
      </CardContent>
    </Card>
  );
}

// ---------- Docs ----------
const DOCS = [
  {
    id: "osc",
    title: "Oscilloscope Basics (Timebase, Volts/Div, Trigger)",
    body: `\n• Timebase sets how fast the trace sweeps; Volts/Div sets amplitude scale.\n• Trigger stabilizes repeating signals—start with rising-edge, channel 1.\n• Use AC coupling for audio/small AC riding on DC; DC coupling for measuring bias.\n• Start 1 V/div, 1 ms/div for audio. Adjust until the waveform occupies ~70% of screen.`,
  },
  {
    id: "vom",
    title: "Volt-Ohm-Milliammeter (VOM) / DMM Use",
    body: `\n• Always start on a higher range; then step down.\n• For tube circuits measure DC plate/screen voltages to chassis ground.\n• For resistance, power off and discharge caps first.\n• Expect high voltages (150–300VDC) in tube sets—one hand rule, isolation transformer recommended.`,
  },
  {
    id: "trace",
    title: "Signal Tracing Technique",
    body: `\n• Inject a clean 400 Hz–1 kHz tone at the antenna or each stage input.\n• Follow the tone downstream with scope or tracer. Where it disappears, the fault is at/just before that stage.\n• Verify B+ and bias at that stage; check coupling caps and resistors drifting high.`,
  },
  {
    id: "pins",
    title: "Tube Pin Numbering Quick Note",
    body: `\n• Viewed from bottom (solder side), pins are numbered clockwise from the locating key/gap.\n• Learn common triodes (12AX7) and pentodes (6K6/6V6) pinouts from datasheets when working real sets.`,
  },
  {
    id: "align",
    title: "455 kHz IF Alignment Overview",
    body: `\n• Use a signal generator at 455 kHz, very low level, modulated with audio.\n• Peak each IF transformer can for maximum output while keeping the generator low to avoid AGC skew.\n• Then align RF/oscillator trimmers at the high end of the dial.`,
  },
  {
    id: "safety",
    title: "Bench Safety & Isolation",
    body: `\n• Use an isolation transformer for AC/DC sets.\n• Discharge filter capacitors before touching.\n• Keep one hand in pocket when probing live B+.\n• Verify test gear grounds to avoid ground loops and shocks.`,
  },
];

function DocsPanel({ autopilot }) {
  const [active, setActive] = useState(DOCS[0].id);
  const doc = DOCS.find(d => d.id === active);
  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5"/> Docs</CardTitle></CardHeader>
      <CardContent>
        <Row className="mb-2">
          {DOCS.map(d => (
            <Button key={d.id} size="sm" variant={active===d.id?"secondary":"ghost"} onClick={()=>{ setActive(d.id); autopilot.push(`Opened: ${d.title}`); }}>{d.title}</Button>
          ))}
        </Row>
        <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800 whitespace-pre-wrap text-slate-200 text-sm leading-relaxed">
          {doc?.body}
        </div>
        <div className="text-xs text-slate-400 mt-2">These summaries are educational notes. If you have DeVry PDFs, add them as links here for quick pull-up.</div>
      </CardContent>
    </Card>
  );
}

// ---------- Rogers Autopilot (local) ----------
function useAutopilot() {
  const [log, setLog] = useState([] as { role: "system"|"user"|"assistant", text: string }[]);
  const push = (text: string, role: "assistant"|"system" = "assistant") => setLog(l => [...l, { role, text }]);
  const user = (text: string) => setLog(l => [...l, { role: "user", text }]);

  // Very small local hint engine
  const suggest = (q: string) => {
    const t = q.toLowerCase();
    if (t.includes("scope")) return "Start at 1 V/div, 1 ms/div and rising-edge trigger; move from detector backward if audio isn’t present.";
    if (t.includes("volt") || t.includes("bias")) return "Measure DC plate/screen vs chassis; no audio? verify B+ first, then coupling cap leakage.";
    if (t.includes("trace") || t.includes("tone")) return "Inject 1kHz at input and walk forward; where it dies, the previous stage likely failed.";
    if (t.includes("reverb") || t.includes("delay")) return "Shorten pre-delay, increase decay mildly, keep feedback under 0.7 to avoid runaway.";
    return "What are you working on—RPG fault or studio mix? I can point you to the right tool.";
  };

  return { log, push, user, suggest };
}

function RogersPanel({ autopilot }) {
  const [msg, setMsg] = useState("");
  const onSend = () => {
    if (!msg.trim()) return;
    autopilot.user(msg);
    const hint = autopilot.suggest(msg);
    autopilot.push(hint);
    setMsg("");
  };
  return (
    <Card className="bg-slate-900/60 border-slate-700">
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5"/> Rogers Autopilot</CardTitle></CardHeader>
      <CardContent>
        <div className="h-48 overflow-y-auto p-3 rounded-md bg-slate-950/50 border border-slate-800 space-y-2">
          {autopilot.log.map((l, i) => (
            <div key={i} className={`text-sm ${l.role==="user"?"text-cyan-200":"text-slate-200"}`}>
              <span className="text-xs uppercase tracking-wide mr-2 opacity-60">{l.role}</span>{l.text}
            </div>
          ))}
        </div>
        <Row className="mt-3">
          <Input value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Ask for a hint or mixing tip…"/>
          <Button onClick={onSend} variant="secondary" className="gap-2"><MessageSquare className="w-4 h-4"/>Send</Button>
        </Row>
        <div className="text-xs text-slate-400 mt-2">This is a local hint engine. You can wire a real LLM later by posting to your backend here.</div>
      </CardContent>
    </Card>
  );
}

// ---------- Studio Panel Wrapper ----------
function Studio({ engine }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <DrumMachine engine={engine} />
      <MicInput engine={engine} />
      <ToneGenerators engine={engine} />
      <div className="lg:col-span-2">
        <SectionTitle icon={ActivitySquare} title="Master Oscilloscope" />
        <Oscilloscope analyser={engine.analyserRef.current} height={220} />
      </div>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  const engine = useAudioEngine();
  const autopilot = useAutopilot();
  const [powered, setPowered] = useState(false);
  const [tab, setTab] = useState("rpg");

  const powerOn = async () => { await engine.ensure(); setPowered(true); autopilot.push("Audio engine online. Use Studio or RPG panels.", "system"); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 backdrop-blur bg-slate-950/70 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-300"/>
            <span className="font-bold tracking-wide">Infinity Radio Lab & Studio</span>
            <Badge variant="outline" className="ml-2">Powered by Infinity</Badge>
          </motion.div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant={powered?"secondary":"default"} onClick={powerOn} className="gap-2">
              <SignalHigh className="w-4 h-4"/>{powered?"Powered":"Power On"}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex flex-wrap gap-2 bg-slate-900/70 border border-slate-800">
            <TabsTrigger value="rpg" className="data-[state=active]:bg-cyan-900/40"><Wrench className="w-4 h-4 mr-1"/>RPG</TabsTrigger>
            <TabsTrigger value="docs" className="data-[state=active]:bg-cyan-900/40"><BookOpen className="w-4 h-4 mr-1"/>Docs</TabsTrigger>
            <TabsTrigger value="studio" className="data-[state=active]:bg-cyan-900/40"><Disc3 className="w-4 h-4 mr-1"/>Studio</TabsTrigger>
            <TabsTrigger value="meters" className="data-[state=active]:bg-cyan-900/40"><Gauge className="w-4 h-4 mr-1"/>Meters</TabsTrigger>
            <TabsTrigger value="rogers" className="data-[state=active]:bg-cyan-900/40"><Brain className="w-4 h-4 mr-1"/>Rogers</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="rpg" className="mt-4">
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <RadioRPG engine={engine} autopilot={autopilot} />
              </motion.div>
            </TabsContent>
            <TabsContent value="docs" className="mt-4">
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <DocsPanel autopilot={autopilot} />
              </motion.div>
            </TabsContent>
            <TabsContent value="studio" className="mt-4">
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <Studio engine={engine} />
              </motion.div>
            </TabsContent>
            <TabsContent value="meters" className="mt-4">
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <MetersPanel engine={engine} />
              </motion.div>
            </TabsContent>
            <TabsContent value="rogers" className="mt-4">
              <motion.div initial={{opacity:0, y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
                <RogersPanel autopilot={autopilot} />
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <footer className="mt-6 text-xs text-slate-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Infinity Lab — Educational demo (no external APIs).</span>
          <span>Tip: Power on first. Use Studio to feed scope while you diagnose the RPG fault.</span>
        </footer>
      </main>
    </div>
  );
}
