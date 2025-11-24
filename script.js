let primerInicio = true;

const btnInicio = document.getElementById("btnInicio");
const inicio = document.getElementById("inicio");
const juego = document.getElementById("juego");
const grid = document.getElementById("grid");
const lista = document.getElementById("lista");
const btnNueva = document.getElementById("btnNueva");

const palabras = ["ARROZ", "SUSHI", "CARNE", "GALLETAS", "ENSALADA"];

function generarJuego() {
    grid.innerHTML = "";
    lista.innerHTML = "";

    // Generar lista de palabras con casilla ✓
    palabras.forEach(p => {
        let li = document.createElement("li");
        li.id = "pal_" + p;
        li.innerHTML = p;
        lista.appendChild(li);
    });

    // Generar letras random
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 144; i++) {
        let div = document.createElement("div");
        div.classList.add("celda");
        div.textContent = letras[Math.floor(Math.random() * letras.length)];
        grid.appendChild(div);
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
