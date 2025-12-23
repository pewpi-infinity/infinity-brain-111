/* Shell UI — binds input to Exec */
document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const inputLine = document.getElementById("input-line");
  const status = document.getElementById("status");

  function setStatus(s){ if (status) status.innerText = s; }
  function print(s){ if (!output) return; output.innerHTML += s + "\n"; output.scrollTop = output.scrollHeight; }

  // Wait for Exec (safe)
  if (window.Exec && Exec.readyPromise) {
    setStatus("Waiting for Exec...");
    try { await Exec.readyPromise; } catch(_) {}
  }

  setStatus("Ready. Type 'help'");

  async function handleInput(line){
    if (!line) return;
    print("$ " + line);
    // natural language first
    if (window.IntelligenceCore) {
      const nlResult = await IntelligenceCore.interpret(line);
      if (nlResult && nlResult.handled) { print(nlResult.output); return; }
    }
    // Exec commands
    if (window.Exec && Exec.handle) {
      const parts = line.split(" ");
      const cmd = parts.shift();
      try {
        const res = await Exec.handle(cmd, parts);
        if (res !== "Exec: Command not recognized.") { print(res); return; }
      } catch (e) { print("Exec error: " + e); return; }
    }
    // Built-ins
    if (window.RogersCommands && RogersCommands[line]) {
      RogersCommands[line](); return;
    }
    if (line === "help") {
      print("Commands: help, ls, cat, write, rm, mkdir, python, node, run, pkg, edit");
      return;
    }
    print("Command not found: " + line);
  }

  inputLine.addEventListener("keydown", async e => {
    if (e.key === "Enter") {
      const val = inputLine.value.trim();
      inputLine.value = "";
      await handleInput(val);
    }
  });

  // show welcome
  print("Osprey Terminal v5.3");
  print("Type 'help' for commands");
});