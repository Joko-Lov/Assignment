// Game State
let score = 0;
let timeLeft = 30; // seconds
let loopId = null;
let timerId = null;

const player = { x: 280, y: 360, width: 40, height: 20, speed: 50 };
const aliens = []; // entities to catch
const bombs = [];  // entities to avoid

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const finalScoreEl = document.getElementById('final-score');
const feedbackEl = document.getElementById('feedback');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Utility
function rand(min, max) { return Math.random() * (max - min) + min; }
function spawnEntities() {
  aliens.length = 0;
  bombs.length = 0;
  for (let i = 0; i < 5; i++) {
    aliens.push({ x: rand(0, 580), y: -rand(30, 200), size: 20, speed: rand(2, 5) });
  }
  for (let i = 0; i < 2; i++) {
    bombs.push({ x: rand(0, 580), y: -rand(30, 200), size: 20, speed: rand(3, 6) });
  }
}

function setScreen(activeId) {
  [startScreen, gameScreen, gameOverScreen].forEach(s => {
    s.classList.add('hidden');
    s.classList.remove('active');
  });
  const active = document.getElementById(activeId);
  active.classList.remove('hidden');
  active.classList.add('active');
}

function reset() {
  score = 0;
  timeLeft = 30;
  player.x = 280;
  player.y = 360;
  spawnEntities();
  scoreEl.textContent = `Score: ${score}`;
  timerEl.textContent = `Time: ${timeLeft}`;
  feedbackEl.textContent = '';
}

// Input
document.addEventListener('keydown', e => {
  if (gameScreen.classList.contains('active')) {
    if (e.key === 'ArrowLeft' && player.x > 0) player.x -= player.speed;
    if (e.key === 'ArrowRight' && player.x < canvas.width - player.width) player.x += player.speed;
  }
});

// Visual feedback
function showFeedback(text, type = 'info') {
  feedbackEl.textContent = text;
  feedbackEl.style.color = type === 'good' ? '#8aff8a' : type === 'bad' ? '#ff8a8a' : '#8ae1ff';
  setTimeout(() => { feedbackEl.textContent = ''; }, 600);
}

// Collision
function intersects(a, b) {
  return a.x < b.x + b.size &&
         a.x + a.width > b.x &&
         a.y < b.y + b.size &&
         a.y + a.height > b.y;
}

// Render
function drawPlayer() {
  ctx.fillStyle = 'lime';
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEntities(list, color) {
  ctx.fillStyle = color;
  for (const e of list) {
    ctx.fillRect(e.x, e.y, e.size, e.size);
  }
}

function updateEntities(list) {
  for (const e of list) {
    e.y += e.speed;
    if (e.y > canvas.height) {
      e.y = -20;
      e.x = rand(0, canvas.width - e.size);
    }
  }
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Player
  drawPlayer();
  // Aliens
  updateEntities(aliens);
  drawEntities(aliens, 'cyan');
  // Bombs
  updateEntities(bombs);
  drawEntities(bombs, 'red');

  // Alien catches
  aliens.forEach(a => {
    if (intersects(player, a)) {
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
      showFeedback('+10!', 'good');
      a.y = -20;
      a.x = rand(0, canvas.width - a.size);
    }
  });

  // Bomb hits
  bombs.forEach(b => {
    if (intersects(player, b)) {
      score = Math.max(0, score - 15);
      scoreEl.textContent = `Score: ${score}`;
      showFeedback('-15!', 'bad');
      b.y = -20;
      b.x = rand(0, canvas.width - b.size);
    }
  });
}

function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time: ${timeLeft}`;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

// State transitions
function startGame() {
  reset();
  setScreen('game-screen');
  loopId = setInterval(gameLoop, 1000 / 60); // 60 FPS
  startTimer();
}

function endGame() {
  clearInterval(loopId);
  clearInterval(timerId);
  setScreen('game-over-screen');
  finalScoreEl.textContent = score;
}

function restartGame() {
  setScreen('start-screen');
}