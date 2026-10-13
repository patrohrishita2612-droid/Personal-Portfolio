// ---------------------------------------------------------------------------
// GameManager — central store for game mechanics, missions, discovery & HUD
// ---------------------------------------------------------------------------

import { DIFFICULTY_CONFIG, PLANET_SAFE_ZONE_RADIUS } from './difficulty'
import type { DifficultyTier } from './difficulty'
import {
  playOrbSound,
  playShieldKitSound,
  playImpactSound,
  playThreatBeep,
  playDiscoverySound,
  isSoundEnabled,
  toggleSound,
  setSoundEnabled,
} from './sound'
import { destinations } from './destinations'

export type GameMode = 'active' | 'cruise' // 'active' = survival hazards, 'cruise' = safe exploration

export type ThreatAlert = {
  active: boolean
  distance: number
  direction: string
}

export type Mission = {
  id: string
  title: string
  description: string
  target: number
  rewardPoints: number
  isCompleted: boolean
}

export type WaypointInfo = {
  id: string
  name: string
  subtitle: string
  distance: number
  bearingAngle: number // angle in degrees relative to ship
}

export type GameStateSnapshot = {
  gameStarted: boolean
  mode: GameMode
  score: number
  shield: number           // 0–100%
  boost: number            // 0–100%
  collectibles: number     // energy orbs collected
  shieldKits: number       // shield kits collected
  distance: number         // AU flown
  difficultyTier: DifficultyTier
  paused: boolean
  isCrashed: boolean
  crashCountdown: number   // 5 -> 0
  isInvulnerable: boolean  // shield bubble
  damageFlash: boolean     // impact visual flash
  damageNotice: string | null
  collectNotice: string | null
  discoveryNotice: string | null
  missionCompleteNotice: string | null
  threatAlert: ThreatAlert
  activeMission: Mission
  missionProgress: number
  discoveredPlanets: string[]
  totalPlanets: number
  cleanStreak: number
  soundEnabled: boolean
  waypoint: WaypointInfo | null
  inWave: boolean
  waveCooldownRemaining: number
}

type Listener = (snap: GameStateSnapshot) => void
const listeners: Set<Listener> = new Set()

function notify() {
  const snap = getSnapshot()
  listeners.forEach((l) => l(snap))
}

// ── Persistent Missions ────────────────────────────────────────────────────
const MISSIONS_LIST: Mission[] = [
  {
    id: 'first_contact',
    title: 'First Contact',
    description: 'Fly to your first planetary station',
    target: 1,
    rewardPoints: 300,
    isCompleted: false,
  },
  {
    id: 'energy_harvester',
    title: 'Energy Harvester',
    description: 'Gather 5 energy orbs in flight',
    target: 5,
    rewardPoints: 400,
    isCompleted: false,
  },
  {
    id: 'hazard_survivor',
    title: 'Hazard Survivor',
    description: 'Evade asteroid waves and travel 200 AU safely',
    target: 200,
    rewardPoints: 500,
    isCompleted: false,
  },
  {
    id: 'deep_explorer',
    title: 'Deep Space Cartographer',
    description: 'Discover 4 different planetary sectors',
    target: 4,
    rewardPoints: 750,
    isCompleted: false,
  },
  {
    id: 'master_navigator',
    title: 'Grand System Tour',
    description: 'Discover all 9 portfolio destinations',
    target: 9,
    rewardPoints: 1500,
    isCompleted: false,
  },
]

// ── Mutable State ──────────────────────────────────────────────────────────
let gameStarted = false
let mode: GameMode = 'active'
let score = 0
let shield = 100
let boost = 100
let collectibles = 0
let shieldKits = 0
let distance = 0
let currentLevel = 1
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
let discoveryNotice: string | null = null
let discoveryNoticeTimer = 0
let missionCompleteNotice: string | null = null
let missionCompleteNoticeTimer = 0
let cleanStreak = 0

let threatAlert: ThreatAlert = {
  active: false,
  distance: 0,
  direction: 'CLEAR',
}

let activeMissionIndex = 0
const discoveredPlanetsSet = new Set<string>()

// Wave Manager State
let inWave = false
let waveCooldownRemaining = 8.0 // initial quiet period
let waveDurationRemaining = 0
let lastThreatBeepTime = 0

// Waypoint tracking
let currentWaypoint: WaypointInfo | null = null

// Restore saved progress from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const savedPlanets = localStorage.getItem('space_portfolio_discovered')
    if (savedPlanets) {
      JSON.parse(savedPlanets).forEach((id: string) => discoveredPlanetsSet.add(id))
    }
    const savedMissionIdx = localStorage.getItem('space_portfolio_mission_idx')
    if (savedMissionIdx) {
      activeMissionIndex = Math.min(MISSIONS_LIST.length - 1, parseInt(savedMissionIdx, 10) || 0)
    }
  } catch (err) {
    console.warn('Storage disabled:', err)
  }
}

// ── Public API ────────────────────────────────────────────────────────────

export function getSnapshot(): GameStateSnapshot {
  const tier = DIFFICULTY_CONFIG[currentLevel] || DIFFICULTY_CONFIG[1]
  const currentMission = MISSIONS_LIST[activeMissionIndex] || MISSIONS_LIST[MISSIONS_LIST.length - 1]

  let missionProg = 0
  if (currentMission.id === 'first_contact') missionProg = Math.min(1, discoveredPlanetsSet.size)
  else if (currentMission.id === 'energy_harvester') missionProg = collectibles
  else if (currentMission.id === 'hazard_survivor') missionProg = Math.floor(distance)
  else if (currentMission.id === 'deep_explorer') missionProg = discoveredPlanetsSet.size
  else if (currentMission.id === 'master_navigator') missionProg = discoveredPlanetsSet.size

  return {
    gameStarted,
    mode,
    score,
    shield,
    boost,
    collectibles,
    shieldKits,
    distance,
    difficultyTier: tier,
    paused,
    isCrashed,
    crashCountdown: Math.max(0, Math.ceil(crashCountdown)),
    isInvulnerable,
    damageFlash,
    damageNotice,
    collectNotice,
    discoveryNotice,
    missionCompleteNotice,
    threatAlert,
    activeMission: currentMission,
    missionProgress: missionProg,
    discoveredPlanets: Array.from(discoveredPlanetsSet),
    totalPlanets: destinations.length,
    cleanStreak,
    soundEnabled: isSoundEnabled(),
    waypoint: currentWaypoint,
    inWave,
    waveCooldownRemaining,
  }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function startGame() {
  gameStarted = true
  notify()
}

export function skipToPortfolio() {
  gameStarted = true
  mode = 'cruise'
  notify()
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

export function toggleAudio() {
  toggleSound()
  notify()
}

export function setAudio(enabled: boolean) {
  setSoundEnabled(enabled)
  notify()
}

export function restartGame() {
  score = 0
  shield = 100
  boost = 100
  collectibles = 0
  shieldKits = 0
  distance = 0
  currentLevel = 1
  cleanStreak = 0
  paused = false
  isCrashed = false
  crashCountdown = 5
  isInvulnerable = false
  invulnTimer = 0
  boostRechargeDelay = 0
  damageFlash = false
  damageNotice = null
  collectNotice = null
  discoveryNotice = null
  missionCompleteNotice = null
  threatAlert = { active: false, distance: 0, direction: 'CLEAR' }
  inWave = false
  waveCooldownRemaining = 10.0
  waveDurationRemaining = 0
  notify()
}

// ── Waypoint & Safe Zone Utilities ─────────────────────────────────────────

export function isInPlanetSafeZone(x: number, y: number, z: number): boolean {
  for (const d of destinations) {
    const dx = x - d.position[0]
    const dy = y - d.position[1]
    const dz = z - d.position[2]
    if (dx * dx + dy * dy + dz * dz < PLANET_SAFE_ZONE_RADIUS * PLANET_SAFE_ZONE_RADIUS) {
      return true
    }
  }
  return false
}

export function updateWaypoint(shipX: number, shipY: number, shipZ: number) {
  let nearestDest = destinations[0]
  let minDistSq = Infinity

  for (const d of destinations) {
    const dx = d.position[0] - shipX
    const dy = d.position[1] - shipY
    const dz = d.position[2] - shipZ
    const dSq = dx * dx + dy * dy + dz * dz
    if (dSq < minDistSq) {
      minDistSq = dSq
      nearestDest = d
    }
  }

  const dist = Math.sqrt(minDistSq)
  currentWaypoint = {
    id: nearestDest.id,
    name: nearestDest.name,
    subtitle: nearestDest.subtitle,
    distance: Math.round(dist),
    bearingAngle: 0,
  }
}

// ── Discovery & Missions ───────────────────────────────────────────────────

export function onPlanetArrival(id: string, name: string) {
  if (!discoveredPlanetsSet.has(id)) {
    discoveredPlanetsSet.add(id)
    score += 250
    cleanStreak++
    discoveryNotice = `🌟 DISCOVERED ${name}! +250 XP`
    discoveryNoticeTimer = 2.8
    playDiscoverySound()

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('space_portfolio_discovered', JSON.stringify(Array.from(discoveredPlanetsSet)))
      } catch (err) {
        console.warn('Storage disabled:', err)
      }
    }

    checkMissionProgress()
    notify()
  }
}

function checkMissionProgress() {
  const mission = MISSIONS_LIST[activeMissionIndex]
  if (!mission || mission.isCompleted) return

  let progress = 0
  if (mission.id === 'first_contact') progress = discoveredPlanetsSet.size
  else if (mission.id === 'energy_harvester') progress = collectibles
  else if (mission.id === 'hazard_survivor') progress = Math.floor(distance)
  else if (mission.id === 'deep_explorer') progress = discoveredPlanetsSet.size
  else if (mission.id === 'master_navigator') progress = discoveredPlanetsSet.size

  if (progress >= mission.target) {
    mission.isCompleted = true
    score += mission.rewardPoints
    missionCompleteNotice = `🏆 MISSION COMPLETE: ${mission.title}! +${mission.rewardPoints} PTS`
    missionCompleteNoticeTimer = 3.5
    playDiscoverySound()

    if (activeMissionIndex < MISSIONS_LIST.length - 1) {
      activeMissionIndex++
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('space_portfolio_mission_idx', String(activeMissionIndex))
        } catch (err) {
          console.warn('Storage disabled:', err)
        }
      }
    }
  }
}

// ── Frame Ticker (called inside useFrame) ───────────────────────────────────

export function tickGame(delta: number, speed: number, isBoosting: boolean) {
  if (paused || !gameStarted) return
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

  // Gradual difficulty tier calculation based on meaningful milestones
  const discoveredCount = discoveredPlanetsSet.size
  if (discoveredCount >= 7 || distance > 1200) currentLevel = 5
  else if (discoveredCount >= 5 || distance > 800) currentLevel = 4
  else if (discoveredCount >= 3 || distance > 450) currentLevel = 3
  else if (discoveredCount >= 1 || distance > 150) currentLevel = 2
  else currentLevel = 1

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

  // Wave Manager: Alternating between quiet periods and telegraphed hazard waves
  const tier = DIFFICULTY_CONFIG[currentLevel] || DIFFICULTY_CONFIG[1]

  if (mode === 'active') {
    if (!inWave) {
      waveCooldownRemaining -= dt
      if (waveCooldownRemaining <= 0) {
        // Trigger a new wave!
        inWave = true
        waveDurationRemaining = tier.waveDuration
        threatAlert = { active: false, distance: 0, direction: 'CLEAR' }
      }
    } else {
      waveDurationRemaining -= dt
      if (waveDurationRemaining <= 0) {
        // Wave complete! Enter quiet exploration period
        inWave = false
        const quietSpread = tier.quietPeriodMax - tier.quietPeriodMin
        waveCooldownRemaining = tier.quietPeriodMin + Math.random() * quietSpread
        threatAlert = { active: false, distance: 0, direction: 'CLEAR' }
        cleanStreak++
      }
    }
  } else {
    inWave = false
    threatAlert = { active: false, distance: 0, direction: 'CLEAR' }
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

  if (discoveryNotice) {
    discoveryNoticeTimer -= dt
    if (discoveryNoticeTimer <= 0) {
      discoveryNotice = null
    }
  }

  if (missionCompleteNotice) {
    missionCompleteNoticeTimer -= dt
    if (missionCompleteNoticeTimer <= 0) {
      missionCompleteNotice = null
    }
  }

  checkMissionProgress()
  notify()
}

// ── Impact & Damage ─────────────────────────────────────────────────────────

export function onAsteroidImpact(damage = 25) {
  if (paused || mode === 'cruise' || isInvulnerable || isCrashed) return

  cleanStreak = 0
  shield = Math.max(0, shield - damage)
  damageFlash = true
  damageNotice = `⚠️ HULL IMPACT! -${damage}% SHIELD`
  damageNoticeTimer = 1.4
  playImpactSound()

  if (shield <= 0) {
    triggerCrash()
  } else {
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
  playImpactSound()
  notify()
}

export function respawnShip(respawnPos?: [number, number, number]) {
  isCrashed = false
  crashCountdown = 5
  shield = 100
  boost = 100
  isInvulnerable = true
  invulnTimer = 3.5
  damageFlash = false
  damageNotice = '✅ SHIELD RESTORED · SYSTEMS ONLINE'
  damageNoticeTimer = 2.0
  inWave = false
  waveCooldownRemaining = 12.0 // generous quiet period after respawning
  notify()

  if (respawnCallback) {
    respawnCallback(respawnPos ?? [0, 0, 0])
  }
}

let respawnCallback: ((pos: [number, number, number]) => void) | null = null
export function registerRespawnHandler(fn: (pos: [number, number, number]) => void) {
  respawnCallback = fn
  return () => {
    if (respawnCallback === fn) respawnCallback = null
  }
}

// ── Collectibles ───────────────────────────────────────────────────────────

export function onCollectOrb() {
  if (paused || isCrashed) return
  collectibles++
  boost = Math.min(100, boost + 35)
  collectNotice = '+150 PTS · BOOST FUEL CHARGED ⚡'
  collectNoticeTimer = 1.6
  playOrbSound()
  checkMissionProgress()
  notify()
}

export function onCollectShieldKit() {
  if (paused || isCrashed) return
  shieldKits++
  shield = Math.min(100, shield + 35)
  collectNotice = '+200 PTS · SHIELD REPAIRED +35% 🛡️'
  collectNoticeTimer = 1.6
  playShieldKitSound()
  notify()
}

export function setThreatAlert(alert: ThreatAlert) {
  // Beep on newly approaching threat
  if (alert.active && !threatAlert.active) {
    const now = Date.now()
    if (now - lastThreatBeepTime > 3000) {
      lastThreatBeepTime = now
      playThreatBeep()
    }
  }
  threatAlert = alert
  notify()
}

export function canBoost(): boolean {
  return boost > 5 && !isCrashed
}

export function canFly(): boolean {
  return !isCrashed && !paused
}
