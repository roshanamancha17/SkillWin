// main.js
import {
  signInWithGoogle,
  signOutUser,
  onUserChanged,
  db
} from "./auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

document.getElementById("signInBtn")?.addEventListener("click", async () => {
  try {
    const user = await signInWithGoogle();
    console.log("Signed in as:", user.email);
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

// ✅ Added this function
async function getUserData(uid) {
  const userDocRef = doc(db, "players", uid);
  const userDocSnap = await getDoc(userDocRef);
  if (userDocSnap.exists()) {
    return userDocSnap.data();
  } else {
    console.error("No user data found!");
    return null;
  }
}

async function updateUI(user) {
  const userInfo = document.getElementById("userInfo");
  const playerPoints = document.getElementById("playerPoints");
  const playerStatsSection = document.getElementById("playerStats");

  if (user) {
    userInfo.textContent = `Logged in as ${user.email}`;
    document.getElementById("signInBtn")?.classList.add("hidden");
    document.getElementById("signOutBtn")?.classList.remove("hidden");

    // Fetch user stats
    const userData = await getUserData(user.uid);

    if (userData) {
      // Show balance in header
      if (playerPoints) {
        playerPoints.textContent = userData.currentBalance;
      }

      // Update player stats section
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

    // Reset UI
    if (playerPoints) {
      playerPoints.textContent = "0";
    }
    if (playerStatsSection) {
      playerStatsSection.style.display = "none";
    }
  }
}
