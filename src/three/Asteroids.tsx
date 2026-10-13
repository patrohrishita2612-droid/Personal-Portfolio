import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { onAsteroidImpact, getSnapshot, setThreatAlert, isInPlanetSafeZone } from './GameManager'

// ---------------------------------------------------------------------------
// Wave-Based Asteroid Hazard System
// Danger is intermittent, telegraphed, and fair.
// Quiet periods (8–18s) allow relaxed exploration, followed by focused,
// avoidable hazard encounters (1–3 asteroids). Safe zones protect all planets.
// ---------------------------------------------------------------------------

type WaveAsteroid = {
  id: number
  active: boolean
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotAxis: THREE.Vector3
  rotSpeed: number
  scale: number
  radius: number
}

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
  onShake: () => void
}

const MAX_WAVE_HAZARDS = 3
const _shipPos = new THREE.Vector3()
const _diff = new THREE.Vector3()
const _fwd = new THREE.Vector3()
const _toAsteroid = new THREE.Vector3()

export default function Asteroids({ spacecraftRef, onShake }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const warningRingRef = useRef<THREE.Mesh>(null)

  // Cratered Asteroid Geometry
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 2)
    const pos = g.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const noise =
        Math.sin(x * 3.6 + y * 2.4) * 0.24 +
        Math.cos(z * 3.2 + x * 1.6) * 0.18 +
        Math.sin(y * 4.8 + z * 3.8) * 0.1
      pos.setXYZ(i, x * (1 + noise), y * (1 + noise), z * (1 + noise))
    }
    g.computeVertexNormals()
    return g
  }, [])

  // Cartoon Faceted Stone Materials
  const materials = useMemo(() => {
    const tones = ['#9a6245', '#7c533c', '#a87858', '#4b5563', '#d97706']
    return tones.map(
      (c) =>
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(c),
          roughness: 0.75,
          metalness: 0.15,
          flatShading: true,
          emissive: new THREE.Color(c).multiplyScalar(0.12),
        }),
    )
  }, [])

  // Pre-allocated wave hazards pool
  const waveHazards = useMemo<WaveAsteroid[]>(() => {
    return Array.from({ length: MAX_WAVE_HAZARDS }, (_, i) => ({
      id: i,
      active: false,
      position: new THREE.Vector3(0, -9999, 0),
      velocity: new THREE.Vector3(),
      rotAxis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize(),
      rotSpeed: 0.6 + Math.random() * 0.8,
      scale: 2.8 + Math.random() * 2.4,
      radius: 2.5,
    }))
  }, [])

  // Spawns a single wave hazard ahead of the ship
  const spawnHazard = (hazard: WaveAsteroid, ship: THREE.Group, speed: number, spawnDist: number) => {
    _shipPos.copy(ship.position)
    _fwd.set(0, 0, 1).applyQuaternion(ship.quaternion)

    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(ship.quaternion)
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(ship.quaternion)

    // Spawn ahead with offset so it's avoidable by steering or boosting
    const lateralOffset = (Math.random() - 0.5) * 36
    const verticalOffset = (Math.random() - 0.5) * 18

    hazard.position
      .copy(_shipPos)
      .addScaledVector(_fwd, spawnDist + (Math.random() - 0.5) * 20)
      .addScaledVector(right, lateralOffset)
      .addScaledVector(up, verticalOffset)

    // Ensure it doesn't spawn inside a planet safe zone
    if (isInPlanetSafeZone(hazard.position.x, hazard.position.y, hazard.position.z)) {
      hazard.active = false
      return
    }

    // Trajectory crosses or gently vectors toward where the player was
    const target = _shipPos.clone().addScaledVector(_fwd, (Math.random() - 0.4) * 25)
    const trajectory = target.sub(hazard.position).normalize()

    hazard.velocity.copy(trajectory).multiplyScalar(speed)
    hazard.scale = 2.8 + Math.random() * 2.5
    hazard.radius = hazard.scale * 0.82
    hazard.active = true
  }

  // Handle wave transitions
  const lastWaveState = useRef(false)
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      waveHazards.forEach((h) => {
        h.active = false
      })
    }
  }, [waveHazards])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.08)
    const snap = getSnapshot()
    if (snap.paused || !snap.gameStarted) return

    const ship = spacecraftRef.current
    if (!ship) return

    _shipPos.copy(ship.position)
    _fwd.set(0, 0, 1).applyQuaternion(ship.quaternion)

    const tier = snap.difficultyTier
    const waveTriggered = snap.inWave && !lastWaveState.current
    lastWaveState.current = snap.inWave

    // If a new wave just started, spawn the hazards!
    if (waveTriggered && snap.mode === 'active' && !snap.isCrashed) {
      // Don't spawn if the player is currently safe at a planet!
      if (!isInPlanetSafeZone(_shipPos.x, _shipPos.y, _shipPos.z)) {
        const count = Math.min(tier.maxWaveHazards, waveHazards.length)
        for (let i = 0; i < count; i++) {
          spawnHazard(waveHazards[i], ship, tier.speed, tier.spawnDistance)
        }
      }
    }

    // If wave ended, deactivate remaining hazards
    if (!snap.inWave) {
      waveHazards.forEach((h) => {
        h.active = false
      })
    }

    let closestThreatDist = 9999
    let threatIdx: number | null = null

    // Update active wave hazards
    for (let i = 0; i < waveHazards.length; i++) {
      const hazard = waveHazards[i]
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      if (hazard.active && snap.inWave && snap.mode === 'active' && !snap.isCrashed) {
        // Move hazard
        hazard.position.addScaledVector(hazard.velocity, dt)
        mesh.rotateOnWorldAxis(hazard.rotAxis, hazard.rotSpeed * dt)

        // Dissolve if entering a planet safe zone
        if (isInPlanetSafeZone(hazard.position.x, hazard.position.y, hazard.position.z)) {
          hazard.active = false
          mesh.visible = false
          continue
        }

        _diff.copy(hazard.position).sub(_shipPos)
        const dist = _diff.length()
        const forwardDot = _diff.dot(_fwd)

        // Deactivate if it flew far past the player
        if (forwardDot < -35 || dist > 260) {
          hazard.active = false
          mesh.visible = false
          continue
        }

        // Threat Proximity Detection
        const isApproaching = hazard.velocity.dot(_diff) < 0
        if (dist < tier.warningDistance && isApproaching && dist < closestThreatDist) {
          closestThreatDist = dist
          threatIdx = i
        }

        // Collision Check
        const hitDistance = hazard.radius + 2.8
        if (dist < hitDistance && !snap.isInvulnerable) {
          onAsteroidImpact(25)
          onShake()

          // Knockback impulse
          _toAsteroid.copy(_shipPos).sub(hazard.position).normalize()
          ship.position.addScaledVector(_toAsteroid, 4.5)

          // Deactivate hazard after impact
          hazard.active = false
          mesh.visible = false
          continue
        }

        mesh.position.copy(hazard.position)
        mesh.scale.setScalar(hazard.scale)
        mesh.visible = true
      } else {
        mesh.visible = false
      }
    }

    // Threat Alert & Warning Reticle
    if (threatIdx !== null && snap.inWave && snap.mode === 'active') {
      setThreatAlert({
        active: true,
        distance: Math.round(closestThreatDist),
        direction: closestThreatDist < 30 ? 'CRITICAL IMMINENT' : 'INCOMING AHEAD',
      })

      const threatMesh = meshRefs.current[threatIdx]
      if (warningRingRef.current && threatMesh && threatMesh.visible) {
        warningRingRef.current.position.copy(threatMesh.position)
        warningRingRef.current.scale.setScalar(threatMesh.scale.x * 1.5)
        warningRingRef.current.visible = true
      }
    } else {
      if (snap.threatAlert.active) {
        setThreatAlert({ active: false, distance: 0, direction: 'CLEAR' })
      }
      if (warningRingRef.current) warningRingRef.current.visible = false
    }
  })

  return (
    <group>
      {waveHazards.map((hazard, i) => (
        <mesh
          key={hazard.id}
          ref={(el) => {
            meshRefs.current[i] = el
          }}
          geometry={geo}
          material={materials[i % materials.length]}
          visible={false}
          castShadow
          receiveShadow
        />
      ))}

      {/* 3D Pulsing Red Threat Reticle around incoming threat */}
      <mesh ref={warningRingRef} visible={false}>
        <ringGeometry args={[1.1, 1.35, 24]} />
        <meshBasicMaterial
          color="#ff3344"
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}
