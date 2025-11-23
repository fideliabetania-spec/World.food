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

// ----------------------------------------------------------------------
// ## 1. Inicialización y Generación
// ----------------------------------------------------------------------

function initializeGame() {
    selectedWords = getRandomWords(allFoodWords, NUM_WORDS);
    grid = createEmptyGrid(GRID_SIZE);
    placeWordsInGrid(selectedWords, grid);
    fillEmptyCells(grid);
    renderGrid(grid);
    renderWordList(selectedWords);

    // Reset de estado
    isMouseDown = false;
    startCell = null;
    currentSelection = [];
    foundWords = new Set();
}

function getRandomWords(wordPool, count) {
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random());
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
            const col = Math.floor(Math.random() * (GRID_SIZE - word.length + 1)); 

            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
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
// ## 2. Renderizado y Adjuntar Eventos
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

            // Eventos del Ratón
            div.addEventListener('mousedown', handleMouseDown);
            div.addEventListener('mouseup', handleMouseUp);
            div.addEventListener('mouseenter', handleMouseEnter);

            // Eventos Táctiles (para móviles/tabletas)
            div.addEventListener('touchstart', handleTouchStart, { passive: true });
            div.addEventListener('touchmove', handleTouchMove, { passive: false });
            div.addEventListener('touchend', handleMouseUp); 

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
// ## 3. Lógica de Selección (El núcleo de la corrección)
// ----------------------------------------------------------------------

// Función auxiliar para obtener la celda bajo el punto de toque
function getCellFromCoordinates(x, y) {
    return document.elementFromPoint(x, y);
}

function clearSelection() {
    // 1. Limpia el marcado visual temporal de todas las celdas previamente seleccionadas
    currentSelection.forEach(cell => cell.classList.remove('selected'));
    // 2. Limpia el array de selección
    currentSelection = [];
    // 3. Resetea la celda inicial
    startCell = null;
}

// Función principal que marca la selección temporal y aplica la restricción horizontal
function highlightSelection(targetCell) {
    // Si no hay celda inicial o la celda de destino no es válida, no hacemos nada
    if (!startCell || !targetCell || !targetCell.classList.contains('grid-cell')) return;

    const startRow =
