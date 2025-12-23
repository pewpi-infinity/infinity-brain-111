import React, { useEffect, useRef, useState } from "react";

// === UTIL ===
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rand = (a, b) => Math.random() * (b - a) + a;

// --- ELEMENTS: Z = atomic number, need = Z ("collect one per proton") ---
const ELEMENTS = [
  { sym: "H",  name: "Hydrogen",      Z: 1,  color: "#8fd3ff" },
  { sym: "He", name: "Helium",        Z: 2,  color: "#ffd38f" },
  { sym: "Li", name: "Lithium",       Z: 3,  color: "#ff8fb7" },
  { sym: "Be", name: "Beryllium",     Z: 4,  color: "#a6ffb0" },
  { sym: "B",  name: "Boron",         Z: 5,  color: "#b0a6ff" },
  { sym: "C",  name: "Carbon",        Z: 6,  color: "#9fb2b9" },
  { sym: "N",  name: "Nitrogen",      Z: 7,  color: "#9fd3ff" },
  { sym: "O",  name: "Oxygen",        Z: 8,  color: "#8fe0a8" },
  { sym: "F",  name: "Fluorine",      Z: 9,  color: "#afffef" },
  { sym: "Ne", name: "Neon",          Z: 10, color: "#ffafef" },
  { sym: "Na", name: "Sodium",        Z: 11, color: "#ffe49a" },
  { sym: "Mg", name: "Magnesium",     Z: 12, color: "#b9ffa6" },
  { sym: "Al", name: "Aluminum",      Z: 13, color: "#d3d9e0" },
  { sym: "Si", name: "Silicon",       Z: 14, color: "#c3d1ff" },
  { sym: "P",  name: "Phosphorus",    Z: 15, color: "#ffd3c3" },
  { sym: "S",  name: "Sulfur",        Z: 16, color: "#fff08a" },
  { sym: "Cl", name: "Chlorine",      Z: 17, color: "#a0ffd0" },
  { sym: "Ar", name: "Argon",         Z: 18, color: "#a0f0ff" },
  { sym: "K",  name: "Potassium",     Z: 19, color: "#c0a0ff" },
  { sym: "Ca", name: "Calcium",       Z: 20, color: "#e0fff0" },
];
ELEMENTS.forEach(e => (e.need = e.Z));

export default function PeriodicFlight() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // STATE
  const [size, setSize] = useState({ w: 360, h: 640 });
  const [hud, setHud] = useState({ score: 0, stageIdx: 0, collected: 0 });
  const hudRef = useRef({ score: 0, stageIdx: 0, collected: 0 });
  useEffect(() => { hudRef.current = hud; }, [hud]);

  const [musicOn, setMusicOn] = useState(false);
  const musicFlag = useRef(false);
  const audioRef = useRef({ ctx: null, leadStep: 0, bassStep: 0, timers: [] });

  const inputRef = useRef({ steerX: 0, steerY: 0, thrust: 0.68, firing: false });

  const worldRef = useRef({
    t: 0,
    stars: [],
    orb: { x: 0, y: 0, vx: 0, vy: 0, r: 12, brightness: 0.8 },
    atoms: [], // incoming atoms/stars
    waves: [], // shockwaves
    drones: [], // helper drones unlocked at Carbon (Z>=6)
    beam: null, // current laser beam
    dmg: 0,
  });

  // target element (with ref for use inside the loop)
  const target = ELEMENTS[hud.stageIdx];
  const targetRef = useRef(target);
  useEffect(() => { targetRef.current = ELEMENTS[hud.stageIdx]; }, [hud.stageIdx]);

  // STARS
  function makeStars(count, w, h) {
    const s = [];
    for (let i = 0; i < count; i++) s.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5 + 0.2, s: Math.random() * 0.6 + 0.2 });
    return s;
  }

  // RESIZE
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // INIT
  useEffect(() => {
    const W = worldRef.current; const { w, h } = size;
    W.stars = makeStars(240, w, h);
    W.orb.x = w / 2; W.orb.y = h / 2;
  }, [size.w, size.h]);

  // SPAWNER — show *many different atoms* from current decade bucket (1–10, 11–20, ...)
  function spawnAtom() {
    const { w, h } = size; const W = worldRef.current;
    const tz = targetRef.current.Z;
    const decadeStart = Math.floor((tz - 1) / 10) * 10 + 1;
    const decadeEnd = Math.min(decadeStart + 9, ELEMENTS[ELEMENTS.length - 1].Z);
    const zRange = [];
    for (let z = decadeStart; z <= decadeEnd; z++) zRange.push(z);

    // Weighted pick: 60% current target, 40% random within bucket
    const pickTarget = Math.random() < 0.6;
    let elem;
    if (pickTarget) {
      elem = targetRef.current;
    } else {
      const z = zRange[Math.floor(rand(0, zRange.length))];
      elem = ELEMENTS.find(e => e.Z === z) || targetRef.current;
    }

    // spawn at edge
    const side = Math.floor(rand(0, 4));
    let x = 0, y = 0, vx = 0, vy = 0;
    const spd = rand(0.7, 1.7);
    if (side === 0) { x = rand(0, w); y = -20; vx = rand(-0.3, 0.3); vy = spd; }
    if (side === 1) { x = w + 20; y = rand(0, h); vx = -spd; vy = rand(-0.3, 0.3); }
    if (side === 2) { x = rand(0, w); y = h + 20; vx = rand(-0.3, 0.3); vy = -spd; }
    if (side === 3) { x = -20; y = rand(0, h); vx = spd; vy = rand(-0.3, 0.3); }

    const r = 10 + elem.Z * 1.0;
    W.atoms.push({ x, y, vx, vy, e: elem, r, life: 1200 });
  }

  // SHOCKWAVE
  function firePulse() {
    const W = worldRef.current; const { x, y, vx, vy } = W.orb;
    const dir = Math.atan2(vy, vx);
    const speed = Math.max(2, Math.hypot(vx, vy));
    const dx = Math.cos(dir) || 1; const dy = Math.sin(dir) || 0;
    W.waves.push({ x, y, vx: dx * speed * 0.2, vy: dy * speed * 0.2, r: 4, vr: 2.6, life: 64 });
    inputRef.current.firing = true; setTimeout(() => (inputRef.current.firing = false), 140);
  }

  // MUSIC — bigger repeating phrase (lead + bass)
  function toggleMusic(){
    const A = audioRef.current; if (!A.ctx) A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    musicFlag.current = !musicFlag.current; setMusicOn(musicFlag.current);
    // clear any old timers
    A.timers.forEach(t => clearTimeout(t)); A.timers = [];
    if (musicFlag.current) {
      const ctx = A.ctx;
      // 16‑step lead pattern + 8‑step bass for a bigger loop
      const LEAD = [0,7,12,7, 2,9,14,9, 0,5,9,5, -2,7,12,7];
      const BASS = [0,0,-5,-5, -7,-7,-12,-12];
      const base = 196; // G3-ish

      const leadTick = () => {
        if (!musicFlag.current) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        const n = LEAD[A.leadStep % LEAD.length];
        osc.type = "square"; osc.frequency.value = base * Math.pow(2, n/12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.14, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.28);
        A.leadStep++;
        A.timers.push(setTimeout(leadTick, 190));
      };
      const bassTick = () => {
        if (!musicFlag.current) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        const n = BASS[A.bassStep % BASS.length];
        osc.type = "triangle"; osc.frequency.value = base/2 * Math.pow(2, n/12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.45);
        A.bassStep++;
        A.timers.push(setTimeout(bassTick, 380));
      };
      leadTick(); bassTick();
    }
  }

  // JOYSTICK
  const joyRef = useRef({ active: false, cx: 0, cy: 0, x: 0, y: 0 });
  function onJoyStart(e){ const t = e.touches ? e.touches[0] : e; joyRef.current = { active: true, cx: t.clientX, cy: t.clientY, x: t.clientX, y: t.clientY }; e.preventDefault(); }
  function onJoyMove(e){ if (!joyRef.current.active) return; const t = e.touches ? e.touches[0] : e; joyRef.current.x = t.clientX; joyRef.current.y = t.clientY; const dx = joyRef.current.x - joyRef.current.cx; const dy = joyRef.current.y - joyRef.current.cy; const max = 60; inputRef.current.steerX = clamp(dx / max, -1, 1); inputRef.current.steerY = clamp(dy / max, -1, 1); e.preventDefault(); }
  function onJoyEnd(){ joyRef.current.active = false; inputRef.current.steerX = 0; inputRef.current.steerY = 0; }

  // COLLISION
  function collides(a, b){ const dx = a.x - b.x, dy = a.y - b.y; const rr = (a.r + b.r); return dx*dx + dy*dy <= rr*rr; }

  // MAIN LOOP
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d"); if (!ctx) return;
    let spawnTimer = 0;

    const step = () => {
      const W = worldRef.current; const { w, h } = size; W.t++;

      // physics
      const steerX = inputRef.current.steerX, steerY = inputRef.current.steerY, thrust = inputRef.current.thrust;
      const MAX_V = 7.2, ACCEL = 0.33 * thrust, FRICTION = 0.01;
      W.orb.vx += ACCEL * steerX; W.orb.vy += ACCEL * steerY;
      W.orb.vx *= (1 - FRICTION); W.orb.vy *= (1 - FRICTION);
      W.orb.vx = clamp(W.orb.vx, -MAX_V, MAX_V); W.orb.vy = clamp(W.orb.vy, -MAX_V, MAX_V);
      W.orb.x = (W.orb.x + W.orb.vx + w) % w; W.orb.y = (W.orb.y + W.orb.vy + h) % h;

      // waves
      W.waves.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 1; });
      W.waves = W.waves.filter(p => p.life > 0);

      // drones update
      if (W.drones.length) {
        for (const d of W.drones) {
          d.ang += 0.03; if (d.cd > 0) d.cd -= 1;
        }
      }
      // laser beam life
      if (W.beam) { W.beam.life -= 1; if (W.beam.life <= 0) W.beam = null; }
      W.waves = W.waves.filter(p => p.life > 0);

      // spawn
      spawnTimer--; if (spawnTimer <= 0) { spawnAtom(); const tz = targetRef.current.Z; spawnTimer = Math.max(16, 46 - tz * 0.8); }

      // atoms update
      const newAtoms = [];
      for (const a of W.atoms){
        a.x += a.vx; a.y += a.vy; a.life -= 1;
        // shockwave knockback
        for (const wv of W.waves){
          const d = Math.hypot(a.x - wv.x, a.y - wv.y);
          if (d < wv.r) { const nx = (a.x - wv.x) / (d+0.001), ny = (a.y - wv.y) / (d+0.001); a.vx += nx * 0.2; a.vy += ny * 0.2; }
        }

        if (collides({ x: W.orb.x, y: W.orb.y, r: W.orb.r || 12 }, a)){
          const tgt = targetRef.current;
          const hudC = hudRef.current;
          if (a.e.sym === tgt.sym){
            const newCollected = (hudC.collected || 0) + 1;
            const needed = tgt.need;
            W.orb.brightness = clamp(W.orb.brightness + 0.05, 0, 2);
            W.orb.r = clamp((W.orb.r || 12) + 0.35, 8, 28);
            if (newCollected >= needed){
              const nextIdx = Math.min(ELEMENTS.length - 1, hudC.stageIdx + 1);
              const newHud = { ...hudC, stageIdx: nextIdx, collected: 0, score: hudC.score + 100 };
              hudRef.current = newHud; setHud(newHud);
              // stage-up wave
              W.waves.push({ x: W.orb.x, y: W.orb.y, vx: 0, vy: 0, r: 10, vr: 4.2, life: 70, strong: true });
              // unlock first drone at Carbon (Z>=6)
              const unlockedZ = ELEMENTS[nextIdx].Z;
              if (unlockedZ >= 6 && W.drones.length < 1) {
                W.drones.push({ ang: 0, dist: 34, cd: 0 });
              }
            } else {
              const newHud = { ...hudC, collected: newCollected, score: hudC.score + 10 };
              hudRef.current = newHud; setHud(newHud);
            }
            continue; // consume atom
          } else {
            // wrong element → damage + bounce
            W.dmg = clamp(W.dmg + 0.03, 0, 1);
            a.vx *= -0.55; a.vy *= -0.55; a.x += a.vx * 2; a.y += a.vy * 2;
          }
        }

        if (a.life > 0 && a.x > -60 && a.x < w + 60 && a.y > -60 && a.y < h + 60) newAtoms.push(a);
      }
      W.atoms = newAtoms;

      // if beam active, apply hits to atoms (after movement for this frame)
      if (W.beam) {
        const b = W.beam; const hitAtoms = [];
        for (const a of W.atoms) {
          // distance from point to segment
          const A = {x: b.x1, y: b.y1}, B = {x: b.x2, y: b.y2};
          const APx = a.x - A.x, APy = a.y - A.y; const ABx = B.x - A.x, ABy = B.y - A.y;
          const ab2 = ABx*ABx + ABy*ABy; const t = clamp((APx*ABx + APy*ABy)/(ab2||1), 0, 1);
          const cx = A.x + ABx*t, cy = A.y + ABy*t; const dist2 = (a.x-cx)**2 + (a.y-cy)**2;
          if (dist2 <= (a.r+2)*(a.r+2)) hitAtoms.push(a);
        }
        if (hitAtoms.length) {
          const tgt = targetRef.current; const hudC = hudRef.current;
          for (const a of hitAtoms) {
            if (a.e.sym === tgt.sym) {
              // collect via laser
              const newCollected = (hudC.collected||0) + 1; const needed = tgt.need;
              worldRef.current.orb.brightness = clamp(worldRef.current.orb.brightness + 0.05, 0, 2);
              worldRef.current.orb.r = clamp((worldRef.current.orb.r||12)+0.35, 8, 28);
              if (newCollected >= needed) {
                const nextIdx = Math.min(ELEMENTS.length - 1, hudC.stageIdx + 1);
                const newHud = { ...hudC, stageIdx: nextIdx, collected: 0, score: hudC.score + 100 };
                hudRef.current = newHud; setHud(newHud);
                worldRef.current.waves.push({ x: worldRef.current.orb.x, y: worldRef.current.orb.y, vx: 0, vy: 0, r: 10, vr: 4.2, life: 70, strong: true });
                const unlockedZ = ELEMENTS[nextIdx].Z;
                if (unlockedZ >= 6 && worldRef.current.drones.length < 1) {
                  worldRef.current.drones.push({ ang: 0, dist: 34, cd: 0 });
                }
              } else {
                const newHud = { ...hudC, collected: newCollected, score: hudC.score + 10 };
                hudRef.current = newHud; setHud(newHud);
              }
              // remove atom
              worldRef.current.atoms = worldRef.current.atoms.filter(x => x !== a);
            } else {
              // non-target hit: knockback
              const dirx = Math.cos(Math.atan2(a.y - b.y1, a.x - b.x1));
              const diry = Math.sin(Math.atan2(a.y - b.y1, a.x - b.x1));
              a.vx += dirx * 0.6; a.vy += diry * 0.6;
            }
          }
        }
      }

      // HUD update (trigger re-render)
      setHud(h => ({ ...h }));

      // RENDER
      ctx.clearRect(0, 0, w, h);
      // bg
      const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#02060d"); g.addColorStop(1, "#0a0f1f"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // stars
      ctx.save(); const parx = -worldRef.current.orb.vx * 0.8, pary = -worldRef.current.orb.vy * 0.8;
      worldRef.current.stars.forEach(s => { s.x = (s.x + parx * s.s + w) % w; s.y = (s.y + pary * s.s + h) % h; ctx.globalAlpha = 0.35 + s.s * 0.65; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fillStyle = "white"; ctx.fill(); });
      ctx.restore();

      // atoms
      for (const a of worldRef.current.atoms){
        const gradA = ctx.createRadialGradient(a.x - 3, a.y - 3, 2, a.x, a.y, a.r);
        gradA.addColorStop(0, "#ffffff"); gradA.addColorStop(1, a.e.color);
        ctx.fillStyle = gradA; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI*2); ctx.fill();
        // simple orbital dots
        ctx.save(); ctx.translate(a.x, a.y); ctx.globalAlpha = 0.8;
        const dots = Math.min(6, a.e.Z);
        for (let i=0;i<dots;i++){
          const ang = (i/dots)*Math.PI*2 + (worldRef.current.t*0.02*(i%2?1:-1));
          const rr = a.r + 4 + (i%2?3:-1);
          ctx.beginPath(); ctx.arc(Math.cos(ang)*rr, Math.sin(ang)*rr, 1.8, 0, Math.PI*2);
          ctx.fillStyle = i%2?"#dff3ff":"#ffe2d0"; ctx.fill();
        }
        ctx.restore();
        ctx.font = "11px monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#ffffff";
        ctx.fillText(a.e.sym, a.x, a.y + 3);
      }

      // player orb
      ctx.save(); ctx.translate(worldRef.current.orb.x, worldRef.current.orb.y);
      const glow = 10 + worldRef.current.orb.brightness * 6; const gradO = ctx.createRadialGradient(0, 0, 2, 0, 0, glow + 8);
      gradO.addColorStop(0, "rgba(180,220,255,0.95)"); gradO.addColorStop(0.5, "rgba(120,160,255,0.35)"); gradO.addColorStop(1, "rgba(40,70,140,0.06)");
      ctx.fillStyle = gradO; ctx.beginPath(); ctx.arc(0, 0, glow, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI*2); ctx.fillStyle = "#dff3ff"; ctx.fill();
      ctx.restore();

      // drones render
      if (worldRef.current.drones.length) {
        const Ww = worldRef.current; const o = Ww.orb;
        for (const d of Ww.drones) {
          const dx = Math.cos(d.ang) * d.dist; const dy = Math.sin(d.ang) * d.dist;
          const x = o.x + dx, y = o.y + dy;
          // drone body
          ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI*2); ctx.fillStyle = "#9ad7ff"; ctx.fill();
          // tether
          ctx.globalAlpha = 0.3; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(x, y); ctx.strokeStyle = "#7fb8ff"; ctx.lineWidth = 1; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }

      // beam render
      if (worldRef.current.beam) {
        const b = worldRef.current.beam; ctx.save();
        ctx.globalAlpha = 0.9; ctx.strokeStyle = "#aee3ff"; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        ctx.globalAlpha = 0.35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        ctx.restore();
      }

      // waves
      worldRef.current.waves.forEach(p => { const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r); grd.addColorStop(0, "rgba(255,255,255,0.85)"); grd.addColorStop(1, p.strong?"rgba(80,170,255,0.18)":"rgba(50,150,255,0.08)"); ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill(); });

      // damage vignette
      if (worldRef.current.dmg > 0){ ctx.save(); ctx.globalAlpha = clamp(worldRef.current.dmg * 0.6, 0, 0.5); ctx.fillStyle = "#8b1e1e"; ctx.fillRect(0,0,w,h); ctx.restore(); worldRef.current.dmg *= 0.995; }

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, hud.stageIdx]);

  // UI
  function onThrottleChange(e){ inputRef.current.thrust = Number(e.target.value); }

  // Bucket switchers (use current target ref)
  function prevBucket(){
    const curZ = targetRef.current.Z;
    const newZ = Math.max(1, Math.floor((curZ - 1) / 10) * 10 - 9); // previous decade start
    const idx = ELEMENTS.findIndex(e => e.Z === newZ);
    if (idx >= 0) {
      const newHud = { ...hudRef.current, stageIdx: idx, collected: 0 };
      hudRef.current = newHud; setHud(newHud);
    }
  }
  function nextBucket(){
    const curZ = targetRef.current.Z;
    const newZ = Math.min(ELEMENTS[ELEMENTS.length-1].Z, Math.floor((curZ - 1) / 10) * 10 + 11); // next decade start
    const idx = ELEMENTS.findIndex(e => e.Z === newZ);
    if (idx >= 0) {
      const newHud = { ...hudRef.current, stageIdx: idx, collected: 0 };
      hudRef.current = newHud; setHud(newHud);
    }
  }

  // derive bucket for HUD from current target ref (avoids staleness)
  const curZ = targetRef.current.Z;
  const decadeStart = Math.floor((curZ - 1) / 10) * 10 + 1;
  const decadeEnd = Math.min(decadeStart + 9, ELEMENTS[ELEMENTS.length - 1].Z);

  // === Drone Laser (auto-aim at nearest target) ===
  function fireDroneLaser(){
    const W = worldRef.current; if (!W.drones.length) return;
    const d = W.drones[0]; if (d.cd > 0) return; d.cd = 20; // cooldown frames
    // find nearest target atom matching current stage
    const tgt = targetRef.current;
    let nearest = null, nd2 = Infinity;
    for (const a of W.atoms){ if (a.e.sym !== tgt.sym) continue; const dx = a.x - W.orb.x, dy = a.y - W.orb.y; const d2 = dx*dx + dy*dy; if (d2 < nd2){ nd2 = d2; nearest = a; } }
    if (!nearest){
      // no target → fire short beam forward
      const ang = d.ang; const x1 = W.orb.x + Math.cos(ang)*d.dist; const y1 = W.orb.y + Math.sin(ang)*d.dist;
      const x2 = x1 + Math.cos(ang)*120; const y2 = y1 + Math.sin(ang)*120;
      W.beam = { x1, y1, x2, y2, life: 6 };
      return;
    }
    // aim from drone toward target
    const x1 = W.orb.x + Math.cos(d.ang)*d.dist; const y1 = W.orb.y + Math.sin(d.ang)*d.dist;
    const ang = Math.atan2(nearest.y - y1, nearest.x - x1);
    const reach = Math.min(260, Math.hypot(nearest.x - x1, nearest.y - y1) + 6);
    const x2 = x1 + Math.cos(ang)*reach; const y2 = y1 + Math.sin(ang)*reach;
    W.beam = { x1, y1, x2, y2, life: 6 };
  }

  return (
    <div className="w-full h-full bg-black text-white select-none overflow-hidden">
      <canvas ref={canvasRef} width={size.w} height={size.h} className="fixed inset-0" />

      {/* HUD */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-xs md:text-sm">
        <div className="backdrop-blur-sm bg-white/5 rounded-xl px-3 py-2 shadow">
          <div className="font-semibold tracking-wide">PERIODIC FLIGHT</div>
          <div className="opacity-80">Score: <span className="font-mono">{hud.score}</span></div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-xl px-3 py-2 shadow grid grid-cols-4 gap-4">
          <div>
            <div className="opacity-70">Stage</div>
            <div className="font-mono">{targetRef.current.sym} ({targetRef.current.Z})</div>
          </div>
          <div>
            <div className="opacity-70">Need</div>
            <div className="font-mono">{Math.max(0, targetRef.current.need - hud.collected)}</div>
          </div>
          <div>
            <div className="opacity-70">Bucket</div>
            <div className="font-mono">{decadeStart}-{decadeEnd}</div>
          </div>
          <div>
            <div className="opacity-70">Thrust</div>
            <div className="font-mono">{Math.round(inputRef.current.thrust*100)}%</div>
          </div>
        </div>
      </div>

      {/* Right controls */}
      <div className="absolute right-3 bottom-24 flex flex-col items-end gap-3">
        <div className="backdrop-blur bg-white/5 rounded-2xl p-3 w-44">
          <label className="block text-xs opacity-80 mb-1">Throttle</label>
          <input type="range" min={0} max={1} step={0.01} defaultValue={0.68} onChange={onThrottleChange} className="w-full" />
        </div>
        <button onClick={firePulse} className={`rounded-full px-5 py-3 shadow-lg text-sm font-semibold transition ${inputRef.current.firing?"bg-blue-400":"bg-blue-600 hover:bg-blue-500"}`}>Pulse</button>
        <div className="flex gap-2">
          <button onClick={prevBucket} className="rounded-xl px-3 py-2 bg-slate-700 hover:bg-slate-600 text-xs shadow">◀ 1–10</button>
          <button onClick={toggleMusic} className={`rounded-xl px-4 py-2 ${musicOn?"bg-rose-600":"bg-rose-700 hover:bg-rose-600"} text-sm shadow`}>{musicOn?"Music: On":"Music: Off"}</button>
          <button onClick={fireDroneLaser} className="rounded-xl px-3 py-2 bg-cyan-700 hover:bg-cyan-600 text-xs shadow">Laser</button>
          <button onClick={nextBucket} className="rounded-xl px-3 py-2 bg-slate-700 hover:bg-slate-600 text-xs shadow">11–20 ▶</button>
        </div>
      </div>

      {/* Left joystick */}
      <div className="absolute left-3 bottom-6">
        <div onMouseDown={onJoyStart} onMouseMove={onJoyMove} onMouseUp={onJoyEnd} onMouseLeave={onJoyEnd} onTouchStart={onJoyStart} onTouchMove={onJoyMove} onTouchEnd={onJoyEnd} className="relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
          <div className="absolute inset-1 rounded-full border border-white/10" />
          <Knob joyRef={joyRef} />
          <div className="absolute -top-6 left-0 right-0 text-center text-xs opacity-80">Steer</div>
        </div>
      </div>

      {/* Tips */}
      <div className="absolute bottom-2 left-2 right-2 text-center text-[11px] opacity-70">
        Weave through the bucket’s atoms ({decadeStart}–{decadeEnd}). Collect ONLY the current stage ({targetRef.current.sym}) — need = atomic number. Drag the stick to steer, adjust Throttle, tap Pulse to clear space. Wrong atoms cause damage.
      </div>
    </div>
  );
}

function Knob({ joyRef }){
  const [, force] = useState(0);
  useEffect(() => { const id = setInterval(() => force(x => x+1), 50); return () => clearInterval(id); }, []);
  const jr = joyRef.current; let dx = 0, dy = 0; if (jr.active){ dx = clamp(jr.x - jr.cx, -60, 60); dy = clamp(jr.y - jr.cy, -60, 60); }
  return <div className="absolute left-1/2 top-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-white/40 shadow-inner" style={{ transform: `translate(${dx}px, ${dy}px)` }} />;
}
