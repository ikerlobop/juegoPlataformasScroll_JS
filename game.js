
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar el tamaño del canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables de configuración
const gravity = 0.8;
const playerSpeed = 5;
const jumpPower = 15;
const enemySpeed = 3;
const levelWidth = 3000; // Ancho del nivel

// Rango en el que el jugador puede moverse antes de que el nivel haga scroll
const scrollThresholdLeft = 150;  
const scrollThresholdRight = canvas.width / 2; 

// Variables de jugador
let player = {
  x: 100, 
  y: canvas.height - 150,
  width: 50,
  height: 50,
  dx: 0, 
  dy: 0, 
  isJumping: false,
  onPlatform: false,
  alive: true // Nueva propiedad para saber si el jugador sigue en el juego
};

// Enemy se controla automáticamente
let enemy = {
  x: 200, 
  y: canvas.height - 150,
  width: 50,
  height: 50,
  dx: enemySpeed, 
  dy: 0, 
  isJumping: false,
  onPlatform: false,
  alive: true // Nueva propiedad para saber si el enemigo sigue en el juego
};

// Nivel (plataformas)
const platforms = [
  { x: 0, y: canvas.height - 100, width: 1000, height: 20 },
  { x: 200, y: canvas.height - 200, width: 100, height: 20 },
  { x: 400, y: canvas.height - 300, width: 150, height: 20 },
  { x: 600, y: canvas.height - 400, width: 100, height: 20 },
  { x: 850, y: canvas.height - 150, width: 200, height: 20 },
  { x: 1200, y: canvas.height - 250, width: 300, height: 20 },
  { x: 1600, y: canvas.height - 350, width: 150, height: 20 },
  { x: 1800, y: canvas.height - 100, width: 400, height: 20 },
  { x: 2300, y: canvas.height - 200, width: 150, height: 20 },
  { x: 2600, y: canvas.height - 300, width: 100, height: 20 },
  { x: 2800, y: canvas.height - 100, width: 150, height: 20 }
];

let scrollOffset = 0; // Control del desplazamiento horizontal

// Dibuja el jugador
function drawPlayer() {
  if (player.alive) {
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }
}

// Dibuja el enemigo
function drawEnemy() {
  if (enemy.alive) {
    ctx.fillStyle = 'blue';
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

// Dibuja las plataformas
function drawPlatforms() {
  ctx.fillStyle = 'green';
  platforms.forEach(platform => {
    ctx.fillRect(platform.x - scrollOffset, platform.y, platform.width, platform.height);
  });
}

// Controlar el movimiento del jugador
function updatePlayer() {
  if (player.alive) {
    player.x += player.dx;
    player.y += player.dy;
    player.onPlatform = false; // Asumimos que el jugador no está en una plataforma al principio

    if (player.y + player.height < canvas.height) {
      player.dy += gravity; 
    } else {
      // Si el jugador toca el fondo del canvas sin estar en una plataforma, muere
      if (!player.onPlatform) {
        player.alive = false; // El jugador ha caído
      }
      player.dy = 0; 
      player.isJumping = false;
    }

    platforms.forEach(platform => {
      if (
        player.y + player.height <= platform.y &&
        player.y + player.height + player.dy >= platform.y &&
        player.x + player.width >= platform.x - scrollOffset &&
        player.x <= platform.x - scrollOffset + platform.width
      ) {
        player.dy = 0;
        player.isJumping = false;
        player.onPlatform = true; // El jugador está sobre una plataforma
      }
    });

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
  }
}

// Control del enemigo, movimiento automático
function updateEnemy() {
  if (enemy.alive) {
    enemy.x += enemy.dx;
    enemy.y += enemy.dy;
    enemy.onPlatform = false; // Asumimos que el enemigo no está en una plataforma al principio

    if (enemy.y + enemy.height < canvas.height) {
      enemy.dy += gravity; 
    } else {
      // Si el enemigo toca el fondo del canvas sin estar en una plataforma, muere
      if (!enemy.onPlatform) {
        enemy.alive = false; // El enemigo ha caído
      }
      enemy.dy = 0; 
      enemy.isJumping = false;
    }

    platforms.forEach(platform => {
      if (
        enemy.y + enemy.height <= platform.y && 
        enemy.y + enemy.height + enemy.dy >= platform.y &&
        enemy.x + enemy.width >= platform.x - scrollOffset &&
        enemy.x <= platform.x - scrollOffset + platform.width
      ) {
        enemy.dy = 0; 
        enemy.isJumping = false;
        enemy.onPlatform = true; // El enemigo está sobre una plataforma

        // Saltar si el enemigo está cerca del borde de la plataforma
        if (enemy.x + enemy.width >= platform.x - scrollOffset + platform.width - 10 && !enemy.isJumping) {
          enemy.dy = -jumpPower; // Saltar
          enemy.isJumping = true;
        }
      }
    });

    if (enemy.x < 0) enemy.x = 0;
    if (enemy.x + enemy.width > canvas.width) enemy.x = canvas.width - enemy.width;
  }
}

// Movimiento del nivel (scroll horizontal)
function moveLevel() {
  if (player.alive && player.x > scrollThresholdRight && scrollOffset < levelWidth - canvas.width) {
    scrollOffset += playerSpeed;
    player.x = scrollThresholdRight; 
  }

  if (player.alive && player.x < scrollThresholdLeft && scrollOffset > 0) {
    scrollOffset -= playerSpeed;
    player.x = scrollThresholdLeft;
  }
}

// Manejador de teclas
function handleKeyDown(event) {
  if (player.alive) {
    if (event.code === 'ArrowRight') {
      player.dx = playerSpeed;
    } else if (event.code === 'ArrowLeft') {
      player.dx = -playerSpeed;
    } else if (event.code === 'ArrowUp' && !player.isJumping) {
      player.dy = -jumpPower;
      player.isJumping = true;
    }
  }
}

function handleKeyUp(event) {
  if (event.code === 'ArrowRight' || event.code === 'ArrowLeft') {
    player.dx = 0;
  }
}

// Bucle principal del juego
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); 

  drawPlatforms(); 
  drawPlayer(); 
  drawEnemy(); 
  updateEnemy(); 
  updatePlayer(); 
  moveLevel(); 

  // Terminar el juego solo cuando ambos personajes caigan o lleguen al final
  if (!player.alive && !enemy.alive) {
    alert("¡Ambos han caído! Fin del juego.");
    document.location.reload();
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

gameLoop();
