/* Debugger: show global errors in the terminal and status */
window.addEventListener("error", function(e){
  try {
    const out = document.getElementById("output");
    if (out) out.innerHTML += "[error] " + (e && e.error ? (e.error.stack || e.error.message) : e.message) + "\n";
    const status = document.getElementById("status");
    if (status) status.innerText = "Error: " + (e && e.message ? e.message : "unknown");
  } catch(_) {}
});
window.addEventListener("unhandledrejection", function(ev){
  try {
    const out = document.getElementById("output");
    if (out) out.innerHTML += "[promise rejection] " + (ev.reason && ev.reason.stack ? ev.reason.stack : ev.reason) + "\n";
    const status = document.getElementById("status");
    if (status) status.innerText = "Promise rejection";
  } catch(_) {}
});