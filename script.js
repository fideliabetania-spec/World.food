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
let wordLocations = new Map();
let isMouseDown = false;
let startCell = null;
let currentSelection = [];
let foundWords = new Set();

// Colores por palabra
const wordColors = {
    'PIZZA': 'red',
    'PAELLA': 'orange',
    'SUSHI': 'green',
    'TACOS': 'yellow',
    'ENSALADA': 'lime',
    'SOPA': 'teal',
    'ARROZ': 'blue',
    'PASTA': 'purple',
    'POLLO': 'pink',
    'CARNE': 'brown',
    'PESCADO': 'aqua',
    'QUESO': 'gold',
    'LECHE': 'lightblue',
    'JUGO': 'darkorange',
    'VINO': 'maroon',
    'CEBOLLA': 'violet',
    'AJO': 'silver',
    'VAINILLA': 'beige',
    'AZUCAR': 'plum',
    'HARINA': 'tan',
    'HUEVOS': 'khaki',
    'MANZANA': 'crimson',
    'NARANJA': 'darkorange',
    'FRESAS': 'deeppink',
    'CHOCOLATE': 'chocolate',
    'GALLETAS': 'saddlebrown',
    'PANQUEQUE': 'peru',
    'TARTA': 'coral',
    'MANTECA': 'lightyellow',
    'SALSA': 'firebrick'
};

// =======================================================================
// ✔ 1. Inicializar Juego
// =======================================================================

function initializeGame() {
    selectedWords = getRandomWords(allFoodWords, NUM_WORDS);
    grid = createEmptyGrid(GRID_SIZE);
    wordLocations = new Map();
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
    const directions = [
        [0, 1], [0, -1],
        [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    words.forEach(word => {
        let placed = false;
        let tries = 0;

        while (!placed && tries < 100) {
            const r = Math.floor(Math.random() * GRID_SIZE);
            const c = Math.floor(Math.random() * GRID_SIZE);
            const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];

            if (canPlaceWord(word, r, c, dr, dc, grid)) {
                const location = [];
                for (let i = 0; i < word.length; i++) {
                    const newR = r + i * dr;
                    const newC = c + i * dc;
                    grid[newR][newC] = word[i];
                    location.push({ r: newR, c: newC });
                }
                wordLocations.set(word, location);
                placed = true;
            }

            tries++;
        }
    });
}

function canPlaceWord(word, r, c, dr, dc, grid) {
    for (let i = 0; i < word.length; i++) {
        const newR = r + i * dr;
        const newC = c + i * dc;

        if (newR < 0 || newR >= GRID_SIZE || newC < 0 || newC >= GRID_SIZE) {
            return false;
        }

        if (grid[newR][newC] !== '' && grid[newR][newC] !== word[i]) {
            return false;
        }
    }
    return true;
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

// =======================================================================
// ✔ 2. Renderizar Cuadrícula
// =======================================================================

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

// =======================================================================
// ⚡ 3. Selección por arrastre
// =======================================================================

function getCellFromCoordinates(x, y) {
    const el = document.elementFromPoint(x, y);
    return el && el.classList.contains('grid-cell') ? el : null;
}

function clearSelection() {
    currentSelection.forEach(c => c.classList.remove('selected'));
    currentSelection = [];
}

function highlightSelection(endCell) {
    if (!startCell || !endCell) return;

    const r1 = +startCell.dataset.row;
    const c1 = +startCell.dataset.col;
    const r2 = +endCell.dataset.row;
    const c2 = +endCell.dataset.col;

    const dr = r2 - r1;
    const dc = c2 - c1;

    const length = Math.max(Math.abs(dr), Math.abs(dc));
    if (length === 0) {
        clearSelection();
        startCell.classList.add('selected');
        currentSelection.push(startCell);
        return;
    }

    const abs_dr = Math.abs(dr);
    const abs_dc = Math.abs(dc);

    if (abs_dr !== 0 && abs_dc !== 0 && abs_dr !== abs_dc) {
        clearSelection();
        startCell.classList.add('selected');
        currentSelection.push(startCell);
        return;
    }

    const r_step = dr / length;
    const c_step = dc / length;

    if (r_step !== Math.round(r_step) || c_step !== Math.round(c_step)) {
        clearSelection();
        startCell.classList.add('selected');
        currentSelection.push(startCell);
        return;
    }

    clearSelection();

    for (let i = 0; i <= length; i++) {
        const r = r1 + i * r_step;
        const c = c1 + i * c_step;

        const el = wordSearchGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (el) {
            el.classList.add('selected');
            currentSelection.push(el);
        }
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

    if (currentSelection.length > 1) {
        const word = currentSelection.map(c => c.textContent).join('');
        const reversedWord = currentSelection.slice().reverse().map(c => c.textContent).join('');
        checkWord(word);
        checkWord(reversedWord);
    }

    clearSelection();
}

// =======================================================================
// ✔ 4. Validación con color por palabra
// =======================================================================

function checkWord(word) {
    if (!selectedWords.includes(word) || foundWords.has(word)) return;

    let wordFoundLocation = [];
    if (wordLocations.has(word)) {
        wordFoundLocation = wordLocations.get(word);
    } else {
        const reversed = word.split('').reverse().join('');
        if (wordLocations.has(reversed)) {
            wordFoundLocation = wordLocations.get(reversed).slice().reverse();
        }
    }

    const color = wordColors[word] || 'black';

    wordFoundLocation.forEach(({r, c}) => {
        const el = wordSearchGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (el) {
            el.classList.remove('selected');
            el.classList.add('found');
            el.style.color = color;
        }
    });

    const targetWord = selectedWords.find(w => w === word || w === word.split('').reverse().join(''));
    const liTarget = wordListElement.querySelector(`li[data-word="${targetWord}"]`);

    if (liTarget) {
        liTarget.classList.add('found-word');
        const box = liTarget.querySelector('.checkbox');
        box.classList.add('checked');
        box.innerHTML = '&#10003;';
        const span = liTarget.querySelector('span');
        span.style.color = color;

        foundWords.add(targetWord);
    }
}

// =======================================================================
// ✔ 5. Iniciar Juego
// =======================================================================

newGameButton.addEventListener('click', initializeGame);
wordSearchGrid.addEventListener('pointerdown', handlePointerDown);

initializeGame();
