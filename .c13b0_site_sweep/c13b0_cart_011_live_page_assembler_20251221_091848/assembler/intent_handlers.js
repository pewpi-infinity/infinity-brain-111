import { registry } from "./registry.js";

export function handleIntent(intent) {
  const { action, target } = intent;

  if (action === "add" && registry[target]) {
    return registry[target]();
  }

  return null;
}
