const btn = document.getElementById("btnStart");
const grid = document.getElementById("grid");

// Detectar si ya jugó antes
let firstPlay = !localStorage.getItem("playedBefore");
btn.textContent = firstPlay ? "Comenzar" : "Nueva partida";

btn.addEventListener("click", () => {
  localStorage.setItem("playedBefore", "true");
  btn.textContent = "Nueva partida";
  startGame();
});

function startGame() {
  grid.innerHTML = "";
  const letters = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = letters[Math.floor(Math.random() * letters.length)];
    grid.appendChild(cell);
  }
}


