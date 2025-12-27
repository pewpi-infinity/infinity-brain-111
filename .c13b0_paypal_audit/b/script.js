const tiles = document.querySelectorAll(".tile");
const modeTiles = document.querySelectorAll(".mode");
const modelTiles = document.querySelectorAll(".model");

const lastCmd = document.getElementById("lastCmd");
const activeMode = document.getElementById("activeMode");
const activeModel = document.getElementById("activeModel");

// --- Command sender ---
tiles.forEach(tile => {
  tile.addEventListener("click", () => {
    const cmd = tile.dataset.command;
    if (!cmd) return;

    localStorage.setItem("Q_Command", cmd);
    lastCmd.textContent = cmd;

    tile.classList.add("active");
    setTimeout(() => tile.classList.remove("active"), 300);
  });
});

// --- Mode toggles ---
modeTiles.forEach(tile => {
  tile.addEventListener("click", () => {
    modeTiles.forEach(t => t.classList.remove("active"));
    tile.classList.add("active");
    const mode = tile.dataset.mode;

    localStorage.setItem("Q_Mode", mode);
    activeMode.textContent = mode;
  });
});

// --- Model version selector ---
modelTiles.forEach(tile => {
  tile.addEventListener("click", () => {
    modelTiles.forEach(t => t.classList.remove("active"));
    tile.classList.add("active");
    const model = tile.dataset.model;

    localStorage.setItem("Q_Model", model);
    activeModel.textContent = model;
  });
});
