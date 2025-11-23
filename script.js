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

            // Eventos del Ratón: Solo mousedown y mouseenter en las celdas
            div.addEventListener('mousedown', handleMouseDown);
            div.addEventListener('mouseenter', handleMouseEnter);

            // Eventos Táctiles
            div.addEventListener('touchstart', handleTouchStart, { passive: true });
            div.addEventListener('touchmove', handleTouchMove, { passive: false });
            
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
// ## 3. Lógica de Selección y Arrastre (El FIX)
// ----------------------------------------------------------------------

function getCellFromCoordinates(x, y) {
    // Usa un método más robusto para encontrar el elemento bajo el punto
    const element = document.elementFromPoint(x, y);
    return element && element.classList.contains('grid-cell') ? element : null;
}

function clearSelection() {
    currentSelection.forEach(cell => cell.classList.remove('selected'));
    currentSelection = [];
    startCell = null;
}

function highlightSelection(targetCell) {
    if (!startCell || !targetCell) return;

    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const targetRow = parseInt(targetCell.dataset.row);
    const targetCol = parseInt(targetCell.dataset.col);

    // RESTRIICIÓN: Solo Horizontal de Izquierda a Derecha
    if (startRow === targetRow && targetCol >= startCol) {
        // Limpiamos la selección anterior antes de crear la nueva
        currentSelection.forEach(cell => cell.classList.remove('selected'));
        currentSelection = [];
        
        // Iteramos desde la columna inicial hasta la columna final
        for (let i = startCol; i <= targetCol; i++) {
            const cell = wordSearchGrid.querySelector(`[data-row="${startRow}"][data-col="${i}"]`);
            if (cell) {
                cell.classList.add('selected');
                currentSelection.push(cell);
            }
        }
    } else {
        // Si no es una selección válida, solo se marca la celda de inicio
        currentSelection.forEach(cell => cell.classList.remove('selected'));
        currentSelection = [startCell];
        startCell.classList.add('selected');
    }
}

// ----------------------------------------------------------------------
// ## 4. Manejadores de Eventos (Fix Global)
// ----------------------------------------------------------------------

// --- Manejadores de Ratón ---

function handleMouseDown(e) {
    // Aseguramos que solo reaccione al botón primario (izquierdo)
    if (e.button !== 0) return; 
    
    isMouseDown = true;
    startCell = e.target;
    // Limpiamos la selección previa ANTES de iniciar la nueva
    clearSelection();
    
    startCell.classList.add('selected');
    currentSelection.push(startCell);
}

function handleMouseEnter(e) {
    // Solo actualiza el marcado si el clic está presionado
    if (!isMouseDown) return; 
    
    highlightSelection(e.target);
}

// FUNCIÓN FIX: Escucha el movimiento en todo el documento para arrastres rápidos
function handleGlobalMouseMove(e) {
    if (!isMouseDown) return;

    // Obtenemos la celda debajo del cursor (puede ser null si está fuera de la cuadrícula)
    const targetCell = getCellFromCoordinates(e.clientX, e.clientY);
    
    if (targetCell) {
        highlightSelection(targetCell);
    } 
    // Si targetCell es null, la selección anterior se mantiene visible.
}

// FUNCIÓN FIX: Se dispara al soltar el clic/dedo en CUALQUIER PARTE del documento
function handleMouseUp() {
    if (!isMouseDown) return;

    isMouseDown = false;
    
    if (currentSelection.length > 0) {
        const selectedWordText = currentSelection.map(cell => cell.textContent).join('');
        checkWord(selectedWordText);
    }
    
    // Al finalizar la verificación, la selección temporal se limpia.
    clearSelection(); 
}

// --- Manejadores Táctiles ---

function handleTouchStart(e) {
    const touch = e.touches[0];
    const targetCell = getCellFromCoordinates(touch.clientX, touch.clientY);
    
    if (targetCell) {
        isMouseDown = true; 
        startCell = targetCell;
        clearSelection();
        targetCell.classList.add('selected');
        currentSelection.push(targetCell);
    }
}

function handleTouchMove(e) {
    if (!isMouseDown) return;
    e.preventDefault(); // Bloquea el scroll del móvil

    const touch = e.touches[0];
    const targetCell = getCellFromCoordinates(touch.clientX, touch.clientY);
    
    if (targetCell) {
        highlightSelection(targetCell);
    }
}


// ----------------------------------------------------------------------
// ## 5. Verificación y Marcado Automático
// ----------------------------------------------------------------------

function checkWord(word) {
    if (selectedWords.includes(word) && !foundWords.has(word)) {
        
        // Marcado permanente en la cuadrícula (Color B: Verde)
        currentSelection.forEach(cell => {
            cell.classList.remove('selected'); 
            cell.classList.add('found'); 
        });

        // Marcado automático en la lista (Checkbox con ✓)
        const listItem = wordListElement.querySelector(`li[data-word="${word}"]`);
        if (listItem) {
            listItem.classList.add('found-word');
            const checkbox = listItem.querySelector('.checkbox');
            checkbox.classList.add('checked');
            checkbox.innerHTML = '&#10003;';
        }
        foundWords.add(word); 
    }
}

// ----------------------------------------------------------------------
// ## 6. Inicio del Programa (Listeners Globales)
// ----------------------------------------------------------------------

newGameButton.addEventListener('click', initializeGame);

// * FIX FINAL: Atachamos los eventos de movimiento y fin a nivel del DOCUMENTO
document.addEventListener('mousemove', handleGlobalMouseMove); 
document.addEventListener('mouseup', handleMouseUp); 
document.addEventListener('touchend', handleMouseUp); // touchend usa la misma lógica que mouseup

// Inicializar el juego al cargar la página
initializeGame();
