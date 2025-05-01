// main.js
import {
  signInWithGoogle,
  signOutUser,
  onUserChanged,
  auth,
  db
} from "./auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// Get player data
async function getUserData(uid) {
  const userDocRef = doc(db, "players", uid);
  const userDocSnap = await getDoc(userDocRef);
  return userDocSnap.exists() ? userDocSnap.data() : null;
}

// Update UI
async function updateUI(user) {
  const userInfo = document.getElementById("userInfo");
  const playerPoints = document.getElementById("playerPoints");
  const playerStatsSection = document.getElementById("playerStats");

  if (!userInfo || !playerPoints) return;

  if (user) {
    userInfo.textContent = `Logged in as ${user.email}`;
    document.getElementById("signInBtn")?.classList.add("hidden");
    document.getElementById("signOutBtn")?.classList.remove("hidden");

    const userData = await getUserData(user.uid);

    if (userData) {
      playerPoints.textContent = userData.currentBalance;

      if (playerStatsSection) {
        document.getElementById("statBalance").textContent = userData.currentBalance;
        document.getElementById("statWins").textContent = userData.wins;
        document.getElementById("statLosses").textContent = userData.losses;
        document.getElementById("statTotalBetted").textContent = userData.totalBettedAmount;
        document.getElementById("statGamesPlayed").textContent = userData.gamesPlayed;
        playerStatsSection.style.display = "block";
      }
    }
  } else {
    userInfo.textContent = "Not signed in";
    document.getElementById("signInBtn")?.classList.remove("hidden");
    document.getElementById("signOutBtn")?.classList.add("hidden");

    playerPoints.textContent = "0";
    if (playerStatsSection) playerStatsSection.style.display = "none";
  }
}

// Wait for DOM before adding listeners
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("signInBtn")?.addEventListener("click", async () => {
    try {
      const user = await signInWithGoogle();
      updateUI(user);
    } catch (err) {
      console.error("Sign-in failed:", err);
    }
  });

  document.getElementById("signOutBtn")?.addEventListener("click", async () => {
    await signOutUser();
    updateUI(null);
  });

  onUserChanged((user) => {
    updateUI(user);
  });
});

export { auth, db };
