let primerInicio = true;

const btnInicio = document.getElementById("btnInicio");
const inicio = document.getElementById("inicio");
const juego = document.getElementById("juego");
const grid = document.getElementById("grid");
const lista = document.getElementById("lista");
const btnNueva = document.getElementById("btnNueva");

const palabras = "ARROZ", "SUSHI", "CARNE", "GALLETAS", "ENSALADA", "PIZZA", "PASTA", "TACOS", "BURGER", "HELADO"

let seleccionando = false;

function generarJuego() {
    grid.innerHTML = "";
    lista.innerHTML = "";

    palabras.forEach(p => {
        let li = document.createElement("li");
        li.id = "pal_" + p;
        li.innerHTML = p;
        lista.appendChild(li);
    });

    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 144; i++) {
        let div = document.createElement("div");
        div.classList.add("celda");
        div.textContent = letras[Math.floor(Math.random() * letras.length)];

        // EVENTOS PARA CELULAR / TABLET
        div.addEventListener("touchstart", seleccionar);
        div.addEventListener("touchmove", arrastrar);
        div.addEventListener("mousedown", seleccionar);

        grid.appendChild(div);
    }

    // FINALIZAR SELECCIÓN
    document.addEventListener("mouseup", () => seleccionando = false);
    document.addEventListener("touchend", () => seleccionando = false);
}

function seleccionar(e) {
    e.preventDefault();
    seleccionando = true;

    const celda = e.target;
    celda.classList.add("seleccionada");
}

function arrastrar(e) {
    if (!seleccionando) return;

    e.preventDefault();
    const toque = e.touches[0];
    const elem = document.elementFromPoint(toque.clientX, toque.clientY);

    if (elem && elem.classList.contains("celda")) {
        elem.classList.add("seleccionada");
    }
}

btnInicio.onclick = () => {
    inicio.classList.add("oculto");
    juego.classList.remove("oculto");

    if (!primerInicio) {
        btnInicio.textContent = "Nueva partida";
    }
    primerInicio = false;

    generarJuego();
};

btnNueva.onclick = () => {
    generarJuego();
};
