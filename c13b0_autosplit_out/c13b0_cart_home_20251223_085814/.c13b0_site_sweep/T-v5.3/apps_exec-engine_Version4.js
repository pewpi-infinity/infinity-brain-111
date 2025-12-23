/* Exec Engine: JS + Pyodide + virtual FS */
window.Exec = {
  fs: {},
  jsContext: {},
  pyReady: false,
  pyodide: null,
  ready: false,
  readyPromise: null,

  _log(msg) {
    if (window.Rogers && Rogers.say) try { Rogers.say(msg); } catch(e){ console.log(msg); }
    else console.log(msg);
  },

  init() {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = (async () => {
      this._log("[minor] Exec init started");
      // pyodide available via <script> tag; load if possible
      if (typeof loadPyodide === "function") {
        try {
          this.pyodide = await loadPyodide();
          this.pyReady = true;
          this._log("Python engine ready.");
        } catch (e) { this._log("Python load error: " + e); }
      } else {
        this._log("Pyodide not present; Python disabled.");
      }
      this.ready = true;
      this._log("Exec Engine active.");
      return true;
    })();
    return this.readyPromise;
  },

  // FS
  writeFile(path, content) {
    this.fs[path] = String(content);
    if (window.FSStorage && FSStorage.save) FSStorage.save(this.fs);
  },
  readFile(path) { return Object.prototype.hasOwnProperty.call(this.fs,path) ? this.fs[path] : null; },
  deleteFile(path) {
    if (Object.prototype.hasOwnProperty.call(this.fs,path)) { delete this.fs[path]; if (window.FSStorage && FSStorage.save) FSStorage.save(this.fs); }
  },

  // Execution
  execJS(code) {
    try {
      const result = Function("ctx", code)(this.jsContext);
      if (result === undefined) return "(ok)";
      if (result === null) return "null";
      if (typeof result === "object") { try { return JSON.stringify(result, null, 2); } catch { return String(result); } }
      return String(result);
    } catch (e) { return "JS Error: " + (e && e.stack ? e.stack : e); }
  },

  async execPython(code) {
    if (!this.pyReady || !this.pyodide) return "Python not ready.";
    if (!code) return "No Python code provided.";
    try { return await this.pyodide.runPythonAsync(code); } catch (e) { return "Python Error: " + e; }
  },

  async loadGithub(url) {
    this._log("Loading: " + url);
    try {
      let fetchUrl = url;
      if (fetchUrl.includes("github.com") && fetchUrl.includes("/blob/")) {
        fetchUrl = fetchUrl.replace("https://github.com/","https://raw.githubusercontent.com/").replace("/blob/","/");
      }
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(res.status + " " + res.statusText);
      const txt = await res.text();
      const fileName = url.split("/").pop();
      this.writeFile(fileName, txt);
      return `Loaded ${fileName}`;
    } catch(e) { return "GitHub load error: " + e; }
  },

  async handle(cmd, args) {
    args = args || [];
    switch(cmd) {
      case "ls": return Object.keys(this.fs).length ? Object.keys(this.fs).join("\n") : "(empty)";
      case "cat": return this.readFile(args[0]) || "File not found.";
      case "write": if (!args[0]) return "Usage: write <path> <content>"; this.writeFile(args[0], args.slice(1).join(" ")); return "Written.";
      case "rm": this.deleteFile(args[0]); return "Removed.";
      case "mkdir": if (!args[0]) return "Usage: mkdir <path>"; this.writeFile(args[0].replace(/\/?$/,"/"), "(dir)"); return "Directory created.";
      case "python": return await this.execPython(this.readFile(args[0]) || args.join(" "));
      case "node": return this.execJS(this.readFile(args[0]) || args.join(" "));
      case "run": { const script = this.readFile(args[0]); if (!script) return "No such script."; return this.execJS(script); }
      case "install": return await this.loadGithub(args[0]);
      default: return "Exec: Command not recognized.";
    }
  }
};
// Auto-init when scripts load
document.addEventListener("DOMContentLoaded", () => { Exec.init().catch(e=>console.error("Exec init failed",e)); });