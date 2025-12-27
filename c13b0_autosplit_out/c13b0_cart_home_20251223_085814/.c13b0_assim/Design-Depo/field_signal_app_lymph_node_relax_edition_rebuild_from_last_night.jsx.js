import React, { useEffect, useRef, useState } from "react";

// Single-file React app. Uses WebAudio to generate tones (including binaural beats),
// plus a lightweight oscilloscope. Designed to match last night's layout and
// include the "Lymph Node Relax" preset without altering behavior.

export default function FieldSignalApp() {
  // Core params
  const [isOn, setIsOn] = useState(false);
  const [baseHz, setBaseHz] = useState(() => loadNum("baseHz", 174));
  const [beatHz, setBeatHz] = useState(() => loadNum("beatHz", 4));
  const [gain, setGain] = useState(() => loadNum("gain", 0.35));
  const [wave, setWave] = useState(() => loadStr("wave", "sine"));
  const [preset, setPreset] = useState(() => loadStr("preset", "Lymph Node Relax"));
  const [pan, setPan] = useState(() => loadNum("pan", 0)); // -1 left, +1 right
  const [duration, setDuration] = useState(() => loadNum("duration", 0)); // 0 = unlimited

  // Internals
  const acRef = useRef<AudioContext | null>(null);
  const gRef = useRef<GainNode | null>(null);
  const panRef = useRef<StereoPannerNode | null>(null);
  const lOscRef = useRef<OscillatorNode | null>(null);
  const rOscRef = useRef<OscillatorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stopAtRef = useRef<number | null>(null);

  // Preset definitions (non-medical, relaxation/intention tags only)
  const presets: Record<string, { base: number; beat: number; wave?: OscillatorType; pan?: number }>
    = {
      "Lymph Node Relax": { base: 174, beat: 4, wave: "sine", pan: 0 },
      "Sinus Drain": { base: 222, beat: 5, wave: "sine", pan: 0 },
      "Muscle Calm": { base: 110, beat: 8, wave: "triangle", pan: 0 },
      "Deep Focus": { base: 432, beat: 10, wave: "sawtooth", pan: 0 },
      "Sleep Aid": { base: 144, beat: 3, wave: "sine", pan: -0.1 },
    };

  // Save settings on change (for exact recall)
  useEffect(() => {
    save("baseHz", baseHz);
    save("beatHz", beatHz);
    save("gain", gain);
    save("wave", wave);
    save("preset", preset);
    save("pan", pan);
    save("duration", duration);
  }, [baseHz, beatHz, gain, wave, preset, pan, duration]);

  // Handle preset selection (do not auto-start; keep behavior stable)
  useEffect(() => {
    const p = presets[preset];
    if (!p) return;
    setBaseHz(p.base);
    setBeatHz(p.beat);
    if (p.wave) setWave(p.wave);
    if (typeof p.pan === "number") setPan(p.pan);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset]);

  // Audio graph setup/teardown
  useEffect(() => {
    if (!isOn) {
      teardown();
      return;
    }

    const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
    acRef.current = ac;

    const gainNode = ac.createGain();
    gainNode.gain.value = gain;
    gRef.current = gainNode;

    const panner = ac.createStereoPanner();
    panner.pan.value = pan;
    panRef.current = panner;

    const analyser = ac.createAnalyser();
    analyser.fftSize = 2048;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

    // Two oscillators for binaural beat (split across stereo)
    const leftFreq = Math.max(1, baseHz - beatHz / 2);
    const rightFreq = Math.max(1, baseHz + beatHz / 2);

    const lOsc = ac.createOscillator();
    lOsc.type = wave as OscillatorType;
    lOsc.frequency.value = leftFreq;
    lOscRef.current = lOsc;

    const rOsc = ac.createOscillator();
    rOsc.type = wave as OscillatorType;
    rOsc.frequency.value = rightFreq;
    rOscRef.current = rOsc;

    // Channel split: left into pan -1, right into pan +1, then overall pan
    const lGain = ac.createGain();
    const rGain = ac.createGain();
    lGain.gain.value = 1;
    rGain.gain.value = 1;

    const splitter = ac.createChannelMerger(2);

    lOsc.connect(lGain);
    rOsc.connect(rGain);

    lGain.connect(splitter, 0, 0); // left
    rGain.connect(splitter, 0, 1); // right

    splitter.connect(panner).connect(gainNode).connect(analyser).connect(ac.destination);

    lOsc.start();
    rOsc.start();

    drawOscilloscope();

    // Optional timed stop
    if (duration > 0) {
      stopAtRef.current = performance.now() + duration * 1000;
      const id = window.setInterval(() => {
        if (stopAtRef.current && performance.now() >= stopAtRef.current) {
          window.clearInterval(id);
          setIsOn(false);
        }
      }, 250);
    } else {
      stopAtRef.current = null;
    }

    return () => teardown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn]);

  // Live param updates while running
  useEffect(() => {
    if (!acRef.current) return;
    if (gRef.current) gRef.current.gain.linearRampToValueAtTime(clamp(gain, 0, 1), acRef.current.currentTime + 0.05);
    if (panRef.current) panRef.current.pan.linearRampToValueAtTime(clamp(pan, -1, 1), acRef.current.currentTime + 0.05);
    if (lOscRef.current && rOscRef.current) {
      const leftFreq = Math.max(1, baseHz - beatHz / 2);
      const rightFreq = Math.max(1, baseHz + beatHz / 2);
      lOscRef.current.frequency.exponentialRampToValueAtTime(Math.max(1, leftFreq), acRef.current.currentTime + 0.15);
      rOscRef.current.frequency.exponentialRampToValueAtTime(Math.max(1, rightFreq), acRef.current.currentTime + 0.15);
      lOscRef.current.type = wave as OscillatorType;
      rOscRef.current.type = wave as OscillatorType;
    }
  }, [baseHz, beatHz, gain, wave, pan]);

  function teardown() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    try { lOscRef.current?.stop(); } catch {}
    try { rOscRef.current?.stop(); } catch {}
    lOscRef.current?.disconnect();
    rOscRef.current?.disconnect();
    gRef.current?.disconnect();
    panRef.current?.disconnect();
    analyserRef.current?.disconnect();
    acRef.current?.close();
    lOscRef.current = null;
    rOscRef.current = null;
    gRef.current = null;
    panRef.current = null;
    analyserRef.current = null;
    acRef.current = null;
  }

  function drawOscilloscope() {
    const analyser = analyserRef.current;
    const canvas = canvasRef.current;
    const dataArray = dataArrayRef.current;
    if (!analyser || !canvas || !dataArray) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, W, H);
      // Frame
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#0ea5e9"; // Tailwind sky-500
      ctx.strokeRect(1, 1, W - 2, H - 2);

      // Wave
      ctx.lineWidth = 2;
      ctx.beginPath();
      const sliceWidth = W / dataArray.length;
      let x = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
    };
    draw();
  }

  // UI helpers
  const left = Math.max(1, baseHz - beatHz / 2).toFixed(2);
  const right = Math.max(1, baseHz + beatHz / 2).toFixed(2);

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
        <header className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Field Signal • <span className="text-sky-400">Lymph Node Relax</span></h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOn(v => !v)}
              className={`px-4 py-2 rounded-xl font-medium transition active:scale-95 ${isOn ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              aria-pressed={isOn}
            >
              {isOn ? "Stop" : "Start"}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Scope */}
          <div className="col-span-1">
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-3">
              <canvas ref={canvasRef} width={600} height={200} className="w-full h-[200px] rounded-xl" />
              <div className="mt-3 text-xs text-slate-400 flex items-center justify-between">
                <span>Left: {left} Hz • Right: {right} Hz</span>
                <span>Wave: {wave}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="col-span-1 space-y-5">
            {/* Preset */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
              <label className="text-sm text-slate-300">Preset</label>
              <select
                className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
              >
                {Object.keys(presets).map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Base Frequency */}
            <Knob
              label="Base Frequency"
              value={baseHz}
              setValue={setBaseHz}
              min={20}
              max={1200}
              step={1}
              suffix="Hz"
            />

            {/* Beat */}
            <Knob
              label="Beat Offset"
              value={beatHz}
              setValue={setBeatHz}
              min={0}
              max={40}
              step={0.1}
              suffix="Hz"
            />

            {/* Gain */}
            <Knob
              label="Intensity"
              value={gain}
              setValue={setGain}
              min={0}
              max={1}
              step={0.01}
            />

            {/* Wave & Pan */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4 grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm text-slate-300">Waveform</label>
                <select
                  className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2"
                  value={wave}
                  onChange={(e) => setWave(e.target.value as OscillatorType)}
                >
                  {(["sine","triangle","square","sawtooth"]) as OscillatorType[]).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-300">Pan</label>
                <input
                  type="range"
                  min={-1}
                  max={1}
                  step={0.01}
                  value={pan}
                  onChange={(e) => setPan(parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-400 mt-1">{pan < 0 ? "Left" : pan > 0 ? "Right" : "Center"}</div>
              </div>
            </div>

            {/* Duration */}
            <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
              <label className="text-sm text-slate-300">Session Length (0 = unlimited)</label>
              <input
                type="range"
                min={0}
                max={3600}
                step={10}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full mt-2"
              />
              <div className="text-xs text-slate-400 mt-1">{duration === 0 ? "Unlimited" : `${duration}s`}</div>
            </div>
          </div>
        </div>

        <footer className="px-5 pb-5 text-[11px] text-slate-400">
          Use with reasonable volume. Audio signals here are for relaxation and focus only, not medical treatment.
        </footer>
      </div>
    </div>
  );
}

function Knob({ label, value, setValue, min, max, step, suffix }: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm text-slate-200 font-medium">{fmt(value)}{suffix || ''}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full mt-2"
      />
    </div>
  );
}

// storage helpers
function save(key: string, val: string | number) {
  try { localStorage.setItem(`fieldsig_${key}`, String(val)); } catch {}
}
function loadNum(key: string, fallback: number) {
  try {
    const v = localStorage.getItem(`fieldsig_${key}`);
    return v == null ? fallback : Number(v);
  } catch { return fallback; }
}
function loadStr(key: string, fallback: string) {
  try {
    const v = localStorage.getItem(`fieldsig_${key}`);
    return v == null ? fallback : v;
  } catch { return fallback; }
}
function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
function fmt(v: number) { return (Math.round(v * 100) / 100).toString(); }
