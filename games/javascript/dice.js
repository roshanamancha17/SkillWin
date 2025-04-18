let balance = 1000;
let playerData = {
  name: "",
  email: "",
  balance: 1000,
  wins: 0,
  losses: 0,
  totalBet: 0,
  totalWon: 0,
};

window.onload = () => {
  document.getElementById("loginModal").style.display = "flex";
};

function startGame() {
  const name = document.getElementById("playerNameInput").value.trim();
  const email = document.getElementById("playerEmailInput").value.trim();
  if (!name || !email) return alert("Please enter your name and email.");

  const stored = JSON.parse(localStorage.getItem(email));
  if (stored) {
    playerData = stored;
  } else {
    playerData.name = name;
    playerData.email = email;
  }

  document.getElementById("loginModal").style.display = "none";
  updateUI();
}

function updateUI() {
  balance = playerData.balance;
  document.getElementById("balance").innerText = balance.toFixed(2);
  document.getElementById("playerName").innerText = playerData.name;
  document.getElementById("playerEmail").innerText = playerData.email;
  document.getElementById("wins").innerText = playerData.wins;
  document.getElementById("losses").innerText = playerData.losses;
  document.getElementById("totalBet").innerText = playerData.totalBet.toFixed(2);
  document.getElementById("totalWon").innerText = playerData.totalWon.toFixed(2);
}

function savePlayerData() {
  playerData.balance = balance;
  localStorage.setItem(playerData.email, JSON.stringify(playerData));
  updateUI();
}

function rollDice() {
  const playerNum = parseInt(document.getElementById("playerNumber").value);
  const betAmount = parseFloat(document.getElementById("betAmount").value);
  const resultDiv = document.getElementById("result");
  const diceDiv = document.getElementById("dice");

  if (!playerNum || playerNum < 1 || playerNum > 6 || !betAmount || betAmount <= 0) {
    resultDiv.innerText = "⚠️ Enter valid number (2-6) and bet amount.";
    return;
  }

  if (betAmount > balance) {
    resultDiv.innerText = "⚠️ Not enough balance!";
    return;
  }

  let diceRoll = Math.floor(Math.random() * 6) + 1;
  let win = false;

  if (playerNum === 4 || playerNum === 5 || playerNum === 6) {
    // Dice must be divisible by chosen number AND pass the 0.5% chance
    if (diceRoll % playerNum === 0) {
      win = Math.random() < 0.48;
    }
  } else {
    // Normal win logic for 2 and 3
    win = diceRoll % playerNum === 0;
  }

  diceDiv.style.backgroundImage = `url('https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_${diceRoll}.png')`;
  diceDiv.style.animation = 'none';
  void diceDiv.offsetWidth;
  diceDiv.style.animation = 'roll 1s ease-out';

  playerData.totalBet += betAmount;

  if (win) {
    let multiplier = 0;
    switch (playerNum) {
      case 2:
        multiplier = 0.1;
        break;
      case 3:
        multiplier = 0.2;
        break;
      case 4:
      case 5:
      case 6:
        multiplier = 2.0;
        break;
    }
    const winAmount = betAmount * multiplier * 0.98; // 2% house edge
    balance += winAmount;
    playerData.wins += 1;
    playerData.totalWon += winAmount;
    resultDiv.innerText = `🎉 You won! Dice was ${diceRoll}. You won ₹${winAmount.toFixed(2)}`;
  } else {
    balance -= betAmount;
    playerData.losses += 1;
    resultDiv.innerText = `😢 You lost! Dice was ${diceRoll}.`;
  }

  savePlayerData();
}
