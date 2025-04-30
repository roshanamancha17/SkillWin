// Initialize Firebase (firebase-config.js already included)

// Setup playerData
let playerData = {};

// On page load, check if user is already logged in
auth.onAuthStateChanged(async (user) => {
  if (user) {
    const playerRef = db.collection('players').doc(user.uid);
    const playerDoc = await playerRef.get();

    if (!playerDoc.exists) {
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
    window.location.href = "login.html";
  }
});

// Update UI
function updateUI(playerData) {
  const balance = playerData.currentBalance ?? 0;
  document.getElementById('balance').innerText = `${balance.toFixed(2)}`; // removed ₹
}

// Flip Coin
let flipCount = 0;

async function flipCoin() {
  const betAmount = parseFloat(document.getElementById('betAmount').value);
  const userChoice = document.getElementById('betChoice').value.toLowerCase();
  const resultDiv = document.getElementById('result');
  const coin = document.getElementById('coin');

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

  // Random result
  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const isHeads = result === 'heads';

  // Animate: rotate multiple times + show correct face
  flipCount += 1;
  const extraRotation = isHeads ? 0 : 180;
  const totalRotation = 360 * 6 * flipCount + extraRotation;

  coin.style.transition = 'transform 2s ease-out';
  coin.style.transform = `rotateY(${totalRotation}deg)`;

  // Delay result processing until animation finishes
  setTimeout(async () => {
    const houseCut = betAmount * 0.02;
    const netBet = betAmount - houseCut;
    let message = '';

    if (userChoice === result) {
      playerData.currentBalance += netBet;
      playerData.wins = (playerData.wins ?? 0) + 1;
      message = `🎉 You WON! It was ${result.toUpperCase()}. You earned ₹${netBet.toFixed(2)}!`;
    } else {
      playerData.currentBalance -= betAmount;
      playerData.losses = (playerData.losses ?? 0) + 1;
      message = `😞 You LOST! It was ${result.toUpperCase()}. You lost ₹${betAmount.toFixed(2)}.`;
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
        gamesPlayed: playerData.gamesPlayed,
      });

      await db.collection('meta').doc('house').update({
        totalAmount: firebase.firestore.FieldValue.increment(houseCut)
      });

      resultDiv.innerText = message;
      updateUI(playerData);
    } catch (error) {
      console.error('Error updating Firestore:', error);
    }
  }, 2000); // Wait for flip animation
}


// Add event listener safely
document.addEventListener('DOMContentLoaded', function () {
  const flipButton = document.getElementById('flipButton');
  if (flipButton) {
    flipButton.addEventListener('click', flipCoin);
  } else {
    console.error('Flip Button not found!');
  }
});
