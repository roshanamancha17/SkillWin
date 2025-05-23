// Setup playerData
let playerData = {};
let houseBalance = 0;

// On page load, check if user is logged in
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
      // Ensure all fields are defined
      playerData.wins = playerData.wins ?? 0;
      playerData.losses = playerData.losses ?? 0;
      playerData.totalBettedAmount = playerData.totalBettedAmount ?? 0;
      playerData.gamesPlayed = playerData.gamesPlayed ?? 0;
    }

    const houseDoc = await db.collection('meta').doc('houseWallet').get();
    if (houseDoc.exists) {
      houseBalance = houseDoc.data().balance ?? 10000000;
    }

    updateUI(playerData);
  } else {
    window.location.href = "login.html";
  }
});

function updateUI(playerData) {
  document.getElementById('balance').innerText = `${(playerData.currentBalance ?? 0).toFixed(2)}`;
  document.getElementById('wins').innerText = playerData.wins ?? 0;
  document.getElementById('losses').innerText = playerData.losses ?? 0;
  document.getElementById('totalBet').innerText = (playerData.totalBettedAmount ?? 0).toFixed(2);
  document.getElementById('totalWon').innerText = ((playerData.totalBettedAmount ?? 0) - (playerData.losses ?? 0)).toFixed(2);
}

// Flip Coin Function
async function flipCoin() {
  const betAmount = parseFloat(document.getElementById('betAmount').value);
  const userChoice = document.getElementById('betChoice').value.toLowerCase();
  const resultDiv = document.getElementById('result');
  const coinEl = document.getElementById('coin');

  if (playerData.currentBalance <= 0 || isNaN(betAmount) || betAmount <= 0 || betAmount > playerData.currentBalance || betAmount > houseBalance) {
    alert('Invalid bet. Please check your input and try again.');
    return;
  }

  // Deduct from both
  playerData.currentBalance -= betAmount;
  houseBalance -= betAmount;

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const houseCut = betAmount * 0.02;
  const pot = betAmount * 2;
  const winnings = pot - houseCut;

  let playerWon = userChoice === result;
  let message = '';

  if (playerWon) {
    playerData.currentBalance += winnings;
    playerData.wins = (playerData.wins ?? 0) + 1;
    message = `🎉 You WON! It was ${result.toUpperCase()}. You earned ₹${winnings.toFixed(2)}!`;
  } else {
    houseBalance += winnings;
    playerData.losses = (playerData.losses ?? 0) + 1;
    message = `😞 You LOST! It was ${result.toUpperCase()}. You lost ₹${betAmount.toFixed(2)}.`;
  }

  playerData.totalBettedAmount = (playerData.totalBettedAmount ?? 0) + betAmount;
  playerData.gamesPlayed = (playerData.gamesPlayed ?? 0) + 1;

  // Random spin multiplier for realism
  const spins = 3 + Math.floor(Math.random() * 3); // between 3 and 5 full spins
  const rotationX = spins * 360;
  const rotation = result === 'heads'
    ? `rotateY(0deg) rotateX(${rotationX}deg)`
    : `rotateY(180deg) rotateX(${rotationX}deg)`;

  // Trigger animation
  coinEl.style.transition = 'transform 1s ease-in-out';
  coinEl.style.transform = rotation;

  // Wait for animation to finish
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Show result after animation
  try {
    await db.collection('players').doc(playerData.userId).update({
      currentBalance: playerData.currentBalance,
      wins: playerData.wins,
      losses: playerData.losses,
      totalBettedAmount: playerData.totalBettedAmount,
      gamesPlayed: playerData.gamesPlayed
    });

    await db.collection('meta').doc('houseWallet').set({ balance: houseBalance });

    await db.collection('meta').doc('houseCut').set({
      totalAmount: firebase.firestore.FieldValue.increment(houseCut)
    }, { merge: true });

    resultDiv.innerText = message;
    updateUI(playerData);
  } catch (error) {
    console.error('Error updating Firestore:', error);
  }
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
