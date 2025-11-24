// Evitar copiar
document.addEventListener('copy', (e) => e.preventDefault());

// Entrar al juego
document.getElementById("btnStart").addEventListener("click", function () {
    document.getElementById("inicio").classList.add("oculto");
    document.getElementById("juego").classList.remove("oculto");
});
