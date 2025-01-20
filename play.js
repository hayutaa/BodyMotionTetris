// https://tetris.fandom.com/wiki/Tetris_Guideline

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSequence() {
  const sequence = ["I", "J", "L", "O", "S", "T", "Z"];
  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0];
    tetrominoSequence.push(name);
  }
}

function getNextTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }
  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];
  const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  const row = name === "I" ? -1 : -2;
  return { name, matrix, row, col };
}

function rotate(matrix) {
  const N = matrix.length - 1;
  return matrix.map((row, i) => row.map((val, j) => matrix[N - j][i]));
}

function isValidMove(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        if (
          cellCol + col < 0 ||
          cellCol + col >= playfield[0].length ||
          cellRow + row >= playfield.length ||
          playfield[cellRow + row][cellCol + col]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

let score = 0;

function updateScore(lines) {
  const lineScores = [0, 40, 100, 300, 1200]; // Punkte für 1, 2, 3 oder 4 gelöste Linien
  score += lineScores[lines];
  document.getElementById("score").textContent = score;
}

function placeTetromino() {
  let linesCleared = 0;

  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row].length; col++) {
      if (tetromino.matrix[row][col]) {
        if (tetromino.row + row < 0) {
          return showGameOver();
        }

        playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
      }
    }
  }

  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row].every((cell) => !!cell)) {
      linesCleared++;

      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r].length; c++) {
          playfield[r][c] = playfield[r - 1] ? playfield[r - 1][c] : 0;
        }
      }
    } else {
      row--;
    }
  }

  if (linesCleared > 0) {
    updateScore(linesCleared);
  }

  tetromino = getNextTetromino();
}

function showGameOver() {
  cancelAnimationFrame(rAF);
  gameOver = true;
  context.fillStyle = "black";
  context.globalAlpha = 0.75;
  context.fillRect(0, canvass.height / 2 - 30, canvass.width, 60);
  context.globalAlpha = 1;
  context.fillStyle = "white";
  context.font = "36px monospace";
  context.textAlign = "center";
  context.fillText("GAME OVER!", canvass.width / 2, canvass.height / 2);
}

// Hard Drop Function
function hardDrop() {
  while (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
    tetromino.row++;
  }
  placeTetromino();
}

const canvass = document.getElementById("gameCanvas");
const context = canvass.getContext("2d");
const grid = 32;
const tetrominoSequence = [];
const playfield = [];

for (let row = -2; row < 20; row++) {
  playfield[row] = [];
  for (let col = 0; col < 10; col++) {
    playfield[row][col] = 0;
  }
}

const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const colors = {
  I: "#8FBC8F",
  O: "#F4A460",
  T: "#DB7093",
  S: "#DC143C",
  Z: "#Dda0dd",
  J: "#6495ed",
  L: "#F0E68C",
};

let count = 0;
let tetromino = getNextTetromino();
let rAF = null;
let gameOver = false;
let isPaused = false;

document.getElementById("pause-button").addEventListener("click", (e) => {
  e.preventDefault();
  e.target.blur();
  togglePause();
});

function togglePause() {
  isPaused = !isPaused;

  const button = document.getElementById("pause-button");
  button.textContent = isPaused ? "Resume" : "Pause";

  if (isPaused) {
    cancelAnimationFrame(rAF);
  } else {
    rAF = requestAnimationFrame(loop);
  }
}

function restartGame() {
  score = 0;
  count = 0;
  gameOver = false;
  tetrominoSequence.length = 0;
  initializePlayfield();
  tetromino = getNextTetromino();
  document.getElementById("score").textContent = score;
  rAF = requestAnimationFrame(loop);
}

function initializePlayfield() {
  for (let row = 0; row < 20; row++) {
    playfield[row] = Array(10).fill(0);
  }
}

let keyPressed = false;

document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p" && !keyPressed) {
    keyPressed = true;
    togglePause();
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key.toLowerCase() === "p") {
    keyPressed = false;
  }
});

document.getElementById("restart-button").addEventListener("click", (e) => {
  e.preventDefault();
  e.target.blur();
  restartGame(); // Neustart ausführen
});

function loop() {
  if (isPaused) {
    cancelAnimationFrame(rAF);
    return;
  }

  rAF = requestAnimationFrame(loop);
  context.clearRect(0, 0, canvass.width, canvass.height);

  // Raster zeichnen
  context.strokeStyle = "rgba(255, 255, 255, 0.2)";
  context.lineWidth = 1;
  for (let x = 0; x <= canvass.width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvass.height);
    context.stroke();
  }
  for (let y = 0; y <= canvass.height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvass.width, y);
    context.stroke();
  }

  // Spielfeld zeichnen
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (playfield[row][col]) {
        const name = playfield[row][col];
        context.fillStyle = colors[name];
        context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
      }
    }
  }

  // Aktives Tetromino zeichnen
  if (tetromino) {
    if (++count > 35) {
      tetromino.row++;
      count = 0;
      if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
        tetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect(
            (tetromino.col + col) * grid,
            (tetromino.row + row) * grid,
            grid - 1,
            grid - 1
          );
        }
      }
    }
  }
}

document.addEventListener("keydown", function (e) {
  if (gameOver) return;
  if (e.which === 37 || e.which === 39) {
    const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;
    if (isValidMove(tetromino.matrix, tetromino.row, col)) {
      tetromino.col = col;
    }
  }
  if (e.which === 38) {
    const matrix = rotate(tetromino.matrix);
    if (isValidMove(matrix, tetromino.row, tetromino.col)) {
      tetromino.matrix = matrix;
    }
  }
  if (e.which === 40) {
    const row = tetromino.row + 1;
    if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
      tetromino.row = row - 1;
      placeTetromino();
      return;
    }
    tetromino.row = row;
  }
  if (e.which === 32) {
    // Spacebar for Hard Drop
    hardDrop();
  }
});

function moveLeft() {
  if (isValidMove(tetromino.matrix, tetromino.row, tetromino.col - 1)) {
    tetromino.col--; // Bewege Tetromino nach links
  }
}

function moveRight() {
  if (isValidMove(tetromino.matrix, tetromino.row, tetromino.col + 1)) {
    tetromino.col++; // Bewege Tetromino nach rechts
  }
}

function rotateTetromino() {
  const rotatedMatrix = rotate(tetromino.matrix);
  if (isValidMove(rotatedMatrix, tetromino.row, tetromino.col)) {
    tetromino.matrix = rotatedMatrix; // Rotiert das Tetromino
  }
}

function hardDrop() {
  while (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)) {
    tetromino.row++; // Block schnell fallen lassen
  }
  placeTetromino(); // Block platzieren
}

initializePlayfield();

rAF = requestAnimationFrame(loop);
