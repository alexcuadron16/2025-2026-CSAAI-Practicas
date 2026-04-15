const grid = document.getElementById('grid-8');
const display = document.getElementById('display-word');
const levelText = document.getElementById('level-num');
const timerText = document.getElementById('timer');
const statusText = document.getElementById('status');
const btnStart = document.getElementById('btn-start');
const btnStop = document.getElementById('btn-stop');

// Audios
const musicBg = document.getElementById('music-bg');
const sndStep = document.getElementById('snd-step');
const sndLevel = document.getElementById('snd-level');
const sndWin = document.getElementById('snd-win');

// Botones Sonido
const btnMusicOn = document.getElementById('btn-music-on');
const btnMusicOff = document.getElementById('btn-music-off');
const btnSfxOn = document.getElementById('btn-sfx-on');
const btnSfxOff = document.getElementById('btn-sfx-off');

let state = {
    level: 1,
    index: 0,
    interval: null,
    timerInterval: null,
    startTime: 0,
    speed: 1000,
    musicEnabled: false,
    sfxEnabled: true
};

const patterns = [
    [0,0,0,0,1,1,1,1], [0,1,0,1,0,1,0,1],
    [1,1,0,0,1,1,0,0], [1,0,0,1,0,1,1,0],
    [1,0,1,0,1,1,0,1]
];

// Configuración inicial de volumen bajo para música
musicBg.volume = 0.15; 

// --- GESTIÓN DE SONIDO ---
function updateSoundButtons() {
    btnMusicOn.className = state.musicEnabled ? 'sound-active' : '';
    btnMusicOff.className = !state.musicEnabled ? 'sound-active' : 'off';
    btnSfxOn.className = state.sfxEnabled ? 'sound-active' : '';
    btnSfxOff.className = !state.sfxEnabled ? 'sound-active' : 'off';
}

btnMusicOn.onclick = () => { 
    state.musicEnabled = true; 
    updateSoundButtons(); 
    if(btnStart.disabled) musicBg.play(); 
};
btnMusicOff.onclick = () => { 
    state.musicEnabled = false; 
    updateSoundButtons(); 
    musicBg.pause(); 
};
btnSfxOn.onclick = () => { state.sfxEnabled = true; updateSoundButtons(); };
btnSfxOff.onclick = () => { state.sfxEnabled = false; updateSoundButtons(); };

// --- LÓGICA JUEGO ---
function initBoard() {
    grid.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        grid.innerHTML += `<div class="card" id="c-${i}"><img src="" alt=""><p></p></div>`;
    }
}

function updateCards() {
    const sequence = document.getElementById('select-sequence').value.split('/');
    const currentPattern = patterns[state.level - 1];
    for (let i = 0; i < 8; i++) {
        const card = document.getElementById(`c-${i}`);
        const word = (currentPattern[i] === 0 ? sequence[0] : sequence[1]).trim();
        card.querySelector('p').innerText = word.toUpperCase();
        card.querySelector('img').src = `./assets/img/${word.toLowerCase()}.png`;
    }
    state.speed = 1100 - (state.level * 165);
}

function playStep() {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    const activeCard = document.getElementById(`c-${state.index}`);
    if (activeCard) {
        activeCard.classList.add('active');
        display.innerText = activeCard.querySelector('p').innerText;
        if (state.sfxEnabled) {
            const step = sndStep.cloneNode();
            step.play();
        }
    }
    state.index++;
    if (state.index >= 8) {
        state.index = 0;
        checkNext();
    }
}

function checkNext() {
    if (state.level < 5) {
        clearInterval(state.interval);
        state.level++;
        levelText.innerText = state.level;
        if(state.sfxEnabled) sndLevel.play();
        setTimeout(() => {
            updateCards();
            state.interval = setInterval(playStep, state.speed);
        }, 1000);
    } else {
        if(state.sfxEnabled) sndWin.play();
        stopGame("¡VICTORIA!");
    }
}

btnStart.onclick = () => {
    state.level = parseInt(document.getElementById('select-start-level').value);
    state.index = 0;
    levelText.innerText = state.level;
    statusText.innerText = "Jugando";
    btnStart.disabled = true;
    btnStop.disabled = false;
    initBoard();
    updateCards();
    state.interval = setInterval(playStep, state.speed);
    state.startTime = Date.now();
    state.timerInterval = setInterval(() => {
        timerText.innerText = ((Date.now() - state.startTime) / 1000).toFixed(1);
    }, 100);
    if (state.musicEnabled) musicBg.play();
};

function stopGame(msg) {
    clearInterval(state.interval);
    clearInterval(state.timerInterval);
    musicBg.pause();
    musicBg.currentTime = 0;
    display.innerText = msg;
    statusText.innerText = "Parado";
    btnStart.disabled = false;
    btnStop.disabled = true;
}

btnStop.onclick = () => stopGame("DETENIDO");

// Inicializar
initBoard();
updateSoundButtons();