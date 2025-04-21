// main.js

// Firebase v10+ - using ES module imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmONfelStjrxOl1SnLKCOIveLPN-udJbs",
  authDomain: "skill-win-d8c81.firebaseapp.com",
  projectId: "skill-win-d8c81",
  storageBucket: "skill-win-d8c81.appspot.com",
  messagingSenderId: "808700132713",
  appId: "1:808700132713:web:1ab8376f139278f89ad1f8",
  measurementId: "G-V9S0F1XD20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

// Sign-In with Google and load/update data
window.signInWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userRef = doc(db, "players", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        userId: user.uid,
        currentBalance: 1000,
        win: 0,
        loss: 0,
        totalBettedAmount: 0,
        gamesPlayed: [],
      });
    }

    // Update UI
    document.getElementById("userInfo").textContent = `Welcome, ${user.displayName}`;
    document.getElementById("signInBtn").style.display = "none";
    document.getElementById('playerStats').style.display = 'block';

    await refreshPlayerStats();
  } catch (error) {
    console.error("Error during sign-in", error);
  }
};

// Refresh player stats (balance + other stats)
async function refreshPlayerStats() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "players", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();

    const balance = data.currentBalance ?? 0;
    updateUIElement('playerPoints', balance);
    updateUIElement('statBalance', balance);
    updateUIElement('statWins', data.win ?? 0);
    updateUIElement('statLosses', data.loss ?? 0);
    updateUIElement('statTotalBetted', data.totalBettedAmount ?? 0);
    updateUIElement('statGamesPlayed', (data.gamesPlayed || []).length);
  }
}

// 🔄 Utility to update UI element by ID
function updateUIElement(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Track game click and log it under user's data
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', async () => {
    const gameName = card.querySelector('h3').textContent;
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-');

    try {
      const user = auth.currentUser;
      if (!user) return;

      const gameRef = doc(db, "games", gameSlug);
      const gameSnap = await getDoc(gameRef);

      if (!gameSnap.exists()) {
        await setDoc(gameRef, {
          name: gameName,
          players: [user.uid],
          playerCount: 1,
        });
      } else {
        await updateDoc(gameRef, {
          players: arrayUnion(user.uid),
          playerCount: gameSnap.data().playerCount + 1,
        });
      }

      await updateDoc(doc(db, "players", user.uid), {
        gamesPlayed: arrayUnion(gameName),
      });

      window.location.href = `/games/${gameSlug}.html`;

    } catch (error) {
      console.error("Error tracking game:", error);
    }
  });
});

// Optional: fetch balance only
window.fetchAndDisplayBalance = async function () {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "players", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    const balance = data.currentBalance ?? 0;
    updateUIElement('playerPoints', balance);
  }
};

// Category cards
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log('Category clicked:', category);
  });
});

// Profile button
document.querySelector('.profile-btn')?.addEventListener('click', () => {
  console.log('Profile button clicked');
});

// Set default UI value for points
updateUIElement('playerPoints', 1000);
