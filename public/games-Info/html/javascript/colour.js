// folder1/game.js
import { auth, db } from '../../../main.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBmONfelStjrxOl1SnLKCOIveLPN-udJbs",
  authDomain: "skill-win-d8c81.firebaseapp.com",
  projectId: "skill-win-d8c81",
  storageBucket: "skill-win-d8c81.appspot.com",
  messagingSenderId: "808700132713",
  appId: "1:808700132713:web:1ab8376f139278f89ad1f8",
  measurementId: "G-V9S0F1XD20"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// This will fire when the user loads the page
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("User is signed in:", user.email);
    // You can store user.uid and pass to game logic
  } else {
    console.log("No user signed in");
    // Optional: redirect to login or show sign-in prompt
  }
});

let stats = {
  name: '',
  totalBets: 0,
  wins: 0,
  losses: 0,
  startTime: Date.now(),
};

let playerPoints = 0;
let profit = 0;
let matched = 0;
let firstTile = null;
let canClick = true;

const colors = ['#FF4136', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9', '#FF851B', '#7FDBFF', '#01FF70'];
let tileColors = shuffle([...colors, ...colors]);
const grid = document.getElementById("grid");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function updateUI() {
  document.getElementById("playerPoints").innerText = playerPoints.toFixed(2);
  document.getElementById("profit").innerText = profit.toFixed(2);
  document.getElementById("matched").innerText = matched;
}

function createTiles() {
  grid.innerHTML = "";
  tileColors.forEach((color, i) => {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.color = color;
    tile.dataset.index = i;
    tile.addEventListener("click", handleClick);
    grid.appendChild(tile);
  });
}

async function handleClick(e) {
  if (!canClick) return;
  const tile = e.target;
  if (tile.classList.contains("matched") || tile.classList.contains("revealed")) return;

  const bet = parseFloat(document.getElementById("betAmount").value);
  if (bet > playerPoints) {
    alert("Not enough coins!");
    return;
  }

  tile.style.backgroundColor = tile.dataset.color;
  tile.classList.add("revealed");

  if (!firstTile) {
    firstTile = tile;
  } else {
    canClick = false;
    const secondTile = tile;

    if (firstTile.dataset.color === secondTile.dataset.color) {
      firstTile.classList.add("matched");
      secondTile.classList.add("matched");
      matched++;
      const reward = calculateReward(bet);
      playerPoints += reward;
      profit += reward;
      stats.wins++;
      stats.totalBets += bet;
      setTimeout(() => switchGreyTiles(), 400);
    } else {
      playerPoints -= bet;
      stats.losses++;
      stats.totalBets += bet;
      setTimeout(() => {
        firstTile.classList.remove("revealed");
        secondTile.classList.remove("revealed");
        firstTile.style.backgroundColor = 'grey';
        secondTile.style.backgroundColor = 'grey';
      }, 600);
    }

    await updateBalanceInFirebase();

    setTimeout(() => {
      firstTile = null;
      canClick = true;
      updateUI();
      saveStats();
    }, 650);
  }
}

function calculateReward(bet) {
  return parseFloat((bet * 1.96).toFixed(2));
}

function switchGreyTiles() {
  const unrevealedTiles = Array.from(document.querySelectorAll(".tile")).filter(
    t => !t.classList.contains("matched")
  );
  const currentColors = unrevealedTiles.map(t => t.dataset.color);
  const newShuffledColors = shuffle(currentColors);
  unrevealedTiles.forEach((tile, i) => {
    tile.dataset.color = newShuffledColors[i];
    if (!tile.classList.contains("revealed")) {
      tile.style.backgroundColor = "grey";
    }
  });
}

function saveStats() {
  localStorage.setItem("colorGameStats", JSON.stringify(stats));
}

function loadStats() {
  const saved = localStorage.getItem("colorGameStats");
  if (saved) {
    stats = JSON.parse(saved);
  }
}

function updateStatsUI() {
  document.getElementById("playerNameDisplay").textContent = stats.name || "Anonymous";
  document.getElementById("totalBets").textContent = stats.totalBets;
  document.getElementById("wins").textContent = stats.wins;
  document.getElementById("losses").textContent = stats.losses;
  document.getElementById("netProfit").textContent = profit.toFixed(2);
  const seconds = Math.floor((Date.now() - stats.startTime) / 1000);
  const minutes = Math.floor(seconds / 60);
  document.getElementById("timePlayed").textContent = `${minutes}m ${seconds % 60}s`;
}

function startTimer() {
  setInterval(updateStatsUI, 1000);
}

async function getInitialBalance() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "players", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    playerPoints = docSnap.data().currentBalance ?? 0;
    updateUI();
  }
}

async function updateBalanceInFirebase() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "players", user.uid);
  await updateDoc(docRef, { currentBalance: playerPoints });
}

// Init
loadStats();
createTiles();
updateStatsUI();
startTimer();

document.getElementById("playerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("playerName").value.trim();
  if (name) {
    stats.name = name;
    saveStats();
    updateStatsUI();
    document.getElementById("playerFormOverlay").style.display = "none";
  }
});

if (!stats.name) {
  document.getElementById("playerFormOverlay").style.display = "flex";
} else {
  updateStatsUI();
}

document.getElementById("newGameBtn").addEventListener("click", () => {
  if (confirm("Start a new game? Your progress will reset.")) {
    matched = 0;
    tileColors = shuffle([...colors, ...colors]);
    createTiles();
    updateUI();
    updateStatsUI();
  }
});

// Get balance from Firebase on load
getInitialBalance();
