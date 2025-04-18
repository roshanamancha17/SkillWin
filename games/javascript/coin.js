let balance = 1000;
let playerData = {
  name: "",
  balance: 1000,
  wins: 0,
  losses: 0,
  totalBet: 0,
  totalWon: 0,
};

// Show login on load
window.onload = () => {
  document.getElementById("loginModal").style.display = "flex";
};

function startGame() {
  const name = document.getElementById("playerNameInput").value.trim();
  if (!name) return alert("Please enter your name.");

  // Load from localStorage if exists
  const stored = JSON.parse(localStorage.getItem(name));
  if (stored) {
    playerData = stored;
  } else {
    playerData.name = name;
  }

  document.getElementById("loginModal").style.display = "none";
  updateUI();
}

function updateUI() {
  balance = playerData.balance;
  updateBalance();

  document.getElementById("playerName").innerText = playerData.name;
  document.getElementById("wins").innerText = playerData.wins;
  document.getElementById("losses").innerText = playerData.losses;
  document.getElementById("totalBet").innerText = playerData.totalBet.toFixed(2);
  document.getElementById("totalWon").innerText = playerData.totalWon.toFixed(2);
}

function updateBalance() {
  document.getElementById("balance").innerText = balance.toFixed(2);
}

function savePlayerData() {
  playerData.balance = balance;
  localStorage.setItem(playerData.name, JSON.stringify(playerData));
  updateUI();
}
let flipRotation = 0;

function flipCoin() {
  const coin = document.getElementById("coin");
  const resultDiv = document.getElementById("result");
  const betAmount = parseFloat(document.getElementById("betAmount").value);
  const userChoice = document.getElementById("betChoice").value;

  if (!betAmount || betAmount <= 0) {
    resultDiv.innerText = "⚠️ Please enter a valid bet amount.";
    return;
  }

  if (betAmount > balance) {
    resultDiv.innerText = "⚠️ Not enough balance!";
    return;
  }

  const outcome = Math.random() < 0.5 ? "heads" : "tails";
  flipRotation += 2880; // Each flip adds 8 full spins
  const finalRotation = outcome === "heads" ? flipRotation : flipRotation + 180;

  coin.style.animation = "none";
  void coin.offsetWidth; // reset animation hack
  coin.style.animation = "flip 2s ease-out";

  setTimeout(() => {
    coin.style.transform = `rotateY(${finalRotation}deg)`;

    playerData.totalBet += betAmount;

    if (userChoice === outcome) {
      const payoutMultiplier = 0.98;
      const winAmount = betAmount * payoutMultiplier;
      balance += winAmount;
      playerData.wins += 1;
      playerData.totalWon += winAmount;
      resultDiv.innerText = `🎉 You won ₹${winAmount.toFixed(2)} (2% edge applied)`;
    } else {
      balance -= betAmount;
      playerData.losses += 1;
      resultDiv.innerText = `😢 You lost! Coin was ${outcome.toUpperCase()}.`;
    }

    savePlayerData();
  }, 2000);
}

