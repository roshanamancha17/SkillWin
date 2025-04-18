
const audioWin = new Audio("https://freesound.org/data/previews/276/276033_4486188-lq.mp3");
const audioClick = new Audio("https://freesound.org/data/previews/170/170219_2394245-lq.mp3");
const audioError = new Audio("https://freesound.org/data/previews/342/342756_3248244-lq.mp3");

function playSound(type) {
    switch (type) {
      case 'win': audioWin.play(); break;
      case 'click': audioClick.play(); break;
      case 'error': audioError.play(); break;
    }
  }
const TOTAL_SQUARES = 4;
const COLOR_OPTIONS = ["red", "blue", "green", "yellow", "purple", "orange", "pink", "brown"];

let correctSequence = [];
let currentGuess = new Array(TOTAL_SQUARES).fill(null);
let lockedPositions = new Array(TOTAL_SQUARES).fill(false);
let selectedSquareIndex = null;
let gameStarted = false;

const rewardTracker = [false, false, false, false]; // One-time rewards tracking

const playerStats = JSON.parse(localStorage.getItem("playerStats")) || {
  bets: 0,
  wins: 0,
  losses: 0,
  guesses: 0,
  totalWin: 0,
  totalLoss: 0,
  balance: 1000
};

const players = JSON.parse(localStorage.getItem("players")) || [];

function saveStats() {
  localStorage.setItem("playerStats", JSON.stringify(playerStats));
}

function savePlayers() {
  localStorage.setItem("players", JSON.stringify(players));
}

function initializeGame() {
  correctSequence = generateRandomSequence();
  currentGuess.fill(null);
  lockedPositions.fill(false);
  rewardTracker.fill(false);
  renderSquares();
  renderPalette();
  document.getElementById("hint").innerText = "";
  console.log("Correct Sequence:", correctSequence);
}

function generateRandomSequence() {
  let sequence = [];
  for (let i = 0; i < TOTAL_SQUARES; i++) {
    const randIndex = Math.floor(Math.random() * COLOR_OPTIONS.length);
    sequence.push(COLOR_OPTIONS[randIndex]);
  }
  return sequence;
}

function renderSquares() {
  const container = document.getElementById("guess-squares");
  container.innerHTML = "";
  for (let i = 0; i < TOTAL_SQUARES; i++) {
    const square = document.createElement("div");
    square.className = "square";
    square.dataset.index = i;
    if (lockedPositions[i]) {
      square.style.backgroundColor = currentGuess[i];
      square.classList.add("locked");
    } else if (currentGuess[i]) {
      square.style.backgroundColor = currentGuess[i];
    }
    if (i === selectedSquareIndex) {
      square.classList.add("selected");
    }
    square.onclick = () => selectSquare(i);
    container.appendChild(square);
  }
}

function renderPalette() {
  const palette = document.getElementById("color-palette");
  palette.innerHTML = "";
  COLOR_OPTIONS.forEach(color => {
    const colorBox = document.createElement("div");
    colorBox.className = "color-box";
    colorBox.style.backgroundColor = color;
    colorBox.onclick = () => assignColor(color);
    palette.appendChild(colorBox);
  });
}

function selectSquare(index) {
  if (!lockedPositions[index]) {
    selectedSquareIndex = index;
    renderSquares();
  }
}

function assignColor(color) {
  if (selectedSquareIndex !== null && !lockedPositions[selectedSquareIndex]) {
    currentGuess[selectedSquareIndex] = color;
    selectedSquareIndex = null;
    renderSquares();
  }
}

function startGame() {
    const coinsInput = document.getElementById("coins");
    const coins = parseInt(coinsInput.value);
  
    if (isNaN(coins) || coins <= 0 || coins > playerStats.balance) {
      alert("Please enter a valid coin amount within your balance.");
      return;
    }
  
    gameStarted = true;
    coinsInput.disabled = true; // 🔒 Lock the bet input
    initializeGame();
  }
  

function submitAnswer() {
if (!gameStarted) {
alert("Please place your bet and start the game first.");
return;
}

const coins = parseInt(document.getElementById("coins").value);
if (isNaN(coins) || coins <= 0 || coins > playerStats.balance) {
alert("Please enter a valid coin amount within your balance.");
return;
}

if (currentGuess.includes(null)) {
alert("Fill all squares before submitting.");
return;
}

// Deduct coins once at the beginning
playerStats.bets += coins;
playerStats.guesses++;
playerStats.balance -= coins;
playerStats.totalLoss += coins;

let correctCount = 0;
let colorMatchCount = 0;
const usedColors = [...correctSequence];

for (let i = 0; i < TOTAL_SQUARES; i++) {
if (currentGuess[i] === correctSequence[i]) {
  lockedPositions[i] = true;
  correctCount++;
  usedColors[i] = null;
}
}

for (let i = 0; i < TOTAL_SQUARES; i++) {
if (!lockedPositions[i] && usedColors.includes(currentGuess[i])) {
  colorMatchCount++;
  usedColors[usedColors.indexOf(currentGuess[i])] = null;
}
}

let reward = 0;
let multiplier = 0;

if (correctCount === TOTAL_SQUARES) {

document.getElementById("Result").innerText = `You won! You get 2x your coins: ${coins}`;

playerStats.wins++;
playerStats.totalWin += coins;
playerStats.balance += coins * 2;
gameStarted = false;
saveStats();
renderStats();
restartGame();
return;
}

if (correctCount > 0 && !rewardTracker[correctCount - 1]) {
switch (correctCount) {
  case 1: multiplier = 0.2; break;
  case 2: multiplier = 0.4; break;
  case 3: multiplier = 0.5; break;
}
reward = coins * multiplier;
rewardTracker[correctCount - 1] = true;
playerStats.balance += reward;
playerStats.totalWin += reward;
document.getElementById("Result").innerText = `You matched ${correctCount} color(s) correctly. You get ${multiplier}x: ${reward} coins.`;

} else {
if (correctCount === 0) {
    document.getElementById("Result").innerText = `No correct guesses. You lost.`;


  playerStats.losses++;
} else {
    document.getElementById("Result").innerText = `You already claimed the reward for ${correctCount} correct guesses.`;

}
}

document.getElementById("hint").innerText = `${colorMatchCount} correct color(s) in wrong place.`;
renderSquares();
saveStats();
renderStats();
}

function restartGame() {
    setTimeout(() => {
      const coinsInput = document.getElementById("coins");
      coinsInput.value = "";
      coinsInput.disabled = false; // 🔓 Unlock the bet input
  
      currentGuess = new Array(TOTAL_SQUARES).fill(null);
      lockedPositions = new Array(TOTAL_SQUARES).fill(false);
      selectedSquareIndex = null;
      rewardTracker.fill(false);
      gameStarted = false;
      renderStats();
      initializeGame();
    }, 1000);
  }
  

function renderStats() {
  const statsDiv = document.getElementById("stats");
  statsDiv.innerText = `Bets: ${playerStats.bets}, Wins: ${playerStats.wins}, Losses: ${playerStats.losses}, Guesses: ${playerStats.guesses}, Total Won: ${playerStats.totalWin}, Total Lost: ${playerStats.totalLoss}`;
  document.getElementById("current-balance-display").innerText = playerStats.balance;
}

window.onload = () => {
  document.getElementById("start-form").onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById("player-name").value.trim();
    const email = document.getElementById("player-email").value.trim();

    if (!name || !email) {
      alert("Please enter both name and email.");
      return;
    }

    const newPlayer = { name, email, date: new Date().toISOString() };
    players.push(newPlayer);
    savePlayers();

    document.getElementById("form-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    renderStats();
  };

  renderStats();
};
