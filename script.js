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
let wordLocations = new Map(); // Para almacenar la ubicación de las palabras en la cuadrícula
let isMouseDown = false;
let startCell = null;
let currentSelection = [];
let foundWords = new Set();


// =======================================================================
// ✔ 1. Inicializar Juego
// =======================================================================

function initializeGame() {
    selectedWords = getRandomWords(allFoodWords, NUM_WORDS);
    grid = createEmptyGrid(GRID_SIZE);
    wordLocations = new Map(); // Reiniciar mapa
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
        [0, 1], [0, -1], // Horizontal (Derecha, Izquierda)
        [1, 0], [-1, 0], // Vertical (Abajo, Arriba)
        [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonal
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

        // Comprobar límites de la cuadrícula
        if (newR < 0 || newR >= GRID_SIZE || newC < 0 || newC >= GRID_SIZE) {
            return false;
        }

        // Comprobar colisión
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
// (Sin cambios, ya que maneja bien el rendering)

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
// ⚡ 3. Selección por arrastre (Modificado para 8 direcciones)
// =======================================================================

function getCellFromCoordinates(x, y) {
    const el = document.elementFromPoint(x, y);
    return el && el.classList.contains('grid-cell') ? el : null;
}

function clearSelection() {
    currentSelection.forEach(c => c.classList.remove('selected'));
    currentSelection = [];
}

/**
 * Resalta la selección de celdas en línea recta desde startCell hasta endCell.
 * @param {HTMLElement} endCell - La celda actual del puntero.
 */
function highlightSelection(endCell) {
    if (!startCell || !endCell) return;

    const r1 = +startCell.dataset.row;
    const c1 = +startCell.dataset.col;
    const r2 = +endCell.dataset.row;
    const c2 = +endCell.dataset.col;

    const dr = r2 - r1;
    const dc = c2 - c1;

    // Calcular la dirección. Solo permitimos 8 direcciones (horizontal, vertical, diagonal).
    // Si la selección no es en línea recta, solo se resalta la celda inicial.

    const length = Math.max(Math.abs(dr), Math.abs(dc));
    if (length === 0) {
        clearSelection();
        startCell.classList.add('selected');
        currentSelection.push(startCell);
        return;
    }

    const abs_dr = Math.abs(dr);
    const abs_dc = Math.abs(dc);

    // Comprobar si es una dirección válida (horizontal, vertical o diagonal a 45 grados)
    if (abs_dr !== 0 && abs_dc !== 0 && abs_dr !== abs_dc) {
        // No es una línea recta válida
        clearSelection();
        startCell.classList.add('selected');
        currentSelection.push(startCell);
        return;
    }

    // Calcular el paso (dr_step y dc_step)
    const r_step = dr / length;
    const c_step = dc / length;
    
    if (r_step !== Math.round(r_step) || c_step !== Math.round(c_step)) {
         // Asegura que el paso es un número entero (necesario para la dirección)
         clearSelection();
         startCell.classList.add('selected');
         currentSelection.push(startCell);
         return;
    }


    clearSelection();
    
    // Recorrer las celdas en la dirección del arrastre
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
    // La comprobación de clase 'grid-cell' en e.target sigue siendo importante
    if (!e.target.classList.contains('grid-cell')) return;

    e.preventDefault();
    isMouseDown = true;
    startCell = e.target;

    clearSelection();
    startCell.classList.add('selected');
    currentSelection.push(startCell);

    // Eventos 'pointer' funcionan para mouse y táctil
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

function handlePointerMove(e) {
    if (!isMouseDown) return;

    // Obtiene coordenadas para mouse (clientX/Y) o táctil.
    const cell = getCellFromCoordinates(e.clientX, e.clientY);
    if (cell) highlightSelection(cell);
}

function handlePointerUp() {
    if (!isMouseDown) return;

    isMouseDown = false;

    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    if (currentSelection.length > 1) { // Solo si se ha seleccionado más de una celda
        const word = currentSelection.map(c => c.textContent).join('');
        const reversedWord = currentSelection.slice().reverse().map(c => c.textContent).join('');
        
        // Se comprueba la palabra en la dirección de la selección (word)
        // Y la palabra al revés (reversedWord)
        checkWord(word);
        checkWord(reversedWord);
    }

    clearSelection();
}


// =======================================================================
// ✔ 4. Validación (Ligeros ajustes)
// =======================================================================

function checkWord(word) {
    if (!selectedWords.includes(word) || foundWords.has(word)) return;

    // Obtener la ubicación de la palabra para mantenerla resaltada si se encuentra
    let wordFoundLocation = [];
    if (wordLocations.has(word)) {
        wordFoundLocation = wordLocations.get(word);
    } else {
        // Si la palabra está en la lista de seleccionadas, pero no en el mapa, 
        // significa que es la palabra al revés. Buscamos la ubicación de la palabra original
        // y la invertimos. Esto es solo una comprobación de seguridad.
        const reversed = word.split('').reverse().join('');
        if (wordLocations.has(reversed)) {
             wordFoundLocation = wordLocations.get(reversed).slice().reverse();
        }
    }

    // Resaltar las celdas encontradas (usando la ubicación almacenada)
    wordFoundLocation.forEach(({r, c}) => {
        const el = wordSearchGrid.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (el) {
            el.classList.remove('selected');
            el.classList.add('found');
        }
    });

    const li = wordListElement.querySelector(`li[data-word="${word}"]`);
    // Si la palabra encontrada es la palabra al revés, marcamos la palabra original en la lista
    const targetWord = selectedWords.find(w => w === word || w === word.split('').reverse().join(''));
    const liTarget = wordListElement.querySelector(`li[data-word="${targetWord}"]`);

    if (liTarget) {
        liTarget.classList.add('found-word');
        const box = liTarget.querySelector('.checkbox');
        box.classList.add('checked');
        box.innerHTML = '&#10003;';
        foundWords.add(targetWord);
    }
}


// =======================================================================
// ✔ 5. Iniciar Juego
// =======================================================================

newGameButton.addEventListener('click', initializeGame);
// 'pointerdown' maneja tanto el clic del ratón como el toque táctil.
wordSearchGrid.addEventListener('pointerdown', handlePointerDown);

initializeGame();
