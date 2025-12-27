/* Minimal in-browser editor bound to Exec */
document.addEventListener("DOMContentLoaded", () => {
  // open editor via "edit <file>"
  const openEditor = async (file) => {
    const existing = Exec.readFile(file) || "";
    const w = window.open("", "_blank", "width=600,height=600");
    if (!w) return alert("Popup blocked. Use edit in same window.");
    w.document.write(`<body style="background:#000;color:#0ff;font-family:monospace"><h3>Edit: ${file}</h3><textarea id="tx" style="width:98%;height:80vh;background:#000;color:#0ff">${existing}</textarea><br><button id='save'>Save</button></body>`);
    w.document.getElementById("save").addEventListener("click", () => {
      const content = w.document.getElementById("tx").value;
      Exec.writeFile(file, content);
      w.close();
    });
  };

  // add "edit" command to Exec
  if (window.Exec) {
    const old = Exec.handle;
    Exec.handle = async function(cmd,args){
      if (cmd === "edit") { if (!args[0]) return "Usage: edit <file>"; openEditor(args[0]); return "Editor opened."; }
      return await old.call(this, cmd, args);
    };
  }
});