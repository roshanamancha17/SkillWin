let playerRef = null;
let playerData = {
  name: "",
  balance: 10,
  wins: 0,
  losses: 0,
  totalBet: 0,
  totalWon: 0,
};

window.onload = () => {
  document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
};

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      playerData.name = user.displayName;
      setupPlayer(user.uid, user.email);
    })
    .catch((error) => {
      console.error(error);
    });
}

function setupPlayer(uid, email) {
  playerRef = db.collection('players').doc(uid);

  playerRef.get().then((doc) => {
    if (doc.exists) {
      playerData = doc.data();
      playerData.name = doc.data().name || playerData.name;
    } else {
      playerRef.set({
        name: playerData.name,
        email: email,
        balance: 10,
        wins: 0,
        losses: 0,
        totalBet: 0,
        totalWon: 0,
      });
    }
    document.getElementById("login-section").style.display = "none";
    document.getElementById("game-section").style.display = "block";
    updateUI();
  });
}

function updateUI() {
  document.getElementById("balance").innerText = playerData.balance.toFixed(2);
  document.getElementById("playerName").innerText = playerData.name;
  document.getElementById("wins").innerText = playerData.wins;
  document.getElementById("losses").innerText = playerData.losses;
  document.getElementById("totalBet").innerText = playerData.totalBet.toFixed(2);
  document.getElementById("totalWon").innerText = playerData.totalWon.toFixed(2);
}

function flipCoin() {
  const coin = document.getElementById("coin");
  const resultDiv = document.getElementById("result");
  const betAmount = parseFloat(document.getElementById("betAmount").value);
  const userChoice = document.getElementById("betChoice").value;

  if (!betAmount || betAmount <= 0) {
    resultDiv.innerText = "⚠️ Please enter a valid bet amount.";
    return;
  }

  if (betAmount > playerData.balance) {
    resultDiv.innerText = "⚠️ Not enough balance!";
    return;
  }

  const outcome = Math.random() < 0.5 ? "heads" : "tails";

  coin.style.animation = "none";
  void coin.offsetWidth;
  coin.style.animation = "flip 2s ease-out";

  setTimeout(() => {
    const flipRotation = Math.random() < 0.5 ? 0 : 180;
    coin.style.transform = `rotateY(${flipRotation}deg)`;

    playerData.totalBet += betAmount;

    if (userChoice === outcome) {
      const payoutMultiplier = 0.98;
      const winAmount = betAmount * payoutMultiplier;
      playerData.balance += winAmount;
      playerData.wins += 1;
      playerData.totalWon += winAmount;
      resultDiv.innerText = `🎉 You won ₹${winAmount.toFixed(2)} (2% edge applied)`;
    } else {
      playerData.balance -= betAmount;
      playerData.losses += 1;
      resultDiv.innerText = `😢 You lost! Coin was ${outcome.toUpperCase()}.`;
    }

    savePlayerData();
  }, 2000);
}

function savePlayerData() {
  if (playerRef) {
    playerRef.update({
      balance: playerData.balance,
      wins: playerData.wins,
      losses: playerData.losses,
      totalBet: playerData.totalBet,
      totalWon: playerData.totalWon,
    }).then(() => {
      updateUI();
    });
  }
}
