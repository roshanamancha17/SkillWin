// Initialize player points
let playerPoints = 1000;

// Update points display
function updatePoints(points) {
  playerPoints = points;
  document.getElementById('playerPoints').textContent = points;
}

// Add click handlers for game cards
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => {
    const gameName = card.querySelector('h3').textContent;
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/games/${gameSlug}.html`;
  });
});

// Add click handlers for category cards
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log('Category clicked:', category);
  });
});

// Profile button click handler
document.querySelector('.profile-btn')?.addEventListener('click', () => {
  console.log('Profile button clicked');
});

// Initialize the points display
updatePoints(playerPoints);

// Play button click handler
const playButton = document.querySelector('.play-btn');
if (playButton) {
  playButton.addEventListener('click', () => {
    console.log('Starting game...');
    // Add game start logic here
  });
}

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBmONfeIStjrxO1lSnLKCOIveLPN-udJbs",
  authDomain: "skill-win-d8c81.firebaseapp.com",
  projectId: "skill-win-d8c81",
  storageBucket: "skill-win-d8c81.appspot.com",
  messagingSenderId: "808700132713",
  appId: "1:808700132713:web:1ab8376f139278f89ad1f8",
  measurementId: "G-V9S0F1XD20"
};

// Firebase v10+ import style (must use with <script type="module"> in HTML)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// Initialize Firebase and Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Google Sign-In
window.signInWithGoogle = function () {
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      console.log("Signed in as:", user.displayName);
      document.getElementById("userInfo").textContent = `Welcome, ${user.displayName}`;
    })
    .catch(error => {
      console.error("Error during sign-in", error);
    });
}
