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

  if (betAmount > houseBalance) {
    alert('House does not have enough funds to match your bet. Try a lower amount.');
    return;
  }

  // Deduct from both player and house
  playerData.currentBalance -= betAmount;
  houseBalance -= betAmount;

  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const houseCut = betAmount * 0.02;
  const pot = betAmount * 2;
  const winnings = pot - houseCut;

  let message = '';
  let playerWon = userChoice === result;

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

  try {
    // Update Player Data
    await db.collection('players').doc(playerData.userId).update({
      currentBalance: playerData.currentBalance,
      wins: playerData.wins,
      losses: playerData.losses,
      totalBettedAmount: playerData.totalBettedAmount,
      gamesPlayed: playerData.gamesPlayed
    });

    // Update House Balance
    await db.collection('meta').doc('houseWallet').set({ balance: houseBalance });

    // Increment House Cut
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
