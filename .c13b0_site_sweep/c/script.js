const orb = document.getElementById("orb");
const panel = document.getElementById("orbPanel");
const createBtn = document.getElementById("createBtn");
const closeBtn = document.getElementById("closePanel");
const userButtons = document.getElementById("userButtons");
const nameBox = document.getElementById("btnName");
const cmdBox = document.getElementById("btnCmd");

orb.addEventListener("click", () => {
  panel.classList.add("open");
});

closeBtn.addEventListener("click", () => {
  panel.classList.remove("open");
});

function loadButtons() {
  const saved = JSON.parse(localStorage.getItem("Q_UserButtons") || "[]");
  saved.forEach(btn => addButton(btn.name, btn.cmd));
}

function saveButton(name, cmd) {
  const saved = JSON.parse(localStorage.getItem("Q_UserButtons") || "[]");
  saved.push({name, cmd});
  localStorage.setItem("Q_UserButtons", JSON.stringify(saved));
}

function addButton(name, cmd) {
  const tile = document.createElement("div");
  tile.className = "userTile";
  tile.textContent = name;
  tile.onclick = () => {
    localStorage.setItem("Q_Command", cmd);
  };
  userButtons.appendChild(tile);
}

createBtn.addEventListener("click", () => {
  const n = nameBox.value.trim();
  const c = cmdBox.value.trim();
  if (!n || !c) return;

  addButton(n, c);
  saveButton(n, c);

  nameBox.value = "";
  cmdBox.value = "";
  panel.classList.remove("open");
});

loadButtons();
