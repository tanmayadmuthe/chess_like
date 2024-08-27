// Constants
const GRID_SIZE = 5;
const CELL_SIZE = 480 / GRID_SIZE;
const UI_HEIGHT = 200;
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Colors
const COLORS = {
  WHITE: "#FFFFFF",
  BLACK: "#000000",
  LIGHT_BLUE: "#ADD8E6",
  DARK_GRAY: "#323232",
  BACKGROUND: "#F0F0F0",
};

// Characters
const CHARACTERS = {
  A: ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
  B: ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
};

// Game State
let board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(""));
let currentPlayer = "A";
let selectedCharacter = null;
let moveHistory = [];
let gameOver = false;
let winner = null;

// Initialize game
function initializeGame() {
  board = [
    ["A-P1", "A-P2", "A-H1", "A-H2", "A-P3"],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["B-P1", "B-P2", "B-H1", "B-H2", "B-P3"],
  ];
  currentPlayer = "A";
  selectedCharacter = null;
  moveHistory = [];
  gameOver = false;
  winner = null;
  drawBoard();
  updateUI();
}

function drawBoard() {
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw grid and characters
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const rectX = x * CELL_SIZE;
      const rectY = y * CELL_SIZE;
      ctx.strokeStyle = COLORS.BLACK;
      ctx.strokeRect(rectX, rectY, CELL_SIZE, CELL_SIZE);

      const character = board[y][x];
      if (character) {
        ctx.fillStyle = "#3498db";
        ctx.font = `${16}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(character, rectX + CELL_SIZE / 2, rectY + CELL_SIZE / 2);
      }

      if (selectedCharacter === character) {
        ctx.strokeStyle = COLORS.LIGHT_BLUE;
        ctx.lineWidth = 3;
        ctx.strokeRect(rectX, rectY, CELL_SIZE, CELL_SIZE);
      }
    }
  }
}

function updateUI() {
  document.getElementById(
    "currentPlayer"
  ).textContent = `Current Player: ${currentPlayer}`;
  document.getElementById("selectedCharacter").textContent = `Selected: ${
    selectedCharacter || "None"
  }`;
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";
  moveHistory.slice(-10).forEach((move) => {
    const li = document.createElement("li");
    li.textContent = move;
    historyList.appendChild(li);
  });
  if (gameOver) {
    document.getElementById(
      "winnerMessage"
    ).textContent = `Game Over! ${winner} Wins!`;
  } else {
    document.getElementById("winnerMessage").textContent = "";
  }
}

function getCharacterPosition(characterName) {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (board[y][x] === characterName) return [x, y];
    }
  }
  return null;
}

function calculateNewPosition(pos, direction, steps = 1) {
  let [x, y] = pos;
  switch (direction) {
    case "L":
      x -= steps;
      break;
    case "R":
      x += steps;
      break;
    case "F":
      y -= steps;
      break;
    case "B":
      y += steps;
      break;
    case "FL":
      x -= steps;
      y -= steps;
      break;
    case "FR":
      x += steps;
      y -= steps;
      break;
    case "BL":
      x -= steps;
      y += steps;
      break;
    case "BR":
      x += steps;
      y += steps;
      break;
  }
  return [x, y];
}

function isWithinBounds(pos) {
  const [x, y] = pos;
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function checkForWinner() {
  const remainingPiecesA = board.flat().some((cell) => cell && cell[0] === "A");
  const remainingPiecesB = board.flat().some((cell) => cell && cell[0] === "B");
  if (!remainingPiecesA) {
    gameOver = true;
    winner = "B";
  } else if (!remainingPiecesB) {
    gameOver = true;
    winner = "A";
  }
  updateUI();
}

function moveCharacter(direction) {
  if (!selectedCharacter) return;

  const currentPos = getCharacterPosition(selectedCharacter);
  if (!currentPos) return;

  const charType = selectedCharacter.split("-")[1];
  const player = selectedCharacter.split("-")[0];

  let steps = charType.startsWith("P") ? 1 : 2;
  const newPos = calculateNewPosition(currentPos, direction, steps);

  if (!isWithinBounds(newPos)) {
    console.log("Move out of bounds.");
    return;
  }

  const [newX, newY] = newPos;
  const targetCharacter = board[newY][newX];

  if (targetCharacter && targetCharacter[0] !== player) {
    board[newY][newX] = selectedCharacter;
    board[currentPos[1]][currentPos[0]] = "";
    moveHistory.push(
      `${selectedCharacter} captured ${targetCharacter} to (${newX}, ${newY})`
    );
    selectedCharacter = null;
  } else if (!targetCharacter) {
    board[newY][newX] = selectedCharacter;
    board[currentPos[1]][currentPos[0]] = "";
    moveHistory.push(`${selectedCharacter} moved to (${newX}, ${newY})`);
    selectedCharacter = null;
  } else {
    console.log("Invalid move.");
  }

  checkForWinner();
  currentPlayer = currentPlayer === "A" ? "B" : "A";
  drawBoard();
  updateUI();
}

function handleCanvasClick(event) {
  if (gameOver) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const gridX = Math.floor(x / CELL_SIZE);
  const gridY = Math.floor(y / CELL_SIZE);
  const clickedCharacter = board[gridY][gridX];

  if (clickedCharacter && clickedCharacter[0] === currentPlayer) {
    selectedCharacter = clickedCharacter;
  } else {
    selectedCharacter = null;
  }

  drawBoard();
  updateUI();
}

function setupControls() {
  document.querySelectorAll("#controls button").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.id === "Restart") {
        initializeGame();
      } else {
        moveCharacter(button.id);
      }
    });
  });
}

canvas.addEventListener("click", handleCanvasClick);
setupControls();
initializeGame();
