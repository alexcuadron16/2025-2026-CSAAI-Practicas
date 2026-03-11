'use strict';

var secretCode = [];
var remainingAttempts = 7;
var seconds = 0;
var timerInterval = null;
var foundCount = 0;

var displayElements = [
    document.getElementById('pos-0'),
    document.getElementById('pos-1'),
    document.getElementById('pos-2'),
    document.getElementById('pos-3')
];

var attemptsDisplay = document.getElementById('attempts');
var timerDisplay = document.getElementById('timer');
var keypad = document.getElementById('keypad');
var messageArea = document.getElementById('message');

function generateSecretCode() {

    var digits = [0,1,2,3,4,5,6,7,8,9];

    digits.sort(function() {
        return Math.random() - 0.5;
    });

    return digits.slice(0,4);
}

function updateTimerDisplay(){

    var m = Math.floor(seconds / 60).toString().padStart(2,'0');
    var s = (seconds % 60).toString().padStart(2,'0');

    timerDisplay.innerText = m + ":" + s;
}

function startTimer(){

    if(timerInterval) {
        return;
    }

    messageArea.innerText = "GO GO GO!";

    timerInterval = setInterval(function(){

        seconds++;
        updateTimerDisplay();

    },1000);
}

function stopTimer(){

    clearInterval(timerInterval);
    timerInterval = null;
}

function resetGame(){

    stopTimer();

    seconds = 0;
    remainingAttempts = 7;
    foundCount = 0;

    secretCode = generateSecretCode();

    updateTimerDisplay();

    attemptsDisplay.innerText = remainingAttempts.toString().padStart(2,'0');

    messageArea.innerText = "PUSH START OR KEY";

    displayElements.forEach(function(el){

        el.innerText="*";
        el.classList.remove('hit');

    });

    createKeypad();
}

function createKeypad(){

    keypad.innerHTML='';

    for(var i=0;i<=9;i++){

        var btn=document.createElement('button');

        btn.innerText=i;

        btn.classList.add('num-btn');

        btn.onclick=(function(num,b){
            return function(){
                handleInput(num,b);
            };
        })(i,btn);

        keypad.appendChild(btn);
    }
}

function handleInput(num,btn){

    if(!timerInterval){
        startTimer();
    }

    btn.disabled=true;

    remainingAttempts--;

    attemptsDisplay.innerText = remainingAttempts.toString().padStart(2,'0');

    secretCode.forEach(function(digit,index){

        if(digit===num){

            displayElements[index].innerText=digit;

            displayElements[index].classList.add('hit');

            foundCount++;
        }

    });

    checkEndGame();
}

function checkEndGame(){

    if(foundCount===4){

        stopTimer();

        disableKeypad();

        messageArea.innerHTML =
        "YOU WIN!<br>" +
        "TIME: " + timerDisplay.innerText + "<br>" +
        "USED: " + (7-remainingAttempts) + "<br>" +
        "LEFT: " + remainingAttempts;
    }

    else if(remainingAttempts===0){

        stopTimer();

        disableKeypad();

        secretCode.forEach(function(digit,index){

            displayElements[index].innerText=digit;

        });

        messageArea.innerHTML =
        "GAME OVER<br>" +
        "CODE: " + secretCode.join('');
    }
}

function disableKeypad(){

    var buttons=document.querySelectorAll('.num-btn');

    buttons.forEach(function(b){
        b.disabled=true;
    });
}

document.getElementById('btn-start').onclick=startTimer;
document.getElementById('btn-stop').onclick=stopTimer;
document.getElementById('btn-reset').onclick=resetGame;

resetGame();