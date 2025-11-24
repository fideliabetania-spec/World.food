// ===============================================================
// 🔥 AGREGADO: Evita zoom accidental con 2 dedos en móvil
// ===============================================================
document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });


// ==========================
// Tu código original empieza
// ==========================

const allFoodWords = [
    'PIZZA', 'PAELLA', 'SUSHI', 'TACOS', 'ENSALADA', 'SOPA', 'ARROZ', 'PASTA', 'POLLO', 'CARNE',
    'PESCADO', 'QUESO', 'LECHE', 'JUGO', 'VINO', 'CEBOLLA', 'AJO', 'VAINILLA', 'AZUCAR', 'HARINA',
    'HUEVOS', 'MANZANA', 'NARANJA', 'FRESAS', 'CHOCOLATE', 'GALLETAS', 'PANQUEQUE', 'TARTA', 'MANTECA', 'SALSA'
];

const GRID_SIZE = 16;
const NUM_WORDS = 15;

const wordSearchGrid = document.getElementById('wordSearchGrid');
const wordListElement = document.getElementById('wordList');
const newGameButton = document.getElementById('newGameButton');

let selectedWords = [];
let grid = [];
let isMouseDown = false;
let startCell = null;
let currentSelection = [];
let foundWords = new Set();

// ===============================================================
// Inicializar Juego
// ===============================================================

function initializeGame() {
    selectedWords = getRandomWords(allFoodWords, NUM_WORDS);
    grid = createEmptyGrid(GRID_SIZE);
    placeWordsInGrid(selectedWords, grid);
    fillEmptyCells(grid);
    renderGrid(grid);
    renderWordList(selectedWords);

    isMouseDown = false;
    startCell = null;
    currentSelection = [];
    foundWords = new Set();
}

function getRandomWords(pool, count) {
    return [...pool].sort(() => Math.random() - 0.5).slice(0, count).sort();
}

function createEmptyGrid(size) {
    return Array(size).fill(0).map(() => Array(size).fill(''));
}

function placeWordsInGrid(words, grid) {
    words.forEach(word => {
        let placed = false;
        let tries = 0;

        while (!placed && tries < 100) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * (GRID_SIZE - word.length));

            let ok = true;
            for (let i = 0; i < word.length; i++) {
                if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
                    ok = false;
                    break;
                }
            }

            if (ok) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }

            tries++;
        }
    });
}

function fillEmptyCells(grid) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
            }
        }
    }
}

function renderGrid(grid) {
    wordSearchGrid.innerHTML = '';
    wordSearchGrid.style.setProperty('--grid-cols', GRID_SIZE);

    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const div = document.createElement('div');
            div.classList.add('grid-cell');
            div.dataset.row = r;
            div.dataset.col = c;
            div.textContent = cell;
            wordSearchGrid.appendChild(div);
        });
    });
}

function renderWordList(words) {
    wordListElement.innerHTML = '';

    words.forEach(word => {
        const li = document.createElement('li');
        li.dataset.word = word;

        const box = document.createElement('div');
        box.classList.add('checkbox');

        const span = document.createElement('span');
        span.textContent = word;

        li.appendChild(box);
        li.appendChild(span);
        wordListElement.appendChild(li);
    });
}

function getCellFromCoordinates(x, y) {
    const el = document.elementFromPoint(x, y);
    return el && el.classList.contains('grid-cell') ? el : null;
}

function clearSelection() {
    currentSelection.forEach(c => c.classList.remove('selected'));
    currentSelection = [];
}

function highlightSelection(cell) {
    if (!startCell || !cell) return;

    const r1 = +startCell.dataset.row;
    const c1 = +startCell.dataset.col;
    const r2 = +cell.dataset.row;
    const c2 = +cell.dataset.col;

    clearSelection();

    if (r1 === r2 && c2 >= c1) {
        for (let c = c1; c <= c2; c++) {
            const el = wordSearchGrid.querySelector(`[data-row="${r1}"][data-col="${c}"]`);
            if (el) {
                el.classList.add('selected');
                currentSelection.push(el);
            }
        }
    } else {
        startCell.classList.add('selected');
        currentSelection.push(startCell);
    }
}

function handlePointerDown(e) {
    if (!e.target.classList.contains('grid-cell')) return;

    e.preventDefault();
    isMouseDown = true;
    startCell = e.target;

    clearSelection();
    startCell.classList.add('selected');
    currentSelection.push(startCell);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    if (!isMouseDown) return;

    const cell = getCellFromCoordinates(e.clientX, e.clientY);
    if (cell) highlightSelection(cell);
}

function handlePointerUp() {
    if (!isMouseDown) return;

    isMouseDown = false;

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    if (currentSelection.length) {
        const word = currentSelection.map(c => c.textContent).join('');
        checkWord(word);
    }

    clearSelection();
}

function checkWord(word) {
    if (!selectedWords.includes(word) || foundWords.has(word)) return;

    currentSelection.forEach(c => {
        c.classList.remove('selected');
        c.classList.add('found');
    });

    const li = wordListElement.querySelector(`li[data-word="${word}"]`);
    if (li) {
        li.classList.add('found-word');
        const box = li.querySelector('.checkbox');
        box.classList.add('checked');
        box.innerHTML = '&#10003;';
    }

    foundWords.add(word);
}

newGameButton.addEventListener('click', initializeGame);
wordSearchGrid.addEventListener('pointerdown', handlePointerDown);

initializeGame();


// ===============================================================
// 🔥 AGREGADO: evita scroll mientras arrastras la selección
// ===============================================================
wordSearchGrid.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });
