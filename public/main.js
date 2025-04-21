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

// Sign-In with Google and show stats
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

    document.getElementById("userInfo").textContent = `Welcome, ${user.displayName}`;
    document.getElementById("signInBtn").style.display = "none";
    console.log("Signed in as:", user.displayName);

    // Fetch updated data
    const updatedSnap = await getDoc(userRef);
    const data = updatedSnap.data();

    // Show in UI
    document.getElementById('statBalance').textContent = data.currentBalance ?? 0;
    document.getElementById('statWins').textContent = data.win ?? 0;
    document.getElementById('statLosses').textContent = data.loss ?? 0;
    document.getElementById('statTotalBetted').textContent = data.totalBettedAmount ?? 0;
    document.getElementById('statGamesPlayed').textContent = (data.gamesPlayed || []).length;

    document.getElementById('playerStats').style.display = 'block';
  } catch (error) {
    console.error("Error during sign-in", error);
  }
};

// ========== Game Logic ==========
let playerPoints = 1000;

function updatePoints(points) {
  playerPoints = points;
  document.getElementById('playerPoints').textContent = points;
}

document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', async () => {
    const gameName = card.querySelector('h3').textContent;
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-');

    // Track game play in Firestore "games" collection
    try {
      const gameRef = doc(db, "games", gameSlug);
      const gameSnap = await getDoc(gameRef);
      const user = auth.currentUser;

      if (user) {
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
      }
    } catch (error) {
      console.error("Error tracking game:", error);
    }

    window.location.href = `/games/${gameSlug}.html`;
  });
});

document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log('Category clicked:', category);
  });
});

document.querySelector('.profile-btn')?.addEventListener('click', () => {
  console.log('Profile button clicked');
});

updatePoints(playerPoints);

const playButton = document.querySelector('.play-btn');
if (playButton) {
  playButton.addEventListener('click', () => {
    console.log('Starting game...');
  });
}
