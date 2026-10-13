// ---------------------------------------------------------------------------
// GameManager — shared game state (score, health, boost, collectibles, mode)
// Lives as a module-level ref-based store so it can be shared between
// the 3D canvas and the DOM HUD without causing re-renders every frame.
// ---------------------------------------------------------------------------

export type GameMode = 'explore' | 'game'

export type GameStateSnapshot = {
  mode: GameMode
  score: number
  health: number          // 0–100
  boost: number           // 0–100
  collectibles: number    // total collected this session
  paused: boolean
  objectives: string[]
  distance: number        // units flown
  difficulty: number      // 1–5, ramps up with distance
  invulnerable: boolean   // brief shield after impact
}

// Listeners that the HUD subscribes to for DOM updates
type Listener = (snap: GameStateSnapshot) => void
const listeners: Set<Listener> = new Set()

function notify() {
  const snap = getSnapshot()
  listeners.forEach((l) => l(snap))
}

// ─── Mutable internal state ────────────────────────────────────────────────
let mode: GameMode = 'explore'
let score = 0
let health = 100
let boost = 100
let collectibles = 0
let paused = false
let distance = 0
let difficulty = 1
let invulnerable = false
let invulnTimer = 0
let boostRechargeTimer = 0

const OBJECTIVES = [
  'Reach the PROJECTS planet',
  'Collect 5 energy orbs',
  'Visit all 9 portfolio stations',
  'Survive without taking damage',
]
let objectiveIndex = 0

// ─── Public API ────────────────────────────────────────────────────────────

export function getSnapshot(): GameStateSnapshot {
  return {
    mode, score, health, boost, collectibles, paused, distance, difficulty,
    invulnerable,
    objectives: [OBJECTIVES[objectiveIndex % OBJECTIVES.length]],
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setMode(m: GameMode) {
  mode = m
  notify()
}

export function togglePause() {
  paused = !paused
  notify()
}

export function restartGame() {
  score = 0
  health = 100
  boost = 100
  collectibles = 0
  paused = false
  distance = 0
  difficulty = 1
  invulnerable = false
  invulnTimer = 0
  boostRechargeTimer = 0
  objectiveIndex = 0
  notify()
}

/** Called every frame from a useFrame hook inside the Canvas */
export function tickGame(delta: number, speed: number, isBoosting: boolean) {
  if (paused || mode !== 'game') return

  // Clamp dt
  const dt = Math.min(delta, 0.1)

  // Distance
  distance += speed * dt
  score = Math.floor(distance * 0.5) + collectibles * 150
  difficulty = Math.min(5, 1 + Math.floor(distance / 200))

  // Boost consumption
  if (isBoosting && boost > 0) {
    boost = Math.max(0, boost - 35 * dt)
    boostRechargeTimer = 0
  } else {
    boostRechargeTimer += dt
    if (boostRechargeTimer > 1.2) {
      boost = Math.min(100, boost + 18 * dt)
    }
  }

  // Invulnerability countdown
  if (invulnerable) {
    invulnTimer -= dt
    if (invulnTimer <= 0) {
      invulnerable = false
      invulnTimer = 0
    }
  }

  // Objective cycling
  if (collectibles >= (objectiveIndex + 1) * 5) {
    objectiveIndex++
  }

  notify()
}

/** Called when ship hits an asteroid */
export function onImpact() {
  if (paused || mode !== 'game' || invulnerable) return
  health = Math.max(0, health - 20)
  invulnerable = true
  invulnTimer = 2.5
  notify()
}

/** Called when player collects an energy orb */
export function onCollect() {
  if (paused || mode !== 'game') return
  collectibles++
  score += 150
  boost = Math.min(100, boost + 25)   // partial boost refill on collect
  notify()
}

/** Returns true if player can use boost (has fuel and mode is game) */
export function canBoost(): boolean {
  return boost > 5
}
