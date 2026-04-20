function playSound(freq: number) {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = "square"
  osc.frequency.value = freq

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3)
}

document.querySelectorAll("button").forEach((button, i) => {
  button.addEventListener("click", () => {
    playSound(200 + i * 100)
  })
})