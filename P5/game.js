const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 500;

let estado = 'MENU';
let modoActual = '';
let puntuacion = { jugador: 0, bot: 0 };
let teclas = {};

// LÍMITE FÍSICO REAL PARA TODOS
const MARGEN = 30; 

const pelota = { x: 400, y: 250, radio: 10, dx: 0, dy: 0, friccion: 0.985 };
const jugador = { x: 120, y: 250, radio: 20, v: 5, color: '#1E88E5', angulo: 0 };
const bots = [
    { x: 200, y: 250, radio: 20, v: 2.5, color: '#4FC3F7', equipo: 'mio', zona: 'defensa' },
    { x: 600, y: 200, radio: 20, v: 3.2, color: '#E53935', equipo: 'rival', zona: 'ataque' },
    { x: 700, y: 250, radio: 20, v: 2.2, color: '#E53935', equipo: 'rival', zona: 'portero' }
];

const porteriaH = 140;
const pY = (canvas.height - porteriaH) / 2;

window.addEventListener('keydown', e => teclas[e.code] = true);
window.addEventListener('keyup', e => teclas[e.code] = false);

function configurarPartida(modo) {
    modoActual = modo;
    puntuacion = { jugador: 0, bot: 0 };
    document.getElementById('score-text').innerText = "0 - 0";
    document.getElementById('menu-inicial').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    resetearPosiciones();
    iniciarCuentaAtras();
}

function iniciarCuentaAtras() {
    estado = 'CUENTA';
    let segundos = 3;
    const overlay = document.getElementById('overlay-status');
    const texto = document.getElementById('texto-status');
    overlay.classList.remove('hidden');
    document.getElementById('contenedor-reinicio').innerHTML = "";
    
    const interval = setInterval(() => {
        if (segundos > 0) texto.innerText = segundos;
        else if (segundos === 0) texto.innerText = "¡DALE!";
        else {
            clearInterval(interval);
            overlay.classList.add('hidden');
            estado = 'JUGANDO';
            pelota.dx = (Math.random() > 0.5 ? 5 : -5);
            pelota.dy = (Math.random() - 0.5) * 4;
        }
        segundos--;
    }, 800);
}

function actualizar() {
    if (estado !== 'JUGANDO') return;

    // Movimiento Jugador
    let dx = 0, dy = 0;
    if (teclas['ArrowUp'] || teclas['KeyW']) dy = -1;
    if (teclas['ArrowDown'] || teclas['KeyS']) dy = 1;
    if (teclas['ArrowLeft'] || teclas['KeyA']) dx = -1;
    if (teclas['ArrowRight'] || teclas['KeyD']) dx = 1;
    
    if (dx !== 0 || dy !== 0) {
        jugador.angulo = Math.atan2(dy, dx);
        jugador.x += dx * jugador.v;
        jugador.y += dy * jugador.v;
    }
    
    // LÍMITES JUGADOR (No puede pisar fuera del MARGEN)
    jugador.x = Math.max(jugador.radio + MARGEN, Math.min(canvas.width - jugador.radio - MARGEN, jugador.x));
    jugador.y = Math.max(jugador.radio + MARGEN, Math.min(canvas.height - jugador.radio - MARGEN, jugador.y));

    // Lógica Bots con límites
    bots.forEach(b => {
        let objX = b.x, objY = b.y;
        if (b.zona === 'defensa') {
            if (pelota.x < canvas.width * 0.5) { objX = pelota.x; objY = pelota.y; }
            else { objX = 200; objY = 250; }
        } else if (b.zona === 'ataque') {
            if (pelota.x > canvas.width * 0.4) { objX = pelota.x; objY = pelota.y; }
            else { objX = 600; objY = 250; }
        } else if (b.zona === 'portero') {
            objY = pelota.y; objX = canvas.width - MARGEN - 25;
        }

        if (Math.abs(b.x - objX) > 4) b.x += (b.x < objX ? b.v : -b.v);
        if (Math.abs(b.y - objY) > 4) b.y += (b.y < objY ? b.v : -b.v);

        b.x = Math.max(b.radio + MARGEN, Math.min(canvas.width - b.radio - MARGEN, b.x));
        b.y = Math.max(b.radio + MARGEN, Math.min(canvas.height - b.radio - MARGEN, b.y));
    });

    // Pelota
    pelota.x += pelota.dx;
    pelota.y += pelota.dy;
    pelota.dx *= pelota.friccion;
    pelota.dy *= pelota.friccion;

    // Rebote Pelota en MARGEN (Techo y Suelo)
    if (pelota.y - pelota.radio < MARGEN) {
        pelota.y = MARGEN + pelota.radio;
        pelota.dy *= -1;
    } else if (pelota.y + pelota.radio > canvas.height - MARGEN) {
        pelota.y = canvas.height - MARGEN - pelota.radio;
        pelota.dy *= -1;
    }

    // Rebote o Gol en MARGEN (Laterales)
    if (pelota.x - pelota.radio < MARGEN) {
        if (pelota.y > pY && pelota.y < pY + porteriaH) gol('bot');
        else { pelota.x = MARGEN + pelota.radio; pelota.dx *= -1; }
    } else if (pelota.x + pelota.radio > canvas.width - MARGEN) {
        if (pelota.y > pY && pelota.y < pY + porteriaH) gol('jugador');
        else { pelota.x = canvas.width - MARGEN - pelota.radio; pelota.dx *= -1; }
    }

    checkColision(jugador, 1);
    bots.forEach(b => checkColision(b, b.equipo === 'mio' ? 1 : -1));
}

function checkColision(p, dir) {
    let dist = Math.hypot(pelota.x - p.x, pelota.y - p.y);
    if (dist < pelota.radio + p.radio) {
        pelota.dx = dir * 7.5;
        pelota.dy = (pelota.y - p.y) * 0.5;
        let ang = Math.atan2(pelota.y - p.y, pelota.x - p.x);
        pelota.x = p.x + (pelota.radio + p.radio + 2) * Math.cos(ang);
    }
}

function gol(quien) {
    puntuacion[quien]++;
    document.getElementById('score-text').innerText = `${puntuacion.jugador} - ${puntuacion.bot}`;
    estado = 'GOL';
    const texto = document.getElementById('texto-status');
    texto.innerText = quien === 'jugador' ? "¡GOLAZO!" : "¡GOL RIVAL!";
    document.getElementById('overlay-status').classList.remove('hidden');

    const fin = (modoActual === 'gol-oro') || (modoActual === '3-goles' && (puntuacion.jugador === 3 || puntuacion.bot === 3));

    if (fin) {
        setTimeout(() => {
            texto.innerText = puntuacion.jugador > puntuacion.bot ? "¡CAMPEÓN!" : "GAME OVER";
            const btnR = document.createElement('button');
            btnR.innerText = "REINTENTAR";
            btnR.onclick = () => configurarPartida(modoActual);
            const btnM = document.createElement('button');
            btnM.innerText = "MENÚ";
            btnM.onclick = volverAlMenu;
            document.getElementById('contenedor-reinicio').append(btnR, btnM);
        }, 1200);
    } else {
        setTimeout(() => { resetearPosiciones(); iniciarCuentaAtras(); }, 1500);
    }
}

function volverAlMenu() {
    estado = 'MENU';
    document.getElementById('overlay-status').classList.add('hidden');
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('menu-inicial').classList.remove('hidden');
}

function resetearPosiciones() {
    pelota.x = canvas.width / 2; pelota.y = canvas.height / 2;
    pelota.dx = 0; pelota.dy = 0;
    jugador.x = MARGEN + 60; jugador.y = 250;
    bots[0].x = MARGEN + 150; bots[0].y = 250;
    bots[1].x = canvas.width - MARGEN - 150; bots[1].y = 250;
    bots[2].x = canvas.width - MARGEN - 30; bots[2].y = 250;
}

function dibujar() {
    ctx.fillStyle = "#2e7d32"; ctx.fillRect(0,0, canvas.width, canvas.height);
    
    // Líneas del campo coincidiendo con los límites físicos
    ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 4;
    ctx.strokeRect(MARGEN, MARGEN, canvas.width - (MARGEN*2), canvas.height - (MARGEN*2));
    
    ctx.beginPath(); ctx.moveTo(canvas.width/2, MARGEN); ctx.lineTo(canvas.width/2, canvas.height-MARGEN); ctx.stroke();
    ctx.beginPath(); ctx.arc(canvas.width/2, canvas.height/2, 50, 0, Math.PI*2); ctx.stroke();
    
    // Porterías
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 6;
    ctx.strokeRect(MARGEN - 10, pY, 10, porteriaH);
    ctx.strokeRect(canvas.width - MARGEN, pY, 10, porteriaH);

    // Jugador
    ctx.save(); ctx.translate(jugador.x, jugador.y); ctx.rotate(jugador.angulo);
    ctx.fillStyle = jugador.color; ctx.beginPath(); ctx.arc(0, 0, jugador.radio, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(10,-6); ctx.lineTo(10,6); ctx.fill();
    ctx.restore();

    bots.forEach(b => { 
        ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.radio, 0, Math.PI*2); ctx.fill();
    });

    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(pelota.x, pelota.y, pelota.radio, 0, Math.PI*2); ctx.fill();
}

function loop() { actualizar(); dibujar(); requestAnimationFrame(loop); }
loop();