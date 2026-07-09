const ctx = new AudioContext();
let isPlaying = false;
let step = 0;
let interval;
let bpm = 120;
let volume = 0.7;
function playSound(freq, time, duration = 0.15) {
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
function playKick(time) {
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
function playSnare(time) {
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
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
const pianoCells = Array.from(document.querySelectorAll("#pianoGrid .cell"));
const drumCells = Array.from(document.querySelectorAll("#drumGrid .cell"));
const cols = 16;
const pianoRows = 6;
const drumRows = 2;
function getPianoCell(row, col) {
    return pianoCells[row * cols + col];
}
function getDrumCell(row, col) {
    return drumCells[row * cols + col];
}
function getFrequency(row) {
    const base = 220;
    return base + (pianoRows - row) * 40;
}
function updatePlayhead() {
    pianoCells.forEach(cell => cell.classList.remove("playhead"));
    drumCells.forEach(cell => cell.classList.remove("playhead"));
    for (let row = 0; row < pianoRows; row++) {
        getPianoCell(row, step)?.classList.add("playhead");
    }
    for (let row = 0; row < drumRows; row++) {
        getDrumCell(row, step)?.classList.add("playhead");
    }
}
function playStep() {
    const time = ctx.currentTime;
    for (let row = 0; row < pianoRows; row++) {
        const cell = getPianoCell(row, step);
        if (cell?.classList.contains("active")) {
            playSound(getFrequency(row), time);
        }
    }
    console.log("step:", step, "drum row 0:", getDrumCell(0, step), "drum row 1:", getDrumCell(1, step));
    for (let row = 0; row < drumRows; row++) {
        const cell = getDrumCell(row, step);
        if (!cell?.classList.contains("active"))
            continue;
        if (row === 0) {
            playKick(time);
        }
        if (row === 1) {
            playSnare(time);
        }
    }
    updatePlayhead();
    step = (step + 1) % cols;
}
const playBtn = document.getElementById("playBtn");
const stopBtn = document.getElementById("stopBtn");
const clearBtn = document.getElementById("clearBtn");
const bpmSlider = document.getElementById("bpmSlider");
const volumeSlider = document.getElementById("volumeSlider");
const bpmValue = document.getElementById("bpmValue");
playBtn.addEventListener("click", async () => {
    await ctx.resume();
    if (isPlaying)
        return;
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
    if (isPlaying) {
        clearInterval(interval);
        const intervalTime = (60 / bpm / 4) * 1000;
        interval = window.setInterval(playStep, intervalTime);
    }
});
volumeSlider.addEventListener("input", () => {
    volume = Number(volumeSlider.value);
});
document.addEventListener("keydown", async (event) => {
    if (event.code !== "Space")
        return;
    event.preventDefault();
    await ctx.resume();
    if (isPlaying) {
        isPlaying = false;
        clearInterval(interval);
    }
    else {
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
// theme toggle
const themeToggle = document.getElementById("theme-toggle");
const sunIcon = document.getElementById("sunIcon");
const moonIcon = document.getElementById("moonIcon");
function setTheme(theme) {
    document.body.classList.toggle("light", theme === "light");
    localStorage.setItem("theme", theme);
    if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === "light" ? "block" : "none";
        moonIcon.style.display = theme === "light" ? "none" : "block";
    }
}
const savedTheme = localStorage.getItem("theme") || "dark";
setTheme(savedTheme);
themeToggle?.addEventListener("click", async () => {
    const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
    if (!document.startViewTransition) {
        setTheme(nextTheme);
        return;
    }
    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
    });
    await transition.ready;
    document.documentElement.animate({
        clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
        ]
    }, {
        duration: 1000,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        pseudoElement: '::view-transition-new(root)'
    });
});
export {};
//# sourceMappingURL=index.js.map