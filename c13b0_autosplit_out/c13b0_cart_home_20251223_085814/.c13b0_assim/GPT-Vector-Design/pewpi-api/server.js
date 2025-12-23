// server.js — clean working build for Termux

const express = require("express");
// --- logging module ---
const fs = require("fs");
const logsDir = "./logs";
const logFile = `${logsDir}/conversations.json`;

// Ensure log folder exists
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

// Load previous logs if any
let conversationLog = [];
if (fs.existsSync(logFile)) {
  try {
    const encoded = fs.readFileSync(logFile, "utf8");
    const decoded = Buffer.from(encoded, "base64").toString("utf8");
    conversationLog = JSON.parse(decoded);
  } catch (err) {
    console.error("Error loading conversation log:", err.message);
  }
}

// Function to save each prompt + reply
function logConversation(prompt, reply) {
  const entry = {
    time: new Date().toISOString(),
    prompt,
    reply
  };
  conversationLog.push(entry);

  // Limit file size (keeps last 500 logs)
  if (conversationLog.length > 500) {
    conversationLog = conversationLog.slice(-500);
  }

  // Save encrypted-style JSON (base64)
  const encoded = Buffer.from(JSON.stringify(conversationLog, null, 2)).toString("base64");
  fs.writeFileSync(logFile, encoded);
}

const axios = require("axios");
const wiki = require("wikipedia");
const app = express();
app.use(express.json());

// --- helper: wikipedia summary
async function getWikiSummary(prompt) {
  try {
    const page = await wiki.summary(prompt);
    if (page?.extract) return page.extract;
  } catch {}
  return null;
}

// --- helper: duckduckgo fallback
async function getDuckDuckGo(prompt) {
  try {
    const res = await axios.get("https://api.duckduckgo.com/", {
      params: { q: prompt, format: "json", no_html: 1 },
    });
    if (res.data?.AbstractText) return res.data.AbstractText;
  } catch {}
  return "No detailed info found, but Rogers is listening.";
}

// --- fallback sentences
const responses = [
  "Rogers aligns with your intent and adjusts balance.",
  "Infinity systems hum evenly across your request.",
  "Information field synchronized. Standing by.",
  "Analyzing temporal signature of your message.",
  "All channels tuned. Proceeding with harmonic data.",
  "Quantum lattice echoes back your curiosity.",
  "Energy flux stable. Awaiting deeper context.",
  "Neural mesh resonating. Calibration complete.",
  "Infinity recognizes the tone in your question.",
  "All cognitive nodes linked. Rogers ready."
];

// --- main /analyze endpoint ---
app.post("/analyze", async (req, res) => {
  const prompt = req.body.prompt || "";

  let answer = await getWikiSummary(prompt);
  if (!answer) answer = await getDuckDuckGo(prompt);
  if (!answer) {
    const fallbackResponses = [
      "Quantum lattice echoes back your curiosity.",
      "Energy flux stable. Awaiting deeper context.",
      "Neural mesh resonating. Calibration complete.",
      "Infinity recognizes the tone in your question.",
      "All cognitive nodes linked. Rogers ready."
    ];
    answer = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }

  // 💾 Log every prompt + answer pair
  try {
    logConversation(prompt, answer);
  } catch (err) {
    console.error("Logging error:", err.message);
  }

  res.json({ ok: true, message: answer });
});

// --- health check
app.get("/", (req, res) => {
  res.send("🚀 Rogers Brain API is online and steady.");
});

// --- start
const PORT = 8080;
app.listen(PORT, () => console.log(`🧠 Rogers running on port ${PORT}`));

// --- Rogers Heartbeat Monitor ---
const os = require("os");

let startTime = Date.now();
let requestsHandled = 0;

// Track number of analyze calls
app.post("/analyze", async (req, res) => {
  requestsHandled++;
  const prompt = req.body.prompt || "";
  let answer = await getWikiSummary(prompt);
  if (!answer) answer = await getDuckDuckGo(prompt);
  if (!answer) answer = responses[Math.floor(Math.random() * responses.length)];
  logConversation(prompt, answer);
  res.json({ ok: true, message: answer });
});

// Heartbeat log every 3 minutes
setInterval(() => {
  const uptimeMin = ((Date.now() - startTime) / 60000).toFixed(1);
  const mem = process.memoryUsage().rss / 1024 / 1024;
  const logLine = `[Rogers] ❤️ Alive @ ${new Date().toLocaleString()} | Uptime: ${uptimeMin} min | RAM: ${mem.toFixed(
    1
  )} MB | Requests: ${requestsHandled}`;
  console.log(logLine);

  // also append to heartbeat log
  fs.appendFileSync("./logs/heartbeat.log", logLine + "\n");
}, 180000); // every 3 minutes

