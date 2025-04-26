import { auth, db } from "../../auth";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const balanceDisplay = document.getElementById("balanceDisplay");
const resultMsg = document.getElementById("resultMsg");
const playBtn = document.getElementById("playBtn");

let currentUser = null;
let currentBalance = 0;

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "players", user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      currentBalance = data.currentBalance;
      balanceDisplay.textContent = currentBalance;
    }
  } else {
    resultMsg.textContent = "Please sign in to play.";
    playBtn.disabled = true;
  }
});

playBtn.addEventListener("click", async () => {
  if (currentBalance < 1) {
    resultMsg.textContent = "Not enough coins!";
    return;
  }

  currentBalance -= 1;
  balanceDisplay.textContent = currentBalance;

  const userRef = doc(db, "players", currentUser.uid);
  await updateDoc(userRef, {
    currentBalance: currentBalance
  });

  resultMsg.textContent = "You played the game! 1 coin deducted.";
});
