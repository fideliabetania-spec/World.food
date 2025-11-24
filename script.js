let boardElement = document.getElementById("board");
let wordsListElement = document.getElementById("wordsList");
let startBtn = document.getElementById("startBtn");

let firstTime = true;

const words = ["ARROZ", "CARNE", "SUSHI", "ENSALADA", "GALLETAS", "CHOCOLATE"];

let board = [];
let selectedCells = [];
let selectedWord = "";

function createEmptyBoard() {
    board = [];
    for (let i = 0; i < 10; i++) {
        let row = [];
        for (let j = 0; j < 10; j++) {
            row.push("");
        }
        board.push(row);
    }
}

function fillRandomLetters() {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            if (board[i][j] === "") {
                board[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }
}

function placeWords() {
    words.forEach(word => {
        let placed = false;
        while (!placed) {
            let row = Math.floor(Math.random() * 10);
            let col = Math.floor(Math.random() * (10 - word.length));

            let fits = true;
            for (let i = 0; i < word.length; i++) {
                if (board[row][col + i] !== "" &&
                    board[row][col + i] !== word[i]) {
                    fits = false;
                }
            }

            if (fits) {
                for (let i = 0; i < word.length; i++) {
                    board[row][col + i] = word[i];
                }
                placed = true;
            }
        }
    });
}

function drawBoard() {
    boardElement.innerHTML = "";
    boardElement.style.gridTemplateColumns = "repeat(10, 35px)";

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            let div = document.createElement("div");
            div.classList.add("cell");
            div.textContent = board[i][j];
            div.dataset.row = i;
            div.dataset.col = j;

            div.addEventListener("mousedown", startSelection);
            div.addEventListener("touchstart", startSelection);

            div.addEventListener("mouseover", continueSelection);
            div.addEventListener("touchmove", continueSelection);

            div.addEventListener("mouseup", endSelection);
            div.addEventListener("touchend", endSelection);

            boardElement.appendChild(div);
        }
    }
}

function drawWords() {
    wordsListElement.innerHTML = "<h3>Palabras a Encontrar:</h3>";

    words.forEach(word => {
        let div = document.createElement("div");
        div.classList.add("word-item");
        div.innerHTML = `<span class="check-box" id="check-${word}"></span> ${word}`;
        wordsListElement.appendChild(div);
    });
}

function startSelection(e) {
    e.preventDefault();
    selectedCells = [];
    selectedWord = "";
    selectCell(e);
}

function continueSelection(e) {
    e.preventDefault();
    selectCell(e);
}

function selectCell(e) {
    let touch = e.touches ? e.touches[0] : e;
    let target = document.elementFromPoint(touch.clientX, touch.clientY);

    if (!target || !target.classList.contains("cell")) return;

    if (!selectedCells.includes(target)) {
        target.classList.add("selected");
        selectedCells.push(target);
        selectedWord += target.textContent;
    }
}

function endSelection() {
    if (words.includes(selectedWord)) {
        selectedCells.forEach(c => c.classList.remove("selected"));
        selectedCells.forEach(c => c.classList.add("found"));

        document.getElementById("check-" + selectedWord).textContent = "✓";
    } else {
        selectedCells.forEach(c => c.classList.remove("selected"));
    }

    selectedCells = [];
    selectedWord = "";
}

function newGame() {
    createEmptyBoard();
    placeWords();
    fillRandomLetters();
    drawBoard();
    drawWords();
}

startBtn.addEventListener("click", () => {
    newGame();
    startBtn.textContent = firstTime ? "Nueva Partida" : "Nueva Partida";
    firstTime = false;
});
