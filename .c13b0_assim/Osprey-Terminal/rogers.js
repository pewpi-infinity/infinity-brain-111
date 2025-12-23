/* 
  Rogers AI Panel — Osprey Terminal v2
  Behavior Toggle System (Quiet / Smart / Full)
  Integrated with Intelligence Core
*/

window.Rogers = {
  mode: "smart", 
  // Modes: quiet | smart | full

  panel: null,
  out: null,

  init() {
    this.panel = document.getElementById("rogers-panel");
    this.out = document.getElementById("rogers-output");
    this.updateModeDisplay();
  },

  say(msg) {
    if (!this.out) return;

    if (this.mode === "quiet") return;

    if (this.mode === "smart" && msg.includes("[minor]")) return;

    this.out.innerHTML += `<div style='color:#00eaff;'>${msg}</div>`;
    this.out.scrollTop = this.out.scrollHeight;
  },

  setMode(newMode) {
    this.mode = newMode;
    this.updateModeDisplay();
    this.say("Rogers mode set to: " + newMode);
  },

  updateModeDisplay() {
    const badge = document.getElementById("rogers-mode");
    if (badge) badge.innerText = "Mode: " + this.mode.toUpperCase();
  },

  toggle() {
    if (this.mode === "quiet") this.setMode("smart");
    else if (this.mode === "smart") this.setMode("full");
    else this.setMode("quiet");
  }
};

/* --- COMMANDS BOUND TO TERMINAL --- */
window.RogersCommands = {

  "rogers quiet"() {
    Rogers.setMode("quiet");
    Rogers.say("Entering QUIET MODE.");
  },

  "rogers smart"() {
    Rogers.setMode("smart");
    Rogers.say("Smart Mode active.");
  },

  "rogers full"() {
    Rogers.setMode("full");
    Rogers.say("Full Talk Mode active.");
  },

  "rogers toggle"() {
    Rogers.toggle();
  }
};

document.addEventListener("DOMContentLoaded", () => Rogers.init());
