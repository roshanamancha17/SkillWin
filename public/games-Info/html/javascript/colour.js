import { auth, db } from "../../main.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const board = document.getElementById("board");
const modeSelector = document.getElementById("gameMode");
const modeAttemptsBtn = document.getElementById("mode-attempts");
const modeTimeBtn = document.getElementById("mode-time");
const quitButton = document.getElementById("quitButton");
const playerPointsDisplay = document.getElementById("playerPoints");

const attemptsSection = document.getElementById("attemptsSection");
const timeSection = document.getElementById("timeSection");

const colors = ["red", "blue", "green", "yellow", "orange", "purple", "cyan", "lime"];
let colorPairs = [...colors, ...colors];

let tiles = [];
let flipped = [];
let matchedIndices = new Set();
let attempts = 0;
let timer = null;
let startTime = 0;
let playerPoints = 0;
let shuffleCounter = 0;
let currentMode = "";
let gameOver = false;

function shuffleArray(array) {
  return array.sort(() => 0.5 - Math.random());
}

function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("time").textContent = time;

    if (time >= 90) {
      handleLoss("Time limit exceeded! You lost the game.");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
}

function updateBalance(uid, newBalance) {
  const docRef = doc(db, "players", uid);
  return updateDoc(docRef, { currentBalance: newBalance });
}

function rewardPlayer(mode, uid) {
  if (gameOver) return;

  let payout = 0;
  const timeTaken = Math.floor((Date.now() - startTime) / 1000);

  if (mode === "attempts") {
    if (attempts <= 16) payout = 20;
    else if (attempts <= 22) payout = 10;
    else payout = 5;
  } else if (mode === "time") {
    if (timeTaken <= 30) payout = 20;
    else if (timeTaken <= 45) payout = 10;
    else payout = 5;
  }

  playerPoints += payout;
  updateBalance(uid, playerPoints);
  alert(`Game complete! You won ₹${payout}`);
  playerPointsDisplay.textContent = playerPoints;
  stopTimer();
  gameOver = true;
}

function handleLoss(message) {
  if (gameOver) return;
  alert(message);
  stopTimer();
  gameOver = true;
  quitGame();
}

function renderBoard() {
  board.innerHTML = "";
  tiles = shuffleArray([...colorPairs]);

  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";

    const inner = document.createElement("div");
    inner.className = "tile-inner";

    const front = document.createElement("div");
    front.className = "tile-face tile-front";

    const back = document.createElement("div");
    back.className = "tile-face tile-back";
    back.style.backgroundColor = tiles[i];

    inner.appendChild(front);
    inner.appendChild(back);
    tile.appendChild(inner);
    tile.dataset.index = i;

    tile.addEventListener("click", () => handleTileClick(i));
    board.appendChild(tile);
  }
}

function handleTileClick(index) {
  if (gameOver || matchedIndices.has(index) || flipped.includes(index)) return;

  const tile = board.children[index];
  tile.classList.add("flipped");
  flipped.push(index);

  if (flipped.length === 2) {
    const [first, second] = flipped;
    const color1 = tiles[first];
    const color2 = tiles[second];

    setTimeout(() => {
      if (color1 === color2) {
        matchedIndices.add(first);
        matchedIndices.add(second);
        if (matchedIndices.size === 16) {
          onAuthStateChanged(auth, (user) => {
            if (user) rewardPlayer(currentMode, user.uid);
          });
        }
      } else {
        board.children[first].classList.remove("flipped");
        board.children[second].classList.remove("flipped");
        shuffleCounter++;
        if (shuffleCounter === 3) {
          shuffleUnmatchedTiles();
          shuffleCounter = 0;
        }
      }

      flipped = [];
    }, 600);

    attempts++;
    document.getElementById("attempts").textContent = attempts;

    if (currentMode === "attempts" && attempts > 25) {
      handleLoss("Too many attempts! You lost the game.");
    }
  }
}

function shuffleUnmatchedTiles() {
  const unmatchedIndices = [];
  const unmatchedColors = [];

  for (let i = 0; i < 16; i++) {
    if (!matchedIndices.has(i)) {
      unmatchedIndices.push(i);
      unmatchedColors.push(tiles[i]);
    }
  }

  const shuffled = shuffleArray(unmatchedColors);

  unmatchedIndices.forEach((tileIndex, i) => {
    tiles[tileIndex] = shuffled[i];
    const tileBack = board.children[tileIndex].querySelector('.tile-back');
    tileBack.style.backgroundColor = shuffled[i];
  });
}

function getPlayerBalance() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docSnap = await getDoc(doc(db, "players", user.uid));
      if (docSnap.exists()) {
        playerPoints = docSnap.data().currentBalance ?? 0;
        playerPointsDisplay.textContent = playerPoints;
      }
    }
  });
}

function startGame(mode) {
  currentMode = mode;
  modeSelector.textContent = mode;
  document.getElementById("game-info").classList.remove("hidden");
  board.classList.remove("hidden");

  if (mode === "attempts") {
    attemptsSection.classList.remove("hidden");
    timeSection.classList.add("hidden");
  } else {
    timeSection.classList.remove("hidden");
    attemptsSection.classList.add("hidden");
  }

  document.getElementById("attempts").textContent = "0";
  document.getElementById("time").textContent = "0";

  onAuthStateChanged(auth, async (user) => {
    if (!user) return alert("Login required!");

    const docSnap = await getDoc(doc(db, "players", user.uid));
    if (!docSnap.exists()) return;

    playerPoints = docSnap.data().currentBalance;
    if (playerPoints < 5) return alert("Not enough coins to play!");

    playerPoints -= 5;
    await updateBalance(user.uid, playerPoints);
    playerPointsDisplay.textContent = playerPoints;

    matchedIndices.clear();
    flipped = [];
    attempts = 0;
    shuffleCounter = 0;
    stopTimer();
    gameOver = false;

    renderBoard();
    if (mode === "time") startTimer();
  });
}

function quitGame() {
  const confirmQuit = confirm("Are you sure you want to quit? No refund will be given.");
  if (!confirmQuit) return;

  stopTimer();
  board.innerHTML = "";
  board.classList.add("hidden");
  document.getElementById("game-info").classList.add("hidden");
  matchedIndices.clear();
  flipped = [];
  attempts = 0;
  shuffleCounter = 0;
  gameOver = true;
}

modeAttemptsBtn.addEventListener("click", () => startGame("attempts"));
modeTimeBtn.addEventListener("click", () => startGame("time"));
quitButton.addEventListener("click", quitGame);

getPlayerBalance();
