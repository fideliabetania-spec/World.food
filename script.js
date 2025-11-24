const palabras = ["PIZZA", "PASTA", "TACO", "SOPA", "ARROZ"];

let canvas = document.getElementById("sopa");
let ctx = canvas.getContext("2d");
let gridSize = 10;
let cellSize = 35;

canvas.width = gridSize * cellSize;
canvas.height = gridSize * cellSize;

let sopa = [];
let seleccion = [];
let juegoIniciado = false;

function generarSopa() {
    sopa = Array.from({ length: gridSize }, () => Array(gridSize).fill(""));

    palabras.forEach(p => {
        let placed = false;
        while (!placed) {
            let x = Math.floor(Math.random() * gridSize);
            let y = Math.floor(Math.random() * gridSize);
            let horizontal = Math.random() > 0.5;

            if (horizontal) {
                if (x + p.length <= gridSize) {
                    for (let i = 0; i < p.length; i++) sopa[y][x + i] = p[i];
                    placed = true;
                }
            } else {
                if (y + p.length <= gridSize) {
                    for (let i = 0; i < p.length; i++) sopa[y + i][x] = p[i];
                    placed = true;
                }
            }
        }
    });

    // letras aleatorias
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (sopa[y][x] === "") {
                sopa[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    dibujar();
}

function dibujar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.font = "26px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(sopa[y][x], x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
        }
    }
}

function actualizarLista() {
    const lista = document.getElementById("lista-palabras");
    lista.innerHTML = "";
    palabras.forEach(p => {
        let li = document.createElement("li");
        li.id = "w_" + p;
        li.textContent = p;
        lista.appendChild(li);
    });
}

canvas.addEventListener("mousedown", iniciarSeleccion);
canvas.addEventListener("touchstart", iniciarSeleccion);

function iniciarSeleccion(e) {
    seleccion = [];
}

canvas.addEventListener("mouseup", finalizar);
canvas.addEventListener("touchend", finalizar);

function finalizar() {
    let texto = seleccion.join("");
    palabras.forEach(p => {
        if (p === texto) {
            document.getElementById("w_" + p).classList.add("encontrada");
        }
    });
}

canvas.addEventListener("mousemove", mover);
canvas.addEventListener("touchmove", mover);

function mover(e) {
    if (!e.buttons && e.type === "mousemove") return;

    let rect = canvas.getBoundingClientRect();
    let x = Math.floor((e.clientX - rect.left) / cellSize);
    let y = Math.floor((e.clientY - rect.top) / cellSize);

    if (x >= 0 && y >= 0 && x < gridSize && y < gridSize) {
        let letra = sopa[y][x];
        if (!seleccion.includes(letra)) seleccion.push(letra);
    }
}

document.getElementById("btnStart").onclick = () => {
    document.getElementById("pantalla-inicio").style.display = "none";
    document.getElementById("juego").style.display = "block";
    generarSopa();
    actualizarLista();
};

document.getElementById("btnNuevo").onclick = () => {
    generarSopa();
    actualizarLista();
};
