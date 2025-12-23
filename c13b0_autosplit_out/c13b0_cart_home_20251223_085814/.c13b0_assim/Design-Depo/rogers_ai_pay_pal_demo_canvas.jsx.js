import React, { useEffect, useMemo, useRef, useState } from "react";

// Single-file demo of the PayPal-flavored Rogers AI chat.
// No API keys. Fully client-side. Mobile-first. Tokens accrue per message (🪶).
// Save/restore state via localStorage so your token count and name persist.

export default function RogersPayPalDemo() {
  // ------- State -------
  const [name, setName] = useState(() => localStorage.getItem("rogers_name") || "Kris");
  const [tokens, setTokens] = useState(() => parseInt(localStorage.getItem("infinity_tokens") || "0", 10));
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem("rogers_google") === "1");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("rogers_msgs");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text:
          `Hi ${name} — Infinity tokens are active. Every message earns a 🪶. Rogers routes across external AIs and the open web, then summarizes here.`,
        ts: Date.now(),
      },
    ];
  });

  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("rogers_msgs", JSON.stringify(messages));
    // Auto scroll to bottom on new message
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => localStorage.setItem("infinity_tokens", String(tokens)), [tokens]);
  useEffect(() => localStorage.setItem("rogers_name", name), [name]);
  useEffect(() => localStorage.setItem("rogers_google", signedIn ? "1" : "0"), [signedIn]);

  // ------- Demo “router” logic -------
  const quickAnswers = useMemo(
    () => ({
      hawaii:
        "Quick answer (IA): Hawaii — An island state of the United States, in the Pacific Ocean about 2,000 miles southwest of the U.S.\n\nSources: ",
      turtle:
        "Quick answer (IA): Turtles are reptiles with shells; sea turtles can live for decades and migrate thousands of miles.\n\nSources: ",
      newspaper:
        "A newspaper. (Classic riddle: ‘What is black and white and red all over?’)",
      voice:
        "I can mirror your cadence. For voice build: capture a 30–60s clean sample, extract pitch/timbre, then synth via a local TTS (no cloud keys).",
    }),
    []
  );

  function routeAndReply(text) {
    const clean = text.trim().toLowerCase();

    // tiny keyword router – intentionally simple (demo mode)
    if (clean.includes("hawaii")) {
      return (
        quickAnswers.hawaii +
        linkTag("DuckDuckGo IA", "https://duckduckgo.com/?q=Hawaii")
      );
    }
    if (clean.includes("turtle")) {
      return (
        quickAnswers.turtle +
        linkTag("DuckDuckGo IA", "https://duckduckgo.com/?q=turtle+facts")
      );
    }
    if (clean.includes("black and white and red all over")) return quickAnswers.newspaper;
    if (clean.includes("voice")) return quickAnswers.voice;

    // Demo fallback that matches your screenshot phrasing
    return "No clean text found. Try rephrasing.";
  }

  // Because JSX sanitizes, we keep links simple.
  function linkTag(label, href) {
    return `${label}: ${href}`;
  }

  // ------- Handlers -------
  function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg = { id: crypto.randomUUID(), role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    // Earn a 🪶 per outbound user message
    setTokens((t) => t + 1);

    // Simulate Rogers response after a short delay
    setTimeout(() => {
      const reply = routeAndReply(text);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: reply, ts: Date.now() },
      ]);
    }, 420);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function promptName() {
    const n = window.prompt("What should I call you?", name) || name;
    setName(n);
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "assistant", text: `Nice to meet you, ${n}.`, ts: Date.now() },
    ]);
  }

  function fakeGoogleSignIn() {
    setSignedIn(true);
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "assistant", text: "Signed in (demo).", ts: Date.now() },
    ]);
  }

  // ------- UI -------
  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 shadow"></span>
            <div className="text-[15px] font-semibold tracking-tight">
              Powered by <span className="uppercase">INFINITY</span> • Rogers AI
            </div>
            <span className="ml-2 italic font-semibold text-[14px] text-amber-600/90 border border-amber-400/60 rounded px-1.5 py-0.5">
              PayPal
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fakeGoogleSignIn}
              className="hidden sm:inline-flex items-center rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm hover:bg-neutral-50"
            >
              {signedIn ? "Signed in" : "Sign in"} <span className="mx-1">with</span> Google
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm">
              <span role="img" aria-label="feather">🪶</span>
              <span>{tokens}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat window */}
      <div className="mx-auto max-w-2xl w-full flex-1 px-4 pt-3 pb-2">
        <div ref={listRef} className="h-[62vh] sm:h-[66vh] overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-3 flex flex-col gap-3">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} text={m.text} />
          ))}
        </div>

        {/* Composer */}
        <div className="mt-3 flex items-end gap-2">
          <div className="flex-1 rounded-2xl border border-neutral-300 bg-white px-3 py-2 shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder={`Talk to me, ${name} — fast, on-page answers with sources.`}
              className="w-full resize-none outline-none text-[15px] placeholder:text-neutral-400"
            />
          </div>
          <button
            onClick={send}
            className="rounded-2xl bg-blue-600 text-white font-semibold px-4 py-2 shadow hover:bg-blue-700 active:translate-y-px"
          >
            Send
          </button>
          <button
            onClick={promptName}
            className="rounded-2xl border border-neutral-300 bg-white font-semibold px-3 py-2 shadow hover:bg-neutral-50"
          >
            Set name
          </button>
        </div>

        {/* Token explainer */}
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-[15px] leading-6">
          <div className="font-extrabold text-[17px] flex items-center gap-2">
            <span role="img" aria-label="feather">🪶</span>
            Infinity Tokens — <span className="font-semibold">Your on-site currency (no USD).</span>
          </div>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>You earn tokens each time you chat; bigger ideas earn a few extra.</li>
            <li>Tokens are used for marketplace perks and AI utilities inside Infinity.</li>
            <li><span className="font-semibold">Watson • Gemini • ChatGPT</span> are filtered by Infinity Rogers and summarized here.</li>
            <li className="font-semibold">No API keys required.</li>
          </ul>
        </div>

        <div className="mx-auto text-center text-[13px] text-neutral-500 mt-3">
          Watson • Gemini • ChatGPT — filtered by Infinity Rogers. No USD — tokens only.
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 shadow ${
          isUser
            ? "bg-blue-600 text-white"
            : "bg-blue-50 text-neutral-900 border border-blue-100"
        }`}
        style={{ wordBreak: "break-word" }}
      >
        {text}
      </div>
    </div>
  );
}
