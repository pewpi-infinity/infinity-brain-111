// Minimal Exec Engine - safe, small, and non-blocking
// Replaces a more complex engine to restore a working page quickly.

const Exec = {
  fs: {},

  init() {
    // Basic init that resolves immediately so the page can continue loading.
    return Promise.resolve("Exec initialized");
  },

  // Keep a readyPromise for other scripts to await
  readyPromise: null,

  // Minimal JS execution: run code in a Function sandbox
  execJS(code) {
    if (!code) return "No JS code provided.";
    try {
      // Use Function constructor to limit scope to this function.
      const fn = new Function("fs", code);
      const result = fn(this.fs);
      return typeof result === "undefined" ? "(done)" : String(result);
    } catch (e) {
      console.error("execJS error:", e);
      return "JS Error: " + e.message;
    }
  },

  // Stub for Python execution (not present) to avoid runtime failures
  async execPython() {
    return "Python not available in this build.";
  },

  // Minimal file helpers
  writeFile(path, content) {
    if (!path) return false;
    this.fs[path] = content === undefined ? "" : String(content);
    return true;
  },

  readFile(path) {
    return this.fs[path] ?? null;
  },

  deleteFile(path) {
    if (!path || !this.fs[path]) return false;
    delete this.fs[path];
    return true;
  },

  // Very small command handler for the UI
  async handle(cmd, args = []) {
    switch ((cmd || "").trim()) {
      case "ls":
        return Object.keys(this.fs).length ? Object.keys(this.fs).join("\n") : "(empty)";
      case "cat":
        return this.readFile(args[0]) || "File not found.";
      case "write":
        if (!args[0]) return "Usage: write <path> <content>";
        this.writeFile(args[0], args.slice(1).join(" "));
        return "Written.";
      case "rm":
        if (!args[0]) return "Usage: rm <path>";
        return this.deleteFile(args[0]) ? "Removed." : "File not found.";
      case "help":
        return "Commands: ls, cat <file>, write <path> <content>, rm <path>, run <file>";
      case "run": {
        const script = this.readFile(args[0]);
        if (!script) return "No such script.";
        return this.execJS(script);
      }
      default:
        return "Unknown command. Try 'help'";
    }
  }
};

// Wire up DOMContentLoaded to initialize Exec and expose readyPromise
document.addEventListener("DOMContentLoaded", () => {
  Exec.readyPromise = Exec.init();
  Exec.readyPromise.catch((e) => {
    console.error("Exec Init Error:", e);
  });
});

// Expose Exec globally for the page to use
window.Exec = Exec;