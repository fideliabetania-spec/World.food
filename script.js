const btn = document.getElementById("btnStart");
const grid = document.getElementById("grid");

// Detectar si ya jugó antes
let firstPlay = !localStorage.getItem("playedBefore");
btn.textContent = firstPlay ? "Comenzar" : "Nueva partida";

const palabras = ["PAN", "ARROZ", "UVA", "LECHE", "CARNE"]; 
const gridSize = 10;

let isSelecting = false;
let selectedCells = [];
let matrizGlobal = [];

btn.addEventListener("click", () => {
  localStorage.setItem("playedBefore", "true");
  btn.textContent = "Nueva partida";
  startGame();
});

function startGame() {
  grid.innerHTML = "";

  let matriz = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill("")
  );

  // Insertar palabras horizontalmente
  palabras.forEach(pal => {
    let fila = Math.floor(Math.random() * gridSize);
    let maxInicio = gridSize - pal.length;
    let col = Math.floor(Math.random() * (maxInicio + 1));

    for (let i = 0; i < pal.length; i++) {
      matriz[fila][col + i] = pal[i];
    }
  });

  // Llenar espacios restantes
  const letras = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

  for (let f = 0; f < gridSize; f++) {
    for (let c = 0; c < gridSize; c++) {
      if (matriz[f][c] === "") {
        matriz[f][c] = letras[Math.floor(Math.random() * letras.length)];
      }
    }
  }

  matrizGlobal = matriz;

  // Dibujar el tablero
  for (let f = 0; f < gridSize; f++) {
    for (let c = 0; c < gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = f;
      cell.dataset.col = c;
      cell.textContent = matriz[f][c];

      // PC
      cell.addEventListener("mousedown", startSelect);
      cell.addEventListener("mouseover", dragSelect);
      document.addEventListener("mouseup", endSelect);

      // Móvil
      cell.addEventListener("touchstart", startSelect);
      cell.addEventListener("touchmove", dragTouch);
      document.addEventListener("touchend", endSelect);

      grid.appendChild(cell);
    }
  }
}

// Inicio selección
function startSelect(e) {
  e.preventDefault();
  isSelecting = true;
  selectedCells = [];
  markCell(e.target);
}

// Selección con mouse en PC
function dragSelect(e) {
  if (!isSelecting) return;
  markCell(e.target);
}

// Selección con dedo en móvil
function dragTouch(e) {
  e.preventDefault();
  let touch = e.touches[0];
  let element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains("cell")) {
    markCell(element);
  }
}

// Marcar visualmente
function markCell(cell) {
  if (!cell.classList.contains("cell")) return;
  if (!selectedCells.includes(cell)) {
    selectedCells.push(cell);
    cell.classList.add("selected");
  }
}

// Soltar selección
function endSelect() {
  if (!isSelecting) return;
  isSelecting = false;

  let palabraFormada = selectedCells.map(c => c.textContent).join("");

  // Verificar si es una palabra válida
  if (palabras.includes(palabraFormada)) {
    selectedCells.forEach(c => (c.style.background = "lightgreen"));
  } else {
    selectedCells.forEach(c => c.classList.remove("selected"));
  }

  selectedCells = [];
}
