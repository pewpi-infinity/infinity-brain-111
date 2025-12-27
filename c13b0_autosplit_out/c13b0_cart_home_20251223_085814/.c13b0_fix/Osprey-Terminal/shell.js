/* Infinity Shell — Osprey Terminal v3
   Now aware of:
   - Exec Engine
   - Intelligence Core
   - Rogers AI
*/

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Exec to initialize if possible (avoid race conditions on mobile)
  if (window.Exec && Exec.readyPromise) {
    try { await Exec.readyPromise; } catch (_) { /* continue even if Exec init failed */ }
  }

  const output = document.getElementById("output");
  const inputLine = document.getElementById("input-line");

  function print(text) {
    output.innerHTML += text + "<br>";
    output.scrollTop = output.scrollHeight;
  }

  function loadApp(path) {
    const script = document.createElement("script");
    script.src = path + "?v=" + Date.now(); // cache-bust
    document.body.appendChild(script);
  }

  const commands = {

    help() {
      print("Available commands:");
      print(" • help — list commands");
      print(" • ls — filesystem list");
      print(" • exec — run hybrid engine");
      print(" • clear — clear screen");
      print(" • rogers — open Rogers AI panel");
      print(" • intelligent — activate AI brain");
      print(" • run quantum — launch Quantum Visualizer");
      print(" • open apps — list installed apps");
    },

    ls() {
      if (window.Exec && Exec.fs) {
        const keys = Object.keys(Exec.fs);
        print(keys.length ? keys.join("<br>") : "(empty)");
      } else {
        print("(filesystem not initialized)");
      }
    },

    clear() {
      output.innerHTML = "";
    },

    rogers() {
      const panel = document.getElementById("rogers-panel");
      if (panel) panel.style.display = "block";
      print("Opening Rogers AI panel…");
    },

    intelligent() {
      if (window.IntelligenceCore) {
        print("Activating Intelligence Core…");
        IntelligenceCore.active = true;
        if (IntelligenceCore.speak) IntelligenceCore.speak("Ready.");
      } else {
        print("Intelligence Core not loaded.");
      }
    },

    "run quantum"() {
      print("Launching Quantum Visualizer…");
      loadApp("apps/quantum.js");
    },

    exec() {
      if (!window.Exec) {
        print("Exec Engine not loaded yet.");
        return;
      }
      print("Exec Engine ready. Use commands like:");
      print(" • write file.txt Hello");
      print(" • cat file.txt");
      print(" • python print(42)");
      print(" • node console.log(\"hi\")");
    },

    "open apps"() {
      print("Installed apps:");
      print(" • intelligence-core.js — AI Brain");
      print(" • exec-engine.js — Hybrid Execution Layer");
      print(" • quantum.js — Quantum Visualizer");
    }
  };

  inputLine.addEventListener("keydown", async e => {
    if (e.key === "Enter") {
      const cmd = inputLine.value.trim();
      if (!cmd) return;
      print(`<span style="color:#00eaff;">$</span> ${cmd}`);

      // Check Exec Engine first for Linux-style commands
      if (window.Exec && Exec.handle) {
        const parts = cmd.split(" ");
        const base = parts.shift();
        try {
          const result = await Exec.handle(base, parts);
          if (result !== "Exec: Command not recognized.") {
            print(result);
            inputLine.value = "";
            return;
          }
        } catch (err) {
          print("Exec call error: " + (err && err.message ? err.message : err));
          inputLine.value = "";
          return;
        }
      }

      // Fallback to built-in commands
      if (commands[cmd]) {
        commands[cmd]();
      } 
      else if (window.RogersCommands && RogersCommands[cmd]) {
        RogersCommands[cmd]();
      }
      else if (window.IntelligenceCore) {
        IntelligenceCore.interpret(cmd);
      } 
      else {
        print(`Command not found: ${cmd}`);
      }

      inputLine.value = "";
    }
  });

  // If Rogers exists, ensure it initializes its panel display text (rogers.js will call init on DOMContentLoaded itself)
  if (window.Rogers && Rogers.init) {
    try { Rogers.init(); } catch (_) { /* ignore */ }
  }
});