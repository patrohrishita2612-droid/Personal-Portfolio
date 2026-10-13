// ---------------------------------------------------------------------------
// GameManager — central store for game mechanics, survival, scoring & HUD
// Uses listener subscription to update DOM without per-frame React re-renders.
// ---------------------------------------------------------------------------

export type GameMode = 'active' | 'cruise' // 'active' = full survival hazards, 'cruise' = safe exploration

export type ThreatAlert = {
  active: boolean
  distance: number
  direction: string
}

export type GameStateSnapshot = {
  mode: GameMode
  score: number
  shield: number           // 0–100%
  boost: number            // 0–100%
  collectibles: number     // energy orbs collected
  shieldKits: number       // shield kits collected
  distance: number         // AU flown
  difficulty: number       // 1–5 threat level
  paused: boolean
  isCrashed: boolean
  crashCountdown: number   // 5 -> 0
  isInvulnerable: boolean  // shield bubble
  damageFlash: boolean     // impact visual flash
  damageNotice: string | null
  collectNotice: string | null
  threatAlert: ThreatAlert
  objective: string
}

type Listener = (snap: GameStateSnapshot) => void
const listeners: Set<Listener> = new Set()

function notify() {
  const snap = getSnapshot()
  listeners.forEach((l) => l(snap))
}

// ─── Mutable State ──────────────────────────────────────────────────────────
let mode: GameMode = 'active'
let score = 0
let shield = 100
let boost = 100
let collectibles = 0
let shieldKits = 0
let distance = 0
let difficulty = 1
let paused = false
let isCrashed = false
let crashCountdown = 5
let isInvulnerable = false
let invulnTimer = 0
let boostRechargeDelay = 0
let damageFlash = false
let damageNotice: string | null = null
let damageNoticeTimer = 0
let collectNotice: string | null = null
let collectNoticeTimer = 0

let threatAlert: ThreatAlert = {
  active: false,
  distance: 0,
  direction: 'AHEAD',
}

const OBJECTIVES = [
  'Explore the solar system & dodge incoming asteroids',
  'Reach the PROJECTS planet & inspect missions',
  'Collect 5 energy orbs to replenish fuel',
  'Visit the SKILLS crystal to recharge shields',
  'Survive 500 AU of deep space navigation',
  'Visit all 9 portfolio planetary stations',
]
let objectiveIdx = 0

// ─── Public API ────────────────────────────────────────────────────────────

export function getSnapshot(): GameStateSnapshot {
  return {
    mode,
    score,
    shield,
    boost,
    collectibles,
    shieldKits,
    distance,
    difficulty,
    paused,
    isCrashed,
    crashCountdown: Math.max(0, Math.ceil(crashCountdown)),
    isInvulnerable,
    damageFlash,
    damageNotice,
    collectNotice,
    threatAlert,
    objective: OBJECTIVES[objectiveIdx % OBJECTIVES.length],
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function setGameMode(newMode: GameMode) {
  mode = newMode
  notify()
}

export function togglePause() {
  if (isCrashed) return
  paused = !paused
  notify()
}

export function setPaused(p: boolean) {
  paused = p
  notify()
}

export function restartGame() {
  score = 0
  shield = 100
  boost = 100
  collectibles = 0
  shieldKits = 0
  distance = 0
  difficulty = 1
  paused = false
  isCrashed = false
  crashCountdown = 5
  isInvulnerable = false
  invulnTimer = 0
  boostRechargeDelay = 0
  damageFlash = false
  damageNotice = null
  collectNotice = null
  threatAlert = { active: false, distance: 0, direction: 'AHEAD' }
  objectiveIdx = 0
  notify()
}

// ─── Frame Ticker (called inside useFrame) ───────────────────────────────────

export function tickGame(delta: number, speed: number, isBoosting: boolean) {
  if (paused) return
  const dt = Math.min(delta, 0.1)

  // Crash countdown logic
  if (isCrashed) {
    crashCountdown -= dt
    if (crashCountdown <= 0) {
      respawnShip()
    } else {
      notify()
    }
    return
  }

  // Distance & Score progression
  distance += speed * dt
  const distScore = Math.floor(distance * 0.8)
  const pickupScore = collectibles * 150 + shieldKits * 200
  score = distScore + pickupScore

  // Difficulty scaling (1 to 5)
  difficulty = Math.min(5, 1 + Math.floor(distance / 150))

  // Boost consumption & regeneration
  if (isBoosting && boost > 0) {
    boost = Math.max(0, boost - 38 * dt)
    boostRechargeDelay = 0
  } else {
    boostRechargeDelay += dt
    if (boostRechargeDelay > 1.0) {
      boost = Math.min(100, boost + 22 * dt)
    }
  }

  // Invulnerability timer
  if (isInvulnerable) {
    invulnTimer -= dt
    if (invulnTimer <= 0) {
      isInvulnerable = false
      invulnTimer = 0
    }
  }

  // Feedback notifications timer
  if (damageNotice) {
    damageNoticeTimer -= dt
    if (damageNoticeTimer <= 0) {
      damageNotice = null
      damageFlash = false
    }
  }

  if (collectNotice) {
    collectNoticeTimer -= dt
    if (collectNoticeTimer <= 0) {
      collectNotice = null
    }
  }

  // Cycle objective
  if (collectibles >= 5 && objectiveIdx === 0) objectiveIdx = 1
  if (distance > 300 && objectiveIdx === 1) objectiveIdx = 2
  if (collectibles >= 10 && objectiveIdx === 2) objectiveIdx = 3

  notify()
}

// ─── Impact & Damage ─────────────────────────────────────────────────────────

export function onAsteroidImpact(damage = 25) {
  if (paused || mode === 'cruise' || isInvulnerable || isCrashed) return

  shield = Math.max(0, shield - damage)
  damageFlash = true
  damageNotice = `⚠️ HULL IMPACT! -${damage}% SHIELD`
  damageNoticeTimer = 1.4

  if (shield <= 0) {
    // Ship Destroyed!
    triggerCrash()
  } else {
    // Survives impact: grant 2.5s invulnerability window
    isInvulnerable = true
    invulnTimer = 2.5
    notify()
  }
}

function triggerCrash() {
  isCrashed = true
  crashCountdown = 5
  damageFlash = true
  damageNotice = '🚨 SHIP DESTROYED! HULL BREACH'
  damageNoticeTimer = 4.0
  notify()
}

export function respawnShip(respawnPos?: [number, number, number]) {
  isCrashed = false
  crashCountdown = 5
  shield = 100
  boost = 100
  isInvulnerable = true
  invulnTimer = 3.5 // 3.5s safe shield on respawn
  damageFlash = false
  damageNotice = '✅ SHIELD RESTORED · SYSTEMS ONLINE'
  damageNoticeTimer = 2.0
  notify()

  if (respawnCallback) {
    respawnCallback(respawnPos ?? [0, 0, 0])
  }
}

// Callback registered by Spacecraft to teleport on respawn
let respawnCallback: ((pos: [number, number, number]) => void) | null = null
export function registerRespawnHandler(fn: (pos: [number, number, number]) => void) {
  respawnCallback = fn
  return () => {
    if (respawnCallback === fn) respawnCallback = null
  }
}

// ─── Collectibles ───────────────────────────────────────────────────────────

export function onCollectOrb() {
  if (paused || isCrashed) return
  collectibles++
  boost = Math.min(100, boost + 35) // boost recharge
  collectNotice = '+150 PTS · BOOST FUEL CHARGED ⚡'
  collectNoticeTimer = 1.6
  notify()
}

export function onCollectShieldKit() {
  if (paused || isCrashed) return
  shieldKits++
  shield = Math.min(100, shield + 35) // shield repair
  collectNotice = '+200 PTS · SHIELD REPAIRED +35% 🛡️'
  collectNoticeTimer = 1.6
  notify()
}

export function setThreatAlert(alert: ThreatAlert) {
  threatAlert = alert
  notify()
}

export function canBoost(): boolean {
  return boost > 5 && !isCrashed
}

export function canFly(): boolean {
  return !isCrashed && !paused
}
