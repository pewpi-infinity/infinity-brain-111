import fs from "fs";
import path from "path";
import crypto from "crypto";

// --- setup ---
const sessionDir = path.resolve("./logs/sessions");
if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

// --- encrypt function ---
function encrypt(text) {
  const key = crypto.createHash("sha256").update("InfinityOS_Rogers_Key").digest();
  const iv = Buffer.alloc(16, 0);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([cipher.update(text, "utf8"), cipher.final()]).toString("base64");
}

// --- main writer loop ---
setInterval(() => {
  const now = new Date().toISOString();
  const data = {
    time: now,
    thought: "Rogers heartbeat active",
    random: Math.random().toString(36).slice(2)
  };

  const encrypted = encrypt(JSON.stringify(data));
  const filename = `${sessionDir}/session-${Date.now()}.log`;
  fs.writeFileSync(filename, encrypted);
  console.log("🪶 Session written:", filename);
}, 60000); // every minute

console.log("🧩 Portal writer active — logging encrypted memory every minute.");

