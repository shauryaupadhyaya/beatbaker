const ctx = new AudioContext();

let isPlaying = false;
let step = 0;
let interval: number;

let bpm = 120;
let volume = 0.7;

function playSound(freq: number, time: number, duration = 0.15){
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "square";
  oscillator.frequency.value = freq;

  gainNode.gain.setValueAtTime(volume, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(time);
  oscillator.stop(time + duration);
}

function playKick(time: number){
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(200, time);
  oscillator.frequency.exponentialRampToValueAtTime(30, time + 0.08);

  gainNode.gain.setValueAtTime(volume, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(time);
  oscillator.stop(time + 0.12);
}

function playSnare(time: number){
  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i=0; i<bufferSize; i++){
    data[i] = Math.random() * 2 - 1;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(volume * 0.7, time);
  gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

  noise.connect(gainNode);
  gainNode.connect(ctx.destination);

  noise.start(time);
  noise.stop(time + 0.1); 
}

const pianoCells = Array.from(document.querySelectorAll("#pianoGrid .cell")) as HTMLDivElement[];
const drumCells = Array.from(document.querySelectorAll("#drumGrid .cell")) as HTMLDivElement[];

const cols = 16;
const pianoRows = 6;
const drumRows = 2;

function getPianoCell(row: number, col: number){
  return pianoCells[row * cols + col];
}

function getDrumCell(row: number, col: number){
  return drumCells[row * cols + col];
}

function getFrequency(row: number){
  const base = 220;
  return base + (pianoRows - row) * 40;
}

function updatePlayhead(){
  pianoCells.forEach(cell => cell.classList.remove("playhead"));
  drumCells.forEach(cell => cell.classList.remove("playhead"));

  for(let row = 0; row < pianoRows; row++){
    getPianoCell(row, step)?.classList.add("playhead");
  }

  for(let row = 0; row < drumRows; row++){
    getDrumCell(row, step)?.classList.add("playhead");
  }
}

function playStep(){
  const time = ctx.currentTime;
  for (let row = 0; row < pianoRows; row++){
    const cell = getPianoCell(row, step);
    if (cell?.classList.contains("active")){
      playSound(getFrequency(row), time);
    }
  }

  console.log("step:", step, "drum row 0:", getDrumCell(0, step), "drum row 1:", getDrumCell(1, step));

  for (let row = 0; row < drumRows; row++){
    const cell = getDrumCell(row, step);
    if (!cell?.classList.contains("active")) continue;

    if (row === 0){
      playKick(time);
    }

    if (row === 1){
      playSnare(time);
    }
  }

  updatePlayhead();
  step = (step + 1) % cols;
}

const playBtn = document.getElementById("playBtn") as HTMLButtonElement;
const stopBtn = document.getElementById("stopBtn") as HTMLButtonElement;
const clearBtn = document.getElementById("clearBtn") as HTMLButtonElement;

const bpmSlider = document.getElementById("bpmSlider") as HTMLInputElement;
const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
const bpmValue = document.getElementById("bpmValue") as HTMLSpanElement;

playBtn.addEventListener("click", async () => {
  await ctx.resume();

  if (isPlaying) return;

  isPlaying = true;

  const intervalTime = (60 / bpm / 4) * 1000;
  interval = window.setInterval(playStep, intervalTime);
});

stopBtn.addEventListener("click", () => {
  isPlaying = false;
  clearInterval(interval);
});

clearBtn.addEventListener("click", () => {
  pianoCells.forEach(cell => {
    cell.classList.remove("active");
    cell.classList.remove("playhead");
  });

  drumCells.forEach(cell => {
    cell.classList.remove("active");
    cell.classList.remove("playhead");
  });

  step = 0;
});

bpmSlider.addEventListener("input", () => {
  bpm = Number(bpmSlider.value);
  bpmValue.textContent = bpm.toString();

  if (isPlaying){
    clearInterval(interval);
    const intervalTime = (60 / bpm / 4) * 1000;
    interval = window.setInterval(playStep, intervalTime);
  }
});

volumeSlider.addEventListener("input", () => {
  volume = Number(volumeSlider.value);
});

document.addEventListener("keydown", async(event) => {
  if (event.code !== "Space") return;

  event.preventDefault();

  await ctx.resume();

  if(isPlaying){
    isPlaying = false;
    clearInterval(interval);
  } else{
    isPlaying = true;
    const intervalTime = (60 / bpm / 4) * 1000;
    interval = window.setInterval(playStep, intervalTime);
  }
});

console.log("Found cells:", pianoCells.length + drumCells.length);

[...pianoCells, ...drumCells].forEach(cell => {
  cell.addEventListener("click", () => {
    console.log("Cell clicked, toggling active");
    cell.classList.toggle("active");
  });

  cell.addEventListener("mousedown", () => {
    cell.classList.add("click");
  });

  cell.addEventListener("mouseup", () => {
    cell.classList.remove("click");
  });

  cell.addEventListener("mouseleave", () => {
    cell.classList.remove("click");
  });
});