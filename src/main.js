const output = document.getElementById("terminal-output");

const messages = [
`>INITIALIZING TERMINAL...
>ACCESS GRANTED
>WELCOME USER: SZORTEK
`,
startHackingGame,
`
FILE 01: ABC
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
      i++;
      setTimeout(typeChar, typingSpeed);
    } else {
      callback();
    }
  }

  typeChar();
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
    "PROXY", "INDEX", "ARRAY", "BYTE",
    "SCRIPT", "LOOPS", "VALUE", "CACHE",
    "TANGO", "FOXTROT", "WHISKEY", "MARIA",
    "HATCH", "BOMBA", "SIUR"
  ];
  const password = passwordWords[Math.floor(Math.random() * passwordWords.length)];
  const fillerChars = "{}[]()<>!@#$%^&*+-=/\\|.";
  const rows = 16;      
  const cols = 40;      
  let attemptsLeft = 5;

  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const placements = []; 

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
      placements.push({ word, row, col, length: word.length });
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
    for (let r = 0; r < rows; r++) {
      const rowDiv = document.createElement('div');
      rowDiv.classList.add('grid-row');

      for (let c = 0; c < cols; ) {
        const cell = grid[r][c];

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
    }
  }

  function handleWordClick(selectedWord) {
    if (attemptsLeft <= 0) return;

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
      successLine.textContent = "> ACCESS GRANTED";
      output.appendChild(successLine);
      endGame(true);
      return;
    }

    if (attemptsLeft <= 0) {
      const failLine = document.createElement('div');
      failLine.classList.add('fail-line');
      failLine.textContent = `> ACCESS DENIED - PASSWORD WAS: ${password}`;
      output.appendChild(failLine);
      endGame(false);
      return;
    }

    output.appendChild(cursor);
  }

  function endGame(success) {
    const clickable = gridContainer.querySelectorAll('[data-word]');
    clickable.forEach(s => s.style.pointerEvents = 'none');

    setTimeout(() => {
      if (currentMessage < messages.length - 1) {
        currentMessage++;
        runTerminalSequence();
      }
    }, 1200);
  }

  renderGrid();
}

runTerminalSequence();
