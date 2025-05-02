import { auth, db } from "../../main.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const board = document.getElementById("gameBoard");
const modeSelector = document.getElementById("gameMode");
const startBtn = document.getElementById("startGameBtn");
const playerPointsDisplay = document.getElementById("playerPoints");
const statusDisplay = document.getElementById("gameStatus");

const colors = ["red", "blue", "green", "yellow", "orange", "purple", "cyan", "lime"];
let colorPairs = [...colors, ...colors]; // 8 pairs = 16 tiles

let tiles = [];
let flipped = [];
let matchedIndices = new Set();
let attempts = 0;
let timer = null;
let startTime = 0;
let playerPoints = 0;
let shuffleCounter = 0;

function shuffleArray(array) {
  return array.sort(() => 0.5 - Math.random());
}

function startTimer() {
  startTime = Date.now();
  timer = setInterval(() => {
    const time = Math.floor((Date.now() - startTime) / 1000);
    statusDisplay.textContent = `Time: ${time}s | Attempts: ${attempts}`;
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
  let payout = 0;

  if (mode === "attempts") {
    if (attempts <= 16) payout = 20;
    else if (attempts <= 22) payout = 10;
    else payout = 5;
  } else if (mode === "time") {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    if (timeTaken <= 30) payout = 20;
    else if (timeTaken <= 45) payout = 10;
    else payout = 5;
  }

  playerPoints += payout;
  updateBalance(uid, playerPoints);
  alert(`Game complete! You won ₹${payout}`);
  playerPointsDisplay.textContent = playerPoints;
  stopTimer();
}

function renderBoard() {
  board.innerHTML = "";
  tiles = shuffleArray([...colorPairs]);

  for (let i = 0; i < 16; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.index = i;
    tile.addEventListener("click", () => handleTileClick(i));
    board.appendChild(tile);
  }
}

function handleTileClick(index) {
  if (matchedIndices.has(index) || flipped.includes(index)) return;

  const tile = board.children[index];
  tile.style.backgroundColor = tiles[index];
  flipped.push(index);

  if (flipped.length === 2) {
    attempts++;
    const [first, second] = flipped;
    if (tiles[first] === tiles[second]) {
      matchedIndices.add(first);
      matchedIndices.add(second);
      flipped = [];
      if (matchedIndices.size === 16) {
        onAuthStateChanged(auth, (user) => {
          if (user) rewardPlayer(modeSelector.value, user.uid);
        });
      }
    } else {
      shuffleCounter++;
      setTimeout(() => {
        board.children[first].style.backgroundColor = "";
        board.children[second].style.backgroundColor = "";
        flipped = [];

        if (shuffleCounter === 3) {
          shuffleUnmatchedTiles();
          shuffleCounter = 0;
        }
      }, 600);
    }
  }

  statusDisplay.textContent = `Attempts: ${attempts}`;
}

function shuffleUnmatchedTiles() {
  const unmatched = [];
  for (let i = 0; i < 16; i++) {
    if (!matchedIndices.has(i)) unmatched.push(tiles[i]);
  }
  const shuffled = shuffleArray(unmatched);

  let idx = 0;
  for (let i = 0; i < 16; i++) {
    if (!matchedIndices.has(i)) {
      tiles[i] = shuffled[idx++];
    }
  }
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

startBtn.addEventListener("click", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return alert("Login required!");

    const docSnap = await getDoc(doc(db, "players", user.uid));
    if (!docSnap.exists()) return;

    const data = docSnap.data();
    playerPoints = data.currentBalance;
    if (playerPoints < 5) return alert("Not enough coins to play!");

    playerPoints -= 5; // Game entry fee
    await updateBalance(user.uid, playerPoints);
    playerPointsDisplay.textContent = playerPoints;

    // Reset game state
    matchedIndices.clear();
    flipped = [];
    attempts = 0;
    shuffleCounter = 0;
    stopTimer();

    renderBoard();
    if (modeSelector.value === "time") startTimer();
    else statusDisplay.textContent = "Attempts: 0";
  });
});

getPlayerBalance();
