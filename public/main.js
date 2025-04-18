// Initialize player points
let playerPoints = 1000;

// Update points display
function updatePoints(points) {
  playerPoints = points;
  document.getElementById('playerPoints').textContent = points;
}

// Add click handlers for game cards
document.querySelectorAll('.game-card').forEach(card => {
  card.addEventListener('click', () => {
    const gameName = card.querySelector('h3').textContent;
    const gameSlug = gameName.toLowerCase().replace(/\s+/g, '-');
    window.location.href = `/games/${gameSlug}.html`;
  });
});

// Add click handlers for category cards
document.querySelectorAll('.category-card').forEach(card => {
  card.addEventListener('click', () => {
    const category = card.dataset.category;
    console.log('Category clicked:', category);
  });
});

// Profile button click handler
document.querySelector('.profile-btn').addEventListener('click', () => {
  console.log('Profile button clicked');
});

// Initialize the points display
updatePoints(playerPoints);

// Play button click handler
const playButton = document.querySelector('.play-btn');
if (playButton) {
  playButton.addEventListener('click', () => {
    console.log('Starting game...');
    // Add game start logic here
  });
}