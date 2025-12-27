export const registry = {
  chat: () => {
    const div = document.createElement("div");
    div.textContent = "💬 Chat block (placeholder)";
    div.style.padding = "12px";
    div.style.border = "1px solid #30363d";
    div.style.marginTop = "10px";
    return div;
  },
  feed: () => {
    const div = document.createElement("div");
    div.textContent = "📰 Feed block (placeholder)";
    div.style.padding = "12px";
    div.style.border = "1px dashed #30363d";
    div.style.marginTop = "10px";
    return div;
  }
};
