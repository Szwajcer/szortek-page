const output = document.getElementById("terminal-output");

const messages = [
`>INITIALIZING TERMINAL...
>ACCESS GRANTED
>WELCOME USER: SZORTEK

>SET TERMINAL/INQUIRE

RIT-V300

>SET FILE/PROTECTION=OWNER:RWED ACCOUNTS.F
>SET HALT RESTART/MAINT

Initializing Robco Industries(TM) MF Boot Agent v2.3.0
RETROS BIOS
RBIOS-4.02.08.00 52EE5.E7.E8
Copyright 2070-2075 Robco Ind.
Uppermen: 64 KB
Root (6CG)
Maintenance Mode

>RUN DEBUG/ACCOUNTS.F
`,
startHackingGame,
`
>ALERT: DANGEROUS PRE-WAR TECHNOLOGY DETECTED
>LOCATION: VICINITY OF CURRENT OPERATIONS
>PRIORITY: HIGH

A piece of dangerous pre-war technology has been located in your area.
All personnel are advised to proceed with caution.

>MISSION DIRECTIVE:
Collect the package immediately. Ensure all standard retrieval protocols are followed.

>APPROXIMATE PACKAGE LOCATION:
Petrol Station ORLEN
Wiślana 1, 08-530 Dęblin

>REQUIRED ACCESS CODES:
Ab1QT56

REMEMBER: This technology cannot fall into the wrong hands.
The Brotherhood of Steel command expects full compliance.
Establish contact with the command after successful retrieval.
>END OF MESSAGE
`];

const typingSpeed = 50;   
const screenPause = 500; 

let currentMessage = 0;

function typeText(text, callback) {
  output.innerHTML = ''; 
  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  output.appendChild(cursor);

  let i = 0;

  function typeChar() {
    if (i < text.length) {
      const char = text.charAt(i);
      cursor.insertAdjacentHTML('beforebegin', char === '\n' ? '<br>' : char);
      if (char !== '\n' && char.trim() !== '' && (Math.random() < 0.9)) playTypeSound();
      i++;
      setTimeout(typeChar, typingSpeed + Math.random() * 60 - 20);
    } else {
      callback();
    }
  }

  typeChar();
}

function playTypeSound() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = ctx.sampleRate * 0.025; 
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (Math.random() < 0.9 ? 0.25 : 0.1);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08); 

  noise.connect(gain);
  gain.connect(ctx.destination);

  noise.start();
  noise.stop(ctx.currentTime + 0.08);
}

function runTerminalSequence() {
  const current = messages[currentMessage];

  if (typeof current === "function") {
    current(); 
    return; 
  }

  const text = current.trimStart();
  typeText(text, () => {
    if (currentMessage >= messages.length - 1) return;
    setTimeout(() => {
      currentMessage++;
      runTerminalSequence();
    }, screenPause);
  });
}

function startHackingGame() {
  output.innerHTML = ""; 

  const passwordWords = [
    "BELORE", "ALEBURZA", "SUSHIROLL", "PANDA", "ANTORUS", "ILLIDAN", "DAVE", "NEKROMANCI",
    "MALFURION", "TAZ'DINGO", "BALDURAN", "MAYOIF", "LISTERINE"
  ];
  const password = passwordWords[Math.floor(Math.random() * passwordWords.length)];
  const fillerChars = "{}[]()<>!@#$%^&*+-=/\\|.";
  const rows = 12;      
  const cols = 30;      
  let attemptsLeft = 6;
  let gameOver = false;  

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid[r][c] = fillerChars.charAt(Math.floor(Math.random() * fillerChars.length));
    }
  }

  function placeWord(word) {
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const row = Math.floor(Math.random() * rows);
      const maxColStart = cols - word.length;
      if (maxColStart < 0) return false; 
      const col = Math.floor(Math.random() * (maxColStart + 1));

      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const cell = grid[row][col + i];
        if (typeof cell === 'object' && cell.placed) { ok = false; break; }
      }
      if (!ok) continue;

      for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = { char: word[i], placed: true, word, index: i };
      }
      return true;
    }
    return false;
  }

  const shuffled = passwordWords.slice().sort(() => Math.random() - 0.5);
  shuffled.forEach(w => placeWord(w));

  const instruction = document.createElement("div");
  instruction.textContent = `>SELECT THE CORRECT PASSWORD   Attempts=${attemptsLeft}`;
  instruction.classList.add('instruction-line');
  output.appendChild(instruction);

  const gridContainer = document.createElement('div');
  gridContainer.classList.add('grid-container');
  output.appendChild(gridContainer);

  const cursor = document.createElement("span");
  cursor.classList.add("cursor");
  output.appendChild(cursor);

  function renderGrid() {
      gridContainer.innerHTML = '';
  let currentRow = 0;

  function renderNextRow() {
    if (currentRow >= rows) return;
    playTypeSound();
    const rowDiv = document.createElement('div');
    rowDiv.classList.add('grid-row');

    for (let c = 0; c < cols; ) {
      const cell = grid[currentRow][c];

      if (typeof cell === 'object' && cell.placed && cell.index === 0) {
        const word = cell.word;
        const wordSpan = document.createElement('span');
        wordSpan.classList.add('grid-word', 'hack-word');
        wordSpan.textContent = word;
        wordSpan.dataset.word = word;
        wordSpan.style.cursor = 'pointer';
        wordSpan.addEventListener('click', () => handleWordClick(wordSpan.dataset.word));
        rowDiv.appendChild(wordSpan);
        c += word.length;
      } else {
        const ch = (typeof cell === 'object') ? cell.char : cell;
        const chSpan = document.createElement('span');
        chSpan.classList.add('grid-char');
        chSpan.textContent = ch;
        rowDiv.appendChild(chSpan);
        c += 1;
      }
    }

    gridContainer.appendChild(rowDiv);
    currentRow++;
    setTimeout(renderNextRow, 80); 
  }

  renderNextRow();
}

  function handleWordClick(selectedWord) {
    if (attemptsLeft <= 0 || gameOver) return;
    playTypeSound();

    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

    let likeness = 0;
    for (let i = 0; i < password.length; i++) {
      if (selectedWord[i] === password[i]) likeness++;
    }

    const resultLine = document.createElement('div');
    resultLine.classList.add('result-line');
    resultLine.textContent = `${selectedWord}   Likeness=${likeness}`;
    output.appendChild(resultLine);

    attemptsLeft--;
    instruction.textContent = `>SELECT THE CORRECT PASSWORD   Attempts=${attemptsLeft}`;

    const allWordSpans = gridContainer.querySelectorAll('[data-word]');
    allWordSpans.forEach(span => {
      if (span.dataset.word === selectedWord) {
        span.classList.add('word-picked');
        span.style.pointerEvents = 'none';
      }
    });

    if (selectedWord === password) {
      const successLine = document.createElement('div');
      successLine.classList.add('success-line');
      successLine.textContent = ">ACCESS GRANTED";
      output.appendChild(successLine);
      showAchievement();
      endGame(true);
      return;
    }

    if (attemptsLeft <= 0) {
      const failLine = document.createElement('div');
      failLine.classList.add('fail-line');
      failLine.textContent = `>ACCESS DENIED`;
      output.appendChild(failLine);
      endGame(false);
      return;
    }

    output.appendChild(cursor);
  }

  function endGame(success) {
    if (gameOver) return;
    gameOver = true;

    const clickable = gridContainer.querySelectorAll('[data-word]');
    clickable.forEach(s => s.style.pointerEvents = 'none');

    if (success) {
      setTimeout(() => {
        if (currentMessage < messages.length - 1) {
          currentMessage++;
          runTerminalSequence();
        }
      }, 1000);
    } else {
      const restartLine = document.createElement('div');
      restartLine.classList.add('restart-line');
      restartLine.textContent = ">PRESS ANY KEY TO RESTART";
      output.appendChild(restartLine);

      const restartHandler = () => {
        document.removeEventListener('keydown', restartHandler);
        document.removeEventListener('click', restartHandler);
        rebootTerminal();
      };

      setTimeout(() => {
        document.addEventListener('keydown', restartHandler);
        document.addEventListener('click', restartHandler);
      }, 400);
    }
  }

  function rebootTerminal() {
    document.body.classList.add('crt-flash');
    setTimeout(() => document.body.classList.remove('crt-flash'), 600);
    output.innerHTML = ""; 
    const cursor = document.createElement('span');
    cursor.classList.add('cursor');
    output.appendChild(cursor);

    const rebootMessage = ">REBOOTING TERMINAL...";
    let i = 0;

    function typeChar() {
      if (i < rebootMessage.length) {
        cursor.insertAdjacentText('beforebegin', rebootMessage[i]);
        if (rebootMessage[i] !== '\n' && rebootMessage[i].trim() !== '' && (Math.random() < 0.9)) playTypeSound();
        i++;
        setTimeout(typeChar, 60);
      } else {
        setTimeout(() => {
          startHackingGame();
        }, 700);
      }
    }
    typeChar();
  }

  renderGrid();
}

function waitForUserStart() {
  output.innerHTML = "";
  const cursor = document.createElement('span');
  cursor.classList.add('cursor');
  output.appendChild(cursor);

  const startMsg = ">PRESS ANY KEY TO REQUEST ACCESS...";
  let i = 0;

  function typeChar() {
    if (i < startMsg.length) {
      cursor.insertAdjacentText('beforebegin', startMsg[i]);
      if (startMsg[i] !== '\n' && startMsg[i].trim() !== '' && (Math.random() < 0.9)) playTypeSound();
      i++;
      setTimeout(typeChar, 50);
    } else {
      document.addEventListener('keydown', startHandler);
      document.addEventListener('click', startHandler);
    }
  }

  function startHandler() {
    document.removeEventListener('keydown', startHandler);
    document.removeEventListener('click', startHandler);

    document.body.classList.add('crt-flash');
    setTimeout(() => document.body.classList.remove('crt-flash'), 600);

    output.innerHTML = "";
    runTerminalSequence();
  }

  typeChar();
}

function showAchievement() {
    const popup = document.getElementById('achievement-popup');
    popup.style.display = 'flex';
    setTimeout(() => {
        popup.style.display = 'none';
    }, 6000); 
}

waitForUserStart();

