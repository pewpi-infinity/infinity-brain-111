document.addEventListener("DOMContentLoaded", () => {
  const drawer = document.getElementById("versionDrawer");
  const openBtn = document.getElementById("openViewer");
  const viewerArea = document.getElementById("viewerArea");
  const frame = document.getElementById("viewerFrame");

  openBtn.addEventListener("click", () => {
    const choice = drawer.value;
    if (!choice) return alert("Select a section to preview.");
    const map = {
      portal: "index.html",
      viewer: "http://127.0.0.1:5050", // Flask version viewer
      vault: "vault.html",
      rogers: "rogers_ai.html"
    };
    frame.src = map[choice] || "";
    viewerArea.classList.remove("hidden");
    window.scrollTo(0, document.body.scrollHeight);
  });
});

