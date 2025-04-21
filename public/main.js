// Firebase v10+ - using ES module imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion
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

    // New user? Set default values
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

    // UI updates after sign-in
    document.getElementById("userInfo").textContent = `Welcome, ${user.displayName}`;
    document.getElementById("signInBtn").style.display = "none";
    document.getElementById('playerStats').style.display = 'block';

    // Refresh player stats
    await refreshPlayerStats();
  } catch (error) {
    console.error("Error during sign-in", error);
  }
};

// Refresh balance and stats across dashboard and header
async function refreshPlayerStats() {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "players", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();

    // 💰 Update balance everywhere
    const balance = data.currentBalance ?? 0;
    document.getElementById('playerPoints').textContent = balance;
    document.getElementById('statBalance').textContent = balance;

    // 📊 Update other stats
    document.getElementById('statWins').textContent = data.win ?? 0;
    document.getElementById('statLosses').textContent = data.loss ?? 0;
    document.getElementById('statTotalBetted').textContent = data.totalBettedAmount ?? 0;
    document.getElementById('statGamesPlayed').textContent = (data.gamesPlayed || []).length;
  }
}

// Update balance in Firestore and UI
async function updatePlayerBalance(amountChange) {
  const user = auth.currentUser;
  if (!user) return;

  const userRef = doc(db, "players", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const current = userSnap.data().currentBalance || 0;
    const updated = current + amountChange;

    await updateDoc(userRef, { currentBalance: updated });

    // Update everywhere in UI
    document.getElementById('playerPoints').textContent = updated;
    document.getElementById('statBalance').textContent = updated;
  }
}

// Track game start and player info
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

      const userRef = doc(db, "players", user.uid);
      await updateDoc(userRef, {
        gamesPlayed: arrayUnion(gameName),
      });

    } catch (error) {
      console.error("Error tracking game:", error);
    }

    // Redirect
    window.location.href = `/games/${gameSlug}.html`;
  });
});

// Category selection
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

// Init points on load
updatePoints(1000);
function updatePoints(points) {
  document.getElementById('playerPoints').textContent = points;
}
