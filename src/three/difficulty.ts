// ---------------------------------------------------------------------------
// Centralized Difficulty Configuration
// Defines wave cooldowns, active hazard limits, approach speeds, and reaction distances.
// ---------------------------------------------------------------------------

export type DifficultyTier = {
  level: number
  name: string
  description: string
  /** Minimum quiet time between asteroid hazard waves (seconds) */
  quietPeriodMin: number
  /** Maximum quiet time between asteroid hazard waves (seconds) */
  quietPeriodMax: number
  /** Maximum number of collidable asteroids active in a single wave (1–3) */
  maxWaveHazards: number
  /** Wave duration before quiet period resumes (seconds) */
  waveDuration: number
  /** Asteroid approach speed (units/second) */
  speed: number
  /** Spawn distance ahead of the ship (units) */
  spawnDistance: number
  /** Warning reticle & alert trigger distance (units) */
  warningDistance: number
}

export const DIFFICULTY_CONFIG: Record<number, DifficultyTier> = {
  1: {
    level: 1,
    name: 'Cadet',
    description: 'Sparse hazards, slow asteroids, generous quiet periods',
    quietPeriodMin: 14,
    quietPeriodMax: 20,
    maxWaveHazards: 1,
    waveDuration: 6.0,
    speed: 16.0,
    spawnDistance: 110,
    warningDistance: 60,
  },
  2: {
    level: 2,
    name: 'Explorer',
    description: 'Occasional single/paired asteroids, balanced quiet travel',
    quietPeriodMin: 12,
    quietPeriodMax: 17,
    maxWaveHazards: 2,
    waveDuration: 7.0,
    speed: 19.0,
    spawnDistance: 120,
    warningDistance: 65,
  },
  3: {
    level: 3,
    name: 'Pilot',
    description: 'Moderate hazard waves crossing flight corridors',
    quietPeriodMin: 10,
    quietPeriodMax: 15,
    maxWaveHazards: 2,
    waveDuration: 7.5,
    speed: 23.0,
    spawnDistance: 125,
    warningDistance: 70,
  },
  4: {
    level: 4,
    name: 'Navigator',
    description: 'Faster asteroid groups requiring tactical boost evasion',
    quietPeriodMin: 9,
    quietPeriodMax: 14,
    maxWaveHazards: 3,
    waveDuration: 8.0,
    speed: 26.0,
    spawnDistance: 130,
    warningDistance: 75,
  },
  5: {
    level: 5,
    name: 'Elite',
    description: 'Challenging high-speed hazard waves with longer recovery periods',
    quietPeriodMin: 11,
    quietPeriodMax: 16,
    maxWaveHazards: 3,
    waveDuration: 8.5,
    speed: 30.0,
    spawnDistance: 140,
    warningDistance: 80,
  },
}

/** Safe zone radius around all destination planets (no hazards allowed here) */
export const PLANET_SAFE_ZONE_RADIUS = 42.0
