import { auth, db } from '../../main.js';
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const colorDisplay = document.getElementById("colorDisplay");
const matchButton = document.getElementById("matchButton");
const resultDisplay = document.getElementById("result");
const matchedDisplay = document.getElementById("matched");
const betInput = document.getElementById("betAmount");
const playerPointsDisplay = document.getElementById("playerPoints");

let colors = ["red", "blue", "green", "yellow"];
let currentColor = "";
let playerPoints = 0;
let canClick = true;

function updateUI() {
  playerPointsDisplay.textContent = playerPoints;
}

function getRandomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

function updateBalanceInFirestore(uid, newBalance) {
  const docRef = doc(db, "players", uid);
  return updateDoc(docRef, {
    currentBalance: newBalance
  });
}

function showColor() {
  currentColor = getRandomColor();
  colorDisplay.textContent = currentColor;
  colorDisplay.style.backgroundColor = currentColor;
  matchedDisplay.textContent = "";
  resultDisplay.textContent = "";
}

async function checkMatch(bet, uid) {
  const randomColor = getRandomColor();
  matchedDisplay.textContent = `Random Color: ${randomColor}`;
  const playerDocRef = doc(db, "players", uid);

  let outcome = "";
  let winnings = 0;

  if (currentColor === randomColor) {
    winnings = bet * 2;
    playerPoints += winnings;
    resultDisplay.textContent = `You win ₹${winnings}!`;
    outcome = "win";
  } else {
    playerPoints -= bet;
    resultDisplay.textContent = "Try Again!";
    outcome = "loss";
  }

  updateUI();

  // Update player document
  try {
    const playerDoc = await getDoc(playerDocRef);
    if (playerDoc.exists()) {
      const data = playerDoc.data();
      const newStats = {
        currentBalance: playerPoints,
        totalBettedAmount: (data.totalBettedAmount || 0) + bet,
        gamesPlayed: (data.gamesPlayed || 0) + 1,
        wins: outcome === "win" ? (data.wins || 0) + 1 : (data.wins || 0),
        losses: outcome === "loss" ? (data.losses || 0) + 1 : (data.losses || 0)
      };
      await updateDoc(playerDocRef, newStats);
    }
  } catch (err) {
    console.error("Error updating player stats:", err);
  }

  // Save to history
  try {
    const historyRef = doc(db, `players/${uid}/colorMatchHistory/${Date.now()}`);
    await setDoc(historyRef, {
      timestamp: new Date(),
      bet,
      outcome,
      winnings,
      matchedColor: randomColor,
      selectedColor: currentColor
    });
  } catch (err) {
    console.error("Error saving game history:", err);
  }
}

function getInitialBalance() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "players", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        playerPoints = docSnap.data().currentBalance ?? 0;
      } else {
        playerPoints = 1000; // fallback demo balance
      }
      updateUI();
    }
  });
}

matchButton.addEventListener("click", () => {
  if (!canClick) return;

  const bet = parseInt(betInput.value);
  if (isNaN(bet) || bet <= 0) {
    alert("Enter a valid bet amount");
    return;
  }

  if (bet > playerPoints) {
    alert("You don't have enough coins!");
    return;
  }

  canClick = false;
  showColor();

  setTimeout(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        checkMatch(bet, user.uid);
        canClick = true;
      }
    });
  }, 1000); // delay to show color before result
});

getInitialBalance();
