import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Shooting Stars / Comets System
// Adds atmospheric life to the deep space background with periodic luminous
// comets streaking across the sky, leaving fading stardust tails.
// ---------------------------------------------------------------------------

type ShootingStar = {
  active: boolean
  startPos: THREE.Vector3
  currentPos: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  length: number
}

const STAR_COUNT = 4

export default function ShootingStars() {
  const lineRefs = useRef<(THREE.Line | null)[]>([])

  const stars = useMemo<ShootingStar[]>(() => {
    return Array.from({ length: STAR_COUNT }, () => ({
      active: false,
      startPos: new THREE.Vector3(),
      currentPos: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      life: 0,
      maxLife: 1.5,
      length: 50,
    }))
  }, [])

  const lineGeos = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, () => {
      const geo = new THREE.BufferGeometry()
      const pos = new Float32Array([0, 0, 0, 0, 0, 0])
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      return geo
    })
  }, [])

  const lineMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: '#e0f2fe',
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      }),
    [],
  )

  const spawnStar = (star: ShootingStar) => {
    // Spawn high in the sky dome
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI * 0.4 + 0.1
    const radius = 600 + Math.random() * 400

    star.startPos.set(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi) + 100,
      radius * Math.sin(phi) * Math.sin(theta),
    )
    star.currentPos.copy(star.startPos)

    // Streak direction downwards across sky
    const dir = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      -0.8 - Math.random() * 0.5,
      (Math.random() - 0.5) * 1.5,
    ).normalize()

    const speed = 450 + Math.random() * 250
    star.velocity.copy(dir).multiplyScalar(speed)
    star.maxLife = 1.0 + Math.random() * 0.8
    star.life = star.maxLife
    star.length = 40 + Math.random() * 30
    star.active = true
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)

    for (let i = 0; i < STAR_COUNT; i++) {
      const star = stars[i]
      const line = lineRefs.current[i]
      if (!line) continue

      if (!star.active) {
        // Random chance to trigger shooting star
        if (Math.random() < 0.015) {
          spawnStar(star)
        }
        line.visible = false
        continue
      }

      star.life -= dt
      if (star.life <= 0) {
        star.active = false
        line.visible = false
        continue
      }

      // Advance star position
      star.currentPos.addScaledVector(star.velocity, dt)

      // Compute tail end
      const tailDir = star.velocity.clone().normalize().negate()
      const tailPos = star.currentPos.clone().addScaledVector(tailDir, star.length)

      const posAttr = lineGeos[i].attributes.position as THREE.BufferAttribute
      const arr = posAttr.array as Float32Array
      arr[0] = star.currentPos.x
      arr[1] = star.currentPos.y
      arr[2] = star.currentPos.z
      arr[3] = tailPos.x
      arr[4] = tailPos.y
      arr[5] = tailPos.z
      posAttr.needsUpdate = true

      line.visible = true
    }
  })

  return (
    <group>
      {stars.map((_, i) => (
        <primitive
          key={i}
          object={
            new THREE.Line(
              lineGeos[i],
              lineMat,
            )
          }
          ref={(el: THREE.Line | null) => {
            lineRefs.current[i] = el
          }}
          visible={false}
        />
      ))}
    </group>
  )
}
