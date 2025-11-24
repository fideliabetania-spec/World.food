const allFoodWords = [
    'PIZZA','PAELLA','SUSHI','TACOS','ENSALADA','SOPA','ARROZ','PASTA','POLLO','CARNE',
    'PESCADO','QUESO','LECHE','JUGO','VINO','CEBOLLA','AJO','VAINILLA','AZUCAR','HARINA',
    'HUEVOS','MANZANA','NARANJA','FRESAS','CHOCOLATE','GALLETAS','PANQUEQUE','TARTA','MANTECA','SALSA'
];

const GRID_SIZE = 16;
const NUM_WORDS = 15;

const wordSearchGrid = document.getElementById("wordSearchGrid");
const wordListElement = document.getElementById("wordList");
const newGameButton = document.getElementById("newGameButton");

let selectedWords = [];
let grid = [];
let isDown = false;
let startCell = null;
let currentSelection = [];
let foundWords = new Set();

function initializeGame() {
    selectedWords = shuffle(allFoodWords).slice(0, NUM_WORDS);
    grid = createGrid(GRID_SIZE);
    placeWords(selectedWords, grid);
    fillGrid(grid);
    renderGrid(grid);
    renderWordList(selectedWords);

    foundWords.clear();
    startCell = null;
    currentSelection = [];
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function createGrid(size) {
    return Array(size).fill(0).map(() => Array(size).fill(''));
}

function placeWords(words, grid) {
    words.forEach(word => {
        let placed = false;
        while (!placed) {
            let row = Math.floor(Math.random() * GRID_SIZE);
            let col = Math.floor(Math.random() * (GRID_SIZE - word.length));

            let ok = true;
            for (let i = 0; i < word.length; i++) {
                if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
                    ok = false; break;
                }
            }

            if (ok) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }
        }
    });
}

function fillGrid(grid) {
    const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = ABC[Math.floor(Math.random() * ABC.length)];
            }
        }
    }
}

function renderGrid(grid) {
    wordSearchGrid.innerHTML = "";
    wordSearchGrid.style.setProperty("--grid-cols", GRID_SIZE);

    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            let div = document.createElement("div");
            div.className = "grid-cell";
            div.dataset.row = r;
            div.dataset.col = c;
            div.textContent = cell;
            wordSearchGrid.appendChild(div);
        });
    });
}

function renderWordList(words) {
    wordListElement.innerHTML = "";
    words.forEach(word => {
        let li = document.createElement("li");
        li.dataset.word = word;

        let box = document.createElement("div");
        box.className = "checkbox";

        let text = document.createElement("span");
        text.textContent = word;

        li.appendChild(box);
        li.appendChild(text);
        wordListElement.appendChild(li);
    });
}

/* --- SELECCIÓN TÁCTIL Y MOUSE --- */

wordSearchGrid.addEventListener("pointerdown", e => {
    if (!e.target.classList.contains("grid-cell")) return;
    e.preventDefault();

    isDown = true;
    startCell = e.target;

    clearSelection();
    startCell.classList.add("selected");
    currentSelection.push(startCell);
});

document.addEventListener("pointermove", e => {
    if (!isDown) return;

    let cell = document.elementFromPoint(e.clientX, e.clientY);
    if (cell && cell.classList.contains("grid-cell")) {
        highlightSelection(cell);
    }
});

document.addEventListener("pointerup", () => {
    if (!isDown) return;

    isDown = false;

    let text = currentSelection.map(c => c.textContent).join("");

    checkWord(text);

    clearSelection();
});

function clearSelection() {
    currentSelection.forEach(c => c.classList.remove("selected"));
    currentSelection = [];
}

function highlightSelection(endCell) {
    let r1 = +startCell.dataset.row;
    let c1 = +startCell.dataset.col;
    let r2 = +endCell.dataset.row;
    let c2 = +endCell.dataset.col;

    if (r1 !== r2 || c2 < c1) return;

    clearSelection();

    for (let c = c1; c <= c2; c++) {
        let cell = document.querySelector(`[data-row="${r1}"][data-col="${c}"]`);
        cell.classList.add("selected");
        currentSelection.push(cell);
    }
}

function checkWord(word) {
    if (selectedWords.includes(word) && !foundWords.has(word)) {
        foundWords.add(word);

        currentSelection.forEach(c => {
            c.classList.remove("selected");
            c.classList.add("found");
        });

        let li = document.querySelector(`li[data-word="${word}"]`);
        li.classList.add("found-word");
        li.querySelector(".checkbox").classList.add("checked");
        li.querySelector(".checkbox").innerHTML = "✓";
    }
}

newGameButton.addEventListener("click", initializeGame);
initializeGame();
