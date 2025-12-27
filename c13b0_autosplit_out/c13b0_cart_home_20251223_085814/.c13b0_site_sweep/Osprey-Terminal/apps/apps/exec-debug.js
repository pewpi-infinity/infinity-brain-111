/* Exec debug helper — prints initialization status visibly to #output and #status
   Add this file and reload the page (use a private/incognito tab to avoid cache).
*/
(function () {
  function setStatus(text) {
    try {
      const s = document.getElementById("status");
      if (s) s.innerText = text;
    } catch(_) {}
  }
  function dbgPrint(text) {
    try {
      const out = document.getElementById("output");
      if (out) out.innerHTML += text + "\n";
    } catch(_) {}
    // also update small status for quick glance
    setStatus(text.split("\n")[0] || text);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    dbgPrint("[debug] DOMContentLoaded");

    // Small delay to allow other <script>s executed before this to run
    await new Promise(r => setTimeout(r, 200));

    try {
      dbgPrint("[debug] Checking globals...");
      dbgPrint("  window.Rogers: " + (typeof window.Rogers !== "undefined"));
      dbgPrint("  window.IntelligenceCore: " + (typeof window.IntelligenceCore !== "undefined"));
      dbgPrint("  window.Exec: " + (typeof window.Exec !== "undefined"));
      dbgPrint("  loadPyodide available: " + (typeof loadPyodide === "function"));

      // If Exec exists, check its readyPromise
      if (window.Exec) {
        dbgPrint("[debug] Exec object found. Checking state...");
        dbgPrint("  Exec.ready: " + !!Exec.ready);
        dbgPrint("  Exec.pyReady: " + !!Exec.pyReady);

        if (Exec.readyPromise) {
          dbgPrint("[debug] Waiting for Exec.readyPromise to settle (timeout 30s)...");
          let settled = false;
          const timer = new Promise(r => setTimeout(() => r("timeout"), 30000));
          const result = await Promise.race([Exec.readyPromise.then(() => "ok").catch(e => "err:" + e), timer]);
          settled = result === "ok";
          dbgPrint("[debug] Exec.readyPromise result: " + result);
          dbgPrint("  Exec.ready after wait: " + !!Exec.ready);
        } else {
          dbgPrint("[debug] Exec.readyPromise not found.");
        }
      } else {
        dbgPrint("[debug] Exec not found — exec-engine.js may not have loaded or had an error during parse.");
      }

      // Try a tiny fetch to confirm files are reachable (apps/exec-engine.js)
      try {
        const resp = await fetch("apps/exec-engine.js", {cache: "no-store"});
        dbgPrint("[debug] fetch apps/exec-engine.js: " + resp.status + " " + resp.statusText);
        const text = await resp.text();
        dbgPrint("[debug] apps/exec-engine.js length: " + (text ? text.length : 0));
      } catch (fe) {
        dbgPrint("[debug] fetch error for apps/exec-engine.js: " + fe);
      }

      // show final top-level guidance 
      dbgPrint("[debug] If page still shows only one line:");
      dbgPrint("  • Open the repo file URLs in your phone to confirm the files were deployed.");
      dbgPrint("  • Use a private/incognito tab to avoid cached scripts.");
      dbgPrint("  • If pyodide is slow, wait up to 60s on mobile — you'll see a 'Python engine ready.' message when done.");
      setStatus("debug done. See terminal output for details.");
    } catch (err) {
      dbgPrint("[debug] Uncaught error: " + (err && err.stack ? err.stack : err));
      setStatus("debug error (see output)");
    }
  });
})();