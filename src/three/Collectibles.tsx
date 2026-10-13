import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { onCollectOrb, onCollectShieldKit, getSnapshot } from './GameManager'

// ---------------------------------------------------------------------------
// Collectibles System — Energy Orbs & Shield Repair Kits
// Placed along flight paths and around planets for rewarding exploration.
// ---------------------------------------------------------------------------

type PickupType = 'orb' | 'shield'

type PickupSpec = {
  id: number
  type: PickupType
  basePos: THREE.Vector3
  collected: boolean
  respawnTimer: number
}

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
}

const COLLECT_DIST = 9.5
const _tmp = new THREE.Vector3()

export default function Collectibles({ spacecraftRef }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const ringRefs = useRef<(THREE.Mesh | null)[]>([])

  // Seeded pickups around planets & travel routes
  const specs = useMemo<PickupSpec[]>(() => {
    const list: PickupSpec[] = []
    let idCounter = 0

    // Coordinates near key planet corridors
    const locations: [number, number, number, PickupType][] = [
      // Corridor Base -> Projects
      [-55, 6, -5, 'orb'],
      [-25, 2, 25, 'shield'],
      // Corridor Projects -> About
      [60, -3, 75, 'orb'],
      [120, -5, 95, 'shield'],
      // Corridor About -> Education
      [195, 8, 230, 'orb'],
      [205, 15, 310, 'shield'],
      // Corridor Base -> Resume
      [-135, 11, 35, 'orb'],
      // Corridor Resume -> Skills
      [-205, 14, 210, 'orb'],
      [-230, 15, 255, 'shield'],
      // Near Skills
      [-240, 20, 320, 'orb'],
      // Corridor Skills -> Experience
      [-225, 2, 380, 'orb'],
      [-210, -6, 430, 'shield'],
      // Near Achievements
      [240, 12, 330, 'orb'],
      [260, 10, 230, 'shield'],
      // Near Contact
      [140, -6, -40, 'orb'],
      [155, -7, -80, 'shield'],
      // Free-floating discoveries
      [0, 15, 140, 'orb'],
      [70, 25, 180, 'orb'],
      [-90, -10, 210, 'shield'],
      [30, -15, 290, 'orb'],
    ]

    for (const [x, y, z, type] of locations) {
      list.push({
        id: idCounter++,
        type,
        basePos: new THREE.Vector3(x, y, z),
        collected: false,
        respawnTimer: 0,
      })
    }

    return list
  }, [])

  // Geometries
  const orbGeo = useMemo(() => new THREE.OctahedronGeometry(1.4, 0), [])
  const shieldGeo = useMemo(() => new THREE.DodecahedronGeometry(1.5, 0), [])
  const ringGeo = useMemo(() => new THREE.TorusGeometry(2.2, 0.1, 8, 24), [])

  // Materials
  const orbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#00ddff',
        emissive: '#0099ff',
        emissiveIntensity: 1.8,
        metalness: 0.2,
        roughness: 0.1,
      }),
    [],
  )

  const shieldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#10b981',
        emissive: '#059669',
        emissiveIntensity: 1.8,
        metalness: 0.2,
        roughness: 0.1,
      }),
    [],
  )

  const orbRingMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#38bdf8',
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    [],
  )

  const shieldRingMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#34d399',
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.08)
    const t = state.clock.elapsedTime
    const snap = getSnapshot()
    if (snap.paused) return

    const ship = spacecraftRef.current

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i]
      const mesh = meshRefs.current[i]
      const ring = ringRefs.current[i]

      // Respawn timer
      if (spec.collected) {
        spec.respawnTimer -= dt
        if (spec.respawnTimer <= 0) {
          spec.collected = false
        }
        if (mesh) mesh.visible = false
        if (ring) ring.visible = false
        continue
      }

      if (!mesh || !ring) continue

      // Bobbing floating animation
      const floatY = spec.basePos.y + Math.sin(t * 2.2 + i * 0.7) * 1.5
      _tmp.set(spec.basePos.x, floatY, spec.basePos.z)

      mesh.position.copy(_tmp)
      ring.position.copy(_tmp)

      mesh.rotation.y = t * 1.8 + i
      mesh.rotation.x = Math.sin(t * 1.2 + i) * 0.4
      ring.rotation.x = Math.PI / 2 + Math.sin(t * 1.5 + i) * 0.3
      ring.rotation.z = t * 1.2 + i

      mesh.visible = true
      ring.visible = true

      // Pickup Collision with Spaceship
      if (ship && !snap.isCrashed) {
        const dist = ship.position.distanceTo(_tmp)
        if (dist < COLLECT_DIST) {
          spec.collected = true
          spec.respawnTimer = 22.0 // respawns in 22s

          if (spec.type === 'orb') {
            onCollectOrb()
          } else {
            onCollectShieldKit()
          }
        }
      }
    }
  })

  return (
    <group>
      {specs.map((spec, i) => (
        <group key={spec.id}>
          <mesh
            ref={(el) => {
              meshRefs.current[i] = el
            }}
            geometry={spec.type === 'orb' ? orbGeo : shieldGeo}
            material={spec.type === 'orb' ? orbMat : shieldMat}
          />
          <mesh
            ref={(el) => {
              ringRefs.current[i] = el
            }}
            geometry={ringGeo}
            material={spec.type === 'orb' ? orbRingMat : shieldRingMat}
          />
        </group>
      ))}
    </group>
  )
}
