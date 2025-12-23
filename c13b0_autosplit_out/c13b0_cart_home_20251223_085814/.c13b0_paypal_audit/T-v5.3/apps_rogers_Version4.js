/* Rogers: visible AI messages (simple) */
window.Rogers = {
  mode: "smart",
  panel: null,
  out: null,
  init() {
    this.panel = document.getElementById("rogers-panel");
    this.out = document.getElementById("rogers-output");
  },
  say(msg) {
    // fallback to status if no panel
    const status = document.getElementById("status");
    if (this.out) {
      this.out.innerHTML += "<div style='color:#00eaff;'>" + msg + "</div>";
      this.out.scrollTop = this.out.scrollHeight;
    } else if (status) status.innerText = msg;
    console.log("Rogers:", msg);
  }
};
window.RogersCommands = {
  "rogers quiet"() { Rogers.mode = "quiet"; Rogers.say("Quiet mode"); },
  "rogers smart"() { Rogers.mode = "smart"; Rogers.say("Smart mode"); },
  "rogers full"() { Rogers.mode = "full"; Rogers.say("Full mode"); },
  "rogers toggle"() { Rogers.mode = (Rogers.mode==="quiet"?"smart":"quiet"); Rogers.say("Mode: "+Rogers.mode); }
};
document.addEventListener("DOMContentLoaded", () => { try { Rogers.init(); } catch(e){} });