// ---------------------------------------------------------------------------
// Procedural Web Audio Sound Synthesizer
// Clean, low-latency audio effects synthesized directly with Web Audio API.
// No external assets required. Gracefully handles user gesture unlocking.
// ---------------------------------------------------------------------------

let audioCtx: AudioContext | null = null
let soundEnabled = true

// Initialize audio state from storage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('space_portfolio_sound')
  if (saved !== null) {
    soundEnabled = saved === 'true'
  }
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('space_portfolio_sound', String(enabled))
  }
  if (enabled) {
    getAudioContext()
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled)
  return soundEnabled
}

// ── Sound Synthesizers ─────────────────────────────────────────────────────

/** Bright crystal dual-tone chime when collecting energy orbs */
export function playOrbSound() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gain = ctx.createGain()

  osc1.type = 'sine'
  osc2.type = 'triangle'

  osc1.frequency.setValueAtTime(587.33, now) // D5
  osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15) // D6

  osc2.frequency.setValueAtTime(880, now) // A5
  osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.18) // A6

  gain.gain.setValueAtTime(0.14, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28)

  osc1.connect(gain)
  osc2.connect(gain)
  gain.connect(ctx.destination)

  osc1.start(now)
  osc2.start(now)
  osc1.stop(now + 0.3)
  osc2.stop(now + 0.3)
}

/** Harmonic recovery chord when collecting a shield repair kit */
export function playShieldKitSound() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const freqs = [392.0, 493.88, 587.33, 783.99] // G4, B4, D5, G5

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, now + idx * 0.04)

    gain.gain.setValueAtTime(0.1, now + idx * 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.04)
    osc.stop(now + 0.5)
  })
}

/** Low-frequency muffled thud when colliding with an asteroid */
export function playImpactSound() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(120, now)
  osc.frequency.exponentialRampToValueAtTime(35, now + 0.35)

  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.4)
}

/** Subtle radar alert ping when incoming asteroid is detected */
export function playThreatBeep() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'square'
  osc.frequency.setValueAtTime(880, now)
  osc.frequency.setValueAtTime(659.25, now + 0.07)

  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + 0.18)
}

/** Triumphant 4-note chime when discovering a new planet or completing a mission */
export function playDiscoverySound() {
  if (!soundEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return

  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, now + idx * 0.09)

    gain.gain.setValueAtTime(0.12, now + idx * 0.09)
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now + idx * 0.09)
    osc.stop(now + idx * 0.09 + 0.4)
  })
}
