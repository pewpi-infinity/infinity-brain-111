/* IntelligenceCore: map natural language to Exec commands.
   Minimal rule-based interpreter for offline use.
*/
window.IntelligenceCore = {
  async interpret(text) {
    const t = text.trim().toLowerCase();
    // simple patterns
    if (t.startsWith("show files") || t === "list files" || t === "ls") {
      const out = await Exec.handle("ls", []);
      return { handled: true, output: out };
    }
    if (t.startsWith("read ") || t.startsWith("open ")) {
      const parts = t.split(" ");
      const fname = parts.slice(1).join(" ");
      const out = await Exec.handle("cat", [fname]);
      return { handled: true, output: out };
    }
    if (t.startsWith("delete ") || t.startsWith("remove ")) {
      const parts = t.split(" ");
      const fname = parts.slice(1).join(" ");
      const out = await Exec.handle("rm", [fname]);
      return { handled: true, output: out };
    }
    if (t.startsWith("write ") || t.startsWith("create ")) {
      // "write file.txt Hello world"
      const parts = text.split(" ");
      parts.shift();
      const file = parts.shift();
      const content = parts.join(" ");
      const out = await Exec.handle("write", [file, content]);
      return { handled: true, output: out };
    }
    if (t.startsWith("install ")) {
      const pkg = t.split(" ").slice(1).join(" ");
      if (window.PackageManager) {
        const res = await PackageManager.install(pkg);
        return { handled: true, output: res };
      }
    }
    // not understood
    return { handled: false };
  }
};