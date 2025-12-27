import { handleIntent } from "./intent_handlers.js";

export function assemble(intent) {
  const block = handleIntent(intent);
  if (!block) return;

  const root = document.getElementById("c13b0-root");
  if (!root) return;

  root.appendChild(block);
}
