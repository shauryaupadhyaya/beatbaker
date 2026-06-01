const Audioctx = window.AudioContext || (window as any).webkitAudioContext;
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

const cells = Array.from(document.querySelectorAll(".cell")) as HTMLDivElement[];

const cols = 16;

function getCell(row: number, col: number){
  return cells[row * cols + col];
}

const rows = cells.length / cols;



function getFrequency(row: number){
  const base = 220;
  return base + (rows - row) * 40;
}

function playStep(){
  const time = ctx.currentTime;
  for (let row = 0; row < rows; row++){
    const cell = getCell(row, step);
    if (cell?.classList.contains("active")){
      playSound(getFrequency(row), time);
    }
  }

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
  cells.forEach(cell => cell.classList.remove("active"));
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

console.log("Found cells:", cells.length);

cells.forEach(cell => {
  cell.addEventListener("click", () => {
    console.log("Cell clicked, toggling active");
    cell.classList.toggle("active");
  });
});