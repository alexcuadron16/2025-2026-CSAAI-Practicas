const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ASSETS
const bg = new Image(); bg.src = "assets/space.jpg";
const playerImg = new Image(); playerImg.src = "assets/player.png";
const alienImg = new Image(); alienImg.src = "assets/alien.png";
const explosionImg = new Image(); explosionImg.src = "assets/explosion.png";

const shootSound = new Audio("assets/shoot.mp3");
const explosionSound = new Audio("assets/explosion.mp3");
const winSound = new Audio("assets/win.mp3");
const gameOverSound = new Audio("assets/gameover.mp3");

// Música de fondo actualizada
const music = document.getElementById("starwarsMusic");

let score, lives, energy, gameStarted, gameEnded;
let player, aliens, bullets, enemyBullets, explosions;
let alienDir, alienSpeed;

function init() {
    score = 0; lives = 3; energy = 5;
    gameStarted = false; gameEnded = false;
    player = { x: 370, y: 430, w: 60, h: 50, speed: 25 };
    aliens = []; bullets = []; enemyBullets = []; explosions = [];
    alienDir = 1; alienSpeed = 1.0;
    createAliens();
    updateHUD();
}

function createAliens() {
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 8; c++) {
            aliens.push({ x: 60 + c * 80, y: 50 + r * 60, w: 50, h: 40, alive: true });
        }
    }
}

setInterval(() => {
    if (gameStarted && !gameEnded && energy < 5) {
        energy++; updateHUD();
    }
}, 500);

setInterval(() => {
    if (!gameStarted || gameEnded) return;
    let vivos = aliens.filter(a => a.alive);
    if (vivos.length > 0 && Math.random() > 0.4) {
        let a = vivos[Math.floor(Math.random() * vivos.length)];
        enemyBullets.push({ x: a.x + a.w/2, y: a.y + a.h, w: 4, h: 12 });
    }
}, 1000);

document.addEventListener("keydown", (e) => {
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
    
    if (e.code === "Enter" && !gameStarted) {
        gameStarted = true;
        document.getElementById("start-screen").classList.add("hidden");
        // Iniciar música de fondo
        music.play();
    }
    if (!gameStarted || gameEnded) return;

    if (e.code === "ArrowLeft" && player.x > 0) player.x -= player.speed;
    if (e.code === "ArrowRight" && player.x < canvas.width - player.w) player.x += player.speed;
    
    if (e.code === "Space" && energy > 0) {
        bullets.push({ x: player.x + player.w/2 - 2, y: player.y, w: 4, h: 15 });
        energy--; shootSound.currentTime = 0; shootSound.play();
        updateHUD();
    }
});

function update() {
    if (!gameStarted || gameEnded) return;

    bullets.forEach((b, i) => { b.y -= 12; if (b.y < 0) bullets.splice(i, 1); });

    enemyBullets.forEach((b, i) => {
        b.y += 5;
        if (b.y > canvas.height) enemyBullets.splice(i, 1);
        if (b.x < player.x + player.w && b.x + b.w > player.x && b.y < player.y + player.h && b.y + b.h > player.y) {
            lives--; enemyBullets.splice(i, 1); updateHUD();
            explosionSound.currentTime = 0; explosionSound.play();
            if (lives <= 0) finish(false);
        }
    });

    bullets.forEach((b, bi) => {
        aliens.forEach(a => {
            if (a.alive && b.x < a.x + a.w && b.x + b.w > a.x && b.y < a.y + a.h && b.y + b.h > a.y) {
                a.alive = false; bullets.splice(bi, 1); score += 10;
                explosionSound.currentTime = 0; explosionSound.play();
                explosions.push({ x: a.x, y: a.y, timer: 15 });
                updateHUD();
            }
        });
    });

    let vivos = aliens.filter(a => a.alive);
    alienSpeed = 1.0 + (24 - vivos.length) * 0.15;
    let edge = false;
    vivos.forEach(a => {
        a.x += alienSpeed * alienDir;
        if (a.x <= 0 || a.x + a.w >= canvas.width) edge = true;
        if (a.y + a.h >= player.y) finish(false);
    });
    if (edge) { alienDir *= -1; aliens.forEach(a => a.y += 20); }
    if (vivos.length === 0) finish(true);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    if (!gameStarted) return;
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    aliens.forEach(a => { if (a.alive) ctx.drawImage(alienImg, a.x, a.y, a.w, a.h); });
    explosions.forEach((ex, i) => {
        ctx.drawImage(explosionImg, ex.x, ex.y, 50, 50);
        ex.timer--; if (ex.timer <= 0) explosions.splice(i, 1);
    });
    ctx.fillStyle = "#ffe81f"; bullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
    ctx.fillStyle = "#ff2222"; enemyBullets.forEach(b => ctx.fillRect(b.x, b.y, b.w, b.h));
}

function updateHUD() {
    document.getElementById("score").innerText = score.toString().padStart(4, '0');
    document.getElementById("lives").innerText = lives;
    document.getElementById("energyFill").style.width = (energy / 5) * 100 + "%";
}

function finish(win) {
    gameEnded = true; 
    music.pause();
    music.currentTime = 0;
    document.getElementById("end-screen").classList.remove("hidden");
    const msg = document.getElementById("end-message");
    msg.innerText = win ? "MISIÓN CUMPLIDA" : "CONEXIÓN PERDIDA";
    msg.style.color = win ? "#ffe81f" : "#ff2222";
    win ? winSound.play() : gameOverSound.play();
}

document.getElementById("restartBtn").onclick = () => {
    init(); document.getElementById("end-screen").classList.add("hidden");
    gameStarted = true; 
    music.play();
};

function loop() { update(); draw(); requestAnimationFrame(loop); }
init(); loop();