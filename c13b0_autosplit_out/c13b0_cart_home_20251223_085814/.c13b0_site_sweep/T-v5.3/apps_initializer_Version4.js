/* initializer: seeds default files on first run */
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Exec
  if (window.Exec && Exec.readyPromise) { try { await Exec.readyPromise; } catch(_){} }
  // hydrate FS from storage if available
  if (window.FSStorage) {
    const existing = FSStorage.load();
    if (existing && Object.keys(existing).length) { Exec.fs = Object.assign({}, existing); return; }
  }
  // seed example files
  Exec.writeFile("welcome.txt", "Welcome to Osprey Terminal v5.3\nTry: ls, cat welcome.txt, python print('hi')");
  Exec.writeFile("hello.js", 'console.log("hello from node-lite");');
  Exec.writeFile("scripts/start.sh", "echo starting");
});