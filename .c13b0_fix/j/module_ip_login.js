/* ===========================
   INFINITY OS — IP LOGIN MODULE
=========================== */

(function () {

  async function getIP() {
    try {
      const r = await fetch("https://api.ipify.org?format=json");
      const d = await r.json();
      return d.ip || "unknown";
    } catch (e) { return "unknown"; }
  }

  async function initIPLogin() {
    const ip = await getIP();
    if (ip === "unknown") return;

    const KEY = "octave_ip_lock";
    const saved = localStorage.getItem(KEY);

    // FIRST TIME VISIT → STORE IP AND AUTO-LOGIN
    if (!saved) {
      localStorage.setItem(KEY, ip);
      addIPNotice(`🔐 Device Locked to IP: ${ip}`);
      return;
    }

    // RETURN VISIT → SAME IP → AUTO-LOGIN
    if (saved === ip) {
      addIPNotice(`✔ Auto-login confirmed (IP match: ${ip})`);
      return;
    }

    // DIFFERENT IP → Lock out (mild)
    addIPNotice(`⚠ Device mismatch: Current IP ${ip}`);
  }

  function addIPNotice(msg) {
    const con = document.querySelector("#console");
    if (!con) return;
    const line = document.createElement("div");
    line.className = "console-line system";
    line.textContent = msg;
    con.appendChild(line);
  }

  document.addEventListener("DOMContentLoaded", initIPLogin);

})();
