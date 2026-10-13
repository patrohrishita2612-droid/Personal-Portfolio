import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { onImpact, getSnapshot } from './GameManager'
import type { GameMode } from './GameManager'

// ---------------------------------------------------------------------------
// Moving Asteroids — procedurally spawned, collision-detected, game-reactive
// ---------------------------------------------------------------------------

const ASTEROID_RADIUS = 2.8  // collision sphere radius per asteroid (world units, pre-scale)

type AsteroidSpec = {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotAxis: THREE.Vector3
  rotSpeed: number
  scale: number
  color: string
}

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
  mode: GameMode
  onShake: () => void
}

// Scratch vectors (module-level to avoid per-frame allocations)
const _tmp = new THREE.Vector3()

export default function Asteroids({ spacecraftRef, mode, onShake }: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const lastImpactTime = useRef(0)

  // Create geometry + material once — shared across all asteroid instances
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(1, 1)
    const pos = g.getAttribute('position')
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
      const n = (Math.sin(x * 4.3 + y * 3.1) + Math.cos(z * 3.7)) * 0.25
      pos.setXYZ(i, x * (1 + n), y * (1 + n), z * (1 + n))
    }
    g.computeVertexNormals()
    return g
  }, [])

  // Deterministic asteroid specs seeded from index
  const specs = useMemo<AsteroidSpec[]>(() => {
    const out: AsteroidSpec[] = []
    const colors = ['#4a5568', '#5a6585', '#3d4a5c', '#6b5c4a', '#4a3f5c', '#3a5048']
    const rng = (seed: number) => {
      const v = Math.sin(seed) * 43758.5453
      return v - Math.floor(v)
    }

    for (let i = 0; i < 40; i++) {
      const r = (s: number) => rng(i * 100 + s)
      // Scatter around the play space, avoiding center (ship starts at 0,0,0)
      const angle = r(1) * Math.PI * 2
      const dist = 80 + r(2) * 350   // 80–430 units from origin
      const height = (r(3) - 0.5) * 80

      const vSpeed = (1 + r(7) * 2) * (i < 20 ? 1 : -1) * 0.5

      out.push({
        id: i,
        position: new THREE.Vector3(
          Math.cos(angle) * dist,
          height,
          Math.sin(angle) * dist,
        ),
        velocity: new THREE.Vector3(
          (r(4) - 0.5) * 3,
          (r(5) - 0.5) * 1.5,
          (r(6) - 0.5) * 3 + vSpeed,
        ),
        rotAxis: new THREE.Vector3(r(8) - 0.5, r(9) - 0.5, r(10) - 0.5).normalize(),
        rotSpeed: 0.3 + r(11) * 1.2,
        scale: 1.2 + r(12) * 2.8,
        color: colors[Math.floor(r(13) * colors.length)],
      })
    }
    return out
  }, [])

  // Difficulty scaling — more and faster asteroids
  const getActiveCount = (diff: number) => Math.min(specs.length, 8 + diff * 5)

  useFrame((state, delta) => {
    if (mode !== 'game') return
    const dt = Math.min(delta, 0.08)
    const t = state.clock.elapsedTime
    const snap = getSnapshot()
    if (snap.paused) return

    const ship = spacecraftRef.current
    const activeCount = getActiveCount(snap.difficulty)
    const speedScale = 0.8 + snap.difficulty * 0.25

    for (let i = 0; i < activeCount; i++) {
      const spec = specs[i]
      const mesh = meshRefs.current[i]
      if (!mesh) continue

      // Move asteroid
      spec.position.addScaledVector(spec.velocity, dt * speedScale)
      mesh.position.copy(spec.position)

      // Rotate
      mesh.rotateOnWorldAxis(spec.rotAxis, spec.rotSpeed * dt)

      // Wrap position if too far from origin (keeps asteroids in the play area)
      if (spec.position.length() > 500) {
        const angle = t * 0.03 + i * 0.5
        const dist = 120 + (i % 5) * 60
        spec.position.set(
          Math.cos(angle) * dist + (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 60,
          Math.sin(angle) * dist + (Math.random() - 0.5) * 30,
        )
        spec.velocity.set(
          (Math.random() - 0.5) * 3,
          (Math.random() - 0.5) * 1.5,
          (Math.random() - 0.5) * 3,
        )
      }

      // Collision detection
      if (ship && !snap.invulnerable) {
        _tmp.copy(ship.position).sub(spec.position)
        const dist = _tmp.length()
        const collisionDist = ASTEROID_RADIUS * spec.scale * 0.55 + 3.0 // 3.0 = ship half-size
        if (dist < collisionDist && t - lastImpactTime.current > 0.5) {
          lastImpactTime.current = t
          onImpact()
          onShake()
          // Push ship away slightly
          ship.position.addScaledVector(_tmp.normalize(), 4)
        }
      }
    }
  })

  return (
    <group ref={groupRef}>
      {specs.map((spec, i) => (
        <mesh
          key={spec.id}
          ref={(el) => { meshRefs.current[i] = el }}
          position={spec.position}
          scale={spec.scale}
          visible={mode === 'game'}
          castShadow
        >
          <primitive object={geo} attach="geometry" />
          <meshStandardMaterial
            color={spec.color}
            roughness={0.88}
            metalness={0.12}
            flatShading
          />
        </mesh>
      ))}
    </group>
  )
}
