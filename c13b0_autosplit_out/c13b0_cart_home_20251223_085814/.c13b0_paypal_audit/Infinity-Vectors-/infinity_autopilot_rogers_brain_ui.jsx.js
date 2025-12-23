import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Bot, Mic, Play, Square, Settings, Sparkles, ShieldCheck, Power,
  Car, Home as HomeIcon, ShoppingBag, FlaskConical, MessageSquare, MapPin, Fuel,
  Gauge, Clock, Zap, Download, Save, Trash2, ChevronRight, ChevronDown, Wand2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

// --- Utility mocks (no external keys; local-only logic) ---
const now = () => new Date().toLocaleTimeString();

function simulateLLMCompile(prompt) {
  // Minimal intent parser -> program blocks
  const p = prompt.toLowerCase();
  const blocks = [];
  // triggers
  if (p.includes("every morning") || p.includes("daily")) blocks.push({ type: "trigger", text: "At 7:00 AM, daily" });
  if (p.includes("when fuel") || p.includes("low gas") || p.includes("fuel <")) blocks.push({ type: "trigger", text: "On sensor: Fuel < 15%" });
  if (p.includes("arrive") || p.includes("reach")) blocks.push({ type: "trigger", text: "On arrival: destination" });

  // conditions
  if (p.includes("cheapest gas") || p.includes("gas price")) blocks.push({ type: "condition", text: "Find station: price ≤ target" });
  if (p.includes("weather")) blocks.push({ type: "condition", text: "Weather check: rain or snow" });
  if (p.includes("traffic")) blocks.push({ type: "condition", text: "Traffic check: avoid incidents" });

  // actions
  if (p.includes("remote start")) blocks.push({ type: "action", text: "Remote start: 10 min preheat" });
  if (p.includes("route") || p.includes("navigate")) blocks.push({ type: "action", text: "Navigate: best route (ETAs)" });
  if (p.includes("schedule oil") || p.includes("oil change")) blocks.push({ type: "action", text: "Book service: oil change" });
  if (p.includes("check tires") || p.includes("tire")) blocks.push({ type: "action", text: "Read TPMS & alert" });
  if (p.includes("log trip") || p.includes("trip log")) blocks.push({ type: "action", text: "Log trip in Infinity Ledger" });

  if (blocks.length === 0) {
    blocks.push(
      { type: "trigger", text: "Manual trigger" },
      { type: "condition", text: "Context: vehicle mode" },
      { type: "action", text: "Assistive route + checklist" }
    );
  }
  return {
    name: prompt.slice(0, 40) || "New Autopilot Program",
    blocks,
  };
}

const pretty = (obj) => JSON.stringify(obj, null, 2);

// Web Speech API helpers (best-effort)
const hasSpeech = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function InfinityAutopilotUI() {
  const [armed, setArmed] = useState(false);
  const [domain, setDomain] = useState("vehicle");
  const [mindRead, setMindRead] = useState(false);
  const [rogerOnline, setRogerOnline] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState([{ role: "roger", text: "Rogers online. Tell me what to automate." }]);
  const [program, setProgram] = useState({ name: "Untitled", blocks: [] });
  const [running, setRunning] = useState(false);
  const [showBlocks, setShowBlocks] = useState(true);
  const [metrics, setMetrics] = useState({ fuel: 42, battery: 83, tireFL: 36, tireFR: 35, tireRL: 34, tireRR: 34, speed: 0 });
  const [templatesOpen, setTemplatesOpen] = useState(false);

  const recRef = useRef(null);

  useEffect(() => {
    // Fake vehicle metrics ticker
    const t = setInterval(() => {
      setMetrics(m => ({
        ...m,
        speed: Math.max(0, Math.min(72, m.speed + (Math.random()*10 - 5))),
        fuel: Math.max(0, m.fuel - (Math.random()*0.1)),
      }));
    }, 1200);
    return () => clearInterval(t);
  }, []);

  function speak(text) {
    if (typeof window === "undefined") return;
    try {
      const s = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(s);
    } catch {}
  }

  function handleAsk() {
    if (!prompt.trim()) return;
    const userMsg = { role: "user", text: prompt.trim() };
    const compiled = simulateLLMCompile(prompt.trim());
    const rogerMsg = { role: "roger", text: `Compiled a draft with ${compiled.blocks.length} blocks. Edit or arm when ready.` };
    setChat(c => [...c, userMsg, rogerMsg]);
    setProgram(compiled);
    setPrompt("");
    speak("Draft program ready.");
  }

  function handleMicToggle() {
    if (!hasSpeech) return;
    if (!recRef.current) {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SR();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (e) => {
        const val = e.results?.[0]?.[0]?.transcript || "";
        setPrompt(val);
      };
      recRef.current = rec;
    }
    try {
      recRef.current.start();
    } catch {}
  }

  function arm() {
    setArmed(true);
    setRunning(false);
    setChat(c => [...c, { role: "roger", text: "Autopilot armed. Waiting on triggers." }]);
    speak("Autopilot armed.");
  }

  function disarm() {
    setArmed(false);
    setRunning(false);
    setChat(c => [...c, { role: "roger", text: "Autopilot disarmed." }]);
    speak("Autopilot disarmed.");
  }

  function runOnce() {
    setRunning(true);
    setTimeout(() => setRunning(false), 1500);
    setChat(c => [...c, { role: "roger", text: `Executing: ${program.name}` }]);
    speak("Executing program");
  }

  function addBlock(t) {
    setProgram(p => ({ ...p, blocks: [...p.blocks, { type: t, text: t === "trigger" ? "New trigger" : t === "condition" ? "New condition" : "New action" }] }));
  }

  function removeBlock(i) {
    setProgram(p => ({ ...p, blocks: p.blocks.filter((_, idx) => idx !== i) }));
  }

  function saveJSON() {
    const blob = new Blob([pretty(program)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${program.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "autopilot"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const domainIcon = useMemo(() => ({
    vehicle: <Car className="w-4 h-4" />, 
    home: <HomeIcon className="w-4 h-4" />, 
    market: <ShoppingBag className="w-4 h-4" />, 
    lab: <FlaskConical className="w-4 h-4" />, 
    comms: <MessageSquare className="w-4 h-4" />,
  })[domain], [domain]);

  const templates = [
    {
      name: "Morning Warmup & Route",
      blocks: [
        { type: "trigger", text: "At 7:00 AM, Mon–Fri" },
        { type: "condition", text: "Weather check: ice/rain" },
        { type: "action", text: "Remote start: preheat 10 min" },
        { type: "action", text: "Navigate: work (fastest)" },
      ],
    },
    {
      name: "Low Fuel Auto-Assist",
      blocks: [
        { type: "trigger", text: "On sensor: Fuel < 15%" },
        { type: "condition", text: "Find cheapest gas within 5mi" },
        { type: "action", text: "Navigate to station" },
        { type: "action", text: "Log purchase in Infinity Ledger" },
      ],
    },
    {
      name: "Tire Pressure Watch",
      blocks: [
        { type: "trigger", text: "Every 48 hours" },
        { type: "action", text: "Read TPMS & notify if < 32 psi" },
      ],
    },
  ];

  function loadTemplate(t) {
    setProgram({ name: t.name, blocks: t.blocks });
    setChat(c => [...c, { role: "roger", text: `Template loaded: ${t.name}` }]);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100">
      <header className="sticky top-0 z-30 backdrop-blur border-b border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <motion.div initial={{ rotate: -8, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}>
              <Brain className="w-6 h-6 text-cyan-300" />
            </motion.div>
            <span className="text-lg font-semibold tracking-wide">Infinity Autopilot</span>
            <Badge variant="secondary" className="ml-1 bg-cyan-900/40 text-cyan-200">Rogers-linked</Badge>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="mind" className="text-xs text-slate-300">Mind‑Read</Label>
              <Switch id="mind" checked={mindRead} onCheckedChange={setMindRead} />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="roger" className="text-xs text-slate-300">Rogers</Label>
              <Switch id="roger" checked={rogerOnline} onCheckedChange={setRogerOnline} />
            </div>
            <Separator orientation="vertical" className="h-6 bg-white/10" />
            {!armed ? (
              <Button onClick={arm} className="bg-emerald-600 hover:bg-emerald-500"><ShieldCheck className="w-4 h-4 mr-2"/>Arm</Button>
            ) : (
              <Button variant="destructive" onClick={disarm} className="bg-rose-600 hover:bg-rose-500"><Power className="w-4 h-4 mr-2"/>Disarm</Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        {/* Left rail: Domains & Telemetry */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm"><Settings className="w-4 h-4"/> Domains</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Tabs value={domain} onValueChange={setDomain} className="w-full">
                <TabsList className="grid grid-cols-5">
                  <TabsTrigger value="vehicle" className="text-xs">Vehicle</TabsTrigger>
                  <TabsTrigger value="home" className="text-xs">Home</TabsTrigger>
                  <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
                  <TabsTrigger value="lab" className="text-xs">Lab</TabsTrigger>
                  <TabsTrigger value="comms" className="text-xs">Comms</TabsTrigger>
                </TabsList>
                <TabsContent value="vehicle" className="pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge className="justify-start bg-white/10"><Fuel className="w-3 h-3 mr-1"/> Fuel Watch</Badge>
                    <Badge className="justify-start bg-white/10"><Gauge className="w-3 h-3 mr-1"/> TPMS</Badge>
                    <Badge className="justify-start bg-white/10"><MapPin className="w-3 h-3 mr-1"/> Cheaper Gas</Badge>
                    <Badge className="justify-start bg-white/10"><Clock className="w-3 h-3 mr-1"/> Morning Warmup</Badge>
                  </div>
                </TabsContent>
                <TabsContent value="home" className="pt-2 text-xs">Scene presets, climate, lights, arrivals.</TabsContent>
                <TabsContent value="market" className="pt-2 text-xs">Auto‑order essentials; price guards.</TabsContent>
                <TabsContent value="lab" className="pt-2 text-xs">Experiment timers; data sampling.</TabsContent>
                <TabsContent value="comms" className="pt-2 text-xs">Auto replies; call routing.</TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center gap-2"><Car className="w-4 h-4"/> Telemetry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <Metric label="Fuel" value={`${metrics.fuel.toFixed(1)}%`} />
                <Metric label="Battery" value={`${metrics.battery}%`} />
                <Metric label="Speed" value={`${Math.round(metrics.speed)} mph`} />
                <Metric label="TPMS FL" value={`${metrics.tireFL} psi`} />
                <Metric label="TPMS FR" value={`${metrics.tireFR} psi`} />
                <Metric label="TPMS RL" value={`${metrics.tireRL} psi`} />
                <Metric label="TPMS RR" value={`${metrics.tireRR} psi`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center: Autopilot Console */}
        <div className="col-span-12 lg:col-span-6 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {domainIcon}
                <CardTitle className="text-sm">Autopilot Console</CardTitle>
                <Badge className={`ml-2 ${armed ? "bg-emerald-600" : "bg-white/10"}`}>{armed ? "ARMED" : "SAFE"}</Badge>
                {running && <Badge className="ml-2 bg-indigo-600 animate-pulse">RUNNING</Badge>}
                <div className="ml-auto flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setTemplatesOpen(v => !v)}><Wand2 className="w-4 h-4 mr-1"/>Templates</Button>
                  {!running ? (
                    <Button size="sm" onClick={runOnce}><Play className="w-4 h-4 mr-1"/>Run</Button>
                  ) : (
                    <Button size="sm" variant="secondary" disabled><Square className="w-4 h-4 mr-1"/>Running…</Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Tell Rogers what to automate… e.g., ‘When fuel is low, route me to the cheapest gas and log the purchase.’"
                  onKeyDown={(e) => e.key === "Enter" && handleAsk()}
                  className="pr-12"
                />
                <Button type="button" size="icon" variant="secondary" className="absolute right-1 top-1 h-8 w-8" onClick={handleMicToggle}>
                  <Mic className="w-4 h-4"/>
                </Button>
              </div>
              <div className="h-40 overflow-y-auto rounded-lg border border-white/10 p-2 bg-black/20">
                <ChatList chat={chat} />
              </div>
            </CardContent>
            <CardFooter className="flex items-center gap-2">
              <Button onClick={handleAsk} className="bg-cyan-600 hover:bg-cyan-500"><Bot className="w-4 h-4 mr-2"/>Ask Rogers</Button>
              <Button variant="secondary" onClick={saveJSON}><Download className="w-4 h-4 mr-2"/>Export JSON</Button>
              <div className="ml-auto text-xs text-slate-400">{now()}</div>
            </CardFooter>
          </Card>

          <AnimatePresence>
            {templatesOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Card className="bg-white/5 border-white/10">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="w-4 h-4"/> Quick Templates</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-2">
                    {templates.map((t, i) => (
                      <Button key={i} variant="secondary" className="justify-start" onClick={() => loadTemplate(t)}>
                        <ChevronRight className="w-4 h-4 mr-1"/>{t.name}
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Program Builder */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Program Builder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={program.name}
                onChange={(e) => setProgram(p => ({ ...p, name: e.target.value }))}
                className="bg-black/30"
              />

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => addBlock("trigger")}>+ Trigger</Button>
                <Button size="sm" variant="secondary" onClick={() => addBlock("condition")}>+ Condition</Button>
                <Button size="sm" variant="secondary" onClick={() => addBlock("action")}>+ Action</Button>
                <Button size="sm" onClick={() => setShowBlocks(v => !v)}>{showBlocks ? "Hide" : "Show"}</Button>
              </div>

              <AnimatePresence initial={false}>
                {showBlocks && (
                  <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                    {program.blocks.map((b, i) => (
                      <motion.li key={i} layout className="rounded-lg border border-white/10 bg-black/30">
                        <div className="flex items-center justify-between px-2 py-1.5">
                          <div className="text-xs uppercase tracking-wide text-slate-300">{b.type}</div>
                          <Button size="icon" variant="ghost" onClick={() => removeBlock(i)}><Trash2 className="w-4 h-4"/></Button>
                        </div>
                        <Textarea
                          value={b.text}
                          onChange={(e) => setProgram(p => ({ ...p, blocks: p.blocks.map((bb, idx) => idx === i ? { ...bb, text: e.target.value } : bb) }))}
                          className="bg-black/20 border-0"
                        />
                      </motion.li>
                    ))}
                    {program.blocks.length === 0 && (
                      <div className="text-xs text-slate-400 py-6 text-center">No blocks yet. Ask Rogers or add one above.</div>
                    )}
                  </motion.ul>
                )}
              </AnimatePresence>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-xs text-slate-400">Draft • not deployed</div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={saveJSON}><Save className="w-4 h-4 mr-1"/>Save</Button>
                {!running ? (
                  <Button size="sm" onClick={runOnce}><Play className="w-4 h-4 mr-1"/>Test</Button>
                ) : (
                  <Button size="sm" variant="secondary" disabled><Square className="w-4 h-4 mr-1"/>Running…</Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4"/> Status</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1">
              <div>Rogers link: <span className={rogerOnline ? "text-emerald-400" : "text-rose-400"}>{rogerOnline ? "online" : "offline"}</span></div>
              <div>Mind‑Read: <span className={mindRead ? "text-emerald-400" : "text-slate-300"}>{mindRead ? "enabled" : "disabled"}</span></div>
              <div>Domain: <span className="text-slate-200 capitalize">{domain}</span></div>
              <div>Autopilot: <span className={armed ? "text-emerald-400" : "text-slate-300"}>{armed ? "armed" : "safe"}</span></div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="px-4 py-6 border-t border-white/10 bg-black/30">
        <div className="max-w-7xl mx-auto text-xs flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2"><Bot className="w-3 h-3"/> Rogers Autopilot • draft UI</div>
          <div>Powered by <span className="text-cyan-300 font-semibold">Infinity</span></div>
        </div>
      </footer>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="p-2 rounded-md bg-black/30 border border-white/10">
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function ChatList({ chat }) {
  return (
    <div className="space-y-2">
      {chat.map((m, i) => (
        <div key={i} className={`text-sm ${m.role === "roger" ? "text-cyan-200" : "text-slate-200"}`}>
          <span className="mr-2 text-xs opacity-70">[{m.role}]</span>{m.text}
        </div>
      ))}
    </div>
  );
}
