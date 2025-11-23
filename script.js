const allFoodWords = [
    'PIZZA', 'PAELLA', 'SUSHI', 'TACOS', 'ENSALADA', 'SOPA', 'ARROZ', 'PASTA', 'POLLO', 'CARNE',
    'PESCADO', 'QUESO', 'LECHE', 'JUGO', 'VINO', 'CEBOLLA', 'AJO', 'VAINILLA', 'AZUCAR', 'HARINA',
    'HUEVOS', 'MANZANA', 'NARANJA', 'FRESAS', 'CHOCOLATE', 'GALLETAS', 'PANQUEQUE', 'TARTA', 'MANTECA', 'SALSA'
];

// --- Configuraciones del Juego ---
const GRID_SIZE = 16; 
const NUM_WORDS = 15; 

// --- Elementos del DOM ---
const wordSearchGrid = document.getElementById('wordSearchGrid');
const wordListElement = document.getElementById('wordList');
const newGameButton = document.getElementById('newGameButton');

// --- Variables de Estado ---
let selectedWords = [];
let grid = [];
let isMouseDown = false; // Usado para ratón y toque
let startCell = null;
let currentSelection = []; 
let foundWords = new Set(); 

// ----------------------------------------------------------------------
// ## 1. Inicialización y Generación de la Cuadrícula
// ----------------------------------------------------------------------

function initializeGame() {
    selectedWords = getRandomWords(allFoodWords, NUM_WORDS);
    grid = createEmptyGrid(GRID_SIZE);
    placeWordsInGrid(selectedWords, grid);
    fillEmptyCells(grid);
    renderGrid(grid);
    renderWordList(selectedWords);

    // Reiniciar estados
    isMouseDown = false;
    startCell = null;
    currentSelection = [];
    foundWords = new Set();
}

function getRandomWords(wordPool, count) {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
    // Selecciona 15 y las ordena alfabéticamente para la lista
    return shuffled.slice(0, count).sort(); 
}

function createEmptyGrid(size) {
    return Array(size).fill(0).map(() => Array(size).fill(''));
}

function placeWordsInGrid(words, grid) {
    words.forEach(word => {
        let placed = false;
        let attempts = 0;
        const maxAttempts = 100;

        while (!placed && attempts < maxAttempts) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            // El rango de columna inicial debe dejar espacio para la palabra (solo horizontal)
            const col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1)); 

            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
                // Verificar si choca con una letra diferente a la que queremos colocar
                if (grid[row][col + i] !== '' && grid[row][col + i] !== word[i]) {
                    canPlace = false;
                    break;
                }
            }

            if (canPlace) {
                for (let i = 0; i < word.length; i++) {
                    grid[row][col + i] = word[i];
                }
                placed = true;
            }
            attempts++;
        }
    });
}

function fillEmptyCells(grid) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
            }
        }
    }
}

// ----------------------------------------------------------------------
// ## 2. Renderizado de Interfaz
// ----------------------------------------------------------------------

function renderGrid(grid) {
    wordSearchGrid.innerHTML = '';
    wordSearchGrid.style.setProperty('--grid-cols', GRID_SIZE); 
    
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const div = document.createElement('div');
            div.classList.add('grid-cell');
            div.dataset.row = rowIndex;
            div.dataset.col = colIndex;
            div.textContent = cell;

            // --- Eventos del Ratón ---
            div.addEventListener('mousedown', handleMouseDown);
            div.addEventListener('mouseup', handleMouseUp);
            div.addEventListener('mouseenter', handleMouseEnter);

            // --- Eventos Táctiles (para móviles/tabletas) ---
            div.addEventListener('touchstart', handleTouchStart, { passive: true });
            div.addEventListener('touchmove', handleTouchMove, { passive: false });
            div.addEventListener('touchend', handleMouseUp); // touchend usa la misma lógica que mouseup

            wordSearchGrid.appendChild(div);
        });
    });
}

function renderWordList(words) {
    wordListElement.innerHTML = '';
    words.forEach(word => {
        const li = document.createElement('li');
        const checkbox = document.createElement('div');
        checkbox.classList.add('checkbox');
        checkbox.innerHTML = '&nbsp;'; 

        const wordText = document.createElement('span');
        wordText.textContent = word;

        li.appendChild(checkbox);
        li.appendChild(wordText);
        li.dataset.word = word; 
        wordListElement.appendChild(li);
    });
}

// ----------------------------------------------------------------------
// ## 3. Lógica de Interacción (Ratón y Táctil)
// ----------------------------------------------------------------------

function getCellFromCoordinates(x, y) {
    return document.elementFromPoint(x, y);
}

function clearSelection() {
    currentSelection.forEach(cell => cell.classList.remove('selected'));
    currentSelection = [];
    startCell = null;
}

function highlightSelection(targetCell) {
    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);

    // Solo Horizontal (misma fila y de izquierda a derecha)
    if (startRow === targetRow && targetCol >= startCol) {
        clearSelection(); 
        for (let i = startCol; i <= targetCol; i++) {
            const cell = wordSearchGrid.querySelector(`[data-row="${startRow}"][data-col="${i}"]`);
            if (cell) {
                cell.classList.add('selected');
                currentSelection.push(cell);
            }
        }
    } else {
        // Si la dirección no es válida, solo se marca la celda inicial
        clearSelection();
        startCell.classList.add('selected');
        currentSelection = [startCell];
    }
}

// --- Manejadores de Ratón ---

function handleMouseDown(e) {
    isMouseDown = true;
    startCell = e.target;
    clearSelection();
    e.target.classList.add('selected');
    currentSelection.push(e.target);
}

function handleMouseEnter(e) {
    if (!isMouseDown || !startCell) return;
    highlightSelection(e.target);
}

function handleMouseUp() {
    isMouseDown = false;
    if (currentSelection.length > 0) {
        const selectedWordText = currentSelection.map(cell => cell.textContent).join('');
        checkWord(selectedWordText);
    }
    clearSelection();
}

// --- Manejadores Táctiles (Solución para móviles) ---

function handleTouchStart(e) {
    //e.preventDefault(); // Descomentar si el scroll es un problema, pero puede interferir con la UX.
    
    const touch = e.touches[0];
    const targetCell = getCellFromCoordinates(touch.clientX, touch.clientY);
    
    if (targetCell && targetCell.classList.contains('grid-cell')) {
        isMouseDown = true; 
        startCell = targetCell;
        clearSelection();
        targetCell.classList.add('selected');
        currentSelection.push(targetCell);
    }
}

function handleTouchMove(e) {
    if (!isMouseDown || !startCell) return;
    e.preventDefault(); // Previene el scroll del navegador mientras se arrastra la selección.

    const touch = e.touches[0];
    const targetCell = getCellFromCoordinates(touch.clientX, touch.clientY);
    
    if (targetCell && targetCell.classList.contains('grid-cell')) {
        highlightSelection(targetCell);
    }
}


// ----------------------------------------------------------------------
// ## 4. Verificación y Marcado Automático
// ----------------------------------------------------------------------

function checkWord(word) {
    if (selectedWords.includes(word) && !foundWords.has(word)) {
        
        // 1. Marcado permanente en la cuadrícula (Color B: Verde)
        currentSelection.forEach(cell => {
            cell.classList.remove('selected'); 
            cell.classList.add('found'); 
        });

        // 2. Marcado automático en la lista (Checkbox con ✓)
        const listItem = wordListElement.querySelector(`li[data-word="${word}"]`);
        if (listItem) {
            listItem.classList.add('found-word');
            const checkbox = listItem.querySelector('.checkbox');
            checkbox.classList.add('checked');
            checkbox.innerHTML = '&#10003;'; // Símbolo de verificación (✓)
        }
        foundWords.add(word); 
    }
}

// ----------------------------------------------------------------------
// ## 5. Punto de Inicio
// ----------------------------------------------------------------------

newGameButton.addEventListener('click', initializeGame);

// Iniciar el juego la primera vez que se carga la página
initializeGame();
