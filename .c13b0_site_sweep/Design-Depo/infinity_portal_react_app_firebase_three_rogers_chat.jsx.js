import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
// Firebase (modular SDK)
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';

// ————————————————————————————————————————————————
// Global Config (provided by host page via <script>)
// If not provided, sane fallbacks will keep UI running in "local-only" mode
// ————————————————————————————————————————————————
const appId = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
const firebaseConfig = typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : null;
const initialAuthToken = typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;

// Firestore collection path (no leading slash; valid collection/doc/collection/...)
const CHAT_COLLECTION_PATH = `artifacts/${appId}/public/data/chat_history`;

// ————————————————————————————————————————————————
// Firebase bootstrap
// ————————————————————————————————————————————————
let db = null;
let auth = null;

const setupFirebase = async () => {
  if (!firebaseConfig) {
    console.warn('[Firebase] No config provided. Chat features disabled; UI will run in local-only mode.');
    return { db: null, auth: null, userId: `local-${crypto.randomUUID().slice(0, 8)}` };
  }
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
    } else {
      await signInAnonymously(auth);
    }
    const userId = auth.currentUser?.uid || crypto.randomUUID();
    console.log('[Firebase] Ready. userId =', userId);
    return { db, auth, userId };
  } catch (err) {
    console.error('[Firebase] Init/Auth failed:', err);
    return { db: null, auth: null, userId: `local-${crypto.randomUUID().slice(0, 8)}` };
  }
};

// ————————————————————————————————————————————————
// Audio helpers (kept lightweight; browser SpeechSynthesis fallback)
// ————————————————————————————————————————————————
const speakLocal = (text) => {
  if (!text) return;
  try {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  } catch (e) {
    console.warn('Speech synthesis not available:', e);
  }
};

// ————————————————————————————————————————————————
// THREE helpers
// ————————————————————————————————————————————————
const EINSTEIN_COLOR = 0x00d0ff;
const PRIMARY_COLOR = 0x0a0b3f; // Deep blue-black
const ACCENT_COLOR = 0xff5733;

const createEinsteinHead = () => {
  const group = new THREE.Group();
  const headGeometry = new THREE.DodecahedronGeometry(0.5, 0);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: EINSTEIN_COLOR,
    flatShading: true,
    metalness: 0.8,
    roughness: 0.1,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.name = 'EinsteinHead';
  group.add(head);

  const ringGeometry = new THREE.TorusGeometry(0.8, 0.05, 16, 100);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x8a2be2 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  return group;
};

const clearDeltaIndicator = (scene) => {
  if (!scene) return;
  const kill = [];
  scene.traverse((obj) => {
    if (obj.name && obj.name.startsWith('DeltaIndicator_')) kill.push(obj);
  });
  kill.forEach((obj) => {
    if (obj.parent) obj.parent.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose?.();
  });
};

const drawDeltaIndicator = (scene, [x, y, z]) => {
  if (!scene) return;
  clearDeltaIndicator(scene);
  const pos = new THREE.Vector3(x * 5, y * 5, z * 5);

  const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
  const sphereMat = new THREE.MeshBasicMaterial({ color: ACCENT_COLOR });
  const target = new THREE.Mesh(sphereGeo, sphereMat);
  target.position.copy(pos);
  target.name = 'DeltaIndicator_Target';
  scene.add(target);

  const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), pos]);
  const lineMat = new THREE.LineBasicMaterial({ color: ACCENT_COLOR });
  const line = new THREE.Line(lineGeo, lineMat);
  line.name = 'DeltaIndicator_Vector';
  scene.add(line);
};

// ————————————————————————————————————————————————
// App registry (menu)
// ————————————————————————————————————————————————
const AppMap = {
  Welcome: { title: 'Hydrogen Portal Theory', description: 'Core philosophy & structure.', icon: 'Home' },
  'Rogers AI': { title: 'Rogers AI Chat Console', description: 'Temporal alignment & Delta logic.', icon: 'Chat' },
  'Zoom Portal': { title: 'Einstein 3D Zoom Portal', description: 'Multi‑vector indicator.', icon: 'Torus' },
  'Hydrogen Number': { title: 'Unique Hydrogen Number', description: 'Your persistent I‑Wireless ID.', icon: 'Phone' },
  'Pi Singer': { title: 'Pi Singer (Local TTS)', description: 'Speak text using browser voice.', icon: 'Mic' },
  Oscilloscope: { title: 'BCI Neural Monitor', description: 'Raw signal visualization.', icon: 'Activity' },
  '---': { title: '—', description: '—', icon: '—' },
  'AI Builder': { title: "AI Builder's Steering Wheel", description: 'Develop custom apps.', icon: 'Code' },
  'Locals Chat': { title: 'Locals Chat Global', description: 'Zip code community.', icon: 'Map' },
  'Game Generator': { title: 'Video Game Generator', description: 'AI‑assisted game creation.', icon: 'Gamepad' },
  'Life Milestones': { title: 'Life Milestones', description: 'Track progress life‑long.', icon: 'Users' },
  'Therapy/Exercise': { title: 'Physical Therapy', description: 'Personalized movement plans.', icon: 'Heart' },
  Calculators: { title: 'Calculator Suite', description: 'Basic/Scientific/Financial.', icon: 'Calculator' },
  'Clothing Design': { title: 'Clothing Studio', description: 'Design clothing & materials.', icon: 'Shirt' },
  'Trade Platform': { title: 'Food/Textiles/Trade', description: 'Networking & barter.', icon: 'Layers' },
  'Leather Craft': { title: 'Leather Craft', description: 'Modeling & resources.', icon: 'Tool' },
  Marketplace: { title: 'Token Marketplace', description: 'Token‑only, USD‑free.', icon: 'DollarSign' },
  'Bible Verse App': { title: 'Infinity Bible', description: 'Time‑based verse selection.', icon: 'BookOpen' },
  'Pet/Gardening': { title: 'Pets & Garden', description: 'Schedules & swaps.', icon: 'PawPrint' },
  'Channel Generator': { title: 'Channel Generator', description: 'Merit programming.', icon: 'Tv' },
  'Fact Checker': { title: 'Corrupt Fact Checker', description: 'Expose banned facts.', icon: 'AlertTriangle' },
};

// Minimal icon renderer (lucide-like)
const Icon = ({ name, className = 'icon' }) => {
  const path = {
    Chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
    Torus: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 0v20',
    Mic: 'M12 2a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2',
    Activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
    Code: 'M16 18l-6-6 6-6',
    Map: 'M21 10c0 5-9 13-9 13s-9-8-9-13a9 9 0 0 1 18 0z',
    Gamepad: 'M6 10h4M14 10h4M10 6v4M10 14v4M12 2a10 10 0 1 0 0 20',
    Users: 'M16 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8',
    Heart: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67 10.94 4.61a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78',
    Calculator: '',
    Shirt: 'M20 7H4L2 14v7h20v-7l-2-7z',
    Layers: 'M12 19 2 12l10-7 10 7-10 7z',
    Tool: 'M14.7 10.3l-1.4 1.4L11 9.9l1.4-1.4zM18 6 14 2 6 10l4 4z',
    DollarSign: 'M12 1v22M17 5H7M17 19H7',
    BookOpen: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
    PawPrint: 'M10 20l2 2 2-2M12 18V6M6 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4M18 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4',
    Tv: 'M2 7h20v15H2a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2zM17 2l-5 5-5-5',
    AlertTriangle: 'M10.29 3.86 1.82 18A2 2 0 0 0 3.53 21h16.94A2 2 0 0 0 22.18 18L13.71 3.86a2 2 0 0 0-3.42 0z',
    Home: 'M3 9 12 2l9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    Phone: 'M22 16.92v3A2 2 0 0 1 19.82 22 19.79 19.79 0 0 1 11.19 18.93a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.11 4.3 2 2 0 0 1 4.08 2.02h3A2 2 0 0 1 9.08 3.75v5.33a2 2 0 0 1-.4 1.25L6.23 12.78a13.3 13.3 0 0 0 6 6l2.45-2.45a2 2 0 0 1 1.25-.4h5.33A2 2 0 0 1 22 16.92z',
  }[name];
  if (!path) return null;
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
};

// Infinity flow glyph
const InfinityFlowSymbol = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 10a8 8 0 1 0-16 0"/>
    <path d="M6 10c0-2.21 1.79-4 4-4h4a4 4 0 1 1 0 8h-4a4 4 0 0 1-4-4z"/>
    <path d="M21 16c-3.866 0-7-3.134-7-7"/>
    <path d="M18 10l-2 2 2 2"/>
  </svg>
);

// ————————————————————————————————————————————————
// Main App
// ————————————————————————————————————————————————
export default function App() {
  const mountRef = useRef(null);
  const [activeView, setActiveView] = useState('Welcome');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [deltaIndicator, setDeltaIndicator] = useState([0, 0, 0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [bciData, setBciData] = useState(Array(256).fill(0).map(() => Math.random() * 2 - 1));

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const einsteinRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // ——— Firebase init
  useEffect(() => {
    (async () => {
      const { userId: id } = await setupFirebase();
      setUserId(id);
      setIsFirebaseReady(!!db && !!auth);
    })();
  }, []);

  // ——— Live Firestore chat listener
  useEffect(() => {
    if (!db || !userId) return;
    const q = query(collection(db, CHAT_COLLECTION_PATH), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const rows = [];
        snapshot.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        setChatHistory(rows);
      },
      (err) => {
        console.error('Firestore listener failed:', err);
        setErrorMsg('Failed to load chat history.');
      }
    );
    return () => unsub();
  }, [userId, isFirebaseReady]);

  // ——— Mock BCI stream
  useEffect(() => {
    const t = setInterval(() => {
      setBciData((prev) => {
        const next = prev.slice(1);
        const last = prev[prev.length - 1];
        const val = Math.min(1, Math.max(-1, last + (Math.random() - 0.5) * 0.1));
        next.push(val);
        return next;
      });
    }, 50);
    return () => clearInterval(t);
  }, []);

  // ——— THREE scene
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PRIMARY_COLOR);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 2.5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const point = new THREE.PointLight(0xffffff, 1.0);
    point.position.set(5, 5, 5);
    scene.add(point);

    const ein = createEinsteinHead();
    ein.rotation.y = Math.PI * 0.5;
    scene.add(ein);
    einsteinRef.current = ein;

    drawDeltaIndicator(scene, deltaIndicator);

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clockRef.current.getDelta();
      if (einsteinRef.current) {
        einsteinRef.current.rotation.y += 0.5 * delta;
        einsteinRef.current.rotation.x = Math.sin(clockRef.current.getElapsedTime() * 0.5) * 0.1;
      }
      const target = scene.getObjectByName('DeltaIndicator_Target');
      if (target && einsteinRef.current) {
        const p = new THREE.Vector3();
        target.getWorldPosition(p);
        einsteinRef.current.lookAt(p);
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  // ——— Update 3D indicator when state changes
  useEffect(() => {
    if (sceneRef.current) drawDeltaIndicator(sceneRef.current, deltaIndicator);
  }, [deltaIndicator]);

  // ——— Local deterministic fallback for /api/delta/indicator
  const localIndicator = useCallback((text, bci) => {
    // simple, deterministic hash → [-1,1]^3
    const s = `${text}|${bci.slice(-32).map((v) => v.toFixed(3)).join(',')}`;
    let h1 = 0, h2 = 0, h3 = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = (h1 * 31 + c) >>> 0;
      h2 = (h2 * 131 + c) >>> 0;
      h3 = (h3 * 521 + c) >>> 0;
    }
    const toUnit = (h) => (h % 2000) / 1000 - 1; // [-1,1]
    return [toUnit(h1), toUnit(h2), toUnit(h3)];
  }, []);

  // ——— Chat submit
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    const message = chatInput.trim();
    if (!message || loading) return;
    setLoading(true);
    setChatInput('');

    // 1) Write user msg (if Firestore available)
    if (db) {
      try {
        await addDoc(collection(db, CHAT_COLLECTION_PATH), {
          text: message,
          sender: userId,
          senderName: auth?.currentUser?.isAnonymous ? 'Anonymous' : (userId || 'user').slice(0, 8),
          timestamp: serverTimestamp(),
          type: 'user',
          indicator_x: null,
        });
      } catch (e) {
        console.warn('Failed to persist user message (Firestore). Running anyway…', e);
      }
    }

    // 2) Try backend, else fallback
    let indicator = null;
    let processed = message;
    try {
      const resp = await fetch('/api/delta/indicator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_input: message, bci_stream: bciData }),
      });
      const result = await resp.json();
      if (!resp.ok || result.status === 'ETHICAL_FAIL') throw new Error(result.error || result.message || 'Backend error');
      indicator = Array.isArray(result.indicator_point) ? result.indicator_point : [0, 0, 0];
      processed = result.processed_input || message;
    } catch (err) {
      // Fallback: local indicator
      indicator = localIndicator(message, bciData);
    }
    setDeltaIndicator(indicator);

    // 3) Persist AI response (if Firestore available)
    const aiText = `Indicator: ${indicator.map((n) => n.toFixed(4)).join(', ')}\nProcessed: "${processed}"`;
    if (db) {
      try {
        await addDoc(collection(db, CHAT_COLLECTION_PATH), {
          text: aiText,
          sender: 'Rogers AI',
          senderName: 'Rogers AI',
          timestamp: serverTimestamp(),
          type: 'ai',
          indicator_x: indicator[0],
        });
      } catch (e) {
        console.warn('Failed to persist AI response:', e);
      }
    } else {
      // Local echo in UI when offline
      setChatHistory((prev) => [
        ...prev,
        { id: crypto.randomUUID(), text: message, senderName: 'You', type: 'user' },
        { id: crypto.randomUUID(), text: aiText, senderName: 'Rogers AI', type: 'ai' },
      ]);
    }
    setLoading(false);
  };

  // ——— Small presentational views
  const WelcomeView = () => (
    <div className="panel">
      <h2>Hydrogen Portal Theory</h2>
      <p className="muted">Vector navigation, time‑delta alignment, and Einstein guidance ring – all in one canvas.</p>
      <div className="cards">
        <div className="card">
          <h3>Current Delta</h3>
          <p><strong>x,y,z</strong>: {deltaIndicator.map((n) => n.toFixed(4)).join(', ')}</p>
          <button className="btn" onClick={() => setDeltaIndicator([Math.random()*2-1, Math.random()*2-1, Math.random()*2-1])}>Randomize</button>
        </div>
        <div className="card">
          <h3>Quick Start</h3>
          <ul>
            <li>Open <em>Rogers AI</em>, type a prompt, hit Enter.</li>
            <li>Watch the ring track the new indicator.</li>
            <li>Use <em>Oscilloscope</em> to visualize BCI stream.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const RogersView = () => (
    <div className="panel column">
      <div className="chat">
        {chatHistory.map((m) => (
          <div key={m.id} className={`bubble ${m.type === 'ai' ? 'ai' : m.type === 'error' ? 'error' : 'user'}`}>
            <div className="sender">{m.senderName || m.sender || 'Anon'}</div>
            <div className="text">{m.text}</div>
          </div>
        ))}
      </div>
      <form onSubmit={handleChatSubmit} className="chatbar">
        <input
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          placeholder={isFirebaseReady ? 'Ask Rogers…' : 'Ask Rogers… (local mode)'}
        />
        <button className="btn" disabled={loading || !chatInput.trim()}>{loading ? '…' : 'Send'}</button>
      </form>
    </div>
  );

  const ZoomPortalView = () => (
    <div className="panel">
      <h2>Einstein 3D Zoom Portal</h2>
      <p className="muted">The 3D canvas behind the UI is always live. Use these controls to explore.</p>
      <div className="row gap">
        <button className="btn" onClick={() => setDeltaIndicator([0, 0, 0])}>Center</button>
        <button className="btn" onClick={() => setDeltaIndicator([0.3, 0.6, -0.2])}>Preset A</button>
        <button className="btn" onClick={() => setDeltaIndicator([-0.7, 0.1, 0.5])}>Preset B</button>
        <button className="btn" onClick={() => setDeltaIndicator([Math.random()*2-1, Math.random()*2-1, Math.random()*2-1])}>Random</button>
      </div>
    </div>
  );

  const HydrogenNumberView = () => (
    <div className="panel">
      <h2>Unique Hydrogen Number</h2>
      <p>Your persistent ID:</p>
      <div className="mono box">{userId || '—'}</div>
      <p className="muted">Use this everywhere as your Infinity‑wide ephemeral identity fingerprint.</p>
    </div>
  );

  const PiSingerView = () => {
    const [text, setText] = useState('Hello from Pi Singer.');
    return (
      <div className="panel">
        <h2>Pi Singer (Local TTS)</h2>
        <p className="muted">Quick voice output using your device voice. Your full server TTS can wire in later.</p>
        <div className="row gap">
          <input className="grow" value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn" onClick={() => speakLocal(text)}>Speak</button>
        </div>
      </div>
    );
  };

  const OscilloscopeView = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      const draw = () => {
        const w = c.width;
        const h = c.height;
        ctx.clearRect(0, 0, w, h);
        ctx.strokeStyle = '#00E0FF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < bciData.length; i++) {
          const x = (i / (bciData.length - 1)) * w;
          const y = h / 2 + (bciData[i] * h) / 2.2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        requestAnimationFrame(draw);
      };
      draw();
    }, [bciData]);
    return (
      <div className="panel">
        <h2>BCI Neural Monitor</h2>
        <canvas ref={canvasRef} width={800} height={200} className="scope" />
      </div>
    );
  };

  const Placeholder = ({ title }) => (
    <div className="panel">
      <h2>{title}</h2>
      <p className="muted">This module is scaffolded. Hook your engines here.</p>
    </div>
  );

  const ViewSwitch = () => {
    switch (activeView) {
      case 'Welcome':
        return <WelcomeView />;
      case 'Rogers AI':
        return <RogersView />;
      case 'Zoom Portal':
        return <ZoomPortalView />;
      case 'Hydrogen Number':
        return <HydrogenNumberView />;
      case 'Pi Singer':
        return <PiSingerView />;
      case 'Oscilloscope':
        return <OscilloscopeView />;
      default:
        return <Placeholder title={activeView} />;
    }
  };

  // ——— Basic styles (scoped)
  useEffect(() => {
    const id = 'infinity-portal-styles';
    if (document.getElementById(id)) return;
    const css = `
      :root { --bg:#06071e; --panel:#0b0d2b; --ink:#d9e2ff; --muted:#9aa3c7; --brand:#00d0ff; --accent:#ff5733; }
      *{box-sizing:border-box}
      html,body,#root{height:100%}
      body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial}
      .app{position:relative;height:100%;}
      .topbar{position:absolute;inset:0 0 auto 0;height:56px;display:flex;align-items:center;gap:12px;padding:0 12px;background:linear-gradient(180deg,rgba(0,0,0,.6),transparent)}
      .title{font-weight:600;letter-spacing:.3px;display:flex;align-items:center;gap:10px}
      .user{margin-left:auto;font-family:ui-monospace,Menlo,Consolas;opacity:.7}
      .hamburger{width:34px;height:34px;border-radius:10px;border:1px solid #334;display:grid;place-items:center;background:#0d1036;cursor:pointer}
      .hamburger:hover{background:#11154a}
      .drawer{position:absolute;top:56px;left:0;bottom:0;width:320px;background:#0b0e35;border-right:1px solid #1a1f5a;overflow:auto;padding:8px}
      .menuitem{display:flex;align-items:center;gap:10px;padding:10px;border-radius:10px;cursor:pointer}
      .menuitem:hover{background:#10144a}
      .divider{margin:8px 0;border-top:1px solid #1a1f5a}
      .icon{width:18px;height:18px}
      .stage{position:absolute;inset:56px 0 0 0;display:flex}
      .three{position:absolute;inset:56px 0 0 0;z-index:0}
      .content{position:relative;z-index:1;display:flex;flex-direction:column;width:100%;max-width:1200px;margin:0 auto;padding:16px}
      .panel{background:var(--panel);border:1px solid #171b51;border-radius:18px;padding:16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
      .panel.column{display:flex;flex-direction:column;height:calc(100vh - 56px - 32px)}
      .muted{color:var(--muted)}
      .row{display:flex;align-items:center}
      .gap{gap:10px}
      .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px;margin-top:12px}
      .card{background:#0d1040;border:1px solid #171b51;border-radius:14px;padding:12px}
      .btn{background:#0d1036;border:1px solid #233; padding:8px 12px;border-radius:10px;color:#cfe6ff;cursor:pointer}
      .btn:hover{background:#131853}
      .grow{flex:1}
      .mono{font-family:ui-monospace,Menlo,Consolas}
      .box{background:#0d1040;border:1px dashed #2a2f6a;padding:8px;border-radius:10px}
      .chat{flex:1;overflow:auto;display:flex;flex-direction:column;gap:8px;padding:8px}
      .bubble{max-width:80%;padding:10px 12px;border-radius:14px}
      .bubble.user{align-self:flex-end;background:#0e1750;border:1px solid #1b2573}
      .bubble.ai{align-self:flex-start;background:#0f2338;border:1px solid #1a3152}
      .bubble.error{align-self:center;background:#3a1020;border:1px solid #6a1a38}
      .sender{font-size:12px;color:#9bb6ff;margin-bottom:4px}
      .text{white-space:pre-wrap}
      .chatbar{display:flex;gap:8px;padding:8px}
      .chatbar input{flex:1;background:#0b0e35;border:1px solid #1a1f5a;color:#e6eeff;border-radius:10px;padding:10px}
      .scope{width:100%;background:#071036;border:1px solid #171b51;border-radius:14px}
      @media (max-width: 860px){ .drawer{width:86%} }
    `;
    const tag = document.createElement('style');
    tag.id = id;
    tag.textContent = css;
    document.head.appendChild(tag);
  }, []);

  // ——— Menu renderer
  const Drawer = () => (
    <div className="drawer">
      {Object.entries(AppMap).map(([key, meta], idx) => (
        key === '---' ? (
          <div key={`div-${idx}`} className="divider" />
        ) : (
          <div key={key} className="menuitem" onClick={() => { setActiveView(key); setIsMenuOpen(false); }}>
            <Icon name={meta.icon} />
            <div>
              <div style={{ fontWeight: 600 }}>{meta.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{meta.description}</div>
            </div>
          </div>
        )
      ))}
    </div>
  );

  return (
    <div className="app">
      {/* 3D Stage */}
      <div ref={mountRef} className="three" />

      {/* Topbar */}
      <div className="topbar">
        <div className="hamburger" onClick={() => setIsMenuOpen((v) => !v)} title="Menu">
          <span style={{ width: 16, height: 2, background: '#8aa7ff', display: 'block', borderRadius: 2 }} />
        </div>
        <div className="title">
          <InfinityFlowSymbol />
          <span>Infinity Portal</span>
        </div>
        <div className="user">{userId ? userId.slice(0, 10) : '—'}</div>
      </div>

      {/* Drawer */}
      {isMenuOpen && <Drawer />}

      {/* Content */}
      <div className="stage">
        <div className="content">
          <ViewSwitch />
          {errorMsg && (
            <div className="panel" style={{ marginTop: 12, borderColor: '#5a1a1a', background: '#2a0b0b' }}>
              <strong>System</strong>: {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
