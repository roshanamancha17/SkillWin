// Initialize Firebase

const db = firebase.firestore();
const auth = firebase.auth();

let playerData = {}; // store user data after login

// On page load, check if user is already logged in
auth.onAuthStateChanged(async (user) => {
  if (user) {
      // User is signed in
      const playerRef = db.collection('players').doc(user.uid);
      const playerDoc = await playerRef.get();

      if (!playerDoc.exists) {
          // (optional) create new user if needed
          await playerRef.set({
              userId: user.uid,
              email: user.email,
              currentBalance: 10,
              wins: 0,
              losses: 0,
              totalBettedAmount: 0,
              gamesPlayed: 0,
          });
          playerData = {
              userId: user.uid,
              currentBalance: 10,
              wins: 0,
              losses: 0,
              totalBettedAmount: 0,
              gamesPlayed: 0,
          };
      } else {
          playerData = playerDoc.data();
      }

      updateUI(playerData);
  } else {
      // No user is signed in, redirect to login page
      window.location.href = "login.html"; // or whatever your login page is
  }
});

// Update UI with player data
function updateUI(playerData) {
  const balance = playerData.currentBalance ?? 0;
  document.getElementById('balance').innerText = `₹${balance.toFixed(2)}`;
}

// Flip Coin Game
async function flipCoin() {
  const betAmount = parseFloat(document.getElementById('betAmount').value);
  const userChoice = document.getElementById('guess').value;

  if (playerData.currentBalance <= 0) {
      alert('Your balance is ₹0. Please add funds or win to continue playing.');
      return;
  }

  if (isNaN(betAmount) || betAmount <= 0) {
      alert('Please enter a valid bet amount.');
      return;
  }

  if (betAmount > playerData.currentBalance) {
      alert('You cannot bet more than your current balance.');
      return;
  }

  const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
  document.getElementById('result').innerText = result.toUpperCase();

  if (userChoice === result) {
      playerData.currentBalance += betAmount;
      playerData.wins = (playerData.wins ?? 0) + 1;
  } else {
      playerData.currentBalance -= betAmount;
      playerData.losses = (playerData.losses ?? 0) + 1;
  }

  playerData.totalBettedAmount = (playerData.totalBettedAmount ?? 0) + betAmount;
  playerData.gamesPlayed = (playerData.gamesPlayed ?? 0) + 1;

  try {
      const playerRef = db.collection('players').doc(playerData.userId);
      await playerRef.update({
          currentBalance: playerData.currentBalance,
          wins: playerData.wins,
          losses: playerData.losses,
          totalBettedAmount: playerData.totalBettedAmount,
          gamesPlayed: playerData.gamesPlayed
      });
      updateUI(playerData);
  } catch (error) {
      console.error('Error updating player data:', error);
  }
}

// Hook flip button
document.getElementById('flip-button').addEventListener('click', flipCoin);
