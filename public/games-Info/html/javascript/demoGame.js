// Correct imports directly from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyBmONfelStjrxOl1SnLKCOIveLPN-udJbs",
  authDomain: "skill-win-d8c81.firebaseapp.com",
  projectId: "skill-win-d8c81",
  storageBucket: "skill-win-d8c81.firebasestorage.app",
  messagingSenderId: "808700132713",
  appId: "1:808700132713:web:1ab8376f139278f89ad1f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Your DOM elements
const balanceDisplay = document.getElementById("balanceDisplay");
const resultMsg = document.getElementById("resultMsg");
const playBtn = document.getElementById("playBtn");

let currentUser = null;
let currentBalance = 0;

// Listen for auth state changes
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

// Handle Play button click
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
