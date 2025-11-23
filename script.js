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
// ## 2. Renderizado de la Cuadrícula
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
            
            // Los eventos de interacción se gestionan en el contenedor (handlePointerDown)
            
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
// ## 3. Lógica de Selección y Arrastre (FIX UNIFICADO)
// ----------------------------------------------------------------------

function getCellFromCoordinates(x, y) {
    const element = document.elementFromPoint(x, y);
    // Devuelve la celda solo si el elemento existe y tiene la clase 'grid-cell'
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
        
        currentSelection.forEach(cell => cell.classList.remove('selected'));
        currentSelection = [];
        
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
// ## 4. Manejadores de Eventos (pointerdown/move/up)
// ----------------------------------------------------------------------

// Inicia la selección (Clic del ratón o Toque con el dedo)
function handlePointerDown(e) {
    // Solo inicia si el clic/toque está en una celda
    if (!e.target.classList.contains('grid-cell')) return; 

    // Previene el inicio de la selección de texto nativa del navegador
    e.preventDefault(); 

    isMouseDown = true;
    startCell = e.target;
    clearSelection();
    
    startCell.classList.add('selected');
    currentSelection.push(startCell);

    // Adjuntar eventos de movimiento y fin a nivel del DOCUMENTO
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
}

// Gestiona el arrastre
function handlePointerMove(e) {
    if (!isMouseDown) return;

    // Aquí ya no necesitamos e.preventDefault() si el CSS funciona, pero es buena práctica
    
    const targetCell = getCellFromCoordinates(e.clientX, e.clientY);
    
    if (targetCell) {
        highlightSelection(targetCell);
    } 
}

// Finaliza la selección
function handlePointerUp(e) {
    if (!isMouseDown) return;

    isMouseDown = false;
    
    // Remover los eventos globales para evitar consumo de recursos
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);

    // Realiza la verificación de la palabra al soltar
    if (currentSelection.length > 0) {
        const selectedWordText = currentSelection.map(cell => cell.textContent).join('');
        checkWord(selectedWordText);
    }
    
    clearSelection(); 
}


// ----------------------------------------------------------------------
// ## 5. Verificación y Marcado Automático
// ----------------------------------------------------------------------

function checkWord(word) {
    if (selectedWords.includes(word) && !foundWords.has(word)) {
        
        // Marcado permanente en la cuadrícula
        currentSelection.forEach(cell => {
            cell.classList.remove('selected'); 
            cell.classList.add('found'); 
        });

        // Marcado en la lista
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
// ## 6. Inicio del Programa
// ----------------------------------------------------------------------

newGameButton.addEventListener('click', initializeGame);

// * FIX FINAL: Escucha el inicio del clic/toque en el contenedor de la cuadrícula
wordSearchGrid.addEventListener('pointerdown', handlePointerDown); 

// Inicializar el juego al cargar la página
initializeGame();
