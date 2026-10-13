import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { MutableRefObject } from 'react'
import { onCollect, getSnapshot } from './GameManager'
import type { GameMode } from './GameManager'

// ---------------------------------------------------------------------------
// Collectible energy orbs — glowing, pulsing, floating in space
// ---------------------------------------------------------------------------

const COLLECT_DISTANCE = 8   // units from ship center to collect
const ORB_COUNT = 18

type OrbSpec = {
  id: number
  basePos: THREE.Vector3
  collected: boolean
  respawnTimer: number
}

type Props = {
  spacecraftRef: MutableRefObject<THREE.Group | null>
  mode: GameMode
}

const _tmp = new THREE.Vector3()

export default function Collectibles({ spacecraftRef, mode }: Props) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([])
  const glowRefs = useRef<(THREE.Mesh | null)[]>([])

  const specs = useMemo<OrbSpec[]>(() => {
    const rng = (seed: number) => {
      const v = Math.sin(seed * 127.1 + 311.7) * 43758.5453
      return v - Math.floor(v)
    }
    const out: OrbSpec[] = []
    for (let i = 0; i < ORB_COUNT; i++) {
      const angle = rng(i * 3) * Math.PI * 2
      const dist = 40 + rng(i * 3 + 1) * 420
      const height = (rng(i * 3 + 2) - 0.5) * 70
      out.push({
        id: i,
        basePos: new THREE.Vector3(
          Math.cos(angle) * dist,
          height,
          Math.sin(angle) * dist,
        ),
        collected: false,
        respawnTimer: 0,
      })
    }
    return out
  }, [])

  // Shared geometries
  const coreGeo = useMemo(() => new THREE.SphereGeometry(1.2, 12, 12), [])
  const glowGeo = useMemo(() => new THREE.SphereGeometry(2.5, 12, 12), [])

  useFrame((state, delta) => {
    if (mode !== 'game') return
    const dt = Math.min(delta, 0.08)
    const t = state.clock.elapsedTime
    const snap = getSnapshot()
    if (snap.paused) return

    const ship = spacecraftRef.current

    for (let i = 0; i < specs.length; i++) {
      const spec = specs[i]
      const mesh = meshRefs.current[i]
      const glow = glowRefs.current[i]

      // Respawn countdown
      if (spec.collected) {
        spec.respawnTimer -= dt
        if (spec.respawnTimer <= 0) {
          spec.collected = false
          // Teleport to a new random nearby position
          const angle = t * 0.5 + i * 0.4
          const dist = 60 + (i % 6) * 50
          spec.basePos.set(
            Math.cos(angle) * dist + (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 60,
            Math.sin(angle) * dist + (Math.random() - 0.5) * 40,
          )
        }
        if (mesh) mesh.visible = false
        if (glow) glow.visible = false
        continue
      }

      if (!mesh || !glow) continue

      // Float and pulse animation
      const floatY = spec.basePos.y + Math.sin(t * 1.4 + i * 0.9) * 2.5
      const worldPos = _tmp.set(spec.basePos.x, floatY, spec.basePos.z)

      mesh.position.copy(worldPos)
      glow.position.copy(worldPos)
      mesh.rotation.y = t * 0.8 + i
      mesh.rotation.z = Math.sin(t * 0.5 + i) * 0.3
      mesh.visible = true

      // Pulse glow
      const pulse = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.2)
      const glowMat = glow.material as THREE.MeshBasicMaterial
      glowMat.opacity = 0.08 + pulse * 0.12
      glow.visible = true
      glow.scale.setScalar(0.9 + pulse * 0.25)

      // Collection check
      if (ship) {
        const dist = ship.position.distanceTo(worldPos)
        if (dist < COLLECT_DISTANCE) {
          spec.collected = true
          spec.respawnTimer = 20 + Math.random() * 15  // respawn in 20–35s
          mesh.visible = false
          glow.visible = false
          onCollect()
        }
      }
    }
  })

  return (
    <group>
      {specs.map((spec, i) => (
        <group key={spec.id}>
          {/* Core orb */}
          <mesh ref={(el) => { meshRefs.current[i] = el }} visible={false}>
            <primitive object={coreGeo} attach="geometry" />
            <meshStandardMaterial
              color="#00eeff"
              emissive="#00ccff"
              emissiveIntensity={1.6}
              metalness={0.1}
              roughness={0.1}
            />
          </mesh>
          {/* Outer glow shell */}
          <mesh ref={(el) => { glowRefs.current[i] = el }} visible={false}>
            <primitive object={glowGeo} attach="geometry" />
            <meshBasicMaterial
              color="#00ddff"
              transparent
              opacity={0.12}
              side={THREE.BackSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
