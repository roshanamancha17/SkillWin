// memory.js


  const rhymingWords = [
    // Animals
    "🐶", "🐱", "🐭", "🐹", "🐰",
    "🦊", "🐻", "🐼", "🐨", "🐯",
  
    // Food
    "🍎", "🍌", "🍇", "🍉", "🍒",
    "🍓", "🍍", "🥝", "🥥", "🥑",
  
    // Faces
    "😀", "😁", "😂", "🤣", "😅",
    "😊", "😇", "😎", "😍", "🤓",
  
    // Weather/Nature
    "🌞", "🌝", "🌚", "🌜", "🌛",
    "🌧️", "⛈️", "🌩️", "🌪️", "🌈",
  
    // Objects/Tools
    "🕹️", "💡", "🔦", "📦", "🔋",
    "🔑", "🗝️", "🧲", "🧪", "🧯"
  ];
  


let sequence = [];
let N = 20;
let playerName = "Anonymous";
let balance = 1000;
let totalProfit = 0;

// Load player from localStorage
function loadPlayer() {
  const saved = JSON.parse(localStorage.getItem("memoryPlayer"));
  if (saved) {
    playerName = saved.name;
    balance = saved.balance;
    totalProfit = saved.totalProfit;
    document.getElementById("balance").textContent = balance;
    document.getElementById("profit").textContent = totalProfit.toFixed(2);
  }
}

function savePlayer() {
  localStorage.setItem("memoryPlayer", JSON.stringify({
    name: playerName,
    balance: balance,
    totalProfit: totalProfit
  }));
}

// Handle player form
const playerForm = document.getElementById("playerForm");
playerForm.addEventListener("submit", function(e) {
  e.preventDefault();
  playerName = document.getElementById("playerName").value.trim() || "Anonymous";
  document.getElementById("playerFormOverlay").style.display = "none";
  document.getElementById("gameInfo").style.display = "block";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("playerName").value = "";
  loadPlayer(); // load any saved data
});

document.getElementById("newGameBtn").addEventListener("click", startGame);

function startGame() {
  if (inputTimer) clearInterval(inputTimer);

  const bet = parseInt(document.getElementById("bet").value);
  if (bet > balance) {
    alert("Insufficient balance!");
    return;
  }

  sequence = [];
  document.getElementById("sequence").innerHTML = "";
  document.getElementById("result-section").innerHTML = "";
  document.getElementById("input-section").style.display = "none";

  for (let i = 0; i < N; i++) {
    const word = rhymingWords[Math.floor(Math.random() * rhymingWords.length)];
    sequence.push(word);
  }

  showSequenceChunks(sequence, 3, 500);


  setTimeout(() => {
    document.getElementById("sequence").innerHTML = "<em>Time's up! Now enter what you remember:</em>";
    showInputSection();

  }, 10000);

  const required = Math.floor(N / 2) + 1;
  document.getElementById("required").textContent = required;
  document.getElementById("correct").textContent = 0;
}

function submitAnswers() {
  const bet = parseInt(document.getElementById("bet").value);
  const input = document.getElementById("userInput").value.trim();
  const answers = input.split(/[\n,]+/).map(a => a.trim());

  let correct = 0;
  for (let i = 0; i < sequence.length; i++) {
    if (answers[i] && answers[i].toLowerCase() === sequence[i].toLowerCase()) {
      correct++;
    }
  }

  document.getElementById("correct").textContent = correct;
  const required = Math.floor(N / 2) + 1;
  let reward = 0;
  let result = "";

  if (correct >= required) {
    if (correct === N) {
      reward = bet * 2;
    } else {
      reward = bet * (1 + ((correct - required) / (N - required)));
    }
    result = `<strong>You got ${correct}/${N} correct.</strong><br>You win <strong>₹${reward.toFixed(2)}</strong> 🥳`;
    balance += reward;
    totalProfit += reward - bet;
  } else {
    result = `<strong>You got ${correct}/${N} correct.</strong><br>You lost ₹${bet}`;
    balance -= bet;
    totalProfit -= bet;
  }

  savePlayer(); // Save the player after each game
  document.getElementById("balance").textContent = balance;
  document.getElementById("profit").textContent = totalProfit.toFixed(2);
  document.getElementById("result-section").innerHTML = result;
  document.getElementById("input-section").style.display = "none";
  document.getElementById("userInput").value = "";
}

document.getElementById("sequence").addEventListener("contextmenu", e => {
  e.preventDefault();
});

function showSequenceChunks(sequence, chunkSize = 3, delay = 500) {
  const displayElement = document.getElementById("sequence");
  let i = 0;

  const interval = setInterval(() => {
    const chunk = sequence.slice(i, i + chunkSize);
    displayElement.innerHTML = `<strong>${chunk.join(" ")}</strong>`;
    i += chunkSize;

    if (i >= sequence.length) {
      clearInterval(interval);
      setTimeout(() => {
        displayElement.innerHTML = "<em>Time's up! Now enter what you remember:</em>";
        document.getElementById("input-section").style.display = "block";
      }, delay); // give a small pause after last chunk
    }
  }, delay);
}

let inputTimer;

function showInputSection() {
  document.getElementById("input-section").style.display = "block";
  document.getElementById("submitBtn").disabled = false;
  let timeLeft = 10;

  const timerDisplay = document.getElementById("Time");
  timerDisplay.textContent = `⏳ Time left: ${timeLeft}s`;
  timerDisplay.style.display = "block";

  inputTimer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = `⏳ Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(inputTimer);
      document.getElementById("submitBtn").disabled = true;
      timerDisplay.textContent = "⏰ Time's up!";
      submitAnswers(); // auto-submit
    }
  }, 1000);
}
